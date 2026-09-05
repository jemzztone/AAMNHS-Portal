import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

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

function SidebarContent({ navItems, role, user }) {
    const grouped = NAV_GROUPS.filter((group) => group.roles.includes(role));

    return (
        <div className="flex h-full flex-col bg-navy-950">
            {/* Brand */}
            <div className="flex h-16 items-center gap-3 px-5">
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
            <nav className="flex-1 overflow-y-auto px-3 pb-4 pt-2">
                {grouped.map((group) => (
                    <div key={group.label || 'main'} className="mb-4">
                        {group.label && (
                            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-navy-400/60">
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
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition duration-150 ${
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
            <div className="border-t border-white/10 px-3 py-4">
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
                    <Dropdown.Content>
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
    const { auth } = usePage().props;
    const user = auth.user;
    const role = user?.role || 'student';

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = NAV_GROUPS.filter((group) =>
        group.roles.includes(role),
    ).flatMap((group) => group.items);

    return (
        <div className="flex min-h-screen bg-slate-100">
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
                        <SidebarContent navItems={navItems} role={role} user={user} />
                    </aside>
                </div>
            )}

            {/* Main content */}
            <div className="flex flex-1 flex-col lg:pl-64">
                {/* Mobile top bar */}
                <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100"
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
                <main className="flex-1 pb-24 lg:pb-8">{children}</main>

                {/* Footer */}
                <footer className="mt-auto hidden border-t border-slate-200 bg-white py-4 lg:block">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-1 px-4 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
                        <p>© {new Date().getFullYear()} Aurelio Arago Memorial National High School</p>
                        <p>Attendance Monitoring System</p>
                    </div>
                </footer>
            </div>

            {/* Mobile bottom nav */}
            <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
                <div className="mx-auto flex max-w-lg items-stretch justify-around px-2">
                    {navItems.slice(0, 5).map((item) => {
                        const active = route().current(item.href.split('.')[0]);
                        return (
                            <Link
                                key={item.href}
                                href={route(item.href)}
                                className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition duration-150 ${
                                    active
                                        ? 'text-navy-800'
                                        : 'text-slate-400 hover:text-navy-600'
                                }`}
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
        </div>
    );
}
