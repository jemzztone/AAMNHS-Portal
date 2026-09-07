import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect } from 'react';

const roleNames = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    teacher: 'Teacher',
    student: 'Student',
    security_guard: 'Security Guard',
};

function getRoleName(role) {
    return roleNames[role] || role;
}

function statusBadge(status) {
    const map = {
        present: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        late: 'bg-amber-50 text-amber-700 ring-amber-600/20',
        absent: 'bg-red-50 text-red-700 ring-red-600/20',
    };
    return (
        <span
            className={`badge ring-1 ring-inset ${
                map[status] || 'bg-slate-100 text-slate-700 ring-slate-600/20'
            }`}
        >
            <span
                className={`badge-dot ${
                    status === 'present'
                        ? 'bg-emerald-500'
                        : status === 'late'
                          ? 'bg-amber-500'
                          : status === 'absent'
                            ? 'bg-red-500'
                            : 'bg-slate-400'
                }`}
            />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

const ICONS = {
    blue: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
        />
    ),
    green: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
    ),
    yellow: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
    ),
    red: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
    ),
};

function formatTime12(time) {
    if (!time) return '—';
    const [h, m] = time.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${m} ${ampm}`;
}

function StatCard({ title, value, color = 'blue', icon }) {
    const tones = {
        blue: 'from-navy-50 to-navy-100/60 text-navy-800 ring-navy-700/10',
        green:
            'from-emerald-50 to-emerald-100/60 text-emerald-800 ring-emerald-700/10',
        yellow:
            'from-amber-50 to-amber-100/60 text-amber-800 ring-amber-700/10',
        red: 'from-red-50 to-red-100/60 text-red-800 ring-red-700/10',
    };
    const iconTones = {
        blue: 'bg-navy-700 text-white',
        green: 'bg-emerald-600 text-white',
        yellow: 'bg-amber-500 text-white',
        red: 'bg-red-600 text-white',
    };
    return (
        <div
            className={`card flex items-center gap-4 bg-gradient-to-br p-5 ring-1 ring-inset ${tones[color]}`}
        >
            <span
                className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ${iconTones[color]}`}
            >
                <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                    stroke="currentColor"
                >
                    {icon || ICONS[color]}
                </svg>
            </span>
            <div className="min-w-0">
                <dt className="truncate text-xs font-semibold uppercase tracking-wider opacity-70">
                    {title}
                </dt>
                <dd className="mt-0.5 text-2xl sm:text-3xl font-bold tracking-tight">
                    {value ?? 0}
                </dd>
            </div>
        </div>
    );
}

