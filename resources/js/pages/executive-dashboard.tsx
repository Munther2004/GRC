import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    Download,
    Printer,
    Shield,
    TrendingUp,
    TrendingDown,
    Minus,
    AlertTriangle,
    CheckCircle2,
    Clock,
    FileText,
    BarChart3,
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
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

const gradeConfig: Record<string, { color: string; bg: string; ring: string }> =
    {
        A: {
            color: 'text-green-700',
            bg: 'bg-green-50',
            ring: 'ring-green-300',
        },
        B: { color: 'text-primary', bg: 'bg-primary/20', ring: 'ring-primary/30' },
        C: {
            color: 'text-amber-700',
            bg: 'bg-amber-50',
            ring: 'ring-amber-300',
        },
        D: {
            color: 'text-orange-700',
            bg: 'bg-orange-50',
            ring: 'ring-orange-300',
        },
        F: { color: 'text-red-700', bg: 'bg-red-50', ring: 'ring-red-300' },
    };

const riskLevelConfig: Record<string, { cls: string; dot: string }> = {
    critical: {
        cls: 'bg-red-950 text-red-400 border-red-200',
        dot: 'bg-red-500',
    },
    high: {
        cls: 'bg-orange-950 text-orange-400 border-orange-200',
        dot: 'bg-orange-500',
    },
    medium: {
        cls: 'bg-amber-950 text-amber-400 border-border',
        dot: 'bg-amber-400',
    },
    low: {
        cls: 'bg-emerald-950 text-emerald-400 border-green-200',
        dot: 'bg-green-500',
    },
};

