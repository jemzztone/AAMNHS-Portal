import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ section, schedule }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Section Schedules</p>
                        <h2 className="surface-title">
                            {schedule.day_of_week} — {section.name}
                        </h2>
                    </div>
                    <Link href={route('schedules.index', section.id)} className="btn-outline">
                        Back to Schedules
                    </Link>
                </div>
            }
        >
            <Head title={`Schedule ${schedule.day_of_week}`} />

            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="card overflow-hidden">
                    <div className="card-pad grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Day
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{schedule.day_of_week}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Start Time
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{schedule.start_time}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                End Time
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{schedule.end_time}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Grace Period
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                                {schedule.grace_minutes} minutes
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Link
                        href={route('schedules.edit', [section.id, schedule.id])}
                        className="btn-primary"
                    >
                        Edit Schedule
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
