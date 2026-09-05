import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
            {/* Background image with overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/background.jpg"
                    alt=""
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-navy-950/70" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-sm">
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
