import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

const ROLES = [
    { value: 'student', label: 'Student' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'security_guard', label: 'Security Guard' },
    { value: 'admin', label: 'Admin' },
    { value: 'super_admin', label: 'Super Admin' },
];

export default function Create() {
    const auth = usePage().props.auth.user;
    const isSuperAdmin = auth.role === 'super_admin';

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'student',
        phone: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('users.store'));
    };

    const availableRoles = isSuperAdmin
        ? ROLES
        : ROLES.filter((r) => r.value !== 'super_admin');

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Administration</p>
                        <h2 className="surface-title">Add New User</h2>
                    </div>
                    <Link href={route('users.index')} className="btn-outline">
                        Cancel
                    </Link>
                </div>
            }
        >
            <Head title="Add User" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="card overflow-hidden">
                    <div className="border-b border-slate-100 bg-slate-50/60 px-4 sm:px-6 py-4">
                        <h3 className="text-sm font-bold text-slate-900">
                            Account Details
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Create a new user account. The user will be required to change their password on first login.
                        </p>
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
                                <label htmlFor="password" className="input-label">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="input mt-1.5"
                                    minLength={10}
                                    required
                                />
                                <p className="mt-1 text-xs text-slate-400">
                                    Minimum 10 characters.
                                </p>
                                {errors.password && (
                                    <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password_confirmation" className="input-label">
                                    Confirm Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="input mt-1.5"
                                    minLength={10}
                                    required
                                />
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
                                {processing ? 'Creating...' : 'Create User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
