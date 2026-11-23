import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

const CHART_TONES = {
    navy: {
        bar: 'bg-navy-600',
        text: 'text-navy-700',
        soft: 'bg-navy-50',
        ring: 'ring-navy-600/15',
    },
    emerald: {
        bar: 'bg-emerald-500',
        text: 'text-emerald-700',
        soft: 'bg-emerald-50',
        ring: 'ring-emerald-600/15',
    },
    amber: {
        bar: 'bg-amber-500',
        text: 'text-amber-700',
        soft: 'bg-amber-50',
        ring: 'ring-amber-600/15',
    },
    red: {
        bar: 'bg-red-500',
        text: 'text-red-700',
        soft: 'bg-red-50',
        ring: 'ring-red-600/15',
    },
};

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
        <div className={`card p-5 ring-1 ring-inset ${tones[color]}`}>
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

function ChartHeading({ title, subtitle, tone = 'navy' }) {
    return (
        <div className="flex items-start gap-3">
            <span
                className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${CHART_TONES[tone].soft} ${CHART_TONES[tone].text} ${CHART_TONES[tone].ring}`}
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
                    <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
                )}
            </div>
        </div>
    );
}

function BarChart({
    title,
    subtitle,
    items,
    label,
    value,
    formatValue,
    tone = 'navy',
    emptyMessage = 'No data available for this period.',
}) {
    const tones = CHART_TONES[tone];
    const maxValue = Math.max(
        ...items.map((item) => Math.max(0, Number(value(item)) || 0)),
        1,
    );

    return (
        <div className="card card-pad flex h-full flex-col">
            <ChartHeading title={title} subtitle={subtitle} tone={tone} />

            {items.length > 0 ? (
                <ul className="mt-5 space-y-4">
                    {items.map((item, index) => {
                        const amount = Math.max(
                            0,
                            Number(value(item)) || 0,
                        );
                        const width = (amount / maxValue) * 100;

                        return (
                            <li key={item.id ?? `${label(item)}-${index}`}>
                                <div className="flex items-baseline justify-between gap-3">
                                    <span className="truncate text-sm font-medium text-slate-700">
                                        {label(item)}
                                    </span>
                                    <span
                                        className={`shrink-0 text-sm font-bold ${tones.text}`}
                                    >
                                        {formatValue
                                            ? formatValue(item)
                                            : amount}
                                    </span>
                                </div>
                                <div
                                    className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100"
                                    role="img"
                                    aria-label={`${label(item)}: ${
                                        formatValue
                                            ? formatValue(item)
                                            : amount
                                    }`}
                                >
                                    <div
                                        className={`h-full rounded-full ${tones.bar} transition-[width] duration-500`}
                                        style={{
                                            width: `${Math.max(width, 2)}%`,
                                        }}
                                    />
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="mt-5 rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
                    {emptyMessage}
                </p>
            )}
        </div>
    );
}

function AttendanceDonut({ stats }) {
    const total = Number(stats.total_records) || 0;
    const segments = [
        {
            key: 'present',
            label: 'Present',
            value: Number(stats.present) || 0,
            color: '#10b981',
            dot: 'bg-emerald-500',
        },
        {
            key: 'late',
            label: 'Late',
            value: Number(stats.late) || 0,
            color: '#f59e0b',
            dot: 'bg-amber-500',
        },
        {
            key: 'absent',
            label: 'Absent',
            value: Number(stats.absent) || 0,
            color: '#ef4444',
            dot: 'bg-red-500',
        },
    ];

    let cursor = 0;
    const gradient =
        total === 0
            ? '#e2e8f0 0% 100%'
            : segments
                  .map((segment) => {
                      const start = cursor;
                      cursor += (segment.value / total) * 100;
                      return `${segment.color} ${start}% ${cursor}%`;
                  })
                  .join(', ');

    return (
        <div className="card card-pad flex h-full flex-col">
            <ChartHeading
                title="Attendance Breakdown"
                subtitle="Share of records by status"
                tone="emerald"
            />

            <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-6 sm:flex-row lg:flex-col">
                <div
                    className="relative h-44 w-44 shrink-0"
                    role="img"
                    aria-label={`Present ${stats.present ?? 0}, late ${stats.late ?? 0}, absent ${stats.absent ?? 0}`}
                >
                    <div
                        className="h-full w-full rounded-full"
                        style={{
                            background: `conic-gradient(${gradient})`,
                        }}
                    />
                    <div className="absolute inset-[22px] flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
                        <span className="text-3xl font-bold tracking-tight text-slate-900">
                            {total.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            records
                        </span>
                    </div>
                </div>

                <ul className="w-full space-y-2.5">
                    {segments.map((segment) => {
                        const percent = total
                            ? Math.round((segment.value / total) * 100)
                            : 0;

                        return (
                            <li
                                key={segment.key}
                                className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"
                            >
                                <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                    <span
                                        className={`h-2.5 w-2.5 rounded-full ${segment.dot}`}
                                    />
                                    {segment.label}
                                </span>
                                <span className="text-sm font-semibold text-slate-900">
                                    {segment.value.toLocaleString()}
                                    <span className="ml-1.5 text-xs font-medium text-slate-400">
                                        {percent}%
                                    </span>
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

function timeToMinutes(value) {
    if (!value) return 0;
    const [hours, minutes] = String(value).split(':').map(Number);
    return (Number(hours) || 0) * 60 + (Number(minutes) || 0);
}

function formatTime(value) {
    if (!value) return '—';
    const [hours, minutes] = String(value).split(':').map(Number);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    return `${hours % 12 || 12}:${String(minutes || 0).padStart(2, '0')} ${suffix}`;
}

function EarlyArrivalsChart({ items }) {
    const minutes = items.map((item) => timeToMinutes(item.earliest_time));
    const earliest = minutes.length ? Math.min(...minutes) : 0;
    const latest = minutes.length ? Math.max(...minutes) : 0;
    const spread = latest - earliest;

    return (
        <div className="card card-pad">
            <ChartHeading
                title="Earliest Arrivals"
                subtitle="Longer bar means an earlier arrival time"
                tone="emerald"
            />

            {items.length > 0 ? (
                <ul className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
                    {items.map((item, index) => {
                        const studentMinutes = timeToMinutes(
                            item.earliest_time,
                        );
                        const width =
                            spread === 0
                                ? 100
                                : 35 +
                                  ((latest - studentMinutes) / spread) * 65;

                        return (
                            <li key={item.id ?? index}>
                                <div className="flex items-baseline justify-between gap-3">
                                    <span className="truncate text-sm font-medium text-slate-700">
                                        {item.full_name}
                                    </span>
                                    <span className="shrink-0 text-sm font-bold text-emerald-700">
                                        {formatTime(item.earliest_time)}
                                    </span>
                                </div>
                                <div
                                    className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100"
                                    role="img"
                                    aria-label={`${item.full_name} arrived at ${formatTime(item.earliest_time)}`}
                                >
                                    <div
                                        className="h-full rounded-full bg-emerald-500 transition-[width] duration-500"
                                        style={{ width: `${width}%` }}
                                    />
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="mt-5 rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
                    No arrival data available for this period.
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
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Records"
                        value={stats.total_records}
                        color="blue"
                    />
                    <StatCard
                        title="Present"
                        value={stats.present}
                        color="green"
                    />
                    <StatCard title="Late" value={stats.late} color="yellow" />
                    <StatCard
                        title="Absent"
                        value={stats.absent}
                        color="red"
                    />
                </dl>

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <AttendanceDonut stats={stats} />

                    <div className="lg:col-span-2">
                        <BarChart
                            title="Section Ranking"
                            subtitle="Late occurrences per section"
                            items={sectionRanking}
                            label={(item) => item.section?.name || 'Unassigned'}
                            value={(item) => item.late_count}
                            formatValue={(item) =>
                                `${item.late_count} late`
                            }
                            tone="amber"
                        />
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <BarChart
                        title="Frequently Late Students"
                        subtitle="Highest number of late arrivals"
                        items={lateStudents}
                        label={(item) => item.full_name}
                        value={(item) => item.late_count}
                        formatValue={(item) => `${item.late_count} times`}
                        tone="amber"
                    />

                    <BarChart
                        title="Top Absent Students"
                        subtitle="Highest number of absences"
                        items={absenteeism}
                        label={(item) => item.full_name}
                        value={(item) => item.absent_count}
                        formatValue={(item) => `${item.absent_count} absences`}
                        tone="red"
                    />
                </div>

                <div className="mt-6">
                    <EarlyArrivalsChart items={earlyArrivals} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
