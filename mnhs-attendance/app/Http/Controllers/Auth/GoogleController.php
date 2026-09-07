<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GoogleController extends Controller
{
    /**
     * Send the user to Google's OAuth consent screen.
     *
     * A random state value is stored in the session and must be echoed back
     * by Google on the callback. This prevents login CSRF, where an attacker
     * tricks a victim's browser into completing the OAuth flow using the
     * attacker's Google account.
     */
    public function redirect(): RedirectResponse
    {
        $state = Str::random(40);
        session()->put('google_oauth_state', $state);

        $query = http_build_query([
            'client_id' => config('services.google.client_id'),
            'redirect_uri' => config('services.google.redirect'),
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'prompt' => 'select_account',
            'access_type' => 'online',
            'state' => $state,
        ]);

        return redirect()->away('https://accounts.google.com/o/oauth2/v2/auth?'.$query);
    }

    /**
     * Handle Google's OAuth callback and sign the matching user in.
     */
    public function callback(Request $request): RedirectResponse
    {
        if ($request->has('error')) {
            return $this->backToLogin('Google sign-in was cancelled.');
        }

        // Validate the state parameter against the one we generated. A
        // mismatch means the response was forged or replayed.
        $expectedState = session()->pull('google_oauth_state');

        if (! $expectedState || ! $request->has('state') || ! hash_equals($expectedState, (string) $request->get('state'))) {
            return $this->backToLogin('Google sign-in could not be verified. Please try again.');
        }

        $code = $request->get('code');

        if (! $code) {
            return $this->backToLogin('Google sign-in failed. Please try again.');
        }

        try {
            $tokenResponse = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'code' => $code,
                'client_id' => config('services.google.client_id'),
                'client_secret' => config('services.google.client_secret'),
                'redirect_uri' => config('services.google.redirect'),
                'grant_type' => 'authorization_code',
            ]);

            if ($tokenResponse->failed()) {
                Log::error('Google token exchange failed', ['response' => $tokenResponse->json()]);

                return $this->backToLogin('Google sign-in failed. Please try again.');
            }

            $userInfoResponse = Http::withToken($tokenResponse->json('access_token'))
                ->get('https://www.googleapis.com/oauth2/v3/userinfo');

            if ($userInfoResponse->failed()) {
                Log::error('Google userinfo request failed', ['response' => $userInfoResponse->json()]);

                return $this->backToLogin('Google sign-in failed. Please try again.');
            }

            $googleUser = $userInfoResponse->json();
        } catch (\Throwable $e) {
            Log::error('Google sign-in exception', ['error' => $e->getMessage()]);

            return $this->backToLogin('Google sign-in failed. Please try again.');
        }

        $email = strtolower((string) ($googleUser['email'] ?? ''));

        if (! $email) {
            return $this->backToLogin('Google did not return an email address.');
        }

        $user = User::where('email', $email)->first();

        if (! $user) {
            // First-time Google user: carry the verified Google identity over to
            // the registration form so they only need to fill in their student details.
            session()->put('pending_google', [
                'email' => $email,
                'name' => $googleUser['name'] ?? null,
            ]);

            return redirect()->route('register')
                ->with('status', 'Google verified your email. Complete your registration below to finish creating your account.');
        }

        if (! $user->is_active) {
            return $this->backToLogin('Your account has been deactivated. Please contact an administrator.');
        }

        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    private function backToLogin(string $message): RedirectResponse
    {
        return redirect()->route('login')->with('status', $message);
    }
}
