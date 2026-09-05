import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QrScanner({ onScan, onError }) {
    const [isRunning, setIsRunning] = useState(false);
    const [hasCamera, setHasCamera] = useState(true);
    const scannerRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => {});
                scannerRef.current.clear();
            }
        };
    }, []);

    const startScanner = async () => {
        if (scannerRef.current) return;

        try {
            const scanner = new Html5Qrcode('qr-reader');
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    onScan(decodedText);
                },
                () => {},
            );

            setIsRunning(true);
        } catch (err) {
            console.error('Camera error:', err);
            setHasCamera(false);
            if (onError) {
                onError('Camera not available. Please type the token manually.');
            }
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
                scannerRef.current = null;
                setIsRunning(false);
            } catch (err) {
                console.error('Stop error:', err);
            }
        }
    };

    return (
        <div className="space-y-4">
            <div id="qr-reader" ref={containerRef} className="overflow-hidden rounded-xl" />

            <div className="flex gap-3">
                {!isRunning ? (
                    <button
                        onClick={startScanner}
                        className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/25 transition hover:bg-white/25"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zM13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" />
                        </svg>
                        Start Camera
                    </button>
                ) : (
                    <button
                        onClick={stopScanner}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-500/20 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-red-400/30 transition hover:bg-red-500/30"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
                        </svg>
                        Stop Camera
                    </button>
                )}
            </div>

            {!hasCamera && (
                <p className="text-xs text-navy-200/60">
                    No camera detected. Use the text input below to enter the QR token manually.
                </p>
            )}
        </div>
    );
}
