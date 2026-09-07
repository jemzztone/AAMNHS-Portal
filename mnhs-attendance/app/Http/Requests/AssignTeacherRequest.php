<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class AssignTeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['super_admin', 'admin']);
    }

    public function rules(): array
    {
        return [
            'teacher_id' => [
                'required',
                'exists:users,id',
                // Only teachers can be assigned to sections.
                function (string $attribute, mixed $value, \Closure $fail) {
                    if (! User::find($value)?->isTeacher()) {
                        $fail('The selected user is not a teacher.');
                    }
                },
            ],
            'section_id' => 'nullable|exists:sections,id',
        ];
    }
}
