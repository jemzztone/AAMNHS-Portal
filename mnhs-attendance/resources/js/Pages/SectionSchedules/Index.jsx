import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Index({ section, schedules }) {
    const handleDestroy = (schedule) => {
        if (!window.confirm(`Delete the ${schedule.day_of_week} schedule?`)) {
            return;
        }
        router.delete(route('schedules.destroy', [section.id, schedule.id]), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Sections</p>
                        <h2 className="surface-title">Schedules — {section.name}</h2>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('sections.show', section.id)} className="btn-outline">
                            Back to Section
                        </Link>
                        <Link href={route('schedules.create', section.id)} className="btn-primary">
                            Add Schedule
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Schedules — ${section.name}`} />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="card overflow-hidden">
                    {schedules.length > 0 ? (
                        <div className="table-wrap">
                            <table className="table">
                                <thead className="thead">
                                    <tr>
                                        <th className="th">Day</th>
                                        <th className="th">Start</th>
                                        <th className="th">End</th>
                                        <th className="th">Grace Period</th>
                                        <th className="th text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="tbody">
                                    {DAYS.filter((day) => schedules.some((s) => s.day_of_week === day)).map((day) => {
                                        const schedule = schedules.find((s) => s.day_of_week === day);
                                        return (
                                            <tr key={schedule.id}>
                                                <td className="td font-semibold text-slate-900">{schedule.day_of_week}</td>
                                                <td className="td text-slate-600">{schedule.start_time}</td>
                                                <td className="td text-slate-600">{schedule.end_time}</td>
                                                <td className="td text-slate-600">{schedule.grace_minutes} min</td>
                                                <td className="td text-end">
                                                    <div className="flex justify-end gap-1">
                                                        <Link
                                                            href={route('schedules.edit', [section.id, schedule.id])}
                                                            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDestroy(schedule)}
                                                            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="px-6 py-14 text-center">
                            <p className="text-sm font-medium text-slate-600">No schedules yet</p>
                            <p className="mt-1 text-xs text-slate-400">
                                Add a schedule so late arrivals are flagged automatically during QR scans.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
