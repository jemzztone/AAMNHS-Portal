import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ student }) {
    const { data, setData, post, processing, errors } = useForm({
        absence_date: '',
        reason: '',
        guardian_reference: '',
        attachment: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admission-slips.store'));
    };

    const header = (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
                <p className="page-eyebrow">Admission Slips</p>
                <h2 className="surface-title">Submit Admission Slip</h2>
            </div>
            <Link href={route('dashboard')} className="btn-outline">
                Cancel
            </Link>
        </div>
    );

    if (!student) {
        return (
            <AuthenticatedLayout header={header}>
                <Head title="Submit Admission Slip" />
                <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="card card-pad">
                        <div className="flex flex-col items-center gap-4 py-8 text-center">
                            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                                <svg
                                    className="h-7 w-7"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.8"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                                    />
                                </svg>
                            </span>
                            <p className="text-sm leading-relaxed text-slate-600">
                                No student profile is linked to this account.
                                Please contact your school administrator.
                            </p>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout header={header}>
            <Head title="Submit Admission Slip" />

            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="card overflow-hidden">
                    <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-navy-50 to-transparent px-6 py-4">
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-800 text-xs font-bold text-white">
                            {student.full_name
                                .split(' ')
                                .map((part) => part[0])
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()}
                        </span>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">
                                {student.full_name}
                            </p>
                            <p className="text-xs text-slate-500">
                                {student.lrn} · {student.section?.name || 'No section'}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="card-pad space-y-6">
                        <div>
                            <label htmlFor="absence_date" className="input-label">
                                Date of Absence{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="absence_date"
                                type="date"
                                value={data.absence_date}
                                onChange={(e) =>
                                    setData('absence_date', e.target.value)
                                }
                                max={new Date().toISOString().split('T')[0]}
                                className="input mt-1.5"
                                required
                            />
                            {errors.absence_date && (
                                <p className="mt-1.5 text-xs text-red-600">
                                    {errors.absence_date}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="reason" className="input-label">
                                Reason for Absence{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="reason"
                                value={data.reason}
                                onChange={(e) =>
                                    setData('reason', e.target.value)
                                }
                                rows="4"
                                placeholder="Explain the reason for the absence..."
                                className="input mt-1.5"
                                required
                            />
                            {errors.reason && (
                                <p className="mt-1.5 text-xs text-red-600">
                                    {errors.reason}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="guardian_reference"
                                className="input-label"
                            >
                                Guardian / Note Reference
                            </label>
                            <input
                                id="guardian_reference"
                                type="text"
                                value={data.guardian_reference}
                                onChange={(e) =>
                                    setData(
                                        'guardian_reference',
                                        e.target.value,
                                    )
                                }
                                placeholder="e.g. Parent's note, contact number"
                                className="input mt-1.5"
                            />
                        </div>

                        <div>
                            <label htmlFor="attachment" className="input-label">
                                Attachment (optional)
                            </label>
                            <input
                                id="attachment"
                                type="file"
                                onChange={(e) =>
                                    setData(
                                        'attachment',
                                        e.target.files[0],
                                    )
                                }
                                accept=".jpg,.jpeg,.png,.pdf"
                                className="mt-1.5 block w-full text-sm text-slate-600 file:me-3 file:rounded-lg file:border-0 file:bg-navy-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-navy-700"
                            />
                            {errors.attachment && (
                                <p className="mt-1.5 text-xs text-red-600">
                                    {errors.attachment}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-5">
                            <Link
                                href={route('dashboard')}
                                className="btn-outline"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary"
                            >
                                {processing ? 'Submitting...' : 'Submit Slip'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
