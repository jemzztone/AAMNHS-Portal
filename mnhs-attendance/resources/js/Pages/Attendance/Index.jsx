import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

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

export default function Index({ records, sections, filters }) {
    const [date, setDate] = useState(
        filters.date || new Date().toISOString().split('T')[0],
    );
    const [sectionId, setSectionId] = useState(filters.section_id || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = () => {
        router.get(
            route('attendance.index'),
            { date, section_id: sectionId, status },
            { preserveState: true },
        );
    };

    const handleExport = () => {
        window.location.href = route('attendance.export', {
            start_date: date,
            end_date: date,
            section_id: sectionId,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Monitoring</p>
                        <h2 className="surface-title">Attendance Records</h2>
                    </div>
                    <button onClick={handleExport} className="btn-outline">
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
                                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                            />
                        </svg>
                        Export CSV
                    </button>
                </div>
            }
        >
            <Head title="Attendance" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Filters */}
                <div className="card card-pad mb-6">
                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="md:w-52">
                            <label className="input-label" htmlFor="date">
                                Date
                            </label>
                            <input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="input mt-1.5"
                            />
                        </div>
                        <div className="md:w-56">
                            <label className="input-label" htmlFor="section">
                                Section
                            </label>
                            <select
                                id="section"
                                value={sectionId}
                                onChange={(e) => setSectionId(e.target.value)}
                                className="input mt-1.5"
                            >
                                <option value="">All Sections</option>
                                {sections.map((section) => (
                                    <option key={section.id} value={section.id}>
                                        {section.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="md:w-48">
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
                                <option value="present">Present</option>
                                <option value="late">Late</option>
                                <option value="absent">Absent</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button onClick={handleFilter} className="btn-primary">
                                Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Attendance Table */}
                <div className="card overflow-hidden">
                    <div className="table-wrap">
                        <table className="table">
                            <thead className="thead">
                                <tr>
                                    <th className="th">Student</th>
                                    <th className="th">LRN</th>
                                    <th className="th">Section</th>
                                    <th className="th">Status</th>
                                    <th className="th">Time In</th>
                                    <th className="th">Time Out</th>
                                    <th className="th">Source</th>
                                </tr>
                            </thead>
                            <tbody className="tbody">
                                {records.data.map((record) => (
                                    <tr key={record.id}>
                                        <td className="td">
                                            <div className="flex items-center gap-3">
                                                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-bold text-navy-800">
                                                    {record.student?.full_name
                                                        ?.split(' ')
                                                        .map((part) => part[0])
                                                        .slice(0, 2)
                                                        .join('')
                                                        .toUpperCase()}
                                                </span>
                                                <span className="font-semibold text-slate-900">
                                                    {
                                                        record.student
                                                            ?.full_name
                                                    }
                                                </span>
                                            </div>
                                        </td>
                                        <td className="td font-mono text-xs text-slate-600">
                                            {record.student?.lrn}
                                        </td>
                                        <td className="td">
                                            <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                                {record.student?.section?.name || '—'}
                                            </span>
                                        </td>
                                        <td className="td">
                                            {statusBadge(record.status)}
                                        </td>
                                        <td className="td font-mono text-slate-600">
                                            {record.time_in || '—'}
                                        </td>
                                        <td className="td font-mono text-slate-600">
                                            {record.time_out || '—'}
                                        </td>
                                        <td className="td">
                                            <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-600">
                                                {record.source}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {records.data.length === 0 && (
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
                                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                                />
                            </svg>
                            <p className="mt-3 text-sm font-medium text-slate-600">
                                No attendance records found
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                Try a different date, section, or status filter.
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {records.last_page > 1 && (
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
                            <p className="text-xs text-slate-500">
                                Showing page {records.current_page} of{' '}
                                {records.last_page}
                            </p>
                            <div className="flex items-center gap-1">
                                {records.links.map((link, index) => {
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
