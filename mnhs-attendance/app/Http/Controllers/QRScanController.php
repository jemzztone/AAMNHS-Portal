<?php

namespace App\Http\Controllers;

use App\Actions\Attendance\Exceptions\QrScanDeniedException;
use App\Actions\Attendance\ProcessQrScan;
use App\Actions\Audit\LogAuditEvent;
use App\Http\Requests\ScanStudentQrRequest;
use App\Models\AttendanceRecord;
use App\Models\GuardSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class QRScanController extends Controller
{
    public function index()
    {
        return Inertia::render('Guard/Scan', [
            'schedule' => $this->getSchedule(),
            'recentAttendance' => $this->getRecentAttendance(),
        ]);
    }

    public function recent()
    {
        return response()->json($this->getRecentAttendance());
    }

    public function scan(ScanStudentQrRequest $request)
    {
        try {
            $result = (new ProcessQrScan)->handle(
                $request->validated('qr_token'),
                $request->validated('lrn'),
                $request->ip(),
                $request->userAgent(),
                $this->getScheduledTime(),
                $request->validated('mode', 'auto'),
            );
        } catch (QrScanDeniedException $e) {
            return $this->deniedResponse($e);
        }

        $record = $result['record'];
        $action = $result['action'];

        $timeDisplay = $action === 'time_in' ? $record->time_in : $record->time_out;

        $message = $action === 'time_in'
            ? "Student {$record->status}. Time in recorded at {$record->time_in}."
            : "Student checked out. Time out recorded at {$record->time_out}.";

        return response()->json([
            'success' => true,
            'action' => $action,
            'message' => $message,
            'student' => $record->student->load('section.gradeLevel'),
            'record' => $record,
        ]);
    }

    /**
     * Remove a scanned attendance record so the guard can re-take it.
     * Only today's scan-sourced records may be removed from this screen.
     */
    public function destroy(Request $request, AttendanceRecord $attendanceRecord)
    {
        $isToday = $attendanceRecord->date === Carbon::now()->toDateString();
        $isScan  = $attendanceRecord->source === 'scan';

        if (! $isToday || ! $isScan) {
            return response()->json([
                'success' => false,
                'message' => 'Only today\'s scanned records can be removed.',
            ], 403);
        }

        $oldValues = [
            'status' => $attendanceRecord->status,
            'time_in' => $attendanceRecord->time_in,
            'time_out' => $attendanceRecord->time_out,
            'student_id' => $attendanceRecord->student_id,
        ];

        $attendanceRecord->delete();

        (new LogAuditEvent)->handle(
            event: 'attendance.removed',
            auditable: $attendanceRecord,
            actor: $request->user(),
            oldValues: $oldValues,
            newValues: [],
            ip: $request->ip(),
            userAgent: $request->userAgent(),
        );

        return response()->json(['success' => true]);
    }

    private function getScheduledTime(): ?string
    {
        $schedule = $this->getSchedule();

        return $schedule ? $schedule['time_in'].'|'.$schedule['time_out'] : null;
    }

    private function getSchedule(): ?array
    {
        $schedule = GuardSchedule::where('date', Carbon::now()->toDateString())->first();

        return $schedule ? [
            'time_in' => $schedule->time_in,
            'time_out' => $schedule->time_out,
        ] : null;
    }

    private function getRecentAttendance(): array
    {
        return AttendanceRecord::whereDate('date', Carbon::now()->toDateString())
            ->with('student.section')
            ->latest('time_in')
            ->limit(20)
            ->get()
            ->map(fn ($record) => [
                'id' => $record->id,
                'date' => $record->date,
                'student_name' => $record->student->full_name ?? '—',
                'lrn' => $record->student->lrn ?? '—',
                'section' => $record->student->section?->name ?? '—',
                'time_in' => $record->time_in,
                'time_out' => $record->time_out,
                'status' => $record->status,
                'source' => $record->source,
            ])
            ->toArray();
    }

    private function deniedResponse(QrScanDeniedException $e)
    {
        $status = match ($e->reason) {
            'invalid_qr' => 404,
            'inactive', 'admission_slip_required' => 403,
            'already_scanned', 'already_timed_in', 'not_timed_in' => 409,
            default => 403,
        };

        $payload = [
            'success' => false,
            'message' => $e->getMessage(),
        ];

        if ($e->student) {
            $payload['student'] = $e->student->load('section.gradeLevel');
        }

        if ($e->reason === 'admission_slip_required') {
            $payload['requires_admission_slip'] = true;
        }

        if ($e->existingRecord) {
            $payload['existing_record'] = $e->existingRecord->only([
                'id', 'student_id', 'date', 'status', 'time_in', 'time_out', 'source',
            ]);
        }

        return response()->json($payload, $status);
    }
}
