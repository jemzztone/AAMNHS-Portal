import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import QrScanner from '@/Components/QrScanner';
import { countQueuedScans, enqueueScan, getQueuedScans, removeQueuedScans } from '@/offline/db';
import { flushScanQueue } from '@/offline/sync';
import { Head, router } from '@inertiajs/react';
import { useMemo, useState, useEffect, useRef } from 'react';

const statusBadge = (status) => {
    const map = {
        present: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        late: 'bg-amber-50 text-amber-700 ring-amber-600/20',
        absent: 'bg-red-50 text-red-700 ring-red-600/20',
    };
    return (
        <span
            className={`badge ring-1 ring-inset ${
                map[status] || 'bg-slate-100 text-slate-700 ring-slate-600/20'
            }`}
        >
            <span
                className={`badge-dot ${
                    status === 'present'
                        ? 'bg-emerald-500'
                        : status === 'late'
                          ? 'bg-amber-500'
                          : status === 'absent'
                            ? 'bg-red-500'
                            : 'bg-slate-400'
                }`}
            />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

function Detail({ label, value }) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {label}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
                {value || '—'}
            </p>
        </div>
    );
}

function formatTime(time) {
    if (!time) return '—';
    const match = String(time).match(/^(\d{1,2}):(\d{2})/);
    if (!match) return String(time);

    let hour = parseInt(match[1], 10);
    const minute = match[2];
    const meridiem = /(AM|PM)/i.exec(String(time))?.[1]?.toUpperCase();

    if (meridiem) {
        return `${String(hour % 12 || 12).padStart(2, '0')}:${minute} ${meridiem}`;
    }

    const ampm = hour >= 12 ? 'PM' : 'AM';
    if (hour === 0) return `12:${minute} AM`;
    if (hour === 12) return `12:${minute} PM`;
    if (hour > 12) hour -= 12;
    return `${String(hour).padStart(2, '0')}:${minute} ${ampm}`;
}

