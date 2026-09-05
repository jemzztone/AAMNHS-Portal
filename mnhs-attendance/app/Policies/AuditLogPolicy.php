<?php

namespace App\Policies;

use App\Models\AuditLog;
use App\Models\User;

class AuditLogPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'admin']);
    }

    public function view(User $user, AuditLog $auditLog): bool
    {
        return in_array($user->role, ['super_admin', 'admin']);
    }
}
