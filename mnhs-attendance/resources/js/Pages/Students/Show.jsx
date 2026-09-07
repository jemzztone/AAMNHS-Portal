import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

function formatTime12(time) {
    if (!time) return '—';
    const [h, m] = time.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${m} ${ampm}`;
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

function InfoItem({ label, value }) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {label}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
                {value || '—'}
            </p>
        </div>
    );
}

export default function Show({ student, qr_svg }) {
    const initials = student.full_name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Students</p>
                        <h2 className="surface-title">{student.full_name}</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href={route('students.index')} className="btn-outline">
                            Back
                        </Link>
                        <Link
                            href={route('students.edit', student)}
                            className="btn-outline"
                        >
                            <svg
                                className="h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.8"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                                />
                            </svg>
                            Edit
                        </Link>
                        <Link
                            href={route('students.print-qr', student)}
                            className="btn-primary"
                        >
                            <svg
                                className="h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.8"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5z"
                                />
                            </svg>
                            Print QR
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={student.full_name} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Identity card */}
                <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-6 text-white sm:p-8">
                    <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-navy-500/20 blur-3xl" />
                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                        {student.photo_url ? (
                            <img
                                src={student.photo_url}
                                alt={student.full_name}
                                className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-2 ring-white/20"
                            />
                        ) : (
                            <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold ring-1 ring-white/20">
                                {initials}
                            </span>
                        )}
                        <div className="min-w-0">
                            <p className="text-lg font-bold">
                                {student.full_name}
                            </p>
                            <p className="mt-1 text-sm text-navy-100/70">
                                LRN {student.lrn}
                            </p>
                        </div>
                        <div className="sm:ms-auto">
                            <span
                                className={`badge ring-1 ring-inset ${
                                    student.is_active
                                        ? 'bg-emerald-400/15 text-emerald-300 ring-emerald-300/30'
                                        : 'bg-red-400/15 text-red-300 ring-red-300/30'
                                }`}
                            >
                                <span
                                    className={`badge-dot ${
                                        student.is_active
                                            ? 'bg-emerald-400'
                                            : 'bg-red-400'
                                    }`}
                                />
                                {student.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Info */}
                    <div className="card card-pad lg:col-span-1">
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
                                        d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
                                    />
                                </svg>
                            </span>
                            <h3 className="surface-title">
                                Student Information
                            </h3>
                        </div>
                        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5">
                            <InfoItem label="LRN" value={student.lrn} />
                            <InfoItem
                                label="Grade Level"
                                value={
                                    student.section?.grade_level?.name
                                }
                            />
                            <InfoItem
                                label="Section"
                                value={student.section?.name}
                            />
                            <InfoItem
                                label="Guardian"
                                value={student.guardian_name}
                            />
                            <div className="col-span-2">
                                <InfoItem
                                    label="Guardian Email"
                                    value={student.guardian_email}
                                />
                            </div>
                        </dl>
                    </div>

                    {/* QR Code */}
                    <div className="card card-pad lg:col-span-2">
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
                                        d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z"
                                    />
                                </svg>
                            </span>
                            <h3 className="surface-title">QR Code</h3>
                        </div>
                        <div className="mt-5 flex flex-col items-start gap-6 sm:flex-row">
                            {qr_svg && (
                                <div
                                    className="shrink-0 rounded-2xl border border-slate-200 bg-white p-3"
                                    dangerouslySetInnerHTML={{
                                        __html: qr_svg,
                                    }}
                                />
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    QR Token
                                </p>
                                <p className="mt-2 break-all rounded-xl bg-slate-50 px-4 py-3 font-mono text-xs leading-relaxed text-slate-700 ring-1 ring-inset ring-slate-200">
                                    {student.qr_token}
                                </p>
                                <p className="mt-3 text-xs text-slate-500">
                                    Guards scan this QR at the gate to record
                                    time-in.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Attendance */}
                    <div className="card overflow-hidden lg:col-span-3">
                        <div className="flex items-center gap-3 border-b border-slate-100 px-4 sm:px-6 py-5">
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
                                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                                    />
                                </svg>
                            </span>
                            <h3 className="surface-title">Recent Attendance</h3>
                        </div>
                        {student.attendance_records &&
                        student.attendance_records.length > 0 ? (
                            <div className="table-wrap">
                                <table className="table">
                                    <thead className="thead">
                                        <tr>
                                            <th className="th">Date</th>
                                            <th className="th">Status</th>
                                            <th className="th">Time In</th>
                                            <th className="th">Source</th>
                                        </tr>
                                    </thead>
                                    <tbody className="tbody">
                                        {student.attendance_records.map(
                                            (record) => (
                                                <tr key={record.id}>
                                                    <td className="td text-slate-900">
                                                        {record.date}
                                                    </td>
                                                    <td className="td">
                                                        {statusBadge(
                                                            record.status,
                                                        )}
                                                    </td>
                                                    <td className="td text-slate-600">
                                                        {formatTime12(record.time_in)}
                                                    </td>
                                                    <td className="td capitalize text-slate-600">
                                                        {record.source}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="px-6 py-10 text-sm text-slate-500">
                                No attendance records found.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
