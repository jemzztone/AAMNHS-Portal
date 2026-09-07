<?php

namespace App\Mail;

use App\Models\Student;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GuardianAttendanceNotification extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  'time_in'|'time_out'  $action
     */
    public function __construct(
        public Student $student,
        public string $action,
        public string $date,
        public string $time,
        public string $status = 'present',
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->action === 'time_in'
            ? "Attendance Notification — {$this->student->full_name} has arrived at school"
            : "Attendance Notification — {$this->student->full_name} has left the school premises";

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.guardian-attendance');
    }
}
