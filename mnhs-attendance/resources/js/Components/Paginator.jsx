import { Link } from '@inertiajs/react';

/**
 * Shared paginator used by the admin index pages (audit logs, guardian
 * notifications, academic years, grade levels). Renders Laravel's default
 * paginator `links` array.
 */
export default function Paginator({ meta }) {
    if (!meta || meta.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
            <p className="text-xs text-slate-500">
                Showing {meta.from ?? 0}–{meta.to ?? 0} of {meta.total ?? 0}
            </p>
            <div className="flex items-center gap-1">
                {meta.links.map((link, index) => {
                    if (!link.url) {
                        return (
                            <span
                                key={index}
                                className="px-2.5 py-1.5 text-xs text-slate-400"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        );
                    }
                    return (
                        <Link
                            key={index}
                            href={link.url}
                            className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                link.active
                                    ? 'bg-navy-800 text-white'
                                    : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
