import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';

const ROLES = [
    { value: 'student', label: 'Student' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'security_guard', label: 'Security Guard' },
    { value: 'admin', label: 'Admin' },
    { value: 'super_admin', label: 'Super Admin' },
];

const roleNames = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    teacher: 'Teacher',
    student: 'Student',
    security_guard: 'Security Guard',
};

export default function Edit({ user }) {
    const auth = usePage().props.auth.user;
    const isSuperAdmin = auth.role === 'super_admin';

    const { data, setData, patch, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('users.update', user.id));
    };

    const handleToggleActive = () => {
        router.post(route('users.toggle-active', user.id));
    };

    const handleResetPassword = () => {
        if (!confirm('Are you sure you want to reset this user\'s password? A new password will be generated.')) return;
        router.post(route('users.reset-password', user.id), {}, { preserveState: true });
    };

    const handleForcePasswordChange = () => {
        router.post(route('users.force-password-change', user.id));
    };

    const handleDelete = () => {
        if (!confirm('Are you sure you want to delete this user? This can be undone by restoring.')) return;
        router.delete(route('users.destroy', user.id));
    };

    const handleRestore = () => {
        router.post(route('users.restore', user.id));
    };

    const availableRoles = isSuperAdmin
        ? ROLES
        : ROLES.filter((r) => r.value !== 'super_admin');

    const resetPasswordFlash = usePage().props.flash?.reset_password;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Administration</p>
                        <h2 className="surface-title">Edit User: {user.name}</h2>
                    </div>
                    <Link href={route('users.index')} className="btn-outline">
                        Back to Users
                    </Link>
                </div>
            }
        >
            <Head title="Edit User" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Edit Form */}
                    <div className="lg:col-span-2">
                        <div className="card overflow-hidden">
                            <div className="border-b border-slate-100 bg-slate-50/60 px-4 sm:px-6 py-4">
                                <h3 className="text-sm font-bold text-slate-900">
                                    Account Details
                                </h3>
                            </div>
                            <form onSubmit={submit} className="card-pad space-y-6">
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="name" className="input-label">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="input mt-1.5"
                                            required
                                        />
                                        {errors.name && (
                                            <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="input-label">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="input mt-1.5"
                                            required
                                        />
                                        {errors.email && (
                                            <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="role" className="input-label">
                                            Role <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="role"
                                            value={data.role}
                                            onChange={(e) => setData('role', e.target.value)}
                                            className="input mt-1.5"
                                            required
                                        >
                                            {availableRoles.map((role) => (
                                                <option key={role.value} value={role.value}>
                                                    {role.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.role && (
                                            <p className="mt-1.5 text-xs text-red-600">{errors.role}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="input-label">
                                            Phone
                                        </label>
                                        <input
                                            id="phone"
                                            type="text"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className="input mt-1.5"
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-5">
                                    <Link href={route('users.index')} className="btn-outline">
                                        Cancel
                                    </Link>
                                    <button type="submit" disabled={processing} className="btn-primary">
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Reset Password Flash */}
                        {resetPasswordFlash && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                                <div className="flex items-start gap-3">
                                    <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-semibold text-amber-800">New Password</p>
                                        <p className="mt-1 text-sm text-amber-700">
                                            <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs font-bold">{resetPasswordFlash.new_password}</code>
                                        </p>
                                        <p className="mt-1 text-xs text-amber-600">Copy this now. It will not be shown again.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="card card-pad">
                            <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
                            <div className="mt-4 space-y-3">
                                <button
                                    onClick={handleToggleActive}
                                    className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${user.is_active ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 hover:bg-emerald-100'}`}
                                >
                                    {user.is_active ? (
                                        <>
                                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                            </svg>
                                            Deactivate Account
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Activate Account
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={handleResetPassword}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20 transition hover:bg-blue-100"
                                >
                                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                    Reset Password
                                </button>

                                <button
                                    onClick={handleForcePasswordChange}
                                    className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${user.force_password_change ? 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20 hover:bg-purple-100' : 'bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-100'}`}
                                >
                                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                    </svg>
                                    {user.force_password_change ? 'Disable Force Password Change' : 'Force Password Change on Login'}
                                </button>

                                {isSuperAdmin && (
                                    <>
                                        {user.deleted_at ? (
                                            <button
                                                onClick={handleRestore}
                                                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 transition hover:bg-emerald-100"
                                            >
                                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                                                </svg>
                                                Restore User
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleDelete}
                                                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 ring-1 ring-inset ring-red-600/20 transition hover:bg-red-100"
                                            >
                                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                                Delete User
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="card card-pad">
                            <h3 className="text-sm font-bold text-slate-900">User Info</h3>
                            <div className="mt-4 space-y-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Role</p>
                                    <p className="mt-1 text-sm font-medium text-slate-900">{roleNames[user.role] || user.role}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status</p>
                                    <p className="mt-1 text-sm font-medium text-slate-900">
                                        {user.deleted_at ? 'Deleted' : user.is_active ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Force Password Change</p>
                                    <p className="mt-1 text-sm font-medium text-slate-900">{user.force_password_change ? 'Yes' : 'No'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Created</p>
                                    <p className="mt-1 text-sm font-medium text-slate-900">
                                        {new Date(user.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
