import { currentSubscription, pushSupported, subscribeToPush } from '@/offline/push';
import { useEffect, useState } from 'react';

const DISMISS_KEY = 'aamnhs-push-prompt-dismissed';

function csrfToken() {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

const STATUS_COPY = {
    off: {
        label: 'Not enabled',
        tone: 'bg-slate-100 text-slate-600',
        description:
            'Enable notifications on this device to get alerts when attendance is recorded.',
    },
    subscribed: {
        label: 'Enabled on this device',
        tone: 'bg-emerald-100 text-emerald-700',
        description:
            'This device will show a notification when attendance is recorded.',
    },
    blocked: {
        label: 'Blocked by browser',
        tone: 'bg-red-100 text-red-700',
        description:
            'Notifications are blocked for this site. Open the browser site settings, allow notifications, then reload this page.',
    },
    unconfigured: {
        label: 'Server not configured',
        tone: 'bg-amber-100 text-amber-700',
        description:
            'Push notifications are not configured on the server yet. Ask an administrator to set the VAPID keys.',
    },
    unsupported: {
        label: 'Not supported',
        tone: 'bg-slate-100 text-slate-600',
        description:
            'This browser does not support push notifications. On iPhone, install the app to the Home Screen first.',
    },
};

export default function PushSettings() {
    const [status, setStatus] = useState('loading');
    const [busy, setBusy] = useState(false);
    const [testing, setTesting] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!pushSupported()) {
            setStatus('unsupported');

            return;
        }

        let cancelled = false;

        Promise.all([
            fetch('/push/public-key', {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            }).then((response) => response.json()),
            currentSubscription().catch(() => null),
        ])
            .then(([config, subscription]) => {
                if (cancelled) return;

                if (!config?.enabled) {
                    setStatus('unconfigured');
                } else if (Notification.permission === 'denied') {
                    setStatus('blocked');
                } else if (subscription) {
                    setStatus('subscribed');
                } else {
                    setStatus('off');
                }
            })
            .catch(() => {
                if (!cancelled) setStatus('off');
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const enable = async () => {
        setBusy(true);
        setMessage(null);
        setError(null);

        try {
            await subscribeToPush();
            localStorage.removeItem(DISMISS_KEY);
            setStatus('subscribed');
            setMessage('Notifications are now enabled on this device.');
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const disable = async () => {
        setBusy(true);
        setMessage(null);
        setError(null);

        try {
            const subscription = await currentSubscription();

            if (subscription) {
                await fetch('/push/unsubscribe', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-XSRF-TOKEN': csrfToken(),
                    },
                    body: JSON.stringify({
                        endpoint: subscription.endpoint,
                    }),
                });

                await subscription.unsubscribe();
            }

            setStatus('off');
            setMessage('Notifications are disabled on this device.');
        } catch (err) {
            setError(err.message || 'Could not disable notifications.');
        } finally {
            setBusy(false);
        }
    };

    const sendTest = async () => {
        setTesting(true);
        setMessage(null);
        setError(null);

        try {
            const response = await fetch('/push/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': csrfToken(),
                },
            });
            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'The test notification could not be sent.');
            } else {
                setMessage(data.message || 'Test notification sent.');
            }
        } catch {
            setError('Could not reach the server. Check your connection.');
        } finally {
            setTesting(false);
        }
    };

    const copy = STATUS_COPY[status] || STATUS_COPY.off;

    return (
        <div className="card card-pad">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className="text-base font-semibold text-slate-900">
                        Push notifications
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                        Get alerts on this device even when the app is closed.
                    </p>
                </div>
                {status !== 'loading' && (
                    <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${copy.tone}`}
                    >
                        {copy.label}
                    </span>
                )}
            </div>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {copy.description}
            </p>

            {message && (
                <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                    {message}
                </p>
            )}
            {error && (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
                {status === 'off' && (
                    <button
                        type="button"
                        onClick={enable}
                        disabled={busy}
                        className="btn-primary"
                    >
                        {busy ? 'Enabling…' : 'Enable notifications'}
                    </button>
                )}

                {status === 'subscribed' && (
                    <>
                        <button
                            type="button"
                            onClick={sendTest}
                            disabled={testing}
                            className="btn-primary"
                        >
                            {testing ? 'Sending…' : 'Send test notification'}
                        </button>
                        <button
                            type="button"
                            onClick={disable}
                            disabled={busy}
                            className="btn-outline"
                        >
                            {busy ? 'Disabling…' : 'Disable on this device'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
