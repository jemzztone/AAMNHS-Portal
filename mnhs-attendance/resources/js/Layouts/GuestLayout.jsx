import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children, wide = false }) {
    return (
        <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
            {/* Background image with overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/background.jpg"
                    alt=""
                    className="h-full w-full object-cover blur-sm"
                />
                <div className="absolute inset-0 bg-navy-950/70" />
            </div>

            {/* Content */}
            <div className={`relative z-10 w-full ${wide ? 'max-w-lg' : 'max-w-sm'}`}>
                {/* Back to Home */}
                <div className="mb-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-200/80 transition hover:text-white"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                            />
                        </svg>
                        Back to Home
                    </Link>
                </div>

                <div className="mb-8 flex flex-col items-center gap-3">
                    <Link href="/">
                        <ApplicationLogo className="h-16 w-16 text-white drop-shadow-lg" />
                    </Link>
                    <div className="text-center">
                        <p className="text-xs font-bold uppercase tracking-widest text-navy-200/80">
                            Attendance Monitoring System
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">
                            Aurelio Arago Memorial National High School
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/95 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
                    {children}
                </div>

                <p className="mt-6 text-center text-[11px] leading-relaxed text-navy-200/60">
                    © {new Date().getFullYear()} Aurelio Arago Memorial
                    National High School
                </p>
            </div>
        </div>
    );
}
