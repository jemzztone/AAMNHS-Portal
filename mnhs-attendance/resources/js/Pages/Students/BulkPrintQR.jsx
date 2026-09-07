import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function BulkPrintQR({ students, sections, gradeLevels, filters }) {
    const { auth } = usePage().props;
    const [selectedSection, setSelectedSection] = useState(filters.section_id || '');
    const [selectedGradeLevel, setSelectedGradeLevel] = useState(filters.grade_level_id || '');

    const handleFilter = () => {
        const params = {};
        if (selectedSection) {
            params.section_id = selectedSection;
        } else if (selectedGradeLevel) {
            params.grade_level_id = selectedGradeLevel;
        }
        router.get(route('students.bulk-print-qr'), params, { preserveState: true });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Students</p>
                        <h2 className="surface-title">Bulk Print QR Codes</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href={route('students.index')} className="btn-outline">
                            Back to Students
                        </Link>
                        {students.length > 0 && (
                            <button onClick={handlePrint} className="btn-primary">
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659" />
                                </svg>
                                Print All ({students.length})
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Bulk Print QR Codes" />

            <style>{`
                /* Force QR SVG to respect container size */
                .qr-card .qr-box svg,
                .qr-card .qr-box img {
                    width: 100% !important;
                    height: 100% !important;
                    max-width: 100% !important;
                    max-height: 100% !important;
                }

                @media print {
                    @page {
                        size: letter portrait;
                        margin: 0.4in;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    .print-area,
                    .print-area * {
                        visibility: visible !important;
                    }
                    .print-area {
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                    }
                    .print-grid {
                        display: grid !important;
                        grid-template-columns: repeat(3, 1fr) !important;
                        gap: 0.15in !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .qr-card {
                        width: 2.2in !important;
                        height: 2.8in !important;
                        border: 1px solid #94a3b8 !important;
                        border-radius: 4px !important;
                        overflow: hidden !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        display: flex !important;
                        flex-direction: column !important;
                        background: white !important;
                        box-shadow: none !important;
                    }
                    .qr-card .card-hdr {
                        background: white !important;
                        border-bottom: 1px solid #e2e8f0 !important;
                        padding: 4px 6px !important;
                        text-align: center !important;
                    }
                    .qr-card .card-hdr * {
                        color: #475569 !important;
                    }
                    .qr-card .card-body {
                        flex: 1 !important;
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        justify-content: center !important;
                        padding: 6px !important;
                        gap: 4px !important;
                    }
                    .qr-card .qr-box {
                        width: 1.2in !important;
                        height: 1.2in !important;
                        padding: 2px !important;
                        background: white !important;
                        border: 1px solid #e2e8f0 !important;
                        border-radius: 2px !important;
                        flex-shrink: 0 !important;
                    }
                    .qr-card .qr-box svg,
                    .qr-card .qr-box img {
                        width: 100% !important;
                        height: 100% !important;
                    }
                    .qr-card .card-info {
                        text-align: center !important;
                        width: 100% !important;
                        flex-shrink: 0 !important;
                    }
                    .qr-card .card-info p {
                        color: #1e293b !important;
                        line-height: 1.2 !important;
                    }
                }
            `}</style>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Filters */}
                <div className="card card-pad mb-6 print:hidden">
                    <h3 className="mb-4 text-sm font-semibold text-slate-900">Filter Students</h3>
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="min-w-0 flex-1">
                            <label htmlFor="grade_level_id" className="input-label">Grade Level</label>
                            <select
                                id="grade_level_id"
                                value={selectedGradeLevel}
                                onChange={(e) => { setSelectedGradeLevel(e.target.value); setSelectedSection(''); }}
                                className="input mt-1.5"
                            >
                                <option value="">All Grade Levels</option>
                                {gradeLevels.map((gl) => (
                                    <option key={gl.id} value={gl.id}>{gl.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="min-w-0 flex-1">
                            <label htmlFor="section_id" className="input-label">Section</label>
                            <select
                                id="section_id"
                                value={selectedSection}
                                onChange={(e) => setSelectedSection(e.target.value)}
                                className="input mt-1.5"
                            >
                                <option value="">All Sections</option>
                                {sections
                                    .filter((s) => !selectedGradeLevel || s.grade_level_id == selectedGradeLevel)
                                    .map((section) => (
                                        <option key={section.id} value={section.id}>
                                            {section.grade_level?.name} — {section.name}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <button onClick={handleFilter} className="btn-primary">Apply Filter</button>
                    </div>
                </div>

                {/* Students count */}
                {students.length > 0 && (
                    <div className="mb-4 text-sm text-slate-600 print:hidden">
                        Showing <span className="font-semibold text-slate-900">{students.length}</span> student(s)
                    </div>
                )}

                {/* QR Codes */}
                {students.length > 0 ? (
                    <div className="print-area">
                        <div className="print-grid grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {students.map((student) => (
                                <div key={student.id} className="qr-card flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                    {/* Header */}
                                    <div className="card-hdr shrink-0 bg-gradient-to-b from-slate-800 to-slate-900 px-3 py-2 text-center">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-200">AAMNHS</p>
                                        <p className="text-[9px] font-medium text-slate-400">Attendance QR Code</p>
                                    </div>

                                    {/* QR Code */}
                                    <div className="qr-box mx-auto mt-3 flex shrink-0 items-center justify-center rounded border border-slate-200 bg-white p-1.5" style={{ width: '120px', height: '120px' }}>
                                        {student.qr_svg ? (
                                            <div
                                                className="h-full w-full"
                                                dangerouslySetInnerHTML={{ __html: student.qr_svg }}
                                            />
                                        ) : (
                                            <p className="text-[10px] text-slate-400">No QR</p>
                                        )}
                                    </div>

                                    {/* Student Info */}
                                    <div className="card-info shrink-0 px-3 pb-3 pt-2 text-center">
                                        <p className="truncate text-[11px] font-bold leading-tight text-slate-900">{student.full_name}</p>
                                        <p className="font-mono text-[9px] leading-tight text-slate-500">LRN: {student.lrn}</p>
                                        <p className="text-[9px] leading-tight text-slate-400">{student.grade_level} — {student.section}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="card px-6 py-16 text-center">
                        <svg className="mx-auto h-12 w-12 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                        </svg>
                        <p className="mt-3 text-sm font-medium text-slate-600">No students found</p>
                        <p className="mt-1 text-xs text-slate-400">Select a grade level or section to generate QR codes.</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
