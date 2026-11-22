<?php

// Uploads must survive a redeploy, and Render's free plan has no persistent
// disk. When Supabase storage credentials are present, the public (student
// photos) and private (admission slip attachments) disks are backed by S3 so
// files outlive the container; otherwise they fall back to local storage.
$supabaseKey = env('SUPABASE_STORAGE_KEY');
$supabaseSecret = env('SUPABASE_STORAGE_SECRET');
$supabaseUrl = env('SUPABASE_STORAGE_URL');
$useSupabase = $supabaseKey && $supabaseSecret && $supabaseUrl;

return [

    /*
    |--------------------------------------------------------------------------
    | Default Filesystem Disk
    |--------------------------------------------------------------------------
    |
    | Here you may specify the default filesystem disk that should be used
    | by the framework. The "local" disk, as well as a variety of cloud
    | based disks are available to your application for file storage.
    |
    */

    'default' => env('FILESYSTEM_DISK', 'local'),

    /*
    |--------------------------------------------------------------------------
    | Filesystem Disks
    |--------------------------------------------------------------------------
    |
    | Below you may configure as many filesystem disks as necessary, and you
    | may even configure multiple disks for the same driver. Examples for
    | most supported storage drivers are configured here for reference.
    |
    | Supported drivers: "local", "ftp", "sftp", "s3"
    |
    */

    'disks' => [

        'local' => [
            'driver' => 'local',
            'root' => storage_path('app/private'),
            'serve' => true,
            'throw' => false,
            'report' => false,
        ],

        // Admission slip attachments. Referenced by `Storage::disk('private')`,
        // so it must exist even when the default disk is a remote one.
        'private' => $useSupabase ? [
            'driver' => 's3',
            'key' => $supabaseKey,
            'secret' => $supabaseSecret,
            'region' => env('AWS_DEFAULT_REGION', 'auto'),
            'bucket' => env('SUPABASE_STORAGE_BUCKET', 'aamnhs-files'),
            'endpoint' => $supabaseUrl,
            'use_path_style_endpoint' => true,
            'visibility' => 'private',
            'throw' => false,
            'report' => false,
        ] : [
            'driver' => 'local',
            'root' => storage_path('app/private'),
            'serve' => false,
            'throw' => false,
            'report' => false,
        ],

        'public' => $useSupabase ? [
            'driver' => 's3',
            'key' => $supabaseKey,
            'secret' => $supabaseSecret,
            'region' => env('AWS_DEFAULT_REGION', 'auto'),
            'bucket' => env('SUPABASE_STORAGE_BUCKET', 'aamnhs-files'),
            'url' => $supabaseUrl,
            'endpoint' => $supabaseUrl,
            'use_path_style_endpoint' => true,
            // Photos are streamed through an authenticated controller, so no
            // public object ACL is needed.
            'visibility' => 'private',
            'throw' => false,
            'report' => false,
        ] : [
            'driver' => 'local',
            'root' => storage_path('app/public'),
            'url' => rtrim(env('APP_URL', 'http://localhost'), '/').'/storage',
            'visibility' => 'public',
            'throw' => false,
            'report' => false,
        ],

        's3' => [
            'driver' => 's3',
            'key' => env('AWS_ACCESS_KEY_ID'),
            'secret' => env('AWS_SECRET_ACCESS_KEY'),
            'region' => env('AWS_DEFAULT_REGION'),
            'bucket' => env('AWS_BUCKET'),
            'url' => env('AWS_URL'),
            'endpoint' => env('AWS_ENDPOINT'),
            'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
            'throw' => false,
            'report' => false,
        ],

        'supabase' => [
            'driver' => 's3',
            'key' => env('SUPABASE_STORAGE_KEY'),
            'secret' => env('SUPABASE_STORAGE_SECRET'),
            'region' => env('AWS_DEFAULT_REGION', 'auto'),
            'bucket' => env('SUPABASE_STORAGE_BUCKET'),
            'url' => env('SUPABASE_STORAGE_URL'),
            'endpoint' => env('SUPABASE_STORAGE_URL'),
            'use_path_style_endpoint' => true,
            'throw' => false,
            'report' => false,
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Symbolic Links
    |--------------------------------------------------------------------------
    |
    | Here you may configure the symbolic links that will be created when the
    | `storage:link` Artisan command is executed. The array keys should be
    | the locations of the links and the values should be their targets.
    |
    */

    'links' => [
        public_path('storage') => storage_path('app/public'),
    ],

];
