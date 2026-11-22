<?php

namespace App\Http\Controllers;

use App\Models\GuardianNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GuardianNotificationController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', GuardianNotification::class);

        $query = GuardianNotification::with(['student', 'attendanceRecord'])
            ->when($request->status, fn ($q, $status) => $q->where('status', $status));

        $notifications = $query->latest()->paginate(min(max((int) $request->get('per_page', 5), 1), 100));

        $counts = GuardianNotification::query()
            ->select('status')
            ->selectRaw('count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $mailer = (string) config('mail.default');

        return Inertia::render('GuardianNotifications/Index', [
            'notifications' => $notifications,
            'filters' => $request->only(['status']),
            'stats' => [
                'pending' => (int) ($counts['pending'] ?? 0),
                'sent' => (int) ($counts['sent'] ?? 0),
                'failed' => (int) ($counts['failed'] ?? 0),
                'total' => (int) $counts->sum(),
            ],
            'mail' => [
                'mailer' => $mailer,
                'configured' => $mailer !== 'log',
                'from' => (string) config('mail.from.address'),
            ],
        ]);
    }

    public function show(GuardianNotification $guardianNotification)
    {
        $this->authorize('view', $guardianNotification);

        $guardianNotification->load(['student.section', 'attendanceRecord']);

        return Inertia::render('GuardianNotifications/Show', [
            'notification' => $guardianNotification,
        ]);
    }
}
