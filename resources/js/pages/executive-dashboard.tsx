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
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
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

const gradeConfig: Record<string, { color: string; bg: string; ring: string }> = {
    A: { color: 'text-green-700',  bg: 'bg-green-50',  ring: 'ring-green-300' },
    B: { color: 'text-blue-700',   bg: 'bg-blue-50',   ring: 'ring-blue-300' },
    C: { color: 'text-amber-700',  bg: 'bg-amber-50',  ring: 'ring-amber-300' },
    D: { color: 'text-orange-700', bg: 'bg-orange-50', ring: 'ring-orange-300' },
    F: { color: 'text-red-700',    bg: 'bg-red-50',    ring: 'ring-red-300' },
};

const riskLevelConfig: Record<string, { cls: string; dot: string }> = {
    critical: { cls: 'bg-red-100 text-red-700 border-red-200',    dot: 'bg-red-500' },
    high:     { cls: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
    medium:   { cls: 'bg-amber-100 text-amber-700 border-amber-200',  dot: 'bg-amber-400' },
    low:      { cls: 'bg-green-100 text-green-700 border-green-200',  dot: 'bg-green-500' },
};

function ComplianceBar({ pct, className }: { pct: number; className?: string }) {
    const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';
    return (
        <div className={cn('h-2 bg-gray-200 rounded-full overflow-hidden', className)}>
            <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
        </div>
    );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function ExecutiveDashboard({
    healthScore, complianceSummary, riskSummary, evidenceSummary,
    assessmentSummary, trend, frameworkBreakdown, generatedAt,
}: Props) {
    const gCfg = gradeConfig[healthScore.grade] ?? gradeConfig['F'];

    const complianceTrend = trend.length >= 2
        ? trend[trend.length - 1].compliance_score - trend[0].compliance_score
        : 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 print:bg-white">
            <Head title="Executive Dashboard" />

            {/* ── Action bar (hidden when printing) ── */}
            <div className="print:hidden sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="gap-1 text-gray-500 hover:text-gray-900">
                                <ArrowLeft className="w-4 h-4" /> Dashboard
                            </Button>
                        </Link>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            Executive Dashboard
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 mr-2">{generatedAt}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => window.print()}
                        >
                            <Printer className="w-4 h-4" /> Print
                        </Button>
                        <a href="/executive-dashboard/pdf" target="_blank" rel="noreferrer">
                            <Button variant="outline" size="sm" className="gap-2">
                                <Download className="w-4 h-4" /> Download PDF
                            </Button>
                        </a>
                    </div>
                </div>
            </div>

            {/* ── Page content ── */}
            <div className="max-w-5xl mx-auto px-6 py-8 space-y-6 print:py-6 print:px-8">

                {/* Page header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                GRC Management System
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Executive Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Compliance &amp; Risk Posture Overview &mdash; Generated {generatedAt}
                        </p>
                    </div>
                    <div className="text-right text-xs text-gray-400 hidden print:block">
                        <p className="font-semibold">Confidential</p>
                        <p>Internal Use Only</p>
                    </div>
                </div>

                {/* ── Row 1: Health Score + 4 KPIs ── */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

                    {/* Health Score */}
                    <Card className={cn('col-span-2 md:col-span-1 ring-2', gCfg.ring)}>
                        <CardContent className={cn('p-5 flex items-center gap-4', gCfg.bg)}>
                            <div className={cn(
                                'w-16 h-16 rounded-full ring-4 flex items-center justify-center shrink-0',
                                gCfg.ring, gCfg.bg
                            )}>
                                <span className={cn('text-3xl font-black', gCfg.color)}>
                                    {healthScore.grade}
                                </span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{healthScore.health_score}</p>
                                <p className="text-xs text-gray-500 leading-tight">Health Score / 100</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Basis: {healthScore.raw.compliance_basis === 'evidence' ? 'Evidence-weighted' : 'Self-assessed'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Compliance % */}
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Compliance</p>
                            <p className={cn(
                                'text-3xl font-bold',
                                complianceSummary.overall_pct >= 80 ? 'text-green-600' :
                                complianceSummary.overall_pct >= 60 ? 'text-amber-600' : 'text-red-600'
                            )}>
                                {complianceSummary.overall_pct}%
                            </p>
                            <ComplianceBar pct={complianceSummary.overall_pct} className="mt-2" />
                            <p className="text-xs text-gray-400 mt-1">
                                {complianceSummary.compliant} compliant of {complianceSummary.total_controls}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Open Risks */}
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Open Risks</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{riskSummary.total_open}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                Avg score: <span className="font-semibold">{riskSummary.avg_score}</span>/25
                            </p>
                            <div className="flex gap-1 mt-2 flex-wrap">
                                {riskSummary.critical > 0 && (
                                    <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200 px-1.5">
                                        {riskSummary.critical} critical
                                    </Badge>
                                )}
                                {riskSummary.high > 0 && (
                                    <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-700 border-orange-200 px-1.5">
                                        {riskSummary.high} high
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Evidence Approval */}
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Evidence</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{evidenceSummary.total}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                <span className="text-green-600 font-semibold">{evidenceSummary.approved}</span> approved
                                {' · '}
                                <span className="text-amber-600 font-semibold">{evidenceSummary.pending}</span> pending
                            </p>
                            {evidenceSummary.expiring_soon > 0 && (
                                <p className="text-xs text-orange-600 mt-1 font-medium">
                                    ⚠ {evidenceSummary.expiring_soon} expiring in 14 days
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Trend indicator */}
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">6-Month Trend</p>
                            {trend.length >= 2 ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        {complianceTrend > 0 ? (
                                            <TrendingUp className="w-6 h-6 text-green-500" />
                                        ) : complianceTrend < 0 ? (
                                            <TrendingDown className="w-6 h-6 text-red-500" />
                                        ) : (
                                            <Minus className="w-6 h-6 text-gray-400" />
                                        )}
                                        <span className={cn(
                                            'text-2xl font-bold',
                                            complianceTrend > 0 ? 'text-green-600' :
                                            complianceTrend < 0 ? 'text-red-600' : 'text-gray-500'
                                        )}>
                                            {complianceTrend > 0 ? '+' : ''}{complianceTrend.toFixed(1)}%
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">vs 6 months ago</p>
                                </>
                            ) : (
                                <p className="text-sm text-gray-400 mt-2">Insufficient data</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ── Row 2: Top Risks + Framework Breakdown ── */}
                <div className="grid md:grid-cols-2 gap-6">

                    {/* Top 5 Risks */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                Top Risks by Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {riskSummary.top_risks.length === 0 ? (
                                <p className="px-4 py-6 text-sm text-gray-400 text-center">No risks recorded.</p>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {riskSummary.top_risks.map((risk, i) => {
                                        const lCfg = riskLevelConfig[risk.level] ?? riskLevelConfig['low'];
                                        return (
                                            <div key={i} className="px-4 py-3 flex items-start gap-3">
                                                <span className="text-xs font-bold text-gray-400 mt-0.5 w-4 shrink-0">
                                                    {i + 1}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {risk.title}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                        <Badge variant="outline" className={cn('text-[10px] px-1.5', lCfg.cls)}>
                                                            {risk.level}
                                                        </Badge>
                                                        <span className="text-xs text-gray-400">
                                                            {risk.likelihood}×{risk.impact} = {risk.score}
                                                        </span>
                                                        {risk.has_treatment && (
                                                            <span className="text-[10px] text-blue-500 font-medium">
                                                                Treatment planned
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className={cn(
                                                    'text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 capitalize',
                                                    risk.status === 'closed'      ? 'bg-gray-100 text-gray-500' :
                                                    risk.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-amber-100 text-amber-700'
                                                )}>
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
                            <CardTitle className="text-sm flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-blue-500" />
                                Framework Compliance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {frameworkBreakdown.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">No framework data.</p>
                            ) : frameworkBreakdown.map((fw) => (
                                <div key={fw.name}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {fw.name}
                                            </span>
                                            <span className="text-xs text-gray-400 ml-2">{fw.total_controls} controls</span>
                                        </div>
                                        <span className={cn(
                                            'text-sm font-bold',
                                            fw.compliance_pct >= 80 ? 'text-green-600' :
                                            fw.compliance_pct >= 60 ? 'text-amber-600' : 'text-red-600'
                                        )}>
                                            {fw.compliance_pct}%
                                        </span>
                                    </div>
                                    <ComplianceBar pct={fw.compliance_pct} />
                                    <div className="flex gap-3 mt-1 text-[11px] text-gray-400">
                                        <span className="text-green-600">{fw.compliant} compliant</span>
                                        <span className="text-amber-500">{fw.partial} partial</span>
                                        <span className="text-red-500">{fw.non_compliant} non-compliant</span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* ── Row 3: Evidence Status + Assessment Summary ── */}
                <div className="grid md:grid-cols-2 gap-6">

                    {/* Evidence Status */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <FileText className="w-4 h-4 text-purple-500" />
                                Evidence Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Approved',       value: evidenceSummary.approved,      color: 'text-green-600',  dot: 'bg-green-500' },
                                    { label: 'Pending Review', value: evidenceSummary.pending,        color: 'text-amber-600',  dot: 'bg-amber-400' },
                                    { label: 'Rejected',       value: evidenceSummary.rejected,       color: 'text-red-600',    dot: 'bg-red-500' },
                                    { label: 'Expiring ≤14d',  value: evidenceSummary.expiring_soon,  color: 'text-orange-600', dot: 'bg-orange-400' },
                                    { label: 'Expired',        value: evidenceSummary.expired,        color: 'text-gray-500',   dot: 'bg-gray-400' },
                                    { label: 'Total Files',    value: evidenceSummary.total,           color: 'text-blue-600',   dot: 'bg-blue-500' },
                                ].map(({ label, value, color, dot }) => (
                                    <div key={label} className="flex items-center gap-2">
                                        <span className={cn('w-2 h-2 rounded-full shrink-0', dot)} />
                                        <div>
                                            <p className={cn('text-xl font-bold leading-none', color)}>{value}</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assessment Summary */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                Assessment Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                                {[
                                    { label: 'Total',       value: assessmentSummary.total,       color: 'text-gray-900 dark:text-white' },
                                    { label: 'Completed',   value: assessmentSummary.completed,   color: 'text-green-600' },
                                    { label: 'Overdue',     value: assessmentSummary.overdue,     color: assessmentSummary.overdue > 0 ? 'text-red-600' : 'text-gray-400' },
                                ].map(({ label, value, color }) => (
                                    <div key={label} className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3">
                                        <p className={cn('text-2xl font-bold', color)}>{value}</p>
                                        <p className="text-[11px] text-gray-400">{label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Latest assessment */}
                            {assessmentSummary.latest_title && (
                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                                                Latest Assessment
                                            </p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {assessmentSummary.latest_title}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {assessmentSummary.latest_framework && (
                                                    <Badge variant="outline" className="text-[10px] mr-1">
                                                        {assessmentSummary.latest_framework}
                                                    </Badge>
                                                )}
                                                {assessmentSummary.latest_date}
                                            </p>
                                        </div>
                                        {assessmentSummary.latest_score !== null && (
                                            <div className="text-right shrink-0">
                                                <p className={cn(
                                                    'text-xl font-bold',
                                                    (assessmentSummary.latest_score ?? 0) >= 80 ? 'text-green-600' :
                                                    (assessmentSummary.latest_score ?? 0) >= 60 ? 'text-amber-600' : 'text-red-600'
                                                )}>
                                                    {assessmentSummary.latest_score}%
                                                </p>
                                                <p className="text-[11px] text-gray-400">compliance</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {assessmentSummary.overdue > 0 && (
                                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-2">
                                    <Clock className="w-3.5 h-3.5 shrink-0" />
                                    {assessmentSummary.overdue} assessment{assessmentSummary.overdue > 1 ? 's' : ''} overdue — action required
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ── Row 4: Compliance Trend ── */}
                {trend.length > 0 && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-500" />
                                Compliance Trend
                                <span className="text-xs font-normal text-gray-400 ml-1">Last {trend.length} snapshots</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {trend.length < 2 ? (
                                <p className="text-sm text-gray-400 text-center py-4">
                                    Not enough snapshots yet. Trend data appears after 2 scheduler runs.
                                </p>
                            ) : (
                                <ResponsiveContainer width="100%" height={160}>
                                    <LineChart data={trend} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(v) => `${v}%`}
                                        />
                                        <Tooltip
                                            formatter={(value) => [`${value}%`, 'Compliance']}
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
                        <CardTitle className="text-sm">Health Score Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                            {([
                                { label: 'Compliance',       value: healthScore.components.compliance,       max: 40, color: 'bg-blue-500' },
                                { label: 'Critical Risks',   value: healthScore.components.critical_risks,   max: 20, color: 'bg-red-500' },
                                { label: 'Evidence Quality', value: healthScore.components.evidence_quality, max: 20, color: 'bg-purple-500' },
                                { label: 'Overdue Items',    value: healthScore.components.overdue_items,    max: 10, color: 'bg-amber-500' },
                                { label: 'Open Risks',       value: healthScore.components.open_risks,       max: 10, color: 'bg-orange-500' },
                            ] as const).map(({ label, value, max, color }) => (
                                <div key={label} className="text-center">
                                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                                        {value}<span className="text-xs text-gray-400 font-normal">/{max}</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden my-1.5">
                                        <div
                                            className={cn('h-full rounded-full', color)}
                                            style={{ width: `${(value / max) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-500">{label}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center text-xs text-gray-400 pb-4 pt-2 border-t border-gray-200 dark:border-gray-800">
                    GRC Management System &mdash; Executive Dashboard &mdash; {generatedAt}
                    &nbsp;&mdash;&nbsp;Confidential &mdash; Internal Use Only
                </div>
            </div>
        </div>
    );
}
