import { Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    ArrowUpRight,
    FileText,
    Plus,
    Sparkles,
    Upload,
    Zap,
} from 'lucide-react';
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
import { RecentAlerts } from '@/components/admin/recent-alerts';
import { RiskHeatmap } from '@/components/admin/risk-heatmap';
import { RiskTrendChart } from '@/components/admin/risk-trend-chart';
import { TopRisks } from '@/components/admin/top-risks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import type { SharedProps } from '@/types';

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
    neutral: 'var(--muted-foreground)', ok: 'var(--chart-1)', warn: 'var(--border)', bad: 'var(--destructive)',
};

function StatTiles({ tiles }: { tiles: StatTile[] }) {
    return (
        <div
            className="grid grid-cols-2 overflow-hidden rounded-2xl md:grid-cols-3 lg:grid-cols-5"
            style={{
                borderColor: 'var(--border)',
                borderWidth: '1px',
                gap: '1px',
                background: 'var(--border)',
                boxShadow: '0 10px 30px -16px color-mix(in srgb, var(--foreground) 18%, transparent)',
            }}
        >
            {tiles.map((t) => {
                const dot = toneCol[t.tone ?? 'neutral'];
                const p   = t.progress ?? null;
                return (
                    <div key={t.label} className="relative flex flex-col justify-between px-5 py-5 bg-card" style={{ minHeight: '110px' }}>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />
                            <p className="text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>{t.label}</p>
                        </div>
                        <div className="mt-3">
                            <p className="text-3xl tabular-nums leading-none" style={{ color: 'var(--foreground)', fontWeight: 500, letterSpacing: '-0.02em' }}>{t.value}</p>
                            {p !== null && (
                                <div className="mt-3 h-1 w-full overflow-hidden rounded-full" style={{ background: 'color-mix(in srgb, var(--border) 60%, transparent)' }}>
                                    <div className="h-full rounded-full" style={{ width: `${Math.min(p, 100)}%`, background: dot, transition: 'width 0.5s ease' }} />
                                </div>
                            )}
                            {t.hint && <p className="mt-2 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{t.hint}</p>}
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
    A: 'var(--chart-1)', B: 'var(--primary)', C: 'var(--border)', D: 'var(--border)', F: 'var(--destructive)',
};

function DashboardHero({ healthScore }: { healthScore: HealthScore }) {
    const gradeC = gradeColor[healthScore.grade] ?? gradeColor.F;
    return (
        <div
            className="relative overflow-hidden rounded-2xl"
            style={{
                // Diagonal brand gradient base — primary → card → chart-2, low alpha so foreground stays readable.
                background:
                    'linear-gradient(135deg, ' +
                    'color-mix(in srgb, var(--primary) 14%, var(--card)) 0%, ' +
                    'var(--card) 45%, ' +
                    'color-mix(in srgb, var(--chart-2) 10%, var(--card)) 100%)',
                border: '1px solid var(--border)',
                boxShadow: '0 24px 60px -28px color-mix(in srgb, var(--foreground) 22%, transparent), 0 8px 22px -10px color-mix(in srgb, var(--foreground) 10%, transparent)',
            }}
        >
            {/* Atmospheric radial halos on top of the diagonal gradient */}
            <div
                className="pointer-events-none absolute inset-0"
                aria-hidden
                style={{
                    background:
                        'radial-gradient(70% 70% at 92% -10%, color-mix(in srgb, var(--primary) 22%, transparent), transparent 65%),' +
                        'radial-gradient(55% 55% at -5% 110%, color-mix(in srgb, var(--chart-2) 14%, transparent), transparent 70%),' +
                        'radial-gradient(40% 40% at 50% 50%, color-mix(in srgb, var(--chart-3) 6%, transparent), transparent 78%)',
                }}
            />

            {/* Subtle grid texture (matches the page grid) clipped to the hero */}
            <div
                className="pointer-events-none absolute inset-0 opacity-60"
                aria-hidden
                style={{
                    backgroundImage:
                        'linear-gradient(color-mix(in srgb, var(--foreground) 4%, transparent) 1px, transparent 1px),' +
                        'linear-gradient(90deg, color-mix(in srgb, var(--foreground) 4%, transparent) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                    maskImage: 'radial-gradient(ellipse at 50% 0%, #000 25%, transparent 75%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at 50% 0%, #000 25%, transparent 75%)',
                }}
            />

            <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-8">
                <div className="space-y-3">
                    <p
                        className="text-[11px] uppercase"
                        style={{ color: 'var(--primary)', letterSpacing: '0.4em' }}
                    >
                        Overview · GRC Command Centre
                    </p>
                    <h1
                        className="text-4xl tracking-[-0.02em] md:text-5xl"
                        style={{ color: 'var(--foreground)', fontWeight: 500, lineHeight: 1.05 }}
                    >
                        Good to see you{' '}
                        <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>back.</span>
                    </h1>
                    <p
                        className="max-w-md text-base leading-relaxed"
                        style={{ color: 'var(--muted-foreground)' }}
                    >
                        Live view of your risks, controls, and compliance posture.
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] uppercase mb-1" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
                            Health
                        </p>
                        <p
                            className="text-6xl leading-none"
                            style={{
                                color: gradeC,
                                fontWeight: 500,
                                letterSpacing: '0',
                                // Optical right-edge alignment: F has open right side,
                                // shift it left so visual mass aligns with the other rows.
                                marginRight: '0.18em',
                            }}
                        >
                            {healthScore.grade}
                        </p>
                        <p className="mt-2 text-[10px] uppercase tabular-nums" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.22em' }}>
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
        { href: '/risks/create',        label: 'New risk',         icon: Plus,     primary: true  },
        { href: '/assessments/create',  label: 'Start assessment', icon: Sparkles, primary: false },
        { href: '/evidence/upload',     label: 'Upload evidence',  icon: Upload,   primary: false },
        { href: '/reports',             label: 'Reports',          icon: FileText, primary: false },
    ];
    return (
        <div className="flex flex-wrap items-center gap-2.5">
            {actions.map(a => (
                <Link
                    key={a.label}
                    href={a.href}
                    className="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all duration-200"
                    style={a.primary
                        ? { background: 'var(--primary)', color: 'var(--primary-foreground)', border: '1px solid transparent', fontWeight: 500, boxShadow: '0 10px 30px -16px color-mix(in srgb, var(--foreground) 28%, transparent)' }
                        : { background: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--border)', fontWeight: 400 }
                    }
                    onMouseEnter={e => {
                        if (a.primary) {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.filter = 'brightness(1.08)';
                        } else {
                            e.currentTarget.style.borderColor = 'var(--foreground)';
                        }
                    }}
                    onMouseLeave={e => {
                        if (a.primary) {
                            e.currentTarget.style.transform = '';
                            e.currentTarget.style.filter = '';
                        } else {
                            e.currentTarget.style.borderColor = 'var(--border)';
                        }
                    }}
                >
                    <a.icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.6} />
                    {a.label}
                </Link>
            ))}
        </div>
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
                <CardTitle className="text-lg" style={{ fontWeight: 500 }}>Health breakdown</CardTitle>
                <p className="text-xs" style={{ color: themeColors.muted }}>
                    {healthScore.raw.compliance_basis === 'evidence' ? 'Evidence-weighted' : 'Self-assessed'} · 100 pts total
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {components.map((c) => {
                    const pct  = (c.value / c.max) * 100;
                    const barC = pct >= 70 ? '#46bd5f' : pct >= 40 ? '#f5b929' : '#e5484d';
                    return (
                        <div key={c.label}>
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.22em' }}>{c.label}</span>
                                <span className="text-sm tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                                    {c.value}<span style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}>/{c.max}</span>
                                </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'color-mix(in srgb, var(--border) 70%, transparent)' }}>
                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barC, transition: 'width 0.5s ease' }} />
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
            <div
                className="flex flex-wrap items-center gap-3 rounded-2xl px-5 py-3"
                style={{ border: '1px solid var(--border)', background: 'var(--card)' }}
            >
                <span className="text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
                    KRI trends
                </span>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Trends appear after the first few nightly snapshots.
                </span>
            </div>
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
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        borderWidth: '1px',
        borderRadius: '12px',
        fontSize: '11px',
        padding: '8px 12px',
        color: 'var(--foreground)',
        boxShadow: '0 18px 40px -18px color-mix(in srgb, var(--foreground) 28%, transparent)',
    };

    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg" style={{ fontWeight: 500 }}>
                        Compliance trend
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
                                stroke="var(--border)"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
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
                                stroke="var(--chart-1)"
                                strokeWidth={1.5}
                                dot={{ r: 2, fill: 'var(--chart-1)' }}
                                activeDot={{ r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg" style={{ fontWeight: 500 }}>
                        Open risks distribution
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
                                stroke="var(--border)"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10, fill: themeColors.muted }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                allowDecimals={false}
                                tick={{ fontSize: 10, fill: themeColors.muted }}
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
                                fill="var(--destructive)"
                            />
                            <Bar
                                dataKey="high"
                                name="High"
                                stackId="a"
                                fill="var(--chart-5)"
                            />
                            <Bar
                                dataKey="medium"
                                name="Medium"
                                stackId="a"
                                fill="var(--chart-4)"
                            />
                            <Bar
                                dataKey="low"
                                name="Low"
                                stackId="a"
                                fill="var(--chart-1)"
                                radius={[2, 2, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}

const themeColors = {
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    card:        'var(--card)',
    primary:     'var(--primary)',
    border:      'var(--border)',
    destructive: 'var(--destructive)',
    success:     'var(--chart-1)',
    muted:       'var(--muted-foreground)',
};

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
            <div className="space-y-4">
                <DashboardHero healthScore={healthScore} />

                {/* Notification strip */}
                {unreadCount > 0 && (
                    <Link
                        href="/notifications"
                        className="group flex items-center gap-3 rounded-full px-5 py-3 transition-all duration-200"
                        style={{
                            borderColor: hasCritical ? 'color-mix(in srgb, var(--destructive) 30%, transparent)' : 'color-mix(in srgb, var(--primary) 25%, transparent)',
                            borderWidth: '1px',
                            background: hasCritical ? 'color-mix(in srgb, var(--destructive) 6%, transparent)' : 'color-mix(in srgb, var(--primary) 5%, transparent)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = hasCritical ? 'color-mix(in srgb, var(--destructive) 12%, transparent)' : 'color-mix(in srgb, var(--primary) 10%, transparent)')}
                        onMouseLeave={e => (e.currentTarget.style.background = hasCritical ? 'color-mix(in srgb, var(--destructive) 6%, transparent)' : 'color-mix(in srgb, var(--primary) 5%, transparent)')}
                    >
                        <span className="inline-flex h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: hasCritical ? 'var(--destructive)' : 'var(--primary)' }} />
                        <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: hasCritical ? 'var(--destructive)' : 'var(--primary)' }} />
                        <p className="min-w-0 flex-1 text-sm" style={{ color: 'var(--foreground)' }}>
                            <span style={{ fontWeight: 500 }}>{unreadCount} item{unreadCount > 1 ? 's' : ''}</span>
                            <span style={{ color: 'var(--muted-foreground)' }}> require your attention</span>
                        </p>
                        <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: themeColors.muted }} />
                    </Link>
                )}

                <ActionStrip />

                <StatTiles tiles={tiles} />

                {/* Risk appetite — minimal */}
                {appetiteCounts && (
                    <Link href="/risk-appetite" className="group flex flex-wrap items-center gap-3 rounded-2xl px-5 py-3 transition-all duration-200"
                        style={{ border: '1px solid var(--border)', background: 'var(--card)' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--foreground)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                    >
                        <span className="text-[10px] uppercase" style={{ color: themeColors.muted, letterSpacing: '0.28em' }}>{appetiteCounts.name}</span>
                        <span className="flex flex-wrap items-center gap-2">
                            {appetiteCounts.escalated > 0 && (
                                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] uppercase" style={{ color: '#e5484d', background: 'color-mix(in srgb, #e5484d 10%, transparent)', letterSpacing: '0.18em' }}>
                                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#e5484d' }} />
                                    {appetiteCounts.escalated} {appetiteCounts.labels.escalated}
                                </span>
                            )}
                            {appetiteCounts.review > 0 && (
                                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] uppercase" style={{ color: '#f5b929', background: 'color-mix(in srgb, #f5b929 10%, transparent)', letterSpacing: '0.18em' }}>
                                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#f5b929' }} />
                                    {appetiteCounts.review} {appetiteCounts.labels.review}
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] uppercase" style={{ color: '#46bd5f', background: 'color-mix(in srgb, #46bd5f 10%, transparent)', letterSpacing: '0.18em' }}>
                                <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#46bd5f' }} />
                                {appetiteCounts.acceptable} {appetiteCounts.labels.acceptable}
                            </span>
                        </span>
                        <span className="ml-auto flex items-center gap-1 text-[10px] uppercase transition-colors duration-200" style={{ color: themeColors.muted, letterSpacing: '0.22em' }}>
                            Configure <ArrowRight className="h-3 w-3" />
                        </span>
                    </Link>
                )}

                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="animate-in slide-in-from-bottom-4 lg:col-span-2">
                        <RiskHeatmap risks={heatmap} />
                    </div>
                    <div className="animate-in slide-in-from-bottom-4" style={{ animationDelay: '100ms' }}>
                        <HealthBreakdown healthScore={healthScore} />
                    </div>
                </div>

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

                <div
                    className="animate-in slide-in-from-bottom-4 flex flex-wrap items-center gap-3 rounded-2xl px-5 py-3"
                    style={{
                        animationDelay: '500ms',
                        border: '1px solid var(--border)',
                        background: 'var(--card)',
                    }}
                >
                    <Zap className="h-4 w-4 shrink-0" style={{ color: themeColors.primary }} strokeWidth={1.5} />
                    <span className="text-[10px] uppercase" style={{ color: themeColors.muted, letterSpacing: '0.28em' }}>
                        Rule adjustments
                    </span>
                    <span className="text-base tabular-nums" style={{ color: themeColors.foreground, fontWeight: 500, letterSpacing: '-0.01em' }}>
                        {ruleAdjustments}
                    </span>
                    <span className="text-xs" style={{ color: themeColors.muted }}>
                        risk score{ruleAdjustments !== 1 ? 's' : ''} auto-adjusted by compliance rules · last 30 days
                    </span>
                </div>

                <TopRisks risks={recentRisks} />

                {/* Footer note */}
                <div className="pb-4 text-center space-y-2">
                    <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--border) 30%, var(--border) 70%, transparent)', opacity: 0.5 }} />
                    <p className="text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', opacity: 0.5, letterSpacing: '0.32em' }}>
                        Nightly checks · 02:00 · last run {lastSchedulerRun ?? 'never'}
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
}
