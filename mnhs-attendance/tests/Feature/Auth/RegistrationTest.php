<?php

namespace Tests\Feature\Auth;

use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'lrn' => '123456789012',
            'first_name' => 'Test',
            'last_name' => 'User',
            'guardian_name' => 'Parent User',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));

        $this->assertDatabaseHas('students', [
            'lrn' => '123456789012',
            'first_name' => 'Test',
            'last_name' => 'User',
            'guardian_name' => 'Parent User',
        ]);

        // Production's role column has no database default; registration must
        // set it explicitly or every sign-up returns a 500.
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'role' => 'student',
            'is_active' => true,
        ]);
    }

    public function test_guardian_name_is_required_but_middle_name_and_guardian_email_are_optional(): void
    {
        $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'lrn' => '123456789012',
            'first_name' => 'Test',
            'last_name' => 'User',
            'middle_name' => '',
            'guardian_name' => '',
            'guardian_email' => '',
        ])->assertSessionHasErrors('guardian_name');

        $this->assertDatabaseCount('users', 0);

        $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'lrn' => '123456789012',
            'first_name' => 'Test',
            'last_name' => 'User',
            'guardian_name' => 'Parent User',
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('students', [
            'lrn' => '123456789012',
            'guardian_email' => null,
        ]);
    }

    public function test_registration_rejects_the_lrn_of_a_soft_deleted_student(): void
    {
        $student = Student::create([
            'user_id' => User::factory()->create(['role' => 'student'])->id,
            'lrn' => '999999999999',
            'first_name' => 'Deleted',
            'last_name' => 'Student',
        ]);
        $student->delete();

        $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'lrn' => '999999999999',
            'first_name' => 'Test',
            'last_name' => 'User',
            'guardian_name' => 'Parent User',
        ])->assertSessionHasErrors('lrn');

        $this->assertDatabaseMissing('users', ['email' => 'test@example.com']);
    }
}
