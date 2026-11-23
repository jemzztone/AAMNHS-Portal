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

    /**
     * Full page view of the scans still queued in this device's IndexedDB.
     * The list itself is read client-side; the server only renders the shell.
     */
    public function offlineScans()
    {
        return Inertia::render('Guard/OfflineScans');
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

        $message = $action === 'time_in'
            ? "Student {$record->status}. Time in recorded at {$this->displayTime($record->time_in)}."
            : "Student checked out. Time out recorded at {$this->displayTime($record->time_out)}.";

        return response()->json([
            'success' => true,
            'action' => $action,
            'message' => $message,
            'student' => $record->student->load('section.gradeLevel'),
            'record' => $record,
        ]);
    }

    /**
     * Replay scans that the guard recorded while the device was offline.
     *
     * Each queued scan carries a client-generated id; a replay of a scan that
     * already reached the server is acknowledged instead of recorded twice.
     */
    public function sync(Request $request)
    {
        if ($request->user()?->role !== 'security_guard') {
            abort(403);
        }

        $data = $request->validate([
            'scans' => 'required|array|max:200',
            'scans.*.client_id' => 'required|string|max:64',
            'scans.*.qr_token' => 'nullable|string|max:255',
            'scans.*.lrn' => 'nullable|string|max:20',
            'scans.*.mode' => 'nullable|string|in:auto,time_in,time_out',
            'scans.*.scanned_at' => 'nullable|date',
        ]);

        $scheduledTime = $this->getScheduledTime();
        $results = [];

        foreach ($data['scans'] as $scan) {
            if (blank($scan['qr_token'] ?? null) && blank($scan['lrn'] ?? null)) {
                $results[] = [
                    'client_id' => $scan['client_id'],
                    'success' => false,
                    'reason' => 'invalid_qr',
                    'message' => 'Invalid QR code. Student not found.',
                ];

                continue;
            }

            try {
                $result = (new ProcessQrScan)->handle(
                    $scan['qr_token'] ?? null,
                    $scan['lrn'] ?? null,
                    $request->ip(),
                    $request->userAgent(),
                    $scheduledTime,
                    $scan['mode'] ?? 'auto',
                    $scan['client_id'],
                    $scan['scanned_at'] ?? null,
                );

                $record = $result['record'];

                $results[] = [
                    'client_id' => $scan['client_id'],
                    'success' => true,
                    'duplicate' => $result['duplicate'] ?? false,
                    'action' => $result['action'],
                    'message' => $result['action'] === 'time_in'
                        ? "Student {$record->status}. Time in recorded at {$this->displayTime($record->time_in)}."
                        : "Student checked out. Time out recorded at {$this->displayTime($record->time_out)}.",
                ];
            } catch (QrScanDeniedException $e) {
                $results[] = [
                    'client_id' => $scan['client_id'],
                    'success' => false,
                    'reason' => $e->reason,
                    'message' => $e->getMessage(),
                ];
            }
        }

        return response()->json(['results' => $results]);
    }

    /**
     * Remove a scanned attendance record so the guard can re-take it.
     * Only today's scan-sourced records may be removed from this screen.
     */
    public function destroy(Request $request, AttendanceRecord $attendanceRecord)
    {
        // `date` is cast to Carbon, so compare date strings rather than the
        // object itself; strict comparison would always fail and 403 every
        // delete/re-take attempt.
        $isToday = $attendanceRecord->date?->toDateString() === Carbon::now()->toDateString();
        $isScan = $attendanceRecord->source === 'scan';

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

    private function displayTime(?string $time): string
    {
        if (blank($time)) {
            return '—';
        }

        try {
            return Carbon::parse($time)->format('g:i A');
        } catch (\Throwable) {
            return $time;
        }
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
