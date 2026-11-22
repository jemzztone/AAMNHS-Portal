<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (file_exists($maintenance = __DIR__ . '/../mnhs-attendance/storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__ . '/../mnhs-attendance/vendor/autoload.php';

$app = require_once __DIR__ . '/../mnhs-attendance/bootstrap/app.php';

$request = Request::capture();

$secret = $request->header('X-Queue-Secret');
if ($secret !== $_ENV['QUEUE_WORKER_SECRET'] ?? $_SERVER['QUEUE_WORKER_SECRET'] ?? '') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$maxJobs = (int) ($request->input('max_jobs', 100));
$maxTime = (int) ($request->input('max_time', 55));
$queue = $request->input('queue', 'default');

$exitCode = \Illuminate\Support\Facades\Artisan::call('queue:work', [
    '--stop-when-empty' => true,
    '--max-jobs' => $maxJobs,
    '--max-time' => $maxTime,
    '--queue' => $queue,
]);

http_response_code(200);
echo json_encode([
    'exit_code' => $exitCode,
    'max_jobs' => $maxJobs,
    'max_time' => $maxTime,
    'queue' => $queue,
]);