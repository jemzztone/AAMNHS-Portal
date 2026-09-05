<?php

namespace App\Http\Requests;

use App\Models\AdmissionSlip;
use Illuminate\Foundation\Http\FormRequest;

class StoreAdmissionSlipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', AdmissionSlip::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'absence_date' => 'required|date|before_or_equal:today',
            'reason' => 'required|string|max:1000',
            'guardian_reference' => 'nullable|string|max:255',
            'attachment' => 'nullable|file|max:5120|mimes:jpg,jpeg,png,pdf',
        ];
    }
}
