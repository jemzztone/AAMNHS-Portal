<?php

namespace App\Actions\Audit;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class LogAuditEvent
{
    /**
     * Persist an immutable audit trail entry for a sensitive state change.
     *
     * @param  array<string, mixed>  $oldValues
     * @param  array<string, mixed>  $newValues
     */
    public function handle(
        string $event,
        ?Model $auditable,
        ?User $actor,
        array $oldValues = [],
        array $newValues = [],
        ?string $ip = null,
        ?string $userAgent = null,
    ): AuditLog {
        return AuditLog::create([
            'user_id' => $actor?->id,
            'event' => $event,
            'auditable_type' => $auditable?->getMorphClass(),
            'auditable_id' => $auditable?->getKey(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $ip,
            'user_agent' => $userAgent,
        ]);
    }
}
