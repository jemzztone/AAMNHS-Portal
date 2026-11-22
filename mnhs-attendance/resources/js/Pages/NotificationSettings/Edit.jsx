import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

function Toggle({ id, label, hint, checked, onChange, disabled }) {
    return (
        <label
            htmlFor={id}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                disabled
                    ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-60'
                    : 'border-slate-200 hover:border-navy-300 hover:bg-navy-50/40'
            }`}
        >
            <input
                id={id}
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-navy-600 focus:ring-navy-500"
            />
            <span>
                <span className="block text-sm font-semibold text-slate-900">{label}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{hint}</span>
            </span>
        </label>
    );
}

export default function Edit({ settings }) {
    const { data, setData, put, processing, errors } = useForm({
        notify_on_time_in: settings.notify_on_time_in,
        notify_on_time_out: settings.notify_on_time_out,
        notify_on_late_only: settings.notify_on_late_only,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('notification-settings.update'), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <p className="page-eyebrow">Communications</p>
                    <h2 className="surface-title">Notification Preferences</h2>
                </div>
            }
        >
            <Head title="Notification Preferences" />

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <form onSubmit={submit} className="card card-pad space-y-5">
                    <div>
                        <h3 className="text-base font-semibold text-slate-900">Guardian emails</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Choose which attendance events send an email to the guardian address saved on the student
                            record. Notifications are queued, and every attempt is listed on the Guardian Notifications
                            page.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Toggle
                            id="notify_on_time_in"
                            label="Arrival (time in)"
                            hint="Send an email when a student scans in at the gate."
                            checked={data.notify_on_time_in}
                            onChange={(value) => setData('notify_on_time_in', value)}
                            disabled={data.notify_on_late_only}
                        />
                        <Toggle
                            id="notify_on_time_out"
                            label="Departure (time out)"
                            hint="Send an email when a student scans out at the end of the day."
                            checked={data.notify_on_time_out}
                            onChange={(value) => setData('notify_on_time_out', value)}
                            disabled={data.notify_on_late_only}
                        />
                        <Toggle
                            id="notify_on_late_only"
                            label="Late arrivals only"
                            hint="Send an arrival email only when the student is marked late. Departure emails are turned off while this is enabled."
                            checked={data.notify_on_late_only}
                            onChange={(value) => setData('notify_on_late_only', value)}
                        />
                    </div>

                    {(errors.notify_on_time_in || errors.notify_on_time_out || errors.notify_on_late_only) && (
                        <p className="text-sm font-medium text-red-600">
                            {errors.notify_on_time_in || errors.notify_on_time_out || errors.notify_on_late_only}
                        </p>
                    )}

                    <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                        Free email providers cap daily sending (Gmail ~500, Brevo 300, SendGrid 100). Turning on
                        &ldquo;Late arrivals only&rdquo; keeps the daily volume low when most students arrive on time.
                    </p>

                    <div className="flex justify-end">
                        <button type="submit" className="btn-primary" disabled={processing}>
                            {processing ? 'Saving…' : 'Save preferences'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
