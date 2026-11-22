/**
 * Minimal IndexedDB wrapper for the offline scan queue.
 *
 * Guards record attendance at the gate where the connection is often flaky.
 * Every scan that cannot reach the server is stored here first and replayed by
 * `sync.js` once the browser reports that it is back online.
 */

const DB_NAME = 'aamnhs-offline';
const DB_VERSION = 1;
const STORE = 'scan-queue';

function openDatabase() {
    return new Promise((resolve, reject) => {
        if (typeof indexedDB === 'undefined') {
            reject(new Error('IndexedDB is not available in this browser.'));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;

            if (!db.objectStoreNames.contains(STORE)) {
                const store = db.createObjectStore(STORE, { keyPath: 'client_id' });
                store.createIndex('queued_at', 'queued_at');
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function withStore(mode, callback) {
    return openDatabase().then(
        (db) =>
            new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE, mode);
                const store = transaction.objectStore(STORE);
                let result;

                try {
                    result = callback(store);
                } catch (error) {
                    reject(error);
                    db.close();
                    return;
                }

                transaction.oncomplete = () => {
                    db.close();
                    resolve(result);
                };
                transaction.onerror = () => {
                    db.close();
                    reject(transaction.error);
                };
            }),
    );
}

export function enqueueScan(scan) {
    return withStore('readwrite', (store) => {
        store.put({
            ...scan,
            queued_at: new Date().toISOString(),
        });
    });
}

export function getQueuedScans() {
    return withStore('readonly', (store) => {
        const request = store.getAll();
        const rows = [];

        request.onsuccess = () => rows.push(...request.result);

        return rows;
    });
}

export function removeQueuedScans(clientIds) {
    return withStore('readwrite', (store) => {
        clientIds.forEach((clientId) => store.delete(clientId));
    });
}

export function countQueuedScans() {
    return getQueuedScans().then((scans) => scans.length);
}
