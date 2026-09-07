<?php

namespace App\Actions\Analytics;

use App\Models\AttendanceRecord;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class BuildAnalyticsReport
{
    /**
     * @return array<string, mixed>
     */
    public function handle(User $user, string $startDate, string $endDate, ?string $sectionId): array
    {
        // Teachers may only see analytics for their assigned sections.
        $teacherSectionIds = $user->role === 'teacher'
            ? $user->assignedSections()->pluck('sections.id')
            : null;

        $query = AttendanceRecord::whereDate('date', '>=', $startDate)->whereDate('date', '<=', $endDate);

        if ($sectionId) {
            $query->forSection($sectionId);
        }

        if ($teacherSectionIds) {
            $query->whereHas('student', fn ($q) => $q->whereIn('section_id', $teacherSectionIds));
        }

        $stats = [
            'total_records' => (clone $query)->count(),
            'present' => (clone $query)->where('status', 'present')->count(),
            'late' => (clone $query)->where('status', 'late')->count(),
            'absent' => (clone $query)->where('status', 'absent')->count(),
        ];

        $sectionRanking = Section::select(
            'sections.id',
            'sections.name',
            DB::raw('COUNT(attendance_records.id) as total'),
            DB::raw("SUM(CASE WHEN attendance_records.status = 'late' THEN 1 ELSE 0 END) as late_count"),
        )
            ->join('students', 'students.section_id', '=', 'sections.id')
            ->join('attendance_records', 'attendance_records.student_id', '=', 'students.id')
            ->whereDate('attendance_records.date', '>=', $startDate)
            ->whereDate('attendance_records.date', '<=', $endDate)
            ->when($teacherSectionIds, fn ($q) => $q->whereIn('sections.id', $teacherSectionIds))
            ->groupBy('sections.id', 'sections.name')
            ->orderByDesc('late_count')
            ->get()
            ->map(fn ($row) => [
                'id' => $row->id,
                'section' => ['name' => $row->name],
                'total' => (int) $row->total,
                'late_count' => (int) $row->late_count,
            ]);

        $lateStudents = Student::query()
            ->select('students.*', DB::raw("SUM(CASE WHEN attendance_records.status = 'late' THEN 1 ELSE 0 END) as late_count"))
            ->join('attendance_records', 'students.id', '=', 'attendance_records.student_id')
            ->whereDate('attendance_records.date', '>=', $startDate)
            ->whereDate('attendance_records.date', '<=', $endDate)
            ->when($teacherSectionIds, fn ($q) => $q->whereIn('students.section_id', $teacherSectionIds))
            ->groupBy('students.id')
            ->orderByDesc('late_count')
            ->take(10)
            ->get();

        $earlyArrivals = Student::query()
            ->select('students.*', DB::raw('MIN(attendance_records.time_in) as earliest_time'))
            ->join('attendance_records', 'students.id', '=', 'attendance_records.student_id')
            ->whereDate('attendance_records.date', '>=', $startDate)
            ->whereDate('attendance_records.date', '<=', $endDate)
            ->where('attendance_records.status', 'present')
            ->when($teacherSectionIds, fn ($q) => $q->whereIn('students.section_id', $teacherSectionIds))
            ->groupBy('students.id')
            ->orderBy('earliest_time')
            ->take(10)
            ->get();

        $absenteeism = Student::query()
            ->select('students.*', DB::raw('COUNT(attendance_records.id) as absent_count'))
            ->leftJoin('attendance_records', function ($join) use ($startDate, $endDate) {
                $join->on('students.id', '=', 'attendance_records.student_id')
                    ->where('attendance_records.status', '=', 'absent')
                    ->whereDate('attendance_records.date', '>=', $startDate)
                    ->whereDate('attendance_records.date', '<=', $endDate);
            })
            ->when($teacherSectionIds, fn ($q) => $q->whereIn('students.section_id', $teacherSectionIds))
            ->groupBy('students.id')
            ->orderByDesc('absent_count')
            ->take(10)
            ->get();

        return [
            'stats' => $stats,
            'sectionRanking' => $sectionRanking,
            'lateStudents' => $lateStudents,
            'earlyArrivals' => $earlyArrivals,
            'absenteeism' => $absenteeism,
        ];
    }
}
