import { Head, Link, router } from '@inertiajs/react';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/ui/page-header';
import { StatStrip } from '@/components/ui/stat-strip';
import { Search, Pencil, Trash2, Settings } from 'lucide-react';
import { useState } from 'react';

interface Control {
    id: number;
    control_id: string;
    title: string;
    category: string;
    is_active: boolean;
    framework: { id: number; short_name: string };
}

interface Props {
    controls: {
        data: Control[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    frameworks: { id: number; name: string; short_name: string }[];
    categories: string[];
    filters: { search?: string; framework_id?: string; category?: string };
    stats: {
        total: number;
        by_framework: {
            id: number;
            short_name: string;
            controls_count: number;
        }[];
    };
}

export default function ControlsIndex({
    controls,
    frameworks,
    categories,
    filters,
    stats,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [frameworkId, setFramework] = useState(filters.framework_id ?? 'all');
    const [category, setCategory] = useState(filters.category ?? 'all');

    const applyFilters = (overrides: Record<string, string> = {}) => {
        router.get(
            route('admin.controls.index'),
            {
                search,
                framework_id: frameworkId === 'all' ? '' : frameworkId,
                category: category === 'all' ? '' : category,
                ...overrides,
            },
            { preserveState: true, replace: true },
        );
    };

    const deleteControl = (id: number, controlId: string) => {
        if (!confirm(`Delete control "${controlId}"? This cannot be undone.`))
            return;
        router.delete(route('admin.controls.destroy', id));
    };

    return (
        <AdminLayout>
            <Head title="Controls Library" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Controls Library
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        All {stats.total} controls across all frameworks
                    </p>
                </div>

                {/* Framework Stats */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {stats.by_framework.map((f) => (
                        <Card key={f.id}>
                            <CardContent className="flex items-center gap-3 p-4">
                                <Settings className="h-5 w-5 text-blue-400" />
                                <div>
                                    <p className="text-2xl font-bold">
                                        {f.controls_count}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {f.short_name}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-3">
                            <div className="relative min-w-[200px] flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by ID, title, or description..."
                                    value={search}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                    ) => setSearch(e.target.value)}
                                    onKeyDown={(e: React.KeyboardEvent) =>
                                        e.key === 'Enter' &&
                                        applyFilters({ search })
                                    }
                                    className="pl-9"
                                />
                            </div>
                            <Select
                                value={frameworkId}
                                onValueChange={(v: string) => {
                                    setFramework(v);
                                    applyFilters({
                                        framework_id: v === 'all' ? '' : v,
                                    });
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Framework" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Frameworks
                                    </SelectItem>
                                    {frameworks.map((f) => (
                                        <SelectItem
                                            key={f.id}
                                            value={String(f.id)}
                                        >
                                            {f.short_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={category}
                                onValueChange={(v: string) => {
                                    setCategory(v);
                                    applyFilters({
                                        category: v === 'all' ? '' : v,
                                    });
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Categories
                                    </SelectItem>
                                    {categories.map((c) => (
                                        <SelectItem key={c} value={c}>
                                            {c}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                onClick={() => applyFilters({ search })}
                            >
                                Search
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">
                            {controls.total} controls
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="mt-4 p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-y border-border bg-muted/30">
                                    <tr>
                                        {[
                                            'Control ID',
                                            'Title',
                                            'Framework',
                                            'Category',
                                            'Status',
                                            'Actions',
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className="px-4 py-3 text-left text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {controls.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-12 text-center text-muted-foreground"
                                            >
                                                No controls found.
                                            </td>
                                        </tr>
                                    ) : (
                                        controls.data.map((control) => (
                                            <tr
                                                key={control.id}
                                                className="transition-colors hover:bg-accent/30"
                                            >
                                                <td className="px-4 py-3">
                                                    <span className="rounded bg-muted/50 px-2 py-1 font-mono text-xs">
                                                        {control.control_id}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="max-w-[280px] truncate font-medium text-foreground">
                                                        {control.title}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {
                                                            control.framework
                                                                .short_name
                                                        }
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-foreground/80">
                                                    {control.category}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            control.is_active
                                                                ? 'border-green-200 bg-green-50 text-emerald-400'
                                                                : 'border-border bg-muted text-muted-foreground'
                                                        }
                                                    >
                                                        {control.is_active
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <Link
                                                            href={route(
                                                                'admin.controls.edit',
                                                                control.id,
                                                            )}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:bg-red-50"
                                                            onClick={() =>
                                                                deleteControl(
                                                                    control.id,
                                                                    control.control_id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {controls.links.length > 3 && (
                            <div className="flex items-center justify-center gap-1 border-t p-4">
                                {controls.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() =>
                                            link.url && router.get(link.url)
                                        }
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
