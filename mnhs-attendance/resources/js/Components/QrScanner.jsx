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

            <div className="flex justify-center">
                {!isRunning ? (
                    <button
                        onClick={startScanner}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-navy-900 shadow-lg transition hover:bg-navy-50 active:bg-navy-100"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                        </svg>
                        Start Camera
                    </button>
                ) : (
                    <button
                        onClick={stopScanner}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-red-500/20 px-6 py-3 text-sm font-bold text-white ring-1 ring-inset ring-red-400/30 transition hover:bg-red-500/30"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
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
