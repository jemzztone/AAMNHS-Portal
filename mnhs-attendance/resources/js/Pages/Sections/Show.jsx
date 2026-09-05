import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';

function InfoCard({ label, value }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {label}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
        </div>
    );
}

export default function Show({ section, teachers }) {
    const user = usePage().props.auth.user;

    const { data, setData, post, processing, errors } = useForm({
        teacher_id: '',
    });

    const assignTeacher = (e) => {
        e.preventDefault();
        post(route('sections.assign-teacher', section), {
            preserveScroll: true,
            onSuccess: () => setData('teacher_id', ''),
        });
    };

    const removeTeacher = (assignment) => {
        if (confirm('Remove this teacher from the section?')) {
            router.delete(
                route('sections.remove-teacher', [section, assignment]),
                { preserveScroll: true },
            );
        }
    };

    const canManage = ['super_admin', 'admin'].includes(user?.role);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Sections</p>
                        <h2 className="surface-title">{section.name}</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={route('sections.index')}
                            className="btn-outline"
                        >
                            Back
                        </Link>
                        {canManage && (
                            <Link
                                href={route('sections.edit', section)}
                                className="btn-primary"
                            >
                                <svg
                                    className="h-4 w-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.8"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                                    />
                                </svg>
                                Edit
                            </Link>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={section.name} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Section info */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <InfoCard
                        label="Grade Level"
                        value={section.grade_level?.name}
                    />
                    <InfoCard
                        label="Students"
                        value={section.students?.length || 0}
                    />
                    <InfoCard
                        label="Schedules"
                        value={`${section.schedules?.length || 0} days`}
                    />
                </div>

                {/* Teacher assignment */}
                <div className="card card-pad mb-6">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                            <svg
                                className="h-[18px] w-[18px]"
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
                        </span>
                        <h3 className="surface-title">Assigned Teachers</h3>
                    </div>

                    {section.teachers && section.teachers.length > 0 ? (
                        <ul className="mt-4 space-y-2">
                            {section.teachers.map((teacher) => (
                                <li
                                    key={teacher.id}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5"
                                >
                                    <span className="flex items-center gap-2.5">
                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy-100 text-xs font-bold text-navy-800">
                                            {teacher.name
                                                .split(' ')
                                                .map((p) => p[0])
                                                .slice(0, 2)
                                                .join('')
                                                .toUpperCase()}
                                        </span>
                                        <span className="text-sm font-semibold text-slate-900">
                                            {teacher.name}
                                        </span>
                                    </span>
                                    {canManage && (
                                        <button
                                            onClick={() =>
                                                removeTeacher(teacher.pivot.id)
                                            }
                                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                        >
                                            <svg
                                                className="h-3.5 w-3.5"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.8"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                            Remove
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
                            No teacher assigned yet.
                        </p>
                    )}

                    {canManage && (
                        <form
                            onSubmit={assignTeacher}
                            className="mt-5 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-5"
                        >
                            <div className="min-w-[220px] flex-1">
                                <label htmlFor="teacher_id" className="input-label">
                                    Assign Teacher
                                </label>
                                <select
                                    id="teacher_id"
                                    value={data.teacher_id}
                                    onChange={(e) =>
                                        setData('teacher_id', e.target.value)
                                    }
                                    className="input mt-1.5"
                                >
                                    <option value="">Select Teacher</option>
                                    {(teachers || [])
                                        .filter(
                                            (teacher) =>
                                                !(section.teachers || []).some(
                                                    (assigned) =>
                                                        assigned.id ===
                                                        teacher.id,
                                                ),
                                        )
                                        .map((teacher) => (
                                            <option
                                                key={teacher.id}
                                                value={teacher.id}
                                            >
                                                {teacher.name}
                                            </option>
                                        ))}
                                </select>
                                {errors.teacher_id && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.teacher_id}
                                    </p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary"
                            >
                                Assign
                            </button>
                        </form>
                    )}
                </div>

                {/* Schedules */}
                <div className="card overflow-hidden">
                    <div className="border-b border-slate-100 px-6 py-5">
                        <h3 className="surface-title">Weekly Schedule</h3>
                    </div>
                    {section.schedules && section.schedules.length > 0 ? (
                        <div className="table-wrap">
                            <table className="table">
                                <thead className="thead">
                                    <tr>
                                        <th className="th">Day</th>
                                        <th className="th">Start</th>
                                        <th className="th">End</th>
                                        <th className="th">Grace (min)</th>
                                    </tr>
                                </thead>
                                <tbody className="tbody">
                                    {section.schedules.map((schedule) => (
                                        <tr key={schedule.id}>
                                            <td className="td font-semibold text-slate-900">
                                                {schedule.day_of_week}
                                            </td>
                                            <td className="td font-mono text-slate-600">
                                                {schedule.start_time}
                                            </td>
                                            <td className="td font-mono text-slate-600">
                                                {schedule.end_time}
                                            </td>
                                            <td className="td text-slate-600">
                                                {schedule.grace_minutes}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="px-6 py-8 text-sm text-slate-500">
                            No schedule configured.
                        </p>
                    )}
                </div>

                {/* Students */}
                <div className="card overflow-hidden">
                    <div className="border-b border-slate-100 px-6 py-5">
                        <h3 className="surface-title">
                            Students in Section
                        </h3>
                    </div>
                    {section.students && section.students.length > 0 ? (
                        <div className="table-wrap">
                            <table className="table">
                                <thead className="thead">
                                    <tr>
                                        <th className="th">Name</th>
                                        <th className="th">LRN</th>
                                        <th className="th">Status</th>
                                        <th className="th text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="tbody">
                                    {section.students.map((student) => (
                                        <tr key={student.id}>
                                            <td className="td font-semibold text-slate-900">
                                                {student.full_name}
                                            </td>
                                            <td className="td font-mono text-xs text-slate-600">
                                                {student.lrn}
                                            </td>
                                            <td className="td">
                                                <span
                                                    className={`badge ring-1 ring-inset ${
                                                        student.is_active
                                                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                                                            : 'bg-red-50 text-red-700 ring-red-600/20'
                                                    }`}
                                                >
                                                    <span
                                                        className={`badge-dot ${
                                                            student.is_active
                                                                ? 'bg-emerald-500'
                                                                : 'bg-red-500'
                                                        }`}
                                                    />
                                                    {student.is_active
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="td text-end">
                                                <Link
                                                    href={route(
                                                        'students.show',
                                                        student,
                                                    )}
                                                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-navy-700 transition hover:bg-navy-50"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="px-6 py-8 text-sm text-slate-500">
                            No students in this section yet.
                        </p>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
