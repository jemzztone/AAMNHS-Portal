<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\GradeLevel;
use App\Models\GuardianNotification;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GuardianNotificationStatusTest extends TestCase
{
    use RefreshDatabase;

    private function makeStudent(): Student
    {
        $studentUser = User::factory()->create([
            'role' => 'student',
            'email_verified_at' => now(),
        ]);

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
            'user_id' => $studentUser->id,
            'lrn' => '2026-00077',
            'first_name' => 'Test',
            'last_name' => 'Student',
            'section_id' => $section->id,
            'qr_token' => (string) Str::uuid(),
        ]);
    }

    private function makeNotification(Student $student, string $status, ?string $reason = null): GuardianNotification
    {
        return GuardianNotification::create([
            'student_id' => $student->id,
            'guardian_email' => 'guardian@example.com',
            'subject' => 'Attendance update',
            'body' => 'Your child scanned in today.',
            'status' => $status,
            'failure_reason' => $reason,
            'sent_at' => $status === 'sent' ? now() : null,
        ]);
    }

    public function test_index_reports_status_counts_and_failure_reason(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);
        $student = $this->makeStudent();

        $this->makeNotification($student, 'pending');
        $this->travel(1)->minutes();
        $this->makeNotification($student, 'sent');
        $this->travel(1)->minutes();
        $this->makeNotification($student, 'failed', 'Connection could not be established.');

        $this->actingAs($admin)
            ->get(route('guardian-notifications.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('GuardianNotifications/Index')
                ->where('stats.pending', 1)
                ->where('stats.sent', 1)
                ->where('stats.failed', 1)
                ->where('stats.total', 3)
                ->where('notifications.data.0.status', 'failed')
                ->where('notifications.data.0.failure_reason', 'Connection could not be established.')
            );
    }

    public function test_index_can_filter_failed_notifications(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);
        $student = $this->makeStudent();

        $this->makeNotification($student, 'sent');
        $this->makeNotification($student, 'failed', 'Mail transport is not configured.');

        $this->actingAs($admin)
            ->get(route('guardian-notifications.index', ['status' => 'failed']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('notifications.data', 1)
                ->where('notifications.data.0.failure_reason', 'Mail transport is not configured.')
            );
    }

    public function test_index_flags_log_mailer_as_unconfigured(): void
    {
        config(['mail.default' => 'log']);

        $admin = User::factory()->create([
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $this->actingAs($admin)
            ->get(route('guardian-notifications.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('mail.mailer', 'log')
                ->where('mail.configured', false)
            );
    }

    public function test_index_reports_smtp_mailer_as_configured(): void
    {
        config(['mail.default' => 'smtp']);

        $admin = User::factory()->create([
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $this->actingAs($admin)
            ->get(route('guardian-notifications.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('mail.mailer', 'smtp')
                ->where('mail.configured', true)
            );
    }
}
