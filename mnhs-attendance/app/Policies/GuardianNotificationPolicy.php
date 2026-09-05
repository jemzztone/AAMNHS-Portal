<?php

namespace App\Policies;

use App\Models\GuardianNotification;
use App\Models\User;

class GuardianNotificationPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'admin']);
    }

    public function view(User $user, GuardianNotification $guardianNotification): bool
    {
        return in_array($user->role, ['super_admin', 'admin']);
    }
}
