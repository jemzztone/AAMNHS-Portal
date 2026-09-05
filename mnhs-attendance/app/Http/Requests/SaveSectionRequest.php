<?php

namespace App\Http\Requests;

use App\Models\Section;
use Illuminate\Foundation\Http\FormRequest;

class SaveSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        if ($this->routeIs('sections.store')) {
            return $this->user()->can('create', Section::class);
        }

        return $this->user()->can('update', $this->route('section'));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'grade_level_id' => 'required|exists:grade_levels,id',
        ];
    }
}
