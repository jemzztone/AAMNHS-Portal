import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const FIELDS = [
    { key: 'first_name', label: 'First Name', required: true },
    { key: 'last_name', label: 'Last Name', required: true },
    { key: 'middle_name', label: 'Middle Name', required: false },
    { key: 'lrn', label: 'LRN (12 digits)', required: true, hint: 'Must be exactly 12 digits' },
];

export default function Create({ sections }) {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        middle_name: '',
        lrn: '',
        section_id: '',
        guardian_name: '',
        guardian_email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('students.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Students</p>
                        <h2 className="surface-title">Add New Student</h2>
                    </div>
                    <Link href={route('students.index')} className="btn-outline">
                        Cancel
                    </Link>
                </div>
            }
        >
            <Head title="Add Student" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="card overflow-hidden">
                    <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                        <h3 className="text-sm font-bold text-slate-900">
                            Personal Information
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Fill in the student's details below.
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
                                <label htmlFor="section_id" className="input-label">
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
                            <p className="mt-0.5 text-xs text-slate-500">
                                Guardians receive email alerts on every gate
                                scan.
                            </p>
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
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-5">
                            <Link
                                href={route('students.index')}
                                className="btn-outline"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary"
                            >
                                {processing ? 'Creating...' : 'Create Student'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
