import { useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';

export default function PhotoUpload({ value, onChange, currentUrl, error }) {
    const inputRef = useRef(null);
    const [compressing, setCompressing] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const preview = previewUrl;

    const handleFile = async (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) return;

        setCompressing(true);
        try {
            // Compress on the client so uploaded photos stay light
            // (max ~300 KB, max 800px) — no heavy files hit the server.
            const compressed = await imageCompression(file, {
                maxSizeMB: 0.3,
                maxWidthOrHeight: 800,
                useWebWorker: true,
                fileType: 'image/jpeg',
                initialQuality: 0.8,
            });
            onChange(compressed);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(compressed));
        } catch (err) {
            console.error('Photo compression failed:', err);
            onChange(file);
        } finally {
            setCompressing(false);
        }
    };

    return (
        <div>
            <span className="input-label">Student Photo</span>
            <div className="mt-1.5 flex items-center gap-4">
                {preview || currentUrl ? (
                    <img
                        src={preview || currentUrl}
                        alt="Student preview"
                        className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-1 ring-inset ring-slate-200"
                    />
                ) : (
                    <span className="inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400 ring-1 ring-inset ring-slate-200">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                    </span>
                )}

                <div className="min-w-0 flex-1">
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFile(e.target.files?.[0])}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={compressing}
                        className="btn-outline"
                    >
                        {compressing ? (
                            <>
                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Compressing...
                            </>
                        ) : (
                            'Choose Photo'
                        )}
                    </button>
                    <p className="mt-1.5 text-xs text-slate-400">
                        {value
                            ? `${(value.size / 1024).toFixed(1)} KB after compression`
                            : 'Photos are compressed automatically (max 300 KB, 800px).'}
                    </p>
                </div>
            </div>
            {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
        </div>
    );
}