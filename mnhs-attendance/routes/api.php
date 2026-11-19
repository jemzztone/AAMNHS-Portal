<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Queue worker endpoint for Vercel Cron
Route::post('/queue/work', function () {
    $secret = request()->header('X-Queue-Secret');
    if ($secret !== env('QUEUE_WORKER_SECRET')) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    $maxJobs = (int) request()->input('max_jobs', 100);
    $maxTime = (int) request()->input('max_time', 55);

    $exitCode = Artisan::call('queue:work', [
        '--stop-when-empty' => true,
        '--max-jobs' => $maxJobs,
        '--max-time' => $maxTime,
        '--queue' => request()->input('queue', 'default'),
    ]);

    return response()->json([
        'exit_code' => $exitCode,
        'max_jobs' => $maxJobs,
        'max_time' => $maxTime,
    ]);
});
