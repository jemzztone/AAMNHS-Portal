import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ gradeLevel }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Grade Levels</p>
                        <h2 className="surface-title">{gradeLevel.name}</h2>
                    </div>
                    <Link href={route('grade-levels.index')} className="btn-outline">
                        Back to List
                    </Link>
                </div>
            }
        >
            <Head title={gradeLevel.name} />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="card overflow-hidden">
                    <div className="card-pad grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Name
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{gradeLevel.name}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Level Number
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{gradeLevel.level_number}</p>
                        </div>
                    </div>
                </div>

                <div className="card overflow-hidden mt-6">
                    <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                        <h3 className="text-sm font-bold text-slate-900">
                            Sections ({gradeLevel.sections?.length ?? 0})
                        </h3>
                    </div>
                    {gradeLevel.sections?.length > 0 ? (
                        <ul className="divide-y divide-slate-100">
                            {gradeLevel.sections.map((section) => (
                                <li key={section.id} className="flex items-center justify-between px-6 py-3.5">
                                    <span className="text-sm font-medium text-slate-900">{section.name}</span>
                                    <Link
                                        href={route('sections.show', section.id)}
                                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-navy-700 transition hover:bg-navy-50"
                                    >
                                        View
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="px-6 py-10 text-center text-sm text-slate-500">
                            No sections for this grade level.
                        </p>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
