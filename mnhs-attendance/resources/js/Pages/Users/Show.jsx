import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ user }) {
    const roleNames = {
        super_admin: 'Super Admin',
        admin: 'Admin',
        teacher: 'Teacher',
        student: 'Student',
        security_guard: 'Security Guard',
    };

    const initials = (user.name || 'U')
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">User Management</p>
                        <h2 className="surface-title">{user.name}</h2>
                    </div>
                    <Link href={route('users.index')} className="btn-outline">
                        Back to List
                    </Link>
                </div>
            }
        >
            <Head title={`User ${user.name}`} />

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="card overflow-hidden">
                    <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-50/60 px-6 py-5">
                        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy-500 to-navy-700 text-lg font-bold text-white ring-1 ring-navy-600/20">
                            {initials}
                        </span>
                        <div className="min-w-0">
                            <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
                            <p className="truncate text-sm text-slate-500">{user.email}</p>
                        </div>
                    </div>

                    <div className="card-pad grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Role
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                                {roleNames[user.role] ?? user.role}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Status
                            </p>
                            <p className="mt-1">
                                <span
                                    className={`badge ring-1 ring-inset ${
                                        user.is_active
                                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                                            : 'bg-red-50 text-red-700 ring-red-600/20'
                                    }`}
                                >
                                    <span className={`badge-dot ${user.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    {user.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Phone
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{user.phone || '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Joined
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                                {user.created_at}
                            </p>
                        </div>
                    </div>
                </div>

                {user.student && (
                    <div className="card overflow-hidden mt-6">
                        <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                            <h3 className="text-sm font-bold text-slate-900">Linked Student Profile</h3>
                        </div>
                        <div className="card-pad">
                            <p className="text-sm font-medium text-slate-900">{user.student.full_name}</p>
                            <p className="mt-0.5 text-xs text-slate-500">LRN: {user.student.lrn}</p>
                            <Link
                                href={route('students.show', user.student.id)}
                                className="mt-3 inline-block rounded-lg px-2.5 py-1.5 text-xs font-semibold text-navy-700 transition hover:bg-navy-50"
                            >
                                View Student →
                            </Link>
                        </div>
                    </div>
                )}

                {user.teacher_assignments?.length > 0 && (
                    <div className="card overflow-hidden mt-6">
                        <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                            <h3 className="text-sm font-bold text-slate-900">Assigned Sections</h3>
                        </div>
                        <ul className="divide-y divide-slate-100">
                            {user.teacher_assignments.map((assignment) => (
                                <li key={assignment.id} className="flex items-center justify-between px-6 py-3.5">
                                    <span className="text-sm font-medium text-slate-900">
                                        {assignment.section?.name ?? '—'}
                                    </span>
                                    {assignment.section?.id && (
                                        <Link
                                            href={route('sections.show', assignment.section.id)}
                                            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-navy-700 transition hover:bg-navy-50"
                                        >
                                            View
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
