import { Head, Link, router, usePage } from '@inertiajs/react';
import type { SharedProps } from '@/types';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { StatStrip } from '@/components/ui/stat-strip';
import { FilterBar } from '@/components/ui/filter-bar';
import { ArrowUpRight, Eye, Pencil, Plus, Search, Sliders, Sparkles, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { RouteName, RouteParams } from 'ziggy-js';

declare global {
    function route(name: RouteName, params?: RouteParams<RouteName>, absolute?: boolean): string;
}

interface AppetiteBand {
    band: 'acceptable' | 'review' | 'escalated';
    label: string;
    color: string;
}

interface RiskAppetiteConfig {
    id: number; name: string;
    acceptable_max_score: number; review_max_score: number; escalated_min_score: number;
    acceptable_label: string; review_label: string; escalated_label: string;
}

interface Risk {
    id: number; title: string; category: string; owner: string;
    likelihood: number; impact: number; risk_score: number; risk_level: string;
    status: string; treatment: string; treatment_plan: string | null;
    due_date: string | null; auto_generated: number; ai_validated: boolean;
    framework_name: string | null; appetite_band: AppetiteBand | null;
    user: { name: string };
}

interface RiskExposure {
    risk_exposure: number; avg_risk_score: number; total_risks: number; critical_risks: number;
}

interface Props {
    risks: {
        data: Risk[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    stats: { total: number; open: number; critical: number; overdue: number };
    riskExposure: RiskExposure;
    filters: { search?: string; status?: string; level?: string; category?: string; has_plan?: string; framework?: string; escalated_only?: string };
    frameworks: { id: number; short_name: string; name: string }[];
    appetite: RiskAppetiteConfig | null;
}

const levelDot = (level: string) => ({
    critical: 'text-red-400',
    high:     'text-orange-400',
    medium:   'text-amber-400',
    low:      'text-emerald-400',
}[level] ?? 'text-muted-foreground');

const levelBg = (score: number) => {
    if (score >= 19) return { bg: 'bg-red-500/15 text-red-400',    dot: 'bg-red-400' };
    if (score >= 13) return { bg: 'bg-orange-500/15 text-orange-400', dot: 'bg-orange-400' };
    if (score >= 7)  return { bg: 'bg-amber-500/15 text-amber-400',  dot: 'bg-amber-400' };
    return                   { bg: 'bg-emerald-500/15 text-emerald-400', dot: 'bg-emerald-400' };
};

const statusText: Record<string, string> = {
    open:         'text-blue-400',
    in_progress:  'text-purple-400',
    under_review: 'text-amber-400',
    closed:       'text-muted-foreground',
};

function AppetiteDot({ band }: { band: AppetiteBand }) {
    const cls = band.band === 'escalated' ? 'text-red-400' : band.band === 'review' ? 'text-amber-400' : 'text-emerald-400';
    return <span className={`text-xs font-medium ${cls}`}>{band.label}</span>;
}

export default function RisksIndex({ risks, stats, riskExposure, filters, frameworks, appetite }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const canEdit  = auth.user.role === 'admin' || auth.user.role === 'user';

    const [search, setSearch]               = useState(filters.search ?? '');
    const [status, setStatus]               = useState(filters.status ?? 'all');
    const [level, setLevel]                 = useState(filters.level ?? 'all');
    const [category, setCategory]           = useState(filters.category ?? 'all');
    const [framework, setFramework]         = useState(filters.framework ?? 'all');
    const [hasPlan, setHasPlan]             = useState(!!filters.has_plan);
    const [escalatedOnly, setEscalatedOnly] = useState(!!filters.escalated_only);

    const applyFilters = (overrides: Record<string, string> = {}) => {
        router.get(route('risks.index'), {
            search, status: status === 'all' ? '' : status,
            level: level === 'all' ? '' : level,
            category: category === 'all' ? '' : category,
            framework: framework === 'all' ? '' : framework,
            has_plan: hasPlan ? '1' : '',
            escalated_only: escalatedOnly ? '1' : '',
            ...overrides,
        }, { preserveState: true, replace: true });
    };

    const toggleHasPlan = () => {
        const next = !hasPlan; setHasPlan(next);
        applyFilters({ has_plan: next ? '1' : '' });
    };
    const toggleEscalatedOnly = () => {
        const next = !escalatedOnly; setEscalatedOnly(next);
        applyFilters({ escalated_only: next ? '1' : '' });
    };
    const deleteRisk = (id: number, title: string) => {
        if (!confirm(`Delete risk "${title}"? This cannot be undone.`)) return;
        router.delete(route('risks.destroy', id));
    };

    const exposure = riskExposure.risk_exposure;

    return (
        <AdminLayout>
            <Head title="Risk Register" />

            <div className="space-y-6">
                <PageHeader
                    title="Risk Register"
                    description="ISO/IEC 27005 — Likelihood × Impact management"
                >
                    {canEdit && (
                        <Link href={route('risks.create')}>
                            <Button size="sm" className="gap-2">
                                <Plus className="w-3.5 h-3.5" /> New Risk
                            </Button>
                        </Link>
                    )}
                </PageHeader>

                <StatStrip stats={[
                    { label: 'Total',    value: stats.total,    tone: 'neutral' },
                    { label: 'Open',     value: stats.open,     tone: stats.open > 0 ? 'warn' : 'ok' },
                    { label: 'Critical', value: stats.critical, tone: stats.critical > 0 ? 'bad' : 'ok' },
                    { label: 'Overdue',  value: stats.overdue,  tone: stats.overdue > 0 ? 'bad' : 'ok' },
                    {
                        label: 'Exposure', value: `${exposure}%`,
                        tone: exposure > 50 ? 'bad' : exposure >= 20 ? 'warn' : 'ok',
                        hint: `avg ${riskExposure.avg_risk_score}/25`,
                    },
                ]} />

                <FilterBar>
                    <div className="relative flex-1 min-w-[180px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search risks..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyFilters({ search })}
                            className="pl-9 h-8 text-sm"
                        />
                    </div>
                    <Select value={status} onValueChange={v => { setStatus(v); applyFilters({ status: v === 'all' ? '' : v }); }}>
                        <SelectTrigger className="w-[130px] h-8 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="under_review">Under Review</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={level} onValueChange={v => { setLevel(v); applyFilters({ level: v === 'all' ? '' : v }); }}>
                        <SelectTrigger className="w-[120px] h-8 text-sm"><SelectValue placeholder="Level" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={category} onValueChange={v => { setCategory(v); applyFilters({ category: v === 'all' ? '' : v }); }}>
                        <SelectTrigger className="w-[160px] h-8 text-sm"><SelectValue placeholder="Category" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {['Information Security','Operational','Compliance','Financial','Strategic','Technical','Human Resources','Third Party','Physical','Legal'].map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {frameworks.length > 0 && (
                        <Select value={framework} onValueChange={v => { setFramework(v); applyFilters({ framework: v === 'all' ? '' : v }); }}>
                            <SelectTrigger className="w-[130px] h-8 text-sm"><SelectValue placeholder="Framework" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Frameworks</SelectItem>
                                {frameworks.map(f => <SelectItem key={f.id} value={f.short_name}>{f.short_name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                    <button
                        onClick={toggleHasPlan}
                        className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium border transition-colors ${
                            hasPlan ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                        }`}
                    >
                        Has Plan
                    </button>
                    {appetite && (
                        <button
                            onClick={toggleEscalatedOnly}
                            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium border transition-colors ${
                                escalatedOnly ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                            }`}
                        >
                            <Sliders className="w-3 h-3" /> Escalated
                        </button>
                    )}
                    <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => applyFilters({ search })}>
                        Search
                    </Button>
                </FilterBar>

                <Card>
                    <CardHeader className="pb-0 flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            <span className="text-foreground font-semibold tabular-nums">{risks.total}</span> risk{risks.total !== 1 ? 's' : ''}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 mt-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/30 border-y border-border">
                                    <tr>
                                        {['Risk', 'Category', 'Owner', 'Score', 'Level', ...(appetite ? ['Appetite'] : []), 'Status', 'Treatment', 'Due', ''].map(h => (
                                            <th key={h} className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {risks.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={appetite ? 10 : 9} className="px-4 py-12 text-center text-muted-foreground text-sm">
                                                No risks found.{' '}
                                                <Link href={route('risks.create')} className="text-foreground hover:underline">Add the first one.</Link>
                                            </td>
                                        </tr>
                                    ) : risks.data.map(risk => {
                                        const lv = levelBg(risk.likelihood * risk.impact);
                                        return (
                                            <tr key={risk.id} className="hover:bg-accent/30 transition-colors">
                                                <td className="px-4 py-3 max-w-[240px]">
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="font-medium text-foreground truncate">{risk.title}</p>
                                                        {risk.auto_generated === 1 && (
                                                            <span className="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-medium text-purple-400">
                                                                <Sparkles className="w-2.5 h-2.5" />AI
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[11px] text-muted-foreground">{risk.user?.name}</span>
                                                        {risk.framework_name && (
                                                            <span className="font-mono text-[10px] text-muted-foreground/60">{risk.framework_name}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-foreground/80 text-sm">{risk.category}</td>
                                                <td className="px-4 py-3 text-foreground/80 text-sm">{risk.owner}</td>
                                                <td className="px-4 py-3">
                                                    <span className="font-mono font-semibold text-sm tabular-nums">{risk.likelihood * risk.impact}</span>
                                                    <span className="text-[10px] text-muted-foreground">/25</span>
                                                    <p className="text-[10px] text-muted-foreground font-mono">{risk.likelihood}×{risk.impact}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${lv.bg}`}>
                                                        <span className={`w-1 h-1 rounded-full ${lv.dot}`} />
                                                        <span className="capitalize">{risk.risk_level}</span>
                                                    </span>
                                                </td>
                                                {appetite && (
                                                    <td className="px-4 py-3">
                                                        {risk.appetite_band
                                                            ? <AppetiteDot band={risk.appetite_band} />
                                                            : <span className="text-muted-foreground">—</span>}
                                                    </td>
                                                )}
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs capitalize font-medium ${statusText[risk.status] ?? 'text-muted-foreground'}`}>
                                                        {risk.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-foreground/80 text-sm capitalize">{risk.treatment}</td>
                                                <td className="px-4 py-3 text-sm text-foreground/80 font-mono">
                                                    {risk.due_date ? new Date(risk.due_date).toLocaleDateString() : '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <Link href={route('risks.show', risk.id)}>
                                                            <button className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                                                                <Eye className="w-3.5 h-3.5" />
                                                            </button>
                                                        </Link>
                                                        {canEdit && (
                                                            <Link href={route('risks.edit', risk.id)}>
                                                                <button className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                </button>
                                                            </Link>
                                                        )}
                                                        {canEdit && (
                                                            <button
                                                                className="p-1.5 rounded-md hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-400"
                                                                onClick={() => deleteRisk(risk.id, risk.title)}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {risks.links.length > 3 && (
                            <div className="flex items-center justify-center gap-1 p-4 border-t border-border">
                                {risks.links.map((link, i) => (
                                    <Button key={i} variant={link.active ? 'default' : 'outline'} size="sm"
                                        disabled={!link.url} onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
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
