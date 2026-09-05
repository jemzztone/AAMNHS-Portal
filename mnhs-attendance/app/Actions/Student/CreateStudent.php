<?php

namespace App\Actions\Student;

use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateStudent
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function handle(array $data): Student
    {
        $user = User::create([
            'name' => "{$data['first_name']} {$data['last_name']}",
            'email' => $this->uniqueStudentEmail($data['first_name'], $data['last_name']),
            'password' => Hash::make('Password123!'),
            'role' => 'student',
            'is_active' => true,
            'force_password_change' => true,
            'email_verified_at' => now(),
        ]);

        return Student::create([
            ...$data,
            'user_id' => $user->id,
            'qr_token' => (string) Str::uuid(),
        ]);
    }

    private function uniqueStudentEmail(string $firstName, string $lastName): string
    {
        $base = strtolower($firstName).'.'.strtolower($lastName);
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
