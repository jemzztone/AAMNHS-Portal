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

export default function Index({ notifications, filters }) {
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = () => {
        router.get(route('guardian-notifications.index'), { status }, { preserveState: true });
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
                                        <td className="td">{statusBadge(n.status)}</td>
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
