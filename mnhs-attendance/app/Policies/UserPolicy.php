<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'admin']);
    }

    public function view(User $user, User $model): bool
    {
        if ($user->role === 'super_admin') {
            return true;
        }

        if ($user->role === 'admin') {
            // The index lists admins and guards too; the detail page must not
            // 403 for rows the admin can already see (and edit).
            return $model->role !== 'super_admin';
        }

        return false;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'admin']);
    }

    public function update(User $user, User $model): bool
    {
        if ($user->role === 'super_admin') {
            return true;
        }

        if ($user->role === 'admin') {
            return $model->role !== 'super_admin';
        }

        return false;
    }

    public function delete(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return false;
        }

        return $user->role === 'super_admin';
    }

    public function restore(User $user, User $model): bool
    {
        return $user->role === 'super_admin';
    }

    public function toggleActive(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return false;
        }

        if ($user->role === 'super_admin') {
            return true;
        }

        if ($user->role === 'admin') {
            return $model->role !== 'super_admin';
        }

        return false;
    }

    public function resetPassword(User $user, User $model): bool
    {
        if ($user->role === 'super_admin') {
            return true;
        }

        if ($user->role === 'admin') {
            return $model->role !== 'super_admin';
        }

        return false;
    }

    public function forcePasswordChange(User $user, User $model): bool
    {
        if ($user->role === 'super_admin') {
            return true;
        }

        if ($user->role === 'admin') {
            return $model->role !== 'super_admin';
        }

        return false;
    }
}
