import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ gradeLevels }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        grade_level_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('sections.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Sections</p>
                        <h2 className="surface-title">Add New Section</h2>
                    </div>
                    <Link href={route('sections.index')} className="btn-outline">
                        Cancel
                    </Link>
                </div>
            }
        >
            <Head title="Add Section" />

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="card overflow-hidden">
                    <div className="border-b border-slate-100 bg-slate-50/60 px-4 sm:px-6 py-4">
                        <h3 className="text-sm font-bold text-slate-900">
                            Section Details
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Name the section and attach it to a grade level.
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
                                placeholder="e.g. Grade 7 - B"
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
                                href={route('sections.index')}
                                className="btn-outline"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary"
                            >
                                {processing
                                    ? 'Creating...'
                                    : 'Create Section'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
