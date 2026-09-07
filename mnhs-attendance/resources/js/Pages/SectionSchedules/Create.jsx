import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Create({ section }) {
    const { data, setData, post, processing, errors } = useForm({
        day_of_week: 'Monday',
        start_time: '07:30',
        end_time: '16:00',
        grace_minutes: 15,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('schedules.store', section.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Section Schedules</p>
                        <h2 className="surface-title">Add Schedule — {section.name}</h2>
                    </div>
                    <Link href={route('schedules.index', section.id)} className="btn-outline">
                        Back to Schedules
                    </Link>
                </div>
            }
        >
            <Head title={`Add Schedule — ${section.name}`} />

            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="card card-pad">
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="input-label" htmlFor="day_of_week">
                                Day of Week
                            </label>
                            <select
                                id="day_of_week"
                                value={data.day_of_week}
                                onChange={(e) => setData('day_of_week', e.target.value)}
                                className="input mt-1.5"
                            >
                                {DAYS.map((day) => (
                                    <option key={day} value={day}>
                                        {day}
                                    </option>
                                ))}
                            </select>
                            {errors.day_of_week && (
                                <p className="mt-1.5 text-xs text-red-600">{errors.day_of_week}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="input-label" htmlFor="start_time">
                                    Start Time
                                </label>
                                <input
                                    id="start_time"
                                    type="time"
                                    value={data.start_time}
                                    onChange={(e) => setData('start_time', e.target.value)}
                                    className="input mt-1.5"
                                    required
                                />
                                {errors.start_time && (
                                    <p className="mt-1.5 text-xs text-red-600">{errors.start_time}</p>
                                )}
                            </div>
                            <div>
                                <label className="input-label" htmlFor="end_time">
                                    End Time
                                </label>
                                <input
                                    id="end_time"
                                    type="time"
                                    value={data.end_time}
                                    onChange={(e) => setData('end_time', e.target.value)}
                                    className="input mt-1.5"
                                    required
                                />
                                {errors.end_time && (
                                    <p className="mt-1.5 text-xs text-red-600">{errors.end_time}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="input-label" htmlFor="grace_minutes">
                                Grace Period (minutes)
                            </label>
                            <input
                                id="grace_minutes"
                                type="number"
                                min="0"
                                max="60"
                                value={data.grace_minutes}
                                onChange={(e) => setData('grace_minutes', e.target.value)}
                                className="input mt-1.5"
                                required
                            />
                            <p className="mt-1 text-xs text-slate-400">
                                Arrivals within this window after start time are still counted as present.
                            </p>
                            {errors.grace_minutes && (
                                <p className="mt-1.5 text-xs text-red-600">{errors.grace_minutes}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Link href={route('schedules.index', section.id)} className="btn-outline">
                                Cancel
                            </Link>
                            <button type="submit" disabled={processing} className="btn-primary">
                                {processing ? 'Saving...' : 'Create Schedule'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
