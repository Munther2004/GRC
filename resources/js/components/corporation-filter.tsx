import { router, usePage } from '@inertiajs/react';
import { Building2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { SharedProps } from '@/types';

const ALL_VALUE = 'all';

/**
 * Corporation drill-down picker for super_admin. Renders nothing for any
 * other role (the backend confines them to their own corporation).
 *
 * Selecting a corporation appends ?corporation_id=<id> to the current URL,
 * causing the page's controller to re-render its data filtered to that
 * tenant. Selecting "All corporations" removes the param.
 */
export function CorporationFilter({
    className = '',
}: { className?: string }) {
    const { corporationFilter } = usePage<SharedProps>().props;

    if (!corporationFilter) {
        return null;
    }

    const { selected, options } = corporationFilter;
    const value = selected ? String(selected) : ALL_VALUE;

    const handleChange = (next: string) => {
        const url = new URL(window.location.href);
        if (next === ALL_VALUE) {
            url.searchParams.delete('corporation_id');
        } else {
            url.searchParams.set('corporation_id', next);
        }
        // Reset paging when switching corporations so the user lands on page 1.
        url.searchParams.delete('page');
        router.visit(url.pathname + url.search, {
            preserveScroll: true,
            preserveState: false,
            replace: true,
        });
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Select value={value} onValueChange={handleChange}>
                <SelectTrigger className="h-9 w-[220px]">
                    <SelectValue placeholder="All corporations" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL_VALUE}>All corporations</SelectItem>
                    {options.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
