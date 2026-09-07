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
        $user = $this->user();
        $isTeacher = $user->role === 'teacher';

        // Teachers cannot change section assignment
        $sectionRule = $isTeacher
            ? 'required|exists:sections,id|in:'.$student->section_id
            : 'required|exists:sections,id';

        return [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'lrn' => ['required', 'string', 'digits:12', 'integer', Rule::unique('students', 'lrn')->ignore($student->id)],
            'section_id' => $sectionRule,
            'guardian_name' => 'nullable|string|max:255',
            'guardian_email' => 'nullable|email',
            'is_active' => 'boolean',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ];
    }
}
