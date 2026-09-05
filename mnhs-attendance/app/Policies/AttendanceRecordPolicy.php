<?php

namespace App\Policies;

use App\Models\AttendanceRecord;
use App\Models\User;

class AttendanceRecordPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'admin', 'teacher']);
    }

    public function view(User $user, AttendanceRecord $attendanceRecord): bool
    {
        if (in_array($user->role, ['super_admin', 'admin'])) {
            return true;
        }

        if ($user->role === 'teacher') {
            return $user->assignedSections()
                ->where('sections.id', $attendanceRecord->section_id)
                ->exists();
        }

        if ($user->role === 'student') {
            return $user->student && $user->student->id === $attendanceRecord->student_id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        // Guards record attendance via the dedicated QR scan endpoint,
        // not through manual entries.
        return in_array($user->role, ['super_admin', 'admin', 'teacher']);
    }

    public function update(User $user, AttendanceRecord $attendanceRecord): bool
    {
        if (in_array($user->role, ['super_admin', 'admin'])) {
            return true;
        }

        if ($user->role === 'teacher') {
            return $user->assignedSections()
                ->where('sections.id', $attendanceRecord->section_id)
                ->exists();
        }

        return false;
    }

    public function delete(User $user, AttendanceRecord $attendanceRecord): bool
    {
        return in_array($user->role, ['super_admin', 'admin']);
    }
}
