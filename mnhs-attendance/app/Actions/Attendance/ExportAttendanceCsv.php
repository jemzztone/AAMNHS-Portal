<?php

namespace App\Actions\Attendance;

use App\Models\AttendanceRecord;
use App\Models\User;

class ExportAttendanceCsv
{
    public function handle(User $user, string $startDate, string $endDate, ?string $sectionId): string
    {
        $query = AttendanceRecord::with(['student', 'section'])
            ->whereDate('date', '>=', $startDate)
            ->whereDate('date', '<=', $endDate);

        if ($sectionId) {
            $query->forSection($sectionId);
        }

        if ($user->role === 'teacher') {
            $sectionIds = $user->assignedSections()->pluck('sections.id');
            $query->whereIn('section_id', $sectionIds);
        }

        $records = $query->get();

        $output = fopen('php://temp', 'r+');

        fputcsv($output, ['Date', 'Student Name', 'LRN', 'Section', 'Status', 'Time In', 'Source']);

        foreach ($records as $record) {
            fputcsv($output, [
                $record->date,
                $record->student->full_name,
                $record->student->lrn,
                $record->section->name,
                $record->status,
                $record->time_in,
                $record->source,
            ]);
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }
}
