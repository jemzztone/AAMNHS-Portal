import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

function FlashBanner() {
    const { flash } = usePage().props;
    const message = flash?.success || flash?.error;

    if (!message) {
        return null;
    }

    const isError = Boolean(flash.error);

    return (
        <div
            className={`mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8`}
        >
            <div
                role="status"
                className={`rounded-xl border p-4 ${
                    isError
                        ? 'border-red-200 bg-red-50'
                        : 'border-emerald-200 bg-emerald-50'
                }`}
            >
                <div className="flex items-start gap-3">
                    <svg
                        className={`mt-0.5 h-5 w-5 shrink-0 ${
                            isError ? 'text-red-500' : 'text-emerald-500'
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        {isError ? (
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                                clipRule="evenodd"
                            />
                        ) : (
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                clipRule="evenodd"
                            />
                        )}
                    </svg>
                    <p
                        className={`text-sm font-medium ${
                            isError ? 'text-red-800' : 'text-emerald-800'
                        }`}
                    >
                        {message}
                    </p>
                </div>
</div>
        </div>
    );
}

const NAV_GROUPS = [
    {
        roles: ['super_admin', 'admin', 'teacher', 'student', 'security_guard'],
        items: [
            {
                name: 'Dashboard',
                href: 'dashboard',
                icon: (
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75"
                    />
                ),
            },
        ],
    },
    {
        label: 'Academics',
        roles: ['super_admin', 'admin', 'teacher'],
        items: [
            {
                name: 'Students',
                href: 'students.index',
                icon: (
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                    />
                ),
            },
            {
                name: 'Sections',
                href: 'sections.index',
                icon: (
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                    />
                ),
            },
            {
                name: 'Attendance',
                href: 'attendance.index',
                icon: (
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                ),
            },
            {
                name: 'Analytics',
                href: 'analytics.index',
                icon: (
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                    />
                ),
            },
            {
                name: 'AI Assistant',
                href: 'ai.index',
                icon: (
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                    />
                ),
            },
        ],
    },
    {
        label: 'Operations',
        roles: ['super_admin', 'admin', 'teacher', 'student'],
        items: [
            {
                name: 'Admission Slips',
                href: 'admission-slips.index',
                icon: (
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                ),
            },
        ],
    },
    {
        label: 'Admin',
        roles: ['super_admin', 'admin'],
            items: [
                {
                    name: 'Users',
                    href: 'users.index',
                    icon: (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                        />
                    ),
                },
                {
                    name: 'Teachers',
                    href: 'teachers.index',
                    icon: (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                        />
                    ),
                },
                {
                    name: 'Academic Years',
                    href: 'academic-years.index',
                    icon: (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                        />
                    ),
                },
                {
                    name: 'Grade Levels',
                    href: 'grade-levels.index',
                    icon: (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                        />
                    ),
                },
                {
                    name: 'Guardian Notifications',
                    href: 'guardian-notifications.index',
                    icon: (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                        />
                    ),
                },
                {
                    name: 'Audit Logs',
                    href: 'audit-logs.index',
                    icon: (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                        />
                    ),
                },
        ],
    },
    {
        label: 'Security',
        roles: ['security_guard'],
        items: [
            {
                name: 'QR Scan',
                href: 'guard.scan',
                icon: (
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
                    />
                ),
            },
        ],
    },
];

function SidebarContent({ navItems, role, user, onNavigate }) {
    const grouped = NAV_GROUPS.filter((group) => group.roles.includes(role));

    return (
        <div className="relative flex h-full flex-col overflow-hidden bg-navy-950">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0 h-full w-full bg-gradient-to-br from-navy-900/20 to-navy-800/10" />
            <img
                src="/images/background.jpg"
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-5 blur-md"
            />

            {/* Brand */}
            <div className="flex h-16 items-center gap-3 px-4">
                <Link href="/" className="inline-flex shrink-0 items-center gap-3">
                    <ApplicationLogo className="h-9 w-9 text-white" />
                    <span className="min-w-0 leading-tight">
                        <span className="block truncate text-sm font-bold text-white">
                            AAMNHS
                        </span>
                        <span className="block truncate text-[9px] font-medium uppercase tracking-[0.14em] text-navy-200/70">
                            Attendance
                        </span>
                    </span>
                </Link>
            </div>

            {/* Nav groups */}
            <nav className="flex-1 overflow-y-auto px-2 pb-4 pt-2">
                {grouped.map((group) => (
                    <div key={group.label || 'main'} className="mb-5 last:mb-2">
                        {group.label && (
                            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-navy-400/60">
                                {group.label}
                            </p>
                        )}
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const active = route().current(item.href.split('.')[0]);
                                return (
                                    <Link
                                        key={item.href}
                                        href={route(item.href)}
                                        onClick={onNavigate}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition duration-150 truncate ${
                                            active
                                                ? 'bg-white/10 text-white'
                                                : 'text-navy-200/70 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        <svg
                                            className={`h-5 w-5 shrink-0 ${
                                                active ? 'text-white' : 'text-navy-300/60'
                                            }`}
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.8"
                                            stroke="currentColor"
                                        >
                                            {item.icon}
                                        </svg>
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User section */}
            <div className="mt-auto border-t border-white/10 px-3 py-3">
                <Dropdown>
                    <Dropdown.Trigger>
                        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-white/5">
                            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy-500 to-navy-700 text-xs font-bold text-white ring-1 ring-white/20">
                                {(user?.name || 'U')
                                    .split(' ')
                                    .map((p) => p[0])
                                    .slice(0, 2)
                                    .join('')
                                    .toUpperCase()}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-white">
                                    {user?.name}
                                </p>
                                <p className="truncate text-xs text-navy-300/60">
                                    {user?.role?.replace('_', ' ')}
                                </p>
                            </div>
                            <svg
                                className="h-4 w-4 shrink-0 text-navy-300/60"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </Dropdown.Trigger>
                    <Dropdown.Content placement="top">
                        <div className="border-b border-slate-100 px-4 py-3">
                            <p className="truncate text-sm font-semibold text-slate-900">
                                {user?.name}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                                {user?.email}
                            </p>
                        </div>
                        <div className="py-1">
                            <Dropdown.Link href={route('profile.edit')}>
                                Profile
                            </Dropdown.Link>
                            <Dropdown.Link
                                href={route('logout')}
                                method="post"
                                as="button"
                            >
                                Log Out
                            </Dropdown.Link>
                        </div>
                    </Dropdown.Content>
                </Dropdown>
            </div>
        </div>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;
    const role = user?.role || 'student';

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = NAV_GROUPS.filter((group) =>
        group.roles.includes(role),
    ).flatMap((group) => group.items);

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">
            {/* Desktop sidebar */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
                <SidebarContent navItems={navItems} role={role} user={user} />
            </aside>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="fixed inset-y-0 left-0 z-50 w-64">
                        <SidebarContent navItems={navItems} role={role} user={user} onNavigate={() => setSidebarOpen(false)} />
                    </aside>
                </div>
            )}

            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-y-auto lg:pl-64">
                {/* Mobile top bar */}
                <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-navy-500"
                        aria-label="Open navigation menu"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                    <Link href="/" className="inline-flex items-center gap-2">
                        <ApplicationLogo className="h-7 w-7 text-navy-800" />
                        <span className="text-sm font-bold text-navy-900">AAMNHS</span>
                    </Link>
                </header>

                {/* Page header */}
                {header && (
                    <header className="border-b border-slate-200/80 bg-white">
                        <div className="mx-auto w-full px-4 py-5 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                {/* Content */}
                <main className="flex-1 pb-20 sm:pb-24 lg:pb-8">
                    <FlashBanner key={flash?.success || flash?.error || 'none'} />
                    {children}
                </main>

                {/* Mobile Footer */}
                <footer className="lg:hidden border-t border-slate-200 bg-white py-3 px-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>© {new Date().getFullYear()} AAMNHS</span>
                        <span>Attendance Monitoring System</span>
                    </div>
                </footer>

                {/* Desktop Footer */}
                <footer className="mt-auto hidden border-t border-slate-200 bg-white py-4 px-4 lg:block lg:px-8">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-1 text-xs text-slate-500 sm:flex-row">
                        <p>© {new Date().getFullYear()} Aurelio Arago Memorial National High School</p>
                        <p>Attendance Monitoring System</p>
                    </div>
                </footer>
            </div>

            {/* Mobile bottom nav — hidden when sidebar overlay is open */}
            {!sidebarOpen && (
                <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-lg lg:hidden" role="navigation" aria-label="Mobile navigation">
                    <div className="flex max-w-lg items-stretch justify-around py-1">
                        {navItems.slice(0, 5).map((item) => {
                            const active = route().current(item.href.split('.')[0]);
                            return (
                                <Link
                                    key={item.href}
                                    href={route(item.href)}
                                    className={`flex flex-1 flex-col items-center gap-0.5 py-2 transition duration-150 focus:outline-none focus:ring-2 focus:ring-navy-500 ${active ? 'text-navy-800' : 'text-slate-400 hover:text-navy-600'}`}
                                    aria-current={active ? 'page' : undefined}
                                >
                                    <svg
                                        className={`h-5 w-5 ${active ? 'text-navy-700' : 'text-slate-400'}`}
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.8"
                                        stroke="currentColor"
                                    >
                                        {item.icon}
                                    </svg>
                                    {item.name.split(' ')[0]}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            )}
        </div>
    );
}
