import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, GitCompare, AlertTriangle, CheckCircle2, Search, ChevronDown, ChevronUp } from 'lucide-react';
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
    equivalent: 'bg-green-100 text-green-700 border-green-200',
    partial:    'bg-amber-100 text-amber-700 border-amber-200',
    related:    'bg-gray-100 text-gray-600 border-gray-200',
};

const statusColors: Record<string, string> = {
    compliant:            'bg-green-100 text-green-700',
    partially_compliant:  'bg-yellow-100 text-yellow-700',
    non_compliant:        'bg-red-100 text-red-700',
    not_applicable:       'bg-gray-100 text-gray-500',
};

const statusLabel = (s: string | null) => {
    if (!s) return { label: 'Not Set', cls: 'bg-gray-100 text-gray-400' };
    return { label: s.replace(/_/g, ' '), cls: statusColors[s] ?? 'bg-gray-100 text-gray-400' };
};

function ControlCard({ ctrl }: { ctrl: ControlRow }) {
    const [expanded, setExpanded] = useState(false);
    const hasMappings = ctrl.mappings.length > 0;
    const { label, cls } = statusLabel(ctrl.current_status);

    return (
        <div className={`border rounded-lg overflow-hidden ${!hasMappings ? 'border-dashed border-amber-200 bg-amber-50/30' : 'bg-card'}`}>
            <div
                className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() => hasMappings && setExpanded(e => !e)}
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300 shrink-0">{ctrl.control_id}</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{ctrl.title}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-gray-400">{ctrl.category}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${cls}`}>{label}</span>
                        {!hasMappings && (
                            <span className="text-xs flex items-center gap-0.5 text-amber-600">
                                <AlertTriangle className="w-3 h-3" /> No crosswalk mapping
                            </span>
                        )}
                        {hasMappings && (
                            <span className="text-xs text-gray-400">{ctrl.mappings.length} mapping{ctrl.mappings.length !== 1 ? 's' : ''}</span>
                        )}
                    </div>
                </div>
                {hasMappings && (
                    <div className="shrink-0 text-gray-400 mt-0.5">
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                )}
            </div>

            {expanded && hasMappings && (
                <div className="border-t divide-y bg-muted/20">
                    {ctrl.mappings.map((m, idx) => {
                        const { label: sl, cls: sc } = statusLabel(m.control.current_status);
                        return (
                            <div key={idx} className="flex items-start gap-3 px-3 py-2.5 text-xs">
                                <div className="shrink-0 mt-0.5">
                                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0 space-y-0.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge className={`text-xs border capitalize ${mappingTypeColors[m.mapping_type]}`}>{m.mapping_type}</Badge>
                                        <Badge variant="secondary" className="text-xs">{m.control.framework}</Badge>
                                        <span className="font-mono text-gray-700 dark:text-gray-300">{m.control.control_id}</span>
                                        <span className="text-gray-500 truncate">{m.control.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${sc}`}>{sl}</span>
                                        {m.notes && <span className="text-gray-400 italic">{m.notes}</span>}
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

export default function CrosswalkIndex({ frameworks, controlData, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [frameworkId, setFrameworkId] = useState(filters.framework_id ?? '');

    const applyFilters = () => {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (frameworkId) params.framework_id = frameworkId;
        const qs = new URLSearchParams(params).toString();
        window.location.href = route('crosswalk.index') + (qs ? `?${qs}` : '');
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') applyFilters();
    };

    return (
        <AdminLayout>
            <Head title="Framework Control Crosswalk" />

            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <GitCompare className="w-6 h-6 text-indigo-600" />
                        Framework Control Crosswalk
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Cross-framework mapping across ISO 27001, NIST 800-53, OWASP ASVS, and CIS Controls
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                        { label: 'Total Controls', value: stats.total_controls, cls: 'text-gray-800' },
                        { label: 'With Mappings',  value: stats.with_mappings,  cls: 'text-indigo-700' },
                        { label: 'No Mapping',     value: stats.without_mappings, cls: 'text-amber-600' },
                        { label: 'Equivalent',     value: stats.equivalent,     cls: 'text-green-700' },
                        { label: 'Partial',        value: stats.partial,        cls: 'text-amber-700' },
                        { label: 'Related',        value: stats.related,        cls: 'text-gray-600' },
                    ].map(({ label, value, cls }) => (
                        <Card key={label}>
                            <CardContent className="p-3 text-center">
                                <div className={`text-2xl font-bold ${cls}`}>{value}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Mapping type legend */}
                <div className="flex items-center gap-3 flex-wrap text-xs">
                    <span className="text-gray-500 font-medium">Mapping types:</span>
                    <span className="flex items-center gap-1 px-2 py-1 rounded border bg-green-100 text-green-700 border-green-200">
                        <CheckCircle2 className="w-3 h-3" /> Equivalent — direct 1:1 control match
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 rounded border bg-amber-100 text-amber-700 border-amber-200">
                        Partial — overlapping but not identical scope
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 rounded border bg-gray-100 text-gray-600 border-gray-200">
                        Related — thematically linked, different scope
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 rounded border border-dashed border-amber-300 bg-amber-50/50 text-amber-600">
                        <AlertTriangle className="w-3 h-3" /> No mapping — coverage gap
                    </span>
                </div>

                {/* Filters */}
                <div className="flex gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search control ID or title..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={handleKey}
                            className="pl-9"
                        />
                    </div>
                    <select
                        value={frameworkId}
                        onChange={e => setFrameworkId(e.target.value)}
                        className="text-sm border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">All Frameworks</option>
                        {frameworks.map(f => (
                            <option key={f.id} value={String(f.id)}>{f.short_name}</option>
                        ))}
                    </select>
                    <button
                        onClick={applyFilters}
                        className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Filter
                    </button>
                    {(search || frameworkId) && (
                        <button
                            onClick={() => { setSearch(''); setFrameworkId(''); window.location.href = route('crosswalk.index'); }}
                            className="px-4 py-2 text-sm border rounded-md hover:bg-muted transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Controls grouped by framework */}
                {Object.entries(controlData).map(([framework, controls]) => (
                    <Card key={framework}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Badge variant="secondary" className="text-sm">{framework}</Badge>
                                <span className="text-gray-500 font-normal text-sm">
                                    {frameworks.find(f => f.short_name === framework)?.name}
                                </span>
                                <span className="ml-auto text-sm font-normal text-gray-400">
                                    {controls.length} controls · {controls.filter((c: ControlRow) => c.mappings.length > 0).length} mapped
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {(controls as ControlRow[]).map(ctrl => (
                                <ControlCard key={ctrl.id} ctrl={ctrl} />
                            ))}
                        </CardContent>
                    </Card>
                ))}

                {Object.keys(controlData).length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                        <GitCompare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-lg">No controls found</p>
                        <p className="text-sm mt-1">Try clearing the filters or activating frameworks in the admin panel.</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
