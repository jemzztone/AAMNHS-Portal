<?php

namespace App\Actions\Attendance;

use App\Actions\Attendance\Exceptions\QrScanDeniedException;
use App\Actions\Audit\LogAuditEvent;
use App\Jobs\SendGuardianNotification;
use App\Models\AdmissionSlip;
use App\Models\AttendanceRecord;
use App\Models\GuardianNotification;
use App\Models\Student;

class ProcessQrScan
{
    public function handle(string $qrToken, ?string $ip, ?string $userAgent): AttendanceRecord
    {
        $student = Student::where('qr_token', $qrToken)
            ->with('section')
            ->first();

        if (! $student) {
            throw new QrScanDeniedException('invalid_qr', 'Invalid QR code. Student not found.');
        }

        if (! $student->is_active) {
            throw new QrScanDeniedException('inactive', 'Student account is inactive.', $student);
        }

        $today = now()->toDateString();
        $existing = AttendanceRecord::where('student_id', $student->id)
            ->whereDate('date', $today)
            ->first();

        if ($existing) {
            throw new QrScanDeniedException('already_scanned', 'Student has already scanned in today.', $student, $existing);
        }

        if ($this->requiresApprovedAdmissionSlip($student)) {
            throw new QrScanDeniedException('admission_slip_required', 'No approved admission slip. Student cannot enter.', $student);
        }

        $status = $this->classifyStatus($student);
        $timeIn = now()->format('H:i:s');

        $record = AttendanceRecord::create([
            'student_id' => $student->id,
            'section_id' => $student->section_id,
            'date' => $today,
            'status' => $status,
            'time_in' => $timeIn,
            'source' => 'scan',
            'metadata' => [
                'ip_address' => $ip,
                'user_agent' => $userAgent,
            ],
        ]);

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

        return $record;
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

        GuardianNotification::create([
            'student_id' => $student->id,
            'attendance_record_id' => $record->id,
            'guardian_email' => $student->guardian_email,
            'subject' => "Attendance Notification - {$student->full_name}",
            'body' => "Your child {$student->full_name} has {$status} at ".now()->format('h:i A').' on '.now()->format('F j, Y').'.',
            'status' => 'pending',
        ]);

        SendGuardianNotification::dispatch(
            $student->guardian_email,
            "Attendance Notification - {$student->full_name}",
            "Your child {$student->full_name} has {$status} at ".now()->format('h:i A').' on '.now()->format('F j, Y').'.',
            $record->id,
            $student->id
        );
    }
}
