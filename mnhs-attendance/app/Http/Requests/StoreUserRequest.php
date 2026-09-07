<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', User::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $allowedRoles = $this->user()->role === 'super_admin'
            ? ['super_admin', 'admin', 'teacher', 'student', 'security_guard']
            : ['admin', 'teacher', 'student', 'security_guard'];

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:10', 'confirmed'],
            'role' => ['required', 'string', Rule::in($allowedRoles)],
            'phone' => ['nullable', 'string', 'max:20'],
        ];
    }
}
