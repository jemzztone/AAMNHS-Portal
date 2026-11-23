<?php

namespace App\Http\Requests;

use App\Models\AttendanceRecord;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'student_id' => [
                'required',
                Rule::exists('students', 'id')->where(
                    fn ($query) => $query->whereNull('deleted_at')->where('is_active', true),
                ),
            ],
            'date' => 'required|date|before_or_equal:today',
            'status' => 'required|in:present,late,absent',
            'time_out' => 'nullable|date_format:H:i:s',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'student_id.exists' => 'The selected student is inactive or no longer exists.',
            'date.before_or_equal' => 'Attendance cannot be recorded for a future date.',
        ];
    }
}