function formatDate(date) {
    if (!date) return '—';
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatDateTime(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString('en-PH', {
        timeZone: 'Asia/Manila',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

export default function Scan({ schedule: initialSchedule, recentAttendance: initialRecent }) {
    const [qrToken, setQrToken] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [isOnline, setIsOnline] = useState(true);
    const [pendingSync, setPendingSync] = useState(0);
    const [syncing, setSyncing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [scanMode, setScanMode] = useState('auto');
    const [now, setNow] = useState(new Date());
    const [cameraRunning, setCameraRunning] = useState(false);
    const [showQueue, setShowQueue] = useState(false);
    const [queuedScans, setQueuedScans] = useState([]);
    const [queueLoading, setQueueLoading] = useState(false);
    const scannerRef = useRef(null);

    /**
     * Today's date in YYYY-MM-DD, matching the backend's
     * `Carbon::now()->toDateString()` under the Asia/Manila timezone.
     */
    const today = useMemo(() => {
        const d = new Date();
        const tz = d.toLocaleString('en-PH', { timeZone: 'Asia/Manila' });
        const local = new Date(tz);
        const y = local.getFullYear();
        const m = String(local.getMonth() + 1).padStart(2, '0');
        const day = String(local.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }, []);
    const [recent, setRecent] = useState(initialRecent || []);

    const [schedule, setSchedule] = useState(initialSchedule);
    const [timeIn, setTimeIn] = useState(initialSchedule?.time_in || '07:00');
    const [timeOut, setTimeOut] = useState(initialSchedule?.time_out || '16:00');
    const [savingSchedule, setSavingSchedule] = useState(false);
    const [scheduleMsg, setScheduleMsg] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Keep the offline queue indicator in sync with the actual IndexedDB queue.
    useEffect(() => {
        const refresh = () => countQueuedScans().then(setPendingSync).catch(() => {});
        const goOnline = () => setIsOnline(true);
        const goOffline = () => setIsOnline(false);

        setIsOnline(navigator.onLine);
        refresh();

        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);
        window.addEventListener('aamnhs:scans-synced', refresh);
        const timer = setInterval(refresh, 15000);

        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
            window.removeEventListener('aamnhs:scans-synced', refresh);
            clearInterval(timer);
        };
    }, []);

    useEffect(() => {
        const poll = setInterval(() => {
            fetch(route('guard.recent'), {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
                .then((res) => res.json())
                .then((data) => setRecent(data))
                .catch(() => {});
        }, 5000);
        return () => clearInterval(poll);
    }, []);

    const clockTime = now.toLocaleTimeString('en-PH', {
        timeZone: 'Asia/Manila',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });

    const clockDate = now.toLocaleDateString('en-PH', {
        timeZone: 'Asia/Manila',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const refreshRecent = () => {
        fetch(route('guard.recent'), {
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((res) => res.json())
            .then((data) => setRecent(data))
            .catch(() => {});
    };

    const playBeep = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(1800, ctx.currentTime);
            oscillator.frequency.setValueAtTime(2400, ctx.currentTime + 0.08);
            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.25);
        } catch {
            // Audio not supported — silent fallback
        }
    };

    const apiPost = async (url, body) => {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': decodeURIComponent(
                    document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || '',
                ),
            },
            body: JSON.stringify(body),
        });
        return { response, data: await response.json() };
    };

    const apiDelete = async (url) => {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': decodeURIComponent(
                    document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || '',
                ),
            },
        });
        return { response, data: await response.json() };
    };

    const saveSchedule = async () => {
        setSavingSchedule(true);
        setScheduleMsg(null);
        try {
            const { response, data } = await apiPost(route('guard.schedule.store'), {
                time_in: timeIn,
                time_out: timeOut,
            });
            if (response.ok) {
                setSchedule(data.schedule);
                setScheduleMsg('Schedule saved');
                setTimeout(() => setScheduleMsg(null), 3000);
            } else {
                setScheduleMsg('Failed to save');
            }
        } catch {
            setScheduleMsg('Network error');
        } finally {
            setSavingSchedule(false);
        }
    };

    /**
     * Save a scan locally when the server cannot be reached. It is replayed by
     * the background sync once the connection is back.
     */
    const openQueue = async () => {
        setShowQueue(true);
        setQueueLoading(true);

        try {
            const rows = await getQueuedScans();
            rows.sort((a, b) => new Date(a.queued_at) - new Date(b.queued_at));
            setQueuedScans(rows);
        } catch {
            setQueuedScans([]);
        } finally {
            setQueueLoading(false);
        }
    };

    const removeQueuedScan = async (clientId) => {
        if (!window.confirm('Remove this queued scan? It will never be recorded.')) {
            return;
        }

        await removeQueuedScans([clientId]);
        await openQueue();
        setPendingSync(await countQueuedScans().catch(() => 0));
    };

    const queueOfflineScan = async (payload) => {
        const clientId =
            typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

        await enqueueScan({
            client_id: clientId,
            ...payload,
            scanned_at: new Date().toISOString(),
        });

        setQrToken('');
        playBeep();
        setResult({
            success: true,
            offline: true,
            message: 'Saved offline. This scan will be sent automatically when the internet returns.',
        });
        setPendingSync((count) => count + 1);
    };

    const submitScan = async ({ qr_token, lrn }) => {
        setLoading(true);
        setError(null);
        setResult(null);

        const payload = { qr_token, lrn, mode: scanMode };

        if (!navigator.onLine) {
            await queueOfflineScan(payload);
            setLoading(false);
            return;
        }

        try {
            const { response, data } = await apiPost(route('guard.scan.store'), payload);

            if (response.ok) {
                setResult(data);

                if (data.cooldown) {
                    setQrToken('');
                    playBeep();
                    refreshRecent();
                } else if (data.success) {
                    setQrToken('');
                    playBeep();
                    refreshRecent();
                }
            } else {
                setError(data.message || 'Scan failed');
                if (data.student) setResult(data);
            }
        } catch {
            await queueOfflineScan(payload);
        } finally {
            setLoading(false);
        }
    };

    // PWA auto-update: listen for update-available event and show notification.
    useEffect(() => {
        const handleUpdateAvailable = () => {
            setResult({
                success: true,
                offline: false,
                message: 'New version available! Reload to see changes.',
                pwaUpdate: true,
            });
        };

        window.addEventListener('pwa-update-available', handleUpdateAvailable);

        return () => {
            window.removeEventListener('pwa-update-available', handleUpdateAvailable);
        };
    }, []);

    const handleCameraScan = (decodedText) => {
        submitScan({ qr_token: decodedText });
    };

    const handleManualScan = () => {
        if (!qrToken.trim()) {
            setError('Please enter a student LRN');
            return;
        }
        submitScan({ lrn: qrToken.trim() });
    };

    /**
     * Remove a scanned attendance record without re-scanning.
     * Only today's scan-sourced records can be removed; the backend
     * returns 403 for anything else.
     */
    const removeRecord = async (row) => {
        if (
            !window.confirm(
                `Remove ${row.student_name}'s attendance record? The student can be scanned again afterwards.`,
            )
        ) {
            return;
        }
        try {
            const { response, data } = await apiDelete(
                route('guard.scan.destroy', row.id),
            );
            if (response.ok && data.success) {
                refreshRecent();
            } else {
                // Keep the table in sync with the backend state even on denial.
                refreshRecent();
                setError(data.message || 'Failed to remove the record.');
            }
        } catch {
            setError('Network error. Please try again.');
        }
    };

    /**
     * Re-take attendance: remove the record, then immediately re-scan the
     * same student so the guard can record a fresh time-in in one action.
     *
     * The table is refreshed after the delete so the UI always matches the
     * backend, even when the follow-up re-scan is blocked (e.g. admission
     * slip required, student inactive, already timed out).
     */
    const retakeAttendance = async (row) => {
        if (
            !window.confirm(
                `Re-take ${row.student_name}'s attendance? Their current record will be removed so they can be scanned again.`,
            )
        ) {
            return;
        }
        try {
            const { response, data } = await apiDelete(
                route('guard.scan.destroy', row.id),
            );
            if (!response.ok || !data.success) {
                // Sync the table so a denied delete doesn't leave a stale row.
                refreshRecent();
                setError(data.message || 'Failed to re-take the record.');
                return;
            }

            // Delete succeeded — refresh immediately so the row disappears
            // even if the re-scan that follows gets blocked.
            refreshRecent();

            setQrToken(row.lrn);
            await submitScan({ lrn: row.lrn });
        } catch {
            setError('Network error. Please try again.');
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                        <p className="page-eyebrow">Security</p>
                        <h2 className="surface-title">Gate QR Scanner</h2>
                    </div>
                    <div className="shrink-0 text-right">
                        <p className="text-base font-bold tabular-nums text-slate-900 sm:text-2xl">{clockTime}</p>
                        <p className="max-w-[13rem] text-[11px] text-slate-500 sm:max-w-none sm:text-xs">{clockDate}</p>
                    </div>
                </div>
            }
        >
            <Head title="Guard Scanner" />

            {result?.pwaUpdate && (
                <div className="fixed top-4 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 sm:top-8">
                    <div className="flex items-center justify-center gap-3 rounded-xl bg-navy-900 px-5 py-3 shadow-lg ring-1 ring-navy-700 sm:w-auto sm:flex-row">
                        <svg className="h-5 w-5 shrink-0 text-navy-200" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="flex-1 text-sm font-semibold text-white">
                            New version available — reload to see changes
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="shrink-0 rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-navy-900 transition hover:bg-navy-50 active:bg-navy-100"
                        >
                            Reload now
                        </button>
                    </div>
                </div>
            )}

            <div className="mx-auto max-w-7xl px-4 pt-8 pb-40 sm:px-6 lg:px-8 lg:pb-8">
                {(!isOnline || pendingSync > 0) && (
                    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        <span className="font-semibold">
                            {isOnline ? 'Pending sync' : 'Offline mode'}
                        </span>
                        <span className="flex-1">
                            {pendingSync} scan{pendingSync === 1 ? '' : 's'} saved on this device
                            {isOnline
                                ? '.'
                                : ' — they will upload automatically once the connection returns.'}
                        </span>
                        <button
                            type="button"
                            disabled={!isOnline || syncing || pendingSync === 0}
                            onClick={async () => {
                                setSyncing(true);
                                await flushScanQueue();
                                setPendingSync(await countQueuedScans().catch(() => 0));
                                setSyncing(false);
                            }}
                            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                        >
                            {syncing ? 'Syncing…' : 'Sync now'}
                        </button>
                        <button
                            type="button"
                            onClick={openQueue}
                            className="rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800"
                        >
                            View scans
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    {/* Scanner + Schedule */}
                    <div className="space-y-6 lg:col-span-3">
                        {/* Schedule Panel */}
                        <div className="card card-pad">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                                    <svg
                                        className="h-[18px] w-[18px]"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.8"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </span>
                                <div>
                                    <h3 className="surface-title">Today's Schedule</h3>
                                    <p className="text-xs text-slate-500">
                                        Set the time-in and time-out for all student scans today
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
                                <div className="flex-1">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Time In
                                    </label>
                                    <input
                                        type="time"
                                        value={timeIn}
                                        onChange={(e) => setTimeIn(e.target.value)}
                                        className="input mt-1 w-full"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Time Out
                                    </label>
                                    <input
                                        type="time"
                                        value={timeOut}
                                        onChange={(e) => setTimeOut(e.target.value)}
                                        className="input mt-1 w-full"
                                    />
                                </div>
                                <button
                                    onClick={saveSchedule}
                                    disabled={savingSchedule}
                                    className="btn-primary shrink-0"
                                >
                                    {savingSchedule ? 'Saving...' : 'Save Schedule'}
                                </button>
                            </div>

                            {scheduleMsg && (
                                <p className="mt-2 text-sm font-medium text-emerald-600">
                                    {scheduleMsg}
                                </p>
                            )}

                            {schedule && (
                                <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>                                        Active — Time In: {formatTime(schedule.time_in)} / Time Out: {formatTime(schedule.time_out)}
                                </div>
                            )}

                            {!schedule && (
                                <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                    </svg>
                                    No schedule set — scans will use current time
                                </div>
                            )}
                        </div>

                        {/* Scanner */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-6 text-white sm:p-8">
                            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-navy-500/20 blur-3xl" />
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:22px_22px]" />

                                <div className="relative">
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                                            <svg
                                                className="h-5 w-5"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.8"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zM13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z"
                                                />
                                            </svg>
                                        </span>
                                        <div>
                                            <h3 className="text-lg font-bold">
                                                Scan Student QR Code
                                            </h3>
                                            <p className="text-sm text-navy-100/70">
                                                Point your camera at the student's QR
                                                code, or type the LRN below.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Scan Mode Selector */}
                                    <div className="mt-5">
                                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-200/60">
                                            Scan Mode
                                        </label>
                                        <select
                                            value={scanMode}
                                            onChange={(e) => setScanMode(e.target.value)}
                                            className="w-full rounded-lg border-0 bg-white/10 px-3 py-2.5 text-sm font-bold text-white ring-1 ring-inset ring-white/20 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60"
                                        >
                                            <option value="auto" className="bg-navy-900 text-white">Auto-Scan</option>
                                            <option value="time_in" className="bg-navy-900 text-white">Time In — Force time-in only</option>
                                            <option value="time_out" className="bg-navy-900 text-white">Time Out — Force time-out only</option>
                                        </select>
                                    </div>

                                {/* Camera Scanner */}
                                <div className="mt-6">
                                    <QrScanner
                                        ref={scannerRef}
                                        onScan={handleCameraScan}
                                        onError={setError}
                                        onRunningChange={setCameraRunning}
                                    />
                                </div>

                                {/* Divider */}
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                <span className="bg-transparent px-3 text-xs text-navy-200/50">
                                    or type LRN manually
                                </span>
                                    </div>
                                </div>

                                {/* Manual Input */}
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={qrToken}
                                            onChange={(e) =>
                                                setQrToken(e.target.value)
                                            }
                                            onKeyDown={(e) =>
                                                e.key === 'Enter' &&
                                                handleManualScan()
                                            }
                                            placeholder="Enter student LRN..."
                                            className="w-full rounded-xl border-0 bg-white/10 px-4 py-3 text-base text-white ring-1 ring-inset ring-white/20 placeholder:text-navy-100/40 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60"
                                        />
                                    </div>
                                    <button
                                        onClick={handleManualScan}
                                        disabled={loading}
                                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-navy-950 transition duration-150 ease-in-out hover:bg-navy-100 active:bg-navy-200 disabled:pointer-events-none disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <svg
                                                    className="h-4 w-4 animate-spin"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    />
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                                    />
                                                </svg>
                                                Processing...
                                            </>
                                        ) : (
                                            'Submit'
                                        )}
                                    </button>
                                </div>

                                {/* Error */}
                                {error && !result?.success && (
                                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3">
                                        <svg
                                            className="mt-0.5 h-5 w-5 shrink-0 text-red-300"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <p className="text-sm font-medium text-red-100">
                                            {error}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="card card-pad">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                                    <svg
                                        className="h-[18px] w-[18px]"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.8"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                                        />
                                    </svg>
                                </span>
                                <h3 className="surface-title">Instructions</h3>
                            </div>
                            <ul className="mt-4 space-y-3">
                                {[
                                    'Set the time-in and time-out schedule above before scanning',
                                    'Auto mode: first scan = time-in, second scan = time-out',
                                    'Use Time In / Time Out buttons to force a specific action',
                                    'You can scan the QR code or type the student LRN manually',
                                    'If a student was absent yesterday, they need an approved admission slip for entry',
                                ].map((step, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start gap-3 text-sm text-slate-600"
                                    >
                                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-100 text-[10px] font-bold text-navy-800">
                                            {index + 1}
                                        </span>
                                        {step}
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>

                    {/* Result panel */}
                    <div className="lg:col-span-2">
                        {result && (
                            <div className="card card-pad">
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset ${
                                            result.success
                                                ? 'bg-emerald-50 text-emerald-600 ring-emerald-600/15'
                                                : 'bg-amber-50 text-amber-600 ring-amber-600/15'
                                        }`}
                                    >
                                        {result.success ? (
                                            <svg
                                                className="h-5 w-5"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                className="h-5 w-5"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </span>
                                    <h3
                                        className={`text-lg font-bold ${
                                            result.success
                                                ? 'text-emerald-800'
                                                : 'text-amber-800'
                                        }`}
                                    >
                                        {result.message}
                                    </h3>
                                </div>

                                {result.student && (
                                    <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-slate-100 pt-5">
                                        <div className="col-span-2">
                                            <div className="flex items-center gap-4">
                                                {result.student.photo_url ? (
                                                    <img
                                                        src={result.student.photo_url}
                                                        alt={result.student.full_name}
                                                        className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-1 ring-inset ring-slate-200"
                                                    />
                                                ) : (
                                                    <span className="inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-navy-100 text-xl font-bold text-navy-800">
                                                        {result.student.full_name
                                                            .split(' ')
                                                            .map((p) => p[0])
                                                            .slice(0, 2)
                                                            .join('')
                                                            .toUpperCase()}
                                                    </span>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                        Student
                                                    </p>
                                                    <p className="mt-1 text-base font-bold text-slate-900">
                                                        {result.student.full_name}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                        {result.student.section
                                                            ?.grade_level?.name
                                                            ? `${result.student.section.grade_level.name} — `
                                                            : ''}
                                                        {result.student.section?.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <Detail
                                            label="LRN"
                                            value={result.student.lrn}
                                        />
                                        <Detail
                                            label="Section"
                                            value={
                                                result.student.section?.name
                                            }
                                        />
                                        {result.action && (
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                    Action
                                                </p>
                                                <div className="mt-1">
                                                    <span
                                                        className={`badge ring-1 ring-inset ${
                                                            result.action === 'time_in'
                                                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                                                                : 'bg-blue-50 text-blue-700 ring-blue-600/20'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`badge-dot ${
                                                                result.action === 'time_in'
                                                                    ? 'bg-emerald-500'
                                                                    : 'bg-blue-500'
                                                            }`}
                                                        />
                                                        {result.action === 'time_in' ? 'Time In' : 'Time Out'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        {result.record && (
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                    Status
                                                </p>
                                                <div className="mt-1">
                                                    {statusBadge(
                                                        result.record.status,
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {result.record?.time_in && (
                                            <Detail
                                                label="Time In"
                                                value={formatTime(result.record.time_in)}
                                            />
                                        )}
                                        {result.record?.time_out && (
                                            <Detail
                                                label="Time Out"
                                                value={formatTime(result.record.time_out)}
                                            />
                                        )}
                                        {result.record?.date && (
                                            <Detail
                                                label="Date"
                                                value={formatDate(result.record.date)}
                                            />
                                        )}
                                    </div>
                                )}

                                {result.requires_admission_slip && (
                                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                        <svg
                                            className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.8"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                                            />
                                        </svg>
                                        <p className="text-sm font-medium text-red-800">
                                            This student requires an approved
                                            admission slip before entry is
                                            allowed.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {!result && (
                            <div className="card flex h-full min-h-[240px] flex-col items-center justify-center border-dashed p-8 text-center">
                                <svg
                                    className="h-12 w-12 text-slate-300"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zM13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z"
                                    />
                                </svg>
                                <p className="mt-4 text-sm font-semibold text-slate-600">
                                    Scan results appear here
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    Student details and time-in/time-out status
                                    will show instantly after a successful scan.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Attendance Table */}
                <div className="mt-6">
                    <div className="card card-pad">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                                    <svg className="h-[18px] w-[18px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </span>
                                <div>
                                    <h3 className="surface-title">Today's Attendance</h3>
                                    <p className="text-xs text-slate-500">
                                        Auto-refreshes every 5 seconds
                                    </p>
                                </div>
                            </div>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Live
                            </span>
                        </div>

                        {recent.length > 0 ? (
                            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Student</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">LRN</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Section</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Time In</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Time Out</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {recent.map((row) => (
                                            <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-900">
                                                    {row.student_name}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                                                    {row.lrn}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                                                    {row.section}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3">
                                                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                        {formatTime(row.time_in)}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3">
                                                    {row.time_out ? (
                                                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                            {formatTime(row.time_out)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-slate-400">—</span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3">
                                                    {statusBadge(row.status)}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-right">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        {row.source === 'scan' && row.date === today ? (
                                                            <>
                                                                <button
                                                                    onClick={() =>
                                                                        retakeAttendance(row)
                                                                    }
                                                                    title="Re-take attendance (delete then scan again)"
                                                                    className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20 transition hover:bg-amber-100"
                                                                >
                                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                                                    </svg>
                                                                    Re-take
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        removeRecord(row)
                                                                    }
                                                                    title="Delete attendance record"
                                                                    className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/20 transition hover:bg-red-100"
                                                                >
                                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                                    </svg>
                                                                    Delete
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-slate-400">
                                                                {row.source === 'scan'
                                                                    ? 'Not today'
                                                                    : 'Manual entry — not editable here'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-10 text-center">
                                <svg className="h-10 w-10 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                </svg>
                                <p className="mt-3 text-sm font-semibold text-slate-500">No attendance records today</p>
                                <p className="mt-1 text-xs text-slate-400">Records will appear here as students scan in.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* GCash-style center QR scan button for mobile. Hidden while the
                camera is running so it never covers the Stop Camera control. */}
            {!cameraRunning && (
                <div className="fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-30 px-4 lg:hidden">
                    <button
                        type="button"
                        aria-label="Open camera to scan a student QR code"
                        onClick={() => {
                            // The scanner's Start button lives outside #qr-reader,
                            // so drive it through the component ref instead.
                            setScanMode('auto');
                            scannerRef.current?.start();
                            document
                                .getElementById('qr-reader')
                                ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        className="mx-auto flex items-center gap-2 rounded-full bg-navy-800 px-6 py-3 shadow-lg ring-2 ring-navy-700 transition hover:bg-navy-700 active:bg-navy-900"
                    >
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zM13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" />
                        </svg>
                        <span className="text-sm font-bold text-white">Scan QR</span>
                    </button>
                </div>
            )}

            {/* Offline queue is available without navigating away, so the guard
                can still monitor saved scans while the connection is down. */}
            {showQueue && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setShowQueue(false)}
                    />
                    <div className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Saved offline scans
                                </h3>
                                <p className="mt-0.5 text-sm text-slate-500">
                                    {queuedScans.length} scan
                                    {queuedScans.length === 1 ? '' : 's'} stored
                                    on this device. They upload automatically
                                    when the connection returns.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowQueue(false)}
                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                aria-label="Close saved scans"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.8"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
                            {queueLoading ? (
                                <p className="py-8 text-center text-sm text-slate-400">
                                    Loading saved scans…
                                </p>
                            ) : queuedScans.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
                                    <p className="text-sm font-semibold text-slate-600">
                                        No saved scans
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Everything recorded on this device has
                                        been uploaded.
                                    </p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-slate-100">
                                    {queuedScans.map((scan) => (
                                        <li
                                            key={scan.client_id}
                                            className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                                        >
                                            <div className="min-w-0">
                                                <p className="font-mono text-sm font-semibold text-slate-900">
                                                    {scan.lrn
                                                        ? `LRN ${scan.lrn}`
                                                        : `QR ${String(scan.qr_token || '').slice(0, 12)}…`}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Mode{' '}
                                                    {String(
                                                        scan.mode || 'auto',
                                                    ).replace('_', ' ')}{' '}
                                                    · Scanned{' '}
                                                    {formatDateTime(
                                                        scan.scanned_at,
                                                    )}{' '}
                                                    · Saved{' '}
                                                    {formatDateTime(
                                                        scan.queued_at,
                                                    )}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeQueuedScan(
                                                        scan.client_id,
                                                    )
                                                }
                                                className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700"
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3 sm:px-6">
                            <span className="text-xs text-slate-500">
                                {isOnline
                                    ? 'Online — use Sync now to upload these scans.'
                                    : 'Offline — scans stay safe on this device.'}
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowQueue(false)}
                                className="btn-outline"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
