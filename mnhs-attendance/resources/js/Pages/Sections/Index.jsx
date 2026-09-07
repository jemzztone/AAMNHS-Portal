import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Index({ sections }) {
    const { auth } = usePage().props;
    const canManage = ['super_admin', 'admin'].includes(auth.user?.role);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Organization</p>
                        <h2 className="surface-title">Sections</h2>
                    </div>
                    {canManage && (
                        <Link href={route('sections.create')} className="btn-primary">
                            <svg
                                className="h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4.5v15m7.5-7.5h-15"
                                />
                            </svg>
                            Add Section
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="Sections" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="card overflow-hidden">
                    <div className="table-wrap">
                        <table className="table">
                            <thead className="thead">
                                <tr>
                                    <th className="th">Name</th>
                                    <th className="th">Grade Level</th>
                                    <th className="th">Teachers</th>
                                    <th className="th">Students</th>
                                    <th className="th text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="tbody">
                                {sections.data.map((section) => (
                                    <tr key={section.id}>
                                        <td className="td">
                                            <div className="flex items-center gap-3">
                                                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-100 font-bold text-navy-800">
                                                    {section.name
                                                        .split(' ')
                                                        .slice(-1)[0]
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                                <span className="font-semibold text-slate-900">
                                                    {section.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="td">
                                            <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                                {section.grade_level?.name}
                                            </span>
                                        </td>
                                        <td className="td text-slate-600">
                                            {section.teachers
                                                ?.map((t) => t.name)
                                                .join(', ') || '—'}
                                        </td>
                                        <td className="td">
                                            <span className="inline-flex items-center gap-1.5 text-slate-600">
                                                <svg
                                                    className="h-4 w-4 text-slate-400"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="1.8"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                                                    />
                                                </svg>
                                                {section.students_count || 0}
                                            </span>
                                        </td>
                                        <td className="td text-end">
                                            <div className="inline-flex items-center gap-1">
                                                <Link
                                                    href={route(
                                                        'sections.show',
                                                        section,
                                                    )}
                                                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-navy-700 transition hover:bg-navy-50"
                                                >
                                                    View
                                                </Link>
                                                {canManage && (
                                                    <Link
                                                        href={route(
                                                            'sections.edit',
                                                            section,
                                                        )}
                                                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                                                    >
                                                        Edit
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {sections.data.length === 0 && (
                        <div className="px-6 py-16 text-center">
                            <svg
                                className="mx-auto h-10 w-10 text-slate-300"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                                />
                            </svg>
                            <p className="mt-3 text-sm font-medium text-slate-600">
                                No sections yet
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                Create your first section to organize students.
                            </p>
                        </div>
                    )}

                    {sections.last_page > 1 && (
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
                            <p className="text-xs text-slate-500">
                                Showing page {sections.current_page} of{' '}
                                {sections.last_page}
                            </p>
                            <div className="flex items-center gap-1">
                                {sections.links.map((link, index) => {
                                    if (!link.url) {
                                        return (
                                            <span
                                                key={index}
                                                className="px-2.5 py-1.5 text-xs text-slate-400"
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        );
                                    }
                                    return (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                                link.active
                                                    ? 'bg-navy-800 text-white'
                                                    : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50'
                                            }`}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
