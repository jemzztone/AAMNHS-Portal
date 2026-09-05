<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignTeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('assignTeacher', $this->route('section'));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'teacher_id' => 'required|exists:users,id',
        ];
    }
}
