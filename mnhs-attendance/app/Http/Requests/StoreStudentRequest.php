<?php

namespace App\Http\Requests;

use App\Models\Student;
use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Student::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'lrn' => 'required|string|digits:12|integer|unique:students,lrn',
            'section_id' => 'nullable|exists:sections,id',
            'guardian_name' => 'nullable|string|max:255',
            'guardian_email' => 'nullable|email',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ];
    }
}
