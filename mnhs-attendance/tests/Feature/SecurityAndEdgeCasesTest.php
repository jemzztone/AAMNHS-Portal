<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\AdmissionSlip;
use App\Models\AttendanceRecord;
use App\Models\AuditLog;
use App\Models\GradeLevel;
use App\Models\Section;
use App\Models\Student;
use App\Models\TeacherSectionAssignment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class SecurityAndEdgeCasesTest extends TestCase
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

    public function test_admission_slip_rejection_is_audited(): void
    {
        $studentUser = $this->makeUser('student');
        $student = $this->makeStudent($studentUser);

        $this->actingAs($studentUser)
            ->post(route('admission-slips.store'), [
                'absence_date' => now()->subDay()->toDateString(),
                'reason' => 'Was sick.',
            ])
            ->assertRedirect();

        $slip = AdmissionSlip::firstOrFail();

        $admin = $this->makeUser('admin');
        $this->actingAs($admin)
            ->post(route('admission-slips.reject', $slip), [
                'review_notes' => 'Insufficient documentation.',
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertSame('rejected', $slip->refresh()->status);

        $this->assertDatabaseHas('audit_logs', [
            'event' => 'admission_slip.rejected',
            'auditable_id' => $slip->id,
        ]);

        $log = AuditLog::where('event', 'admission_slip.rejected')->firstOrFail();
        $this->assertSame('pending', $log->old_values['status']);
        $this->assertSame('rejected', $log->new_values['status']);
    }

    public function test_admission_slip_rejection_requires_notes(): void
    {
        $studentUser = $this->makeUser('student');
        $student = $this->makeStudent($studentUser);

        $this->actingAs($studentUser)
            ->post(route('admission-slips.store'), [
                'absence_date' => now()->subDay()->toDateString(),
                'reason' => 'Was sick.',
            ]);

        $slip = AdmissionSlip::firstOrFail();

        $admin = $this->makeUser('admin');
        $this->actingAs($admin)
            ->post(route('admission-slips.reject', $slip), [])
            ->assertSessionHasErrors('review_notes');
    }

    public function test_deactivated_user_cannot_access_protected_routes(): void
    {
        $user = $this->makeUser('admin');
        $user->update(['is_active' => false]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertRedirect(route('login'));
    }

    public function test_force_password_change_redirects_to_confirm(): void
    {
        $user = $this->makeUser('student');
        $user->update(['force_password_change' => true]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertRedirect(route('password.confirm'));
    }

    public function test_force_password_change_allows_password_update(): void
    {
        $user = $this->makeUser('student');
        $user->update(['force_password_change' => true]);

        $this->actingAs($user)
            ->put(route('password.update'), [
                'password' => 'NewPassword123!',
                'password_confirmation' => 'NewPassword123!',
                'current_password' => 'password',
            ])
            ->assertRedirect();
    }

    public function test_assign_teacher_prevents_duplicate(): void
    {
        $admin = $this->makeUser('admin');
        $teacher = $this->makeUser('teacher');

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

        $this->actingAs($admin)
            ->post(route('sections.assign-teacher', $section), [
                'teacher_id' => $teacher->id,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->actingAs($admin)
            ->post(route('sections.assign-teacher', $section), [
                'teacher_id' => $teacher->id,
            ])
            ->assertSessionHasErrors('teacher_id');
    }

    public function test_multiple_teachers_can_be_assigned_to_section(): void
    {
        $admin = $this->makeUser('admin');
        $teacher1 = $this->makeUser('teacher');
        $teacher2 = $this->makeUser('teacher');

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

        $this->actingAs($admin)
            ->post(route('sections.assign-teacher', $section), ['teacher_id' => $teacher1->id])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->actingAs($admin)
            ->post(route('sections.assign-teacher', $section), ['teacher_id' => $teacher2->id])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertDatabaseCount('teacher_section_assignments', 2);
    }

    public function test_csv_export_handles_commas_in_names(): void
    {
        $admin = $this->makeUser('admin');

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

        $studentUser = $this->makeUser('student');
        $student = Student::create([
            'user_id' => $studentUser->id,
            'lrn' => '2026-00100',
            'first_name' => 'Smith',
            'last_name' => 'O\'Brien, Jr.',
            'section_id' => $section->id,
            'qr_token' => (string) Str::uuid(),
        ]);

        AttendanceRecord::create([
            'student_id' => $student->id,
            'section_id' => $section->id,
            'date' => now()->toDateString(),
            'status' => 'present',
            'time_in' => '08:00:00',
            'source' => 'scan',
        ]);

        $response = $this->actingAs($admin)->get(route('attendance.export', [
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
        ]));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/csv; charset=utf-8');

        $content = $response->getContent();
        // fputcsv correctly escapes commas in names
        $this->assertStringContainsString('"Smith O\'Brien, Jr."', $content);
    }

    public function test_teacher_cannot_access_other_sections_attendance(): void
    {
        $teacher = $this->makeUser('teacher');

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

        $assignedSection = Section::create([
            'name' => 'Grade 7 - A',
            'grade_level_id' => $gradeLevel->id,
            'academic_year_id' => $academicYear->id,
        ]);

        $otherSection = Section::create([
            'name' => 'Grade 7 - B',
            'grade_level_id' => $gradeLevel->id,
            'academic_year_id' => $academicYear->id,
        ]);

        TeacherSectionAssignment::create([
            'user_id' => $teacher->id,
            'section_id' => $assignedSection->id,
        ]);

        $studentUser = $this->makeUser('student');
        $student = Student::create([
            'user_id' => $studentUser->id,
            'lrn' => '2026-00101',
            'first_name' => 'Other',
            'last_name' => 'Student',
            'section_id' => $otherSection->id,
            'qr_token' => (string) Str::uuid(),
        ]);

        $this->actingAs($teacher)
            ->post(route('attendance.manual'), [
                'student_id' => $student->id,
                'date' => now()->toDateString(),
                'status' => 'present',
            ])
            ->assertForbidden();
    }
}
