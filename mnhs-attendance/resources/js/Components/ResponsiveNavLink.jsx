import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition duration-150 ease-in-out focus:outline-none ${
                active
                    ? 'bg-white/15 text-white'
                    : 'text-navy-100/80 hover:bg-white/10 hover:text-white'
            } ${className}`}
        >
            {children}
        </Link>
    );
}
