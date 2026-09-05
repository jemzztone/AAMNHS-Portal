import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import QrScanner from '@/Components/QrScanner';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const statusBadge = (status) => {
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
};

function Detail({ label, value }) {
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

function formatTime(time) {
    if (!time) return '—';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
}

function formatDate(date) {
    if (!date) return '—';
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function Scan() {
    const [qrToken, setQrToken] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const submitToken = async (token) => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(route('guard.scan.store'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || '',
                    ),
                },
                body: JSON.stringify({ qr_token: token }),
            });

            const data = await response.json();

            if (response.ok) {
                setResult(data);
                setQrToken('');
            } else {
                setError(data.message || 'Scan failed');
                if (data.student) {
                    setResult(data);
                }
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCameraScan = (decodedText) => {
        submitToken(decodedText);
    };

    const handleManualScan = () => {
        if (!qrToken.trim()) {
            setError('Please enter a QR token');
            return;
        }
        submitToken(qrToken);
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <p className="page-eyebrow">Security</p>
                    <h2 className="surface-title">Gate QR Scanner</h2>
                </div>
            }
        >
            <Head title="Guard Scanner" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    {/* Scanner */}
                    <div className="lg:col-span-3">
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-6 text-white sm:p-8">
                            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-navy-500/20 blur-3xl" />
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:22px_22px]" />

                            <div className="relative">
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                                        <svg
                                            className="h-5 w-5"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.8"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zM13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z"
                                            />
                                        </svg>
                                    </span>
                                    <div>
                                        <h3 className="text-lg font-bold">
                                            Scan Student QR Code
                                        </h3>
                                        <p className="text-sm text-navy-100/70">
                                            Point your camera at the student's QR
                                            code, or type the token below.
                                        </p>
                                    </div>
                                </div>

                                {/* Camera Scanner */}
                                <div className="mt-6">
                                    <QrScanner
                                        onScan={handleCameraScan}
                                        onError={setError}
                                    />
                                </div>

                                {/* Divider */}
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="bg-transparent px-3 text-xs text-navy-200/50">
                                            or type manually
                                        </span>
                                    </div>
                                </div>

                                {/* Manual Input */}
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={qrToken}
                                            onChange={(e) =>
                                                setQrToken(e.target.value)
                                            }
                                            onKeyDown={(e) =>
                                                e.key === 'Enter' &&
                                                handleManualScan()
                                            }
                                            placeholder="Enter QR token..."
                                            className="w-full rounded-xl border-0 bg-white/10 px-4 py-3 text-base text-white ring-1 ring-inset ring-white/20 placeholder:text-navy-100/40 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60"
                                        />
                                    </div>
                                    <button
                                        onClick={handleManualScan}
                                        disabled={loading}
                                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-navy-950 transition duration-150 ease-in-out hover:bg-navy-100 active:bg-navy-200 disabled:pointer-events-none disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <svg
                                                    className="h-4 w-4 animate-spin"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    />
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                                    />
                                                </svg>
                                                Processing...
                                            </>
                                        ) : (
                                            'Submit'
                                        )}
                                    </button>
                                </div>

                                {/* Error */}
                                {error && !result?.success && (
                                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3">
                                        <svg
                                            className="mt-0.5 h-5 w-5 shrink-0 text-red-300"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <p className="text-sm font-medium text-red-100">
                                            {error}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="card card-pad mt-6">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                                    <svg
                                        className="h-[18px] w-[18px]"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.8"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                                        />
                                    </svg>
                                </span>
                                <h3 className="surface-title">Instructions</h3>
                            </div>
                            <ul className="mt-4 space-y-3">
                                {[
                                    'Ask the student to present their QR code',
                                    'Click "Start Camera" and point at the QR code',
                                    'Or type the token manually and click Submit',
                                    'The system will verify the student and record their attendance',
                                    'If a student was absent yesterday, they need an approved admission slip',
                                ].map((step, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start gap-3 text-sm text-slate-600"
                                    >
                                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-100 text-[10px] font-bold text-navy-800">
                                            {index + 1}
                                        </span>
                                        {step}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Result panel */}
                    <div className="lg:col-span-2">
                        {result && (
                            <div className="card card-pad">
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset ${
                                            result.success
                                                ? 'bg-emerald-50 text-emerald-600 ring-emerald-600/15'
                                                : 'bg-amber-50 text-amber-600 ring-amber-600/15'
                                        }`}
                                    >
                                        {result.success ? (
                                            <svg
                                                className="h-5 w-5"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                className="h-5 w-5"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </span>
                                    <h3
                                        className={`text-lg font-bold ${
                                            result.success
                                                ? 'text-emerald-800'
                                                : 'text-amber-800'
                                        }`}
                                    >
                                        {result.message}
                                    </h3>
                                </div>

                                {result.student && (
                                    <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-slate-100 pt-5">
                                        <div className="col-span-2">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                Student
                                            </p>
                                            <p className="mt-1 text-base font-bold text-slate-900">
                                                {result.student.full_name}
                                            </p>
                                        </div>
                                        <Detail
                                            label="LRN"
                                            value={result.student.lrn}
                                        />
                                        <Detail
                                            label="Section"
                                            value={
                                                result.student.section?.name
                                            }
                                        />
                                        {result.record && (
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                    Status
                                                </p>
                                                <div className="mt-1">
                                                    {statusBadge(
                                                        result.record.status,
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {result.record?.time_in && (
                                            <Detail
                                                label="Time In"
                                                value={formatTime(result.record.time_in)}
                                            />
                                        )}
                                        {result.record?.date && (
                                            <Detail
                                                label="Date"
                                                value={formatDate(result.record.date)}
                                            />
                                        )}
                                    </div>
                                )}

                                {result.requires_admission_slip && (
                                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                        <svg
                                            className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
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
                                        <p className="text-sm font-medium text-red-800">
                                            This student requires an approved
                                            admission slip before entry is
                                            allowed.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {!result && (
                            <div className="card flex h-full min-h-[240px] flex-col items-center justify-center border-dashed p-8 text-center">
                                <svg
                                    className="h-12 w-12 text-slate-300"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zM13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z"
                                    />
                                </svg>
                                <p className="mt-4 text-sm font-semibold text-slate-600">
                                    Scan results appear here
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    Student details and time-in status will
                                    show instantly after a successful scan.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
