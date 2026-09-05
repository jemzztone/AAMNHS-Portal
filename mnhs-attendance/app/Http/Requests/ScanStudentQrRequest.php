<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ScanStudentQrRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Route middleware already restricts to the guard role; this is
        // defense-in-depth so the endpoint can never be abused by other roles.
        return $this->user()?->role === 'security_guard';
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'qr_token' => 'required|string',
        ];
    }
}
