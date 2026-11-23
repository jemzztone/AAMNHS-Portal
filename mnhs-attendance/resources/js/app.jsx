import '../css/app.css';
import './bootstrap';
import { initOfflineSync } from './offline/sync';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot, hydrateRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        if (import.meta.env.SSR) {
            hydrateRoot(el, <App {...props} />);
            return;
        }

        createRoot(el).render(<App {...props} />);

        // Progressive Web App: cache the shell, replay offline scans and keep
        // the push subscription alive across visits.
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    if ('sync' in registration) {
                        registration.sync.register('sync-scans').catch(() => {});
                    }

                    // Detect when a new service worker is ready and notify the app.
                    let newWorker = null;
                    registration.addEventListener('updatefound', () => {
                        newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker?.state === 'installed' && navigator.serviceWorker.controller) {
                                // New content is available — notify the app via custom event.
                                window.dispatchEvent(
                                    new CustomEvent('pwa-update-available', {
                                        detail: { version: newWorker.scriptURL },
                                    }),
                                );
                            }
                        });
                    });

                    // Check for updates periodically.
                    const checkForUpdate = () => {
                        registration.update().catch(() => {});
                    };
                    setInterval(checkForUpdate, 60 * 60 * 1000); // Every hour
                    checkForUpdate(); // Check on load
                })
                .catch(() => {});
        }

        // PWA: pages that care (e.g. the guard scanner) listen for
        // 'pwa-update-available' and offer an explicit Reload button. Never
        // reload on our own — that could interrupt a scan in progress.

        // Offline scan replay is only meaningful for guards; calling the
        // guard-only sync endpoint from an admin page just returns 403s.
        if (props.initialPage?.props?.auth?.user?.role === 'security_guard') {
            initOfflineSync();
        }
    },
    progress: {
        color: '#4B5563',
    },
});
