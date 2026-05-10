import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Loader2, Pencil, Plus, Search, Sliders, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { RouteName, RouteParams } from 'ziggy-js';
import { CorporationFilter } from '@/components/corporation-filter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirm } from '@/components/ui/confirm-dialog';
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
    risks_generating: boolean;
}

const levelColors = (level: string): { color: string; bg: string } => ({
    critical: { color: '#e5484d', bg: 'color-mix(in srgb, #e5484d 12%, transparent)' },
    high:     { color: '#f76b15', bg: 'color-mix(in srgb, #f76b15 12%, transparent)' },
    medium:   { color: '#f5b929', bg: 'color-mix(in srgb, #f5b929 14%, transparent)' },
    low:      { color: '#46bd5f', bg: 'color-mix(in srgb, #46bd5f 12%, transparent)' },
}[level] ?? { color: 'var(--muted-foreground)', bg: 'color-mix(in srgb, var(--muted-foreground) 10%, transparent)' });

const statusColor = (status: string): string => ({
    open:         '#e5484d',
    in_progress:  'var(--primary)',
    under_review: 'var(--chart-2)',
    closed:       '#46bd5f',
}[status] ?? 'var(--muted-foreground)');

function AppetiteDot({ band }: { band: AppetiteBand }) {
    const color = band.band === 'escalated' ? '#e5484d' : band.band === 'review' ? '#f5b929' : '#46bd5f';
    return (
        <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] uppercase"
            style={{
                color,
                background: `color-mix(in srgb, ${color} 12%, transparent)`,
                letterSpacing: '0.18em',
            }}
        >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
            {band.label}
        </span>
    );
}

