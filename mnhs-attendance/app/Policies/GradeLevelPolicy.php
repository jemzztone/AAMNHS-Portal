<?php

namespace App\Policies;

use App\Models\GradeLevel;
use App\Models\User;

class GradeLevelPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'admin', 'teacher']);
    }

    public function view(User $user, GradeLevel $gradeLevel): bool
    {
        return in_array($user->role, ['super_admin', 'admin', 'teacher']);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'admin']);
    }

    public function update(User $user, GradeLevel $gradeLevel): bool
    {
        return in_array($user->role, ['super_admin', 'admin']);
    }

    public function delete(User $user, GradeLevel $gradeLevel): bool
    {
        return in_array($user->role, ['super_admin', 'admin']);
    }
}
