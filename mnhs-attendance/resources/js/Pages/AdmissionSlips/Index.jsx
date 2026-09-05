import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

function statusBadge(status) {
    const map = {
        pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
        approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        rejected: 'bg-red-50 text-red-700 ring-red-600/20',
    };
    return (
        <span
            className={`badge ring-1 ring-inset ${
                map[status] || 'bg-slate-100 text-slate-700 ring-slate-600/20'
            }`}
        >
            <span
                className={`badge-dot ${
                    status === 'pending'
                        ? 'bg-amber-500'
                        : status === 'approved'
                          ? 'bg-emerald-500'
                          : status === 'rejected'
                            ? 'bg-red-500'
                            : 'bg-slate-400'
                }`}
            />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

export default function Index({ slips, filters }) {
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = () => {
        router.get(
            route('admission-slips.index'),
            { status },
            { preserveState: true },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Gate Policy</p>
                        <h2 className="surface-title">Admission Slips</h2>
                    </div>
                </div>
            }
        >
            <Head title="Admission Slips" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Filters */}
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
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <button onClick={handleFilter} className="btn-primary">
                            Filter
                        </button>
                    </div>
                </div>

                {/* Slips Table */}
                <div className="card overflow-hidden">
                    <div className="table-wrap">
                        <table className="table">
                            <thead className="thead">
                                <tr>
                                    <th className="th">Student</th>
                                    <th className="th">Section</th>
                                    <th className="th">Absence Date</th>
                                    <th className="th">Status</th>
                                    <th className="th text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="tbody">
                                {slips.data.map((slip) => (
                                    <tr key={slip.id}>
                                        <td className="td">
                                            <div className="flex items-center gap-3">
                                                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-bold text-navy-800">
                                                    {slip.student?.full_name
                                                        ?.split(' ')
                                                        .map((part) => part[0])
                                                        .slice(0, 2)
                                                        .join('')
                                                        .toUpperCase()}
                                                </span>
                                                <span className="font-semibold text-slate-900">
                                                    {
                                                        slip.student?.full_name
                                                    }
                                                </span>
                                            </div>
                                        </td>
                                        <td className="td">
                                            <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                                {slip.student?.section?.name ||
                                                    '—'}
                                            </span>
                                        </td>
                                        <td className="td text-slate-600">
                                            {slip.absence_date}
                                        </td>
                                        <td className="td">
                                            {statusBadge(slip.status)}
                                        </td>
                                        <td className="td text-end">
                                            <Link
                                                href={route(
                                                    'admission-slips.show',
                                                    slip,
                                                )}
                                                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-navy-700 transition hover:bg-navy-50"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {slips.data.length === 0 && (
                        <div className="px-6 py-16 text-center">
                            <svg
                                className="mx-auto h-10 w-10 text-slate-300"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                                />
                            </svg>
                            <p className="mt-3 text-sm font-medium text-slate-600">
                                No admission slips found
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                Adjust the status filter to see more results.
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {slips.last_page > 1 && (
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
                            <p className="text-xs text-slate-500">
                                Showing page {slips.current_page} of{' '}
                                {slips.last_page}
                            </p>
                            <div className="flex items-center gap-1">
                                {slips.links.map((link, index) => {
                                    if (!link.url) {
                                        return (
                                            <span
                                                key={index}
                                                className="px-2.5 py-1.5 text-xs text-slate-400"
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        );
                                    }
                                    return (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                                link.active
                                                    ? 'bg-navy-800 text-white'
                                                    : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50'
                                            }`}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
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
