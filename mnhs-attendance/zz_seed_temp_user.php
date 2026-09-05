<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$action = $argv[1] ?? 'create';

try {
    if ($action === 'create') {
        $user = \App\Models\User::firstOrCreate(
            ['email' => 'ui-verify-temp@example.test'],
            [
                'name' => 'UI Verify Temp',
                'role' => 'super_admin',
                'password' => bcrypt('TempPass123!'),
                'email_verified_at' => now(),
                'is_active' => true,
            ],
        );
        if ($user->wasRecentlyCreated) {
            echo 'created '.$user->id."\n";
        } else {
            echo 'exists '.$user->id."\n";
        }
    } elseif ($action === 'delete') {
        $deleted = \App\Models\User::where('email', 'ui-verify-temp@example.test')->delete();
        echo 'deleted '.$deleted."\n";
    }
} catch (Throwable $e) {
    echo 'ERROR: '.$e->getMessage()."\n";
}
