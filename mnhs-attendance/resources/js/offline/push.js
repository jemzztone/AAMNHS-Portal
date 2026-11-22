function csrfToken() {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

export function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    const output = new Uint8Array(raw.length);

    for (let i = 0; i < raw.length; i += 1) {
        output[i] = raw.charCodeAt(i);
    }

    return output;
}

export function pushSupported() {
    return (
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
    );
}

/**
 * Subscribe this browser to push notifications and register the subscription
 * with the server. Must be called from a user gesture (button click).
 */
export async function subscribeToPush() {
    if (!pushSupported()) {
        throw new Error('Push notifications are not supported in this browser.');
    }

    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
        throw new Error('Notifications were blocked. Enable them in your browser settings.');
    }

    const registration = await navigator.serviceWorker.ready;

    const keyResponse = await fetch('/push/public-key', {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
    const { publicKey, enabled } = await keyResponse.json();

    if (!enabled || !publicKey) {
        throw new Error('Push notifications are not configured on the server yet.');
    }

    const existing = await registration.pushManager.getSubscription();
    const subscription =
        existing ||
        (await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
        }));

    await fetch('/push/subscribe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': csrfToken(),
        },
        body: JSON.stringify(subscription.toJSON()),
    });

    return subscription;
}

export async function currentSubscription() {
    if (!pushSupported()) {
        return null;
    }

    const registration = await navigator.serviceWorker.ready;

    return registration.pushManager.getSubscription();
}
