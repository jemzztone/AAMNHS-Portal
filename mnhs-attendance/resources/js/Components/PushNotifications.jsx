import { currentSubscription, pushSupported, subscribeToPush } from '@/offline/push';
import { useEffect, useState } from 'react';

const DISMISS_KEY = 'aamnhs-push-prompt-dismissed';

/**
 * Small floating prompt that asks the user to enable push notifications.
 *
 * Browsers require a user gesture before showing the permission prompt, so we
 * never call Notification.requestPermission() on page load — only when the
 * user clicks "Enable".
 */
export default function PushNotifications() {
    const [status, setStatus] = useState('hidden');
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (!pushSupported()) {
            return;
        }

        if (Notification.permission === 'granted') {
            currentSubscription()
                .then((subscription) => setStatus(subscription ? 'subscribed' : 'prompt'))
                .catch(() => setStatus('prompt'));

            return;
        }

        if (Notification.permission === 'denied') {
            return;
        }

        if (localStorage.getItem(DISMISS_KEY) === '1') {
            return;
        }

        setStatus('prompt');
    }, []);

    if (status === 'hidden' || status === 'subscribed') {
        return null;
    }

    const enable = async () => {
        setBusy(true);
        setMessage(null);

        try {
            await subscribeToPush();
            setStatus('subscribed');
        } catch (error) {
            setMessage(error.message);
        } finally {
            setBusy(false);
        }
    };

    const dismiss = () => {
        localStorage.setItem(DISMISS_KEY, '1');
        setStatus('hidden');
    };

    return (
        // On phones this renders inline above the page header so it cannot
        // cover the bottom navigation, scan button, or table actions.
        <div className="z-40 mx-4 mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-lg lg:fixed lg:bottom-4 lg:right-4 lg:mx-0 lg:mt-0 lg:w-72">
            <p className="text-sm font-semibold text-navy-900">Enable notifications</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Get an instant alert on this device when attendance is recorded.
            </p>

            {message && <p className="mt-2 text-xs font-medium text-red-600">{message}</p>}

            <div className="mt-3 flex items-center gap-2">
                <button
                    type="button"
                    onClick={enable}
                    disabled={busy}
                    className="rounded-lg bg-navy-800 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                >
                    {busy ? 'Enabling…' : 'Enable'}
                </button>
                <button
                    type="button"
                    onClick={dismiss}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                    Not now
                </button>
            </div>
        </div>
    );
}
