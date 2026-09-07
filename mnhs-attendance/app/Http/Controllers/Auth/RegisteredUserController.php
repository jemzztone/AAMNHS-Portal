<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'googleRegistration' => session('pending_google'),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'lrn' => 'required|string|max:12|unique:'.Student::class,
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'guardian_name' => 'nullable|string|max:255',
            'guardian_email' => 'nullable|email|max:255',
        ]);

        // When the user arrived from Google sign-in, their email was already
        // verified by Google, so the account is trusted immediately.
        $googlePending = session('pending_google');
        $fromGoogle = $googlePending
            && strtolower((string) $googlePending['email']) === strtolower($request->email);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'email_verified_at' => $fromGoogle ? now() : null,
        ]);

        session()->forget('pending_google');

        Student::create([
            'user_id' => $user->id,
            'lrn' => $request->lrn,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'middle_name' => $request->middle_name,
            'guardian_name' => $request->guardian_name,
            'guardian_email' => $request->guardian_email,
            'is_active' => true,
        ]);

        // Google already verified the email — no verification email needed.
        if (! $fromGoogle) {
            event(new Registered($user));
        }

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
