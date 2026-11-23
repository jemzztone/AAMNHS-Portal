<?php

namespace App\Http\Requests;

use App\Models\Student;
use Illuminate\Foundation\Http\FormRequest;

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

        // Teachers cannot move a student to another section. A student without
        // a section stays without one (the old `in:` rule rejected null).
        $sectionRule = $isTeacher
            ? [
                'nullable',
                'exists:sections,id',
                function (string $attribute, mixed $value, \Closure $fail) use ($student) {
                    if ((string) $value !== (string) $student->section_id) {
                        $fail('You cannot change the section assignment.');
                    }
                },
            ]
            : 'nullable|exists:sections,id';

        return [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'lrn' => [
                'required',
                'string',
                'digits:12',
                'integer',
                // Include soft-deleted rows: they still occupy the unique index.
                function (string $attribute, mixed $value, \Closure $fail) use ($student) {
                    if (Student::withTrashed()->where('lrn', $value)->where('id', '!=', $student->id)->exists()) {
                        $fail('Another student already uses this LRN.');
                    }
                },
            ],
            'section_id' => $sectionRule,
            'guardian_name' => 'nullable|string|max:255',
            'guardian_email' => 'nullable|email',
            'is_active' => 'boolean',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ];
    }
}
