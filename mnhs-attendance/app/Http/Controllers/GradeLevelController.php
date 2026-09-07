<?php

namespace App\Http\Controllers;

use App\Models\GradeLevel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GradeLevelController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', GradeLevel::class);

        $gradeLevels = GradeLevel::withCount('sections')
            ->orderBy('level_number')
            ->paginate(5);

        return Inertia::render('GradeLevels/Index', [
            'gradeLevels' => $gradeLevels,
        ]);
    }

    public function create()
    {
        $this->authorize('create', GradeLevel::class);

        return Inertia::render('GradeLevels/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('create', GradeLevel::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'level_number' => 'required|integer|min:1|max:12|unique:grade_levels,level_number',
        ]);

        GradeLevel::create($validated);

        return redirect()->route('grade-levels.index')
            ->with('success', 'Grade level created successfully.');
    }

    public function show(GradeLevel $gradeLevel)
    {
        $this->authorize('view', $gradeLevel);

        $gradeLevel->load('sections');

        return Inertia::render('GradeLevels/Show', [
            'gradeLevel' => $gradeLevel,
        ]);
    }

    public function edit(GradeLevel $gradeLevel)
    {
        $this->authorize('update', $gradeLevel);

        return Inertia::render('GradeLevels/Edit', [
            'gradeLevel' => $gradeLevel,
        ]);
    }

    public function update(Request $request, GradeLevel $gradeLevel)
    {
        $this->authorize('update', $gradeLevel);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'level_number' => 'required|integer|min:1|max:12|unique:grade_levels,level_number,'.$gradeLevel->id,
        ]);

        $gradeLevel->update($validated);

        return redirect()->route('grade-levels.show', $gradeLevel)
            ->with('success', 'Grade level updated successfully.');
    }

    public function destroy(GradeLevel $gradeLevel)
    {
        $this->authorize('delete', $gradeLevel);

        $gradeLevel->delete();

        return redirect()->route('grade-levels.index')
            ->with('success', 'Grade level deleted successfully.');
    }
}
