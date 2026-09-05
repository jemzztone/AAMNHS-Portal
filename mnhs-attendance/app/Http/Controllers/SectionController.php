<?php

namespace App\Http\Controllers;

use App\Actions\Section\AssignTeacherToSection;
use App\Actions\Section\CreateSection;
use App\Actions\Section\UpdateSection;
use App\Http\Requests\AssignTeacherRequest;
use App\Http\Requests\SaveSectionRequest;
use App\Models\GradeLevel;
use App\Models\Section;
use App\Models\TeacherSectionAssignment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SectionController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Section::class);

        $sections = Section::with(['gradeLevel', 'teachers'])
            ->when($request->search, fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->paginate($request->get('per_page', 25));

        return Inertia::render('Sections/Index', [
            'sections' => $sections,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        $this->authorize('create', Section::class);

        return Inertia::render('Sections/Create', [
            'gradeLevels' => GradeLevel::all(),
            'teachers' => User::where('role', 'teacher')->get(),
        ]);
    }

    public function store(SaveSectionRequest $request)
    {
        $section = (new CreateSection)->handle($request->validated('name'), $request->validated('grade_level_id'));

        return redirect()->route('sections.show', $section)->with('success', 'Section created successfully.');
    }

    public function show(Section $section)
    {
        $this->authorize('view', $section);

        $section->load(['gradeLevel', 'teachers', 'students', 'schedules']);

        return Inertia::render('Sections/Show', [
            'section' => $section,
            'teachers' => User::where('role', 'teacher')->orderBy('name')->get(),
        ]);
    }

    public function edit(Section $section)
    {
        $this->authorize('update', $section);

        return Inertia::render('Sections/Edit', [
            'section' => $section,
            'gradeLevels' => GradeLevel::all(),
            'teachers' => User::where('role', 'teacher')->get(),
        ]);
    }

    public function update(SaveSectionRequest $request, Section $section)
    {
        (new UpdateSection)->handle($section, $request->validated());

        return redirect()->route('sections.show', $section)->with('success', 'Section updated successfully.');
    }

    public function destroy(Section $section)
    {
        $this->authorize('delete', $section);

        $section->delete();

        return redirect()->route('sections.index')->with('success', 'Section deleted successfully.');
    }

    public function assignTeacher(AssignTeacherRequest $request, Section $section)
    {
        (new AssignTeacherToSection)->handle($section, (int) $request->validated('teacher_id'));

        return back()->with('success', 'Teacher assigned successfully.');
    }

    public function removeTeacher(Section $section, TeacherSectionAssignment $assignment)
    {
        $this->authorize('assignTeacher', $section);

        $assignment->delete();

        return back()->with('success', 'Teacher removed successfully.');
    }
}
