import { getQueuedScans, removeQueuedScans } from './db';

const SYNC_URL = '/guard/scan/sync';
const FLUSH_CHUNK = 50;

function csrfToken() {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

let flushing = false;

/**
 * Replay every queued scan. Successful and rejected scans are both final and
 * are removed from the queue; only a network failure keeps them for later.
 */
export async function flushScanQueue() {
    if (flushing || typeof navigator === 'undefined' || !navigator.onLine) {
        return { synced: 0, remaining: 0 };
    }

    flushing = true;

    try {
        const queued = await getQueuedScans();

        if (queued.length === 0) {
            return { synced: 0, remaining: 0 };
        }

        let synced = 0;

        for (let start = 0; start < queued.length; start += FLUSH_CHUNK) {
            const chunk = queued.slice(start, start + FLUSH_CHUNK);
            const response = await fetch(SYNC_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': csrfToken(),
                },
                body: JSON.stringify({
                    scans: chunk.map((scan) => ({
                        client_id: scan.client_id,
                        qr_token: scan.qr_token || null,
                        lrn: scan.lrn || null,
                        mode: scan.mode || 'auto',
                        scanned_at: scan.scanned_at,
                    })),
                }),
            });

            if (!response.ok) {
                break;
            }

            const data = await response.json();
            const results = data.results || [];

            await removeQueuedScans(results.map((row) => row.client_id));
            synced += results.length;

            if (results.some((row) => row.success)) {
                await notify('Attendance synced', `${results.length} offline scan(s) were uploaded.`);
            }
        }

        const remaining = (await getQueuedScans()).length;
        window.dispatchEvent(new CustomEvent('aamnhs:scans-synced', { detail: { synced, remaining } }));

        return { synced, remaining };
    } catch {
        return { synced: 0, remaining: (await getQueuedScans().catch(() => [])).length };
    } finally {
        flushing = false;
    }
}

async function notify(title, body) {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
        return;
    }

    const registration = await navigator.serviceWorker?.getRegistration();

    if (registration) {
        await registration.showNotification(title, {
            body,
            icon: '/images/AAMNHS_LOGO.png',
            badge: '/images/AAMNHS_LOGO.png',
            tag: 'aamnhs-sync',
        });
    }
}

let initialised = false;

/**
 * Wire up the automatic sync triggers. Safe to call more than once.
 */
export function initOfflineSync() {
    if (initialised || typeof window === 'undefined') {
        return;
    }

    initialised = true;

    window.addEventListener('online', () => flushScanQueue());

    if (navigator.serviceWorker) {
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data?.type === 'flush-scans') {
                flushScanQueue();
            }
        });
    }

    // Catch up on anything queued before the tab was closed.
    if (navigator.onLine) {
        flushScanQueue();
    }
}
