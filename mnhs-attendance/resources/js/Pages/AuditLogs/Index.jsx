import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Paginator from '@/Components/Paginator';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ logs, events, filters }) {
    const [event, setEvent] = useState(filters.event || '');

    const handleFilter = () => {
        router.get(route('audit-logs.index'), { event }, { preserveState: true });
    };

    const formatValues = (values) => {
        if (!values) return null;
        if (typeof values === 'string') {
            try {
                return JSON.parse(values);
            } catch {
                return values;
            }
        }
        return values;
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <p className="page-eyebrow">Administration</p>
                    <h2 className="surface-title">Audit Logs</h2>
                </div>
            }
        >
            <Head title="Audit Logs" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="card card-pad mb-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="sm:w-64">
                            <label className="input-label" htmlFor="event">
                                Event
                            </label>
                            <select
                                id="event"
                                value={event}
                                onChange={(e) => setEvent(e.target.value)}
                                className="input mt-1.5"
                            >
                                <option value="">All Events</option>
                                {events.map((e) => (
                                    <option key={e} value={e}>
                                        {e}
                                    </option>
                                ))}
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
                                    <th className="th">Event</th>
                                    <th className="th">Actor</th>
                                    <th className="th">Subject</th>
                                    <th className="th">IP Address</th>
                                    <th className="th">When</th>
                                    <th className="th text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="tbody">
                                {logs.data.map((log) => (
                                    <tr key={log.id}>
                                        <td className="td">
                                            <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                                {log.event}
                                            </span>
                                        </td>
                                        <td className="td font-medium text-slate-900">
                                            {log.user?.name ?? 'System'}
                                        </td>
                                        <td className="td text-slate-600">
                                            {log.auditable_type
                                                ? `${classBasename(log.auditable_type)} #${log.auditable_id}`
                                                : '—'}
                                        </td>
                                        <td className="td text-slate-500">{log.ip_address || '—'}</td>
                                        <td className="td text-slate-500">{log.created_at}</td>
                                        <td className="td text-end">
                                            <Link
                                                href={route('audit-logs.show', log.id)}
                                                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-navy-700 transition hover:bg-navy-50"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {logs.data.length === 0 && (
                                    <tr>
                                        <td className="td text-center text-sm text-slate-500" colSpan={6}>
                                            No audit logs found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Paginator meta={logs} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function classBasename(fqcn) {
    const parts = String(fqcn).split('\\');
    return parts[parts.length - 1];
}
