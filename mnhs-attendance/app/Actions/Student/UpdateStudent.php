<?php

namespace App\Actions\Student;

use App\Models\Student;

class UpdateStudent
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function handle(Student $student, array $data): Student
    {
        $student->update($data);

        // Keep the linked login account's display name in sync with the record.
        $student->user?->update([
            'name' => "{$student->first_name} {$student->last_name}",
        ]);

        return $student;
    }
}
