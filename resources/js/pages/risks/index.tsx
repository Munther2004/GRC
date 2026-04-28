import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, Sliders, Sparkles, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { RouteName, RouteParams } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterBar } from '@/components/ui/filter-bar';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { StatStrip } from '@/components/ui/stat-strip';
import AdminLayout from '@/layouts/admin-layout';
import { route } from '@/lib/routes';
import type { SharedProps } from '@/types';

declare global {
    function route(name: RouteName, params?: RouteParams<RouteName>, absolute?: boolean): string;
}

interface AppetiteBand {
    band: 'acceptable' | 'review' | 'escalated';
    label: string;
    color: string;
}

interface RiskAppetiteConfig {
    id: number;
    name: string;
    acceptable_max_score: number;
    review_max_score: number;
    escalated_min_score: number;
    acceptable_label: string;
    review_label: string;
    escalated_label: string;
}

interface Risk {
    id: number;
    title: string;
    category: string;
    owner: string;
    likelihood: number;
    impact: number;
    risk_score: number;
    risk_level: string;
    status: string;
    treatment: string;
    treatment_plan: string | null;
    due_date: string | null;
    auto_generated: number;
    ai_validated: boolean;
    framework_name: string | null;
    appetite_band: AppetiteBand | null;
    user: { name: string };
}

interface RiskExposure {
    risk_exposure: number;
    avg_risk_score: number;
    total_risks: number;
    critical_risks: number;
}

