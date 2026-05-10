import { Head } from '@inertiajs/react';
import {
    Download,
    Loader2,
    Printer,
    Shield,
    Sparkles,
    TrendingUp,
    TrendingDown,
    Minus,
    AlertTriangle,
    CheckCircle2,
    Clock,
    FileText,
    BarChart3,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { CorporationFilter } from '@/components/corporation-filter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { downloadPdf } from '@/lib/download-pdf';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────

interface HealthScore {
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
}

interface ComplianceSummary {
    overall_pct: number;
    compliant: number;
    partial: number;
    non_compliant: number;
    not_applicable: number;
    total_controls: number;
}

interface TopRisk {
    title: string;
    likelihood: number;
    impact: number;
    score: number;
    level: string;
    status: string;
    has_treatment: boolean;
}

interface RiskSummary {
    total_open: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    avg_score: number;
    top_risks: TopRisk[];
}

interface EvidenceSummary {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    expiring_soon: number;
    expired: number;
}

interface AssessmentSummary {
    total: number;
    completed: number;
    in_progress: number;
    overdue: number;
    latest_title: string | null;
    latest_date: string | null;
    latest_score: number | null;
    latest_framework: string | null;
}

interface TrendPoint {
    date: string;
    compliance_score: number;
    critical_risks: number;
}

interface FrameworkRow {
    name: string;
    full_name: string;
    total_controls: number;
    compliant: number;
    partial: number;
    non_compliant: number;
    compliance_pct: number;
}

interface Props {
    healthScore: HealthScore;
    complianceSummary: ComplianceSummary;
    riskSummary: RiskSummary;
    evidenceSummary: EvidenceSummary;
    assessmentSummary: AssessmentSummary;
    trend: TrendPoint[];
    frameworkBreakdown: FrameworkRow[];
    generatedAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

// ── AI Executive Summary — board-ready PDF section, merged from dashboard ──

function AIExecutiveSummarySection() {
    const [generating, setGenerating] = useState(false);
    const [toast, setToast] = useState<{ type: 'error'; text: string } | null>(null);

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
        <Card className="print:hidden">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                    AI Executive Summary
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="max-w-xl">
                        <p className="text-sm" style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                            Generate a board-ready PDF narrative
                        </p>
                        <p className="mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            Claude-powered analysis of compliance posture, top risks, and remediation priorities — packaged as a one-page exec brief.
                        </p>
                    </div>
                    <Button
                        onClick={generate}
                        disabled={generating}
                        className="shrink-0 gap-2"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating…
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Generate AI Summary PDF
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
            {generating && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{
                        background: 'color-mix(in srgb, var(--background) 90%, transparent)',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <div
                        className="mx-4 flex max-w-xs flex-col items-center gap-3 rounded-2xl p-7"
                        style={{
                            background: 'var(--card)',
                            border: '1px solid var(--border)',
                            boxShadow: '0 24px 60px -28px color-mix(in srgb, var(--foreground) 28%, transparent)',
                        }}
                    >
                        <Sparkles className="h-6 w-6 animate-pulse" style={{ color: 'var(--primary)' }} />
                        <p className="text-lg" style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                            Generating summary…
                        </p>
                        <p className="text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
                            The AI is analysing your GRC data
                        </p>
                    </div>
                </div>
            )}
            {toast && (
                <div
                    className="fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm"
                    style={{
                        background: 'var(--card)',
                        border: '1px solid color-mix(in srgb, var(--destructive) 40%, transparent)',
                        boxShadow: '0 18px 40px -18px color-mix(in srgb, var(--foreground) 28%, transparent)',
                    }}
                >
                    <XCircle className="h-4 w-4 shrink-0" style={{ color: 'var(--destructive)' }} />
                    <span style={{ color: 'var(--foreground)' }}>{toast.text}</span>
                </div>
            )}
        </Card>
    );
}

// Landing-page pill recipe: light tinted bg + colored fg + matching dot.
// Uses raw hex tones (matched to landing) inside color-mix for theme-safe pills.
const TONES = {
    critical: '#e5484d',
    high:     '#f76b15',
    medium:   '#f5b929',
    low:      '#46bd5f',
    info:     'var(--primary)',
} as const;

const gradeConfig: Record<string, { color: string; bg: string; ring: string }> =
    {
        A: { color: TONES.low,      bg: `color-mix(in srgb, ${TONES.low} 12%, transparent)`,      ring: `color-mix(in srgb, ${TONES.low} 35%, transparent)` },
        B: { color: 'var(--primary)', bg: 'color-mix(in srgb, var(--primary) 10%, transparent)',  ring: 'color-mix(in srgb, var(--primary) 30%, transparent)' },
        C: { color: TONES.medium,   bg: `color-mix(in srgb, ${TONES.medium} 14%, transparent)`,   ring: `color-mix(in srgb, ${TONES.medium} 35%, transparent)` },
        D: { color: TONES.high,     bg: `color-mix(in srgb, ${TONES.high} 12%, transparent)`,     ring: `color-mix(in srgb, ${TONES.high} 35%, transparent)` },
        F: { color: TONES.critical, bg: `color-mix(in srgb, ${TONES.critical} 12%, transparent)`, ring: `color-mix(in srgb, ${TONES.critical} 35%, transparent)` },
    };

// Landing-style level pill: light bg + colored fg, dot inherits the same hue.
const riskLevelStyle = (level: string): { fg: string; bg: string } => {
    const fg = (TONES as Record<string, string>)[level] ?? 'var(--muted-foreground)';
    return { fg, bg: `color-mix(in srgb, ${fg} 12%, transparent)` };
};

function ComplianceBar({
    pct,
    className,
}: {
    pct: number;
    className?: string;
}) {
    const color = pct >= 80 ? '#46bd5f' : pct >= 60 ? '#f5b929' : '#e5484d';
    return (
        <div
            className={cn('h-1.5 overflow-hidden rounded-full', className)}
            style={{ background: 'color-mix(in srgb, var(--foreground) 8%, transparent)' }}
        >
            <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: color }}
            />
        </div>
    );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function ExecutiveDashboard({
    healthScore,
    complianceSummary,
    riskSummary,
    evidenceSummary,
    assessmentSummary,
    trend,
    frameworkBreakdown,
    generatedAt,
}: Props) {
    const gCfg = gradeConfig[healthScore.grade] ?? gradeConfig['F'];

    const complianceTrend =
        trend.length >= 2
            ? trend[trend.length - 1].compliance_score -
              trend[0].compliance_score
            : 0;

    return (
        <AdminLayout>
            <Head title="Executive Dashboard" />

            <div className="space-y-6 print:px-8 print:py-6">
                {/* Page header — title left, Print + Download PDF right */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <Shield className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
                            <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                                GRC Management System
                            </span>
                        </div>
                        <h1
                            className="text-3xl tracking-[-0.02em] sm:text-4xl"
                            style={{ color: 'var(--foreground)', fontWeight: 500, lineHeight: 1.1 }}
                        >
                            Executive Dashboard
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Compliance &amp; Risk Posture Overview &mdash; Generated {generatedAt}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 print:hidden">
                        <CorporationFilter />
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => window.print()}
                        >
                            <Printer className="h-4 w-4" /> Print
                        </Button>
                        <a
                            href="/executive-dashboard/pdf"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Button size="sm" className="gap-2">
                                <Download className="h-4 w-4" /> Download PDF
                            </Button>
                        </a>
                    </div>
                    <div className="hidden text-right text-[11px] uppercase tracking-[0.22em] text-muted-foreground print:block">
                        <p style={{ fontWeight: 500 }}>Confidential</p>
                        <p>Internal Use Only</p>
                    </div>
                </div>

                {/* ── Row 1: Health Score + 4 KPIs (compact wide rectangles) ── */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                    {/* Health Score */}
                    <Card
                        className="col-span-2 !py-0 md:col-span-1"
                        style={{ boxShadow: `0 0 0 2px ${gCfg.ring}, 0 10px 30px -16px color-mix(in srgb, var(--foreground) 18%, transparent)` }}
                    >
                        <CardContent
                            className="flex items-center gap-3 px-3 py-2"
                            style={{ background: gCfg.bg, minHeight: '76px' }}
                        >
                            <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                                style={{
                                    background: gCfg.bg,
                                    boxShadow: `0 0 0 2px ${gCfg.ring}`,
                                }}
                            >
                                <span
                                    className="block text-xl"
                                    style={{
                                        color: gCfg.color,
                                        fontWeight: 600,
                                        lineHeight: 1,
                                        textAlign: 'center',
                                        fontVariantNumeric: 'tabular-nums',
                                    }}
                                >
                                    {healthScore.grade}
                                </span>
                            </div>
                            <div className="min-w-0 leading-tight">
                                <p className="text-xl tabular-nums leading-none" style={{ color: 'var(--foreground)', fontWeight: 500, letterSpacing: '-0.02em' }}>
                                    {healthScore.health_score}
                                    <span className="ml-0.5 text-[10px] text-muted-foreground" style={{ fontWeight: 400 }}>/100</span>
                                </p>
                                <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                                    Health Score
                                </p>
                                <p className="text-[10px] leading-tight text-muted-foreground/80">
                                    {healthScore.raw.compliance_basis === 'evidence'
                                        ? 'Evidence-weighted'
                                        : 'Self-assessed'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Compliance % */}
                    <Card className="!py-0">
                        <CardContent className="px-3 py-2 leading-tight" style={{ minHeight: '76px' }}>
                            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                                Compliance
                            </p>
                            <p
                                className="mt-1 text-xl tabular-nums leading-none"
                                style={{
                                    color:
                                        complianceSummary.overall_pct >= 80 ? TONES.low
                                        : complianceSummary.overall_pct >= 60 ? TONES.medium
                                        : TONES.critical,
                                    fontWeight: 500,
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                {complianceSummary.overall_pct}%
                            </p>
                            <ComplianceBar
                                pct={complianceSummary.overall_pct}
                                className="mt-1.5"
                            />
                            <p className="mt-1 text-[10px] text-muted-foreground">
                                {complianceSummary.compliant}/{complianceSummary.total_controls} compliant
                            </p>
                        </CardContent>
                    </Card>

                    {/* Open Risks */}
                    <Card className="!py-0">
                        <CardContent className="px-3 py-2 leading-tight" style={{ minHeight: '76px' }}>
                            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                                Open Risks
                            </p>
                            <p
                                className="mt-1 text-xl tabular-nums leading-none"
                                style={{ color: 'var(--foreground)', fontWeight: 500, letterSpacing: '-0.02em' }}
                            >
                                {riskSummary.total_open}
                                <span className="ml-1.5 text-[10px] text-muted-foreground" style={{ fontWeight: 400 }}>
                                    avg {riskSummary.avg_score}/25
                                </span>
                            </p>
                            <div className="mt-1.5 flex flex-wrap gap-1">
                                {riskSummary.critical > 0 && (
                                    <span
                                        className="inline-flex items-center rounded-full px-1.5 py-px text-[9px] uppercase"
                                        style={{
                                            color: TONES.critical,
                                            background: `color-mix(in srgb, ${TONES.critical} 12%, transparent)`,
                                            letterSpacing: '0.18em',
                                        }}
                                    >
                                        {riskSummary.critical} critical
                                    </span>
                                )}
                                {riskSummary.high > 0 && (
                                    <span
                                        className="inline-flex items-center rounded-full px-1.5 py-px text-[9px] uppercase"
                                        style={{
                                            color: TONES.high,
                                            background: `color-mix(in srgb, ${TONES.high} 12%, transparent)`,
                                            letterSpacing: '0.18em',
                                        }}
                                    >
                                        {riskSummary.high} high
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Evidence Approval */}
                    <Card className="!py-0">
                        <CardContent className="px-3 py-2 leading-tight" style={{ minHeight: '76px' }}>
                            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                                Evidence
                            </p>
                            <p
                                className="mt-1 text-xl tabular-nums leading-none"
                                style={{ color: 'var(--foreground)', fontWeight: 500, letterSpacing: '-0.02em' }}
                            >
                                {evidenceSummary.total}
                            </p>
                            <p className="mt-1 text-[10px] text-muted-foreground">
                                <span style={{ color: TONES.low, fontWeight: 500 }}>
                                    {evidenceSummary.approved}
                                </span>{' '}
                                approved
                                {' · '}
                                <span style={{ color: TONES.medium, fontWeight: 500 }}>
                                    {evidenceSummary.pending}
                                </span>{' '}
                                pending
                            </p>
                            {evidenceSummary.expiring_soon > 0 && (
                                <p className="mt-0.5 text-[10px]" style={{ color: TONES.high, fontWeight: 500 }}>
                                    ⚠ {evidenceSummary.expiring_soon} expiring in 14d
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Trend indicator */}
                    <Card className="!py-0">
                        <CardContent className="px-3 py-2 leading-tight" style={{ minHeight: '76px' }}>
                            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                                6-Month Trend
                            </p>
                            {trend.length >= 2 ? (
                                <>
                                    <div className="mt-1 flex items-center gap-2">
                                        {complianceTrend > 0 ? (
                                            <TrendingUp className="h-4 w-4" style={{ color: TONES.low }} />
                                        ) : complianceTrend < 0 ? (
                                            <TrendingDown className="h-4 w-4" style={{ color: TONES.critical }} />
                                        ) : (
                                            <Minus className="h-4 w-4 text-muted-foreground" />
                                        )}
                                        <span
                                            className="text-xl tabular-nums leading-none"
                                            style={{
                                                color:
                                                    complianceTrend > 0 ? TONES.low
                                                    : complianceTrend < 0 ? TONES.critical
                                                    : 'var(--muted-foreground)',
                                                fontWeight: 500,
                                                letterSpacing: '-0.02em',
                                            }}
                                        >
                                            {complianceTrend > 0 ? '+' : ''}
                                            {complianceTrend.toFixed(1)}%
                                        </span>
                                    </div>
                                    <p className="mt-1 text-[10px] text-muted-foreground">
                                        vs 6 months ago
                                    </p>
                                </>
                            ) : (
                                <p className="mt-1.5 text-[10px] text-muted-foreground/60">
                                    Insufficient data
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ── AI Executive Summary (board-ready PDF, generated on demand) ── */}
                <AIExecutiveSummarySection />

                {/* ── Row 2: Top Risks + Framework Breakdown ── */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Top 5 Risks */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                Top Risks by Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {riskSummary.top_risks.length === 0 ? (
                                <p className="px-4 py-6 text-center text-sm text-muted-foreground/60">
                                    No risks recorded.
                                </p>
                            ) : (
                                <div className="divide-y divide-border">
                                    {riskSummary.top_risks.map((risk, i) => {
                                        const lvl = riskLevelStyle(risk.level);
                                        const statusStyle =
                                            risk.status === 'closed'
                                                ? { color: 'var(--muted-foreground)', background: 'color-mix(in srgb, var(--muted-foreground) 12%, transparent)' }
                                                : risk.status === 'in_progress'
                                                  ? { color: 'var(--primary)', background: 'color-mix(in srgb, var(--primary) 10%, transparent)' }
                                                  : { color: TONES.medium, background: `color-mix(in srgb, ${TONES.medium} 14%, transparent)` };
                                        return (
                                            <div
                                                key={i}
                                                className="flex items-start gap-3 px-4 py-3"
                                            >
                                                <span className="mt-0.5 w-4 shrink-0 text-xs tabular-nums text-muted-foreground" style={{ fontWeight: 500 }}>
                                                    {i + 1}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm" style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                                                        {risk.title}
                                                    </p>
                                                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                                        <span
                                                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] uppercase"
                                                            style={{
                                                                color: lvl.fg,
                                                                background: lvl.bg,
                                                                letterSpacing: '0.18em',
                                                            }}
                                                        >
                                                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: lvl.fg }} />
                                                            {risk.level}
                                                        </span>
                                                        <span className="text-xs tabular-nums text-muted-foreground">
                                                            {risk.likelihood}×{risk.impact} = {risk.score}
                                                        </span>
                                                        {risk.has_treatment && (
                                                            <span className="text-[10px]" style={{ color: 'var(--primary)', fontWeight: 500 }}>
                                                                Treatment planned
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <span
                                                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase capitalize"
                                                    style={{ ...statusStyle, letterSpacing: '0.18em' }}
                                                >
                                                    {risk.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Framework Breakdown */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <BarChart3 className="h-4 w-4 text-primary" />
                                Framework Compliance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {frameworkBreakdown.length === 0 ? (
                                <p className="py-4 text-center text-sm text-muted-foreground/60">
                                    No framework data.
                                </p>
                            ) : (
                                frameworkBreakdown.map((fw) => (
                                    <div key={fw.name}>
                                        <div className="mb-1.5 flex items-center justify-between">
                                            <div>
                                                <span className="text-sm" style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                                                    {fw.name}
                                                </span>
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                    {fw.total_controls} controls
                                                </span>
                                            </div>
                                            <span
                                                className="text-sm tabular-nums"
                                                style={{
                                                    color:
                                                        fw.compliance_pct >= 80 ? TONES.low
                                                        : fw.compliance_pct >= 60 ? TONES.medium
                                                        : TONES.critical,
                                                    fontWeight: 500,
                                                    letterSpacing: '-0.01em',
                                                }}
                                            >
                                                {fw.compliance_pct}%
                                            </span>
                                        </div>
                                        <ComplianceBar pct={fw.compliance_pct} />
                                        <div className="mt-1.5 flex gap-3 text-[11px] text-muted-foreground">
                                            <span style={{ color: TONES.low }}>
                                                {fw.compliant} compliant
                                            </span>
                                            <span style={{ color: TONES.medium }}>
                                                {fw.partial} partial
                                            </span>
                                            <span style={{ color: TONES.critical }}>
                                                {fw.non_compliant} non-compliant
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ── Row 3: Evidence Status + Assessment Summary ── */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Evidence Status */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <FileText className="h-4 w-4 text-destructive" />
                                Evidence Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Approved',       value: evidenceSummary.approved,      tone: TONES.low },
                                    { label: 'Pending Review', value: evidenceSummary.pending,       tone: TONES.medium },
                                    { label: 'Rejected',       value: evidenceSummary.rejected,      tone: TONES.critical },
                                    { label: 'Expiring ≤14d',  value: evidenceSummary.expiring_soon, tone: TONES.high },
                                    { label: 'Expired',        value: evidenceSummary.expired,       tone: 'var(--muted-foreground)' },
                                    { label: 'Total Files',    value: evidenceSummary.total,         tone: 'var(--primary)' },
                                ].map(({ label, value, tone }) => (
                                    <div key={label} className="flex items-center gap-2">
                                        <span
                                            className="h-2 w-2 shrink-0 rounded-full"
                                            style={{ background: tone }}
                                        />
                                        <div>
                                            <p
                                                className="text-xl leading-none tabular-nums"
                                                style={{ color: tone, fontWeight: 500, letterSpacing: '-0.02em' }}
                                            >
                                                {value}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                {label}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assessment Summary */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Assessment Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                                {[
                                    { label: 'Total',     value: assessmentSummary.total,     tone: 'var(--foreground)' },
                                    { label: 'Completed', value: assessmentSummary.completed, tone: TONES.low },
                                    { label: 'Overdue',   value: assessmentSummary.overdue,   tone: assessmentSummary.overdue > 0 ? TONES.critical : 'var(--muted-foreground)' },
                                ].map(({ label, value, tone }) => (
                                    <div
                                        key={label}
                                        className="rounded-2xl p-3"
                                        style={{
                                            background: 'color-mix(in srgb, var(--muted) 60%, transparent)',
                                            border: '1px solid color-mix(in srgb, var(--border) 60%, transparent)',
                                        }}
                                    >
                                        <p
                                            className="text-2xl tabular-nums leading-none"
                                            style={{ color: tone, fontWeight: 500, letterSpacing: '-0.02em' }}
                                        >
                                            {value}
                                        </p>
                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                            {label}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Latest assessment */}
                            {assessmentSummary.latest_title && (
                                <div className="rounded-2xl border border-border p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="mb-1 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                                                Latest Assessment
                                            </p>
                                            <p className="truncate text-sm" style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                                                {assessmentSummary.latest_title}
                                            </p>
                                            <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                                {assessmentSummary.latest_framework && (
                                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] uppercase" style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)', letterSpacing: '0.18em' }}>
                                                        {assessmentSummary.latest_framework}
                                                    </span>
                                                )}
                                                {assessmentSummary.latest_date}
                                            </p>
                                        </div>
                                        {assessmentSummary.latest_score !== null && (
                                            <div className="shrink-0 text-right">
                                                <p
                                                    className="text-xl tabular-nums leading-none"
                                                    style={{
                                                        color:
                                                            (assessmentSummary.latest_score ?? 0) >= 80 ? TONES.low
                                                            : (assessmentSummary.latest_score ?? 0) >= 60 ? TONES.medium
                                                            : TONES.critical,
                                                        fontWeight: 500,
                                                        letterSpacing: '-0.02em',
                                                    }}
                                                >
                                                    {assessmentSummary.latest_score}%
                                                </p>
                                                <p className="mt-1 text-[11px] text-muted-foreground">
                                                    compliance
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {assessmentSummary.overdue > 0 && (
                                <div
                                    className="flex items-center gap-2 rounded-2xl px-3 py-2 text-xs"
                                    style={{
                                        background: `color-mix(in srgb, ${TONES.medium} 14%, transparent)`,
                                        color: TONES.medium,
                                    }}
                                >
                                    <Clock className="h-3.5 w-3.5 shrink-0" />
                                    {assessmentSummary.overdue} assessment
                                    {assessmentSummary.overdue > 1 ? 's' : ''}{' '}
                                    overdue — action required
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ── Row 4: Compliance Trend ── */}
                {trend.length > 0 && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                Compliance Trend
                                <span className="ml-1 text-xs font-normal text-muted-foreground">
                                    Last {trend.length} snapshots
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="min-w-0">
                            {trend.length < 2 ? (
                                <div className="py-4 text-center">
                                    <p className="text-sm text-muted-foreground/80">
                                        Not enough snapshots yet.
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground/60">
                                        Snapshots appear after the first few nightly scheduler runs.
                                    </p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={160}>
                                    <LineChart
                                        data={trend}
                                        margin={{
                                            top: 5,
                                            right: 20,
                                            left: -10,
                                            bottom: 0,
                                        }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#f1f5f9"
                                        />
                                        <XAxis
                                            dataKey="date"
                                            tick={{
                                                fontSize: 11,
                                                fill: '#94a3b8',
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            tick={{
                                                fontSize: 11,
                                                fill: '#94a3b8',
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(v) => `${v}%`}
                                        />
                                        <Tooltip
                                            formatter={(value) => [
                                                `${value}%`,
                                                'Compliance',
                                            ]}
                                            contentStyle={{
                                                fontSize: 12,
                                                borderRadius: 8,
                                                border: '1px solid #e2e8f0',
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="compliance_score"
                                            stroke="#3b82f6"
                                            strokeWidth={2.5}
                                            dot={{ r: 4, fill: '#3b82f6' }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* ── Health Score component breakdown ── */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                            Health Score Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
                            {(
                                [
                                    { label: 'Compliance',       value: healthScore.components.compliance,       max: 40, tone: 'var(--primary)' },
                                    { label: 'Critical Risks',   value: healthScore.components.critical_risks,   max: 20, tone: TONES.critical },
                                    { label: 'Evidence Quality', value: healthScore.components.evidence_quality, max: 20, tone: TONES.info },
                                    { label: 'Overdue Items',    value: healthScore.components.overdue_items,    max: 10, tone: TONES.medium },
                                    { label: 'Open Risks',       value: healthScore.components.open_risks,       max: 10, tone: TONES.high },
                                ] as const
                            ).map(({ label, value, max, tone }) => (
                                <div key={label} className="text-center">
                                    <div className="text-lg tabular-nums leading-none" style={{ color: 'var(--foreground)', fontWeight: 500, letterSpacing: '-0.02em' }}>
                                        {value}
                                        <span className="text-xs text-muted-foreground" style={{ fontWeight: 400 }}>
                                            /{max}
                                        </span>
                                    </div>
                                    <div
                                        className="my-2 h-1.5 overflow-hidden rounded-full"
                                        style={{ background: 'color-mix(in srgb, var(--foreground) 8%, transparent)' }}
                                    >
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${(value / max) * 100}%`,
                                                background: tone,
                                            }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        {label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="border-t border-border pt-2 pb-4 text-center text-xs text-muted-foreground dark:border-border">
                    GRC Management System &mdash; Executive Dashboard &mdash;{' '}
                    {generatedAt}
                    &nbsp;&mdash;&nbsp;Confidential &mdash; Internal Use Only
                </div>
            </div>
        </AdminLayout>
    );
}
