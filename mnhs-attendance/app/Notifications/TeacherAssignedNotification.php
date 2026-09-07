<?php

namespace App\Notifications;

use App\Models\Section;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TeacherAssignedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Section $section,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Section Assignment Notification')
            ->greeting("Hello {$notifiable->name},")
            ->line("You have been assigned to section **{$this->section->name}**.")
            ->line('You can now view attendance and manage students for this section.')
            ->action('View Dashboard', url('/dashboard'))
            ->line('If you have any questions, please contact the administration.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'teacher_assigned',
            'section_id' => $this->section->id,
            'section_name' => $this->section->name,
            'message' => "You have been assigned to section {$this->section->name}.",
        ];
    }
}
