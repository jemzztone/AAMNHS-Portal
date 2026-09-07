<?php

namespace App\Http\Controllers;

use App\Http\Requests\AssignTeacherRequest;
use App\Models\Section;
use App\Models\TeacherSectionAssignment;
use App\Models\User;
use App\Notifications\TeacherAssignedNotification;
use App\Notifications\TeacherRemovedNotification;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeacherController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $teachers = User::where('role', 'teacher')
            ->with(['assignedSections.gradeLevel'])
            ->when($request->search, fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->get();

        $sections = Section::with('gradeLevel')->orderBy('name')->get();

        return Inertia::render('Teachers/Index', [
            'teachers' => $teachers,
            'sections' => $sections,
            'filters' => $request->only(['search']),
        ]);
    }

    public function assign(AssignTeacherRequest $request)
    {
        $this->authorize('create', User::class);

        $validated = $request->validated();

        if (empty($validated['section_id'])) {
            return back()->withErrors(['section_id' => 'The section id field is required.']);
        }

        $teacher = User::findOrFail($validated['teacher_id']);
        $section = Section::findOrFail($validated['section_id']);

        $softDeleted = TeacherSectionAssignment::onlyTrashed()
            ->where('user_id', $teacher->id)
            ->where('section_id', $section->id)
            ->first();

        if ($softDeleted) {
            $softDeleted->restore();
        } else {
            $exists = TeacherSectionAssignment::where('user_id', $teacher->id)
                ->where('section_id', $section->id)
                ->exists();

            if ($exists) {
                return back()->withErrors(['section_id' => 'This teacher is already assigned to this section.']);
            }

            try {
                TeacherSectionAssignment::create([
                    'user_id' => $teacher->id,
                    'section_id' => $section->id,
                ]);
            } catch (QueryException $e) {
                if ($e->errorInfo[1] == 1062) {
                    return back()->withErrors(['section_id' => 'This teacher is already assigned to this section.']);
                }
                throw $e;
            }
        }

        $teacher->notify(new TeacherAssignedNotification($section));

        return back()->with('success', "{$teacher->name} assigned to {$section->name}.");
    }

    public function remove(Request $request)
    {
        $this->authorize('create', User::class);

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'section_id' => 'required|exists:sections,id',
        ]);

        $assignment = TeacherSectionAssignment::withoutGlobalScopes()
            ->where('user_id', $request->user_id)
            ->where('section_id', $request->section_id)
            ->firstOrFail();

        $teacher = User::findOrFail($assignment->user_id);
        $section = Section::findOrFail($assignment->section_id);

        $assignment->delete();

        $teacher->notify(new TeacherRemovedNotification($section));

        return back()->with('success', "{$teacher->name} removed from {$section->name}.");
    }
}
