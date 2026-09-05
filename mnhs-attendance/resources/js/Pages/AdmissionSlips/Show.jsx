import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';

function InfoItem({ label, value }) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {label}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
                {value || '—'}
            </p>
        </div>
    );
}

export default function Show({ slip }) {
    const user = usePage().props.auth.user;
    const isStaff = ['super_admin', 'admin', 'teacher'].includes(user?.role);

    const { data, setData, post, processing, errors } = useForm({
        review_notes: '',
    });

    const approve = (e) => {
        e.preventDefault();
        post(route('admission-slips.approve', slip), { preserveScroll: true });
    };

    const reject = (e) => {
        e.preventDefault();
        post(route('admission-slips.reject', slip), {
            preserveScroll: true,
            onError: () => {},
        });
    };

    const statusStyles = {
        pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
        approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        rejected: 'bg-red-50 text-red-700 ring-red-600/20',
    };
    const statusDots = {
        pending: 'bg-amber-500',
        approved: 'bg-emerald-500',
        rejected: 'bg-red-500',
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Admission Slips</p>
                        <h2 className="surface-title">Slip Details</h2>
                    </div>
                    <Link
                        href={route('admission-slips.index')}
                        className="btn-outline"
                    >
                        Back to List
                    </Link>
                </div>
            }
        >
            <Head title="Admission Slip Details" />

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Slip Info */}
                <div className="card overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                        <h3 className="text-sm font-bold text-slate-900">
                            Slip Information
                        </h3>
                        <span
                            className={`badge ring-1 ring-inset ${
                                statusStyles[slip.status] ||
                                'bg-slate-100 text-slate-700 ring-slate-600/20'
                            }`}
                        >
                            <span
                                className={`badge-dot ${
                                    statusDots[slip.status] || 'bg-slate-400'
                                }`}
                            />
                            {slip.status.charAt(0).toUpperCase() +
                                slip.status.slice(1)}
                        </span>
                    </div>

                    <div className="card-pad">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <InfoItem
                                label="Student"
                                value={slip.student?.full_name}
                            />
                            <InfoItem
                                label="Section"
                                value={slip.student?.section?.name}
                            />
                            <InfoItem
                                label="Absence Date"
                                value={slip.absence_date}
                            />
                            <InfoItem
                                label="Guardian Reference"
                                value={slip.guardian_reference}
                            />
                        </div>

                        <div className="mt-6">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Reason
                            </p>
                            <p className="mt-2 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-800 ring-1 ring-inset ring-slate-100">
                                {slip.reason}
                            </p>
                        </div>

                        {slip.attachment_path && (
                            <div className="mt-5">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Attachment
                                </p>
                                <a
                                    href={`/storage/${slip.attachment_path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-2 inline-flex items-center gap-2 rounded-lg bg-navy-50 px-3.5 py-2 text-sm font-semibold text-navy-700 ring-1 ring-inset ring-navy-100 transition hover:bg-navy-100"
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
                                            d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                                        />
                                    </svg>
                                    View attachment
                                </a>
                            </div>
                        )}

                        {slip.reviewed_by && (
                            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                                <p className="text-sm text-slate-600">
                                    Reviewed by{' '}
                                    <span className="font-semibold text-slate-900">
                                        {slip.reviewed_by?.name}
                                    </span>
                                    {slip.reviewed_at && (
                                        <> on {slip.reviewed_at}</>
                                    )}
                                </p>
                                {slip.review_notes && (
                                    <p className="mt-2 text-sm leading-relaxed text-slate-700">
                                        <span className="font-semibold">
                                            Notes:
                                        </span>{' '}
                                        {slip.review_notes}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Review Actions */}
                {isStaff && slip.status === 'pending' && (
                    <div className="card overflow-hidden">
                        <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                            <h3 className="text-sm font-bold text-slate-900">
                                Review Slip
                            </h3>
                        </div>
                        <form className="card-pad space-y-4">
                            <div>
                                <label htmlFor="review_notes" className="input-label">
                                    Review Notes
                                </label>
                                <textarea
                                    id="review_notes"
                                    value={data.review_notes}
                                    onChange={(e) =>
                                        setData(
                                            'review_notes',
                                            e.target.value,
                                        )
                                    }
                                    rows="3"
                                    placeholder="Optional notes for the student/guardian..."
                                    className="input mt-1.5"
                                />
                                {errors.review_notes && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.review_notes}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={reject}
                                    disabled={processing}
                                    className="btn-danger"
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
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                    Reject
                                </button>
                                <button
                                    type="button"
                                    onClick={approve}
                                    disabled={processing}
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
                                            d="M4.5 12.75l6 6 9-13.5"
                                        />
                                    </svg>
                                    Approve
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
