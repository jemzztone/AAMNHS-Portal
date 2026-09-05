<?php

namespace App\Actions\Section;

use App\Models\Section;
use App\Models\TeacherSectionAssignment;
use Illuminate\Validation\ValidationException;

class AssignTeacherToSection
{
    public function handle(Section $section, int $teacherId): TeacherSectionAssignment
    {
        $exists = TeacherSectionAssignment::where('section_id', $section->id)
            ->where('user_id', $teacherId)
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'teacher_id' => 'This teacher is already assigned to this section.',
            ]);
        }

        return TeacherSectionAssignment::create([
            'section_id' => $section->id,
            'user_id' => $teacherId,
        ]);
    }
}
