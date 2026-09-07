import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

const roleNames = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    teacher: 'Teacher',
    student: 'Student',
    security_guard: 'Security Guard',
};

const roleBadge = (role) => {
    const map = {
        super_admin: 'bg-purple-50 text-purple-700 ring-purple-600/20',
        admin: 'bg-blue-50 text-blue-700 ring-blue-600/20',
        teacher: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        student: 'bg-slate-100 text-slate-700 ring-slate-600/20',
        security_guard: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    };
    const dots = {
        super_admin: 'bg-purple-500',
        admin: 'bg-blue-500',
        teacher: 'bg-emerald-500',
        student: 'bg-slate-400',
        security_guard: 'bg-amber-500',
    };
    return (
        <span className={`badge ring-1 ring-inset ${map[role] || 'bg-slate-100 text-slate-700 ring-slate-600/20'}`}>
            <span className={`badge-dot ${dots[role] || 'bg-slate-400'}`} />
            {roleNames[role] || role}
        </span>
    );
};

function Dropdown({ children, trigger }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
                {trigger}
            </button>
            {open && (
                <div className="absolute right-0 z-30 mt-1 w-48 origin-top-right rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                    {typeof children === 'function' ? children(() => setOpen(false)) : children}
                </div>
            )}
        </div>
    );
}

