import { Head, router } from '@inertiajs/react';
import {
    ArrowRight,
    AlertTriangle,
    CheckCircle2,
    GitCompare,
    Search,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatStrip } from '@/components/ui/stat-strip';
import AdminLayout from '@/layouts/admin-layout';
import { route } from '@/lib/routes';

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
    equivalent: 'bg-[rgba(70,189,95,0.12)] text-[#46bd5f] border-[rgba(70,189,95,0.4)]',
    partial: 'bg-[rgba(245,185,41,0.12)] text-[#f5b929] border-[rgba(245,185,41,0.4)]',
    related: 'bg-muted text-foreground border-border',
};

const statusColors: Record<string, string> = {
    compliant: 'bg-[rgba(70,189,95,0.12)] text-[#46bd5f]',
    partially_compliant: 'bg-[rgba(245,185,41,0.12)] text-[#f5b929]',
    non_compliant: 'bg-[rgba(229,72,77,0.12)] text-[#e5484d]',
    not_applicable: 'bg-muted text-muted-foreground',
};

const statusLabel = (s: string | null) => {
    if (!s)
        return { label: 'Not Set', cls: 'bg-muted text-muted-foreground' };
    return {
        label: s.replace(/_/g, ' '),
        cls: statusColors[s] ?? 'bg-muted text-muted-foreground',
    };
};

function ControlCard({ ctrl }: { ctrl: ControlRow }) {
    const [expanded, setExpanded] = useState(false);
    const hasMappings = ctrl.mappings.length > 0;
    const { label, cls } = statusLabel(ctrl.current_status);

    return (
        <div
            className={`overflow-hidden rounded-2xl border ${!hasMappings ? 'border-dashed bg-muted/20' : 'bg-card'}`}
        >
            <div
                className="flex cursor-pointer items-start gap-3 p-3 transition-colors hover:bg-muted/40"
                onClick={() => hasMappings && setExpanded((e) => !e)}
            >
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="shrink-0 font-mono text-xs font-medium text-foreground/85">
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
                            className={`rounded-full px-2 py-0.5 text-xs capitalize ${cls}`}
                        >
                            {label}
                        </span>
                        {!hasMappings && (
                            <span className="flex items-center gap-0.5 text-xs" style={{ color: '#f5b929' }}>
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
                                            className={`border capitalize ${mappingTypeColors[m.mapping_type]}`}
                                        >
                                            {m.mapping_type}
                                        </Badge>
                                        <Badge variant="secondary">
                                            {m.control.framework}
                                        </Badge>
                                        <span className="font-mono" style={{ color: 'var(--foreground)' }}>
                                            {m.control.control_id}
                                        </span>
                                        <span className="truncate" style={{ color: 'var(--muted-foreground)' }}>
                                            {m.control.title}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs capitalize ${sc}`}
                                        >
                                            {sl}
                                        </span>
                                        {m.notes && (
                                            <span style={{ color: 'var(--muted-foreground)' }}>
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

    const navigateWith = (next: { search?: string; framework_id?: string }) => {
        const params: Record<string, string> = {};
        const s = next.search ?? search;
        const f = next.framework_id ?? frameworkId;
        if (s) params.search = s;
        if (f) params.framework_id = f;
        const qs = new URLSearchParams(params).toString();
        router.visit(route('crosswalk.index') + (qs ? `?${qs}` : ''), {
            preserveScroll: true,
            preserveState: false,
            replace: true,
        });
    };

    const handleFrameworkChange = (v: string) => {
        const next = v === '__all__' ? '' : v;
        setFrameworkId(next);
        navigateWith({ framework_id: next });
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') navigateWith({});
    };

    const clearFilters = () => {
        setSearch('');
        setFrameworkId('');
        router.visit(route('crosswalk.index'), {
            preserveScroll: true,
            preserveState: false,
            replace: true,
        });
    };

    return (
        <AdminLayout>
            <Head title="Framework Control Crosswalk" />

            <div className="mx-auto max-w-6xl space-y-6">
                <PageHeader
                    title="Framework control crosswalk"
                    description="Cross-framework mapping across ISO 27001, NIST 800-53, OWASP ASVS, and CIS Controls"
                />

                <StatStrip
                    stats={[
                        { label: 'Total controls', value: stats.total_controls, tone: 'neutral' },
                        { label: 'With mappings',  value: stats.with_mappings, tone: 'ok' },
                        { label: 'No mapping',     value: stats.without_mappings, tone: 'warn' },
                        { label: 'Equivalent',     value: stats.equivalent, tone: 'ok' },
                        { label: 'Partial',        value: stats.partial, tone: 'warn' },
                        { label: 'Related',        value: stats.related, tone: 'neutral' },
                    ]}
                />

                {/* Mapping type legend */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-medium" style={{ color: 'var(--muted-foreground)' }}>
                        Mapping types:
                    </span>
                    <span className="flex items-center gap-1 rounded-full border px-2.5 py-1" style={{ borderColor: 'rgba(70,189,95,0.4)', background: 'rgba(70,189,95,0.12)', color: '#46bd5f' }}>
                        <CheckCircle2 className="h-3 w-3" /> Equivalent — direct 1:1 control match
                    </span>
                    <span className="flex items-center gap-1 rounded-full border px-2.5 py-1" style={{ borderColor: 'rgba(245,185,41,0.4)', background: 'rgba(245,185,41,0.12)', color: '#f5b929' }}>
                        Partial — overlapping but not identical scope
                    </span>
                    <span className="flex items-center gap-1 rounded-full border bg-muted px-2.5 py-1" style={{ color: 'var(--foreground)' }}>
                        Related — thematically linked, different scope
                    </span>
                    <span className="flex items-center gap-1 rounded-full border border-dashed bg-muted/20 px-2.5 py-1" style={{ color: '#f5b929' }}>
                        <AlertTriangle className="h-3 w-3" /> No mapping — coverage gap
                    </span>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <div className="relative min-w-[200px] flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                        <Input
                            placeholder="Search control ID or title..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleKey}
                            className="pl-9"
                        />
                    </div>
                    <Select
                        value={frameworkId === '' ? '__all__' : frameworkId}
                        onValueChange={handleFrameworkChange}
                    >
                        <SelectTrigger className="min-w-[160px]">
                            <SelectValue placeholder="All Frameworks" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All Frameworks</SelectItem>
                            {frameworks.map((f) => (
                                <SelectItem key={f.id} value={String(f.id)}>
                                    {f.short_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <button
                        onClick={() => navigateWith({})}
                        className="rounded-full bg-primary px-5 py-2 text-sm transition-all hover:brightness-110"
                        style={{ color: 'var(--primary-foreground)' }}
                    >
                        Search
                    </button>
                    {(search || frameworkId) && (
                        <button
                            onClick={clearFilters}
                            className="rounded-full border px-5 py-2 text-sm transition-colors hover:bg-muted"
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
