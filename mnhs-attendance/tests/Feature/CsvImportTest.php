<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\GradeLevel;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CsvImportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_csv_import_creates_students_successfully(): void
    {
        // Create academic year, grade level, and section
        $academicYear = AcademicYear::create(['name' => '2026-2027', 'start_date' => '2026-06-01', 'end_date' => '2027-03-31']);
        $gradeLevel = GradeLevel::create(['name' => 'Grade 10', 'level_number' => 10]);
        $section = Section::create([
            'name' => '10-A',
            'grade_level_id' => $gradeLevel->id,
            'academic_year_id' => $academicYear->id,
        ]);

        // Create an admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $this->actingAs($admin);

        // Create a test CSV file
        $csvContent = "first_name,last_name,middle_name,lrn,guardian_name,guardian_email\nJohn,Doe,Smith,123456789012,Jane Doe,jane@test.com\nJane,Smith,Johnson,234567890123,John Smith,john@test.com";

        $file = UploadedFile::fake()->createWithContent('students.csv', $csvContent);

        $response = $this->post(route('students.import-csv.store'), [
            'csv_file' => $file,
            'section_id' => $section->id,
        ]);

        $response->assertRedirect(route('students.index'));

        // Check that students were created
        $this->assertDatabaseHas('students', [
            'lrn' => '123456789012',
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);

        $this->assertDatabaseHas('students', [
            'lrn' => '234567890123',
            'first_name' => 'Jane',
            'last_name' => 'Smith',
        ]);

        // Check that users were created
        $this->assertDatabaseHas('users', [
            'email' => 'john.doe@student.mnhs.edu',
            'role' => 'student',
        ]);
    }

    public function test_csv_import_handles_bom_characters(): void
    {
        // Create academic year, grade level, and section
        $academicYear = AcademicYear::create(['name' => '2026-2027', 'start_date' => '2026-06-01', 'end_date' => '2027-03-31']);
        $gradeLevel = GradeLevel::create(['name' => 'Grade 11', 'level_number' => 11]);
        $section = Section::create([
            'name' => '11-A',
            'grade_level_id' => $gradeLevel->id,
            'academic_year_id' => $academicYear->id,
        ]);

        // Create an admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin2@test.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $this->actingAs($admin);

        // Create a CSV file with BOM
        $bom = "\xEF\xBB\xBF";
        $csvContent = $bom."first_name,last_name,lrn\nAlice,Williams,345678901234";

        $file = UploadedFile::fake()->createWithContent('students_bom.csv', $csvContent);

        $response = $this->post(route('students.import-csv.store'), [
            'csv_file' => $file,
            'section_id' => $section->id,
        ]);

        $response->assertRedirect(route('students.index'));

        // Check that student was created despite BOM
        $this->assertDatabaseHas('students', [
            'lrn' => '345678901234',
            'first_name' => 'Alice',
            'last_name' => 'Williams',
        ]);
    }

    public function test_csv_import_returns_error_for_missing_columns(): void
    {
        // Create an admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin3@test.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $this->actingAs($admin);

        // Create a CSV file with missing columns
        $csvContent = "name,age\nJohn,20";

        $file = UploadedFile::fake()->createWithContent('invalid.csv', $csvContent);

        $response = $this->post(route('students.import-csv.store'), [
            'csv_file' => $file,
        ]);

        $response->assertRedirect(route('students.index'));

        // Check that no students were created
        $this->assertDatabaseCount('students', 0);
    }

    public function test_csv_import_handles_empty_lines(): void
    {
        // Create academic year, grade level, and section
        $academicYear = AcademicYear::create(['name' => '2026-2027', 'start_date' => '2026-06-01', 'end_date' => '2027-03-31']);
        $gradeLevel = GradeLevel::create(['name' => 'Grade 12', 'level_number' => 12]);
        $section = Section::create([
            'name' => '12-A',
            'grade_level_id' => $gradeLevel->id,
            'academic_year_id' => $academicYear->id,
        ]);

        // Create an admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin4@test.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $this->actingAs($admin);

        // Create a CSV file with empty lines
        $csvContent = "first_name,last_name,lrn\n\nBob,Johnson,456789012345\n\n";

        $file = UploadedFile::fake()->createWithContent('students_empty_lines.csv', $csvContent);

        $response = $this->post(route('students.import-csv.store'), [
            'csv_file' => $file,
            'section_id' => $section->id,
        ]);

        $response->assertRedirect(route('students.index'));

        // Check that student was created despite empty lines
        $this->assertDatabaseHas('students', [
            'lrn' => '456789012345',
            'first_name' => 'Bob',
            'last_name' => 'Johnson',
        ]);
    }
}
