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
            }
        >
            <Head title={`Print QR - ${student.full_name}`} />

            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Printable QR Card */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card print:rounded-none print:border-0 print:shadow-none">
                    <div className="bg-gradient-to-r from-navy-950 to-navy-800 px-8 py-5 text-center text-white print:bg-white print:text-black">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-navy-200/90 print:text-slate-500">
                            Republic of the Philippines · Department of Education
                        </p>
                        <h1 className="mt-1 text-lg font-bold">
                            Aurelio Arago Memorial National High School
                        </h1>
                        <p className="text-sm text-navy-100/80 print:text-slate-600">
                            Student Attendance QR Code
                        </p>
                    </div>

                    <div className="p-8">
                        <div className="flex justify-center py-4">
                            {qr_svg ? (
                                <div
                                    className="w-56 h-56 print:w-64 print:h-64"
                                    dangerouslySetInnerHTML={{
                                        __html: qr_svg,
                                    }}
                                />
                            ) : (
                                <p className="text-slate-500">
                                    QR code unavailable.
                                </p>
                            )}
                        </div>

                        <div className="mt-2 rounded-xl bg-slate-50 px-5 py-4 text-center ring-1 ring-inset ring-slate-100 print:bg-transparent print:ring-0">
                            <p className="text-xl font-bold text-slate-900">
                                {student.full_name}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                                LRN: {student.lrn}
                            </p>
                            <p className="text-sm text-slate-600">
                                {student.section?.grade_level?.name} —{' '}
                                {student.section?.name}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <Link
                        href={route('students.show', student)}
                        className="btn-outline"
                    >
                        Back to Student
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
