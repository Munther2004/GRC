import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { StatStrip } from '@/components/ui/stat-strip';
import { FilterBar } from '@/components/ui/filter-bar';
import {
    ArrowRight,
    GitCompare,
    AlertTriangle,
    CheckCircle2,
    Search,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { useState } from 'react';
import { route } from '@/lib/routes';
import { Link } from '@inertiajs/react';

interface ControlMapping {
    id: number;
    direction: 'outbound' | 'inbound';
    mapping_type: 'equivalent' | 'partial' | 'related';
    notes: string | null;
    control: {
        id: number;
        control_id: string;
        title: string;
        framework: string;
        current_status: string | null;
    };
}

interface ControlRow {
    id: number;
    control_id: string;
    title: string;
    category: string;
    framework: string;
    framework_id: number;
    current_status: string | null;
    mappings: ControlMapping[];
}

interface Framework {
    id: number;
    short_name: string;
    name: string;
}

interface Props {
    frameworks: Framework[];
    controlData: Record<string, ControlRow[]>;
    stats: {
        total_controls: number;
        with_mappings: number;
        without_mappings: number;
        equivalent: number;
        partial: number;
        related: number;
    };
    filters: { search?: string; framework_id?: string };
}

const mappingTypeColors: Record<string, string> = {
    equivalent: 'bg-emerald-950 text-emerald-400 border-green-200',
    partial: 'bg-amber-950 text-amber-400 border-border',
    related: 'bg-muted text-foreground/75 border-border',
};

const statusColors: Record<string, string> = {
    compliant: 'bg-emerald-950 text-emerald-400',
    partially_compliant: 'bg-amber-950 text-amber-400',
    non_compliant: 'bg-red-950 text-red-400',
    not_applicable: 'bg-muted text-muted-foreground',
};

const statusLabel = (s: string | null) => {
    if (!s)
        return { label: 'Not Set', cls: 'bg-muted text-muted-foreground/60' };
    return {
        label: s.replace(/_/g, ' '),
        cls: statusColors[s] ?? 'bg-muted text-muted-foreground/60',
    };
};

function ControlCard({ ctrl }: { ctrl: ControlRow }) {
    const [expanded, setExpanded] = useState(false);
    const hasMappings = ctrl.mappings.length > 0;
    const { label, cls } = statusLabel(ctrl.current_status);

    return (
        <div
            className={`overflow-hidden rounded-lg border ${!hasMappings ? 'border-dashed border-border bg-muted/20' : 'bg-card'}`}
        >
            <div
                className="flex cursor-pointer items-start gap-3 p-3 transition-colors hover:bg-muted/40"
                onClick={() => hasMappings && setExpanded((e) => !e)}
            >
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="shrink-0 font-mono text-xs font-semibold text-foreground/85">
                            {ctrl.control_id}
                        </span>
                        <span className="truncate text-xs text-foreground/70">
                            {ctrl.title}
                        </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                            {ctrl.category}
                        </span>
                        <span
                            className={`rounded px-1.5 py-0.5 text-xs capitalize ${cls}`}
                        >
                            {label}
                        </span>
                        {!hasMappings && (
                            <span className="flex items-center gap-0.5 text-xs text-amber-400">
                                <AlertTriangle className="h-3 w-3" /> No
                                crosswalk mapping
                            </span>
                        )}
                        {hasMappings && (
                            <span className="text-xs text-muted-foreground">
                                {ctrl.mappings.length} mapping
                                {ctrl.mappings.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>
                {hasMappings && (
                    <div className="mt-0.5 shrink-0 text-muted-foreground">
                        {expanded ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </div>
                )}
            </div>

            {expanded && hasMappings && (
                <div className="divide-y border-t bg-muted/20">
                    {ctrl.mappings.map((m, idx) => {
                        const { label: sl, cls: sc } = statusLabel(
                            m.control.current_status,
                        );
                        return (
                            <div
                                key={idx}
                                className="flex items-start gap-3 px-3 py-2.5 text-xs"
                            >
                                <div className="mt-0.5 shrink-0">
                                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                                <div className="min-w-0 flex-1 space-y-0.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge
                                            className={`border text-xs capitalize ${mappingTypeColors[m.mapping_type]}`}
                                        >
                                            {m.mapping_type}
                                        </Badge>
                                        <Badge
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            {m.control.framework}
                                        </Badge>
                                        <span className="font-mono text-foreground/85">
                                            {m.control.control_id}
                                        </span>
                                        <span className="truncate text-muted-foreground">
                                            {m.control.title}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className={`rounded px-1.5 py-0.5 text-xs capitalize ${sc}`}
                                        >
                                            {sl}
                                        </span>
                                        {m.notes && (
                                            <span className="text-muted-foreground italic">
                                                {m.notes}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function CrosswalkIndex({
    frameworks,
    controlData,
    stats,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [frameworkId, setFrameworkId] = useState(filters.framework_id ?? '');

    const applyFilters = () => {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (frameworkId) params.framework_id = frameworkId;
        const qs = new URLSearchParams(params).toString();
        router.visit(route('crosswalk.index') + (qs ? `?${qs}` : ''));
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') applyFilters();
    };

    return (
        <AdminLayout>
            <Head title="Framework Control Crosswalk" />

            <div className="mx-auto max-w-6xl space-y-6">
                <PageHeader
                    icon={GitCompare}
                    title="Framework Control Crosswalk"
                    description="Cross-framework mapping across ISO 27001, NIST 800-53, OWASP ASVS, and CIS Controls"
                />

                <StatStrip
                    stats={[
                        {
                            label: 'Total Controls',
                            value: stats.total_controls,
                            variant: 'default',
                        },
                        {
                            label: 'With Mappings',
                            value: stats.with_mappings,
                            variant: 'primary',
                        },
                        {
                            label: 'No Mapping',
                            value: stats.without_mappings,
                            variant: 'warning',
                        },
                        {
                            label: 'Equivalent',
                            value: stats.equivalent,
                            variant: 'success',
                        },
                        {
                            label: 'Partial',
                            value: stats.partial,
                            variant: 'warning',
                        },
                        {
                            label: 'Related',
                            value: stats.related,
                            variant: 'default',
                        },
                    ]}
                />

                {/* Mapping type legend */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="font-medium text-muted-foreground">
                        Mapping types:
                    </span>
                    <span className="flex items-center gap-1 rounded border border-border bg-emerald-950 px-2 py-1 text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Equivalent — direct
                        1:1 control match
                    </span>
                    <span className="flex items-center gap-1 rounded border border-border bg-amber-950 px-2 py-1 text-amber-400">
                        Partial — overlapping but not identical scope
                    </span>
                    <span className="flex items-center gap-1 rounded border border-border bg-muted px-2 py-1 text-foreground/75">
                        Related — thematically linked, different scope
                    </span>
                    <span className="flex items-center gap-1 rounded border border-dashed border-border bg-muted/20 px-2 py-1 text-amber-400">
                        <AlertTriangle className="h-3 w-3" /> No mapping —
                        coverage gap
                    </span>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <div className="relative min-w-[200px] flex-1">
                        <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground/60" />
                        <Input
                            placeholder="Search control ID or title..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleKey}
                            className="pl-9"
                        />
                    </div>
                    <select
                        value={frameworkId}
                        onChange={(e) => setFrameworkId(e.target.value)}
                        className="rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                    >
                        <option value="">All Frameworks</option>
                        {frameworks.map((f) => (
                            <option key={f.id} value={String(f.id)}>
                                {f.short_name}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={applyFilters}
                        className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Filter
                    </button>
                    {(search || frameworkId) && (
                        <button
                            onClick={() => {
                                setSearch('');
                                setFrameworkId('');
                                router.visit(route('crosswalk.index'));
                            }}
                            className="rounded-md border px-4 py-2 text-sm transition-colors hover:bg-muted"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Controls grouped by framework */}
                {Object.entries(controlData).map(([framework, controls]) => (
                    <Card key={framework}>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Badge variant="secondary" className="text-sm">
                                    {framework}
                                </Badge>
                                <span className="text-sm font-normal text-muted-foreground">
                                    {
                                        frameworks.find(
                                            (f) => f.short_name === framework,
                                        )?.name
                                    }
                                </span>
                                <span className="ml-auto text-sm font-normal text-muted-foreground">
                                    {controls.length} controls ·{' '}
                                    {
                                        controls.filter(
                                            (c: ControlRow) =>
                                                c.mappings.length > 0,
                                        ).length
                                    }{' '}
                                    mapped
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {(controls as ControlRow[]).map((ctrl) => (
                                <ControlCard key={ctrl.id} ctrl={ctrl} />
                            ))}
                        </CardContent>
                    </Card>
                ))}

                {Object.keys(controlData).length === 0 && (
                    <div className="py-16 text-center text-muted-foreground">
                        <GitCompare className="mx-auto mb-3 h-12 w-12 opacity-30" />
                        <p className="text-lg">No controls found</p>
                        <p className="mt-1 text-sm">
                            Try clearing the filters or activating frameworks in
                            the admin panel.
                        </p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
