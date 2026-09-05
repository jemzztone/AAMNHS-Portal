import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const FIELDS = [
    { key: 'first_name', label: 'First Name', required: true },
    { key: 'last_name', label: 'Last Name', required: true },
    { key: 'middle_name', label: 'Middle Name', required: false },
    { key: 'lrn', label: 'LRN (12 digits)', required: true, hint: 'Must be exactly 12 digits' },
];

export default function Edit({ student, sections }) {
    const { data, setData, put, processing, errors } = useForm({
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        middle_name: student.middle_name || '',
        lrn: student.lrn || '',
        section_id: student.section_id || '',
        guardian_name: student.guardian_name || '',
        guardian_email: student.guardian_email || '',
        is_active: student.is_active,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('students.update', student));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Students</p>
                        <h2 className="surface-title">
                            Edit Student — {student.full_name}
                        </h2>
                    </div>
                    <Link
                        href={route('students.show', student)}
                        className="btn-outline"
                    >
                        Cancel
                    </Link>
                </div>
            }
        >
            <Head title={`Edit ${student.full_name}`} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="card overflow-hidden">
                    <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                        <h3 className="text-sm font-bold text-slate-900">
                            Personal Information
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Update the student's details below.
                        </p>
                    </div>
                    <form onSubmit={submit} className="card-pad space-y-6">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            {FIELDS.map((field) => (
                                <div key={field.key}>
                                    <label
                                        htmlFor={field.key}
                                        className="input-label"
                                    >
                                        {field.label}{' '}
                                        {field.required && (
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        id={field.key}
                                        type="text"
                                        value={data[field.key]}
                                        onChange={(e) =>
                                            setData(
                                                field.key,
                                                e.target.value,
                                            )
                                        }
                                        pattern={field.key === 'lrn' ? '\\d{12}' : undefined}
                                        maxLength={field.key === 'lrn' ? 12 : undefined}
                                        inputMode={field.key === 'lrn' ? 'numeric' : undefined}
                                        className="input mt-1.5"
                                        required={field.required}
                                    />
                                    {field.hint && !errors[field.key] && (
                                        <p className="mt-1 text-xs text-slate-400">
                                            {field.hint}
                                        </p>
                                    )}
                                    {errors[field.key] && (
                                        <p className="mt-1.5 text-xs text-red-600">
                                            {errors[field.key]}
                                        </p>
                                    )}
                                </div>
                            ))}

                            <div>
                                <label
                                    htmlFor="section_id"
                                    className="input-label"
                                >
                                    Section <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="section_id"
                                    value={data.section_id}
                                    onChange={(e) =>
                                        setData('section_id', e.target.value)
                                    }
                                    className="input mt-1.5"
                                    required
                                >
                                    <option value="">Select Section</option>
                                    {sections.map((section) => (
                                        <option
                                            key={section.id}
                                            value={section.id}
                                        >
                                            {section.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.section_id && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.section_id}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-5">
                            <h3 className="text-sm font-bold text-slate-900">
                                Guardian Details
                            </h3>
                            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="guardian_name"
                                        className="input-label"
                                    >
                                        Guardian Name
                                    </label>
                                    <input
                                        id="guardian_name"
                                        type="text"
                                        value={data.guardian_name}
                                        onChange={(e) =>
                                            setData(
                                                'guardian_name',
                                                e.target.value,
                                            )
                                        }
                                        className="input mt-1.5"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="guardian_email"
                                        className="input-label"
                                    >
                                        Guardian Email
                                    </label>
                                    <input
                                        id="guardian_email"
                                        type="email"
                                        value={data.guardian_email}
                                        onChange={(e) =>
                                            setData(
                                                'guardian_email',
                                                e.target.value,
                                            )
                                        }
                                        className="input mt-1.5"
                                    />
                                    {errors.guardian_email && (
                                        <p className="mt-1.5 text-xs text-red-600">
                                            {errors.guardian_email}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                            <input
                                id="is_active"
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) =>
                                    setData('is_active', e.target.checked)
                                }
                                className="h-4 w-4 rounded border-slate-300 text-navy-700 focus:ring-navy-500"
                            />
                            <label
                                htmlFor="is_active"
                                className="text-sm font-medium text-slate-700"
                            >
                                Active (not archived)
                            </label>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-5">
                            <Link
                                href={route('students.show', student)}
                                className="btn-outline"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary"
                            >
                                {processing ? 'Saving...' : 'Update Student'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
