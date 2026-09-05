import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ section, gradeLevels }) {
    const { data, setData, put, processing, errors } = useForm({
        name: section.name || '',
        grade_level_id: section.grade_level_id || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('sections.update', section));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Sections</p>
                        <h2 className="surface-title">
                            Edit Section — {section.name}
                        </h2>
                    </div>
                    <Link
                        href={route('sections.show', section)}
                        className="btn-outline"
                    >
                        Cancel
                    </Link>
                </div>
            }
        >
            <Head title={`Edit ${section.name}`} />

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="card overflow-hidden">
                    <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                        <h3 className="text-sm font-bold text-slate-900">
                            Section Details
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Update the section's name or grade level.
                        </p>
                    </div>
                    <form onSubmit={submit} className="card-pad space-y-6">
                        <div>
                            <label htmlFor="name" className="input-label">
                                Section Name{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="input mt-1.5"
                                required
                            />
                            {errors.name && (
                                <p className="mt-1.5 text-xs text-red-600">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="grade_level_id"
                                className="input-label"
                            >
                                Grade Level{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="grade_level_id"
                                value={data.grade_level_id}
                                onChange={(e) =>
                                    setData('grade_level_id', e.target.value)
                                }
                                className="input mt-1.5"
                                required
                            >
                                <option value="">Select Grade Level</option>
                                {gradeLevels.map((level) => (
                                    <option key={level.id} value={level.id}>
                                        {level.name}
                                    </option>
                                ))}
                            </select>
                            {errors.grade_level_id && (
                                <p className="mt-1.5 text-xs text-red-600">
                                    {errors.grade_level_id}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-5">
                            <Link
                                href={route('sections.show', section)}
                                className="btn-outline"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary"
                            >
                                {processing ? 'Saving...' : 'Update Section'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
