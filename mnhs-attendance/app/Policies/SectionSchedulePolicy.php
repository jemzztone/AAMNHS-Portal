<?php

namespace App\Policies;

use App\Models\SectionSchedule;
use App\Models\User;

class SectionSchedulePolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'admin', 'teacher']);
    }

    public function view(User $user, SectionSchedule $sectionSchedule): bool
    {
        return in_array($user->role, ['super_admin', 'admin', 'teacher']);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'admin']);
    }

    public function update(User $user, SectionSchedule $sectionSchedule): bool
    {
        return in_array($user->role, ['super_admin', 'admin']);
    }

    public function delete(User $user, SectionSchedule $sectionSchedule): bool
    {
        return in_array($user->role, ['super_admin', 'admin']);
    }
}
