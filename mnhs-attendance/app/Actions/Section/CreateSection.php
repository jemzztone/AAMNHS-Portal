<?php

namespace App\Actions\Section;

use App\Models\AcademicYear;
use App\Models\Section;
use Illuminate\Validation\ValidationException;

class CreateSection
{
    public function handle(string $name, string $gradeLevelId): Section
    {
        $academicYearId = AcademicYear::current()->value('id') ?? AcademicYear::first()?->id;

        if (is_null($academicYearId)) {
            throw ValidationException::withMessages([
                'name' => 'No active academic year exists. Create one first.',
            ]);
        }

        return Section::create([
            'name' => $name,
            'grade_level_id' => $gradeLevelId,
            'academic_year_id' => $academicYearId,
        ]);
    }
}
