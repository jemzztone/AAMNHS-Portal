import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

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
}) {
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

                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
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
