<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }

    // =========================================================================
    // TC-029: Unauthenticated Access Redirect Tests
    // =========================================================================

    public function test_unauthenticated_user_redirected_to_login_on_dashboard(): void
    {
        // Unauthenticated user tries to access dashboard
        $response = $this->get('/dashboard');

        $response->assertRedirect(route('login'));
        $response->assertSessionHasNoErrors();
    }

    public function test_unauthenticated_user_redirected_to_login_on_students(): void
    {
        // Unauthenticated user tries to access students list
        $response = $this->get('/students');

        $response->assertRedirect(route('login'));
        $response->assertSessionHasNoErrors();
    }

    public function test_unauthenticated_user_redirected_to_login_on_attendance(): void
    {
        // Unauthenticated user tries to access attendance page
        $response = $this->get('/attendance');

        $response->assertRedirect(route('login'));
        $response->assertSessionHasNoErrors();
    }

    public function test_unauthenticated_user_redirected_to_login_on_profile(): void
    {
        // Unauthenticated user tries to access profile
        $response = $this->get('/profile');

        $response->assertRedirect(route('login'));
        $response->assertSessionHasNoErrors();
    }

    public function test_unauthenticated_user_redirected_on_post_attendance_manual(): void
    {
        // Unauthenticated user tries to submit attendance
        $response = $this->post('/attendance/manual', [
            'student_id' => 'fake-id',
            'date' => now()->toDateString(),
            'status' => 'present',
        ]);

        $response->assertRedirect(route('login'));
        $response->assertSessionHasNoErrors();
    }

    public function test_unauthenticated_user_redirected_on_post_attendance_export(): void
    {
        // Unauthenticated user tries to export attendance
        $response = $this->get('/attendance/export');

        $response->assertRedirect(route('login'));
        $response->assertSessionHasNoErrors();
    }

    public function test_unauthenticated_user_redirected_on_admin_routes(): void
    {
        // Test various admin-protected routes
        $adminRoutes = [
            ['GET', '/users'],
            ['GET', '/audit-logs'],
            ['GET', '/guardian-notifications'],
            ['GET', '/analytics'],
        ];

        foreach ($adminRoutes as [$method, $uri]) {
            $this->{$method}($uri)
                ->assertRedirect(route('login'));
        }
    }

    public function test_unauthenticated_user_redirected_on_section_routes(): void
    {
        // Test section routes
        $sectionRoutes = [
            ['GET', '/sections'],
            ['GET', '/sections/create'],
            ['GET', '/grade-levels'],
            ['GET', '/academic-years'],
        ];

        foreach ($sectionRoutes as [$method, $uri]) {
            $this->{$method}($uri)
                ->assertRedirect(route('login'));
        }
    }

    public function test_logged_out_user_redirected_to_login(): void
    {
        // Log in first
        $user = User::factory()->create();
        $this->actingAs($user);
        $this->assertAuthenticatedAs($user);

        // Log out
        $this->post('/logout');
        $this->assertGuest();

        // Try to access protected route after logout
        $response = $this->get('/dashboard');
        $response->assertRedirect(route('login'));
    }

    public function test_login_page_loads_correctly_after_redirect(): void
    {
        // Access protected route (should redirect to login)
        $response = $this->get('/dashboard');

        // Follow redirect
        $response->assertRedirect(route('login'));

        // Verify login page is accessible
        $loginResponse = $this->get(route('login'));
        $loginResponse->assertOk();
        $loginResponse->assertSee('Login');
    }

    public function test_no_session_errors_on_unauth_redirect(): void
    {
        // Accessing protected route should not create session errors
        $response = $this->get('/dashboard');

        $response->assertRedirect(route('login'));
        $response->assertSessionMissing('error');
        $response->assertSessionHasNoErrors();
    }

    public function test_unauthenticated_user_cannot_access_guard_scan_routes(): void
    {
        // Guard-specific routes should also redirect unauthenticated users
        $guardRoutes = [
            ['GET', '/guard/scan'],
            ['GET', '/guard/recent'],
            ['GET', '/guard/schedule'],
        ];

        foreach ($guardRoutes as [$method, $uri]) {
            $this->{$method}($uri)
                ->assertRedirect(route('login'));
        }
    }

    public function test_unauthenticated_user_redirected_on_student_operations(): void
    {
        // Student CRUD operations should redirect
        $studentRoutes = [
            ['GET', '/students/create'],
            ['POST', '/students'],
            ['GET', '/students/import/csv'],
        ];

        foreach ($studentRoutes as [$method, $uri]) {
            $this->{$method}($uri)
                ->assertRedirect(route('login'));
        }
    }

    public function test_unauthenticated_user_redirected_on_ai_routes(): void
    {
        // AI routes should redirect unauthenticated users
        $aiRoutes = [
            ['GET', '/ai'],
            ['POST', '/ai/query'],
        ];

        foreach ($aiRoutes as [$method, $uri]) {
            $this->{$method}($uri)
                ->assertRedirect(route('login'));
        }
    }
}
