import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ notification }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Guardian Notifications</p>
                        <h2 className="surface-title">Notification Details</h2>
                    </div>
                    <Link href={route('guardian-notifications.index')} className="btn-outline">
                        Back to List
                    </Link>
                </div>
            }
        >
            <Head title="Notification Details" />

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="card overflow-hidden">
                    <div className="card-pad grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Student
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                                {notification.student?.full_name ?? '—'}
                            </p>
                            {notification.student?.section && (
                                <p className="text-xs text-slate-500">
                                    {notification.student.section.name}
                                </p>
                            )}
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Guardian Email
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                                {notification.guardian_email}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Status
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                                {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Sent At
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                                {notification.sent_at || 'Not sent yet'}
                            </p>
                        </div>
                        {notification.failure_reason && (
                            <div className="sm:col-span-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Failure Reason
                                </p>
                                <p className="mt-1 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-inset ring-red-100">
                                    {notification.failure_reason}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-slate-100 px-6 py-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Subject
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{notification.subject}</p>

                        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Message
                        </p>
                        <p className="mt-2 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-800 ring-1 ring-inset ring-slate-100">
                            {notification.body}
                        </p>
                    </div>

                    {notification.attendance_record_id && (
                        <div className="border-t border-slate-100 px-6 py-4">
                            <p className="text-xs text-slate-500">
                                Linked attendance record #{notification.attendance_record_id}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
