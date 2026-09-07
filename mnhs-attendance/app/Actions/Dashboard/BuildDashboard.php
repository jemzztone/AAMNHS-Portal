<?php

namespace App\Actions\Dashboard;

use App\Models\AdmissionSlip;
use App\Models\AttendanceRecord;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

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
            'recent_attendance' => AttendanceRecord::with('student.section')
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
        $inSections = fn ($q) => $q->whereIn('section_id', $sectionIds);

        return [
            'stats' => [
                'my_students' => Student::active()->whereIn('section_id', $sectionIds)->count(),
                'present_today' => AttendanceRecord::forDate($today)->whereHas('student', $inSections)->where('status', 'present')->count(),
                'late_today' => AttendanceRecord::forDate($today)->whereHas('student', $inSections)->where('status', 'late')->count(),
                'absent_today' => AttendanceRecord::forDate($today)->whereHas('student', $inSections)->where('status', 'absent')->count(),
                'pending_slips' => AdmissionSlip::pending()->whereHas('student', fn ($q) => $q->whereIn('section_id', $sectionIds))->count(),
            ],
            'recent_attendance' => AttendanceRecord::with('student.section')
                ->forDate($today)
                ->whereHas('student', $inSections)
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

        if (! $student) {
            return [
                'stats' => [
                    'total_present' => 0,
                    'total_late' => 0,
                    'total_absent' => 0,
                    'pending_slips' => 0,
                ],
                'today_attendance' => null,
                'recent_slips' => collect(),
                'student_qr' => null,
                'message' => 'Your student profile is not yet set up. Please contact the administration.',
            ];
        }

        return [
            'stats' => [
                'total_present' => AttendanceRecord::forStudent($student->id)->where('status', 'present')->count(),
                'total_late' => AttendanceRecord::forStudent($student->id)->where('status', 'late')->count(),
                'total_absent' => AttendanceRecord::forStudent($student->id)->where('status', 'absent')->count(),
                'pending_slips' => AdmissionSlip::forStudent($student->id)->pending()->count(),
            ],
            'today_attendance' => AttendanceRecord::forStudent($student->id)->forDate($today)->first(),
            'recent_slips' => AdmissionSlip::forStudent($student->id)->latest()->take(5)->get(),
            'student_qr' => [
                'qr_svg' => (string) QrCode::size(200)->generate($student->qr_token),
                'full_name' => $student->full_name,
                'lrn' => $student->lrn,
                'section' => $student->section?->name,
                'grade_level' => $student->section?->gradeLevel?->name,
            ],
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
            'recent_scans' => AttendanceRecord::with('student.section')
                ->forDate($today)
                ->where('source', 'scan')
                ->latest()
                ->take(10)
                ->get(),
        ];
    }
}
