import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Paginator from '@/Components/Paginator';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ gradeLevels }) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const { post, put, processing, errors, clearErrors } = useForm();

    const empty = { name: '', level_number: '' };

    const closeForm = () => {
        setShowForm(false);
        setEditing(null);
        clearErrors();
    };

    const handleStore = (data) => {
        post(route('grade-levels.store'), {
            data,
            preserveScroll: true,
            onSuccess: closeForm,
        });
    };

    const handleUpdate = (data) => {
        put(route('grade-levels.update', editing.id), {
            data,
            preserveScroll: true,
            onSuccess: closeForm,
        });
    };

    const handleDestroy = (level) => {
        if (!window.confirm(`Delete "${level.name}"? Sections linked to it may be affected.`)) {
            return;
        }
        router.delete(route('grade-levels.destroy', level.id), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Academics</p>
                        <h2 className="surface-title">Grade Levels</h2>
                    </div>
                    <button onClick={() => setShowForm(true)} className="btn-primary">
                        New Grade Level
                    </button>
                </div>
            }
        >
            <Head title="Grade Levels" />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                {(showForm || editing) && (
                    <InlineForm
                        title={editing ? `Edit ${editing.name}` : 'New Grade Level'}
                        initial={editing ? { name: editing.name, level_number: editing.level_number } : empty}
                        submitLabel={editing ? 'Save Changes' : 'Create Grade Level'}
                        onCancel={closeForm}
                        onSubmit={editing ? handleUpdate : handleStore}
                        processing={processing}
                        errors={errors}
                    />
                )}

                <div className="card overflow-hidden">
                    <div className="table-wrap">
                        <table className="table">
                            <thead className="thead">
                                <tr>
                                    <th className="th">Level</th>
                                    <th className="th">Name</th>
                                    <th className="th">Sections</th>
                                    <th className="th text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="tbody">
                                {gradeLevels.data.map((level) => (
                                    <tr key={level.id}>
                                        <td className="td">
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-navy-50 text-sm font-bold text-navy-800">
                                                {level.level_number}
                                            </span>
                                        </td>
                                        <td className="td font-semibold text-slate-900">{level.name}</td>
                                        <td className="td text-slate-600">{level.sections_count ?? 0}</td>
                                        <td className="td text-end">
                                            <div className="flex justify-end gap-1">
                                                <Link
                                                    href={route('grade-levels.show', level.id)}
                                                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-navy-700 transition hover:bg-navy-50"
                                                >
                                                    View
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setEditing(level);
                                                        setShowForm(false);
                                                    }}
                                                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDestroy(level)}
                                                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {gradeLevels.data.length === 0 && (
                                    <tr>
                                        <td className="td text-center text-sm text-slate-500" colSpan={4}>
                                            No grade levels found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Paginator meta={gradeLevels} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function InlineForm({ title, initial, submitLabel, onCancel, onSubmit, processing, errors }) {
    const [data, setData] = useState(initial);

    return (
        <div className="card card-pad mb-6">
            <h3 className="surface-title">{title}</h3>
            <form
                className="mt-4 space-y-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit(data);
                }}
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="input-label" htmlFor="gl-name">
                            Name
                        </label>
                        <input
                            id="gl-name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
                            placeholder="e.g. Grade 7"
                            className="input mt-1.5"
                            required
                        />
                        {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="input-label" htmlFor="gl-number">
                            Level Number (1–12)
                        </label>
                        <input
                            id="gl-number"
                            type="number"
                            min="1"
                            max="12"
                            value={data.level_number}
                            onChange={(e) => setData((d) => ({ ...d, level_number: e.target.value }))}
                            className="input mt-1.5"
                            required
                        />
                        {errors.level_number && (
                            <p className="mt-1.5 text-xs text-red-600">{errors.level_number}</p>
                        )}
                    </div>
                </div>
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
