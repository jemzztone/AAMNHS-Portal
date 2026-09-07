<?php

namespace App\Http\Controllers;

use App\Models\AttendanceRecord;
use Inertia\Inertia;

class AttendanceRecordController extends Controller
{
    public function show(AttendanceRecord $attendanceRecord)
    {
        $this->authorize('view', $attendanceRecord);

        $attendanceRecord->load(['student.section', 'recordedBy']);

        return Inertia::render('Attendance/Show', [
            'record' => $attendanceRecord,
        ]);
    }
}
