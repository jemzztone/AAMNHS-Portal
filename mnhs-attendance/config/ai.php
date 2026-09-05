<?php

return [

    /*
    |--------------------------------------------------------------------------
    | AI Provider
    |--------------------------------------------------------------------------
    |
    | Provider used by the Admin AI assistant. The API key is read from the
    | environment and never exposed to the frontend.
    |
    | Supported: "gemini", "openrouter"
    |
    */

    'provider' => env('AI_PROVIDER', 'openrouter'),

    'gemini' => [
        'api_key' => env('GOOGLE_API_KEY'),
        'model' => env('GEMINI_MODEL', 'gemini-2.5-flash'),
    ],

    'openrouter' => [
        'api_key' => env('OPENROUTER_API_KEY'),
        'model' => env('OPENROUTER_MODEL', 'google/gemini-2.5-flash'),
        'site_url' => env('OPENROUTER_SITE_URL', 'http://localhost'),
        'app_name' => env('OPENROUTER_APP_NAME', 'MNHS Attendance'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Response Limits
    |--------------------------------------------------------------------------
    */

    'max_tokens' => (int) env('AI_MAX_TOKENS', 1024),

    'timeout_seconds' => (int) env('AI_TIMEOUT_SECONDS', 60),

];
