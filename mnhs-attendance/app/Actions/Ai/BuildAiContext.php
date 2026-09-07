<?php

namespace App\Actions\Ai;

use App\Models\AttendanceRecord;
use App\Models\AuditLog;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class BuildAiContext
{
    public function handle(User $user, ?string $startDate, ?string $endDate, ?string $sectionId): string
    {
        $context = [
            'period' => "{$startDate} to {$endDate}",
            'role' => $user->role,
        ];

        $context['sections'] = $this->getSections($user, $sectionId);
        $context['teachers'] = $this->getTeachers($user, $sectionId);
        $context['students'] = $this->getStudents($user, $sectionId);
        $context['attendance_summary'] = $this->getAttendanceSummary($user, $startDate, $endDate, $sectionId);
        $context['attendance_by_section'] = $this->getAttendanceBySection($user, $startDate, $endDate, $sectionId);
        $context['late_students'] = $this->getLateStudents($user, $startDate, $endDate, $sectionId);
        $context['absent_students'] = $this->getAbsentStudents($user, $startDate, $endDate, $sectionId);
        $context['early_arrivals'] = $this->getEarlyArrivals($user, $startDate, $endDate, $sectionId);

        if ($user->role === 'super_admin') {
            $context['users'] = $this->getUsers();
            $context['audit_recent'] = $this->getRecentAuditLogs();
        }

        return json_encode($context, JSON_PRETTY_PRINT);
    }

    /**
     * @return array<int, array{id: string, name: string, grade_level: string|null, student_count: int, teacher_names: string[]}>
     */
    private function getSections(User $user, ?string $sectionId): array
    {
        $query = Section::withCount('students')
            ->with(['gradeLevel', 'teachers'])
            ->orderBy('name');

        if ($sectionId) {
            $query->where('id', $sectionId);
        }

        if ($user->role === 'teacher') {
            $assignedIds = $user->assignedSections()->pluck('sections.id');
            $query->whereIn('sections.id', $assignedIds);
        }

        return $query->get()
            ->map(fn (Section $s) => [
                'id' => $s->id,
                'name' => $s->name,
                'grade_level' => $s->gradeLevel?->name,
                'student_count' => $s->students_count,
                'teacher_names' => $s->teachers->pluck('name')->toArray(),
            ])
            ->toArray();
    }

    /**
     * @return array<int, array{id: string, name: string, email: string, assigned_sections: string[]}>
     */
    private function getTeachers(User $user, ?string $sectionId): array
    {
        $query = User::where('role', 'teacher')
            ->with(['assignedSections'])
            ->orderBy('name');

        if ($user->role === 'teacher') {
            $query->where('id', $user->id);
        }

        return $query->get()
            ->map(fn (User $t) => [
                'id' => $t->id,
                'name' => $t->name,
                'email' => $t->email,
                'assigned_sections' => $t->assignedSections->pluck('name')->toArray(),
            ])
            ->toArray();
    }

    /**
     * @return array<int, array{id: string, full_name: string, lrn: string|null, section: string, is_active: bool}>
     */
    private function getStudents(User $user, ?string $sectionId): array
    {
        $query = Student::with(['section'])
            ->orderBy('last_name')
            ->take(100);

        if ($sectionId) {
            $query->where('section_id', $sectionId);
        }

        if ($user->role === 'teacher') {
            $assignedIds = $user->assignedSections()->pluck('sections.id');
            $query->whereIn('section_id', $assignedIds);
        }

        return $query->get()
            ->map(fn (Student $s) => [
                'id' => $s->id,
                'full_name' => $s->full_name,
                'lrn' => $s->lrn,
                'section' => $s->section?->name,
                'is_active' => (bool) $s->is_active,
            ])
            ->toArray();
    }

    /**
     * @return array{total: int, present: int, late: int, absent: int}
     */
    private function getAttendanceSummary(User $user, ?string $startDate, ?string $endDate, ?string $sectionId): array
    {
        $query = AttendanceRecord::whereDate('date', '>=', $startDate)
            ->whereDate('date', '<=', $endDate);

        if ($sectionId) {
            $query->forSection($sectionId);
        }

        if ($user->role === 'teacher') {
            $assignedIds = $user->assignedSections()->pluck('sections.id');
            $query->whereHas('student', fn ($q) => $q->whereIn('section_id', $assignedIds));
        }

        return [
            'total' => (clone $query)->count(),
            'present' => (clone $query)->where('status', 'present')->count(),
            'late' => (clone $query)->where('status', 'late')->count(),
            'absent' => (clone $query)->where('status', 'absent')->count(),
        ];
    }

    /**
     * @return array<int, array{section: string, total: int, present: int, late: int, absent: int}>
     */
    private function getAttendanceBySection(User $user, ?string $startDate, ?string $endDate, ?string $sectionId): array
    {
        $query = Section::select(
            'sections.id',
            'sections.name',
            DB::raw('COUNT(attendance_records.id) as total'),
            DB::raw("SUM(CASE WHEN attendance_records.status = 'present' THEN 1 ELSE 0 END) as present"),
            DB::raw("SUM(CASE WHEN attendance_records.status = 'late' THEN 1 ELSE 0 END) as late"),
            DB::raw("SUM(CASE WHEN attendance_records.status = 'absent' THEN 1 ELSE 0 END) as absent"),
        )
            ->join('students', 'students.section_id', '=', 'sections.id')
            ->join('attendance_records', 'attendance_records.student_id', '=', 'students.id')
            ->whereDate('attendance_records.date', '>=', $startDate)
            ->whereDate('attendance_records.date', '<=', $endDate)
            ->groupBy('sections.id', 'sections.name');

        if ($sectionId) {
            $query->where('sections.id', $sectionId);
        }

        if ($user->role === 'teacher') {
            $assignedIds = $user->assignedSections()->pluck('sections.id');
            $query->whereIn('sections.id', $assignedIds);
        }

        return $query->orderByDesc('late')
            ->get()
            ->map(fn ($row) => [
                'section' => $row->name,
                'total' => (int) $row->total,
                'present' => (int) $row->present,
                'late' => (int) $row->late,
                'absent' => (int) $row->absent,
            ])
            ->toArray();
    }

    /**
     * @return array<int, array{student: string, section: string, late_count: int}>
     */
    private function getLateStudents(User $user, ?string $startDate, ?string $endDate, ?string $sectionId): array
    {
        $query = Student::query()
            ->select('students.id', 'students.first_name', 'students.middle_name', 'students.last_name', 'students.section_id', DB::raw("SUM(CASE WHEN attendance_records.status = 'late' THEN 1 ELSE 0 END) as late_count"))
            ->join('attendance_records', 'students.id', '=', 'attendance_records.student_id')
            ->whereDate('attendance_records.date', '>=', $startDate)
            ->whereDate('attendance_records.date', '<=', $endDate)
            ->groupBy('students.id', 'students.first_name', 'students.middle_name', 'students.last_name', 'students.section_id')
            ->having('late_count', '>', 0)
            ->orderByDesc('late_count')
            ->take(20);

        if ($sectionId) {
            $query->where('students.section_id', $sectionId);
        }

        if ($user->role === 'teacher') {
            $assignedIds = $user->assignedSections()->pluck('sections.id');
            $query->whereIn('students.section_id', $assignedIds);
        }

        $studentIds = $query->pluck('students.id');
        $lateCounts = $query->pluck('late_count', 'students.id');

        return Student::whereIn('students.id', $studentIds)
            ->with('section:id,name')
            ->get()
            ->map(fn (Student $s) => [
                'student' => $s->full_name,
                'section' => $s->section?->name,
                'late_count' => (int) ($lateCounts[$s->id] ?? 0),
            ])
            ->toArray();
    }

    /**
     * @return array<int, array{student: string, section: string, absent_count: int}>
     */
    private function getAbsentStudents(User $user, ?string $startDate, ?string $endDate, ?string $sectionId): array
    {
        $query = Student::query()
            ->select('students.id', 'students.first_name', 'students.middle_name', 'students.last_name', 'students.section_id', DB::raw('COUNT(attendance_records.id) as absent_count'))
            ->leftJoin('attendance_records', function ($join) use ($startDate, $endDate) {
                $join->on('students.id', '=', 'attendance_records.student_id')
                    ->where('attendance_records.status', '=', 'absent')
                    ->whereDate('attendance_records.date', '>=', $startDate)
                    ->whereDate('attendance_records.date', '<=', $endDate);
            })
            ->groupBy('students.id', 'students.first_name', 'students.middle_name', 'students.last_name', 'students.section_id')
            ->having('absent_count', '>', 0)
            ->orderByDesc('absent_count')
            ->take(20);

        if ($sectionId) {
            $query->where('students.section_id', $sectionId);
        }

        if ($user->role === 'teacher') {
            $assignedIds = $user->assignedSections()->pluck('sections.id');
            $query->whereIn('students.section_id', $assignedIds);
        }

        $studentIds = $query->pluck('students.id');
        $absentCounts = $query->pluck('absent_count', 'students.id');

        return Student::whereIn('students.id', $studentIds)
            ->with('section:id,name')
            ->get()
            ->map(fn (Student $s) => [
                'student' => $s->full_name,
                'section' => $s->section?->name,
                'absent_count' => (int) ($absentCounts[$s->id] ?? 0),
            ])
            ->toArray();
    }

    /**
     * @return array<int, array{student: string, section: string, earliest_time: string}>
     */
    private function getEarlyArrivals(User $user, ?string $startDate, ?string $endDate, ?string $sectionId): array
    {
        $query = Student::query()
            ->select('students.id', 'students.first_name', 'students.middle_name', 'students.last_name', 'students.section_id', DB::raw('MIN(attendance_records.time_in) as earliest_time'))
            ->join('attendance_records', 'students.id', '=', 'attendance_records.student_id')
            ->whereDate('attendance_records.date', '>=', $startDate)
            ->whereDate('attendance_records.date', '<=', $endDate)
            ->where('attendance_records.status', 'present')
            ->groupBy('students.id', 'students.first_name', 'students.middle_name', 'students.last_name', 'students.section_id')
            ->orderBy('earliest_time')
            ->take(20);

        if ($sectionId) {
            $query->where('students.section_id', $sectionId);
        }

        if ($user->role === 'teacher') {
            $assignedIds = $user->assignedSections()->pluck('sections.id');
            $query->whereIn('students.section_id', $assignedIds);
        }

        $studentIds = $query->pluck('students.id');
        $earliestTimes = $query->pluck('earliest_time', 'students.id');

        return Student::whereIn('students.id', $studentIds)
            ->with('section:id,name')
            ->get()
            ->map(fn (Student $s) => [
                'student' => $s->full_name,
                'section' => $s->section?->name,
                'earliest_time' => (string) ($earliestTimes[$s->id] ?? ''),
            ])
            ->toArray();
    }

    /**
     * @return array<int, array{id: string, name: string, role: string, email: string}>
     */
    private function getUsers(): array
    {
        return User::select('id', 'name', 'role', 'email')
            ->orderBy('role')
            ->orderBy('name')
            ->get()
            ->toArray();
    }

    /**
     * @return array<int, array{event: string, actor: string|null, question: string|null, created_at: string}>
     */
    private function getRecentAuditLogs(): array
    {
        return AuditLog::with('user:id,name')
            ->orderByDesc('created_at')
            ->take(20)
            ->get()
            ->map(fn ($log) => [
                'event' => $log->event,
                'actor' => $log->user?->name,
                'question' => $log->new_values['question'] ?? null,
                'created_at' => $log->created_at->toDateTimeString(),
            ])
            ->toArray();
    }
}
