<?php

namespace App\Http\Controllers;

use App\Models\Section;
use App\Models\SectionSchedule;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SectionScheduleController extends Controller
{
    public function index(Section $section)
    {
        $this->authorize('view', $section);

        $schedules = $section->schedules()->orderBy('day_of_week')->get();

        return Inertia::render('SectionSchedules/Index', [
            'section' => $section,
            'schedules' => $schedules,
        ]);
    }

    public function create(Section $section)
    {
        $this->authorize('update', $section);

        return Inertia::render('SectionSchedules/Create', [
            'section' => $section,
        ]);
    }

    public function store(Request $request, Section $section)
    {
        $this->authorize('update', $section);

        $validated = $request->validate([
            'day_of_week' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'grace_minutes' => 'required|integer|min:0|max:60',
        ]);

        $exists = $section->schedules()
            ->where('day_of_week', $validated['day_of_week'])
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'day_of_week' => 'A schedule already exists for this day.',
            ]);
        }

        $section->schedules()->create($validated);

        return redirect()->route('schedules.index', $section)
            ->with('success', 'Schedule created successfully.');
    }

    public function show(Section $section, SectionSchedule $sectionSchedule)
    {
        $this->authorize('view', $section);

        return Inertia::render('SectionSchedules/Show', [
            'section' => $section,
            'schedule' => $sectionSchedule,
        ]);
    }

    public function edit(Section $section, SectionSchedule $sectionSchedule)
    {
        $this->authorize('update', $section);

        return Inertia::render('SectionSchedules/Edit', [
            'section' => $section,
            'schedule' => $sectionSchedule,
        ]);
    }

    public function update(Request $request, Section $section, SectionSchedule $sectionSchedule)
    {
        $this->authorize('update', $section);

        $validated = $request->validate([
            'day_of_week' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'grace_minutes' => 'required|integer|min:0|max:60',
        ]);

        $conflict = $section->schedules()
            ->where('day_of_week', $validated['day_of_week'])
            ->where('id', '!=', $sectionSchedule->id)
            ->exists();

        if ($conflict) {
            return back()->withErrors([
                'day_of_week' => 'A schedule already exists for this day.',
            ]);
        }

        $sectionSchedule->update($validated);

        return redirect()->route('schedules.index', $section)
            ->with('success', 'Schedule updated successfully.');
    }

    public function destroy(Section $section, SectionSchedule $sectionSchedule)
    {
        $this->authorize('update', $section);

        $sectionSchedule->delete();

        return redirect()->route('schedules.index', $section)
            ->with('success', 'Schedule deleted successfully.');
    }
}
