<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AcademicYearController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', AcademicYear::class);

        $academicYears = AcademicYear::withCount('sections')
            ->latest()
            ->paginate(25);

        return Inertia::render('AcademicYears/Index', [
            'academicYears' => $academicYears,
        ]);
    }

    public function create()
    {
        $this->authorize('create', AcademicYear::class);

        return Inertia::render('AcademicYears/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('create', AcademicYear::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        if ($request->boolean('is_current')) {
            AcademicYear::query()->update(['is_current' => false]);
        }

        AcademicYear::create([
            ...$validated,
            'is_current' => $request->boolean('is_current'),
        ]);

        return redirect()->route('academic-years.index')
            ->with('success', 'Academic year created successfully.');
    }

    public function show(AcademicYear $academicYear)
    {
        $this->authorize('view', $academicYear);

        $academicYear->load(['sections' => fn ($q) => $q->with('gradeLevel')]);

        return Inertia::render('AcademicYears/Show', [
            'academicYear' => $academicYear,
        ]);
    }

    public function edit(AcademicYear $academicYear)
    {
        $this->authorize('update', $academicYear);

        return Inertia::render('AcademicYears/Edit', [
            'academicYear' => $academicYear,
        ]);
    }

    public function update(Request $request, AcademicYear $academicYear)
    {
        $this->authorize('update', $academicYear);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        if ($request->boolean('is_current') && ! $academicYear->is_current) {
            AcademicYear::query()->where('id', '!=', $academicYear->id)->update(['is_current' => false]);
        }

        $academicYear->update([
            ...$validated,
            'is_current' => $request->boolean('is_current'),
        ]);

        return redirect()->route('academic-years.show', $academicYear)
            ->with('success', 'Academic year updated successfully.');
    }

    public function destroy(AcademicYear $academicYear)
    {
        $this->authorize('delete', $academicYear);

        $academicYear->delete();

        return redirect()->route('academic-years.index')
            ->with('success', 'Academic year deleted successfully.');
    }
}
