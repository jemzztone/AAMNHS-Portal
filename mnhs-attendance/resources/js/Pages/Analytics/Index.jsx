import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

function StatCard({ title, value, color = 'blue' }) {
    const tones = {
        blue: 'bg-gradient-to-br from-slate-50 to-slate-100/80 text-navy-800 ring-slate-200',
        green:
            'bg-gradient-to-br from-emerald-50 to-emerald-100/60 text-emerald-800 ring-emerald-200',
        yellow:
            'bg-gradient-to-br from-amber-50 to-amber-100/60 text-amber-800 ring-amber-200',
        red: 'bg-gradient-to-br from-red-50 to-red-100/60 text-red-800 ring-red-200',
    };
    const dot = {
        blue: 'bg-navy-500',
        green: 'bg-emerald-500',
        yellow: 'bg-amber-500',
        red: 'bg-red-500',
    };
    return (
        <div
            className={`card p-5 ring-1 ring-inset ${tones[color]}`}
        >
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-70">
                <span className={`badge-dot ${dot[color]}`} />
                {title}
            </dt>
            <dd className="mt-1 text-3xl font-bold tracking-tight">
                {value ?? 0}
            </dd>
        </div>
    );
}

function RankList({ title, subtitle, items, tone, renderValue }) {
    const tones = {
        yellow: 'text-amber-600',
        red: 'text-red-600',
        green: 'text-emerald-600',
    };
    const rankTones = {
        yellow: 'bg-amber-50 text-amber-700 ring-amber-600/15',
        red: 'bg-red-50 text-red-700 ring-red-600/15',
        green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
    };
    return (
        <div className="card card-pad">
            <div className="flex items-center gap-3">
                <span
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-inset ${rankTones[tone]}`}
                >
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
                            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                        />
                    </svg>
                </span>
                <div>
                    <h3 className="surface-title">{title}</h3>
                    {subtitle && (
                        <p className="mt-0.5 text-xs text-slate-500">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {items.length > 0 ? (
                <ul className="mt-5 divide-y divide-slate-100">
                    {items.map((item, index) => (
                        <li
                            key={item.id}
                            className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                        >
                            <span className="flex min-w-0 items-center gap-3">
                                <span
                                    className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ring-1 ring-inset ${
                                        index === 0
                                            ? 'bg-navy-800 text-white ring-navy-800'
                                            : 'bg-slate-100 text-slate-600 ring-slate-200'
                                    }`}
                                >
                                    {index + 1}
                                </span>
                                <span className="truncate text-sm font-medium text-slate-900">
                                    {item.section?.name || item.full_name}
                                </span>
                            </span>
                            <span
                                className={`shrink-0 text-sm font-semibold ${tones[tone]}`}
                            >
                                {renderValue(item)}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-5 rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
                    No data available.
                </p>
            )}
        </div>
    );
}

export default function Index({
    stats,
    sectionRanking,
    lateStudents,
    earlyArrivals,
    absenteeism,
    filters,
}) {
    const user = usePage().props.auth.user;
    const isAdmin = ['super_admin', 'admin'].includes(user?.role);

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <p className="page-eyebrow">Insights</p>
                    <h2 className="surface-title">Analytics & Reports</h2>
                </div>
            }
        >
            <Head title="Analytics" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Stats Overview */}
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Records" value={stats.total_records} color="blue" />
                    <StatCard title="Present" value={stats.present} color="green" />
                    <StatCard title="Late" value={stats.late} color="yellow" />
                    <StatCard title="Absent" value={stats.absent} color="red" />
                </dl>

                {/* AI Assistant (Admin only) */}
                {isAdmin && <AiAssistant filters={filters} />}

                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <RankList
                        title="Section Ranking"
                        subtitle="Most late occurrences"
                        items={sectionRanking}
                        tone="yellow"
                        renderValue={(item) => (
                            <>
                                {item.late_count}{' '}
                                <span className="font-normal text-slate-400">
                                    late
                                </span>
                            </>
                        )}
                    />

                    <RankList
                        title="Frequently Late Students"
                        subtitle="Highest late counts"
                        items={lateStudents}
                        tone="yellow"
                        renderValue={(item) => (
                            <>
                                {item.late_count}{' '}
                                <span className="font-normal text-slate-400">
                                    times
                                </span>
                            </>
                        )}
                    />

                    <RankList
                        title="Earliest Arrivals"
                        subtitle="Best time-in times"
                        items={earlyArrivals}
                        tone="green"
                        renderValue={(item) => item.earliest_time}
                    />

                    <RankList
                        title="Top Absent Students"
                        subtitle="Highest absence counts"
                        items={absenteeism}
                        tone="red"
                        renderValue={(item) => (
                            <>
                                {item.absent_count}{' '}
                                <span className="font-normal text-slate-400">
                                    absences
                                </span>
                            </>
                        )}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function AiAssistant({ filters }) {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const ask = async () => {
        if (!question.trim()) {
            setError('Please enter a question.');
            return;
        }

        setLoading(true);
        setError(null);
        setAnswer(null);

        try {
            const response = await fetch(route('ai.query'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || '',
                    ),
                },
                body: JSON.stringify({
                    question,
                    start_date: filters?.start_date,
                    end_date: filters?.end_date,
                    section_id: filters?.section_id || undefined,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setAnswer(data.answer);
            } else {
                const message =
                    data.errors?.question?.[0] ||
                    data.message ||
                    'The assistant could not answer right now.';
                setError(message);
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card card-pad mt-8">
            <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-navy-800 text-white">
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
                            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                        />
                    </svg>
                </span>
                <div>
                    <h3 className="surface-title">AI Assistant</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                        Ask natural-language questions about the attendance
                        dataset (e.g. "Which section was late most often this
                        period?" or "List students with 5+ absences"). Answers
                        use the current filter period.
                    </p>
                </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
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
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && ask()}
                        placeholder="Ask about attendance..."
                        className="input ps-9"
                    />
                </div>
                <button
                    onClick={ask}
                    disabled={loading}
                    className="btn-primary shrink-0"
                >
                    {loading ? 'Thinking...' : 'Ask'}
                </button>
            </div>

            {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {answer && (
                <div className="mt-4 rounded-xl border border-navy-100 bg-navy-50/70 px-4 py-3">
                    <p className="whitespace-pre-wrap text-sm text-navy-900">
                        {answer}
                    </p>
                </div>
            )}
        </div>
    );
}
