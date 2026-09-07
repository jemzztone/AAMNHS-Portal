<?php

namespace App\Actions\Attendance;

use App\Actions\Attendance\Exceptions\QrScanDeniedException;
use App\Actions\Audit\LogAuditEvent;
use App\Mail\GuardianAttendanceNotification;
use App\Models\AdmissionSlip;
use App\Models\AttendanceRecord;
use App\Models\GuardianNotification;
use App\Models\Student;
use Illuminate\Support\Facades\Mail;

class ProcessQrScan
{
    public function handle(?string $qrToken, ?string $lrn, ?string $ip, ?string $userAgent, ?string $customTime = null, string $mode = 'auto'): array
    {
        $student = Student::where(function ($query) use ($qrToken, $lrn) {
            if ($qrToken) {
                $query->where('qr_token', $qrToken);
            }
            if ($lrn) {
                $query->orWhere('lrn', $lrn);
            }
        })
            ->with('section')
            ->first();

        if (! $student) {
            throw new QrScanDeniedException('invalid_qr', 'Invalid QR code. Student not found.');
        }

        if (! $student->is_active) {
            throw new QrScanDeniedException('inactive', 'Student account is inactive.', $student);
        }

        $today = now()->toDateString();

        // Look for any record for today, including soft-deleted ones. A guard
        // may "re-take" attendance by deleting a record; the row still exists
        // in the table, so re-creating it would violate the unique
        // (student_id, date) constraint. We revive the deleted row and reuse
        // it for the new time-in instead.
        $restored = null;

        $existing = AttendanceRecord::withTrashed()
            ->where('student_id', $student->id)
            ->whereDate('date', $today)
            ->first();

        if ($existing && $existing->trashed()) {
            $restored = $existing;
            $existing = null;
        }

        $scheduledTimeIn = null;
        $scheduledTimeOut = null;
        if ($customTime && str_contains($customTime, '|')) {
            [$scheduledTimeIn, $scheduledTimeOut] = explode('|', $customTime);
        }

        if ($existing) {
            if ($existing->time_out) {
                throw new QrScanDeniedException('already_scanned', 'Student has already clocked out today.', $student, $existing);
            }

            if ($mode === 'time_in') {
                throw new QrScanDeniedException('already_timed_in', 'Student has already timed in today. Use Time Out to clock them out.', $student, $existing);
            }

            return $this->processTimeOut($existing, $student, $ip, $userAgent, $scheduledTimeOut);
        }

        if ($mode === 'time_out') {
            throw new QrScanDeniedException('not_timed_in', 'Student has not timed in today yet. Use Auto or Time In mode.', $student);
        }

        if ($this->requiresApprovedAdmissionSlip($student)) {
            throw new QrScanDeniedException('admission_slip_required', 'No approved admission slip. Student cannot enter.', $student);
        }

        return $this->processTimeIn($student, $today, $ip, $userAgent, $scheduledTimeIn, $restored);
    }

    private function processTimeIn(Student $student, string $today, ?string $ip, ?string $userAgent, ?string $customTime, ?AttendanceRecord $restored = null): array
    {
        $status = $this->classifyStatus($student);
        $timeIn = now()->format('H:i:s');

        if ($restored) {
            // Re-take: revive the soft-deleted row in place so the unique
            // (student_id, date) constraint is never violated.
            $restored->update([
                'status' => $status,
                'time_in' => $timeIn,
                'time_out' => null,
                'recorded_by' => null,
                'metadata' => [
                    'ip_address' => $ip,
                    'user_agent' => $userAgent,
                ],
            ]);
            $restored->restore();
            $record = $restored->fresh();
        } else {
            $record = AttendanceRecord::create([
                'student_id' => $student->id,
                'date' => $today,
                'status' => $status,
                'time_in' => $timeIn,
                'source' => 'scan',
                'metadata' => [
                    'ip_address' => $ip,
                    'user_agent' => $userAgent,
                ],
            ]);
        }

        (new LogAuditEvent)->handle(
            event: 'attendance.scan',
            auditable: $record,
            actor: $student->user,
            newValues: [
                'status' => $status,
                'time_in' => $timeIn,
                'student_id' => $student->id,
            ],
            ip: $ip,
            userAgent: $userAgent,
        );

        $this->notifyGuardian($student, $record, $status);

        return [
            'action' => 'time_in',
            'record' => $record,
        ];
    }

