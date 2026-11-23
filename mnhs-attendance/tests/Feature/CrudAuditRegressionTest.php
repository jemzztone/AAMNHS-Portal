<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\AttendanceRecord;
use App\Models\GradeLevel;
use App\Models\Section;
use App\Models\SectionSchedule;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;

class CrudAuditRegressionTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role, array $attributes = []): User
    {
        return User::factory()->create([
            'role' => $role,
            'email_verified_at' => now(),
            ...$attributes,
        ]);
    }

    private function makeSection(string $name = 'Grade 7 - A'): Section
    {
        $academicYear = AcademicYear::firstOrCreate(
            ['name' => '2026-2027'],
            [
                'start_date' => '2026-06-01',
                'end_date' => '2027-03-31',
                'is_current' => true,
            ],
        );

        $gradeLevel = GradeLevel::firstOrCreate(
            ['level_number' => 7],
            ['name' => 'Grade 7'],
        );

        return Section::create([
            'name' => $name,
            'grade_level_id' => $gradeLevel->id,
            'academic_year_id' => $academicYear->id,
        ]);
    }

    private function makeStudent(?Section $section = null, ?User $user = null, string $lrn = '123456789012'): Student
    {
        return Student::create([
            'user_id' => ($user ?? $this->makeUser('student'))->id,
            'lrn' => $lrn,
            'first_name' => 'Test',
            'last_name' => 'Student',
            'section_id' => $section?->id,
            'qr_token' => (string) Str::uuid(),
            'is_active' => true,
        ]);
    }

    public function test_manual_attendance_stores_24_hour_time_and_submitted_time_out(): void
    {
        $admin = $this->makeUser('admin');
        $student = $this->makeStudent($this->makeSection());

        $this->actingAs($admin)
            ->post(route('attendance.manual'), [
                'student_id' => $student->id,
                'date' => now()->toDateString(),
                'status' => 'present',
                'time_out' => '15:45:00',
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $record = AttendanceRecord::where('student_id', $student->id)->firstOrFail();

        $this->assertMatchesRegularExpression('/^\d{2}:\d{2}:\d{2}$/', $record->time_in);
        $this->assertSame('15:45:00', $record->time_out);
        $this->assertSame('manual', $record->source);
        $this->assertSame($admin->id, $record->recorded_by);
    }

    public function test_manual_attendance_rejects_future_dates_and_inactive_students(): void
    {
        $admin = $this->makeUser('admin');
        $student = $this->makeStudent($this->makeSection());

        $this->actingAs($admin)
            ->post(route('attendance.manual'), [
                'student_id' => $student->id,
                'date' => now()->addDay()->toDateString(),
                'status' => 'present',
            ])
            ->assertSessionHasErrors('date');

        $student->update(['is_active' => false]);

        $this->actingAs($admin)
            ->post(route('attendance.manual'), [
                'student_id' => $student->id,
                'date' => now()->toDateString(),
                'status' => 'present',
            ])
            ->assertSessionHasErrors('student_id');

        $this->assertDatabaseCount('attendance_records', 0);
    }

    public function test_manual_attendance_revives_a_soft_deleted_record_for_the_same_day(): void
    {
        $admin = $this->makeUser('admin');
        $student = $this->makeStudent($this->makeSection());

        $record = AttendanceRecord::create([
            'student_id' => $student->id,
            'date' => now()->toDateString(),
            'status' => 'present',
            'time_in' => '07:30:00',
            'source' => 'scan',
        ]);

        $record->delete();

        $this->actingAs($admin)
            ->post(route('attendance.manual'), [
                'student_id' => $student->id,
                'date' => now()->toDateString(),
                'status' => 'late',
                'time_out' => '16:00:00',
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $record->refresh();

        $this->assertFalse($record->trashed());
        $this->assertSame('late', $record->status);
        $this->assertSame('16:00:00', $record->time_out);
        $this->assertSame(1, AttendanceRecord::withTrashed()->count());
    }

    public function test_store_student_rejects_the_lrn_of_a_soft_deleted_student(): void
    {
        $admin = $this->makeUser('admin');
        $existing = $this->makeStudent(null, null, '555555555555');
        $existing->delete();

        $this->actingAs($admin)
            ->post(route('students.store'), [
                'first_name' => 'New',
                'last_name' => 'Student',
                'lrn' => '555555555555',
            ])
            ->assertSessionHasErrors('lrn');

        $this->assertSame(1, Student::withTrashed()->count());
    }

    public function test_import_survives_rows_with_extra_columns(): void
    {
        $admin = $this->makeUser('admin');
        $section = $this->makeSection();

        $csv = "first_name,last_name,middle_name,lrn,guardian_name,guardian_email\n"
            ."John,Doe,Smith,111111111111,Jane Doe,jane@test.com,EXTRA\n"
            ."Jane,Smith,,222222222222,,\n";

        $this->actingAs($admin)
            ->post(route('students.import-csv.store'), [
                'csv_file' => UploadedFile::fake()->createWithContent('students.csv', $csv),
                'section_id' => $section->id,
            ])
            ->assertRedirect(route('students.index'))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('students', ['lrn' => '111111111111']);
        $this->assertDatabaseHas('students', ['lrn' => '222222222222']);
    }

    public function test_import_rejects_the_lrn_of_a_soft_deleted_student_but_keeps_going(): void
    {
        $admin = $this->makeUser('admin');
        $section = $this->makeSection();
        $existing = $this->makeStudent($section, null, '333333333333');
        $existing->delete();

        $csv = "first_name,last_name,lrn\n"
            ."Deleted,Student,333333333333\n"
            ."Valid,Student,444444444444\n";

        $this->actingAs($admin)
            ->post(route('students.import-csv.store'), [
                'csv_file' => UploadedFile::fake()->createWithContent('students.csv', $csv),
                'section_id' => $section->id,
            ])
            ->assertRedirect(route('students.index'))
            ->assertSessionHasNoErrors();

        $this->assertSame(1, Student::withTrashed()->where('lrn', '333333333333')->count());
        $this->assertDatabaseHas('students', ['lrn' => '444444444444', 'deleted_at' => null]);
    }

    public function test_import_skips_rows_with_an_invalid_guardian_email(): void
    {
        $admin = $this->makeUser('admin');
        $section = $this->makeSection();

        $csv = "first_name,last_name,lrn,guardian_email\n"
            ."Bad,Email,555555555555,not-an-email\n"
            ."Good,Email,666666666666,parent@example.com\n";

        $this->actingAs($admin)
            ->post(route('students.import-csv.store'), [
                'csv_file' => UploadedFile::fake()->createWithContent('students.csv', $csv),
                'section_id' => $section->id,
            ])
            ->assertRedirect(route('students.index'))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseMissing('students', ['lrn' => '555555555555']);
        $this->assertDatabaseHas('students', [
            'lrn' => '666666666666',
            'guardian_email' => 'parent@example.com',
        ]);
    }

    public function test_admin_can_edit_a_student_without_a_section(): void
    {
        $admin = $this->makeUser('admin');
        $student = $this->makeStudent();

        $this->actingAs($admin)
            ->put(route('students.update', $student), [
                'first_name' => 'Renamed',
                'last_name' => 'Student',
                'lrn' => $student->lrn,
            ])
            ->assertRedirect(route('students.show', $student))
            ->assertSessionHasNoErrors();

        $this->assertSame('Renamed', $student->refresh()->first_name);
        $this->assertNull($student->section_id);
    }

    public function test_sections_are_ordered_by_grade_level_then_name(): void
    {
        $admin = $this->makeUser('admin');
        $academicYear = AcademicYear::firstOrCreate(
            ['name' => '2026-2027'],
            [
                'start_date' => '2026-06-01',
                'end_date' => '2027-03-31',
                'is_current' => true,
            ],
        );
        $grade7 = GradeLevel::firstOrCreate(['level_number' => 7], ['name' => 'Grade 7']);
        $grade8 = GradeLevel::firstOrCreate(['level_number' => 8], ['name' => 'Grade 8']);

        Section::create([
            'name' => 'Zulu',
            'grade_level_id' => $grade8->id,
            'academic_year_id' => $academicYear->id,
        ]);
        Section::create([
            'name' => 'Alpha',
            'grade_level_id' => $grade7->id,
            'academic_year_id' => $academicYear->id,
        ]);

        $this->actingAs($admin)
            ->get(route('sections.index'))
            ->assertInertia(fn ($page) => $page
                ->where('sections.data.0.name', 'Alpha')
                ->where('sections.data.0.grade_level.level_number', 7)
                ->where('sections.data.1.name', 'Zulu')
                ->where('sections.data.1.grade_level.level_number', 8));
    }

    public function test_schedule_cannot_be_accessed_through_another_section(): void
    {
        $admin = $this->makeUser('admin');
        $sectionA = $this->makeSection('Section A');
        $sectionB = $this->makeSection('Section B');

        $schedule = SectionSchedule::create([
            'section_id' => $sectionB->id,
            'day_of_week' => 'Monday',
            'start_time' => '07:30',
            'end_time' => '16:00',
            'grace_minutes' => 15,
        ]);

        $this->actingAs($admin)
            ->get(route('schedules.show', [$sectionA, $schedule]))
            ->assertNotFound();

        $this->actingAs($admin)
            ->put(route('schedules.update', [$sectionA, $schedule]), [
                'day_of_week' => 'Tuesday',
                'start_time' => '08:00',
                'end_time' => '16:30',
                'grace_minutes' => 10,
            ])
            ->assertNotFound();

        $this->actingAs($admin)
            ->delete(route('schedules.destroy', [$sectionA, $schedule]))
            ->assertNotFound();

        $this->assertSame('Monday', $schedule->refresh()->day_of_week);
    }

    public function test_section_with_students_cannot_be_deleted(): void
    {
        $admin = $this->makeUser('admin');
        $section = $this->makeSection();
        $this->makeStudent($section);

        $this->actingAs($admin)
            ->delete(route('sections.destroy', $section))
            ->assertSessionHasErrors('section');

        $this->assertNotSoftDeleted('sections', ['id' => $section->id]);
    }

    public function test_academic_year_and_grade_level_with_sections_cannot_be_deleted(): void
    {
        $admin = $this->makeUser('admin');
        $section = $this->makeSection();
        $academicYear = $section->academicYear;
        $gradeLevel = $section->gradeLevel;

        $this->actingAs($admin)
            ->delete(route('academic-years.destroy', $academicYear))
            ->assertSessionHasErrors('academic_year');

        $this->assertNotSoftDeleted('academic_years', ['id' => $academicYear->id]);

        $this->actingAs($admin)
            ->delete(route('grade-levels.destroy', $gradeLevel))
            ->assertSessionHasErrors('grade_level');

        $this->assertNotSoftDeleted('grade_levels', ['id' => $gradeLevel->id]);
    }

    public function test_admin_can_view_admin_and_guard_user_details(): void
    {
        $admin = $this->makeUser('admin');
        $otherAdmin = $this->makeUser('admin');
        $guard = $this->makeUser('security_guard');

        $this->actingAs($admin)->get(route('users.show', $otherAdmin))->assertOk();
        $this->actingAs($admin)->get(route('users.show', $guard))->assertOk();
    }

    public function test_deleting_a_student_deactivates_the_linked_login(): void
    {
        $admin = $this->makeUser('admin');
        $studentUser = $this->makeUser('student');
        $student = $this->makeStudent($this->makeSection(), $studentUser);

        $this->actingAs($admin)
            ->delete(route('students.destroy', $student))
            ->assertRedirect(route('students.index'));

        $this->assertSoftDeleted('students', ['id' => $student->id]);
        $this->assertFalse($studentUser->refresh()->is_active);
    }

    public function test_deleting_and_restoring_a_student_user_keeps_the_profile_in_sync(): void
    {
        $superAdmin = $this->makeUser('super_admin');
        $studentUser = $this->makeUser('student');
        $student = $this->makeStudent($this->makeSection(), $studentUser);

        $this->actingAs($superAdmin)
            ->delete(route('users.destroy', $studentUser))
            ->assertRedirect(route('users.index'));

        $this->assertSoftDeleted('users', ['id' => $studentUser->id]);
        $this->assertSoftDeleted('students', ['id' => $student->id]);

        $this->actingAs($superAdmin)
            ->post(route('users.restore', $studentUser))
            ->assertRedirect(route('users.index'));

        $this->assertNotSoftDeleted('users', ['id' => $studentUser->id]);
        $this->assertNotSoftDeleted('students', ['id' => $student->id]);
    }

    public function test_last_super_admin_cannot_demote_themselves(): void
    {
        $superAdmin = $this->makeUser('super_admin');

        $this->actingAs($superAdmin)
            ->patch(route('users.update', $superAdmin), [
                'name' => $superAdmin->name,
                'email' => $superAdmin->email,
                'role' => 'admin',
            ])
            ->assertSessionHasErrors('role');

        $this->assertSame('super_admin', $superAdmin->refresh()->role);
    }

    public function test_last_super_admin_cannot_delete_their_own_account(): void
    {
        $superAdmin = $this->makeUser('super_admin', [
            'password' => Hash::make('Password123!'),
        ]);

        $this->actingAs($superAdmin)
            ->delete(route('profile.destroy'), ['password' => 'Password123!'])
            ->assertSessionHasErrors('password');

        $this->assertNotSoftDeleted('users', ['id' => $superAdmin->id]);
    }
}
