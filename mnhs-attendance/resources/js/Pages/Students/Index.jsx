import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

const ALLOWED_ROLES = ['super_admin', 'admin'];

function canImport({ user }) {
    return ALLOWED_ROLES.includes(user?.role);
}

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

function DropdownItem({ href, onClick, className = '', children }) {
    const content = (
        <span className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-slate-50 ${className}`}>
            {children}
        </span>
    );
    return href ? (
        <Link href={href} className="block">{content}</Link>
    ) : (
        <button onClick={onClick} className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-slate-50 ${className}`}>
            {children}
        </button>
    );
}

export default function Index({ students, sections, filters, user }) {
    const [search, setSearch] = useState(filters.search || '');
    const [sectionId, setSectionId] = useState(filters.section_id || '');
    const { flash } = usePage().props;
    const [showImportResult, setShowImportResult] = useState(false);
    const canImportStudents = canImport({ user });
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const searchWrapRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (flash?.import_result) {
            setShowImportResult(true);
            const timer = setTimeout(() => setShowImportResult(false), 10000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    useEffect(() => {
        const handler = (e) => {
            if (
                searchWrapRef.current &&
                !searchWrapRef.current.contains(e.target)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSearch = () => {
        setShowSuggestions(false);
        router.get(
            route('students.index'),
            { search, section_id: sectionId },
            { preserveState: true },
        );
    };

    const handleSearchChange = (value) => {
        setSearch(value);
        setShowSuggestions(false);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        const q = value.trim();
        if (q.length < 2) {
            setSuggestions([]);
            return;
        }

        setSuggestionsLoading(true);
        debounceRef.current = setTimeout(() => {
            fetch(`${route('students.suggestions')}?q=${encodeURIComponent(q)}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            })
                .then((res) => res.json())
                .then((data) => {
                    setSuggestions(data || []);
                    setShowSuggestions(true);
                })
                .catch(() => setSuggestions([]))
                .finally(() => setSuggestionsLoading(false));
        }, 250);
    };

    const pickSuggestion = (suggestion) => {
        setSearch(suggestion.full_name);
        setShowSuggestions(false);
        router.get(
            route('students.index'),
            { search: suggestion.full_name, section_id: sectionId },
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
                            href={route('students.bulk-print-qr')}
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
                                    d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659"
                                />
                            </svg>
                            Bulk Print QR
                        </Link>
                        {canImportStudents && (
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
                        )}
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
                        <div className="relative flex-1" ref={searchWrapRef}>
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
                                onChange={(e) => handleSearchChange(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSearch();
                                    if (e.key === 'Escape')
                                        setShowSuggestions(false);
                                }}
                                className="input ps-9"
                            />

                            {/* Autocomplete suggestions */}
                            {showSuggestions && (
                                <div className="absolute inset-x-0 z-30 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                                    {suggestionsLoading ? (
                                        <p className="px-4 py-3 text-sm text-slate-400">
                                            Searching...
                                        </p>
                                    ) : suggestions.length > 0 ? (
                                        <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
                                            {suggestions.map((suggestion) => (
                                                <li key={suggestion.id}>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            pickSuggestion(
                                                                suggestion,
                                                            )
                                                        }
                                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-navy-50"
                                                    >
                                                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-100 text-[10px] font-bold text-navy-800">
                                                            {suggestion.full_name
                                                                .split(' ')
                                                                .map((p) => p[0])
                                                                .slice(0, 2)
                                                                .join('')
                                                                .toUpperCase()}
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block truncate text-sm font-semibold text-slate-900">
                                                                {
                                                                    suggestion.full_name
                                                                }
                                                            </span>
                                                            <span className="block truncate text-xs text-slate-400">
                                                                {suggestion.section
                                                                    ? `${suggestion.section} · `
                                                                    : ''}
                                                                LRN{' '}
                                                                {suggestion.lrn}
                                                            </span>
                                                        </span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="px-4 py-3 text-sm text-slate-400">
                                            No matching students found.
                                        </p>
                                    )}
                                </div>
                            )}
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
                                                {student.photo_url ? (
                                                    <img
                                                        src={student.photo_url}
                                                        alt={student.full_name}
                                                        className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-inset ring-slate-200"
                                                    />
                                                ) : (
                                                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-bold text-navy-800">
                                                        {student.full_name
                                                            .split(' ')
                                                            .map((part) => part[0])
                                                            .slice(0, 2)
                                                            .join('')
                                                            .toUpperCase()}
                                                    </span>
                                                )}
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
                                            <Dropdown
                                                trigger={
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                                                    </svg>
                                                }
                                            >
                                                {(close) => (
                                                    <>
                                                        <DropdownItem href={route('students.show', student)} onClick={close}>
                                                            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                            View
                                                        </DropdownItem>
                                                        <DropdownItem href={route('students.edit', student)} onClick={close}>
                                                            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                                                            Edit
                                                        </DropdownItem>
                                                        <DropdownItem href={route('students.print-qr', student)} onClick={close}>
                                                            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659" /></svg>
                                                            Print QR
                                                        </DropdownItem>
                                                    </>
                                                )}
                                            </Dropdown>
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
