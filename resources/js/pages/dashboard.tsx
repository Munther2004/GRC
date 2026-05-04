import { useGSAP } from '@gsap/react';
import { Link, usePage } from '@inertiajs/react';
import gsap from 'gsap';
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
import { useRef } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    DefaultLegendContent,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import type { LegendPayload } from 'recharts/types/component/DefaultLegendContent';
import type { NameType, Payload, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { RecentAlerts } from '@/components/admin/recent-alerts';
import { RiskHeatmap } from '@/components/admin/risk-heatmap';
import { RiskTrendChart } from '@/components/admin/risk-trend-chart';
import { TopRisks } from '@/components/admin/top-risks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import type { SharedProps } from '@/types';

gsap.registerPlugin(useGSAP);

// ── Types (props unchanged — backend contract preserved) ────────────────────

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
    open_risks_by_level: { critical: number; high: number; medium: number; low: number };
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

// ── Theme tokens (single source) ────────────────────────────────────────────

const tone = {
    fg: 'var(--foreground)',
    muted: 'var(--muted-foreground)',
    border: 'var(--border)',
    card: 'var(--card)',
    primary: 'var(--primary)',
    low: 'var(--severity-low)',
    medium: 'var(--severity-medium)',
    high: 'var(--severity-high)',
    critical: 'var(--severity-critical)',
} as const;

const gradeTone = (grade: string): string =>
    grade === 'A' ? tone.low :
    grade === 'B' ? tone.primary :
    grade === 'C' ? tone.medium :
    grade === 'D' ? tone.high :
    tone.critical;

const statusTone = (pct: number): string =>
    pct >= 70 ? tone.low : pct >= 40 ? tone.medium : tone.high;

// ── CountUp — small numeric reveal, respects reduced-motion ────────────────

function CountUp({
    value,
    suffix = '',
    decimals,
    className,
    style,
    duration = 1.2,
}: {
    value: number;
    suffix?: string;
    decimals?: number;
    className?: string;
    style?: React.CSSProperties;
    duration?: number;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    // Auto-detect decimals from the target when the caller doesn't specify,
    // so 15.5 stays 15.5 and 16 stays 16.
    const effectiveDecimals = decimals ?? (Number.isInteger(value) ? 0 : 1);

    useGSAP(
        () => {
            if (!ref.current) return;
            const reduced =
                typeof window !== 'undefined' &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (reduced) {
                ref.current.textContent = value.toFixed(effectiveDecimals) + suffix;
                return;
            }
            const obj = { v: 0 };
            gsap.to(obj, {
                v: value,
                duration,
                ease: 'power2.out',
                onUpdate: () => {
                    if (ref.current) {
                        ref.current.textContent =
                            obj.v.toFixed(effectiveDecimals) + suffix;
                    }
                },
            });
        },
        { dependencies: [value, effectiveDecimals, suffix, duration] },
    );

    const initial = (0).toFixed(effectiveDecimals) + suffix;
    return (
        <span ref={ref} className={className} style={style}>
            {initial}
        </span>
    );
}

// ── Hero — editorial greeting + compact posture micro-card ─────────────────

function DashboardHero({ healthScore }: { healthScore: HealthScore }) {
    const score = healthScore.health_score;
    const grade = healthScore.grade;
    const gColor = gradeTone(grade);

    return (
        <header
            className="dash-reveal relative overflow-hidden rounded-2xl"
            style={{
                background:
                    'linear-gradient(135deg, color-mix(in srgb, var(--primary) 9%, var(--card)) 0%, var(--card) 55%, color-mix(in srgb, var(--chart-2) 6%, var(--card)) 100%)',
                border: `1px solid ${tone.border}`,
            }}
        >
            {/* atmospheric halo on top-right */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(60% 80% at 95% -10%, color-mix(in srgb, var(--primary) 18%, transparent), transparent 65%),' +
                        'radial-gradient(40% 50% at -10% 110%, color-mix(in srgb, var(--chart-2) 10%, transparent), transparent 70%)',
                }}
            />

            <div className="relative grid gap-6 p-6 md:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)] md:items-end md:gap-10 md:p-8">
                {/* LEFT — editorial heading */}
                <div className="space-y-3">
                    <p
                        className="text-[10px] uppercase"
                        style={{ color: tone.primary, letterSpacing: '0.4em' }}
                    >
                        Overview · GRC Command Centre
                    </p>
                    <h1
                        className="text-4xl tracking-[-0.02em] md:text-[44px]"
                        style={{ color: tone.fg, fontWeight: 500, lineHeight: 1.05 }}
                    >
                        Good to see you{' '}
                        <span style={{ color: tone.primary, fontStyle: 'italic' }}>
                            back.
                        </span>
                    </h1>
                    <p
                        className="max-w-md text-sm leading-relaxed"
                        style={{ color: tone.muted }}
                    >
                        Live view of your risks, controls, and compliance posture.
                    </p>
                </div>

                {/* RIGHT — eyebrow + big letter + score beside it */}
                <div className="md:justify-self-end">
                    <p
                        className="text-[10px] uppercase"
                        style={{ color: tone.muted, letterSpacing: '0.32em' }}
                    >
                        Posture · Health
                    </p>
                    <div className="mt-2 flex items-end gap-4">
                        <span
                            aria-label={`Grade ${grade}`}
                            className="tabular-nums"
                            style={{
                                color: gColor,
                                fontSize: 'clamp(48px, 5vw, 60px)',
                                fontWeight: 500,
                                letterSpacing: '-0.06em',
                                lineHeight: 1,
                            }}
                        >
                            {grade}
                        </span>
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-baseline gap-1">
                                <CountUp
                                    value={score}
                                    className="text-xl tabular-nums"
                                    style={{
                                        color: tone.fg,
                                        fontWeight: 500,
                                        letterSpacing: '-0.02em',
                                        lineHeight: 1,
                                    }}
                                />
                                <span
                                    className="text-[11px] tabular-nums"
                                    style={{ color: tone.muted }}
                                >
                                    /100
                                </span>
                            </div>
                            <span
                                className="text-[9px] uppercase"
                                style={{
                                    color: tone.muted,
                                    letterSpacing: '0.28em',
                                    lineHeight: 1,
                                }}
                            >
                                Health score
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

// ── Action strip — pill buttons, used standalone or alongside notification ──

function ActionStrip() {
    const actions = [
        { href: '/risks/create', label: 'New risk', icon: Plus, primary: true },
        { href: '/assessments/create', label: 'Start assessment', icon: Sparkles, primary: false },
        { href: '/evidence/upload', label: 'Upload evidence', icon: Upload, primary: false },
        { href: '/reports', label: 'Reports', icon: FileText, primary: false },
    ];

    return (
        <div className="flex flex-wrap items-center gap-2">
            {actions.map((a) => (
                <Link
                    key={a.label}
                    href={a.href}
                    className="group inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm transition-all duration-200"
                    style={
                        a.primary
                            ? {
                                  background: tone.primary,
                                  color: 'var(--primary-foreground)',
                                  border: '1px solid transparent',
                                  fontWeight: 500,
                                  boxShadow:
                                      '0 8px 24px -14px color-mix(in srgb, var(--primary) 60%, transparent)',
                              }
                            : {
                                  background: tone.card,
                                  color: tone.fg,
                                  border: `1px solid ${tone.border}`,
                                  fontWeight: 400,
                              }
                    }
                    onMouseEnter={(e) => {
                        if (a.primary) {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.filter = 'brightness(1.07)';
                        } else {
                            e.currentTarget.style.borderColor = tone.fg;
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (a.primary) {
                            e.currentTarget.style.transform = '';
                            e.currentTarget.style.filter = '';
                        } else {
                            e.currentTarget.style.borderColor = tone.border;
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

// ── Notification banner ─────────────────────────────────────────────────────

function NotificationBanner({
    unreadCount,
    hasCritical,
}: {
    unreadCount: number;
    hasCritical: boolean;
}) {
    const accent = hasCritical ? tone.critical : tone.primary;
    return (
        <Link
            href="/notifications"
            className="group flex min-w-0 items-center gap-3 rounded-full px-4 py-2.5 transition-all duration-200"
            style={{
                border: `1px solid color-mix(in srgb, ${accent} 28%, transparent)`,
                background: `color-mix(in srgb, ${accent} 5%, transparent)`,
            }}
            onMouseEnter={(e) =>
                (e.currentTarget.style.background = `color-mix(in srgb, ${accent} 11%, transparent)`)
            }
            onMouseLeave={(e) =>
                (e.currentTarget.style.background = `color-mix(in srgb, ${accent} 5%, transparent)`)
            }
        >
            <span
                className="inline-flex h-1.5 w-1.5 shrink-0 animate-pulse rounded-full"
                style={{ background: accent }}
            />
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
            <p className="min-w-0 truncate text-sm" style={{ color: tone.fg }}>
                <span style={{ fontWeight: 500 }}>
                    {unreadCount} item{unreadCount > 1 ? 's' : ''}
                </span>
                <span style={{ color: tone.muted }}> require your attention</span>
            </p>
            <ArrowUpRight
                className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                style={{ color: tone.muted }}
            />
        </Link>
    );
}

// ── Stat tiles ──────────────────────────────────────────────────────────────

type StatTile = {
    label: string;
    value: number;
    suffix?: string;
    hint?: string;
    tone?: 'neutral' | 'ok' | 'warn' | 'bad';
    progress?: number | null;
    decimals?: number;
};

const tileDot: Record<string, string> = {
    neutral: tone.muted,
    ok: tone.low,
    warn: tone.medium,
    bad: tone.critical,
};

function StatTiles({ tiles }: { tiles: StatTile[] }) {
    return (
        <div
            className="dash-reveal grid grid-cols-2 overflow-hidden rounded-2xl md:grid-cols-3 lg:grid-cols-5"
            style={{
                border: `1px solid ${tone.border}`,
                gap: '1px',
                background: tone.border,
                boxShadow:
                    '0 10px 30px -16px color-mix(in srgb, var(--foreground) 14%, transparent)',
            }}
        >
            {tiles.map((t) => {
                const dot = tileDot[t.tone ?? 'neutral'];
                const p = t.progress ?? null;
                return (
                    <div
                        key={t.label}
                        className="relative flex flex-col justify-between bg-card px-5 py-5"
                        style={{ minHeight: '116px' }}
                    >
                        <div className="flex items-center gap-2">
                            <span
                                className="h-1.5 w-1.5 shrink-0 rounded-full"
                                style={{ background: dot }}
                            />
                            <p
                                className="text-[10px] uppercase"
                                style={{ color: tone.muted, letterSpacing: '0.28em' }}
                            >
                                {t.label}
                            </p>
                        </div>
                        <div className="mt-3">
                            <div
                                className="flex items-baseline gap-1 leading-none"
                                style={{
                                    color: tone.fg,
                                    fontWeight: 500,
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                <CountUp
                                    value={t.value}
                                    suffix={t.suffix ?? ''}
                                    decimals={t.decimals ?? 0}
                                    className="text-3xl tabular-nums"
                                />
                            </div>
                            {p !== null && (
                                <div
                                    className="mt-3 h-[3px] w-full overflow-hidden rounded-full"
                                    style={{
                                        background:
                                            'color-mix(in srgb, var(--border) 60%, transparent)',
                                    }}
                                >
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${Math.min(p, 100)}%`,
                                            background: dot,
                                            transition:
                                                'width 1.2s cubic-bezier(.2,.7,.2,1)',
                                        }}
                                    />
                                </div>
                            )}
                            {t.hint && (
                                <p
                                    className="mt-2 text-[11px]"
                                    style={{ color: tone.muted }}
                                >
                                    {t.hint}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ── Health breakdown — five labeled component bars ─────────────────────────

function HealthBreakdown({ healthScore }: { healthScore: HealthScore }) {
    const components = [
        { v: healthScore.components.compliance, m: 40, label: 'Compliance' },
        { v: healthScore.components.critical_risks, m: 20, label: 'Critical' },
        { v: healthScore.components.evidence_quality, m: 20, label: 'Evidence' },
        { v: healthScore.components.overdue_items, m: 10, label: 'Overdue' },
        { v: healthScore.components.open_risks, m: 10, label: 'Open risks' },
    ];

    return (
        <div
            className="dash-reveal rounded-2xl px-5 py-4"
            style={{
                border: `1px solid ${tone.border}`,
                background: tone.card,
            }}
        >
            <div className="mb-4 flex items-baseline justify-between gap-3">
                <p
                    className="text-[10px] uppercase"
                    style={{ color: tone.muted, letterSpacing: '0.32em' }}
                >
                    Health breakdown
                </p>
                <p
                    className="text-[10px] tabular-nums"
                    style={{ color: tone.muted, opacity: 0.7 }}
                >
                    {healthScore.health_score}/100 across five components
                </p>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
                {components.map((c) => {
                    const pct = (c.v / c.m) * 100;
                    const t = statusTone(pct);
                    return (
                        <div key={c.label} className="space-y-1.5">
                            <div className="flex items-baseline justify-between gap-2">
                                <span
                                    className="truncate text-[10px] uppercase"
                                    style={{
                                        color: tone.fg,
                                        letterSpacing: '0.18em',
                                    }}
                                >
                                    {c.label}
                                </span>
                                <span
                                    className="shrink-0 text-[11px] tabular-nums"
                                    style={{ color: tone.muted }}
                                >
                                    {c.v}/{c.m}
                                </span>
                            </div>
                            <div
                                className="h-[3px] rounded-full"
                                style={{
                                    background:
                                        'color-mix(in srgb, var(--border) 60%, transparent)',
                                }}
                            >
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${Math.max(4, Math.min(pct, 100))}%`,
                                        background: t,
                                        transition:
                                            'width 1s cubic-bezier(.2,.7,.2,1)',
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Posture strip (combines risk appetite + recap callout) ─────────────────

function PostureStrip({
    appetiteCounts,
    healthScore,
}: {
    appetiteCounts: AppetiteCounts | null;
    healthScore: HealthScore;
}) {
    const evidenceBasis = healthScore.raw.compliance_basis;
    return (
        <div className="dash-reveal grid gap-3 md:grid-cols-2">
            {/* Appetite — chips */}
            {appetiteCounts ? (
                <Link
                    href="/risk-appetite"
                    className="group flex min-h-[56px] flex-wrap items-center gap-2.5 rounded-2xl px-4 py-3 transition-all duration-200"
                    style={{
                        border: `1px solid ${tone.border}`,
                        background: tone.card,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = tone.fg)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = tone.border)}
                >
                    <span
                        className="text-[10px] uppercase"
                        style={{ color: tone.muted, letterSpacing: '0.28em' }}
                    >
                        {appetiteCounts.name}
                    </span>
                    <span className="flex flex-wrap items-center gap-1.5">
                        {appetiteCounts.escalated > 0 && (
                            <Chip
                                color={tone.critical}
                                label={`${appetiteCounts.escalated} ${appetiteCounts.labels.escalated}`}
                            />
                        )}
                        {appetiteCounts.review > 0 && (
                            <Chip
                                color={tone.medium}
                                label={`${appetiteCounts.review} ${appetiteCounts.labels.review}`}
                            />
                        )}
                        <Chip
                            color={tone.low}
                            label={`${appetiteCounts.acceptable} ${appetiteCounts.labels.acceptable}`}
                        />
                    </span>
                    <span
                        className="ml-auto inline-flex items-center gap-1 text-[10px] uppercase"
                        style={{ color: tone.muted, letterSpacing: '0.22em' }}
                    >
                        Configure <ArrowRight className="h-3 w-3" />
                    </span>
                </Link>
            ) : (
                <div
                    className="flex min-h-[56px] items-center gap-3 rounded-2xl px-4 py-3"
                    style={{
                        border: `1px solid ${tone.border}`,
                        background: tone.card,
                    }}
                >
                    <span
                        className="text-[10px] uppercase"
                        style={{ color: tone.muted, letterSpacing: '0.28em' }}
                    >
                        Risk Appetite
                    </span>
                    <span className="text-xs" style={{ color: tone.muted }}>
                        Not configured for this corporation.
                    </span>
                </div>
            )}

            {/* Compliance basis — shows whether evidence-backed or self-assessed */}
            <Link
                href="/executive-dashboard"
                className="group flex min-h-[56px] items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200"
                style={{
                    border: `1px solid ${tone.border}`,
                    background: tone.card,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = tone.fg)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = tone.border)}
            >
                <span
                    className="text-[10px] uppercase"
                    style={{ color: tone.muted, letterSpacing: '0.28em' }}
                >
                    Compliance basis
                </span>
                <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] uppercase tabular-nums"
                    style={{
                        color: evidenceBasis === 'evidence' ? tone.low : tone.medium,
                        background: `color-mix(in srgb, ${evidenceBasis === 'evidence' ? tone.low : tone.medium} 10%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${evidenceBasis === 'evidence' ? tone.low : tone.medium} 28%, transparent)`,
                        letterSpacing: '0.18em',
                    }}
                >
                    {evidenceBasis === 'evidence' ? 'Evidence-backed' : 'Self-assessed'}
                </span>
                <span
                    className="text-[11px] truncate"
                    style={{ color: tone.muted }}
                >
                    {healthScore.raw.approval_rate}% evidence approval ·{' '}
                    {healthScore.raw.open_risks} open risks
                </span>
                <span
                    className="ml-auto inline-flex items-center gap-1 text-[10px] uppercase"
                    style={{ color: tone.muted, letterSpacing: '0.22em' }}
                >
                    Details <ArrowRight className="h-3 w-3" />
                </span>
            </Link>
        </div>
    );
}

function Chip({ color, label }: { color: string; label: string }) {
    return (
        <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] uppercase"
            style={{
                color,
                background: `color-mix(in srgb, ${color} 10%, transparent)`,
                letterSpacing: '0.18em',
            }}
        >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
            {label}
        </span>
    );
}

// ── KRI Trends — slim two-row chart card ────────────────────────────────────

function formatSnapshotDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

const SEVERITY_RANK: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const severityRankOf = (key: unknown): number =>
    SEVERITY_RANK[typeof key === 'string' ? key.toLowerCase() : ''] ?? 99;
const severityItemSorter = (item: Payload<ValueType, NameType>): number =>
    severityRankOf(item.dataKey);
const severityOrderedLegend = (
    payload?: ReadonlyArray<LegendPayload>,
): ReadonlyArray<LegendPayload> =>
    payload ? [...payload].sort((a, b) => severityRankOf(a.dataKey) - severityRankOf(b.dataKey)) : [];

function KriTrends({ snapshots }: { snapshots: KriSnapshot[] }) {
    if (snapshots.length < 2) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base" style={{ fontWeight: 500 }}>
                        KRI trend
                    </CardTitle>
                </CardHeader>
                <CardContent className="pb-5">
                    <p className="text-sm" style={{ color: tone.muted }}>
                        Not enough data yet
                    </p>
                    <p
                        className="mt-1 text-xs"
                        style={{ color: tone.muted, opacity: 0.7 }}
                    >
                        Trends appear after the first few nightly snapshots.
                    </p>
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
        backgroundColor: tone.card,
        borderColor: tone.border,
        borderWidth: '1px',
        borderRadius: '12px',
        fontSize: '11px',
        padding: '8px 12px',
        color: tone.fg,
        boxShadow:
            '0 18px 40px -18px color-mix(in srgb, var(--foreground) 28%, transparent)',
    };

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-base" style={{ fontWeight: 500 }}>
                    KRI trend
                </CardTitle>
                <span
                    className="text-[10px] uppercase tabular-nums"
                    style={{ color: tone.muted, letterSpacing: '0.22em' }}
                >
                    Last {snapshots.length} snapshots
                </span>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
                <div className="min-w-0">
                    <p
                        className="mb-1 text-[10px] uppercase"
                        style={{ color: tone.muted, letterSpacing: '0.22em' }}
                    >
                        Compliance %
                    </p>
                    <ResponsiveContainer width="100%" height={150}>
                        <LineChart data={chartData} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={tone.border} vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10, fill: tone.muted }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fontSize: 10, fill: tone.muted }}
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
                                stroke={tone.primary}
                                strokeWidth={2}
                                dot={{ r: 2.5, fill: tone.primary }}
                                activeDot={{ r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="min-w-0">
                    <p
                        className="mb-1 text-[10px] uppercase"
                        style={{ color: tone.muted, letterSpacing: '0.22em' }}
                    >
                        Open risks by severity
                    </p>
                    <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={chartData} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={tone.border} vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10, fill: tone.muted }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                allowDecimals={false}
                                tick={{ fontSize: 10, fill: tone.muted }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip contentStyle={tooltipStyle} itemSorter={severityItemSorter} />
                            <Legend
                                wrapperStyle={{ fontSize: 9, paddingTop: 2 }}
                                iconType="circle"
                                iconSize={5}
                                content={(props) => (
                                    <DefaultLegendContent
                                        {...props}
                                        payload={severityOrderedLegend(props.payload)}
                                    />
                                )}
                            />
                            <Bar dataKey="critical" name="Critical" stackId="a" fill={tone.critical} />
                            <Bar dataKey="high" name="High" stackId="a" fill={tone.high} />
                            <Bar dataKey="medium" name="Medium" stackId="a" fill={tone.medium} />
                            <Bar dataKey="low" name="Low" stackId="a" fill={tone.low} radius={[2, 2, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

// ── Footer — single line, hairline split ────────────────────────────────────

function DashboardFooter({
    ruleAdjustments,
    lastSchedulerRun,
}: {
    ruleAdjustments: number;
    lastSchedulerRun: string | null;
}) {
    return (
        <div className="dash-reveal flex flex-wrap items-center justify-center gap-x-6 gap-y-1 pb-4 pt-2">
            <p
                className="inline-flex items-center gap-1.5 text-[10px] uppercase"
                style={{ color: tone.muted, opacity: 0.85, letterSpacing: '0.28em' }}
            >
                <Zap className="h-3 w-3" style={{ color: tone.primary }} strokeWidth={1.5} />
                {ruleAdjustments} risk score{ruleAdjustments !== 1 ? 's' : ''} auto-adjusted · last 30 days
            </p>
            <span
                aria-hidden
                className="hidden h-3 w-px md:inline-block"
                style={{ background: tone.border }}
            />
            <p
                className="text-[10px] uppercase"
                style={{ color: tone.muted, opacity: 0.55, letterSpacing: '0.28em' }}
            >
                Nightly checks · 02:00 · last run {lastSchedulerRun ?? 'never'}
            </p>
        </div>
    );
}

// ── Main dashboard ──────────────────────────────────────────────────────────

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
    const recent: NotificationItem[] = (notifications?.recent ?? []) as NotificationItem[];
    const hasCritical = recent.some(
        (n) => n.type === 'critical_risk' || n.type === 'overdue_risk',
    );

    const tiles: StatTile[] = [
        {
            label: 'Risk exposure',
            value: kpis.risk_exposure,
            suffix: '%',
            hint: `avg ${kpis.avg_risk_score}/25`,
            tone:
                kpis.risk_exposure > 50 ? 'bad' :
                kpis.risk_exposure >= 20 ? 'warn' : 'ok',
            progress: kpis.risk_exposure,
        },
        {
            label: 'Compliance',
            value:
                kpis.evidence_weighted_compliance !== null
                    ? kpis.evidence_weighted_compliance
                    : stats.compliance_score,
            suffix: '%',
            hint:
                kpis.evidence_weighted_compliance !== null
                    ? 'evidence-backed'
                    : 'self-assessed',
            tone:
                (kpis.evidence_weighted_compliance ?? stats.compliance_score) >= 70 ? 'ok' :
                (kpis.evidence_weighted_compliance ?? stats.compliance_score) >= 40 ? 'warn' : 'bad',
            progress: kpis.evidence_weighted_compliance ?? stats.compliance_score,
        },
        {
            label: 'Evidence approved',
            value: kpis.evidence_approval_rate,
            suffix: '%',
            hint: `${kpis.pending_evidence} pending`,
            tone:
                kpis.evidence_approval_rate >= 70 ? 'ok' :
                kpis.evidence_approval_rate >= 40 ? 'warn' : 'bad',
            progress: kpis.evidence_approval_rate,
        },
        {
            label: 'Critical risks',
            value: stats.critical_risks,
            hint: `${stats.open_risks} open total`,
            tone: stats.critical_risks > 0 ? 'bad' : 'ok',
        },
        {
            label: 'Due in 7d',
            value: kpis.assessments_due_soon,
            hint: 'assessments',
            tone: kpis.assessments_due_soon > 0 ? 'warn' : 'ok',
        },
    ];

    // Stagger reveal across major sections; respect prefers-reduced-motion.
    const rootRef = useRef<HTMLDivElement>(null);
    useGSAP(
        () => {
            const mm = gsap.matchMedia();
            mm.add('(prefers-reduced-motion: no-preference)', () => {
                gsap.from('.dash-reveal', {
                    opacity: 0,
                    y: 14,
                    duration: 0.65,
                    ease: 'power3.out',
                    stagger: 0.07,
                    clearProps: 'transform,opacity',
                });
            });
            return () => mm.revert();
        },
        { scope: rootRef },
    );

    return (
        <AdminLayout>
            <div ref={rootRef} className="space-y-5">
                <DashboardHero healthScore={healthScore} />

                {/* notifications + actions — single row when both present */}
                {unreadCount > 0 ? (
                    <div className="dash-reveal flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <NotificationBanner unreadCount={unreadCount} hasCritical={hasCritical} />
                        <ActionStrip />
                    </div>
                ) : (
                    <div className="dash-reveal">
                        <ActionStrip />
                    </div>
                )}

                <StatTiles tiles={tiles} />

                <HealthBreakdown healthScore={healthScore} />

                <PostureStrip appetiteCounts={appetiteCounts} healthScore={healthScore} />

                <div className="dash-reveal grid gap-4 lg:grid-cols-2">
                    <RiskHeatmap risks={heatmap} />
                    <TopRisks risks={recentRisks} />
                </div>

                <div className="dash-reveal grid gap-4 lg:grid-cols-2">
                    <RiskTrendChart trendData={trendData} />
                    <RecentAlerts activity={recentActivity} />
                </div>

                <div className="dash-reveal">
                    <KriTrends snapshots={kriSnapshots} />
                </div>

                <DashboardFooter
                    ruleAdjustments={ruleAdjustments}
                    lastSchedulerRun={lastSchedulerRun}
                />
            </div>
        </AdminLayout>
    );
}
