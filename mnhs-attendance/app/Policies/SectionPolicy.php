<?php

namespace App\Policies;

use App\Models\Section;
use App\Models\User;

class SectionPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'admin', 'teacher']);
    }

    public function view(User $user, Section $section): bool
    {
        if (in_array($user->role, ['super_admin', 'admin'])) {
            return true;
        }

        if ($user->role === 'teacher') {
            return $user->assignedSections()->where('sections.id', $section->id)->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'admin']);
    }

    public function update(User $user, Section $section): bool
    {
        return in_array($user->role, ['super_admin', 'admin']);
    }

    public function delete(User $user, Section $section): bool
    {
        return in_array($user->role, ['super_admin', 'admin']);
    }

    public function assignTeacher(User $user, Section $section): bool
    {
        return in_array($user->role, ['super_admin', 'admin']);
    }
}
