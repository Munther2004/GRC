import { Head, Link, router, usePage } from '@inertiajs/react';
import type { SharedProps } from '@/types';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ArrowLeft,
    PlayCircle,
    CheckCircle,
    XCircle,
    MinusCircle,
    AlertTriangle,
    Download,
    Loader2,
    Sparkles,
    Copy,
    RefreshCw,
    CheckCheck,
} from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

interface Assessment {
    id: number;
    title: string;
    status: string;
    compliance_percentage: number;
    evidence_weighted_score: number | null;
    period: string;
    scope: string;
    description: string | null;
    due_date: string | null;
    created_at: string;
    user: { name: string };
    framework: { name: string; short_name: string };
}

interface Item {
    id: number;
    compliance_status: string;
    comments: string | null;
    control: { control_id: string; title: string; category: string };
}

interface EvidenceScore {
    weighted_score: number;
    raw_score: number;
    fully_evidenced: number;
    weak_evidence: number;
    no_evidence: number;
    total_applicable: number;
}

interface Props {
    assessment: Assessment;
    breakdown: {
        compliant: number;
        partially_compliant: number;
        non_compliant: number;
        not_applicable: number;
    };
    byCategory: Record<
        string,
        { total: number; compliant: number; percentage: number }
    >;
    items: Item[];
    evidenceScore: EvidenceScore;
}

interface KeyFinding {
    finding: string;
    detail: string;
    severity: string;
}

interface AISummary {
    overall_status: string;
    executive_summary: string;
    compliance_rating: string;
    key_findings: KeyFinding[];
    immediate_priorities: string[];
    positive_observations: string[];
    recommended_next_steps: string[];
}

const complianceColor = (pct: number) => {
    if (pct >= 80) return 'text-emerald-400';
    if (pct >= 50) return 'text-amber-400';
    return 'text-red-500';
};

const complianceBg = (pct: number) => {
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
};

// Evidence-backed score uses tighter thresholds (≥70 green, 40-69 amber, <40 red)
const evidenceScoreColor = (pct: number) => {
    if (pct >= 70) return 'text-emerald-400';
    if (pct >= 40) return 'text-amber-500';
    return 'text-red-500';
};

const evidenceScoreBg = (pct: number) => {
    if (pct >= 70) return 'bg-green-500';
    if (pct >= 40) return 'bg-amber-500';
    return 'bg-red-500';
};

const STATUS_STYLES: Record<string, string> = {
    Strong: 'bg-emerald-950 text-emerald-400 border-green-300',
    Adequate: 'bg-accent text-foreground border-primary/30',
    'Needs Improvement': 'bg-amber-950 text-amber-400 border-yellow-300',
    'At Risk': 'bg-orange-950 text-orange-400 border-orange-300',
    Critical: 'bg-red-950 text-red-400 border-red-300',
};

const RATING_STYLES: Record<string, string> = {
    Excellent: 'bg-emerald-950 text-emerald-400 border-green-300',
    Good: 'bg-accent text-foreground border-primary/30',
    Fair: 'bg-amber-950 text-amber-400 border-yellow-300',
    Poor: 'bg-orange-950 text-orange-400 border-orange-300',
    Critical: 'bg-red-950 text-red-400 border-red-300',
};

const SEVERITY_STYLES: Record<string, string> = {
    High: 'bg-red-950 text-red-400 border-red-200',
    Medium: 'bg-amber-950 text-amber-400 border-yellow-200',
    Low: 'bg-emerald-950 text-emerald-400 border-green-200',
};

