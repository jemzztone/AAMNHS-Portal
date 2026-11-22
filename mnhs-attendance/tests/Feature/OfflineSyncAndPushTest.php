<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\AttendanceRecord;
use App\Models\GradeLevel;
use App\Models\PushSubscription;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Tests\TestCase;

class OfflineSyncAndPushTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role): User
    {
        return User::factory()->create([
            'role' => $role,
            'email_verified_at' => now(),
        ]);
    }

    private function makeStudent(): Student
    {
        $academicYear = AcademicYear::create([
            'name' => '2026-2027',
            'start_date' => '2026-06-01',
            'end_date' => '2027-03-31',
            'is_current' => true,
        ]);

        $gradeLevel = GradeLevel::create([
            'name' => 'Grade 7',
            'level_number' => 7,
        ]);

        $section = Section::create([
            'name' => 'Grade 7 - A',
            'grade_level_id' => $gradeLevel->id,
            'academic_year_id' => $academicYear->id,
        ]);

        return Student::create([
            'user_id' => $this->makeUser('student')->id,
            'lrn' => '2026-100'.random_int(100, 999),
            'first_name' => 'Offline',
            'last_name' => 'Student',
            'section_id' => $section->id,
            'guardian_email' => null,
            'qr_token' => (string) Str::uuid(),
        ]);
    }

    public function test_guard_can_replay_queued_scans_and_replays_are_idempotent(): void
    {
        Queue::fake();

        $student = $this->makeStudent();
        $guard = $this->makeUser('security_guard');

        $payload = [
            'scans' => [[
                'client_id' => 'offline-scan-1',
                'qr_token' => $student->qr_token,
                'mode' => 'auto',
                'scanned_at' => now()->toIso8601String(),
            ]],
        ];

        $this->actingAs($guard)
            ->postJson(route('guard.scan.sync'), $payload)
            ->assertOk()
            ->assertJsonPath('results.0.success', true)
            ->assertJsonPath('results.0.client_id', 'offline-scan-1');

        $this->assertSame(1, AttendanceRecord::where('client_reference', 'offline-scan-1')->count());

        // The same queued scan is re-sent (e.g. the response was lost) — it must
        // be acknowledged without creating a duplicate record.
        $this->actingAs($guard)
            ->postJson(route('guard.scan.sync'), $payload)
            ->assertOk()
            ->assertJsonPath('results.0.success', true)
            ->assertJsonPath('results.0.duplicate', true);

        $this->assertSame(1, AttendanceRecord::where('student_id', $student->id)->count());
    }

    public function test_non_guard_cannot_replay_queued_scans(): void
    {
        $student = $this->makeStudent();

        $this->actingAs($this->makeUser('teacher'))
            ->postJson(route('guard.scan.sync'), [
                'scans' => [[
                    'client_id' => 'offline-scan-2',
                    'qr_token' => $student->qr_token,
                    'scanned_at' => now()->toIso8601String(),
                ]],
            ])
            ->assertForbidden();
    }

    public function test_user_can_register_a_push_subscription(): void
    {
        $user = $this->makeUser('student');

        $this->actingAs($user)
            ->postJson(route('push.subscribe'), [
                'endpoint' => 'https://push.example.com/abc123',
                'keys' => [
                    'p256dh' => 'public-key',
                    'auth' => 'auth-token',
                ],
            ])
            ->assertOk();

        $this->assertDatabaseHas('push_subscriptions', [
            'user_id' => $user->id,
            'endpoint' => 'https://push.example.com/abc123',
        ]);

        // Subscribing twice from the same device updates instead of duplicating.
        $this->actingAs($user)->postJson(route('push.subscribe'), [
            'endpoint' => 'https://push.example.com/abc123',
            'keys' => ['p256dh' => 'public-key', 'auth' => 'auth-token'],
        ])->assertOk();

        $this->assertSame(1, PushSubscription::where('user_id', $user->id)->count());
    }
}
