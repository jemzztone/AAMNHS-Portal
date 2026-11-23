<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
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
        // When the user arrived from Google sign-in, their email was already
        // verified by Google, so no password is needed and the account is
        // trusted immediately.
        $googlePending = session('pending_google');
        $submittedEmail = is_string($request->email) ? strtolower($request->email) : '';
        $fromGoogle = $googlePending
            && strtolower((string) ($googlePending['email'] ?? '')) === $submittedEmail;

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class),
                function (string $attribute, mixed $value, \Closure $fail) {
                    if (User::withTrashed()->where('email', $value)->whereNotNull('deleted_at')->exists()) {
                        $fail('This email belongs to a deleted account. Contact the school office to restore it.');
                    }
                },
            ],
            'password' => $fromGoogle
                ? ['nullable']
                : ['required', 'confirmed', Rules\Password::defaults()],
            'lrn' => [
                'required',
                'string',
                'digits:12',
                Rule::unique(Student::class),
                // The unique index covers soft-deleted students too.
                function (string $attribute, mixed $value, \Closure $fail) {
                    if (Student::withTrashed()->where('lrn', $value)->whereNotNull('deleted_at')->exists()) {
                        $fail('This LRN belongs to a deleted student record. Contact the school office to restore it.');
                    }
                },
            ],
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'guardian_name' => 'required|string|max:255',
            'guardian_email' => 'nullable|email|max:255',
        ]);

        $password = $fromGoogle ? Str::random(12) : $request->password;

        $user = DB::transaction(function () use ($request, $fromGoogle, $password) {
            // Set every column explicitly: production's role column has no
            // database default, so relying on one caused registration 500s.
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($password),
                'role' => 'student',
                'is_active' => true,
                'force_password_change' => false,
                'email_verified_at' => $fromGoogle ? now() : null,
            ]);

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

            return $user;
        });

        session()->forget('pending_google');

        // Google already verified the email — no verification email needed.
        if (! $fromGoogle) {
            event(new Registered($user));
        }

        Auth::login($user);

        // Show the generated password once so the user can note it.
        if ($fromGoogle) {
            session()->flash('generated_password', $password);
            session()->flash('show_password_notification', true);
        }

        return redirect(route('dashboard', absolute: false));
    }
}
