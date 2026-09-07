<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class GoogleAuthTest extends TestCase
{
    use RefreshDatabase;

    private function configureGoogle(): void
    {
        config([
            'services.google.client_id' => 'test-client-id',
            'services.google.client_secret' => 'test-client-secret',
            'services.google.redirect' => 'http://localhost/auth/google/callback',
        ]);
    }

    /**
     * Simulate the full OAuth round trip: hit the redirect endpoint (which
     * stores a state value in the session), extract that state from the
     * Location header, then call back with it — exactly like Google does.
     */
    private function callbackWithState(array $extra = []): TestResponse
    {
        $redirect = $this->get(route('auth.google.redirect'));

        parse_str(parse_url($redirect->headers->get('Location'), PHP_URL_QUERY), $query);

        return $this->get(route('auth.google.callback', [
            'code' => 'fake-code',
            'state' => $query['state'] ?? '',
            ...$extra,
        ]));
    }

    public function test_redirect_sends_user_to_google_consent_screen(): void
    {
        $this->configureGoogle();

        $response = $this->get(route('auth.google.redirect'));

        $location = $response->headers->get('Location');

        $response->assertRedirect();
        $this->assertStringContainsString('accounts.google.com', $location);
        $this->assertStringContainsString('client_id=test-client-id', $location);
        $this->assertStringContainsString(
            'redirect_uri='.urlencode('http://localhost/auth/google/callback'),
            $location,
        );
        $this->assertStringContainsString('response_type=code', $location);
        $this->assertStringContainsString('state=', $location);
    }

    public function test_callback_signs_in_existing_user(): void
    {
        $this->configureGoogle();

        $user = User::factory()->create([
            'email' => 'student@mnhs.edu',
            'role' => 'student',
        ]);

        Http::fake([
            'oauth2.googleapis.com/token' => Http::response(['access_token' => 'fake-token']),
            'googleapis.com/oauth2/v3/userinfo' => Http::response([
                'email' => 'student@mnhs.edu',
                'name' => 'Juan Dela Cruz',
            ]),
        ]);

        $this->callbackWithState()
            ->assertRedirect(route('dashboard', absolute: false));

        $this->assertAuthenticatedAs($user);
    }

    public function test_callback_signs_in_user_with_force_password_change(): void
    {
        $this->configureGoogle();

        $user = User::factory()->create([
            'email' => 'teacher@mnhs.edu',
            'role' => 'teacher',
            'force_password_change' => true,
        ]);

        Http::fake([
            'oauth2.googleapis.com/token' => Http::response(['access_token' => 'fake-token']),
            'googleapis.com/oauth2/v3/userinfo' => Http::response([
                'email' => 'teacher@mnhs.edu',
                'name' => 'Maria Santos',
            ]),
        ]);

        $this->callbackWithState()
            ->assertRedirect(route('dashboard', absolute: false));

        $this->assertAuthenticatedAs($user);
        // force_password_change is no longer used - direct login after Google auth
        $this->assertTrue($user->fresh()->force_password_change);
    }

    public function test_callback_sends_unknown_email_to_registration(): void
    {
        $this->configureGoogle();

        Http::fake([
            'oauth2.googleapis.com/token' => Http::response(['access_token' => 'fake-token']),
            'googleapis.com/oauth2/v3/userinfo' => Http::response([
                'email' => 'stranger@gmail.com',
                'name' => 'Stranger User',
            ]),
        ]);

        $this->callbackWithState()
            ->assertRedirect(route('register'))
            ->assertSessionHas('pending_google', [
                'email' => 'stranger@gmail.com',
                'name' => 'Stranger User',
            ]);

        $this->assertGuest();
    }

    public function test_full_google_registration_flow_creates_verified_account(): void
    {
        $this->configureGoogle();

        Http::fake([
            'oauth2.googleapis.com/token' => Http::response(['access_token' => 'fake-token']),
            'googleapis.com/oauth2/v3/userinfo' => Http::response([
                'email' => 'new.student@gmail.com',
                'name' => 'New Student',
            ]),
        ]);

        // 1. Google callback → redirected to registration with details in session.
        $this->callbackWithState()
            ->assertRedirect(route('register'))
            ->assertSessionHas('pending_google.email', 'new.student@gmail.com');

        // 2. Student completes the registration form using the Google email
        //    (a real browser carries the session cookie across automatically).
        $response = $this->withSession(['pending_google' => [
            'email' => 'new.student@gmail.com',
            'name' => 'New Student',
        ]])->post('/register', [
            'name' => 'New Student',
            'email' => 'new.student@gmail.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'lrn' => '987654321012',
            'first_name' => 'New',
            'last_name' => 'Student',
        ]);

        $response->assertRedirect(route('dashboard', absolute: false));

        $user = User::where('email', 'new.student@gmail.com')->firstOrFail();

        $this->assertAuthenticatedAs($user);
        $this->assertNotNull($user->email_verified_at);
        $this->assertDatabaseHas('students', [
            'user_id' => $user->id,
            'lrn' => '987654321012',
        ]);
    }

    public function test_google_registration_does_not_verify_different_email(): void
    {
        $this->configureGoogle();

        $response = $this->withSession(['pending_google' => [
            'email' => 'google.user@gmail.com',
            'name' => 'Google User',
        ]])->post('/register', [
            'name' => 'Google User',
            'email' => 'other.email@gmail.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'lrn' => '111222333444',
            'first_name' => 'Google',
            'last_name' => 'User',
        ]);

        $response->assertRedirect(route('dashboard', absolute: false));

        $user = User::where('email', 'other.email@gmail.com')->firstOrFail();
        $this->assertNull($user->email_verified_at);
    }

    public function test_callback_handles_cancelled_flow(): void
    {
        $this->configureGoogle();

        $this->get(route('auth.google.callback', ['error' => 'access_denied']))
            ->assertRedirect(route('login'))
            ->assertSessionHas('status');

        $this->assertGuest();
    }

    public function test_callback_rejects_missing_or_forged_state(): void
    {
        $this->configureGoogle();

        // No state at all.
        $this->get(route('auth.google.callback', ['code' => 'fake-code']))
            ->assertRedirect(route('login'))
            ->assertSessionHas('status');

        $this->assertGuest();

        // Forged state that was never issued.
        $this->get(route('auth.google.callback', ['code' => 'fake-code', 'state' => 'forged']))
            ->assertRedirect(route('login'))
            ->assertSessionHas('status');

        $this->assertGuest();
    }

    public function test_callback_rejects_deactivated_account(): void
    {
        $this->configureGoogle();

        User::factory()->create([
            'email' => 'inactive@mnhs.edu',
            'role' => 'student',
            'is_active' => false,
        ]);

        Http::fake([
            'oauth2.googleapis.com/token' => Http::response(['access_token' => 'fake-token']),
            'googleapis.com/oauth2/v3/userinfo' => Http::response([
                'email' => 'inactive@mnhs.edu',
                'name' => 'Inactive User',
            ]),
        ]);

        $this->callbackWithState()
            ->assertRedirect(route('login'))
            ->assertSessionHas('status');

        $this->assertGuest();
    }
}
