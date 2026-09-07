<?php

namespace App\Jobs;

use App\Mail\GuardianAttendanceNotification;
use App\Models\GuardianNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendGuardianNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(
        public string $email,
        public string $subject,
        public string $body,
        public string $attendanceRecordId,
        public string $studentId,
    ) {
        $this->onQueue('emails');
    }

    public function handle(): void
    {
        $notification = GuardianNotification::with('student')
            ->where('student_id', $this->studentId)
            ->where('attendance_record_id', $this->attendanceRecordId)
            ->where('status', 'pending')
            ->first();

        if (! $notification) {
            return;
        }

        try {
            $student = $notification->student;
            $record = $notification->attendanceRecord;
            $action = $record && $record->time_out ? 'time_out' : 'time_in';

            Mail::to($this->email)->send(new GuardianAttendanceNotification(
                student: $student,
                action: $action,
                date: $notification->created_at->format('F j, Y'),
                time: ($action === 'time_in' ? $record?->time_in : $record?->time_out) ?: now()->format('h:i A'),
                status: $action === 'time_out' ? 'Checked out' : ucfirst($record?->status ?? 'Present'),
            ));

            $notification->update([
                'status' => 'sent',
                'sent_at' => now(),
                'attempts' => $notification->attempts + 1,
            ]);
        } catch (\Exception $e) {
            $notification->update([
                'status' => 'failed',
                'failure_reason' => $e->getMessage(),
                'attempts' => $notification->attempts + 1,
            ]);

            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        $notification = GuardianNotification::where('student_id', $this->studentId)
            ->where('attendance_record_id', $this->attendanceRecordId)
            ->first();

        if ($notification) {
            $notification->update([
                'status' => 'failed',
                'failure_reason' => $exception->getMessage(),
            ]);
        }
    }
}
