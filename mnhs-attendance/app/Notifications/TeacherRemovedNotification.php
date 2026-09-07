<?php

namespace App\Notifications;

use App\Models\Section;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TeacherRemovedNotification extends Notification implements ShouldQueue
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
            ->subject('Section Removal Notification')
            ->greeting("Hello {$notifiable->name},")
            ->line("You have been removed from section **{$this->section->name}**.")
            ->line('You will no longer have access to this section\'s attendance and student data.')
            ->action('View Dashboard', url('/dashboard'))
            ->line('If you have any questions, please contact the administration.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'teacher_removed',
            'section_id' => $this->section->id,
            'section_name' => $this->section->name,
            'message' => "You have been removed from section {$this->section->name}.",
        ];
    }
}
