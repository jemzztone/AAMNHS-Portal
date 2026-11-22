import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

/**
 * PWA Update Banner — shows a "New version available" notification when the
 * service worker detects an update. Clicking it reloads the page so the new
 * shell and assets take effect immediately.
 */
export default function PwaUpdateBanner() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const handleUpdateAvailable = () => {
            setShow(true);
        };

        const handleReloaded = () => {
            setShow(false);
        };

        window.addEventListener('pwa-update-available', handleUpdateAvailable);
        window.addEventListener('pwa-reloaded', handleReloaded);

        return () => {
            window.removeEventListener('pwa-update-available', handleUpdateAvailable);
            window.removeEventListener('pwa-reloaded', handleReloaded);
        };
    }, []);

    if (!show) {
        return null;
    }

    const handleReload = () => {
        window.dispatchEvent(new CustomEvent('pwa-reloading'));
        window.location.reload();
    };

    return (
        <div className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 sm:top-8">
            <div className="flex items-center gap-3 rounded-xl border border-navy-200 bg-navy-900 px-4 py-3 shadow-lg">
                <svg className="h-5 w-5 shrink-0 text-navy-200" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className=" flex-1 text-sm font-semibold text-white">
                    New version available — reload to see changes
                </p>
                <button
                    onClick={handleReload}
                    className="shrink-0 rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-navy-900 transition hover:bg-navy-50 active:bg-navy-100"
                >
                    Reload now
                </button>
            </div>
        </div>
    );
}
