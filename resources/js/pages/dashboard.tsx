import { ComplianceChart } from '@/components/admin/compliance-chart';
import { RecentAlerts } from '@/components/admin/recent-alerts';
import { RiskHeatmap } from '@/components/admin/risk-heatmap';
import { RiskTrendChart } from '@/components/admin/risk-trend-chart';
import { TopRisks } from '@/components/admin/top-risks';
import {
    ScrollFocusMode,
    FocusScrollWrapper,
} from '@/components/ui/scroll-focus-mode';
import AdminLayout from '@/layouts/admin-layout';
import { Link, usePage } from '@inertiajs/react';
import type { SharedProps } from '@/types';
import {
    AlertTriangle,
    ArrowRight,
    ArrowUpRight,
    FileText,
    Loader2,
    Plus,
    Sparkles,
    Upload,
    XCircle,
    Zap,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { downloadPdf } from '@/lib/download-pdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

type Stats = {
    total_risks: number;
    critical_risks: number;
    high_risks: number;
    medium_risks: number;
    low_risks: number;
    open_risks: number;
    compliance_score: number;
    total_assessments: number;
    evidence_files: number;
    pending_evidence: number;
};

type Risk = {
    id: number;
    title: string;
    category: string;
    owner: string;
    impact: number;
    likelihood: number;
    risk_level: string;
    risk_score: number;
    status: string;
};

type HeatmapRisk = {
    id: number;
    title: string;
    likelihood: number;
    impact: number;
    score: number;
    status: string;
};

type Kpis = {
    risk_exposure: number;
    avg_risk_score: number;
    evidence_approval_rate: number;
    open_risks_by_level: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    assessments_due_soon: number;
    pending_evidence: number;
    compliance_this_week: number;
    compliance_last_week: number;
    evidence_weighted_compliance: number | null;
};

type NotificationItem = { id: number; type: string; is_read: boolean };

type KriSnapshot = {
    snapshot_date: string;
    compliance_percentage: number;
    open_risks_critical: number;
    open_risks_high: number;
    open_risks_medium: number;
    open_risks_low: number;
    overdue_risks: number;
    overdue_assessments: number;
    evidence_approval_rate: number;
    ai_generated_risks: number;
    total_risks: number;
    total_controls: number;
    compliant_controls: number;
};

type HealthScore = {
    health_score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    components: {
        compliance: number;
        critical_risks: number;
        evidence_quality: number;
        overdue_items: number;
        open_risks: number;
    };
    raw: {
        critical_risks: number;
        open_risks: number;
        overdue_items: number;
        approval_rate: number;
        compliance_basis: 'evidence' | 'self_assessed';
    };
};

type AppetiteCounts = {
    name: string;
    escalated: number;
    review: number;
    acceptable: number;
    labels: { escalated: string; review: string; acceptable: string };
};

type Props = {
    stats: Stats;
    recentRisks: Risk[];
    recentActivity: any[];
    trendData: any[];
    heatmap: HeatmapRisk[];
    kpis: Kpis;
    ruleAdjustments: number;
    lastSchedulerRun: string | null;
    kriSnapshots: KriSnapshot[];
    healthScore: HealthScore;
    appetiteCounts: AppetiteCounts | null;
};

// -----------------------------------------------------------------------
// Unified stat tile — replaces both MetricsCards and KpiCards clutter
// -----------------------------------------------------------------------

type StatTile = {
    label: string;
    value: string;
    hint?: string;
    tone?: 'neutral' | 'ok' | 'warn' | 'bad';
    trend?: { value: number; unit?: string } | null;
    progress?: number | null;
};

const toneCol: Record<string, string> = {
    neutral: '#9C8B7A', ok: '#8B9E6B', warn: '#B07840', bad: '#8B2635',
};

function StatTiles({ tiles }: { tiles: StatTile[] }) {
    return (
        <div
            className="grid grid-cols-2 overflow-hidden rounded md:grid-cols-3 lg:grid-cols-5"
            style={{ border: '1px solid #4A3F35', gap: '1px', background: '#4A3F35' }}
        >
            {tiles.map((t, i) => {
                const dot = toneCol[t.tone ?? 'neutral'];
                const p   = t.progress ?? null;
                return (
                    <div key={t.label} className="relative flex flex-col justify-between px-5 py-4" style={{ background: '#251E19', minHeight: '100px' }}>
                        {i === 0 && <div className="absolute left-0 top-3 bottom-3 w-px" style={{ background: '#C9A962', opacity: 0.6 }} />}
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />
                            <p className="font-display text-[9px] uppercase tracking-[0.2em]" style={{ color: '#9C8B7A' }}>{t.label}</p>
                        </div>
                        <div className="mt-2">
                            <p className="font-heading text-3xl font-normal tabular-nums leading-none" style={{ color: '#E8DFD4' }}>{t.value}</p>
                            {p !== null && (
                                <div className="mt-2 h-px w-full overflow-hidden" style={{ background: '#4A3F35' }}>
                                    <div className="h-full" style={{ width: `${Math.min(p, 100)}%`, background: dot, transition: 'width 0.5s ease' }} />
                                </div>
                            )}
                            {t.hint && <p className="mt-1.5 font-body text-[11px] italic" style={{ color: '#9C8B7A' }}>{t.hint}</p>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// -----------------------------------------------------------------------
// Hero — page header + grade + quick actions
// -----------------------------------------------------------------------

const gradeColor: Record<string, string> = {
    A: '#8B9E6B', B: '#C9A962', C: '#B07840', D: '#B07840', F: '#8B2635',
};

function DashboardHero({ healthScore }: { healthScore: HealthScore }) {
    const gradeC = gradeColor[healthScore.grade] ?? gradeColor.F;
    return (
        <div
            className="relative overflow-hidden rounded ornate-frame"
            style={{ background: '#251E19', border: '1px solid #4A3F35' }}
        >
            {/* Subtle warm grid */}
            <div className="absolute inset-0 opacity-20" aria-hidden style={{
                backgroundImage: 'linear-gradient(to right, #4A3F35 1px, transparent 1px), linear-gradient(to bottom, #4A3F35 1px, transparent 1px)',
                backgroundSize: '48px 48px',
            }} />
            <div className="absolute inset-0" aria-hidden style={{ background: 'linear-gradient(135deg, transparent 0%, rgba(28,23,20,0.7) 100%)' }} />

            <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-8">
                <div className="space-y-2">
                    <p className="font-display text-[9px] uppercase tracking-[0.3em]" style={{ color: '#C9A962' }}>
                        Overview · GRC Command Centre
                    </p>
                    <h1 className="font-heading text-4xl font-normal leading-tight md:text-5xl" style={{ color: '#E8DFD4' }}>
                        Good to see you back.
                    </h1>
                    <p className="max-w-md font-body italic text-base" style={{ color: '#9C8B7A' }}>
                        Live view of your risks, controls, and compliance posture.
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="font-display text-[9px] uppercase tracking-[0.25em] mb-1" style={{ color: '#9C8B7A' }}>Health</p>
                        <p className="font-heading text-6xl leading-none" style={{ color: gradeC }}>{healthScore.grade}</p>
                        <p className="mt-1 font-display text-[10px] uppercase tracking-wider tabular-nums" style={{ color: '#9C8B7A' }}>
                            {healthScore.health_score}/100
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------
// Quick action strip — minimal pill buttons
// -----------------------------------------------------------------------

function ActionStrip() {
    const actions = [
        { href: '/risks/create',        label: 'New Risk',         icon: Plus     },
        { href: '/assessments/create',  label: 'Start Assessment', icon: Sparkles },
        { href: '/evidence/upload',     label: 'Upload Evidence',  icon: Upload   },
        { href: '/reports',             label: 'Reports',          icon: FileText },
    ];
    return (
        <div className="flex flex-wrap items-center gap-2">
            {actions.map(a => (
                <Link
                    key={a.label}
                    href={a.href}
                    className="group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.14em] transition-all duration-200"
                    style={{ border: '1px solid #4A3F35', background: '#251E19', color: '#9C8B7A' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A962'; e.currentTarget.style.color = '#C9A962'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#4A3F35'; e.currentTarget.style.color = '#9C8B7A'; }}
                >
                    <a.icon className="h-3 w-3" strokeWidth={1.5} />
                    {a.label}
                </Link>
            ))}
        </div>
    );
}

// -----------------------------------------------------------------------
// Executive summary — restyled for Vercel aesthetic
// -----------------------------------------------------------------------

function ExecutiveSummaryCard() {
    const [generating, setGenerating] = useState(false);
    const [toast, setToast] = useState<{ type: 'error'; text: string } | null>(
        null,
    );

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(t);
    }, [toast]);

    const generate = async () => {
        if (generating) return;
        setGenerating(true);
        try {
            await downloadPdf(
                '/reports/executive-summary',
                `executive-summary-${new Date().toISOString().split('T')[0]}.pdf`,
            );
        } catch {
            setToast({ type: 'error', text: 'Failed to generate report.' });
        } finally {
            setGenerating(false);
        }
    };

    const cardBase: React.CSSProperties = { background: '#251E19', border: '1px solid #4A3F35', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.3s ease' };
    return (
        <>
            <div className="grid gap-3 md:grid-cols-2">
                <button
                    onClick={generate}
                    disabled={generating}
                    className="group relative text-left disabled:opacity-50 ornate-frame"
                    style={cardBase}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(201,169,98,0.5)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#4A3F35')}
                >
                    <div className="flex items-center gap-3 p-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded" style={{ border: '1px solid rgba(201,169,98,0.4)', background: 'rgba(201,169,98,0.08)' }}>
                            <Sparkles className="h-4 w-4" style={{ color: '#C9A962' }} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-heading text-base font-normal" style={{ color: '#E8DFD4' }}>AI Executive Summary</p>
                            <p className="font-body italic text-xs" style={{ color: '#9C8B7A' }}>Board-ready PDF with AI narrative</p>
                        </div>
                        {generating ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" style={{ color: '#9C8B7A' }} /> : <ArrowRight className="h-4 w-4 shrink-0 transition-all group-hover:translate-x-0.5" style={{ color: '#9C8B7A' }} />}
                    </div>
                </button>
                <Link href="/executive-dashboard" className="group relative ornate-frame" style={cardBase}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(201,169,98,0.5)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#4A3F35')}
                >
                    <div className="flex items-center gap-3 p-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded" style={{ border: '1px solid rgba(201,169,98,0.4)', background: 'rgba(201,169,98,0.08)' }}>
                            <FileText className="h-4 w-4" style={{ color: '#C9A962' }} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-heading text-base font-normal" style={{ color: '#E8DFD4' }}>Executive Dashboard</p>
                            <p className="font-body italic text-xs" style={{ color: '#9C8B7A' }}>Printable one-page compliance view</p>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 transition-all group-hover:translate-x-0.5" style={{ color: '#9C8B7A' }} />
                    </div>
                </Link>
            </div>
            {generating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(28,23,20,0.85)', backdropFilter: 'blur(8px)' }}>
                    <div className="mx-4 flex max-w-xs flex-col items-center gap-3 rounded p-6 ornate-frame" style={{ background: '#251E19', border: '1px solid #4A3F35' }}>
                        <Sparkles className="h-6 w-6 animate-pulse" style={{ color: '#C9A962' }} />
                        <p className="font-heading text-lg font-normal" style={{ color: '#E8DFD4' }}>Generating summary…</p>
                        <p className="text-center font-body italic text-sm" style={{ color: '#9C8B7A' }}>The AI is analysing your GRC data</p>
                    </div>
                </div>
            )}
            {toast && (
                <div className="fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded px-4 py-3 text-sm" style={{ background: '#251E19', border: '1px solid rgba(139,38,53,0.4)' }}>
                    <XCircle className="h-4 w-4 shrink-0" style={{ color: '#8B2635' }} />
                    <span className="font-body" style={{ color: '#E8DFD4' }}>{toast.text}</span>
                </div>
            )}
        </>
    );
}

// -----------------------------------------------------------------------
// Health breakdown — compact horizontal bars
// -----------------------------------------------------------------------

function HealthBreakdown({ healthScore }: { healthScore: HealthScore }) {
    const components = [
        {
            label: 'Compliance',
            value: healthScore.components.compliance,
            max: 40,
        },
        {
            label: 'Critical Risks',
            value: healthScore.components.critical_risks,
            max: 20,
        },
        {
            label: 'Evidence Quality',
            value: healthScore.components.evidence_quality,
            max: 20,
        },
        {
            label: 'Overdue Items',
            value: healthScore.components.overdue_items,
            max: 10,
        },
        {
            label: 'Open Risks',
            value: healthScore.components.open_risks,
            max: 10,
        },
    ];

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="font-heading text-lg font-normal">Health Breakdown</CardTitle>
                <p className="font-body italic text-xs" style={{ color: '#9C8B7A' }}>
                    {healthScore.raw.compliance_basis === 'evidence' ? 'Evidence-weighted' : 'Self-assessed'} · 100 pts total
                </p>
            </CardHeader>
            <CardContent className="space-y-3">
                {components.map((c) => {
                    const pct  = (c.value / c.max) * 100;
                    const barC = pct >= 70 ? '#8B9E6B' : pct >= 40 ? '#B07840' : '#8B2635';
                    return (
                        <div key={c.label}>
                            <div className="mb-1.5 flex items-center justify-between">
                                <span className="font-display text-[9px] uppercase tracking-[0.15em]" style={{ color: '#9C8B7A' }}>{c.label}</span>
                                <span className="font-heading text-sm tabular-nums" style={{ color: '#E8DFD4' }}>
                                    {c.value}<span style={{ color: '#9C8B7A', opacity: 0.5 }}>/{c.max}</span>
                                </span>
                            </div>
                            <div className="h-px w-full overflow-hidden" style={{ background: '#4A3F35' }}>
                                <div className="h-full" style={{ width: `${pct}%`, background: barC, transition: 'width 0.5s ease' }} />
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}

// -----------------------------------------------------------------------
// KRI trends — minimal dark charts
// -----------------------------------------------------------------------

function formatSnapshotDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

function KriTrends({ snapshots }: { snapshots: KriSnapshot[] }) {
    if (snapshots.length < 2) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="font-heading text-lg font-normal">
                        KRI Trends
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="py-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            Not enough data yet
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/70">
                            Trends appear after the first few nightly snapshots.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const chartData = snapshots.map((s) => ({
        date: formatSnapshotDate(s.snapshot_date),
        compliance: s.compliance_percentage,
        critical: s.open_risks_critical,
        high: s.open_risks_high,
        medium: s.open_risks_medium,
        low: s.open_risks_low,
    }));

    const tooltipStyle = {
        backgroundColor: '#251E19',
        border: '1px solid #4A3F35',
        borderRadius: '4px',
        fontSize: '11px',
        padding: '6px 10px',
        fontFamily: "'Crimson Pro', serif",
        color: '#E8DFD4',
    };

    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="font-heading text-lg font-normal">
                        Compliance Trend
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart
                            data={chartData}
                            margin={{ top: 5, right: 8, left: -16, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#4A3F35"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10, fill: '#9C8B7A', fontFamily: "'Cinzel', serif" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fontSize: 10, fill: '#9C8B7A', fontFamily: "'Cinzel', serif" }}
                                axisLine={false}
                                tickLine={false}
                                unit="%"
                            />
                            <Tooltip
                                contentStyle={tooltipStyle}
                                formatter={(v) => [`${v}%`, 'Compliance']}
                            />
                            <Line
                                type="monotone"
                                dataKey="compliance"
                                stroke="#34d399"
                                strokeWidth={1.5}
                                dot={{ r: 2, fill: '#34d399' }}
                                activeDot={{ r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="font-heading text-lg font-normal">
                        Open Risks Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart
                            data={chartData}
                            margin={{ top: 5, right: 8, left: -16, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#4A3F35"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10, fill: '#9C8B7A', fontFamily: "'Cinzel', serif" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                allowDecimals={false}
                                tick={{ fontSize: 10, fill: '#9C8B7A', fontFamily: "'Cinzel', serif" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend
                                wrapperStyle={{ fontSize: 10, paddingTop: 4 }}
                                iconType="circle"
                                iconSize={6}
                            />
                            <Bar
                                dataKey="critical"
                                name="Critical"
                                stackId="a"
                                fill="#ef4444"
                            />
                            <Bar
                                dataKey="high"
                                name="High"
                                stackId="a"
                                fill="#f97316"
                            />
                            <Bar
                                dataKey="medium"
                                name="Medium"
                                stackId="a"
                                fill="#eab308"
                            />
                            <Bar
                                dataKey="low"
                                name="Low"
                                stackId="a"
                                fill="#22c55e"
                                radius={[2, 2, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}

// -----------------------------------------------------------------------
// Main dashboard
// -----------------------------------------------------------------------

export default function AdminDashboard({
    stats,
    recentRisks,
    recentActivity,
    trendData,
    heatmap,
    kpis,
    ruleAdjustments,
    lastSchedulerRun,
    kriSnapshots,
    healthScore,
    appetiteCounts,
}: Props) {
    const { notifications } = usePage<SharedProps>().props;
    const unreadCount = notifications?.unread_count ?? 0;
    const recent: NotificationItem[] = notifications?.recent ?? [];

    const hasCritical = recent.some(
        (n) => n.type === 'critical_risk' || n.type === 'overdue_risk',
    );

    // Heatmap expansion state based on scroll position
    const [heatmapScale, setHeatmapScale] = useState(1);
    const heatmapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (!heatmapRef.current) return;

            const rect = heatmapRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Distance from center of viewport to center of element
            const elementCenter = rect.top + rect.height / 2;
            const viewportCenter = windowHeight / 2;
            const distance = Math.abs(elementCenter - viewportCenter);
            
            // Maximum distance (beyond which we don't expand)
            const maxDistance = windowHeight * 0.6;
            
            // Calculate scale: expands as element moves toward center
            if (distance < maxDistance) {
                const progress = 1 - (distance / maxDistance);
                const scale = 1 + progress * 0.6; // Expands to 1.6x
                setHeatmapScale(scale);
            } else {
                setHeatmapScale(1);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Call once on mount
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Unified stat tiles (merges MetricsCards + KpiCards into one bar)
    const tiles: StatTile[] = [
        {
            label: 'Risk Exposure',
            value: `${kpis.risk_exposure}%`,
            hint: `avg ${kpis.avg_risk_score}/25`,
            tone:
                kpis.risk_exposure > 50
                    ? 'bad'
                    : kpis.risk_exposure >= 20
                      ? 'warn'
                      : 'ok',
            progress: kpis.risk_exposure,
        },
        {
            label: 'Compliance',
            value:
                kpis.evidence_weighted_compliance !== null
                    ? `${kpis.evidence_weighted_compliance}%`
                    : `${stats.compliance_score}%`,
            hint:
                kpis.evidence_weighted_compliance !== null
                    ? 'evidence-backed'
                    : 'self-assessed',
            tone:
                (kpis.evidence_weighted_compliance ?? stats.compliance_score) >=
                70
                    ? 'ok'
                    : (kpis.evidence_weighted_compliance ??
                            stats.compliance_score) >= 40
                      ? 'warn'
                      : 'bad',
            progress:
                kpis.evidence_weighted_compliance ?? stats.compliance_score,
        },
        {
            label: 'Evidence Approved',
            value: `${kpis.evidence_approval_rate}%`,
            hint: `${kpis.pending_evidence} pending`,
            tone:
                kpis.evidence_approval_rate >= 70
                    ? 'ok'
                    : kpis.evidence_approval_rate >= 40
                      ? 'warn'
                      : 'bad',
            progress: kpis.evidence_approval_rate,
        },
        {
            label: 'Critical Risks',
            value: stats.critical_risks.toString(),
            hint: `${stats.open_risks} open total`,
            tone: stats.critical_risks > 0 ? 'bad' : 'ok',
        },
        {
            label: 'Due in 7d',
            value: kpis.assessments_due_soon.toString(),
            hint: 'assessments',
            tone: kpis.assessments_due_soon > 0 ? 'warn' : 'ok',
        },
    ];

    return (
        <AdminLayout>
            <ScrollFocusMode />
            <div className="space-y-6">
                <DashboardHero healthScore={healthScore} />

                {/* Notification strip */}
                {unreadCount > 0 && (
                    <Link
                        href="/notifications"
                        className="group flex items-center gap-3 rounded px-4 py-3 transition-all duration-200"
                        style={{ border: `1px solid ${hasCritical ? 'rgba(139,38,53,0.5)' : 'rgba(176,120,64,0.4)'}`, background: hasCritical ? 'rgba(139,38,53,0.08)' : 'rgba(176,120,64,0.06)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = hasCritical ? 'rgba(139,38,53,0.14)' : 'rgba(176,120,64,0.1)')}
                        onMouseLeave={e => (e.currentTarget.style.background = hasCritical ? 'rgba(139,38,53,0.08)' : 'rgba(176,120,64,0.06)')}
                    >
                        <span className="inline-flex h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: hasCritical ? '#8B2635' : '#B07840' }} />
                        <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: hasCritical ? '#8B2635' : '#B07840' }} />
                        <p className="min-w-0 flex-1 font-body text-sm" style={{ color: '#E8DFD4' }}>
                            <span style={{ fontWeight: 500 }}>{unreadCount} item{unreadCount > 1 ? 's' : ''}</span>
                            <span style={{ color: '#9C8B7A' }}> require your attention</span>
                        </p>
                        <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: '#9C8B7A' }} />
                    </Link>
                )}

                <ActionStrip />

                <StatTiles tiles={tiles} />

                {/* Risk appetite — minimal */}
                {appetiteCounts && (
                    <Link href="/risk-appetite" className="group flex items-center gap-3 rounded px-4 py-2.5 transition-all duration-200"
                        style={{ border: '1px solid #4A3F35', background: '#251E19' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(201,169,98,0.4)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = '#4A3F35')}
                    >
                        <span className="font-display text-[9px] uppercase tracking-[0.2em]" style={{ color: '#9C8B7A' }}>{appetiteCounts.name}</span>
                        <span className="flex items-center gap-3">
                            {appetiteCounts.escalated > 0 && (
                                <span className="inline-flex items-center gap-1 font-display text-[9px] uppercase tracking-wider" style={{ color: '#8B2635' }}>
                                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#8B2635' }} />
                                    {appetiteCounts.escalated} {appetiteCounts.labels.escalated}
                                </span>
                            )}
                            {appetiteCounts.review > 0 && (
                                <span className="inline-flex items-center gap-1 font-display text-[9px] uppercase tracking-wider" style={{ color: '#B07840' }}>
                                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#B07840' }} />
                                    {appetiteCounts.review} {appetiteCounts.labels.review}
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1 font-display text-[9px] uppercase tracking-wider" style={{ color: '#8B9E6B' }}>
                                <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#8B9E6B' }} />
                                {appetiteCounts.acceptable} {appetiteCounts.labels.acceptable}
                            </span>
                        </span>
                        <span className="ml-auto flex items-center gap-1 font-display text-[9px] uppercase tracking-wider transition-colors duration-200" style={{ color: '#9C8B7A' }}>
                            Configure <ArrowRight className="h-3 w-3" />
                        </span>
                    </Link>
                )}

                <ExecutiveSummaryCard />

                <FocusScrollWrapper className="grid gap-4 lg:grid-cols-3">
                    <div
                        ref={heatmapRef}
                        className="animate-in slide-in-from-bottom-4 lg:col-span-2 origin-center transition-transform duration-300 ease-out"
                        style={{
                            animationDelay: '0ms',
                            transform: `scaleX(${1 + (heatmapScale - 1) * 0.6}) scaleY(${1 - (heatmapScale - 1) * 0.4})`,
                        }}
                    >
                        <RiskHeatmap risks={heatmap} />
                    </div>
                    {heatmapScale < 1.15 && (
                        <div
                            className="animate-in slide-in-from-bottom-4 transition-opacity duration-300"
                            style={{
                                animationDelay: '100ms',
                                opacity: heatmapScale < 1.15 ? 1 : 0,
                                pointerEvents: heatmapScale < 1.15 ? 'auto' : 'none',
                            }}
                        >
                            <HealthBreakdown healthScore={healthScore} />
                        </div>
                    )}
                </FocusScrollWrapper>

                <div
                    className="animate-in slide-in-from-bottom-4"
                    style={{ animationDelay: '200ms' }}
                >
                    <KriTrends snapshots={kriSnapshots} />
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <div
                        className="animate-in slide-in-from-bottom-4 lg:col-span-2"
                        style={{ animationDelay: '300ms' }}
                    >
                        <RiskTrendChart trendData={trendData} />
                    </div>
                    <div
                        className="animate-in slide-in-from-bottom-4"
                        style={{ animationDelay: '400ms' }}
                    >
                        <RecentAlerts activity={recentActivity} />
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <div
                        className="animate-in slide-in-from-bottom-4"
                        style={{ animationDelay: '500ms' }}
                    >
                        <ComplianceChart score={stats.compliance_score} />
                    </div>
                    <div
                        className="animate-in slide-in-from-bottom-4"
                        style={{ animationDelay: '600ms' }}
                    >
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 font-heading text-lg font-normal">
                                    <Zap className="h-4 w-4" style={{ color: '#C9A962' }} strokeWidth={1.5} />
                                    Rule Adjustments
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-heading text-4xl font-normal tabular-nums" style={{ color: '#E8DFD4' }}>
                                    {ruleAdjustments}
                                </p>
                                <p className="mt-2 font-body italic text-sm" style={{ color: '#9C8B7A' }}>
                                    risk score{ruleAdjustments !== 1 ? 's' : ''} auto-adjusted by compliance rules in the last 30 days
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <TopRisks risks={recentRisks} />

                {/* Ornate footer */}
                <div className="pb-4 text-center space-y-2">
                    <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #4A3F35 30%, #4A3F35 70%, transparent)', opacity: 0.5 }} />
                    <p className="font-display text-[9px] uppercase tracking-[0.25em]" style={{ color: 'rgba(156,139,122,0.4)' }}>
                        Nightly checks · 02:00 · last run {lastSchedulerRun ?? 'never'}
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
}