function ComplianceBar({
    pct,
    className,
}: {
    pct: number;
    className?: string;
}) {
    const color =
        pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';
    return (
        <div
            className={cn(
                'h-2 overflow-hidden rounded-full bg-secondary',
                className,
            )}
        >
            <div
                className={cn('h-full rounded-full transition-all', color)}
                style={{ width: `${pct}%` }}
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
        <div className="min-h-screen bg-card print:bg-card">
            <Head title="Executive Dashboard" />

            {/* ── Action bar (hidden when printing) ── */}
            <div className="sticky top-0 z-20 border-b border-border bg-background shadow-sm dark:border-border print:hidden">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="h-4 w-4" /> Dashboard
                            </Button>
                        </Link>
                        <span className="text-sm font-semibold text-muted-foreground">
                            Executive Dashboard
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="mr-2 text-xs text-muted-foreground">
                            {generatedAt}
                        </span>
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
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <Download className="h-4 w-4" /> Download PDF
                            </Button>
                        </a>
                    </div>
                </div>
            </div>

            {/* ── Page content ── */}
            <div className="mx-auto max-w-5xl space-y-6 px-6 py-8 print:px-8 print:py-6">
                {/* Page header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                                GRC Management System
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Executive Dashboard
                        </h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Compliance &amp; Risk Posture Overview &mdash;
                            Generated {generatedAt}
                        </p>
                    </div>
                    <div className="hidden text-right text-xs text-muted-foreground print:block">
                        <p className="font-semibold">Confidential</p>
                        <p>Internal Use Only</p>
                    </div>
                </div>

                {/* ── Row 1: Health Score + 4 KPIs ── */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                    {/* Health Score */}
                    <Card
                        className={cn(
                            'col-span-2 ring-2 md:col-span-1',
                            gCfg.ring,
                        )}
                    >
                        <CardContent
                            className={cn(
                                'flex items-center gap-4 p-5',
                                gCfg.bg,
                            )}
                        >
                            <div
                                className={cn(
                                    'flex h-16 w-16 shrink-0 items-center justify-center rounded-full ring-4',
                                    gCfg.ring,
                                    gCfg.bg,
                                )}
                            >
                                <span
                                    className={cn(
                                        'text-3xl font-black',
                                        gCfg.color,
                                    )}
                                >
                                    {healthScore.grade}
                                </span>
                            </div>
                            <div>
                                <p className="font-heading text-4xl font-normal" style={{ color: '#E8DFD4' }}>
                                    {healthScore.health_score}
                                </p>
                                <p className="text-xs leading-tight text-muted-foreground">
                                    Health Score / 100
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Basis:{' '}
                                    {healthScore.raw.compliance_basis ===
                                    'evidence'
                                        ? 'Evidence-weighted'
                                        : 'Self-assessed'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Compliance % */}
                    <Card>
                        <CardContent className="p-4">
                            <p className="mb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Compliance
                            </p>
                            <p
                                className={cn(
                                    'text-3xl font-bold',
                                    complianceSummary.overall_pct >= 80
                                        ? 'text-emerald-400'
                                        : complianceSummary.overall_pct >= 60
                                          ? 'text-amber-400'
                                          : 'text-red-400',
                                )}
                            >
                                {complianceSummary.overall_pct}%
                            </p>
                            <ComplianceBar
                                pct={complianceSummary.overall_pct}
                                className="mt-2"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                {complianceSummary.compliant} compliant of{' '}
                                {complianceSummary.total_controls}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Open Risks */}
                    <Card>
                        <CardContent className="p-4">
                            <p className="mb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Open Risks
                            </p>
                            <p className="text-3xl font-bold text-foreground">
                                {riskSummary.total_open}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Avg score:{' '}
                                <span className="font-semibold">
                                    {riskSummary.avg_score}
                                </span>
                                /25
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1">
                                {riskSummary.critical > 0 && (
                                    <Badge
                                        variant="outline"
                                        className="border-red-200 bg-red-50 px-1.5 text-[10px] text-red-700"
                                    >
                                        {riskSummary.critical} critical
                                    </Badge>
                                )}
                                {riskSummary.high > 0 && (
                                    <Badge
                                        variant="outline"
                                        className="border-orange-200 bg-orange-50 px-1.5 text-[10px] text-orange-700"
                                    >
                                        {riskSummary.high} high
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Evidence Approval */}
                    <Card>
                        <CardContent className="p-4">
                            <p className="mb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Evidence
                            </p>
                            <p className="text-3xl font-bold text-foreground">
                                {evidenceSummary.total}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                <span className="font-semibold text-emerald-400">
                                    {evidenceSummary.approved}
                                </span>{' '}
                                approved
                                {' · '}
                                <span className="font-semibold text-amber-400">
                                    {evidenceSummary.pending}
                                </span>{' '}
                                pending
                            </p>
                            {evidenceSummary.expiring_soon > 0 && (
                                <p className="mt-1 text-xs font-medium text-orange-400">
                                    ⚠ {evidenceSummary.expiring_soon} expiring
                                    in 14 days
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Trend indicator */}
                    <Card>
                        <CardContent className="p-4">
                            <p className="mb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                6-Month Trend
                            </p>
                            {trend.length >= 2 ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        {complianceTrend > 0 ? (
                                            <TrendingUp className="h-6 w-6 text-green-500" />
                                        ) : complianceTrend < 0 ? (
                                            <TrendingDown className="h-6 w-6 text-red-500" />
                                        ) : (
                                            <Minus className="h-6 w-6 text-muted-foreground" />
                                        )}
                                        <span
                                            className={cn(
                                                'text-2xl font-bold',
                                                complianceTrend > 0
                                                    ? 'text-emerald-400'
                                                    : complianceTrend < 0
                                                      ? 'text-red-400'
                                                      : 'text-muted-foreground',
                                            )}
                                        >
                                            {complianceTrend > 0 ? '+' : ''}
                                            {complianceTrend.toFixed(1)}%
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        vs 6 months ago
                                    </p>
                                </>
                            ) : (
                                <p className="mt-2 text-sm text-muted-foreground/60">
                                    Insufficient data
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

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
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {riskSummary.top_risks.map((risk, i) => {
                                        const lCfg =
                                            riskLevelConfig[risk.level] ??
                                            riskLevelConfig['low'];
                                        return (
                                            <div
                                                key={i}
                                                className="flex items-start gap-3 px-4 py-3"
                                            >
                                                <span className="mt-0.5 w-4 shrink-0 text-xs font-bold text-muted-foreground">
                                                    {i + 1}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-foreground">
                                                        {risk.title}
                                                    </p>
                                                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                'px-1.5 text-[10px]',
                                                                lCfg.cls,
                                                            )}
                                                        >
                                                            {risk.level}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {risk.likelihood}×
                                                            {risk.impact} ={' '}
                                                            {risk.score}
                                                        </span>
                                                        {risk.has_treatment && (
                                                            <span className="text-[10px] font-medium text-primary">
                                                                Treatment
                                                                planned
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <span
                                                    className={cn(
                                                        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize',
                                                        risk.status === 'closed'
                                                            ? 'bg-muted text-muted-foreground'
                                                            : risk.status ===
                                                                'in_progress'
                                                              ? 'bg-accent text-foreground'
                                                              : 'bg-amber-950 text-amber-400',
                                                    )}
                                                >
                                                    {risk.status.replace(
                                                        '_',
                                                        ' ',
                                                    )}
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
                                        <div className="mb-1 flex items-center justify-between">
                                            <div>
                                                <span className="text-sm font-semibold text-foreground">
                                                    {fw.name}
                                                </span>
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                    {fw.total_controls} controls
                                                </span>
                                            </div>
                                            <span
                                                className={cn(
                                                    'text-sm font-bold',
                                                    fw.compliance_pct >= 80
                                                        ? 'text-emerald-400'
                                                        : fw.compliance_pct >=
                                                            60
                                                          ? 'text-amber-400'
                                                          : 'text-red-400',
                                                )}
                                            >
                                                {fw.compliance_pct}%
                                            </span>
                                        </div>
                                        <ComplianceBar
                                            pct={fw.compliance_pct}
                                        />
                                        <div className="mt-1 flex gap-3 text-[11px] text-muted-foreground">
                                            <span className="text-emerald-400">
                                                {fw.compliant} compliant
                                            </span>
                                            <span className="text-amber-500">
                                                {fw.partial} partial
                                            </span>
                                            <span className="text-red-500">
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
                                    {
                                        label: 'Approved',
                                        value: evidenceSummary.approved,
                                        color: 'text-emerald-400',
                                        dot: 'bg-green-500',
                                    },
                                    {
                                        label: 'Pending Review',
                                        value: evidenceSummary.pending,
                                        color: 'text-amber-400',
                                        dot: 'bg-amber-400',
                                    },
                                    {
                                        label: 'Rejected',
                                        value: evidenceSummary.rejected,
                                        color: 'text-red-400',
                                        dot: 'bg-red-500',
                                    },
                                    {
                                        label: 'Expiring ≤14d',
                                        value: evidenceSummary.expiring_soon,
                                        color: 'text-orange-400',
                                        dot: 'bg-orange-400',
                                    },
                                    {
                                        label: 'Expired',
                                        value: evidenceSummary.expired,
                                        color: 'text-muted-foreground',
                                        dot: 'bg-gray-400',
                                    },
                                    {
                                        label: 'Total Files',
                                        value: evidenceSummary.total,
                                        color: 'text-primary',
                                        dot: 'bg-primary',
                                    },
                                ].map(({ label, value, color, dot }) => (
                                    <div
                                        key={label}
                                        className="flex items-center gap-2"
                                    >
                                        <span
                                            className={cn(
                                                'h-2 w-2 shrink-0 rounded-full',
                                                dot,
                                            )}
                                        />
                                        <div>
                                            <p
                                                className={cn(
                                                    'text-xl leading-none font-bold',
                                                    color,
                                                )}
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
                                    {
                                        label: 'Total',
                                        value: assessmentSummary.total,
                                        color: 'text-foreground',
                                    },
                                    {
                                        label: 'Completed',
                                        value: assessmentSummary.completed,
                                        color: 'text-emerald-400',
                                    },
                                    {
                                        label: 'Overdue',
                                        value: assessmentSummary.overdue,
                                        color:
                                            assessmentSummary.overdue > 0
                                                ? 'text-red-400'
                                                : 'text-muted-foreground',
                                    },
                                ].map(({ label, value, color }) => (
                                    <div
                                        key={label}
                                        className="rounded-lg bg-card p-3 dark:bg-secondary/50"
                                    >
                                        <p
                                            className={cn(
                                                'text-2xl font-bold',
                                                color,
                                            )}
                                        >
                                            {value}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {label}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Latest assessment */}
                            {assessmentSummary.latest_title && (
                                <div className="rounded-lg border border-border p-3 dark:border-border">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="mb-0.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                Latest Assessment
                                            </p>
                                            <p className="truncate text-sm font-medium text-foreground">
                                                {assessmentSummary.latest_title}
                                            </p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {assessmentSummary.latest_framework && (
                                                    <Badge
                                                        variant="outline"
                                                        className="mr-1 text-[10px]"
                                                    >
                                                        {
                                                            assessmentSummary.latest_framework
                                                        }
                                                    </Badge>
                                                )}
                                                {assessmentSummary.latest_date}
                                            </p>
                                        </div>
                                        {assessmentSummary.latest_score !==
                                            null && (
                                            <div className="shrink-0 text-right">
                                                <p
                                                    className={cn(
                                                        'text-xl font-bold',
                                                        (assessmentSummary.latest_score ??
                                                            0) >= 80
                                                            ? 'text-emerald-400'
                                                            : (assessmentSummary.latest_score ??
                                                                    0) >= 60
                                                              ? 'text-amber-400'
                                                              : 'text-red-400',
                                                    )}
                                                >
                                                    {
                                                        assessmentSummary.latest_score
                                                    }
                                                    %
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    compliance
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {assessmentSummary.overdue > 0 && (
                                <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/30">
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
                        <CardContent>
                            {trend.length < 2 ? (
                                <p className="py-4 text-center text-sm text-muted-foreground/60">
                                    Not enough snapshots yet. Trend data appears
                                    after 2 scheduler runs.
                                </p>
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
                                    {
                                        label: 'Compliance',
                                        value: healthScore.components
                                            .compliance,
                                        max: 40,
                                        color: 'bg-primary',
                                    },
                                    {
                                        label: 'Critical Risks',
                                        value: healthScore.components
                                            .critical_risks,
                                        max: 20,
                                        color: 'bg-red-500',
                                    },
                                    {
                                        label: 'Evidence Quality',
                                        value: healthScore.components
                                            .evidence_quality,
                                        max: 20,
                                        color: 'bg-secondary',
                                    },
                                    {
                                        label: 'Overdue Items',
                                        value: healthScore.components
                                            .overdue_items,
                                        max: 10,
                                        color: 'bg-amber-500',
                                    },
                                    {
                                        label: 'Open Risks',
                                        value: healthScore.components
                                            .open_risks,
                                        max: 10,
                                        color: 'bg-orange-500',
                                    },
                                ] as const
                            ).map(({ label, value, max, color }) => (
                                <div key={label} className="text-center">
                                    <div className="text-lg font-bold text-foreground">
                                        {value}
                                        <span className="text-xs font-normal text-muted-foreground">
                                            /{max}
                                        </span>
                                    </div>
                                    <div className="my-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                                        <div
                                            className={cn(
                                                'h-full rounded-full',
                                                color,
                                            )}
                                            style={{
                                                width: `${(value / max) * 100}%`,
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
        </div>
    );
}
