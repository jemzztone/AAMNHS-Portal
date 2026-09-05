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

        $query = AttendanceRecord::with(['student', 'section'])
            ->forDate($date)
            ->when($request->section_id, fn ($q, $sectionId) => $q->forSection($sectionId))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status));

        if ($request->user()->role === 'teacher') {
            $sectionIds = $request->user()->assignedSections()->pluck('sections.id');
            $query->whereIn('section_id', $sectionIds);
        }

        $records = $query->latest('time_in')->paginate($request->get('per_page', 25));

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

        $startDate = $request->get('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->get('end_date', now()->toDateString());

        $csv = (new ExportAttendanceCsv)->handle(
            $request->user(),
            $startDate,
            $endDate,
            $request->get('section_id'),
        );

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"attendance_export_{$startDate}_{$endDate}.csv\"",
        ]);
    }
}
