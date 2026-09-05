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
            if ($request->routeIs('password.update') || $request->routeIs('password.confirm') || $request->routeIs('logout')) {
                return $next($request);
            }

            return redirect()->route('password.confirm')
                ->with('status', 'You must change your password before continuing.');
        }

        return $next($request);
    }
}
