<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AiQueryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()->role, ['super_admin', 'admin', 'teacher']);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'question' => 'required|string|max:2000',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'section_id' => 'nullable|exists:sections,id',
        ];
    }
}
