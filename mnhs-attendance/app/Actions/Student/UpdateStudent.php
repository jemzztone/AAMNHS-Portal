<?php

namespace App\Actions\Student;

use App\Models\Student;
use Illuminate\Support\Facades\Storage;

class UpdateStudent
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function handle(Student $student, array $data): Student
    {
        // If a photo is included, store it and replace any previous one.
        if (! empty($data['photo'])) {
            if ($student->photo_path) {
                Storage::disk('public')->delete($student->photo_path);
            }
            $data['photo_path'] = $data['photo']->store('student-photos', 'public');
        }
        unset($data['photo']);

        $student->update($data);

        // Keep the linked login account's display name in sync with the record.
        $student->user?->update([
            'name' => "{$student->first_name} {$student->last_name}",
        ]);

        return $student;
    }
}
