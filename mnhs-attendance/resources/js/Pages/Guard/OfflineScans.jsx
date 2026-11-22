import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { getQueuedScans, removeQueuedScans } from '@/offline/db';
import { flushScanQueue } from '@/offline/sync';
import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

function formatTime(value) {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleString('en-PH', {
        timeZone: 'Asia/Manila',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });
}

export default function OfflineScans() {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [message, setMessage] = useState(null);

    const refresh = useCallback(async () => {
        try {
            const rows = await getQueuedScans();
            rows.sort((a, b) => new Date(a.queued_at) - new Date(b.queued_at));
            setScans(rows);
        } catch {
            setScans([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setIsOnline(navigator.onLine);
        refresh();

        const goOnline = () => setIsOnline(true);
        const goOffline = () => setIsOnline(false);
        const onSynced = () => refresh();

        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);
        window.addEventListener('aamnhs:scans-synced', onSynced);

        const timer = setInterval(refresh, 5000);

        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
            window.removeEventListener('aamnhs:scans-synced', onSynced);
            clearInterval(timer);
        };
    }, [refresh]);

    const syncNow = async () => {
        setSyncing(true);
        setMessage(null);

        const result = await flushScanQueue();

        setMessage(
            result.synced > 0
                ? `${result.synced} scan(s) uploaded.${result.remaining ? ` ${result.remaining} still pending.` : ''}`
                : 'Nothing was uploaded. The server may still be unreachable.',
        );

        await refresh();
        setSyncing(false);
    };

    const removeOne = async (clientId) => {
        if (!window.confirm('Remove this queued scan? It will never be recorded.')) {
            return;
        }

        await removeQueuedScans([clientId]);
        await refresh();
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="page-eyebrow">Security</p>
                        <h2 className="surface-title">Offline Scans</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                isOnline
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-amber-50 text-amber-700'
                            }`}
                        >
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                        <button
                            type="button"
                            onClick={syncNow}
                            disabled={!isOnline || syncing || scans.length === 0}
                            className="rounded-lg bg-navy-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {syncing ? 'Syncing…' : 'Sync now'}
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Offline Scans" />

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="card card-pad">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="surface-title">
                                {scans.length} scan{scans.length === 1 ? '' : 's'} queued on this device
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Saved in IndexedDB while the connection was down. They are sent
                                automatically once the device is back online.
                            </p>
                        </div>
                    </div>

                    {message && (
                        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                            {message}
                        </p>
                    )}

                    <div className="mt-5 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                                    <th className="py-2 pr-3 font-semibold">Queued at</th>
                                    <th className="py-2 pr-3 font-semibold">Student reference</th>
                                    <th className="py-2 pr-3 font-semibold">Mode</th>
                                    <th className="py-2 pr-3 font-semibold">Scanned at</th>
                                    <th className="py-2 font-semibold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr>
                                        <td colSpan={5} className="py-6 text-center text-slate-400">
                                            Loading…
                                        </td>
                                    </tr>
                                )}

                                {!loading && scans.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-10 text-center">
                                            <p className="text-sm font-semibold text-slate-600">
                                                No pending scans
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                Everything recorded on this device has been uploaded.
                                            </p>
                                        </td>
                                    </tr>
                                )}

                                {scans.map((scan) => (
                                    <tr key={scan.client_id} className="border-b border-slate-100 last:border-0">
                                        <td className="py-2 pr-3 text-slate-700">{formatTime(scan.queued_at)}</td>
                                        <td className="py-2 pr-3 font-mono text-xs text-slate-600">
                                            {scan.lrn ? `LRN ${scan.lrn}` : `QR ${String(scan.qr_token || '').slice(0, 8)}…`}
                                        </td>
                                        <td className="py-2 pr-3 capitalize text-slate-600">
                                            {(scan.mode || 'auto').replace('_', ' ')}
                                        </td>
                                        <td className="py-2 pr-3 text-slate-600">{formatTime(scan.scanned_at)}</td>
                                        <td className="py-2 text-right">
                                            <button
                                                type="button"
                                                onClick={() => removeOne(scan.client_id)}
                                                className="text-xs font-semibold text-red-600 hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
