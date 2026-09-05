import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Index({ students, sections, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [sectionId, setSectionId] = useState(filters.section_id || '');
    const { flash } = usePage().props;
    const [showImportResult, setShowImportResult] = useState(false);

    useEffect(() => {
        if (flash?.import_result) {
            setShowImportResult(true);
            const timer = setTimeout(() => setShowImportResult(false), 10000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const handleSearch = () => {
        router.get(
            route('students.index'),
            { search, section_id: sectionId },
            { preserveState: true },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Registry</p>
                        <h2 className="surface-title">Students</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('students.import-csv')}
                            className="btn-outline"
                        >
                            <svg
                                className="h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                                />
                            </svg>
                            Import CSV
                        </Link>
                        <Link
                            href={route('students.create')}
                            className="btn-primary"
                        >
                            <svg
                                className="h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4.5v15m7.5-7.5h-15"
                                />
                            </svg>
                            Add Student
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Students" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Import Result Alert */}
                {showImportResult && flash?.import_result && (
                    <div className={`mb-6 rounded-xl border p-4 ${
                        flash.import_result.failed > 0
                            ? 'border-amber-200 bg-amber-50'
                            : 'border-emerald-200 bg-emerald-50'
                    }`}>
                        <div className="flex items-start gap-3">
                            {flash.import_result.failed > 0 ? (
                                <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                            ) : (
                                <svg className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                            <div>
                                <p className={`text-sm font-semibold ${
                                    flash.import_result.failed > 0 ? 'text-amber-800' : 'text-emerald-800'
                                }`}>
                                    Import Complete
                                </p>
                                <p className={`mt-1 text-sm ${
                                    flash.import_result.failed > 0 ? 'text-amber-700' : 'text-emerald-700'
                                }`}>
                                    {flash.import_result.success} student(s) imported successfully.
                                    {flash.import_result.failed > 0 && (
                                        <> {flash.import_result.failed} failed.</>
                                    )}
                                </p>
                                {flash.import_result.errors?.length > 0 && (
                                    <ul className="mt-2 space-y-1 text-xs text-amber-600">
                                        {flash.import_result.errors.slice(0, 5).map((error, i) => (
                                            <li key={i}>• {error}</li>
                                        ))}
                                        {flash.import_result.errors.length > 5 && (
                                            <li>• ...and {flash.import_result.errors.length - 5} more</li>
                                        )}
                                    </ul>
                                )}
                            </div>
                            <button
                                onClick={() => setShowImportResult(false)}
                                className="ms-auto shrink-0 text-slate-400 hover:text-slate-600"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="card card-pad mb-6">
                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="relative flex-1">
                            <svg
                                className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.8"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by name or LRN..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && handleSearch()
                                }
                                className="input ps-9"
                            />
                        </div>
                        <div className="md:w-56">
                            <select
                                value={sectionId}
                                onChange={(e) => setSectionId(e.target.value)}
                                className="input"
                            >
                                <option value="">All Sections</option>
                                {sections.map((section) => (
                                    <option key={section.id} value={section.id}>
                                        {section.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleSearch}
                            className="btn-primary shrink-0"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Students Table */}
                <div className="card overflow-hidden">
                    <div className="table-wrap">
                        <table className="table">
                            <thead className="thead">
                                <tr>
                                    <th className="th">Name</th>
                                    <th className="th">LRN</th>
                                    <th className="th">Section</th>
                                    <th className="th">Status</th>
                                    <th className="th text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="tbody">
                                {students.data.map((student) => (
                                    <tr key={student.id}>
                                        <td className="td">
                                            <div className="flex items-center gap-3">
                                                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-bold text-navy-800">
                                                    {student.full_name
                                                        .split(' ')
                                                        .map((part) => part[0])
                                                        .slice(0, 2)
                                                        .join('')
                                                        .toUpperCase()}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-slate-900">
                                                        {student.full_name}
                                                    </p>
                                                    <p className="truncate text-xs text-slate-400">
                                                        {student.guardian_email
                                                            ? 'Guardian notified by email'
                                                            : 'No guardian email'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="td font-mono text-xs text-slate-600">
                                            {student.lrn}
                                        </td>
                                        <td className="td text-slate-600">
                                            <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                                {student.section?.name || '—'}
                                            </span>
                                        </td>
                                        <td className="td">
                                            <span
                                                className={`badge ring-1 ring-inset ${
                                                    student.is_active
                                                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                                                        : 'bg-red-50 text-red-700 ring-red-600/20'
                                                }`}
                                            >
                                                <span
                                                    className={`badge-dot ${
                                                        student.is_active
                                                            ? 'bg-emerald-500'
                                                            : 'bg-red-500'
                                                    }`}
                                                />
                                                {student.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="td text-end">
                                            <div className="inline-flex items-center gap-1">
                                                <Link
                                                    href={route(
                                                        'students.show',
                                                        student,
                                                    )}
                                                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-navy-700 transition hover:bg-navy-50"
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    href={route(
                                                        'students.edit',
                                                        student,
                                                    )}
                                                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                                                >
                                                    Edit
                                                </Link>
                                                <Link
                                                    href={route(
                                                        'students.print-qr',
                                                        student,
                                                    )}
                                                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                                                >
                                                    Print QR
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {students.data.length === 0 && (
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
                                    d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                                />
                            </svg>
                            <p className="mt-3 text-sm font-medium text-slate-600">
                                No students found
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                Try adjusting your search or section filter.
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {students.last_page > 1 && (
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
                            <p className="text-xs text-slate-500">
                                Showing page {students.current_page} of{' '}
                                {students.last_page}
                            </p>
                            <div className="flex items-center gap-1">
                                {students.links.map((link, index) => {
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
