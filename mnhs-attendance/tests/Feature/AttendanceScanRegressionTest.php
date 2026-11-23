<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\AttendanceRecord;
use App\Models\GradeLevel;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AttendanceScanRegressionTest extends TestCase
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
            'lrn' => '2026-200'.random_int(100, 999),
            'first_name' => 'Scan',
            'last_name' => 'Student',
            'section_id' => $section->id,
            'qr_token' => (string) Str::uuid(),
        ]);
    }

    public function test_time_out_is_stored_in_24_hour_format(): void
    {
        Queue::fake();

        $student = $this->makeStudent();
        $guard = $this->makeUser('security_guard');

        AttendanceRecord::create([
            'student_id' => $student->id,
            'date' => now()->toDateString(),
            'status' => 'present',
            'time_in' => now()->subMinutes(30)->format('H:i:s'),
            'source' => 'scan',
        ]);

        $this->actingAs($guard)
            ->postJson(route('guard.scan.store'), [
                'qr_token' => $student->qr_token,
                'mode' => 'time_out',
            ])
            ->assertOk()
            ->assertJsonPath('action', 'time_out');

        $record = AttendanceRecord::where('student_id', $student->id)->firstOrFail();

        $this->assertMatchesRegularExpression('/^\d{2}:\d{2}:\d{2}$/', $record->time_out);
    }

    public function test_guard_can_remove_todays_scanned_record(): void
    {
        $student = $this->makeStudent();
        $guard = $this->makeUser('security_guard');

        $record = AttendanceRecord::create([
            'student_id' => $student->id,
            'date' => now()->toDateString(),
            'status' => 'present',
            'time_in' => now()->format('H:i:s'),
            'source' => 'scan',
        ]);

        $this->actingAs($guard)
            ->deleteJson(route('guard.scan.destroy', $record))
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertSoftDeleted('attendance_records', ['id' => $record->id]);
    }

    public function test_guard_cannot_remove_an_older_record(): void
    {
        $student = $this->makeStudent();
        $guard = $this->makeUser('security_guard');

        $record = AttendanceRecord::create([
            'student_id' => $student->id,
            'date' => now()->subDay()->toDateString(),
            'status' => 'present',
            'time_in' => '07:30:00',
            'source' => 'scan',
        ]);

        $this->actingAs($guard)
            ->deleteJson(route('guard.scan.destroy', $record))
            ->assertForbidden();
    }

    public function test_offline_sync_rejects_scans_without_a_token_or_lrn(): void
    {
        $this->makeStudent();
        $guard = $this->makeUser('security_guard');

        $this->actingAs($guard)
            ->postJson(route('guard.scan.sync'), [
                'scans' => [[
                    'client_id' => 'empty-scan',
                    'mode' => 'auto',
                    'scanned_at' => now()->toIso8601String(),
                ]],
            ])
            ->assertOk()
            ->assertJsonPath('results.0.success', false)
            ->assertJsonPath('results.0.reason', 'invalid_qr');

        $this->assertSame(0, AttendanceRecord::count());
    }

    public function test_generated_password_flash_is_shared_with_the_dashboard(): void
    {
        $user = $this->makeUser('student');
        $this->makeStudent()->update(['user_id' => $user->id]);

        $this->actingAs($user)
            ->withSession(['generated_password' => 'one-time-secret'])
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('flash.generated_password', 'one-time-secret'));
    }
}
