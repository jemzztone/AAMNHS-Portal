<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\AdmissionSlip;
use App\Models\AttendanceRecord;
use App\Models\AuditLog;
use App\Models\GradeLevel;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class AttendanceSystemPagesTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role): User
    {
        return User::factory()->create([
            'role' => $role,
            'email_verified_at' => now(),
        ]);
    }

    private function makeStudent(User $user): Student
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
            'user_id' => $user->id,
            'lrn' => '2026-00099',
            'first_name' => 'Test',
            'last_name' => 'Student',
            'section_id' => $section->id,
            'qr_token' => (string) Str::uuid(),
        ]);
    }

    public function test_admin_can_open_student_edit_and_print_qr_pages(): void
    {
        $admin = $this->makeUser('admin');
        $student = $this->makeStudent($this->makeUser('student'));

        $this->actingAs($admin)
            ->get(route('students.edit', $student))
            ->assertOk();

        $this->actingAs($admin)
            ->get(route('students.print-qr', $student))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Students/PrintQR'));
    }

    public function test_admin_can_open_section_pages_and_create_a_section(): void
    {
        $admin = $this->makeUser('admin');
        $student = $this->makeStudent($admin);
        $section = $student->section;
        $gradeLevel = $section->gradeLevel;

        $this->actingAs($admin)
            ->get(route('sections.create'))
            ->assertOk();

        $this->actingAs($admin)
            ->get(route('sections.show', $section))
            ->assertOk();

        $this->actingAs($admin)
            ->get(route('sections.edit', $section))
            ->assertOk();

        $this->actingAs($admin)
            ->post(route('sections.store'), [
                'name' => 'Grade 8 - B',
                'grade_level_id' => $gradeLevel->id,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('sections', [
            'name' => 'Grade 8 - B',
            'academic_year_id' => $section->academic_year_id,
        ]);
    }

    public function test_student_can_open_admission_slip_pages_and_staff_can_approve(): void
    {
        $studentUser = $this->makeUser('student');
        $student = $this->makeStudent($studentUser);

        $this->actingAs($studentUser)
            ->get(route('admission-slips.create'))
            ->assertOk();

        $this->actingAs($studentUser)
            ->post(route('admission-slips.store'), [
                'absence_date' => now()->subDay()->toDateString(),
                'reason' => 'Was sick with a fever.',
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $slip = AdmissionSlip::firstOrFail();

        $this->actingAs($studentUser)
            ->get(route('admission-slips.show', $slip))
            ->assertOk();

        $admin = $this->makeUser('admin');
        $this->actingAs($admin)
            ->post(route('admission-slips.approve', $slip))
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertSame('approved', $slip->refresh()->status);

        $this->assertDatabaseHas('audit_logs', ['event' => 'admission_slip.approved', 'auditable_id' => $slip->id]);
        $this->assertSame('pending', AuditLog::where('event', 'admission_slip.approved')->firstOrFail()->old_values['status']);
    }

    public function test_manual_attendance_entry_is_audited(): void
    {
        $admin = $this->makeUser('admin');
        $student = $this->makeStudent($this->makeUser('student'));

        $this->actingAs($admin)
            ->post(route('attendance.manual'), [
                'student_id' => $student->id,
                'date' => now()->toDateString(),
                'status' => 'absent',
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $record = AttendanceRecord::where('student_id', $student->id)->firstOrFail();

        $this->assertDatabaseHas('audit_logs', [
            'event' => 'attendance.manual_entry',
            'auditable_type' => AttendanceRecord::class,
            'auditable_id' => $record->id,
        ]);

        // Corrections log old vs new state.
        $this->actingAs($admin)
            ->post(route('attendance.manual'), [
                'student_id' => $student->id,
                'date' => now()->toDateString(),
                'status' => 'present',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $updateLog = AuditLog::where('event', 'attendance.updated')->firstOrFail();
        $this->assertSame('absent', $updateLog->old_values['status']);
        $this->assertSame('present', $updateLog->new_values['status']);
    }

    public function test_guard_scan_records_attendance_and_audits_it(): void
    {
        $guard = $this->makeUser('security_guard');
        $student = $this->makeStudent($this->makeUser('student'));

        $this->actingAs($guard)
            ->postJson(route('guard.scan.store'), ['qr_token' => $student->qr_token])
            ->assertOk()
            ->assertJsonPath('success', true);

        $record = AttendanceRecord::where('student_id', $student->id)->firstOrFail();

        $this->assertDatabaseHas('audit_logs', [
            'event' => 'attendance.scan',
            'auditable_type' => AttendanceRecord::class,
            'auditable_id' => $record->id,
        ]);
    }

    public function test_guard_scan_pages_are_restricted_to_security_guards(): void
    {
        $admin = $this->makeUser('admin');

        $this->actingAs($admin)
            ->get(route('guard.scan'))
            ->assertForbidden();

        $guard = $this->makeUser('security_guard');

        $this->actingAs($guard)
            ->get(route('guard.scan'))
            ->assertOk();
    }
}
