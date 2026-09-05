<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewAdmissionSlipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('approve', $this->route('admissionSlip'));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $notesRequired = $this->routeIs('admission-slips.reject');

        return [
            'review_notes' => $notesRequired
                ? 'required|string|max:1000'
                : 'nullable|string|max:1000',
        ];
    }
}
