import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Paginator from '@/Components/Paginator';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const emptyForm = { name: '', start_date: '', end_date: '', is_current: false };

function YearForm({ initial, submitLabel, onCancel, onSubmit, processing, errors, title }) {
    const [data, setData] = useState(initial);

    const set = (key) => (e) =>
        setData((d) => ({
            ...d,
            [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
        }));

    return (
        <div className="card card-pad">
            <h3 className="surface-title">{title}</h3>
            <form
                className="mt-4 space-y-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit(data);
                }}
            >
                <div>
                    <label className="input-label" htmlFor="ay-name">
                        Name
                    </label>
                    <input
                        id="ay-name"
                        type="text"
                        value={data.name}
                        onChange={set('name')}
                        placeholder="e.g. 2026-2027"
                        className="input mt-1.5"
                        required
                    />
                    {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="input-label" htmlFor="ay-start">
                            Start Date
                        </label>
                        <input
                            id="ay-start"
                            type="date"
                            value={data.start_date}
                            onChange={set('start_date')}
                            className="input mt-1.5"
                            required
                        />
                        {errors.start_date && <p className="mt-1.5 text-xs text-red-600">{errors.start_date}</p>}
                    </div>
                    <div>
                        <label className="input-label" htmlFor="ay-end">
                            End Date
                        </label>
                        <input
                            id="ay-end"
                            type="date"
                            value={data.end_date}
                            onChange={set('end_date')}
                            className="input mt-1.5"
                            required
                        />
                        {errors.end_date && <p className="mt-1.5 text-xs text-red-600">{errors.end_date}</p>}
                    </div>
                </div>

                <label className="flex items-center gap-2.5">
                    <input
                        type="checkbox"
                        checked={data.is_current}
                        onChange={set('is_current')}
                        className="h-4 w-4 rounded border-slate-300 text-navy-700 focus:ring-navy-500"
                    />
                    <span className="text-sm font-medium text-slate-700">
                        Set as the current academic year
                    </span>
                </label>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button type="button" onClick={onCancel} className="btn-outline">
                        Cancel
                    </button>
                    <button type="submit" disabled={processing} className="btn-primary">
                        {submitLabel}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function Index({ academicYears }) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const { post, put, processing, errors, clearErrors } = useForm();

    const closeForm = () => {
        setShowForm(false);
        setEditing(null);
        clearErrors();
    };

    const handleStore = (data) => {
        post(route('academic-years.store'), {
            data,
            preserveScroll: true,
            onSuccess: closeForm,
        });
    };

    const handleUpdate = (data) => {
        put(route('academic-years.update', editing.id), {
            data,
            preserveScroll: true,
            onSuccess: closeForm,
        });
    };

    const handleDestroy = (year) => {
        if (!window.confirm(`Delete academic year "${year.name}"? Sections linked to it may be affected.`)) {
            return;
        }
        router.delete(route('academic-years.destroy', year.id), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Academics</p>
                        <h2 className="surface-title">Academic Years</h2>
                    </div>
                    <button
                        onClick={() => {
                            setEditing(null);
                            setShowForm((v) => !v && true);
                        }}
                        className="btn-primary"
                    >
                        New Academic Year
                    </button>
                </div>
            }
        >
            <Head title="Academic Years" />

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                {(showForm || editing) && (
                    <div className="mb-6">
                        {editing ? (
                            <YearForm
                                title={`Edit ${editing.name}`}
                                initial={{
                                    name: editing.name,
                                    start_date: editing.start_date,
                                    end_date: editing.end_date,
                                    is_current: editing.is_current,
                                }}
                                submitLabel="Save Changes"
                                onCancel={closeForm}
                                onSubmit={handleUpdate}
                                processing={processing}
                                errors={errors}
                            />
                        ) : (
                            <YearForm
                                title="New Academic Year"
                                initial={emptyForm}
                                submitLabel="Create Academic Year"
                                onCancel={closeForm}
                                onSubmit={handleStore}
                                processing={processing}
                                errors={errors}
                            />
                        )}
                    </div>
                )}

                <div className="card overflow-hidden">
                    <div className="table-wrap">
                        <table className="table">
                            <thead className="thead">
                                <tr>
                                    <th className="th">Name</th>
                                    <th className="th">Period</th>
                                    <th className="th">Sections</th>
                                    <th className="th">Status</th>
                                    <th className="th text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="tbody">
                                {academicYears.data.map((year) => (
                                    <tr key={year.id}>
                                        <td className="td font-semibold text-slate-900">{year.name}</td>
                                        <td className="td text-slate-600">
                                            {year.start_date} → {year.end_date}
                                        </td>
                                        <td className="td text-slate-600">{year.sections_count ?? 0}</td>
                                        <td className="td">
                                            {year.is_current ? (
                                                <span className="badge ring-1 ring-inset bg-emerald-50 text-emerald-700 ring-emerald-600/20">
                                                    <span className="badge-dot bg-emerald-500" />
                                                    Current
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="td text-end">
                                            <div className="flex justify-end gap-1">
                                                <Link
                                                    href={route('academic-years.show', year.id)}
                                                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-navy-700 transition hover:bg-navy-50"
                                                >
                                                    View
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setEditing(year);
                                                        setShowForm(false);
                                                    }}
                                                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDestroy(year)}
                                                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {academicYears.data.length === 0 && (
                                    <tr>
                                        <td className="td text-center text-sm text-slate-500" colSpan={5}>
                                            No academic years yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Paginator meta={academicYears} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
