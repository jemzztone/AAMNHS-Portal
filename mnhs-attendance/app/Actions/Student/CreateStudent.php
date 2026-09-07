<?php

namespace App\Actions\Student;

use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CreateStudent
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function handle(array $data, ?User $actor = null): Student
    {
        // Validate section access for teachers
        $sectionId = $data['section_id'] ?? null;
        if ($actor && $actor->role === 'teacher' && $sectionId) {
            if (! $actor->assignedSections()->where('sections.id', $sectionId)->exists()) {
                throw ValidationException::withMessages([
                    'section_id' => 'You can only add students to your assigned sections.',
                ]);
            }
        }

        if (! empty($data['photo'])) {
            $data['photo_path'] = $data['photo']->store('student-photos', 'public');
        }
        unset($data['photo']);

        $user = User::create([
            'name' => "{$data['first_name']} {$data['last_name']}",
            'email' => $this->uniqueStudentEmail($data['first_name'], $data['last_name']),
            'password' => Hash::make('Password123!'),
            'role' => 'student',
            'is_active' => true,
            'force_password_change' => false,
            'email_verified_at' => now(),
        ]);

        $studentData = array_merge($data, [
            'user_id' => $user->id,
            'qr_token' => (string) Str::uuid(),
        ]);

        // Ensure section_id is set even if null (for students without section)
        if (! isset($studentData['section_id'])) {
            $studentData['section_id'] = null;
        }

        return Student::create($studentData);
    }

    private function uniqueStudentEmail(string $firstName, string $lastName): string
    {
        $safeFirstName = strtolower(preg_replace('/\s+/', '.', $firstName));
        $safeLastName = strtolower(preg_replace('/\s+/', '.', $lastName));
        $base = $safeFirstName.'.'.$safeLastName;
        $email = $base.'@student.mnhs.edu';
        $suffix = 1;

        // Two students can share a name; never collide on the generated email.
        while (User::where('email', $email)->exists()) {
            $email = $base.$suffix.'@student.mnhs.edu';
            $suffix++;
        }

        return $email;
    }
}
