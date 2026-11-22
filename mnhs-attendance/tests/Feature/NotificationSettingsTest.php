<?php

namespace Tests\Feature;

use App\Actions\Attendance\ProcessQrScan;
use App\Jobs\SendGuardianNotification;
use App\Models\AcademicYear;
use App\Models\GradeLevel;
use App\Models\NotificationSetting;
use App\Models\Section;
use App\Models\SectionSchedule;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class NotificationSettingsTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role): User
    {
        return User::factory()->create([
            'role' => $role,
            'email_verified_at' => now(),
        ]);
    }

    private function makeStudent(?Section $section = null, string $guardianEmail = 'guardian@example.com'): Student
    {
        return Student::create([
            'user_id' => $this->makeUser('student')->id,
            'lrn' => '2026-000'.random_int(100, 999),
            'first_name' => 'Test',
            'last_name' => 'Student',
            'section_id' => $section?->id,
            'guardian_email' => $guardianEmail,
            'qr_token' => (string) Str::uuid(),
        ]);
    }

    private function makeSection(): Section
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

        return Section::create([
            'name' => 'Grade 7 - A',
            'grade_level_id' => $gradeLevel->id,
            'academic_year_id' => $academicYear->id,
        ]);
    }

    public function test_admin_can_view_notification_preferences(): void
    {
        NotificationSetting::current()->update([
            'notify_on_time_in' => true,
            'notify_on_time_out' => false,
            'notify_on_late_only' => true,
        ]);

        $this->actingAs($this->makeUser('admin'))
            ->get(route('notification-settings.edit'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('NotificationSettings/Edit')
                ->where('settings.notify_on_time_in', true)
                ->where('settings.notify_on_time_out', false)
                ->where('settings.notify_on_late_only', true)
            );
    }

    public function test_admin_can_update_notification_preferences(): void
    {
        $this->actingAs($this->makeUser('admin'))
            ->put(route('notification-settings.update'), [
                'notify_on_time_in' => false,
                'notify_on_time_out' => true,
                'notify_on_late_only' => false,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $settings = NotificationSetting::current();

        $this->assertFalse($settings->notify_on_time_in);
        $this->assertTrue($settings->notify_on_time_out);
        $this->assertFalse($settings->notify_on_late_only);
        $this->assertDatabaseCount('notification_settings', 1);
    }

    public function test_non_admin_cannot_manage_notification_preferences(): void
    {
        foreach (['teacher', 'student', 'security_guard'] as $role) {
            $this->actingAs($this->makeUser($role))
                ->get(route('notification-settings.edit'))
                ->assertForbidden();
        }
    }

    public function test_arrival_notifications_can_be_disabled(): void
    {
        Queue::fake();

        NotificationSetting::current()->update(['notify_on_time_in' => false]);

        $student = $this->makeStudent();

        (new ProcessQrScan)->handle($student->qr_token, null, '127.0.0.1', 'phpunit');

        $this->assertDatabaseHas('guardian_notifications', [
            'student_id' => $student->id,
            'guardian_email' => 'guardian@example.com',
            'status' => 'skipped',
            'failure_reason' => 'Arrival emails are turned off in notification preferences.',
        ]);
        // The student still receives a Web Push, but no guardian email job is
        // queued when the notice is suppressed.
        Queue::assertNotPushed(SendGuardianNotification::class);
    }

    public function test_departure_notifications_can_be_disabled(): void
    {
        Queue::fake();

        NotificationSetting::current()->update(['notify_on_time_out' => false]);

        $student = $this->makeStudent();
        $scanner = new ProcessQrScan;

        // First scan: time-in.
        $scanner->handle($student->qr_token, null, '127.0.0.1', 'phpunit');
        Queue::fake();

        // Second scan: time-out. Use a scannedAt 5 seconds after the first
        // so the 3-second auto-mode cooldown has already elapsed.
        $scanner->handle(
            $student->qr_token,
            null,
            '127.0.0.1',
            'phpunit',
            scannedAt: now()->addSeconds(5),
        );

        $this->assertDatabaseHas('guardian_notifications', [
            'student_id' => $student->id,
            'status' => 'skipped',
            'failure_reason' => 'Departure emails are turned off in notification preferences.',
        ]);
        // The student still receives a Web Push, but no guardian email job is
        // queued when the notice is suppressed.
        Queue::assertNotPushed(SendGuardianNotification::class);
    }

    public function test_late_only_skips_on_time_arrivals(): void
    {
        Queue::fake();

        NotificationSetting::current()->update(['notify_on_late_only' => true]);

        $student = $this->makeStudent();

        (new ProcessQrScan)->handle($student->qr_token, null, '127.0.0.1', 'phpunit');

        $this->assertDatabaseHas('guardian_notifications', [
            'student_id' => $student->id,
            'status' => 'skipped',
            'failure_reason' => 'Only late arrivals are emailed and this student arrived on time.',
        ]);
        // The student still receives a Web Push, but no guardian email job is
        // queued when the notice is suppressed.
        Queue::assertNotPushed(SendGuardianNotification::class);
    }

    public function test_late_only_still_notifies_for_late_students(): void
    {
        Queue::fake();

        NotificationSetting::current()->update(['notify_on_late_only' => true]);

        $section = $this->makeSection();

        SectionSchedule::create([
            'section_id' => $section->id,
            'day_of_week' => now()->format('l'),
            'start_time' => '00:00:00',
            'end_time' => '23:59:59',
            'grace_minutes' => 0,
        ]);

        $student = $this->makeStudent($section);

        (new ProcessQrScan)->handle($student->qr_token, null, '127.0.0.1', 'phpunit');

        $this->assertDatabaseHas('guardian_notifications', [
            'student_id' => $student->id,
            'status' => 'pending',
        ]);
        Queue::assertPushed(SendGuardianNotification::class);
    }

    public function test_arrival_notifications_send_by_default(): void
    {
        Queue::fake();

        $student = $this->makeStudent();

        (new ProcessQrScan)->handle($student->qr_token, null, '127.0.0.1', 'phpunit');

        $this->assertDatabaseHas('guardian_notifications', [
            'student_id' => $student->id,
            'guardian_email' => 'guardian@example.com',
        ]);
        Queue::assertPushed(SendGuardianNotification::class);
    }
}
