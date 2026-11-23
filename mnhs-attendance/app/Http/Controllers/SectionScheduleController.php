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

    // The route parameter is {schedule}, so the argument must be named
    // $schedule for Laravel's implicit model binding to resolve it.
    public function show(Section $section, SectionSchedule $schedule)
    {
        $this->authorize('view', $section);
        $this->ensureScheduleBelongsToSection($section, $schedule);

        return Inertia::render('SectionSchedules/Show', [
            'section' => $section,
            'schedule' => $schedule,
        ]);
    }

    public function edit(Section $section, SectionSchedule $schedule)
    {
        $this->authorize('update', $section);
        $this->ensureScheduleBelongsToSection($section, $schedule);

        return Inertia::render('SectionSchedules/Edit', [
            'section' => $section,
            'schedule' => $schedule,
        ]);
    }

    public function update(Request $request, Section $section, SectionSchedule $schedule)
    {
        $this->authorize('update', $section);
        $this->ensureScheduleBelongsToSection($section, $schedule);

        $validated = $request->validate([
            'day_of_week' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'grace_minutes' => 'required|integer|min:0|max:60',
        ]);

        $conflict = $section->schedules()
            ->where('day_of_week', $validated['day_of_week'])
            ->where('id', '!=', $schedule->id)
            ->exists();

        if ($conflict) {
            return back()->withErrors([
                'day_of_week' => 'A schedule already exists for this day.',
            ]);
        }

        $schedule->update($validated);

        return redirect()->route('schedules.index', $section)
            ->with('success', 'Schedule updated successfully.');
    }

    public function destroy(Section $section, SectionSchedule $schedule)
    {
        $this->authorize('update', $section);
        $this->ensureScheduleBelongsToSection($section, $schedule);

        $schedule->delete();

        return redirect()->route('schedules.index', $section)
            ->with('success', 'Schedule deleted successfully.');
    }

    /**
     * Nested routes bind {schedule} independently of {section}; without this
     * check a teacher assigned to section A could edit section B's schedule.
     */
    private function ensureScheduleBelongsToSection(Section $section, SectionSchedule $schedule): void
    {
        abort_unless((string) $schedule->section_id === (string) $section->id, 404);
    }
}
