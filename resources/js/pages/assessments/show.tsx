import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
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
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { route } from '@/lib/routes';
import type { SharedProps } from '@/types';

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
    risks_generating: boolean;
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
    if (pct >= 80) return 'text-[#46bd5f]';
    if (pct >= 50) return 'text-[#f5b929]';
    return 'text-[#e5484d]';
};

const complianceBg = (pct: number) => {
    if (pct >= 80) return 'bg-[#46bd5f]';
    if (pct >= 50) return 'bg-[#f5b929]';
    return 'bg-[#e5484d]';
};

// Evidence-backed score uses tighter thresholds (≥70 green, 40-69 amber, <40 red)
const evidenceScoreColor = (pct: number) => {
    if (pct >= 70) return 'text-[#46bd5f]';
    if (pct >= 40) return 'text-[#f5b929]';
    return 'text-[#e5484d]';
};

const evidenceScoreBg = (pct: number) => {
    if (pct >= 70) return 'bg-[#46bd5f]';
    if (pct >= 40) return 'bg-[#f5b929]';
    return 'bg-[#e5484d]';
};

const STATUS_STYLES: Record<string, string> = {
    Strong: 'bg-[rgba(70,189,95,0.12)] text-[#46bd5f] border-[rgba(70,189,95,0.4)]',
    Adequate: 'bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary border-[color-mix(in_srgb,var(--primary)_30%,transparent)]',
    'Needs Improvement': 'bg-[rgba(245,185,41,0.12)] text-[#f5b929] border-[rgba(245,185,41,0.4)]',
    'At Risk': 'bg-[rgba(247,107,21,0.12)] text-[#f76b15] border-[rgba(247,107,21,0.4)]',
    Critical: 'bg-[rgba(229,72,77,0.12)] text-[#e5484d] border-[rgba(229,72,77,0.4)]',
};

const RATING_STYLES: Record<string, string> = {
    Excellent: 'bg-[rgba(70,189,95,0.12)] text-[#46bd5f] border-[rgba(70,189,95,0.4)]',
    Good: 'bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary border-[color-mix(in_srgb,var(--primary)_30%,transparent)]',
    Fair: 'bg-[rgba(245,185,41,0.12)] text-[#f5b929] border-[rgba(245,185,41,0.4)]',
    Poor: 'bg-[rgba(247,107,21,0.12)] text-[#f76b15] border-[rgba(247,107,21,0.4)]',
    Critical: 'bg-[rgba(229,72,77,0.12)] text-[#e5484d] border-[rgba(229,72,77,0.4)]',
};

const SEVERITY_STYLES: Record<string, string> = {
    High: 'bg-[rgba(229,72,77,0.12)] text-[#e5484d] border-[rgba(229,72,77,0.4)]',
    Medium: 'bg-[rgba(245,185,41,0.12)] text-[#f5b929] border-[rgba(245,185,41,0.4)]',
    Low: 'bg-[rgba(70,189,95,0.12)] text-[#46bd5f] border-[rgba(70,189,95,0.4)]',
};

