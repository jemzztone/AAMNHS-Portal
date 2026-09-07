import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link } from '@inertiajs/react';

const features = [
    {
        title: 'QR Gate Scanning',
        description:
            'Security guards scan student QR codes at the gate for fast, accurate time-in recording with real-time status classification.',
        icon: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
            />
        ),
    },
    {
        title: 'Admission Slip Management',
        description:
            'Students who were absent the previous school day submit admission slips and teachers approve or reject them before re-entry.',
        icon: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
        ),
    },
    {
        title: 'Guardian Notifications',
        description:
            'Guardians are notified by email in real time on every scan, keeping parents informed of their child\'s attendance.',
        icon: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
        ),
    },
    {
        title: 'Analytics & Reports',
        description:
            'Monitor absenteeism and tardiness, rank sections and students, and export printable reports for interventions.',
        icon: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
            />
        ),
    },
];

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="flex min-h-screen flex-col">
                {/* Top accent bar */}
                <div className="h-1 bg-gradient-to-r from-navy-950 via-navy-600 to-navy-300" />

                {/* ===== Top nav ===== */}
                <header className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <ApplicationLogo className="h-9 w-9 text-navy-800" />
                            <div className="hidden leading-tight sm:block">
                                <p className="text-sm font-bold text-navy-950">
                                    Aurelians Portal
                                </p>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy-500">
                                    Attendance Monitoring System
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="btn-primary"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="btn-outline hidden sm:inline-flex"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="btn-primary"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* ===== Hero ===== */}
                <section className="relative overflow-hidden bg-navy-950 text-white">
                    {/* Background image with blur */}
                    <div className="absolute inset-0">
                        <img
                            src="/images/background.jpg"
                            alt=""
                            className="h-full w-full object-cover opacity-30 blur-sm"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/80 via-navy-900/70 to-navy-800/80" />
                    </div>
                    <div className="pointer-events-none absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-navy-500/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-navy-300/10 blur-3xl" />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:26px_26px]" />

                    <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
                        <div className="mx-auto max-w-3xl text-center">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-navy-100 backdrop-blur">
                                <span className="badge-dot bg-navy-300" />
                                Republic of the Philippines · DepEd Oriental Mindoro Division
                            </span>
                            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                                Student attendance,
                                <span className="block text-navy-200">
                                    reimagined.
                                </span>
                            </h1>
                            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-navy-100/80 sm:text-lg">
                                A digital platform that monitors student
                                attendance, enforces the admission slip gate
                                policy, notifies guardians in real time, and
                                provides analytics for school personnel.
                            </p>
                            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="btn-primary !bg-white !px-7 !py-3 !text-base !text-navy-900 hover:!bg-navy-100">
                                        Go to Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="btn-primary !px-7 !py-3 !text-base"
                                        >
                                            Log in to get started
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/10 px-7 py-3 text-base font-semibold text-white backdrop-blur transition duration-150 ease-in-out hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                            <div className="mt-12 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
                                {[
                                    ['2,000+', 'Students tracked daily'],
                                    ['< 1s', 'Gate scan to record'],
                                    ['100%', 'Real-time guardian alerts'],
                                ].map(([stat, label]) => (
                                    <div
                                        key={label}
                                        className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur"
                                    >
                                        <p className="text-2xl font-bold tracking-tight text-white">
                                            {stat}
                                        </p>
                                        <p className="mt-0.5 text-xs text-navy-100/70">
                                            {label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===== Features ===== */}
                <section className="bg-slate-50 py-16 sm:py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="page-eyebrow">Why AAMNHS Attendance</p>
                            <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy-950">
                                Everything the gate needs,
                                <span className="text-navy-600">
                                    {' '}
                                    in one system.
                                </span>
                            </h2>
                        </div>
                        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="card card-pad group transition duration-200 hover:-translate-y-0.5 hover:shadow-lift"
                                >
                                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy-700 ring-1 ring-inset ring-navy-700/10 transition duration-200 group-hover:bg-navy-800 group-hover:text-white">
                                        <svg
                                            className="h-6 w-6"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.8"
                                            stroke="currentColor"
                                        >
                                            {feature.icon}
                                        </svg>
                                    </span>
                                    <h3 className="mt-5 text-base font-bold text-slate-900">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ===== CTA ===== */}
                <section className="bg-white py-16 sm:py-20">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-700 p-8 text-center text-white sm:p-12">
                            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-navy-400/20 blur-3xl" />
                            <h2 className="relative text-2xl font-bold tracking-tight sm:text-3xl">
                                Ready to simplify attendance?
                            </h2>
                            <p className="relative mx-auto mt-3 max-w-xl text-sm text-navy-100/80">
                                Aurelio Arago Memorial National High School is
                                one step away from a fully digital attendance
                                experience.
                            </p>
                            <div className="relative mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="btn-primary !bg-white !text-navy-900 hover:!bg-navy-100"
                                    >
                                        Open Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('register')}
                                            className="btn-primary !bg-white !text-navy-900 hover:!bg-navy-100"
                                        >
                                            Create an account
                                        </Link>
                                        <Link
                                            href={route('login')}
                                            className="inline-flex items-center justify-center rounded-lg border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition duration-150 ease-in-out hover:bg-white/20"
                                        >
                                            Log in
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===== Footer ===== */}
                <footer className="border-t border-slate-200 bg-white py-8">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2">
                            <ApplicationLogo className="h-6 w-6 text-navy-700" />
                            <p className="font-semibold text-slate-700">
                                Aurelio Arago Memorial National High School
                            </p>
                        </div>
                        <p>
                            © {new Date().getFullYear()} · Republic of the
                            Philippines · Department of Education
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
