<?php

namespace App\Actions\AdmissionSlip;

use App\Actions\Audit\LogAuditEvent;
use App\Models\AdmissionSlip;
use App\Models\User;

class ApproveAdmissionSlip
{
    public function handle(AdmissionSlip $slip, User $reviewer, ?string $reviewNotes, ?string $ip, ?string $userAgent): void
    {
        $previous = ['status' => $slip->status];

        $slip->update([
            'status' => 'approved',
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'review_notes' => $reviewNotes,
        ]);

        (new LogAuditEvent)->handle(
            event: 'admission_slip.approved',
            auditable: $slip,
            actor: $reviewer,
            oldValues: $previous,
            newValues: ['status' => $slip->status, 'reviewed_by' => $reviewer->id],
            ip: $ip,
            userAgent: $userAgent,
        );
    }
}
