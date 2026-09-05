import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-navy-300 ' +
                (active
                    ? 'bg-white/15 text-white'
                    : 'text-navy-100/80 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white') +
                className
            }
        >
            {children}
        </Link>
    );
}
