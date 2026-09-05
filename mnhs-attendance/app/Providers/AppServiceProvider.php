<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Security rule: enforce password entropy (min 10 chars, mixed case,
        // numbers, and special characters) on every password change flow.
        Password::defaults(fn () => Password::min(10)
            ->letters()
            ->mixedCase()
            ->numbers()
            ->symbols());
    }
}
