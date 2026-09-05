<?php

namespace App\Actions\Dashboard;

use App\Models\AdmissionSlip;
use App\Models\AttendanceRecord;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;

class BuildDashboard
{
    /**
     * @return array<string, mixed>
     */
    public function handle(User $user): array
    {
        return match ($user->role) {
            'super_admin', 'admin' => $this->adminDashboard(),
            'teacher' => $this->teacherDashboard($user),
            'student' => $this->studentDashboard($user),
            'security_guard' => $this->guardDashboard(),
            default => [],
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function adminDashboard(): array
    {
        $today = now()->toDateString();

        return [
            'stats' => [
                'total_students' => Student::active()->count(),
                'total_sections' => Section::count(),
                'present_today' => AttendanceRecord::forDate($today)->where('status', 'present')->count(),
                'late_today' => AttendanceRecord::forDate($today)->where('status', 'late')->count(),
                'absent_today' => AttendanceRecord::forDate($today)->where('status', 'absent')->count(),
                'pending_slips' => AdmissionSlip::pending()->count(),
            ],
            'recent_attendance' => AttendanceRecord::with(['student', 'section'])
                ->forDate($today)
                ->latest()
                ->take(10)
                ->get(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function teacherDashboard(User $user): array
    {
        $today = now()->toDateString();
        $sectionIds = $user->assignedSections()->pluck('sections.id');

        return [
            'stats' => [
                'my_students' => Student::active()->whereIn('section_id', $sectionIds)->count(),
                'present_today' => AttendanceRecord::forDate($today)->whereIn('section_id', $sectionIds)->where('status', 'present')->count(),
                'late_today' => AttendanceRecord::forDate($today)->whereIn('section_id', $sectionIds)->where('status', 'late')->count(),
                'absent_today' => AttendanceRecord::forDate($today)->whereIn('section_id', $sectionIds)->where('status', 'absent')->count(),
                'pending_slips' => AdmissionSlip::pending()->whereHas('student', fn ($q) => $q->whereIn('section_id', $sectionIds))->count(),
            ],
            'recent_attendance' => AttendanceRecord::with(['student', 'section'])
                ->forDate($today)
                ->whereIn('section_id', $sectionIds)
                ->latest()
                ->take(10)
                ->get(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function studentDashboard(User $user): array
    {
        $student = $user->student;
        $today = now()->toDateString();

        return [
            'stats' => [
                'total_present' => AttendanceRecord::forStudent($student->id)->where('status', 'present')->count(),
                'total_late' => AttendanceRecord::forStudent($student->id)->where('status', 'late')->count(),
                'total_absent' => AttendanceRecord::forStudent($student->id)->where('status', 'absent')->count(),
                'pending_slips' => AdmissionSlip::forStudent($student->id)->pending()->count(),
            ],
            'today_attendance' => AttendanceRecord::forStudent($student->id)->forDate($today)->first(),
            'recent_slips' => AdmissionSlip::forStudent($student->id)->latest()->take(5)->get(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function guardDashboard(): array
    {
        $today = now()->toDateString();

        return [
            'stats' => [
                'scanned_today' => AttendanceRecord::forDate($today)->where('source', 'scan')->count(),
                'present_today' => AttendanceRecord::forDate($today)->where('status', 'present')->count(),
                'late_today' => AttendanceRecord::forDate($today)->where('status', 'late')->count(),
            ],
            'recent_scans' => AttendanceRecord::with(['student', 'section'])
                ->forDate($today)
                ->where('source', 'scan')
                ->latest()
                ->take(10)
                ->get(),
        ];
    }
}