export default function AssessmentShow({
    assessment,
    breakdown,
    byCategory,
    items,
    evidenceScore,
}: Props) {
    const { auth } = usePage<SharedProps>().props;
    const canEdit = auth.user.role === 'admin' || auth.user.role === 'manager' || auth.user.role === 'employee' || auth.user.role === 'user';

    const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
    const [loadingSummary, setLoading] = useState(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const total =
        breakdown.compliant +
        breakdown.partially_compliant +
        breakdown.non_compliant +
        breakdown.not_applicable;
    const nonCompliantItems = items.filter(
        (i) =>
            i.compliance_status === 'non_compliant' ||
            i.compliance_status === 'partially_compliant',
    );

    const generateSummary = async () => {
        setLoading(true);
        setSummaryError(null);
        try {
            const res = await axios.post(
                `/ai/assessment-summary/${assessment.id}`,
            );
            setAiSummary(res.data);
        } catch (err: any) {
            setSummaryError(
                err?.response?.data?.error ??
                    'Failed to generate summary. Please try again.',
            );
        } finally {
            setLoading(false);
        }
    };

    const copySummary = () => {
        if (!aiSummary) return;
        navigator.clipboard.writeText(aiSummary.executive_summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AdminLayout>
            <Head title={assessment.title} />

            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <Link href={route('assessments.index')}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="font-heading text-4xl font-normal text-foreground">
                                {assessment.title}
                            </h1>
                            <div className="mt-1 flex items-center gap-2">
                                <Badge variant="outline">
                                    {assessment.framework.short_name}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    {assessment.period}
                                </span>
                                <span className="text-sm text-muted-foreground/60">
                                    by {assessment.user?.name}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            disabled={loadingSummary}
                            onClick={
                                aiSummary ? generateSummary : generateSummary
                            }
                            className="gap-2 bg-secondary text-foreground hover:bg-secondary/80 disabled:opacity-60"
                        >
                            {loadingSummary ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />{' '}
                                    Analyzing...
                                </>
                            ) : aiSummary ? (
                                <>
                                    <RefreshCw className="h-4 w-4" /> Regenerate
                                    Summary
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" /> Generate AI
                                    Summary
                                </>
                            )}
                        </Button>
                        {canEdit && assessment.status !== 'completed' && (
                            <Link
                                href={route(
                                    'assessments.questionnaire',
                                    assessment.id,
                                )}
                            >
                                <Button className="gap-2">
                                    <PlayCircle className="h-4 w-4" /> Continue
                                    Questionnaire
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Left — main content */}
                    <div className="col-span-2 space-y-6">
                        {/* Compliance Score */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Compliance Score
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                {/* ── Evidence-Backed Score (primary) ──────────────── */}
                                <div>
                                    <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Evidence-Backed Score
                                    </p>
                                    <div className="mb-3 flex items-end gap-4">
                                        <span
                                            className={`text-6xl font-bold ${evidenceScoreColor(evidenceScore.weighted_score)}`}
                                        >
                                            {evidenceScore.weighted_score}%
                                        </span>
                                        <div className="mb-2">
                                            <p className="text-sm text-muted-foreground">
                                                {assessment.framework.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {total} controls assessed
                                            </p>
                                        </div>
                                    </div>
                                    <div className="h-4 w-full overflow-hidden rounded-full bg-secondary">
                                        <div
                                            className={`h-full rounded-full transition-all ${evidenceScoreBg(evidenceScore.weighted_score)}`}
                                            style={{
                                                width: `${evidenceScore.weighted_score}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* ── Self-Assessment Score (secondary) ────────────── */}
                                <div className="flex items-center gap-3">
                                    <div>
                                        <span
                                            className={`text-2xl font-semibold ${complianceColor(assessment.compliance_percentage)}`}
                                        >
                                            {assessment.compliance_percentage}%
                                        </span>
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            Self-assessed
                                        </span>
                                    </div>
                                </div>

                                {/* ── Evidence quality breakdown ────────────────────── */}
                                <div className="flex flex-wrap gap-4 border-t border-border/50 pt-1 dark:border-border">
                                    <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                                        <CheckCircle className="h-4 w-4" />
                                        <strong>
                                            {evidenceScore.fully_evidenced}
                                        </strong>{' '}
                                        Fully evidenced
                                    </span>
                                    <span className="flex items-center gap-1.5 text-sm text-amber-500">
                                        <AlertTriangle className="h-4 w-4" />
                                        <strong>
                                            {evidenceScore.weak_evidence}
                                        </strong>{' '}
                                        Weak evidence
                                    </span>
                                    <span className="flex items-center gap-1.5 text-sm text-red-500">
                                        <XCircle className="h-4 w-4" />
                                        <strong>
                                            {evidenceScore.no_evidence}
                                        </strong>{' '}
                                        No evidence
                                    </span>
                                </div>

                                <p className="text-xs text-muted-foreground italic">
                                    Score reflects both self-assessment answers
                                    and uploaded evidence quality.
                                </p>

                                {/* ── Status breakdown ─────────────────────────────── */}
                                <div className="grid grid-cols-4 gap-3">
                                    {[
                                        {
                                            label: 'Compliant',
                                            value: breakdown.compliant,
                                            icon: CheckCircle,
                                            color: 'text-green-500',
                                        },
                                        {
                                            label: 'Partial',
                                            value: breakdown.partially_compliant,
                                            icon: AlertTriangle,
                                            color: 'text-yellow-500',
                                        },
                                        {
                                            label: 'Non-Compliant',
                                            value: breakdown.non_compliant,
                                            icon: XCircle,
                                            color: 'text-red-500',
                                        },
                                        {
                                            label: 'N/A',
                                            value: breakdown.not_applicable,
                                            icon: MinusCircle,
                                            color: 'text-muted-foreground',
                                        },
                                    ].map(
                                        ({
                                            label,
                                            value,
                                            icon: Icon,
                                            color,
                                        }) => (
                                            <div
                                                key={label}
                                                className="rounded-lg bg-muted/30 p-3 text-center"
                                            >
                                                <Icon
                                                    className={`h-5 w-5 ${color} mx-auto mb-1`}
                                                />
                                                <p className="text-xl font-bold">
                                                    {value}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {label}
                                                </p>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* By Category */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Compliance by Category
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {Object.entries(byCategory).map(
                                    ([category, data]) => (
                                        <div key={category}>
                                            <div className="mb-1 flex items-center justify-between text-sm">
                                                <span className="font-medium">
                                                    {category}
                                                </span>
                                                <span
                                                    className={`font-semibold ${complianceColor(data.percentage)}`}
                                                >
                                                    {data.percentage}%{' '}
                                                    <span className="font-normal text-muted-foreground">
                                                        ({data.compliant}/
                                                        {data.total})
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                                                <div
                                                    className={`h-full rounded-full ${complianceBg(data.percentage)}`}
                                                    style={{
                                                        width: `${data.percentage}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ),
                                )}
                            </CardContent>
                        </Card>

                        {/* Gap Analysis — Non-Compliant Controls */}
                        {nonCompliantItems.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base text-red-400">
                                        Gap Analysis —{' '}
                                        {nonCompliantItems.length} controls
                                        require attention
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {nonCompliantItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`rounded-lg border p-3 text-sm ${ item.compliance_status === 'non_compliant' ? 'border-red-200 bg-red-50 dark:bg-red-950' : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950' }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <span className="mr-2 rounded bg-card px-1.5 py-0.5 font-mono text-xs dark:bg-secondary">
                                                        {
                                                            item.control
                                                                .control_id
                                                        }
                                                    </span>
                                                    <span className="font-medium">
                                                        {item.control.title}
                                                    </span>
                                                    {item.comments && (
                                                        <p className="mt-1 text-xs text-foreground/80">
                                                            {item.comments}
                                                        </p>
                                                    )}
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={`shrink-0 text-xs ${ item.compliance_status === 'non_compliant' ? 'border-red-200 bg-red-950 text-red-400' : 'border-yellow-200 bg-amber-950 text-amber-400' }`}
                                                >
                                                    {item.compliance_status ===
                                                    'non_compliant'
                                                        ? 'Non-Compliant'
                                                        : 'Partial'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right column */}
                    <div className="space-y-4">
                        <Card>
                            <CardContent className="space-y-3 p-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Status
                                    </p>
                                    <Badge
                                        variant="outline"
                                        className="mt-1 capitalize"
                                    >
                                        {assessment.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Framework
                                    </p>
                                    <p className="font-heading text-lg font-normal">
                                        {assessment.framework.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Period
                                    </p>
                                    <p className="font-heading text-lg font-normal">
                                        {assessment.period}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Scope
                                    </p>
                                    <p className="text-sm text-foreground/80">
                                        {assessment.scope}
                                    </p>
                                </div>
                                {assessment.due_date && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Due Date
                                        </p>
                                        <p className="font-heading text-lg font-normal">
                                            {new Date(
                                                assessment.due_date,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Created
                                    </p>
                                    <p className="text-sm">
                                        {new Date(
                                            assessment.created_at,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {assessment.status === 'completed' && (
                            <Card>
                                <CardContent className="p-4">
                                    <a
                                        href={route(
                                            'assessments.export-pdf',
                                            assessment.id,
                                        )}
                                        target="_blank"
                                    >
                                        <Button
                                            variant="outline"
                                            className="w-full gap-2"
                                        >
                                            <Download className="h-4 w-4" />{' '}
                                            Export PDF Report
                                        </Button>
                                    </a>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Loading state */}
                {loadingSummary && (
                    <Card className="border-secondary/20 dark:border-secondary/20">
                        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
                            <Loader2 className="h-5 w-5 animate-spin text-secondary" />
                            <p className="text-sm font-medium text-foreground/85">
                                Analyzing assessment data...
                            </p>
                            <p className="text-xs text-muted-foreground">
                                This may take a few seconds
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Error state */}
                {summaryError && !loadingSummary && (
                    <Card className="border-red-200">
                        <CardContent className="flex items-center gap-3 p-4 text-red-400">
                            <XCircle className="h-5 w-5 shrink-0" />
                            <span className="text-sm">{summaryError}</span>
                        </CardContent>
                    </Card>
                )}

                {/* AI Summary Section */}
                {aiSummary && !loadingSummary && (
                    <div className="space-y-5">
                        {/* Summary header row */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className={`px-3 py-1 text-sm font-semibold ${STATUS_STYLES[aiSummary.overall_status] ?? STATUS_STYLES['At Risk']}`}
                                >
                                    {aiSummary.overall_status}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className={`px-3 py-1 text-sm ${RATING_STYLES[aiSummary.compliance_rating] ?? RATING_STYLES['Fair']}`}
                                >
                                    {aiSummary.compliance_rating} Compliance
                                </Badge>
                                <span className="flex items-center gap-1 text-xs font-medium text-secondary-foreground dark:text-secondary-foreground">
                                    <Sparkles className="h-3.5 w-3.5" /> AI
                                    Generated
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copySummary}
                                    className="gap-1.5"
                                >
                                    {copied ? (
                                        <>
                                            <CheckCheck className="h-3.5 w-3.5 text-emerald-400" />{' '}
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3.5 w-3.5" />{' '}
                                            Copy Summary
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        window.open(
                                            route(
                                                'assessments.export-pdf',
                                                assessment.id,
                                            ),
                                            '_blank',
                                        )
                                    }
                                    className="gap-1.5"
                                >
                                    <Download className="h-3.5 w-3.5" /> Export
                                    PDF
                                </Button>
                            </div>
                        </div>

                        {/* Executive Summary */}
                        <Card className="border-secondary/20 dark:border-secondary/20">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base text-secondary-foreground dark:text-secondary-foreground">
                                    Executive Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed whitespace-pre-line text-foreground/85">
                                    {aiSummary.executive_summary}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Three-column grid */}
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                            {/* Key Findings */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold text-red-400 dark:text-red-400">
                                        🔴 Key Findings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {aiSummary.key_findings.map((f, i) => (
                                        <div
                                            key={i}
                                            className="rounded-lg border border-border/50 bg-accent/30 p-3 dark:border-border"
                                        >
                                            <div className="mb-1 flex items-start justify-between gap-2">
                                                <p className="text-sm leading-tight font-semibold text-foreground">
                                                    {f.finding}
                                                </p>
                                                <Badge
                                                    variant="outline"
                                                    className={`shrink-0 px-1.5 py-0 text-xs ${SEVERITY_STYLES[f.severity] ?? SEVERITY_STYLES['Medium']}`}
                                                >
                                                    {f.severity}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {f.detail}
                                            </p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Immediate Priorities */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold text-orange-400 dark:text-orange-400">
                                        ⚡ Immediate Priorities
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {aiSummary.immediate_priorities.map(
                                        (p, i) => (
                                            <div
                                                key={i}
                                                className="flex gap-3 rounded-r-lg border-l-2 border-orange-400 bg-orange-50 p-2.5 dark:bg-orange-900/10"
                                            >
                                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                                                    {i + 1}
                                                </span>
                                                <p className="text-sm text-foreground/85">
                                                    {p}
                                                </p>
                                            </div>
                                        ),
                                    )}
                                </CardContent>
                            </Card>

                            {/* Positive Observations */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold text-emerald-400 dark:text-green-400">
                                        ✅ Positive Observations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {aiSummary.positive_observations.map(
                                        (obs, i) => (
                                            <div
                                                key={i}
                                                className="flex items-start gap-2"
                                            >
                                                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                                                <p className="text-sm text-foreground/85">
                                                    {obs}
                                                </p>
                                            </div>
                                        ),
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recommended Next Steps */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">
                                    Recommended Next Steps
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {aiSummary.recommended_next_steps.map(
                                    (step, i) => (
                                        <div
                                            key={i}
                                            className="flex gap-4 rounded-r-lg border-l-4 border-secondary bg-secondary/10 p-3 dark:bg-secondary/10"
                                        >
                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-sm font-bold text-secondary-foreground dark:bg-secondary/40 dark:text-secondary-foreground">
                                                {i + 1}
                                            </span>
                                            <p className="pt-1 text-sm text-foreground/85">
                                                {step}
                                            </p>
                                        </div>
                                    ),
                                )}
                            </CardContent>
                        </Card>

                        {/* Disclaimer */}
                        <p className="pb-2 text-center text-xs text-muted-foreground/60 italic">
                            This summary was generated by AI based on assessment
                            data. Review findings with your compliance team
                            before acting.
                        </p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