function DropdownItem({ onClick, className = '', children }) {
    return (
        <button
            onClick={onClick}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-slate-50 ${className}`}
        >
            {children}
        </button>
    );
}

export default function Index({ users, filters }) {
    const auth = usePage().props.auth.user;
    const isSuperAdmin = auth.role === 'super_admin';

    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = () => {
        router.get(
            route('users.index'),
            { search, role, status },
            { preserveState: true },
        );
    };

    const handleToggleActive = (userId) => {
        if (!confirm('Are you sure you want to toggle this user\'s active status?')) return;
        router.post(route('users.toggle-active', userId));
    };

    const handleResetPassword = (userId) => {
        if (!confirm('Are you sure you want to reset this user\'s password? A new password will be generated.')) return;
        router.post(route('users.reset-password', userId), {}, {
            preserveState: true,
        });
    };

    const handleForcePasswordChange = (userId) => {
        router.post(route('users.force-password-change', userId));
    };

    const handleDelete = (userId) => {
        if (!confirm('Are you sure you want to delete this user? This can be undone by restoring.')) return;
        router.delete(route('users.destroy', userId));
    };

    const handleRestore = (userId) => {
        router.post(route('users.restore', userId));
    };

    const resetPasswordFlash = usePage().props.flash?.reset_password;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Administration</p>
                        <h2 className="surface-title">User Management</h2>
                    </div>
                    <Link href={route('users.create')} className="btn-primary">
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Add User
                    </Link>
                </div>
            }
        >
            <Head title="Users" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Reset Password Flash */}
                {resetPasswordFlash && (
                    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                            <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="text-sm font-semibold text-amber-800">Password Reset for {resetPasswordFlash.user_name}</p>
                                <p className="mt-1 text-sm text-amber-700">New password: <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs font-bold">{resetPasswordFlash.new_password}</code></p>
                                <p className="mt-1 text-xs text-amber-600">Copy this password now. It will not be shown again.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="card card-pad mb-6">
                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="flex-1">
                            <label className="input-label" htmlFor="search">Search</label>
                            <input
                                id="search"
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                placeholder="Search by name or email..."
                                className="input mt-1.5"
                            />
                        </div>
                        <div className="md:w-48">
                            <label className="input-label" htmlFor="role">Role</label>
                            <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="input mt-1.5">
                                <option value="">All Roles</option>
                                <option value="super_admin">Super Admin</option>
                                <option value="admin">Admin</option>
                                <option value="teacher">Teacher</option>
                                <option value="student">Student</option>
                                <option value="security_guard">Security Guard</option>
                            </select>
                        </div>
                        <div className="md:w-44">
                            <label className="input-label" htmlFor="status">Status</label>
                            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="input mt-1.5">
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="deleted">Deleted</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button onClick={handleFilter} className="btn-primary w-full md:w-auto">Filter</button>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="card overflow-hidden">
                    <div className="table-wrap">
                        <table className="table">
                            <thead className="thead">
                                <tr>
                                    <th className="th">User</th>
                                    <th className="th">Role</th>
                                    <th className="th hidden md:table-cell">Phone</th>
                                    <th className="th">Status</th>
                                    <th className="th text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="tbody">
                                {users.data.map((user) => (
                                    <tr key={user.id} className={user.deleted_at ? 'opacity-50' : ''}>
                                        <td className="td">
                                            <div className="flex items-center gap-3">
                                                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-bold text-navy-800">
                                                    {user.name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                                                </span>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{user.name}</p>
                                                    <p className="text-xs text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="td">{roleBadge(user.role)}</td>
                                        <td className="td hidden md:table-cell text-sm text-slate-600">{user.phone || '—'}</td>
                                        <td className="td">
                                            {user.deleted_at ? (
                                                <span className="badge ring-1 ring-inset bg-red-50 text-red-700 ring-red-600/20">
                                                    <span className="badge-dot bg-red-500" />
                                                    Deleted
                                                </span>
                                            ) : user.is_active ? (
                                                <span className="badge ring-1 ring-inset bg-emerald-50 text-emerald-700 ring-emerald-600/20">
                                                    <span className="badge-dot bg-emerald-500" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="badge ring-1 ring-inset bg-amber-50 text-amber-700 ring-amber-600/20">
                                                    <span className="badge-dot bg-amber-500" />
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="td text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {!user.deleted_at ? (
                                                    <Dropdown
                                                        trigger={
                                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                                                            </svg>
                                                        }
                                                    >
                                                        {(close) => (
                                                            <>
                                                                <DropdownItem onClick={() => { close(); window.location.href = route('users.edit', user); }}>
                                                                    <svg className="h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                                    </svg>
                                                                    Edit
                                                                </DropdownItem>
                                                                <DropdownItem onClick={() => { close(); handleToggleActive(user.id); }} className={user.is_active ? 'text-amber-600' : 'text-emerald-600'}>
                                                                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                                                        {user.is_active ? (
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                                        ) : (
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        )}
                                                                    </svg>
                                                                    {user.is_active ? 'Deactivate' : 'Activate'}
                                                                </DropdownItem>
                                                                <DropdownItem onClick={() => { close(); handleResetPassword(user.id); }} className="text-blue-600">
                                                                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                                                    </svg>
                                                                    Reset Password
                                                                </DropdownItem>
                                                                <DropdownItem onClick={() => { close(); handleForcePasswordChange(user.id); }} className={user.force_password_change ? 'text-purple-600' : 'text-slate-600'}>
                                                                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                                                    </svg>
                                                                    {user.force_password_change ? 'Disable Force Pw Change' : 'Force Pw Change'}
                                                                </DropdownItem>
                                                                {isSuperAdmin && (
                                                                    <div className="border-t border-slate-100">
                                                                        <DropdownItem onClick={() => { close(); handleDelete(user.id); }} className="text-red-600">
                                                                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                                            </svg>
                                                                            Delete
                                                                        </DropdownItem>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </Dropdown>
                                                ) : (
                                                    <Dropdown
                                                        trigger={
                                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                                                            </svg>
                                                        }
                                                    >
                                                        {(close) => (
                                                            <DropdownItem onClick={() => { close(); handleRestore(user.id); }} className="text-emerald-600">
                                                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                                                                </svg>
                                                                Restore
                                                            </DropdownItem>
                                                        )}
                                                    </Dropdown>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {users.data.length === 0 && (
                        <div className="px-4 py-10 text-center sm:px-6">
                            <svg className="mx-auto h-10 w-10 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                            </svg>
                            <p className="mt-3 text-sm font-medium text-slate-600">No users found</p>
                            <p className="mt-1 text-xs text-slate-400">Try a different search or filter.</p>
                        </div>
                    )}

                    {users.last_page > 1 && (
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
                            <p className="text-xs text-slate-500">
                                Showing page {users.current_page} of {users.last_page}
                            </p>
                            <div className="flex items-center gap-1">
                                {users.links.map((link, index) => {
                                    if (!link.url) {
                                        return (
                                            <span key={index} className="px-2.5 py-1.5 text-xs text-slate-400" dangerouslySetInnerHTML={{ __html: link.label }} />
                                        );
                                    }
                                    return (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold transition ${link.active ? 'bg-navy-800 text-white' : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
