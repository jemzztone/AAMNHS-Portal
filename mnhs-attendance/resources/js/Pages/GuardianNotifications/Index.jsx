import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Paginator from '@/Components/Paginator';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

function statusBadge(status) {
    const map = {
        pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
        sent: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        failed: 'bg-red-50 text-red-700 ring-red-600/20',
    };
    return (
        <span className={`badge ring-1 ring-inset ${map[status] || 'bg-slate-100 text-slate-700 ring-slate-600/20'}`}>
            <span className={`badge-dot ${status === 'sent' ? 'bg-emerald-500' : status === 'failed' ? 'bg-red-500' : status === 'pending' ? 'bg-amber-500' : 'bg-slate-400'}`} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

function SummaryCard({ label, value, tone, onClick, active }) {
    const tones = {
        pending: 'text-amber-700',
        sent: 'text-emerald-700',
        failed: 'text-red-700',
        total: 'text-slate-900',
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className={`card card-pad flex flex-col items-start text-left transition hover:-translate-y-0.5 hover:shadow-md ${active ? 'ring-2 ring-navy-500' : ''}`}
        >
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
            <span className={`mt-1 text-2xl font-bold ${tones[tone]}`}>{value}</span>
        </button>
    );
}

export default function Index({ notifications, filters, stats, mail }) {
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = () => {
        router.get(route('guardian-notifications.index'), { status }, { preserveState: true });
    };

    const selectStatus = (value) => {
        setStatus(value);
        router.get(route('guardian-notifications.index'), { status: value }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <p className="page-eyebrow">Communications</p>
                    <h2 className="surface-title">Guardian Notifications</h2>
                </div>
            }
        >
            <Head title="Guardian Notifications" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {!mail.configured && (
                    <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4">
                        <p className="text-sm font-semibold text-amber-900">Email delivery is not configured</p>
                        <p className="mt-1 text-sm text-amber-800">
                            The application is using the <code className="font-mono">{mail.mailer}</code> mail transport, so no
                            email leaves the server and every guardian notification is marked as failed. Set{' '}
                            <code className="font-mono">MAIL_MAILER</code>, <code className="font-mono">MAIL_HOST</code>,
                            {' '}<code className="font-mono">MAIL_USERNAME</code>, and <code className="font-mono">MAIL_PASSWORD</code> in the
                            environment, then redeploy.
                        </p>
                    </div>
                )}

                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <SummaryCard label="Pending" value={stats.pending} tone="pending" active={status === 'pending'} onClick={() => selectStatus('pending')} />
                    <SummaryCard label="Sent" value={stats.sent} tone="sent" active={status === 'sent'} onClick={() => selectStatus('sent')} />
                    <SummaryCard label="Failed" value={stats.failed} tone="failed" active={status === 'failed'} onClick={() => selectStatus('failed')} />
                    <SummaryCard label="Total" value={stats.total} tone="total" active={status === ''} onClick={() => selectStatus('')} />
                </div>

                <div className="card card-pad mb-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="sm:w-56">
                            <label className="input-label" htmlFor="status">
                                Status
                            </label>
                            <select
                                id="status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="input mt-1.5"
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="sent">Sent</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                        <button onClick={handleFilter} className="btn-primary">
                            Filter
                        </button>
                    </div>
                </div>

                <div className="card overflow-hidden">
                    <div className="table-wrap">
                        <table className="table">
                            <thead className="thead">
                                <tr>
                                    <th className="th">Student</th>
                                    <th className="th">Guardian Email</th>
                                    <th className="th">Subject</th>
                                    <th className="th">Status</th>
                                    <th className="th">When</th>
                                    <th className="th text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="tbody">
                                {notifications.data.map((n) => (
                                    <tr key={n.id}>
                                        <td className="td font-medium text-slate-900">
                                            {n.student?.full_name ?? '—'}
                                        </td>
                                        <td className="td text-slate-600">{n.guardian_email}</td>
                                        <td className="td max-w-xs truncate text-slate-600">{n.subject}</td>
                                        <td className="td">
                            {statusBadge(n.status)}
                            {n.status === 'failed' && n.failure_reason && (
                                <p className="mt-1 max-w-[16rem] truncate text-xs text-red-600" title={n.failure_reason}>
                                    {n.failure_reason}
                                </p>
                            )}
                        </td>
                                        <td className="td text-slate-500">{n.sent_at || n.created_at}</td>
                                        <td className="td text-end">
                                            <Link
                                                href={route('guardian-notifications.show', n.id)}
                                                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-navy-700 transition hover:bg-navy-50"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {notifications.data.length === 0 && (
                                    <tr>
                                        <td className="td text-center text-sm text-slate-500" colSpan={6}>
                                            No notifications found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Paginator meta={notifications} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
