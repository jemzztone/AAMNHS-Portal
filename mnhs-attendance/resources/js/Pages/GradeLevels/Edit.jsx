import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ gradeLevel }) {
    const { data, setData, put, processing, errors } = useForm({
        name: gradeLevel.name,
        level_number: gradeLevel.level_number,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('grade-levels.update', gradeLevel.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Grade Levels</p>
                        <h2 className="surface-title">Edit {gradeLevel.name}</h2>
                    </div>
                    <Link href={route('grade-levels.index')} className="btn-outline">
                        Back to List
                    </Link>
                </div>
            }
        >
            <Head title={`Edit ${gradeLevel.name}`} />

            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="card card-pad">
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="input-label" htmlFor="name">
                                Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="input mt-1.5"
                                required
                            />
                            {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="input-label" htmlFor="level_number">
                                Level Number (1–12)
                            </label>
                            <input
                                id="level_number"
                                type="number"
                                min="1"
                                max="12"
                                value={data.level_number}
                                onChange={(e) => setData('level_number', e.target.value)}
                                className="input mt-1.5"
                                required
                            />
                            {errors.level_number && (
                                <p className="mt-1.5 text-xs text-red-600">{errors.level_number}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Link href={route('grade-levels.show', gradeLevel.id)} className="btn-outline">
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
