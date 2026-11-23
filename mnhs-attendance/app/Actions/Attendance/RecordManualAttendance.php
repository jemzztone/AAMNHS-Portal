<?php

namespace App\Actions\Attendance;

use App\Actions\Audit\LogAuditEvent;
use App\Models\AttendanceRecord;
use App\Models\Student;
use App\Models\User;

class RecordManualAttendance
{
    public function handle(User $actor, array $data, ?string $ip, ?string $userAgent): AttendanceRecord
    {
        $student = Student::findOrFail($data['student_id']);

        // Teachers may only record attendance for students in their assigned sections.
        if ($actor->role === 'teacher'
            && ! $actor->assignedSections()->where('sections.id', $student->section_id)->exists()) {
            abort(403, 'You can only record attendance for students in your assigned sections.');
        }

        // Include soft-deleted rows: a guard may have removed today's scan, but
        // the unique (student_id, date) constraint still reserves the day.
        $existing = AttendanceRecord::withTrashed()
            ->where('student_id', $student->id)
            ->whereDate('date', $data['date'])
            ->first();

        $restored = false;

        if ($existing?->trashed()) {
            $existing->restore();
            $restored = true;
        }

        if ($existing) {
            $previous = [
                'status' => $existing->status,
                'time_in' => $existing->time_in,
                'time_out' => $existing->time_out,
            ];

            $updateData = [
                'status' => $data['status'],
                'source' => 'manual',
                'recorded_by' => $actor->id,
            ];

            if ($data['status'] === 'absent') {
                $updateData['time_in'] = null;
                $updateData['time_out'] = null;
            } else {
                if ($restored || blank($existing->time_in)) {
                    $updateData['time_in'] = now()->format('H:i:s');
                }

                if (array_key_exists('time_out', $data)) {
                    $updateData['time_out'] = $data['time_out'];
                }
            }

            $existing->update($updateData);

            (new LogAuditEvent)->handle(
                event: 'attendance.updated',
                auditable: $existing,
                actor: $actor,
                oldValues: $previous,
                newValues: [
                    'status' => $existing->status,
                    'time_out' => $existing->time_out,
                ],
                ip: $ip,
                userAgent: $userAgent,
            );

            return $existing;
        }

        $record = AttendanceRecord::create([
            'student_id' => $student->id,
            'date' => $data['date'],
            'status' => $data['status'],
            'source' => 'manual',
            'recorded_by' => $actor->id,
            // The column is a SQL time type. A 12-hour string ("04:05:00 PM")
            // is rejected by PostgreSQL, so always store 24-hour time.
            'time_in' => $data['status'] === 'absent' ? null : now()->format('H:i:s'),
            'time_out' => $data['status'] === 'absent' ? null : ($data['time_out'] ?? null),
        ]);

        (new LogAuditEvent)->handle(
            event: 'attendance.manual_entry',
            auditable: $record,
            actor: $actor,
            newValues: [
                'status' => $record->status,
                'date' => $record->date,
                'student_id' => $record->student_id,
            ],
            ip: $ip,
            userAgent: $userAgent,
        );

        return $record;
    }
}
