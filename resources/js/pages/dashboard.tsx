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
import { useState, useEffect } from 'react';
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

function StatTiles({ tiles }: { tiles: StatTile[] }) {
    const dot = (t?: StatTile['tone']) =>
        ({
            neutral: 'bg-foreground/30',
            ok: 'bg-emerald-400',
            warn: 'bg-amber-400',
            bad: 'bg-red-400',
        })[t ?? 'neutral'];

    return (
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3 lg:grid-cols-5">
            {tiles.map((t) => (
                <div
                    key={t.label}
                    className="flex min-h-[104px] flex-col justify-between bg-card px-5 py-4"
                >
                    <div className="flex items-center gap-1.5">
                        <span
                            className={`h-1 w-1 rounded-full ${dot(t.tone)}`}
                        />
                        <p className="text-[11px] font-medium tracking-tight text-muted-foreground uppercase">
                            {t.label}
                        </p>
                    </div>
                    <div className="mt-auto">
                        <p className="text-3xl leading-none font-semibold tracking-tight text-foreground tabular-nums">
                            {t.value}
                        </p>
                        {t.progress !== undefined && t.progress !== null && (
                            <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className={`h-full rounded-full ${ (t.progress ?? 0) >= 70 ? 'bg-emerald-400' : (t.progress ?? 0) >= 40 ? 'bg-amber-400' : 'bg-red-400' }`}
                                    style={{
                                        width: `${Math.min(t.progress ?? 0, 100)}%`,
                                    }}
                                />
                            </div>
                        )}
                        {t.hint && (
                            <p className="mt-2 text-[11px] text-muted-foreground/70">
                                {t.hint}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

// -----------------------------------------------------------------------
// Hero — page header + grade + quick actions
// -----------------------------------------------------------------------

const gradeAccent: Record<string, string> = {
    A: 'text-emerald-400',
    B: 'text-teal-400',
    C: 'text-amber-400',
    D: 'text-orange-400',
    F: 'text-red-400',
};

function DashboardHero({ healthScore }: { healthScore: HealthScore }) {
    const accent = gradeAccent[healthScore.grade] ?? gradeAccent.F;

    return (
        <div className="relative overflow-hidden rounded-xl border border-border bg-card">
            <div className="absolute inset-0 grid-bg opacity-40" aria-hidden />
            <div
                className="absolute inset-0 bg-linear-to-br from-background/0 via-background/60 to-background"
                aria-hidden
            />

            <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-8">
                <div className="space-y-1.5">
                    <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                        Overview
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                        Good to see you back.
                    </h1>
                    <p className="max-w-md text-sm text-muted-foreground">
                        Live view of your risks, controls, and compliance
                        posture.
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                            Health
                        </p>
                        <p
                            className={`text-5xl leading-none font-semibold tabular-nums ${accent}`}
                        >
                            {healthScore.grade}
                        </p>
                        <p className="mt-1 font-mono text-[11px] text-muted-foreground tabular-nums">
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
        { href: '/risks/create', label: 'New risk', icon: Plus },
        {
            href: '/assessments/create',
            label: 'Start assessment',
            icon: Sparkles,
        },
        { href: '/evidence/upload', label: 'Upload evidence', icon: Upload },
        { href: '/reports', label: 'Reports', icon: FileText },
    ];
    return (
        <div className="flex flex-wrap items-center gap-2">
            {actions.map((a) => (
                <Link
                    key={a.label}
                    href={a.href}
                    className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:border-foreground/30 hover:text-foreground"
                >
                    <a.icon className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-foreground" />
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

    return (
        <>
            <div className="grid gap-3 md:grid-cols-2">
                <button
                    onClick={generate}
                    disabled={generating}
                    className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-foreground/20 disabled:opacity-60"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                            <Sparkles className="h-4 w-4 text-foreground/80" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">
                                AI Executive Summary
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Board-ready PDF with AI narrative
                            </p>
                        </div>
                        {generating ? (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                        ) : (
                            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
                        )}
                    </div>
                </button>
                <Link
                    href="/executive-dashboard"
                    className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                            <FileText className="h-4 w-4 text-foreground/80" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">
                                Executive Dashboard
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Printable one-page compliance view
                            </p>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </div>
                </Link>
            </div>

            {generating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="mx-4 flex max-w-xs flex-col items-center gap-3 rounded-xl border border-border bg-popover p-6">
                        <Sparkles className="h-6 w-6 animate-pulse text-foreground" />
                        <p className="text-sm font-medium text-foreground">
                            Generating summary…
                        </p>
                        <p className="text-center text-xs text-muted-foreground">
                            AI is analysing your GRC data
                        </p>
                    </div>
                </div>
            )}
            {toast && (
                <div className="fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-md border border-red-500/30 bg-popover px-4 py-3 text-sm">
                    <XCircle className="h-4 w-4 shrink-0 text-red-400" />
                    <span className="text-foreground">{toast.text}</span>
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
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                    Health Breakdown
                </CardTitle>
                <p className="text-[11px] text-muted-foreground">
                    {healthScore.raw.compliance_basis === 'evidence'
                        ? 'Evidence-weighted'
                        : 'Self-assessed'}{' '}
                    · 100 pts total
                </p>
            </CardHeader>
            <CardContent className="space-y-3">
                {components.map((c) => {
                    const pct = (c.value / c.max) * 100;
                    return (
                        <div key={c.label}>
                            <div className="mb-1 flex items-center justify-between text-xs">
                                <span className="text-foreground/80">
                                    {c.label}
                                </span>
                                <span className="font-mono text-muted-foreground tabular-nums">
                                    {c.value}
                                    <span className="opacity-40">/{c.max}</span>
                                </span>
                            </div>
                            <div className="h-1 overflow-hidden rounded-full bg-muted">
                                <div
                                    className={`h-full rounded-full ${ pct >= 70 ? 'bg-emerald-400/80' : pct >= 40 ? 'bg-amber-400/80' : 'bg-red-400/80' }`}
                                    style={{ width: `${pct}%` }}
                                />
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
                    <CardTitle className="text-sm font-medium">
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
        backgroundColor: 'oklch(0.06 0 0)',
        border: '1px solid oklch(0.18 0 0)',
        borderRadius: '6px',
        fontSize: '11px',
        padding: '6px 10px',
    };

    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
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
                                stroke="oklch(0.18 0 0)"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10, fill: '#71717a' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fontSize: 10, fill: '#71717a' }}
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
                    <CardTitle className="text-sm font-medium">
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
                                stroke="oklch(0.18 0 0)"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10, fill: '#71717a' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                allowDecimals={false}
                                tick={{ fontSize: 10, fill: '#71717a' }}
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

                {/* Consolidated notification strip */}
                {unreadCount > 0 && (
                    <Link
                        href="/notifications"
                        className="group flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-accent/40"
                    >
                        <span
                            className={`inline-flex h-1.5 w-1.5 rounded-full ${hasCritical ? 'bg-red-400' : 'bg-amber-400'} animate-pulse`}
                        />
                        <AlertTriangle
                            className={`h-4 w-4 shrink-0 ${hasCritical ? 'text-red-400' : 'text-amber-400'}`}
                        />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm text-foreground">
                                <span className="font-medium">
                                    {unreadCount} item
                                    {unreadCount > 1 ? 's' : ''}
                                </span>
                                <span className="text-muted-foreground">
                                    {' '}
                                    require your attention
                                </span>
                            </p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                    </Link>
                )}

                <ActionStrip />

                <StatTiles tiles={tiles} />

                {/* Risk appetite — minimal */}
                {appetiteCounts && (
                    <Link
                        href="/risk-appetite"
                        className="group flex items-center gap-3 text-xs"
                    >
                        <span className="font-mono tracking-wider text-muted-foreground uppercase">
                            {appetiteCounts.name}
                        </span>
                        <span className="flex items-center gap-2">
                            {appetiteCounts.escalated > 0 && (
                                <span className="inline-flex items-center gap-1 text-red-400">
                                    <span className="h-1 w-1 rounded-full bg-red-400" />
                                    {appetiteCounts.escalated}{' '}
                                    {appetiteCounts.labels.escalated}
                                </span>
                            )}
                            {appetiteCounts.review > 0 && (
                                <span className="inline-flex items-center gap-1 text-amber-400">
                                    <span className="h-1 w-1 rounded-full bg-amber-400" />
                                    {appetiteCounts.review}{' '}
                                    {appetiteCounts.labels.review}
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-emerald-400">
                                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                                {appetiteCounts.acceptable}{' '}
                                {appetiteCounts.labels.acceptable}
                            </span>
                        </span>
                        <span className="ml-auto flex items-center gap-1 text-muted-foreground transition-colors group-hover:text-foreground">
                            Configure <ArrowRight className="h-3 w-3" />
                        </span>
                    </Link>
                )}

                <ExecutiveSummaryCard />

                <FocusScrollWrapper className="grid gap-4 lg:grid-cols-3">
                    <div
                        className="animate-in slide-in-from-bottom-4 lg:col-span-2"
                        style={{ animationDelay: '0ms' }}
                    >
                        <RiskHeatmap risks={heatmap} />
                    </div>
                    <div
                        className="animate-in slide-in-from-bottom-4"
                        style={{ animationDelay: '100ms' }}
                    >
                        <HealthBreakdown healthScore={healthScore} />
                    </div>
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
                                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                    <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                                    Rule Adjustments
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-semibold tabular-nums">
                                    {ruleAdjustments}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    risk score{ruleAdjustments !== 1 ? 's' : ''}{' '}
                                    auto-adjusted by compliance rules in the
                                    last 30 days
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <TopRisks risks={recentRisks} />

                <p className="pb-2 text-center font-mono text-[11px] text-muted-foreground/50">
                    Nightly checks · 02:00 · last run{' '}
                    {lastSchedulerRun ?? 'never'}
                </p>
            </div>
        </AdminLayout>
    );
}
