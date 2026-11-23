<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherManagementTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role): User
    {
        return User::factory()->create([
            'role' => $role,
            'email_verified_at' => now(),
        ]);
    }

    public function test_admin_can_create_a_teacher_from_the_teacher_page(): void
    {
        $admin = $this->makeUser('admin');

        $this->actingAs($admin)
            ->post(route('users.store'), [
                'name' => 'New Teacher',
                'email' => 'new.teacher@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'phone' => '09171234567',
                'role' => 'teacher',
                'redirect_to' => 'teachers',
            ])
            ->assertRedirect(route('teachers.index'))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('users', [
            'name' => 'New Teacher',
            'email' => 'new.teacher@example.com',
            'role' => 'teacher',
            'is_active' => true,
        ]);
    }

    public function test_teacher_cannot_create_another_teacher(): void
    {
        $teacher = $this->makeUser('teacher');

        $this->actingAs($teacher)
            ->post(route('users.store'), [
                'name' => 'Another Teacher',
                'email' => 'another.teacher@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'role' => 'teacher',
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('users', [
            'email' => 'another.teacher@example.com',
        ]);
    }
}
