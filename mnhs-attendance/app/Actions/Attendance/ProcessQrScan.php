<?php

namespace App\Actions\Attendance;

use App\Actions\Attendance\Exceptions\QrScanDeniedException;
use App\Actions\Audit\LogAuditEvent;
use App\Jobs\SendGuardianNotification;
use App\Jobs\SendWebPush;
use App\Models\AdmissionSlip;
use App\Models\AttendanceRecord;
use App\Models\GuardianNotification;
use App\Models\NotificationSetting;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Carbon;

class ProcessQrScan
{
    /**
     * Client-generated identifier for a scan, used to make offline sync
     * idempotent: replaying the same scan never creates a second record.
     */
    private ?string $clientReference = null;

    private ?Carbon $scannedAt = null;

    /**
     * Cooldown period (in seconds) after a time-in before the same student
     * can be time-out in auto mode. This prevents the scanner from treating
     * a fast consecutive scan of the same QR as a time-out.
     */
    private const AUTO_TIME_OUT_COOLDOWN_SECONDS = 3;

    public function handle(?string $qrToken, ?string $lrn, ?string $ip, ?string $userAgent, ?string $customTime = null, string $mode = 'auto', ?string $clientReference = null, ?string $scannedAt = null): array
    {
        $this->clientReference = $clientReference;
        $this->scannedAt = $scannedAt ? Carbon::parse($scannedAt) : null;

        // Neither identifier means the lookup below would silently match the
        // first student in the table, so reject it outright.
        if (blank($qrToken) && blank($lrn)) {
            throw new QrScanDeniedException('invalid_qr', 'Invalid QR code. Student not found.');
        }

        // A queued scan that already reached the server (for example the guard
        // retried after a flaky connection) must not be processed twice.
        if ($clientReference) {
            $alreadySynced = AttendanceRecord::withTrashed()
                ->where('client_reference', $clientReference)
                ->first();

            if ($alreadySynced) {
                return [
                    'action' => $alreadySynced->time_out ? 'time_out' : 'time_in',
                    'record' => $alreadySynced,
                    'duplicate' => true,
                ];
            }
        }

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

        $today = $this->scanTime()->toDateString();

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

            // Auto mode: only allow time-out after the cooldown period has
            // elapsed since the time-in, so a fast re-scan of the same QR
            // does not immediately log the student out.
            if ($mode === 'auto' && ! $this->canTimeOutNow($existing)) {
                return [
                    'action' => 'time_in',
                    'record' => $existing,
                    'duplicate' => false,
                    'cooldown' => true,
                    'message' => "{$student->full_name} timed in at {$existing->time_in}. Wait a moment before timing out.",
                ];
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
        $timeIn = $this->scanTime()->format('H:i:s');

        if ($restored) {
            // Re-take: revive the soft-deleted row in place so the unique
            // (student_id, date) constraint is never violated.
            $restored->update([
                'status' => $status,
                'time_in' => $timeIn,
                'time_out' => null,
                'recorded_by' => null,
                'client_reference' => $this->clientReference,
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
                'client_reference' => $this->clientReference,
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
        $this->notifyStudentPush($student, $record, 'time_in');
        $this->notifyAdminPush($student, $record, 'time_in');

        return [
            'action' => 'time_in',
            'record' => $record,
        ];
    }

    private function processTimeOut(AttendanceRecord $existing, Student $student, ?string $ip, ?string $userAgent, ?string $customTime): array
    {
        $timeOut = $this->scanTime()->format('H:i:s');

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
        $this->notifyStudentPush($student, $existing->fresh(), 'time_out');
        $this->notifyAdminPush($student, $existing->fresh(), 'time_out');

        return [
            'action' => 'time_out',
            'record' => $existing->fresh(),
        ];
    }

    /**
     * Push a notification to the student's own devices so they immediately see
     * that their attendance was recorded, even with the app closed.
     */
    private function notifyStudentPush(Student $student, AttendanceRecord $record, string $action): void
    {
        $user = $student->user;

        if (! $user) {
            return;
        }

        SendWebPush::dispatch($user->id, [
            'title' => $action === 'time_in' ? 'Attendance recorded' : 'Time out recorded',
            'body' => $action === 'time_in'
                ? "{$student->full_name} timed in at {$this->displayTime($record->time_in)}."
                : "{$student->full_name} timed out at {$this->displayTime($record->time_out)}.",
            'url' => '/attendance-records/'.$record->id,
            'tag' => 'attendance-'.$record->id,
        ]);
    }

    /**
     * Alert the administrators' devices about every gate scan so the office
     * sees arrivals and departures in real time, even with the app closed.
     */
    private function notifyAdminPush(Student $student, AttendanceRecord $record, string $action): void
    {
        $adminIds = User::query()
            ->whereIn('role', ['admin', 'super_admin'])
            ->where('is_active', true)
            ->pluck('id');

        if ($adminIds->isEmpty()) {
            return;
        }

        $section = $student->section?->name;
        $label = $action === 'time_in'
            ? "timed in at {$this->displayTime($record->time_in)}"
            : "timed out at {$this->displayTime($record->time_out)}";

        $payload = [
            'title' => $action === 'time_in' ? 'New arrival at the gate' : 'Departure at the gate',
            'body' => trim("{$student->full_name} {$label}".($section ? " — {$section}" : '')).'.',
            'url' => '/attendance-records/'.$record->id,
            'tag' => 'admin-attendance-'.$record->id,
        ];

        foreach ($adminIds as $adminId) {
            SendWebPush::dispatch($adminId, $payload);
        }
    }

    private function scanTime(): Carbon
    {
        return $this->scannedAt ?? now();
    }

    /**
     * In auto mode, a time-out is only allowed once the cooldown period has
     * elapsed since the student's time-in. This stops the scanner from
     * treating a fast re-scan as an immediate time-out.
     */
    private function canTimeOutNow(AttendanceRecord $record): bool
    {
        // copy() matters: scanTime() may return the shared $scannedAt instance,
        // and mutating it would shift the recorded timestamp for later scans.
        return $this->scanTime()->copy()
            ->subSeconds(self::AUTO_TIME_OUT_COOLDOWN_SECONDS)
            ->gte($record->time_in);
    }

    /**
     * Format a stored time for use in push/email copy (e.g. "7:30 AM").
     */
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

    private function requiresApprovedAdmissionSlip(Student $student): bool
    {
        $previousSchoolDay = $this->scanTime()->copy()->subDay();

        // Walk back to the most recent weekday (Monday -> Friday, Sunday -> Friday).
        while ($previousSchoolDay->isWeekend()) {
            $previousSchoolDay->subDay();
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
            ->where('day_of_week', $this->scanTime()->format('l'))
            ->first();

        if (! $schedule) {
            return 'present';
        }

        $scheduledStart = strtotime($schedule->start_time);
        $currentTime = strtotime($this->scanTime()->format('h:i:s A'));
        $graceSeconds = $schedule->grace_minutes * 60;

        return $currentTime > $scheduledStart + $graceSeconds ? 'late' : 'present';
    }

    private function notifyGuardian(Student $student, AttendanceRecord $record, string $status): void
    {
        if (! $student->guardian_email) {
            return;
        }

        $action = $status === 'time_out' ? 'time_out' : 'time_in';

        // Admins choose which attendance events reach guardians; the defaults
        // keep the previous behaviour (both arrival and departure notices).
        $settings = NotificationSetting::current();

        $skippedReason = null;

        if ($action === 'time_in' && ! $settings->notify_on_time_in) {
            $skippedReason = 'Arrival emails are turned off in notification preferences.';
        } elseif ($action === 'time_out' && ! $settings->notify_on_time_out) {
            $skippedReason = 'Departure emails are turned off in notification preferences.';
        } elseif ($settings->notify_on_late_only) {
            $skippedReason = $action === 'time_out'
                ? 'Only late arrivals are emailed, so departure emails are skipped.'
                : ($record->status !== 'late' ? 'Only late arrivals are emailed and this student arrived on time.' : null);
        }

        $date = $this->scanTime()->format('F j, Y');
        $time = $this->scanTime()->format('h:i A');

        $subject = $action === 'time_in'
            ? "Attendance Notification — {$student->full_name} has arrived at school"
            : "Attendance Notification — {$student->full_name} has left the school premises";

        $body = "Your child {$student->full_name} has ".($action === 'time_in' ? 'arrived at school' : 'left the school premises')." at {$time} on {$date}.";

        // A suppressed notice still gets a row so admins can see that the scan
        // happened and why no email went out to the guardian.
        if ($skippedReason !== null) {
            GuardianNotification::create([
                'student_id' => $student->id,
                'attendance_record_id' => $record->id,
                'guardian_email' => $student->guardian_email,
                'subject' => $subject,
                'body' => $body,
                'status' => 'skipped',
                'failure_reason' => $skippedReason,
            ]);

            return;
        }

        GuardianNotification::create([
            'student_id' => $student->id,
            'attendance_record_id' => $record->id,
            'guardian_email' => $student->guardian_email,
            'subject' => $subject,
            'body' => $body,
            'status' => 'pending',
        ]);

        // Queue the email so a slow or unreachable mail provider can never
        // block the gate scanner. The job flips the notification to sent or
        // failed once delivery has been attempted.
        SendGuardianNotification::dispatch(
            $student->guardian_email,
            $subject,
            $body,
            $record->id,
            $student->id,
        );
    }
}
