import { router } from '@inertiajs/react';
import { Layers } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const ALL_VALUE = 'all';

export type FrameworkOption = {
    id: number;
    short_name: string;
    name: string;
};

export type FrameworkFilterProps = {
    selected: number | null;
    options: FrameworkOption[];
    className?: string;
};

export function FrameworkFilter({ selected, options, className = '' }: FrameworkFilterProps) {
    if (!options || options.length === 0) {
        return null;
    }

    const value = selected ? String(selected) : ALL_VALUE;

    const handleChange = (next: string) => {
        const url = new URL(window.location.href);
        if (next === ALL_VALUE) {
            url.searchParams.delete('framework_id');
        } else {
            url.searchParams.set('framework_id', next);
        }
        url.searchParams.delete('page');
        router.visit(url.pathname + url.search, {
            preserveScroll: true,
            preserveState: false,
            replace: true,
        });
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Layers className="h-4 w-4 text-muted-foreground" />
            <Select value={value} onValueChange={handleChange}>
                <SelectTrigger className="h-9 w-[220px]">
                    <SelectValue placeholder="All frameworks" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL_VALUE}>All frameworks</SelectItem>
                    {options.map((fw) => (
                        <SelectItem key={fw.id} value={String(fw.id)}>
                            {fw.short_name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
