<?php

namespace App\Http\Controllers;

use App\Models\Section;
use App\Models\TeacherSectionAssignment;

class TeacherSectionAssignmentController extends Controller
{
    public function destroy(Section $section, TeacherSectionAssignment $assignment)
    {
        $this->authorize('assignTeacher', $section);

        $assignment->delete();

        return back()->with('success', 'Teacher removed from section.');
    }
}