export default function AssessmentShow({
    assessment,
    breakdown,
    byCategory,
    items,
    evidenceScore,
    risks_generating,
}: Props) {
    const { auth } = usePage<SharedProps>().props;
    const canEdit = auth.user.role === 'super_admin' || auth.user.role === 'admin' || auth.user.role === 'user';

    const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
    const [loadingSummary, setLoading] = useState(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Poll for AI-generated risks while a GenerateAIRisksJob is in flight
    // for THIS assessment. Stops the moment every non-compliant item has
    // its auto_generated risk (or the 10-min staleness cap is hit).
    useEffect(() => {
        if (!risks_generating) return;
        const tick = () => {
            if (document.hidden) return;
            router.reload({
                only: ['risks_generating', 'breakdown', 'byCategory'],
            });
        };
        const id = window.setInterval(tick, 8000);
        return () => window.clearInterval(id);
    }, [risks_generating]);

    const total =
        breakdown.compliant +
        breakdown.partially_compliant +
        breakdown.non_compliant +
        breakdown.not_applicable;

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
                            <h1 className="text-4xl tracking-[-0.02em]" style={{ color: 'var(--foreground)', fontWeight: 500, lineHeight: 1.1 }}>
                                {assessment.title}
                            </h1>
                            <div className="mt-1 flex items-center gap-2">
                                <Badge variant="outline">
                                    {assessment.framework.short_name}
                                </Badge>
                                <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                                    {assessment.period}
                                </span>
                                <span className="text-sm" style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}>
                                    by {assessment.user?.name}
                                </span>
                                {risks_generating && (
                                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        AI generating risks…
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            disabled={loadingSummary}
                            variant="outline"
                            onClick={
                                aiSummary ? generateSummary : generateSummary
                            }
                            className="gap-2"
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
                                {/* Evidence-Backed Score (primary) */}
                                <div>
                                    <p className="mb-2 text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
                                        Evidence-Backed Score
                                    </p>
                                    <div className="mb-3 flex items-end gap-4">
                                        <span
                                            className={`text-6xl tabular-nums ${evidenceScoreColor(evidenceScore.weighted_score)}`}
                                            style={{ fontWeight: 500, letterSpacing: '-0.02em' }}
                                        >
                                            {evidenceScore.weighted_score}%
                                        </span>
                                        <div className="mb-2">
                                            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                                                {assessment.framework.name}
                                            </p>
                                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                {total} controls assessed
                                            </p>
                                        </div>
                                    </div>
                                    <div className="h-3 w-full overflow-hidden rounded-full" style={{ background: 'var(--muted)' }}>
                                        <div
                                            className={`h-full rounded-full transition-all ${evidenceScoreBg(evidenceScore.weighted_score)}`}
                                            style={{
                                                width: `${evidenceScore.weighted_score}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Self-Assessment Score (secondary) */}
                                <div className="flex items-center gap-3">
                                    <div>
                                        <span
                                            className={`text-2xl tabular-nums ${complianceColor(assessment.compliance_percentage)}`}
                                            style={{ fontWeight: 500 }}
                                        >
                                            {assessment.compliance_percentage}%
                                        </span>
                                        <span className="ml-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                            Self-assessed
                                        </span>
                                    </div>
                                </div>

                                {/* Evidence quality breakdown */}
                                <div className="flex flex-wrap gap-4 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                                    <span className="flex items-center gap-1.5 text-sm" style={{ color: '#46bd5f' }}>
                                        <CheckCircle className="h-4 w-4" />
                                        <strong>
                                            {evidenceScore.fully_evidenced}
                                        </strong>{' '}
                                        Fully evidenced
                                    </span>
                                    <span className="flex items-center gap-1.5 text-sm" style={{ color: '#f5b929' }}>
                                        <AlertTriangle className="h-4 w-4" />
                                        <strong>
                                            {evidenceScore.weak_evidence}
                                        </strong>{' '}
                                        Weak evidence
                                    </span>
                                    <span className="flex items-center gap-1.5 text-sm" style={{ color: '#e5484d' }}>
                                        <XCircle className="h-4 w-4" />
                                        <strong>
                                            {evidenceScore.no_evidence}
                                        </strong>{' '}
                                        No evidence
                                    </span>
                                </div>

                                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                    Score reflects both self-assessment answers
                                    and uploaded evidence quality.
                                </p>

                                {/* Status breakdown */}
                                <div className="grid grid-cols-4 gap-3">
                                    {[
                                        {
                                            label: 'Compliant',
                                            value: breakdown.compliant,
                                            icon: CheckCircle,
                                            color: '#46bd5f',
                                        },
                                        {
                                            label: 'Partial',
                                            value: breakdown.partially_compliant,
                                            icon: AlertTriangle,
                                            color: '#f5b929',
                                        },
                                        {
                                            label: 'Non-Compliant',
                                            value: breakdown.non_compliant,
                                            icon: XCircle,
                                            color: '#e5484d',
                                        },
                                        {
                                            label: 'N/A',
                                            value: breakdown.not_applicable,
                                            icon: MinusCircle,
                                            color: 'var(--muted-foreground)',
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
                                                className="rounded-2xl p-3 text-center"
                                                style={{ background: 'color-mix(in srgb, var(--muted) 50%, transparent)' }}
                                            >
                                                <Icon
                                                    className="h-5 w-5 mx-auto mb-1"
                                                    style={{ color }}
                                                />
                                                <p className="text-xl tabular-nums" style={{ fontWeight: 500 }}>
                                                    {value}
                                                </p>
                                                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
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
                                                <span style={{ fontWeight: 500 }}>
                                                    {category}
                                                </span>
                                                <span
                                                    className={`tabular-nums ${complianceColor(data.percentage)}`}
                                                    style={{ fontWeight: 500 }}
                                                >
                                                    {data.percentage}%{' '}
                                                    <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>
                                                        ({data.compliant}/
                                                        {data.total})
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--muted)' }}>
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

                    </div>

                    {/* Right column */}
                    <div className="space-y-4">
                        <Card>
                            <CardContent className="space-y-3 p-4">
                                <div>
                                    <p className="text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
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
                                    <p className="text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
                                        Framework
                                    </p>
                                    <p className="text-lg" style={{ fontWeight: 500 }}>
                                        {assessment.framework.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
                                        Period
                                    </p>
                                    <p className="text-lg" style={{ fontWeight: 500 }}>
                                        {assessment.period}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
                                        Scope
                                    </p>
                                    <p className="text-sm" style={{ color: 'var(--foreground)', opacity: 0.85 }}>
                                        {assessment.scope}
                                    </p>
                                </div>
                                {assessment.due_date && (
                                    <div>
                                        <p className="text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
                                            Due Date
                                        </p>
                                        <p className="text-lg" style={{ fontWeight: 500 }}>
                                            {new Date(
                                                assessment.due_date,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
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
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
                            <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--primary)' }} />
                            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                                Analyzing assessment data...
                            </p>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                This may take a few seconds
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Error state */}
                {summaryError && !loadingSummary && (
                    <Card style={{ borderColor: 'color-mix(in srgb, var(--destructive) 30%, transparent)' }}>
                        <CardContent className="flex items-center gap-3 p-4" style={{ color: 'var(--destructive)' }}>
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
                                    className={STATUS_STYLES[aiSummary.overall_status] ?? STATUS_STYLES['At Risk']}
                                >
                                    {aiSummary.overall_status}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className={RATING_STYLES[aiSummary.compliance_rating] ?? RATING_STYLES['Fair']}
                                >
                                    {aiSummary.compliance_rating} Compliance
                                </Badge>
                                <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--primary)' }}>
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
                                            <CheckCheck className="h-3.5 w-3.5" style={{ color: '#46bd5f' }} />{' '}
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
                        <Card style={{ borderColor: 'color-mix(in srgb, var(--primary) 25%, transparent)' }}>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base" style={{ color: 'var(--primary)' }}>
                                    Executive Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="max-w-none whitespace-pre-line text-sm leading-relaxed" style={{ color: 'var(--foreground)', opacity: 0.85 }}>
                                    {aiSummary.executive_summary}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Three-column grid */}
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                            {/* Key Findings */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm" style={{ color: '#e5484d', fontWeight: 500 }}>
                                        Key Findings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {aiSummary.key_findings.map((f, i) => (
                                        <div
                                            key={i}
                                            className="rounded-2xl border p-3"
                                            style={{ borderColor: 'var(--border)', background: 'color-mix(in srgb, var(--muted) 30%, transparent)' }}
                                        >
                                            <div className="mb-1 flex items-start justify-between gap-2">
                                                <p className="text-sm leading-tight" style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                                                    {f.finding}
                                                </p>
                                                <Badge
                                                    variant="outline"
                                                    className={`shrink-0 ${SEVERITY_STYLES[f.severity] ?? SEVERITY_STYLES['Medium']}`}
                                                >
                                                    {f.severity}
                                                </Badge>
                                            </div>
                                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                {f.detail}
                                            </p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Immediate Priorities */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm" style={{ color: '#f76b15', fontWeight: 500 }}>
                                        Immediate Priorities
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {aiSummary.immediate_priorities.map(
                                        (p, i) => (
                                            <div
                                                key={i}
                                                className="flex gap-3 rounded-r-2xl border-l-2 p-2.5"
                                                style={{ borderColor: '#f76b15', background: 'rgba(247,107,21,0.08)' }}
                                            >
                                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium" style={{ background: 'rgba(247,107,21,0.18)', color: '#f76b15' }}>
                                                    {i + 1}
                                                </span>
                                                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
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
                                    <CardTitle className="text-sm" style={{ color: '#46bd5f', fontWeight: 500 }}>
                                        Positive Observations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {aiSummary.positive_observations.map(
                                        (obs, i) => (
                                            <div
                                                key={i}
                                                className="flex items-start gap-2"
                                            >
                                                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: '#46bd5f' }} />
                                                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
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
                                            className="flex gap-4 rounded-r-2xl border-l-4 p-3"
                                            style={{ borderColor: 'var(--primary)', background: 'color-mix(in srgb, var(--primary) 8%, transparent)' }}
                                        >
                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm" style={{ background: 'color-mix(in srgb, var(--primary) 20%, transparent)', color: 'var(--primary)', fontWeight: 600 }}>
                                                {i + 1}
                                            </span>
                                            <p className="pt-1 text-sm" style={{ color: 'var(--foreground)' }}>
                                                {step}
                                            </p>
                                        </div>
                                    ),
                                )}
                            </CardContent>
                        </Card>

                        {/* Disclaimer */}
                        <p className="pb-2 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
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
