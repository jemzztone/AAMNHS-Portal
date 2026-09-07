<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('user'));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $userId = $this->route('user')?->id;

        $allowedRoles = $this->user()->role === 'super_admin'
            ? ['super_admin', 'admin', 'teacher', 'student', 'security_guard']
            : ['admin', 'teacher', 'student', 'security_guard'];

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($userId)],
            'role' => ['required', 'string', Rule::in($allowedRoles)],
            'phone' => ['nullable', 'string', 'max:20'],
        ];
    }
}
