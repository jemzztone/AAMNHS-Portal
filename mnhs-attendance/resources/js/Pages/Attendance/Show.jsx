import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

function formatTime12(time) {
    if (!time) return '—';
    const [h, m] = String(time).split(':');
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
        <span className={`badge ring-1 ring-inset ${map[status] || 'bg-slate-100 text-slate-700 ring-slate-600/20'}`}>
            <span className={`badge-dot ${status === 'present' ? 'bg-emerald-500' : status === 'late' ? 'bg-amber-500' : status === 'absent' ? 'bg-red-500' : 'bg-slate-400'}`} />
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : '—'}
        </span>
    );
}

export default function Show({ record }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Attendance</p>
                        <h2 className="surface-title">Record Details</h2>
                    </div>
                    <Link href={route('attendance.index')} className="btn-outline">
                        Back to Attendance
                    </Link>
                </div>
            }
        >
            <Head title="Attendance Record" />

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="card overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">
                                {record.student?.full_name ?? 'Student'}
                            </h3>
                            <p className="text-xs text-slate-500">
                                {record.student?.section?.name ?? 'No section'} · {record.date}
                            </p>
                        </div>
                        {statusBadge(record.status)}
                    </div>

                    <div className="card-pad grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Time In
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                                {formatTime12(record.time_in)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Time Out
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                                {record.time_out ? formatTime12(record.time_out) : 'Not clocked out'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Source
                            </p>
                            <p className="mt-1 text-sm font-medium capitalize text-slate-900">
                                {record.source ?? '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Recorded By
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                                {record.recorded_by?.name ?? 'Auto (QR scan)'}
                            </p>
                        </div>
                        {record.student?.lrn && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    LRN
                                </p>
                                <p className="mt-1 text-sm font-medium text-slate-900">{record.student.lrn}</p>
                            </div>
                        )}
                    </div>
                </div>

                {record.student?.id && (
                    <div className="mt-6 flex justify-end">
                        <Link
                            href={route('students.show', record.student.id)}
                            className="btn-outline"
                        >
                            View Student Profile
                        </Link>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
