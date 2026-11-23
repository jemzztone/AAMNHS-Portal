import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

function dateInputValue(value) {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);

    // The API serializes date casts in UTC; show the Manila calendar date.
    return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
}

export default function Edit({ academicYear }) {
    const { data, setData, put, processing, errors } = useForm({
        name: academicYear.name,
        start_date: dateInputValue(academicYear.start_date),
        end_date: dateInputValue(academicYear.end_date),
        is_current: academicYear.is_current,
    });

    const submit = (e) => {
        e.preventDefault();

        const form = new FormData(e.currentTarget);
        setData({
            name: String(form.get('name') ?? ''),
            start_date: String(form.get('start_date') ?? ''),
            end_date: String(form.get('end_date') ?? ''),
            is_current: form.get('is_current') === 'on',
        });
        put(route('academic-years.update', academicYear.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Academic Years</p>
                        <h2 className="surface-title">Edit {academicYear.name}</h2>
                    </div>
                    <Link href={route('academic-years.index')} className="btn-outline">
                        Back to List
                    </Link>
                </div>
            }
        >
            <Head title={`Edit ${academicYear.name}`} />

            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="card card-pad">
                    <form onSubmit={submit} className="space-y-4" noValidate>
                        <div>
                            <label className="input-label" htmlFor="name">
                                Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="input mt-1.5"
                                required
                            />
                            {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="input-label" htmlFor="start_date">
                                    Start Date
                                </label>
                                <input
                                    id="start_date"
                                    name="start_date"
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    className="input mt-1.5"
                                    required
                                />
                                {errors.start_date && (
                                    <p className="mt-1.5 text-xs text-red-600">{errors.start_date}</p>
                                )}
                            </div>
                            <div>
                                <label className="input-label" htmlFor="end_date">
                                    End Date
                                </label>
                                <input
                                    id="end_date"
                                    name="end_date"
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                    className="input mt-1.5"
                                    required
                                />
                                {errors.end_date && (
                                    <p className="mt-1.5 text-xs text-red-600">{errors.end_date}</p>
                                )}
                            </div>
                        </div>

                        <label className="flex items-center gap-2.5">
                            <input
                                type="checkbox"
                                name="is_current"
                                checked={data.is_current}
                                onChange={(e) => setData('is_current', e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-navy-700 focus:ring-navy-500"
                            />
                            <span className="text-sm font-medium text-slate-700">
                                Set as the current academic year
                            </span>
                        </label>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Link href={route('academic-years.show', academicYear.id)} className="btn-outline">
                                Cancel
                            </Link>
                            <button type="submit" disabled={processing} className="btn-primary">
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
