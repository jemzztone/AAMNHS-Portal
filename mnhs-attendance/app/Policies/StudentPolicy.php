<?php

namespace App\Policies;

use App\Models\Student;
use App\Models\User;

class StudentPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'admin', 'teacher']);
    }

    public function viewAnalytics(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'admin', 'teacher']);
    }

    public function view(User $user, Student $student): bool
    {
        if (in_array($user->role, ['super_admin', 'admin'])) {
            return true;
        }

        if ($user->role === 'teacher') {
            return $user->assignedSections()->where('sections.id', $student->section_id)->exists();
        }

        if ($user->role === 'student') {
            return $user->student && $user->student->id === $student->id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'admin', 'teacher']);
    }

    public function update(User $user, Student $student): bool
    {
        if (in_array($user->role, ['super_admin', 'admin'])) {
            return true;
        }

        if ($user->role === 'teacher') {
            return $user->assignedSections()->where('sections.id', $student->section_id)->exists();
        }

        return false;
    }

    public function delete(User $user, Student $student): bool
    {
        return in_array($user->role, ['super_admin', 'admin']);
    }

    public function restore(User $user, Student $student): bool
    {
        return in_array($user->role, ['super_admin', 'admin']);
    }

    public function forceDelete(User $user, Student $student): bool
    {
        return $user->role === 'super_admin';
    }
}
