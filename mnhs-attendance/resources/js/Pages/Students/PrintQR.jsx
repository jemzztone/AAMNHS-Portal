import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function PrintQR({ student, qr_svg }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Students</p>
                        <h2 className="surface-title">
                            Student QR Code — {student.full_name}
                        </h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={route('students.show', student)}
                            className="btn-outline"
                        >
                            Back to Student
                        </Link>
                        <button
                            onClick={() => window.print()}
                            className="btn-primary"
                        >
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
                                    d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659"
                                />
                            </svg>
                            Print
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Print QR - ${student.full_name}`} />

            <style>{`
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
                        display: flex !important;
                        justify-content: center !important;
                    }
                    .qr-card {
                        width: 2.2in !important;
                        height: 2.8in !important;
                        border: 1px solid #94a3b8 !important;
                        border-radius: 4px !important;
                        overflow: hidden !important;
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

            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="print-area">
                    <div className="qr-card flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="card-hdr shrink-0 bg-gradient-to-b from-slate-800 to-slate-900 px-3 py-2 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-200">AAMNHS</p>
                            <p className="text-[9px] font-medium text-slate-400">Attendance QR Code</p>
                        </div>

                        <div className="qr-box mx-auto mt-3 flex shrink-0 items-center justify-center rounded border border-slate-200 bg-white p-1.5" style={{ width: '120px', height: '120px' }}>
                            {qr_svg ? (
                                <div
                                    className="h-full w-full"
                                    dangerouslySetInnerHTML={{ __html: qr_svg }}
                                />
                            ) : (
                                <p className="text-[10px] text-slate-400">No QR</p>
                            )}
                        </div>

                        <div className="card-info shrink-0 px-3 pb-3 pt-2 text-center">
                            <p className="truncate text-[11px] font-bold leading-tight text-slate-900">{student.full_name}</p>
                            <p className="font-mono text-[9px] leading-tight text-slate-500">LRN: {student.lrn}</p>
                            <p className="text-[9px] leading-tight text-slate-400">{student.section?.grade_level?.name} — {student.section?.name}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
