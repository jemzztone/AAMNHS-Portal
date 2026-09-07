<?php

namespace App\Http\Controllers;

use App\Actions\Audit\LogAuditEvent;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $query = User::withTrashed()
            ->when($request->search, fn ($q, $search) => $q->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            }))
            ->when($request->role, fn ($q, $role) => $q->where('role', $role))
            ->when($request->status === 'active', fn ($q) => $q->where('is_active', true)->whereNull('deleted_at'))
            ->when($request->status === 'inactive', fn ($q) => $q->where('is_active', false)->whereNull('deleted_at'))
            ->when($request->status === 'deleted', fn ($q) => $q->onlyTrashed());

        if ($request->user()->role === 'admin') {
            $query->where('role', '!=', 'super_admin');
        }

        $users = $query->latest()->paginate(min(max((int) $request->get('per_page', 5), 1), 100));

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'status']),
        ]);
    }

    public function create()
    {
        $this->authorize('create', User::class);

        return Inertia::render('Users/Create');
    }

    public function store(StoreUserRequest $request)
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'phone' => $request->phone,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        (new LogAuditEvent)->handle(
            event: 'user.created',
            auditable: $user,
            actor: $request->user(),
            newValues: [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            ip: $request->ip(),
            userAgent: $request->userAgent(),
        );

        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }

    public function show(User $user)
    {
        $this->authorize('view', $user);

        $user->load(['student', 'teacherAssignments.section']);

        return Inertia::render('Users/Show', [
            'user' => $user,
        ]);
    }

    public function edit(User $user)
    {
        $this->authorize('update', $user);

        return Inertia::render('Users/Edit', [
            'user' => $user,
        ]);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $oldValues = $user->only(['name', 'email', 'role', 'phone']);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'phone' => $request->phone,
        ]);

        (new LogAuditEvent)->handle(
            event: 'user.updated',
            auditable: $user,
            actor: $request->user(),
            oldValues: $oldValues,
            newValues: $user->only(['name', 'email', 'role', 'phone']),
            ip: $request->ip(),
            userAgent: $request->userAgent(),
        );

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        $user->delete();

        (new LogAuditEvent)->handle(
            event: 'user.deleted',
            auditable: $user,
            actor: request()->user(),
            newValues: ['name' => $user->name, 'email' => $user->email],
            ip: request()->ip(),
            userAgent: request()->userAgent(),
        );

        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }

    public function restore(User $user)
    {
        $this->authorize('restore', $user);

        $user->restore();

        (new LogAuditEvent)->handle(
            event: 'user.restored',
            auditable: $user,
            actor: request()->user(),
            newValues: ['name' => $user->name, 'email' => $user->email],
            ip: request()->ip(),
            userAgent: request()->userAgent(),
        );

        return redirect()->route('users.index')->with('success', 'User restored successfully.');
    }

    public function toggleActive(User $user)
    {
        $this->authorize('toggleActive', $user);

        $user->update(['is_active' => ! $user->is_active]);

        (new LogAuditEvent)->handle(
            event: $user->is_active ? 'user.activated' : 'user.deactivated',
            auditable: $user,
            actor: request()->user(),
            newValues: ['is_active' => $user->is_active],
            ip: request()->ip(),
            userAgent: request()->userAgent(),
        );

        return back()->with('success', "User {$user->name} has been ".($user->is_active ? 'activated' : 'deactivated').'.');
    }

    public function forcePasswordChange(Request $request, User $user)
    {
        $this->authorize('forcePasswordChange', $user);

        $user->update(['force_password_change' => ! $user->force_password_change]);

        (new LogAuditEvent)->handle(
            event: $user->force_password_change ? 'user.force_password_change.enabled' : 'user.force_password_change.disabled',
            auditable: $user,
            actor: $request->user(),
            newValues: ['force_password_change' => $user->force_password_change],
            ip: $request->ip(),
            userAgent: $request->userAgent(),
        );

        return back()->with('success', 'Password change '.($user->force_password_change ? 'will be required' : 'requirement removed')." for {$user->name}.");
    }

    public function resetPassword(User $user)
    {
        $this->authorize('resetPassword', $user);

        $newPassword = Str::random(12);

        $user->update([
            'password' => Hash::make($newPassword),
        ]);

        (new LogAuditEvent)->handle(
            event: 'user.password_reset',
            auditable: $user,
            actor: request()->user(),
            newValues: ['password_reset' => true],
            ip: request()->ip(),
            userAgent: request()->userAgent(),
        );

        return back()->with('reset_password', [
            'user_name' => $user->name,
            'new_password' => $newPassword,
        ]);
    }
}