export default function RisksIndex({ risks, stats, riskExposure, filters, frameworks, appetite, risks_generating }: Props) {
    const { auth } = usePage<SharedProps>().props;

    // Poll for AI-generated risks while a GenerateAIRisksJob is in flight.
    // Stops the moment the server reports every non-compliant control has
    // its auto_generated risk (or the 10-minute staleness cap kicks in).
    useEffect(() => {
        if (!risks_generating) return;
        const tick = () => {
            if (document.hidden) return;
            router.reload({
                only: ['risks', 'stats', 'riskExposure', 'risks_generating'],
            });
        };
        const id = window.setInterval(tick, 8000);
        return () => window.clearInterval(id);
    }, [risks_generating]);
    const canEdit = auth.user.role === 'super_admin' || auth.user.role === 'admin' || auth.user.role === 'user';
    const confirm = useConfirm();

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
    const deleteRisk = async (id: number, title: string) => {
        const ok = await confirm({
            title: `Delete risk "${title}"?`,
            description: 'This cannot be undone.',
            confirmLabel: 'Delete',
            tone: 'destructive',
        });
        if (!ok) return;
        router.delete(route('risks.destroy', id));
    };

    const exposure = riskExposure.risk_exposure;

    return (
        <AdminLayout>
            <Head title="Risk Register" />
            <div className="space-y-6">
                <PageHeader title="Risk register" description="ISO/IEC 27005 — likelihood × impact management">
                    <div className="flex items-center gap-2">
                        <CorporationFilter />
                        {canEdit && (
                            <Link href={route('risks.create')}>
                                <Button className="gap-2">
                                    <Plus className="h-3.5 w-3.5" /> New risk
                                </Button>
                            </Link>
                        )}
                    </div>
                </PageHeader>

                <StatStrip stats={[
                    { label: 'Total',    value: stats.total,    tone: 'neutral' },
                    { label: 'Open',     value: stats.open,     tone: stats.open > 0 ? 'warn' : 'ok' },
                    { label: 'Critical', value: stats.critical, tone: stats.critical > 0 ? 'bad' : 'ok' },
                    { label: 'Overdue',  value: stats.overdue,  tone: stats.overdue > 0 ? 'bad' : 'ok' },
                    { label: 'Exposure', value: `${exposure}%`, tone: exposure > 50 ? 'bad' : exposure >= 20 ? 'warn' : 'ok', hint: `avg ${riskExposure.avg_risk_score}/25` },
                ]} />

                {risks_generating && (
                    <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        AI is analyzing controls — risks will appear here as they're generated.
                    </div>
                )}

                <FilterBar>
                    <div className="relative min-w-45 flex-1">
                        <Search className="absolute top-1/2 left-4 h-3.5 w-3.5 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                        <Input
                            placeholder="Search risks…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
                            className="h-9 pl-10 text-sm"
                        />
                    </div>
                    <Select value={status} onValueChange={(v) => { setStatus(v); applyFilters({ status: v === 'all' ? '' : v }); }}>
                        <SelectTrigger className="h-9 w-36 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In progress</SelectItem>
                            <SelectItem value="under_review">Under review</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={level} onValueChange={(v) => { setLevel(v); applyFilters({ level: v === 'all' ? '' : v }); }}>
                        <SelectTrigger className="h-9 w-32 text-sm"><SelectValue placeholder="Level" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All levels</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={category} onValueChange={(v) => { setCategory(v); applyFilters({ category: v === 'all' ? '' : v }); }}>
                        <SelectTrigger className="h-9 w-44 text-sm"><SelectValue placeholder="Category" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All categories</SelectItem>
                            {['Information Security','Operational','Compliance','Financial','Strategic','Technical','Human Resources','Third Party','Physical','Legal'].map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {frameworks.length > 0 && (
                        <Select value={framework} onValueChange={(v) => { setFramework(v); applyFilters({ framework: v === 'all' ? '' : v }); }}>
                            <SelectTrigger className="h-9 w-36 text-sm"><SelectValue placeholder="Framework" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All frameworks</SelectItem>
                                {frameworks.map((f) => <SelectItem key={f.id} value={f.short_name}>{f.short_name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                    <button
                        onClick={toggleHasPlan}
                        aria-pressed={hasPlan}
                        className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[12px] transition-colors"
                        style={hasPlan
                            ? { border: '1px solid var(--foreground)', background: 'var(--foreground)', color: 'var(--background)', fontWeight: 500 }
                            : { border: '1px solid var(--border)', color: 'var(--muted-foreground)' }
                        }
                    >
                        Has plan
                    </button>
                    {appetite && (
                        <button
                            onClick={toggleEscalatedOnly}
                            className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[12px] transition-colors"
                            style={escalatedOnly
                                ? { border: '1px solid color-mix(in srgb, #e5484d 35%, transparent)', background: 'color-mix(in srgb, #e5484d 8%, transparent)', color: '#e5484d' }
                                : { border: '1px solid var(--border)', color: 'var(--muted-foreground)' }
                            }
                        >
                            <Sliders className="h-3 w-3" /> Escalated
                        </button>
                    )}
                    <Button size="sm" variant="ghost" className="h-9" onClick={() => applyFilters({ search })}>
                        Search
                    </Button>
                </FilterBar>

                <Card>
                    <CardHeader className="flex-row items-center justify-between pb-0">
                        <CardTitle className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                            <span className="text-base" style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                                {risks.total}
                            </span>{' '}
                            risk{risks.total !== 1 ? 's' : ''}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="mt-4 p-0">
                        <div className="relative">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                <thead style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'color-mix(in srgb, var(--muted) 50%, transparent)' }}>
                                    <tr>
                                        {['Risk','Category','Owner','Score','Level',...(appetite ? ['Appetite'] : []),'Status','Treatment','Due',''].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.22em' }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {risks.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={appetite ? 10 : 9} className="px-4 py-12 text-center">
                                                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                                                    No risks found.{' '}
                                                    <Link href={route('risks.create')} className="underline-offset-4 hover:underline" style={{ color: 'var(--primary)' }}>
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
                                                    style={{ borderBottom: '1px solid color-mix(in srgb, var(--border) 60%, transparent)' }}
                                                    onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--primary) 5%, transparent)')}
                                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                                >
                                                    <td className="max-w-60 px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <p className="truncate text-sm" style={{ color: 'var(--foreground)', fontWeight: 500 }}>{risk.title}</p>
                                                            {risk.auto_generated === 1 && (
                                                                <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] uppercase" style={{ color: 'var(--primary)', background: 'color-mix(in srgb, var(--primary) 10%, transparent)', letterSpacing: '0.18em' }}>
                                                                    <Sparkles className="h-2.5 w-2.5" /> AI
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="mt-0.5 flex items-center gap-2">
                                                            <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{risk.user?.name}</span>
                                                            {risk.framework_name && (
                                                                <span className="text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.18em', opacity: 0.7 }}>{risk.framework_name}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>{risk.category}</td>
                                                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>{risk.owner}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-base tabular-nums" style={{ color: 'var(--primary)', fontWeight: 500, letterSpacing: '-0.01em' }}>{score}</span>
                                                        <span className="text-[11px] ml-0.5" style={{ color: 'var(--muted-foreground)' }}>/25</span>
                                                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{risk.likelihood}×{risk.impact}</p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] uppercase"
                                                            style={{ color: lc.color, background: lc.bg, letterSpacing: '0.18em' }}
                                                        >
                                                            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: lc.color }} />
                                                            {risk.risk_level}
                                                        </span>
                                                    </td>
                                                    {appetite && (
                                                        <td className="px-4 py-3">
                                                            {risk.appetite_band ? <AppetiteDot band={risk.appetite_band} /> : <span style={{ color: 'var(--muted-foreground)' }}>—</span>}
                                                        </td>
                                                    )}
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] uppercase capitalize" style={{ color: statusColor(risk.status), border: `1px solid color-mix(in srgb, ${statusColor(risk.status)} 25%, transparent)`, letterSpacing: '0.18em' }}>
                                                            {risk.status.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm capitalize" style={{ color: 'var(--muted-foreground)' }}>{risk.treatment}</td>
                                                    <td className="px-4 py-3 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                                                        {risk.due_date ? new Date(risk.due_date).toLocaleDateString() : '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1">
                                                            <Link href={route('risks.show', risk.id)}>
                                                                <button className="rounded-full p-2 transition-colors" style={{ color: 'var(--muted-foreground)' }}
                                                                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'color-mix(in srgb, var(--primary) 8%, transparent)'; }}
                                                                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted-foreground)'; e.currentTarget.style.background = 'transparent'; }}
                                                                >
                                                                    <Eye className="h-3.5 w-3.5" />
                                                                </button>
                                                            </Link>
                                                            {canEdit && (
                                                                <Link href={route('risks.edit', risk.id)}>
                                                                    <button className="rounded-full p-2 transition-colors" style={{ color: 'var(--muted-foreground)' }}
                                                                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'color-mix(in srgb, var(--primary) 8%, transparent)'; }}
                                                                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted-foreground)'; e.currentTarget.style.background = 'transparent'; }}
                                                                    >
                                                                        <Pencil className="h-3.5 w-3.5" />
                                                                    </button>
                                                                </Link>
                                                            )}
                                                            {canEdit && (
                                                                <button
                                                                    className="rounded-full p-2 transition-colors" style={{ color: 'var(--muted-foreground)' }}
                                                                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--destructive)'; e.currentTarget.style.background = 'color-mix(in srgb, var(--destructive) 8%, transparent)'; }}
                                                                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted-foreground)'; e.currentTarget.style.background = 'transparent'; }}
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
                            {/* Right-edge scroll-shadow — visible only on mobile to hint
                                that the table is horizontally scrollable. */}
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:hidden"
                                style={{
                                    background:
                                        'linear-gradient(to right, transparent, var(--card) 85%)',
                                }}
                            />
                        </div>
                        {risks.links.length > 3 && (
                            <div className="flex items-center justify-center gap-1 p-4" style={{ borderTop: '1px solid var(--border)' }}>
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
