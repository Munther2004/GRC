import { Head, Link, usePage } from '@inertiajs/react';
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
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { route } from '@/lib/routes';

interface Assessment {
    id: number;
    title: string;
    status: string;
    compliance_percentage: number;
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
    if (pct >= 80) return 'text-green-600';
    if (pct >= 50) return 'text-yellow-600';
    return 'text-red-500';
};

const complianceBg = (pct: number) => {
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
};

const STATUS_STYLES: Record<string, string> = {
    Strong: 'bg-green-100 text-green-700 border-green-300',
    Adequate: 'bg-blue-100 text-blue-700 border-blue-300',
    'Needs Improvement': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'At Risk': 'bg-orange-100 text-orange-700 border-orange-300',
    Critical: 'bg-red-100 text-red-700 border-red-300',
};

const RATING_STYLES: Record<string, string> = {
    Excellent: 'bg-green-100 text-green-700 border-green-300',
    Good: 'bg-blue-100 text-blue-700 border-blue-300',
    Fair: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    Poor: 'bg-orange-100 text-orange-700 border-orange-300',
    Critical: 'bg-red-100 text-red-700 border-red-300',
};

const SEVERITY_STYLES: Record<string, string> = {
    High: 'bg-red-100 text-red-700 border-red-200',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Low: 'bg-green-100 text-green-700 border-green-200',
};

export default function AssessmentShow({
    assessment,
    breakdown,
    byCategory,
    items,
}: Props) {
    const { auth } = usePage().props as any;
    const canEdit = auth.user.role === 'admin' || auth.user.role === 'user';

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
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {assessment.title}
                            </h1>
                            <div className="mt-1 flex items-center gap-2">
                                <Badge variant="outline">
                                    {assessment.framework.short_name}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                    {assessment.period}
                                </span>
                                <span className="text-sm text-gray-400">
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
                            className="gap-2 bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
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
                            <CardContent>
                                <div className="mb-4 flex items-end gap-4">
                                    <span
                                        className={`text-6xl font-bold ${complianceColor(assessment.compliance_percentage)}`}
                                    >
                                        {assessment.compliance_percentage}%
                                    </span>
                                    <div className="mb-2">
                                        <p className="text-sm text-gray-500">
                                            {assessment.framework.name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {total} controls assessed
                                        </p>
                                    </div>
                                </div>
                                <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
                                    <div
                                        className={`h-full rounded-full transition-all ${complianceBg(assessment.compliance_percentage)}`}
                                        style={{
                                            width: `${assessment.compliance_percentage}%`,
                                        }}
                                    />
                                </div>

                                {/* Breakdown */}
                                <div className="mt-4 grid grid-cols-4 gap-3">
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
                                            color: 'text-gray-400',
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
                                                className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-800"
                                            >
                                                <Icon
                                                    className={`h-5 w-5 ${color} mx-auto mb-1`}
                                                />
                                                <p className="text-xl font-bold">
                                                    {value}
                                                </p>
                                                <p className="text-xs text-gray-500">
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
                                                    <span className="font-normal text-gray-400">
                                                        ({data.compliant}/
                                                        {data.total})
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
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
                                    <CardTitle className="text-base text-red-600">
                                        Gap Analysis —{' '}
                                        {nonCompliantItems.length} controls
                                        require attention
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {nonCompliantItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`rounded-lg border p-3 text-sm ${
                                                item.compliance_status ===
                                                'non_compliant'
                                                    ? 'border-red-200 bg-red-50 dark:bg-red-950'
                                                    : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <span className="mr-2 rounded bg-white px-1.5 py-0.5 font-mono text-xs dark:bg-gray-800">
                                                        {
                                                            item.control
                                                                .control_id
                                                        }
                                                    </span>
                                                    <span className="font-medium">
                                                        {item.control.title}
                                                    </span>
                                                    {item.comments && (
                                                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                                                            {item.comments}
                                                        </p>
                                                    )}
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={`flex-shrink-0 text-xs ${
                                                        item.compliance_status ===
                                                        'non_compliant'
                                                            ? 'border-red-200 bg-red-50 text-red-600'
                                                            : 'border-yellow-200 bg-yellow-50 text-yellow-600'
                                                    }`}
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
                                    <p className="text-xs text-gray-400">
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
                                    <p className="text-xs text-gray-400">
                                        Framework
                                    </p>
                                    <p className="text-sm font-medium">
                                        {assessment.framework.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">
                                        Period
                                    </p>
                                    <p className="text-sm font-medium">
                                        {assessment.period}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">
                                        Scope
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {assessment.scope}
                                    </p>
                                </div>
                                {assessment.due_date && (
                                    <div>
                                        <p className="text-xs text-gray-400">
                                            Due Date
                                        </p>
                                        <p className="text-sm font-medium">
                                            {new Date(
                                                assessment.due_date,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-gray-400">
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
                    <Card className="border-purple-200 dark:border-purple-800">
                        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Analyzing assessment data...
                            </p>
                            <p className="text-xs text-gray-400">
                                This may take a few seconds
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Error state */}
                {summaryError && !loadingSummary && (
                    <Card className="border-red-200">
                        <CardContent className="flex items-center gap-3 p-4 text-red-600">
                            <XCircle className="h-5 w-5 flex-shrink-0" />
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
                                <span className="flex items-center gap-1 text-xs font-medium text-purple-600 dark:text-purple-400">
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
                                            <CheckCheck className="h-3.5 w-3.5 text-green-600" />{' '}
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
                                    onClick={copySummary}
                                    className="gap-1.5"
                                >
                                    <Download className="h-3.5 w-3.5" /> Export
                                </Button>
                            </div>
                        </div>

                        {/* Executive Summary */}
                        <Card className="border-purple-100 dark:border-purple-900">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base text-purple-700 dark:text-purple-400">
                                    Executive Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed whitespace-pre-line text-gray-700 dark:text-gray-300">
                                    {aiSummary.executive_summary}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Three-column grid */}
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                            {/* Key Findings */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold text-red-600 dark:text-red-400">
                                        🔴 Key Findings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {aiSummary.key_findings.map((f, i) => (
                                        <div
                                            key={i}
                                            className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50"
                                        >
                                            <div className="mb-1 flex items-start justify-between gap-2">
                                                <p className="text-sm leading-tight font-semibold text-gray-900 dark:text-white">
                                                    {f.finding}
                                                </p>
                                                <Badge
                                                    variant="outline"
                                                    className={`flex-shrink-0 px-1.5 py-0 text-xs ${SEVERITY_STYLES[f.severity] ?? SEVERITY_STYLES['Medium']}`}
                                                >
                                                    {f.severity}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {f.detail}
                                            </p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Immediate Priorities */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold text-orange-600 dark:text-orange-400">
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
                                                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                                                    {i + 1}
                                                </span>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
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
                                    <CardTitle className="text-sm font-semibold text-green-600 dark:text-green-400">
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
                                                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
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
                                            className="flex gap-4 rounded-r-lg border-l-4 border-purple-400 bg-purple-50 p-3 dark:bg-purple-900/10"
                                        >
                                            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                                                {i + 1}
                                            </span>
                                            <p className="pt-1 text-sm text-gray-700 dark:text-gray-300">
                                                {step}
                                            </p>
                                        </div>
                                    ),
                                )}
                            </CardContent>
                        </Card>

                        {/* Disclaimer */}
                        <p className="pb-2 text-center text-xs text-gray-400 italic dark:text-gray-500">
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