interface Props {
    risks: {
        data: Risk[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    stats: { total: number; open: number; critical: number; overdue: number };
    riskExposure: RiskExposure;
    filters: {
        search?: string;
        status?: string;
        level?: string;
        category?: string;
        has_plan?: string;
        framework?: string;
        escalated_only?: string;
    };
    frameworks: { id: number; short_name: string; name: string }[];
    appetite: RiskAppetiteConfig | null;
}

const levelColors = (level: string): { color: string; bg: string } => ({
    critical: { color: '#8B2635', bg: 'rgba(139,38,53,0.15)' },
    high:     { color: '#285A48', bg: 'rgba(40,90,72,0.15)' },
    medium:   { color: '#408A71', bg: 'rgba(64,138,113,0.15)' },
    low:      { color: '#B0E4CC', bg: 'rgba(176,228,204,0.15)' },
}[level] ?? { color: '#7ABFA8', bg: 'rgba(156,139,122,0.1)' });

const statusColor = (status: string): string => ({
    open:         '#8B2635',
    in_progress:  '#408A71',
    under_review: '#285A48',
    closed:       '#B0E4CC',
}[status] ?? '#7ABFA8');

function AppetiteDot({ band }: { band: AppetiteBand }) {
    const color = band.band === 'escalated' ? '#8B2635' : band.band === 'review' ? '#285A48' : '#B0E4CC';
    return <span className="font-display text-[10px] uppercase tracking-[0.05em]" style={{ color }}>{band.label}</span>;
}

export default function RisksIndex({ risks, stats, riskExposure, filters, frameworks, appetite }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const canEdit = auth.user.role === 'super_admin' || auth.user.role === 'admin' || auth.user.role === 'user';

    const [search, setSearch]             = useState(filters.search ?? '');
    const [status, setStatus]             = useState(filters.status ?? 'all');
    const [level, setLevel]               = useState(filters.level ?? 'all');
    const [category, setCategory]         = useState(filters.category ?? 'all');
    const [framework, setFramework]       = useState(filters.framework ?? 'all');
    const [hasPlan, setHasPlan]           = useState(!!filters.has_plan);
    const [escalatedOnly, setEscalatedOnly] = useState(!!filters.escalated_only);

    const applyFilters = (overrides: Record<string, string> = {}) => {
        router.get(route('risks.index'), {
            search,
            status:        status === 'all' ? '' : status,
            level:         level === 'all' ? '' : level,
            category:      category === 'all' ? '' : category,
            framework:     framework === 'all' ? '' : framework,
            has_plan:      hasPlan ? '1' : '',
            escalated_only: escalatedOnly ? '1' : '',
            ...overrides,
        }, { preserveState: true, replace: true });
    };

    const toggleHasPlan = () => { const next = !hasPlan; setHasPlan(next); applyFilters({ has_plan: next ? '1' : '' }); };
    const toggleEscalatedOnly = () => { const next = !escalatedOnly; setEscalatedOnly(next); applyFilters({ escalated_only: next ? '1' : '' }); };
    const deleteRisk = (id: number, title: string) => {
        if (!confirm(`Delete risk "${title}"? This cannot be undone.`)) return;
        router.delete(route('risks.destroy', id));
    };

    const exposure = riskExposure.risk_exposure;

    return (
        <AdminLayout>
            <Head title="Risk Register" />
            <div className="space-y-6">
                <PageHeader title="Risk Register" description="ISO/IEC 27005 — Likelihood × Impact management">
                    {canEdit && (
                        <Link href={route('risks.create')}>
                            <Button size="sm" className="gap-2">
                                <Plus className="h-3.5 w-3.5" /> New Risk
                            </Button>
                        </Link>
                    )}
                </PageHeader>

                <StatStrip stats={[
                    { label: 'Total',    value: stats.total,    tone: 'neutral' },
                    { label: 'Open',     value: stats.open,     tone: stats.open > 0 ? 'warn' : 'ok' },
                    { label: 'Critical', value: stats.critical, tone: stats.critical > 0 ? 'bad' : 'ok' },
                    { label: 'Overdue',  value: stats.overdue,  tone: stats.overdue > 0 ? 'bad' : 'ok' },
                    { label: 'Exposure', value: `${exposure}%`, tone: exposure > 50 ? 'bad' : exposure >= 20 ? 'warn' : 'ok', hint: `avg ${riskExposure.avg_risk_score}/25` },
                ]} />

                <FilterBar>
                    <div className="relative min-w-45 flex-1">
                        <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" style={{ color: '#7ABFA8' }} />
                        <Input
                            placeholder="Search risks..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
                            className="h-8 pl-9 text-sm"
                        />
                    </div>
                    <Select value={status} onValueChange={(v) => { setStatus(v); applyFilters({ status: v === 'all' ? '' : v }); }}>
                        <SelectTrigger className="h-8 w-32 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="under_review">Under Review</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={level} onValueChange={(v) => { setLevel(v); applyFilters({ level: v === 'all' ? '' : v }); }}>
                        <SelectTrigger className="h-8 w-30 text-sm"><SelectValue placeholder="Level" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={category} onValueChange={(v) => { setCategory(v); applyFilters({ category: v === 'all' ? '' : v }); }}>
                        <SelectTrigger className="h-8 w-40 text-sm"><SelectValue placeholder="Category" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {['Information Security','Operational','Compliance','Financial','Strategic','Technical','Human Resources','Third Party','Physical','Legal'].map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {frameworks.length > 0 && (
                        <Select value={framework} onValueChange={(v) => { setFramework(v); applyFilters({ framework: v === 'all' ? '' : v }); }}>
                            <SelectTrigger className="h-8 w-32 text-sm"><SelectValue placeholder="Framework" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Frameworks</SelectItem>
                                {frameworks.map((f) => <SelectItem key={f.id} value={f.short_name}>{f.short_name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                    <button
                        onClick={toggleHasPlan}
                        className="inline-flex h-8 items-center gap-1.5 rounded px-3 font-display text-[10px] uppercase tracking-widest transition-colors"
                        style={hasPlan
                            ? { border: '1px solid rgba(176,228,204,0.4)', background: 'rgba(176,228,204,0.1)', color: '#B0E4CC' }
                            : { border: '1px solid #285A48', color: '#7ABFA8' }
                        }
                    >
                        Has Plan
                    </button>
                    {appetite && (
                        <button
                            onClick={toggleEscalatedOnly}
                            className="inline-flex h-8 items-center gap-1.5 rounded px-3 font-display text-[10px] uppercase tracking-widest transition-colors"
                            style={escalatedOnly
                                ? { border: '1px solid rgba(139,38,53,0.4)', background: 'rgba(139,38,53,0.1)', color: '#8B2635' }
                                : { border: '1px solid #285A48', color: '#7ABFA8' }
                            }
                        >
                            <Sliders className="h-3 w-3" /> Escalated
                        </button>
                    )}
                    <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => applyFilters({ search })}>
                        Search
                    </Button>
                </FilterBar>

                <Card>
                    <CardHeader className="flex-row items-center justify-between pb-0">
                        <CardTitle className="font-body text-sm italic" style={{ color: '#7ABFA8' }}>
                            <span className="font-heading not-italic text-base" style={{ color: 'var(--foreground)' }}>
                                {risks.total}
                            </span>{' '}
                            risk{risks.total !== 1 ? 's' : ''}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="mt-4 p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead style={{ borderTop: '1px solid #285A48', borderBottom: '1px solid #285A48', background: 'rgba(13,31,28,0.6)' }}>
                                    <tr>
                                        {['Risk','Category','Owner','Score','Level',...(appetite ? ['Appetite'] : []),'Status','Treatment','Due',''].map((h) => (
                                            <th key={h} className="px-4 py-2.5 text-left font-display text-[9px] uppercase tracking-[0.15em]" style={{ color: '#7ABFA8' }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {risks.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={appetite ? 10 : 9} className="px-4 py-12 text-center">
                                                <p className="font-body text-sm italic" style={{ color: '#7ABFA8' }}>
                                                    No risks found.{' '}
                                                    <Link href={route('risks.create')} style={{ color: '#408A71' }}>
                                                        Add the first one.
                                                    </Link>
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        risks.data.map((risk) => {
                                            const score = risk.likelihood * risk.impact;
                                            const lc = levelColors(risk.risk_level);
                                            return (
                                                <tr
                                                    key={risk.id}
                                                    className="transition-colors"
                                                    style={{ borderBottom: '1px solid rgba(40,90,72,0.4)' }}
                                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(61,51,43,0.3)')}
                                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                                >
                                                    <td className="max-w-60 px-4 py-3">
                                                        <div className="flex items-center gap-1.5">
                                                            <p className="font-body truncate text-sm" style={{ color: 'var(--foreground)' }}>{risk.title}</p>
                                                            {risk.auto_generated === 1 && (
                                                                <span className="font-display inline-flex shrink-0 items-center gap-0.5 text-[9px] uppercase tracking-wider" style={{ color: '#408A71' }}>
                                                                    <Sparkles className="h-2.5 w-2.5" /> AI
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="mt-0.5 flex items-center gap-1.5">
                                                            <span className="font-body text-[11px] italic" style={{ color: '#7ABFA8' }}>{risk.user?.name}</span>
                                                            {risk.framework_name && (
                                                                <span className="font-display text-[9px]" style={{ color: 'rgba(156,139,122,0.6)' }}>{risk.framework_name}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 font-body text-sm" style={{ color: 'rgba(232,223,212,0.75)' }}>{risk.category}</td>
                                                    <td className="px-4 py-3 font-body text-sm" style={{ color: 'rgba(232,223,212,0.75)' }}>{risk.owner}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="font-heading text-sm tabular-nums" style={{ color: '#408A71' }}>{score}</span>
                                                        <span className="font-display text-[10px]" style={{ color: '#7ABFA8' }}>/25</span>
                                                        <p className="font-display text-[9px]" style={{ color: '#7ABFA8' }}>{risk.likelihood}×{risk.impact}</p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className="inline-flex items-center gap-1 rounded px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.08em]"
                                                            style={{ color: lc.color, background: lc.bg }}
                                                        >
                                                            <span className="h-1 w-1 rounded-full shrink-0" style={{ background: lc.color }} />
                                                            {risk.risk_level}
                                                        </span>
                                                    </td>
                                                    {appetite && (
                                                        <td className="px-4 py-3">
                                                            {risk.appetite_band ? <AppetiteDot band={risk.appetite_band} /> : <span style={{ color: '#7ABFA8' }}>—</span>}
                                                        </td>
                                                    )}
                                                    <td className="px-4 py-3">
                                                        <span className="font-display text-[10px] capitalize tracking-[0.05em]" style={{ color: statusColor(risk.status) }}>
                                                            {risk.status.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 font-body text-sm capitalize" style={{ color: 'rgba(232,223,212,0.75)' }}>{risk.treatment}</td>
                                                    <td className="px-4 py-3 font-display text-[10px]" style={{ color: '#7ABFA8' }}>
                                                        {risk.due_date ? new Date(risk.due_date).toLocaleDateString() : '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1">
                                                            <Link href={route('risks.show', risk.id)}>
                                                                <button className="rounded p-1.5 transition-colors" style={{ color: '#7ABFA8' }}
                                                                    onMouseEnter={e => (e.currentTarget.style.color = '#408A71')}
                                                                    onMouseLeave={e => (e.currentTarget.style.color = '#7ABFA8')}
                                                                >
                                                                    <Eye className="h-3.5 w-3.5" />
                                                                </button>
                                                            </Link>
                                                            {canEdit && (
                                                                <Link href={route('risks.edit', risk.id)}>
                                                                    <button className="rounded p-1.5 transition-colors" style={{ color: '#7ABFA8' }}
                                                                        onMouseEnter={e => (e.currentTarget.style.color = '#408A71')}
                                                                        onMouseLeave={e => (e.currentTarget.style.color = '#7ABFA8')}
                                                                    >
                                                                        <Pencil className="h-3.5 w-3.5" />
                                                                    </button>
                                                                </Link>
                                                            )}
                                                            {canEdit && (
                                                                <button
                                                                    className="rounded p-1.5 transition-colors" style={{ color: '#7ABFA8' }}
                                                                    onMouseEnter={e => (e.currentTarget.style.color = '#8B2635')}
                                                                    onMouseLeave={e => (e.currentTarget.style.color = '#7ABFA8')}
                                                                    onClick={() => deleteRisk(risk.id, risk.title)}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {risks.links.length > 3 && (
                            <div className="flex items-center justify-center gap-1 p-4" style={{ borderTop: '1px solid #285A48' }}>
                                {risks.links.map((link, i) => (
                                    <Button key={i} variant={link.active ? 'default' : 'outline'} size="sm" disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
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
