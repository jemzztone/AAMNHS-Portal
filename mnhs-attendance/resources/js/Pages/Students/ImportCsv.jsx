import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function ImportCsv({ sections, user, xlsxSupported = false }) {
    const { props: { flash } } = usePage();
    const { data, setData, post, processing, errors } = useForm({
        csv_file: null,
        section_id: '',
    });

    // Determine allowed file types based on user role
    const userRole = user?.role || '';
    const isAdminOrTeacher = userRole === 'admin' || userRole === 'teacher';
    
    // Only allow XLSX if: admin/teacher AND server supports ZipArchive
    const allowXlsx = isAdminOrTeacher && xlsxSupported;
    
    // Build accept attribute: always CSV/TXT, XLSX/XLS only if allowed
    const fileTypes = ['.csv', '.txt'];
    if (allowXlsx) {
        fileTypes.push('.xlsx', '.xls');
    }
    const acceptedFileTypes = fileTypes.join(',');

    const [dragActive, setDragActive] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('students.import-csv.store'));
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setData('csv_file', e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setData('csv_file', e.target.files[0]);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Students</p>
                        <h2 className="surface-title">Import CSV</h2>
                    </div>
                    <Link href={route('students.index')} className="btn-outline">
                        Back to Students
                    </Link>
                </div>
            }
        >
            <Head title="Import Students CSV" />

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Instructions */}
                <div className="card card-pad mb-6">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            </svg>
                        </span>
                        <h3 className="surface-title">File Format</h3>
                    </div>
                    <div className="mt-4 rounded-xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-200">
                        <p className="text-sm font-medium text-slate-700">Required columns:</p>
                        <code className="mt-2 block rounded-lg bg-white px-3 py-2 text-xs font-mono text-slate-600 ring-1 ring-inset ring-slate-200">
                            first_name,last_name,lrn
                        </code>
                        <p className="mt-3 text-sm font-medium text-slate-700">Optional columns:</p>
                        <code className="mt-2 block rounded-lg bg-white px-3 py-2 text-xs font-mono text-slate-600 ring-1 ring-inset ring-slate-200">
                            middle_name,guardian_name,guardian_email
                        </code>
                        <p className="mt-3 text-xs text-slate-500">
                            Example: <span className="font-mono">Juan,Dela Cruz,2026-00001,,Parent Juan,juan.parent@email.com</span>
                        </p>
                        {isAdminOrTeacher && (
                            <div className="mt-3 rounded-lg bg-slate-50 p-3 ring-1 ring-inset ring-slate-200">
                                {xlsxSupported ? (
                                    <div className="flex items-center gap-2">
                                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-xs font-medium text-slate-700">
                                                Excel files supported
                                            </p>
                                            <p className="text-[11px] text-slate-400">
                                                You can import .xlsx or .xls files in addition to CSV.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                        </svg>
                                        <div>
                                            <p className="text-xs font-medium text-slate-500">
                                                CSV files only
                                            </p>
                                            <p className="text-[11px] text-slate-400">
                                                Excel (.xlsx) import is not configured on this server.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <button
                            onClick={() =>
                                (window.location.href = route(
                                    'students.import-csv.template',
                                ))
                            }
                            className="btn-outline mt-4"
                        >
                            <svg
                                className="h-4 w-4"
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
                            Download CSV Template
                        </button>
                    </div>
                </div>

                {/* Upload Form */}
                <form onSubmit={submit}>
                    <div className="card card-pad">
                        <div className="flex items-center gap-3 mb-5">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                            </span>
                            <h3 className="surface-title">Upload File</h3>
                        </div>

                        {/* Section Select */}
                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-slate-700">
                                Assign to Section (optional)
                            </label>
                            <select
                                value={data.section_id}
                                onChange={(e) => setData('section_id', e.target.value)}
                                className="input mt-1"
                            >
                                <option value="">No section assigned</option>
                                {sections.map((section) => (
                                    <option key={section.id} value={section.id}>
                                        {section.name}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-slate-400">
                                If no section is selected, you can assign sections later.
                            </p>
                        </div>

                        {/* Drag & Drop Zone */}
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`relative rounded-xl border-2 border-dashed p-4 sm:p-8 text-center transition ${
                                dragActive
                                    ? 'border-navy-400 bg-navy-50'
                                    : data.csv_file
                                        ? 'border-emerald-300 bg-emerald-50'
                                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                            }`}
                        >
                            <input
                                type="file"
                                accept={acceptedFileTypes}
                                onChange={handleFileChange}
                                className="absolute inset-0 cursor-pointer opacity-0"
                            />

                            {data.csv_file ? (
                                <div>
                                    <svg className="mx-auto h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                    <p className="mt-2 text-sm font-semibold text-emerald-700">
                                        {data.csv_file.name}
                                    </p>
                                    <p className="mt-1 text-xs text-emerald-500">
                                        {(data.csv_file.size / 1024).toFixed(1)} KB — Click or drop to replace
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <svg className="mx-auto h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                    </svg>
                                    <p className="mt-2 text-sm font-semibold text-slate-700">
                                        Drop your CSV file here, or click to browse
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Max file size: 10MB
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {isAdminOrTeacher && xlsxSupported
                                            ? 'Accepted formats: CSV (.csv, .txt), Excel (.xlsx, .xls)'
                                            : 'Accepted formats: CSV (.csv, .txt)'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {errors.csv_file && (
                            <p className="mt-2 text-sm text-red-600">{errors.csv_file}</p>
                        )}

                        {/* Submit */}
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <Link href={route('students.index')} className="btn-outline">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={!data.csv_file || processing}
                                className="btn-primary"
                            >
                                {processing ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Importing...
                                    </>
                                ) : (
                                    'Import Students'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
