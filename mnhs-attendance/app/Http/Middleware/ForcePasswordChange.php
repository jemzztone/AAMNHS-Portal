<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForcePasswordChange
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->force_password_change === true) {
            // Only the password change form (on the profile page), the
            // password update endpoint, and logout are reachable until the
            // password has been changed. Every other route redirects here,
            // so the user cannot get stuck on a confirmation-only screen.
            if ($request->routeIs('profile.edit')
                || $request->routeIs('password.update')
                || $request->routeIs('logout')) {
                return $next($request);
            }

            return redirect()->route('profile.edit')
                ->with('status', 'You must change your password before continuing.');
        }

        return $next($request);
    }
}
