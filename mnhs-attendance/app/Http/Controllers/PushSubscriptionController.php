<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use App\Services\WebPushService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PushSubscriptionController extends Controller
{
    public function publicKey(WebPushService $webPush): JsonResponse
    {
        return response()->json([
            'publicKey' => $webPush->publicKey(),
            'enabled' => $webPush->isConfigured(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'endpoint' => 'required|string|max:2000',
            'keys.p256dh' => 'required|string',
            'keys.auth' => 'required|string',
            'contentEncoding' => 'nullable|string|in:aesgcm,aes128gcm',
        ]);

        PushSubscription::updateOrCreate(
            ['endpoint' => $data['endpoint']],
            [
                'user_id' => $request->user()->id,
                'public_key' => $data['keys']['p256dh'],
                'auth_token' => $data['keys']['auth'],
                'content_encoding' => $data['contentEncoding'] ?? 'aes128gcm',
                'user_agent' => substr((string) $request->userAgent(), 0, 255),
            ],
        );

        return response()->json(['subscribed' => true]);
    }

    public function test(Request $request, WebPushService $webPush): JsonResponse
    {
        if (! $webPush->isConfigured()) {
            return response()->json([
                'message' => 'Push notifications are not configured on the server yet.',
            ], 422);
        }

        if (! $request->user()->pushSubscriptions()->exists()) {
            return response()->json([
                'message' => 'This account has no subscribed device yet. Enable notifications first.',
            ], 422);
        }

        try {
            $delivered = $webPush->sendToUser($request->user(), [
                'title' => 'AAMNHS test notification',
                'body' => 'Push notifications are working on this device.',
                'url' => '/profile',
                'tag' => 'aamnhs-test',
            ]);
        } catch (\Throwable $e) {
            Log::error('Web push test failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'The test notification could not be sent. Please try again or contact the administrator.',
            ], 422);
        }

        if ($delivered === 0) {
            return response()->json([
                'message' => 'The test could not be delivered. Disable and re-enable notifications on this device.',
            ], 422);
        }

        return response()->json([
            'delivered' => $delivered,
            'message' => "Test notification sent to {$delivered} device(s).",
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $data = $request->validate([
            'endpoint' => 'required|string|max:2000',
        ]);

        PushSubscription::where('user_id', $request->user()->id)
            ->where('endpoint', $data['endpoint'])
            ->delete();

        return response()->json(['subscribed' => false]);
    }
}
