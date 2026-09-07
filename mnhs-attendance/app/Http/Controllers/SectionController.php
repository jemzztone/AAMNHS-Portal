<?php

namespace App\Http\Controllers;

use App\Actions\Section\CreateSection;
use App\Actions\Section\UpdateSection;
use App\Http\Requests\AssignTeacherRequest;
use App\Http\Requests\SaveSectionRequest;
use App\Models\GradeLevel;
use App\Models\Section;
use App\Models\TeacherSectionAssignment;
use App\Models\User;
use App\Notifications\TeacherAssignedNotification;
use App\Notifications\TeacherRemovedNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SectionController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Section::class);

        $query = Section::with(['gradeLevel', 'teachers'])
            ->withCount('students')
            ->when($request->search, fn ($q, $search) => $q->where('name', 'like', "%{$search}%"));

        if ($request->user()->role === 'teacher') {
            $assignedIds = $request->user()->assignedSections()->pluck('sections.id');
            $query->whereIn('sections.id', $assignedIds);
        }

        $sections = $query->paginate($request->get('per_page', 5));

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
        ]);
    }

    public function edit(Section $section)
    {
        $this->authorize('update', $section);

        return Inertia::render('Sections/Edit', [
            'section' => $section,
            'gradeLevels' => GradeLevel::all(),
        ]);
    }

    public function update(SaveSectionRequest $request, Section $section)
    {
        $this->authorize('update', $section);

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
        $this->authorize('assignTeacher', $section);

        $teacherId = (int) $request->validated('teacher_id');

        $softDeleted = TeacherSectionAssignment::onlyTrashed()
            ->where('section_id', $section->id)
            ->where('user_id', $teacherId)
            ->first();

        if ($softDeleted) {
            $softDeleted->restore();
        } else {
            $exists = TeacherSectionAssignment::where('section_id', $section->id)
                ->where('user_id', $teacherId)
                ->exists();

            if ($exists) {
                return back()->withErrors(['teacher_id' => 'This teacher is already assigned to this section.']);
            }

            TeacherSectionAssignment::create([
                'section_id' => $section->id,
                'user_id' => $teacherId,
            ]);
        }

        $teacher = User::findOrFail($teacherId);
        $teacher->notify(new TeacherAssignedNotification($section));

        return back()->with('success', "{$teacher->name} assigned to {$section->name}.");
    }

    public function removeTeacher(Section $section, TeacherSectionAssignment $assignment)
    {
        $this->authorize('assignTeacher', $section);

        $teacher = User::findOrFail($assignment->user_id);

        $assignment->delete();

        $teacher->notify(new TeacherRemovedNotification($section));

        return back()->with('success', "{$teacher->name} removed from {$section->name}.");
    }
}
