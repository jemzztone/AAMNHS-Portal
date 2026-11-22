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
                })
                .catch(() => {});
        }

        initOfflineSync();
    },
    progress: {
        color: '#4B5563',
    },
});
