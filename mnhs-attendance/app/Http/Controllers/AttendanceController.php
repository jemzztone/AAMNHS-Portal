<?php

namespace App\Http\Controllers;

use App\Actions\Attendance\ExportAttendanceCsv;
use App\Actions\Attendance\RecordManualAttendance;
use App\Http\Requests\ManualAttendanceRequest;
use App\Models\AttendanceRecord;
use App\Models\Section;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', AttendanceRecord::class);

        $date = $request->get('date', now()->toDateString());

        $query = AttendanceRecord::with('student.section')
            ->forDate($date)
            ->when($request->section_id, fn ($q, $sectionId) => $q->forSection($sectionId))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status));

        if ($request->user()->role === 'teacher') {
            $sectionIds = $request->user()->assignedSections()->pluck('sections.id');
            $query->whereHas('student', fn ($q) => $q->whereIn('section_id', $sectionIds));
        }

        $records = $query->latest('time_in')->paginate(min(max((int) $request->get('per_page', 5), 1), 100));

        return Inertia::render('Attendance/Index', [
            'records' => $records,
            'sections' => $request->user()->role === 'teacher'
                ? $request->user()->assignedSections
                : Section::all(),
            'filters' => $request->only(['date', 'section_id', 'status']),
        ]);
    }

    public function manualEntry(ManualAttendanceRequest $request)
    {
        (new RecordManualAttendance)->handle(
            $request->user(),
            $request->validated(),
            $request->ip(),
            $request->userAgent(),
        );

        return back()->with('success', 'Attendance recorded successfully.');
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', AttendanceRecord::class);

        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'section_id' => 'nullable|exists:sections,id',
        ]);

        $startDate = $validated['start_date'] ?? now()->startOfMonth()->toDateString();
        $endDate = $validated['end_date'] ?? now()->toDateString();

        $csv = (new ExportAttendanceCsv)->handle(
            $request->user(),
            $startDate,
            $endDate,
            $validated['section_id'] ?? null,
        );

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"attendance_export_{$startDate}_{$endDate}.csv\"",
        ]);
    }
}
