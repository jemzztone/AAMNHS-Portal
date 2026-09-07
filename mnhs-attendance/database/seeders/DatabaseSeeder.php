<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\GradeLevel;
use App\Models\Section;
use App\Models\SectionSchedule;
use App\Models\Student;
use App\Models\TeacherSectionAssignment;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->createUsers();
        $this->createAcademicStructure();
        $this->createStudents();
    }

    private function createUsers(): void
    {
        $password = Hash::make('Password123!');

        User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@mnhs.edu',
            'password' => $password,
            'role' => 'super_admin',
            'is_active' => true,
            'force_password_change' => false,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'School Admin',
            'email' => 'admin@mnhs.edu',
            'password' => $password,
            'role' => 'admin',
            'is_active' => true,
            'force_password_change' => false,
            'email_verified_at' => now(),
        ]);

        $teacher = User::create([
            'name' => 'Juan Dela Cruz',
            'email' => 'teacher@mnhs.edu',
            'password' => $password,
            'role' => 'teacher',
            'is_active' => true,
            'force_password_change' => false,
            'email_verified_at' => now(),
        ]);

        $guard = User::create([
            'name' => 'Pedro Guard',
            'email' => 'guard@mnhs.edu',
            'password' => $password,
            'role' => 'security_guard',
            'is_active' => true,
            'force_password_change' => false,
            'email_verified_at' => now(),
        ]);

        $studentUser = User::create([
            'name' => 'Maria Santos',
            'email' => 'student@mnhs.edu',
            'password' => $password,
            'role' => 'student',
            'is_active' => true,
            'force_password_change' => false,
            'email_verified_at' => now(),
        ]);

        config(['mnhs.teacher_id' => $teacher->id]);
        config(['mnhs.student_user_id' => $studentUser->id]);
    }

    private function createAcademicStructure(): void
    {
        $academicYearId = (string) Str::uuid();
        $academicYear = AcademicYear::create([
            'id' => $academicYearId,
            'name' => '2026-2027',
            'start_date' => '2026-06-01',
            'end_date' => '2027-03-31',
            'is_current' => true,
        ]);

        // Grade levels are a fixed taxonomy, not tied to an academic year.
        $gradeLevels = [];
        foreach (GradeLevel::all() as $level) {
            $gradeLevels[$level->level_number] = $level;
        }

        foreach (range(7, 12) as $i) {
            $gradeLevels[$i] ??= GradeLevel::create([
                'id' => (string) Str::uuid(),
                'name' => "Grade {$i}",
                'level_number' => $i,
            ]);
        }

        $sections = [];
        foreach ($gradeLevels as $gradeLevel) {
            $sectionId = (string) Str::uuid();
            $section = Section::create([
                'id' => $sectionId,
                'name' => 'A',
                'grade_level_id' => $gradeLevel->id,
                'academic_year_id' => $academicYearId,
            ]);
            $sections[] = $section;

            $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            foreach ($days as $day) {
                SectionSchedule::create([
                    'id' => (string) Str::uuid(),
                    'section_id' => $sectionId,
                    'day_of_week' => $day,
                    'start_time' => '07:30',
                    'end_time' => '16:00',
                    'grace_minutes' => 15,
                ]);
            }
        }

        TeacherSectionAssignment::create([
            'id' => (string) Str::uuid(),
            'user_id' => config('mnhs.teacher_id'),
            'section_id' => $sections[0]->id,
        ]);

        config(['mnhs.sections' => $sections]);
        config(['mnhs.academic_year_id' => $academicYearId]);
    }

    private function createStudents(): void
    {
        $sections = config('mnhs.sections');
        $studentUser = User::find(config('mnhs.student_user_id'));

        $studentData = [
            ['first_name' => 'Maria', 'last_name' => 'Santos', 'lrn' => '136000000001'],
            ['first_name' => 'Jose', 'last_name' => 'Reyes', 'lrn' => '136000000002'],
            ['first_name' => 'Ana', 'last_name' => 'Cruz', 'lrn' => '136000000003'],
            ['first_name' => 'Pedro', 'last_name' => 'Garcia', 'lrn' => '136000000004'],
            ['first_name' => 'Rosa', 'last_name' => 'Mendoza', 'lrn' => '136000000005'],
        ];

        foreach ($studentData as $index => $data) {
            $user = $index === 0 ? $studentUser : User::create([
                'name' => "{$data['first_name']} {$data['last_name']}",
                'email' => strtolower($data['first_name']).'.'.strtolower($data['last_name']).'@student.mnhs.edu',
                'password' => Hash::make('Password123!'),
                'role' => 'student',
                'is_active' => true,
                'force_password_change' => false,
                'email_verified_at' => now(),
            ]);

            $sectionIndex = $index % count($sections);

            Student::create([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'lrn' => $data['lrn'],
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'section_id' => $sections[$sectionIndex]->id,
                'guardian_name' => "Parent of {$data['first_name']}",
                'guardian_email' => strtolower($data['first_name']).'.parent@email.com',
                'qr_token' => (string) Str::uuid(),
                'is_active' => true,
            ]);
        }
    }
}
