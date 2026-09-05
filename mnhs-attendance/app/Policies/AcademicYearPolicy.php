<?php

namespace App\Policies;

use App\Models\AcademicYear;
use App\Models\User;

class AcademicYearPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'admin', 'teacher']);
    }

    public function view(User $user, AcademicYear $academicYear): bool
    {
        return in_array($user->role, ['super_admin', 'admin', 'teacher']);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'admin']);
    }

    public function update(User $user, AcademicYear $academicYear): bool
    {
        return in_array($user->role, ['super_admin', 'admin']);
    }

    public function delete(User $user, AcademicYear $academicYear): bool
    {
        return in_array($user->role, ['super_admin', 'admin']);
    }
}
