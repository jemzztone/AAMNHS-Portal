import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

function ValuesBlock({ label, values }) {
    if (!values || (typeof values === 'object' && Object.keys(values).length === 0)) {
        return null;
    }

    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
            <div className="mt-2 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-inset ring-slate-100">
                <dl className="space-y-1.5">
                    {Object.entries(values).map(([key, value]) => (
                        <div key={key} className="flex flex-wrap gap-x-2 text-sm">
                            <dt className="font-semibold text-slate-700">{key}:</dt>
                            <dd className="break-all text-slate-600">
                                {typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value ?? '—')}
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
        </div>
    );
}

export default function Show({ log }) {
    const parse = (v) => {
        if (!v) return null;
        if (typeof v === 'string') {
            try {
                return JSON.parse(v);
            } catch {
                return { value: v };
            }
        }
        return v;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Audit Logs</p>
                        <h2 className="surface-title">{log.event}</h2>
                    </div>
                    <Link href={route('audit-logs.index')} className="btn-outline">
                        Back to List
                    </Link>
                </div>
            }
        >
            <Head title={`Audit Log ${log.event}`} />

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="card overflow-hidden">
                    <div className="card-pad grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Event
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{log.event}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Actor
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                                {log.user?.name ?? 'System'}
                            </p>
                            {log.user?.email && (
                                <p className="text-xs text-slate-500">{log.user.email}</p>
                            )}
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Subject
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                                {log.auditable_type
                                    ? `${log.auditable_type.split('\\').pop()} #${log.auditable_id}`
                                    : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Recorded
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{log.created_at}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                IP Address
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{log.ip_address || '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                User Agent
                            </p>
                            <p className="mt-1 break-all text-sm text-slate-900">{log.user_agent || '—'}</p>
                        </div>
                    </div>

                    <div className="space-y-5 border-t border-slate-100 px-6 py-5">
                        <ValuesBlock label="Old Values" values={parse(log.old_values)} />
                        <ValuesBlock label="New Values" values={parse(log.new_values)} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