export default function Dashboard({
    user,
    stats,
    recent_attendance,
    recent_scans,
    today_attendance,
    recent_slips,
    student_qr,
}) {
    const isStaff = ['super_admin', 'admin', 'teacher'].includes(user.role);
    const isGuard = user.role === 'security_guard';

    useEffect(() => {
        if (!isStaff && !isGuard) return;
        const interval = setInterval(() => {
            router.reload({
                only: ['stats', 'recent_attendance', 'recent_scans'],
            });
        }, 5000);
        return () => clearInterval(interval);
    }, [isStaff, isGuard]);

    const quickActions = [
        {
            label: 'Manage Students',
            href: 'students.index',
            show: isStaff,
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
            ),
        },
        {
            label: 'View Attendance',
            href: 'attendance.index',
            show: isStaff,
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            ),
        },
        {
            label: 'Submit Admission Slip',
            href: 'admission-slips.create',
            show: user.role === 'student',
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
            ),
        },
        {
            label: 'Scan QR Code',
            href: 'guard.scan',
            show: user.role === 'security_guard',
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75zM16.5 19.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75z"
                />
            ),
        },
        {
            label: 'Analytics',
            href: 'analytics.index',
            show: ['super_admin', 'admin'].includes(user.role),
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                />
            ),
        },
    ].filter((action) => action.show);

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Welcome banner */}
                <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-6 text-white sm:p-8">
                    <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-navy-500/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 right-32 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy-200/80">
                            Welcome back
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                            {user.name}
                        </h1>
                        <p className="mt-2 max-w-xl text-sm text-navy-100/70">
                            You are signed in as a{' '}
                            <span className="font-semibold text-white">
                                {getRoleName(user.role)}
                            </span>
                            . Here is today's snapshot for{' '}
                            {new Date().toLocaleDateString(undefined, {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                            .
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {user.role === 'student' ? (
                        <>
                            <StatCard
                                title="Total Present"
                                value={stats.total_present}
                                color="green"
                            />
                            <StatCard
                                title="Total Late"
                                value={stats.total_late}
                                color="yellow"
                            />
                            <StatCard
                                title="Total Absent"
                                value={stats.total_absent}
                                color="red"
                            />
                            <StatCard
                                title="Pending Slips"
                                value={stats.pending_slips}
                                color="blue"
                            />
                        </>
                    ) : (
                        <>
                            {user.role === 'security_guard' ? (
                                <StatCard
                                    title="Scanned Today"
                                    value={stats.scanned_today}
                                    color="blue"
                                />
                            ) : (
                                <StatCard
                                    title={
                                        user.role === 'teacher'
                                            ? 'My Students'
                                            : 'Total Students'
                                    }
                                    value={
                                        stats.my_students ||
                                        stats.total_students
                                    }
                                    color="blue"
                                />
                            )}
                            <StatCard
                                title="Present Today"
                                value={stats.present_today}
                                color="green"
                            />
                            <StatCard
                                title="Late Today"
                                value={stats.late_today}
                                color="yellow"
                            />
                            <StatCard
                                title="Absent Today"
                                value={stats.absent_today}
                                color="red"
                            />
                        </>
                    )}
                </dl>

                {/* Quick Actions */}
                {quickActions.length > 0 && (
                    <section className="card card-pad mt-8">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="surface-title">Quick Actions</h3>
                                <p className="mt-0.5 text-sm text-slate-500">
                                    Jump straight to your most-used tools.
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3">
                            {quickActions.map((action) => (
                                <Link
                                    key={action.href}
                                    href={route(action.href)}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition duration-150 ease-in-out hover:border-navy-200 hover:bg-navy-50 hover:text-navy-800 active:bg-navy-100"
                                >
                                    <svg
                                        className="h-[18px] w-[18px] text-navy-600"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.8"
                                        stroke="currentColor"
                                    >
                                        {action.icon}
                                    </svg>
                                    {action.label}
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Student view */}
                {user.role === 'student' ? (
                    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* My QR Code */}
                        <section className="card card-pad">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                                    <svg
                                        className="h-[18px] w-[18px]"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.8"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
                                        />
                                    </svg>
                                </span>
                                <h3 className="surface-title">
                                    My QR Code
                                </h3>
                            </div>
                            <div className="mt-4 text-center">
                                {student_qr?.qr_svg ? (
                                    <>
                                        <div
                                            className="mx-auto inline-block rounded-xl border border-slate-200 bg-white p-3"
                                            dangerouslySetInnerHTML={{
                                                __html: student_qr.qr_svg,
                                            }}
                                        />
                                        <p className="mt-3 text-sm font-bold text-slate-900">
                                            {student_qr.full_name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            LRN: {student_qr.lrn}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {student_qr.grade_level} — {student_qr.section}
                                        </p>
                                        <p className="mt-3 text-[11px] text-slate-400">
                                            Show this QR code at the gate for scanning.
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-sm text-slate-500">
                                        QR code not available.
                                    </p>
                                )}
                            </div>
                        </section>

                        <section className="card card-pad">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                                    <svg
                                        className="h-[18px] w-[18px]"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.8"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </span>
                                <h3 className="surface-title">
                                    Today's Attendance
                                </h3>
                            </div>
                            <div className="mt-4">
                                {today_attendance ? (
                                    <div className="flex flex-wrap items-center gap-3">
                                        {statusBadge(today_attendance.status)}
                                        <span className="text-sm text-slate-600">
                                            Time in:{' '}
                                            <span className="font-semibold text-slate-900">
                                                {formatTime12(today_attendance.time_in)}
                                            </span>
                                        </span>
                                        {today_attendance.time_out && (
                                            <span className="text-sm text-slate-600">
                                                Time out:{' '}
                                                <span className="font-semibold text-slate-900">
                                                    {formatTime12(today_attendance.time_out)}
                                                </span>
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">
                                        No attendance recorded today.
                                    </p>
                                )}
                            </div>
                        </section>

                        <section className="card card-pad">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                                    <svg
                                        className="h-[18px] w-[18px]"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.8"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                                        />
                                    </svg>
                                </span>
                                <h3 className="surface-title">
                                    Recent Admission Slips
                                </h3>
                            </div>
                            <div className="mt-4">
                                {recent_slips && recent_slips.length > 0 ? (
                                    <ul className="divide-y divide-slate-100">
                                        {recent_slips.map((slip) => (
                                            <li
                                                key={slip.id}
                                                className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                                            >
                                                <span className="text-sm text-slate-600">
                                                    {slip.absence_date}
                                                </span>
                                                {statusBadge(slip.status)}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-500">
                                        No recent slips.
                                    </p>
                                )}
                            </div>
                        </section>
                    </div>
                ) : (
                    <section className="card card-pad mt-8">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                                <svg
                                    className="h-[18px] w-[18px]"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.8"
                                    stroke="currentColor"
                                >
                                    {ICONS.green}
                                </svg>
                            </span>
                            <h3 className="surface-title">
                                {isGuard
                                    ? "Today's Recent Scans"
                                    : 'Recent Attendance'}
                            </h3>
                        </div>
                        <div className="mt-4">
                            {(isGuard ? recent_scans : recent_attendance) &&
                            (isGuard ? recent_scans : recent_attendance)
                                .length > 0 ? (
                                <div className="table-wrap">
                                    <table className="table">
                                        <thead className="thead">
                                            <tr>
                                                <th className="th">Student</th>
                                                <th className="th">Section</th>
                                                <th className="th">Status</th>
                                                <th className="th">Time In</th>
                                                <th className="th">Time Out</th>
                                            </tr>
                                        </thead>
                                        <tbody className="tbody">
                                            {(isGuard
                                                ? recent_scans
                                                : recent_attendance
                                            ).map((record) => (
                                                <tr key={record.id}>
                                                    <td className="td font-medium text-slate-900">
                                                        {
                                                            record.student
                                                                ?.full_name
                                                        }
                                                    </td>
                                                    <td className="td text-slate-600">
                                                        {
                                                            record.student
                                                                ?.section?.name
                                                        }
                                                    </td>
                                                    <td className="td">
                                                        {statusBadge(
                                                            record.status,
                                                        )}
                                                    </td>
                                                    <td className="td text-slate-600">
                                                        {formatTime12(record.time_in)}
                                                    </td>
                                                    <td className="td text-slate-600">
                                                        {formatTime12(record.time_out)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">
                                    No attendance records today.
                                </p>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
