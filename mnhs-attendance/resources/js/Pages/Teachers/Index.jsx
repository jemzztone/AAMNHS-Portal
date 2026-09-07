import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ teachers, sections, filters }) {
    const flash = usePage().props.flash;
    const [search, setSearch] = useState(filters.search || '');
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [removeTarget, setRemoveTarget] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        teacher_id: '',
        section_id: '',
    });

    const { processing: removeProcessing, delete: destroy } = useForm();

    const handleFilter = () => {
        router.get(route('teachers.index'), { search }, { preserveState: true });
    };

    const openAssignModal = (teacher) => {
        setSelectedTeacher(teacher);
        setData('teacher_id', teacher.id);
        setData('section_id', '');
        setShowAssignModal(true);
    };

    const handleAssign = (e) => {
        e.preventDefault();
        post(route('teachers.assign'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowAssignModal(false);
                setSelectedTeacher(null);
            },
        });
    };

    const openRemoveModal = (teacher, section) => {
        setRemoveTarget({ teacher, section });
        setShowRemoveModal(true);
    };

    const handleRemove = () => {
        if (!removeTarget) return;
        router.post(route('teachers.remove'), {
            user_id: removeTarget.teacher.id,
            section_id: removeTarget.section.id,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowRemoveModal(false);
                setRemoveTarget(null);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <p className="page-eyebrow">Administration</p>
                    <h2 className="surface-title">Teacher Management</h2>
                </div>
            }
        >
            <Head title="Teachers" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <div className="flex items-start gap-3">
                            <svg className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm font-medium text-emerald-800">{flash.success}</p>
                        </div>
                    </div>
                )}

                {flash?.error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
                        <div className="flex items-start gap-3">
                            <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm font-medium text-red-800">{flash.error}</p>
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="card card-pad mb-6">
                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="flex-1">
                            <label className="input-label" htmlFor="search">Search Teachers</label>
                            <input
                                id="search"
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                placeholder="Search by name..."
                                className="input mt-1.5"
                            />
                        </div>
                        <div className="flex items-end">
                            <button onClick={handleFilter} className="btn-primary">Filter</button>
                        </div>
                    </div>
                </div>

                {/* Teachers List */}
                <div className="space-y-4">
                    {teachers.length === 0 ? (
                        <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
                            <svg className="h-10 w-10 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                            </svg>
                            <p className="mt-3 text-sm font-medium text-slate-600">No teachers found</p>
                            <p className="mt-1 text-xs text-slate-400">Teachers are users with the teacher role.</p>
                        </div>
                    ) : (
                        teachers.map((teacher) => (
                            <div key={teacher.id} className="card overflow-hidden">
                                <div className="flex items-center justify-between border-b border-slate-100 px-4 sm:px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-bold text-white ring-1 ring-emerald-600/20">
                                            {teacher.name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                                        </span>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900">{teacher.name}</h3>
                                            <p className="text-xs text-slate-500">{teacher.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openAssignModal(teacher)}
                                        className="btn-primary"
                                    >
                                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                        Assign Section
                                    </button>
                                </div>

                                <div className="px-4 sm:px-6 py-4">
                                    {teacher.assigned_sections && teacher.assigned_sections.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {teacher.assigned_sections.map((section) => (
                                                <div
                                                    key={section.id}
                                                    className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 transition hover:border-red-200 hover:bg-red-50/50"
                                                >
                                                    <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                                                    <span className="text-sm font-medium text-slate-700">
                                                        {section.name}
                                                    </span>
                                                    {section.grade_level && (
                                                        <span className="text-xs text-slate-400">
                                                            ({section.grade_level.name})
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => openRemoveModal(teacher, section)}
                                                        className="ml-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-400 opacity-0 transition hover:bg-red-100 hover:text-red-600 group-hover:opacity-100"
                                                        title={`Remove from ${section.name}`}
                                                    >
                                                        <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">No sections assigned yet.</p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Assign Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setShowAssignModal(false)} />
                    <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
                        <div className="border-b border-slate-100 px-6 py-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Assign Section</h3>
                                    <p className="mt-0.5 text-sm text-slate-500">
                                        Assign a section to {selectedTeacher?.name}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowAssignModal(false)}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                >
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleAssign} className="px-6 py-5">
                            <div>
                                <label htmlFor="section_id" className="input-label">Section</label>
                                <select
                                    id="section_id"
                                    value={data.section_id}
                                    onChange={(e) => setData('section_id', e.target.value)}
                                    className="input mt-1.5"
                                >
                                    <option value="">Select a section</option>
                                    {sections
                                        .filter((s) => {
                                            const assignedIds = selectedTeacher?.assigned_sections?.map((a) => a.id) || [];
                                            return !assignedIds.includes(s.id);
                                        })
                                        .map((section) => (
                                            <option key={section.id} value={section.id}>
                                                {section.name} {section.grade_level ? `(${section.grade_level.name})` : ''}
                                            </option>
                                        ))}
                                </select>
                                {errors.section_id && (
                                    <p className="mt-1.5 text-xs text-red-600">{errors.section_id}</p>
                                )}
                            </div>

                            <div className="mt-5 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAssignModal(false)}
                                    className="btn-outline"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || !data.section_id}
                                    className="btn-primary"
                                >
                                    {processing ? 'Assigning...' : 'Assign'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Remove Confirmation Modal */}
            {showRemoveModal && removeTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setShowRemoveModal(false)} />
                    <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
                        <div className="px-6 py-5">
                            <div className="flex items-start gap-4">
                                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                                    <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                    </svg>
                                </span>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Remove Teacher Assignment</h3>
                                    <p className="mt-2 text-sm text-slate-600">
                                        Are you sure you want to remove <span className="font-semibold text-slate-900">{removeTarget.teacher.name}</span> from <span className="font-semibold text-slate-900">{removeTarget.section?.name}</span>?
                                    </p>
                                    <p className="mt-2 text-xs text-slate-500">
                                        The teacher will receive a notification about this removal.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setShowRemoveModal(false)}
                                className="btn-outline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRemove}
                                disabled={removeProcessing}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:pointer-events-none disabled:opacity-50"
                            >
                                {removeProcessing ? 'Removing...' : 'Remove Assignment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
