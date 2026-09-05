<?php

namespace App\Policies;

use App\Models\AdmissionSlip;
use App\Models\User;

class AdmissionSlipPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'admin', 'teacher', 'student']);
    }

    public function view(User $user, AdmissionSlip $admissionSlip): bool
    {
        if (in_array($user->role, ['super_admin', 'admin'])) {
            return true;
        }

        if ($user->role === 'teacher') {
            return $user->assignedSections()
                ->where('sections.id', $admissionSlip->student->section_id)
                ->exists();
        }

        if ($user->role === 'student') {
            return $user->student && $user->student->id === $admissionSlip->student_id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->role === 'student';
    }

    public function update(User $user, AdmissionSlip $admissionSlip): bool
    {
        return in_array($user->role, ['super_admin', 'admin', 'teacher']);
    }

    public function approve(User $user, AdmissionSlip $admissionSlip): bool
    {
        if (! in_array($user->role, ['super_admin', 'admin', 'teacher'])) {
            return false;
        }

        if ($user->role === 'teacher') {
            return $user->assignedSections()
                ->where('sections.id', $admissionSlip->student->section_id)
                ->exists();
        }

        return true;
    }

    public function reject(User $user, AdmissionSlip $admissionSlip): bool
    {
        return $this->approve($user, $admissionSlip);
    }
}
