<?php

namespace App\Actions\AdmissionSlip;

use App\Actions\Audit\LogAuditEvent;
use App\Models\AdmissionSlip;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;

class CreateAdmissionSlip
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function handle(User $studentUser, array $data, ?UploadedFile $attachment, ?string $ip, ?string $userAgent): AdmissionSlip
    {
        $student = $studentUser->student;

        if (! $student) {
            throw ValidationException::withMessages([
                'reason' => 'No student profile is linked to this account.',
            ]);
        }

        $attachmentPath = $attachment?->store('admission-slips', 'private');

        $slip = AdmissionSlip::create([
            'student_id' => $student->id,
            'absence_date' => $data['absence_date'],
            'reason' => $data['reason'],
            'guardian_reference' => $data['guardian_reference'] ?? null,
            'attachment_path' => $attachmentPath,
            'status' => 'pending',
        ]);

        (new LogAuditEvent)->handle(
            event: 'admission_slip.created',
            auditable: $slip,
            actor: $studentUser,
            newValues: [
                'absence_date' => $slip->absence_date,
                'reason' => $slip->reason,
                'status' => $slip->status,
            ],
            ip: $ip,
            userAgent: $userAgent,
        );

        return $slip;
    }
}
