<?php

namespace App\Http\Requests;

use App\Models\AttendanceRecord;
use Illuminate\Foundation\Http\FormRequest;

class ManualAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', AttendanceRecord::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'student_id' => 'required|exists:students,id',
            'date' => 'required|date',
            'status' => 'required|in:present,late,absent',
        ];
    }
}