    private function processTimeOut(AttendanceRecord $existing, Student $student, ?string $ip, ?string $userAgent, ?string $customTime): array
    {
        $timeOut = now()->format('H:i:s');

        $existing->update([
            'time_out' => $timeOut,
            'metadata' => array_merge($existing->metadata ?? [], [
                'time_out_ip' => $ip,
                'time_out_user_agent' => $userAgent,
            ]),
        ]);

        (new LogAuditEvent)->handle(
            event: 'attendance.time_out',
            auditable: $existing,
            actor: $student->user,
            oldValues: [
                'time_out' => null,
            ],
            newValues: [
                'time_out' => $timeOut,
                'student_id' => $student->id,
            ],
            ip: $ip,
            userAgent: $userAgent,
        );

        $this->notifyGuardian($student, $existing->fresh(), 'time_out');

        return [
            'action' => 'time_out',
            'record' => $existing->fresh(),
        ];
    }

    private function requiresApprovedAdmissionSlip(Student $student): bool
    {
        $previousSchoolDay = now()->subDay();

        if ($previousSchoolDay->isWeekend()) {
            $previousSchoolDay = now()->subDays(3);
        }

        $wasAbsent = AttendanceRecord::where('student_id', $student->id)
            ->whereDate('date', $previousSchoolDay->toDateString())
            ->where('status', 'absent')
            ->exists();

        if (! $wasAbsent) {
            return false;
        }

        return ! AdmissionSlip::where('student_id', $student->id)
            ->whereDate('absence_date', $previousSchoolDay->toDateString())
            ->approved()
            ->exists();
    }

    private function classifyStatus(Student $student): string
    {
        $schedule = $student->section?->schedules
            ->where('day_of_week', now()->format('l'))
            ->first();

        if (! $schedule) {
            return 'present';
        }

        $scheduledStart = strtotime($schedule->start_time);
        $currentTime = strtotime(now()->format('H:i:s'));
        $graceSeconds = $schedule->grace_minutes * 60;

        return $currentTime > $scheduledStart + $graceSeconds ? 'late' : 'present';
    }

    private function notifyGuardian(Student $student, AttendanceRecord $record, string $status): void
    {
        if (! $student->guardian_email) {
            return;
        }

        $action = $status === 'time_out' ? 'time_out' : 'time_in';
        $date = now()->format('F j, Y');
        $time = now()->format('h:i A');
        $statusLabel = $action === 'time_out' ? 'Checked out' : ucfirst($record->status);

        $subject = $action === 'time_in'
            ? "Attendance Notification — {$student->full_name} has arrived at school"
            : "Attendance Notification — {$student->full_name} has left the school premises";

        GuardianNotification::create([
            'student_id' => $student->id,
            'attendance_record_id' => $record->id,
            'guardian_email' => $student->guardian_email,
            'subject' => $subject,
            'body' => "Your child {$student->full_name} has ".($action === 'time_in' ? 'arrived at school' : 'left the school premises')." at {$time} on {$date}.",
            'status' => 'pending',
        ]);

        try {
            // Sent synchronously so guardians receive the notice in real-time
            // the moment a student scans in or out at the gate.
            Mail::to($student->guardian_email)->send(
                new GuardianAttendanceNotification(
                    student: $student,
                    action: $action,
                    date: $date,
                    time: $time,
                    status: $statusLabel,
                ),
            );

            GuardianNotification::where('student_id', $student->id)
                ->where('attendance_record_id', $record->id)
                ->where('status', 'pending')
                ->update(['status' => 'sent', 'sent_at' => now()]);
        } catch (\Exception $e) {
            GuardianNotification::where('student_id', $student->id)
                ->where('attendance_record_id', $record->id)
                ->where('status', 'pending')
                ->update(['status' => 'failed', 'failure_reason' => $e->getMessage()]);
        }
    }
}
