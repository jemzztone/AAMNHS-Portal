<?php

namespace App\Http\Requests;

use App\Models\Student;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('student'));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Student $student */
        $student = $this->route('student');

        return [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'lrn' => ['required', 'string', 'digits:12', 'integer', Rule::unique('students', 'lrn')->ignore($student->id)],
            'section_id' => 'required|exists:sections,id',
            'guardian_name' => 'nullable|string|max:255',
            'guardian_email' => 'nullable|email',
            'is_active' => 'boolean',
        ];
    }
}
