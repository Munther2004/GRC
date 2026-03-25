import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    Search,
    FolderOpen,
    CheckCircle,
    XCircle,
    Clock,
    Download,
    Trash2,
    FileText,
    FileImage,
    File,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { route } from '@/lib/routes';

interface AiReview {
    verdict: string;
    confidence: number;
    summary: string;
    strengths: string[];
    gaps: string[];
    recommendation: string;
    suggested_status: string;
}

interface EvidenceItem {
    id: number;
    title: string;
    description: string | null;
    file_name: string;
    file_type: string;
    file_path: string;
    status: string;
    created_at: string;
    expiry_date: string | null;
    is_expired: boolean;
    expires_soon: boolean;
    ai_verdict: string | null;
    ai_confidence: number | null;
    ai_reviewed_at: string | null;
    ai_review: AiReview | null;
    user: { name: string } | null;
    assessment_item: {
        control: { control_id: string; title: string; category: string };
        assessment: {
            id: number;
            title: string;
            framework: { short_name: string };
            user: { name: string };
        };
    } | null;
}

interface Props {
    evidence: {
        data: EvidenceItem[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    frameworks: { id: number; name: string; short_name: string }[];
    assessments: { id: number; title: string }[];
    stats: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    };
    filters: {
        search?: string;
        status?: string;
        framework_id?: string;
        assessment_id?: string;
    };
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    approved: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-600 border-red-200',
};

const verdictConfig: Record<string, { color: string; bg: string }> = {
    Adequate: { color: 'text-green-700', bg: 'bg-green-100 border-green-300' },
    'Partially Adequate': {
        color: 'text-yellow-700',
        bg: 'bg-yellow-100 border-yellow-300',
    },
    Insufficient: { color: 'text-red-700', bg: 'bg-red-100 border-red-300' },
};

const FileIcon = ({ type }: { type: string }) => {
    if (type.includes('image'))
        return <FileImage className="h-5 w-5 text-blue-500" />;
    if (type.includes('pdf'))
        return <FileText className="h-5 w-5 text-red-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
};

function AiReviewPanel({
    review,
    onApply,
}: {
    review: AiReview;
    onApply: (status: string) => void;
}) {
    const vc = verdictConfig[review.verdict] ?? verdictConfig['Insufficient'];

    return (
        <div className="mt-3 space-y-3 border-t border-purple-200 pt-3 dark:border-purple-800">
            {/* Verdict + confidence */}
            <div className="flex flex-wrap items-center gap-3">
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${vc.bg} ${vc.color}`}
                >
                    {review.verdict === 'Adequate' && (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    {review.verdict === 'Partially Adequate' && (
                        <AlertTriangle className="h-3.5 w-3.5" />
                    )}
                    {review.verdict === 'Insufficient' && (
                        <XCircle className="h-3.5 w-3.5" />
                    )}
                    {review.verdict}
                </span>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                            className={`h-full rounded-full ${review.confidence >= 70 ? 'bg-green-500' : review.confidence >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${review.confidence}%` }}
                        />
                    </div>
                    <span className="text-xs font-medium text-gray-500">
                        {review.confidence}% confidence
                    </span>
                </div>
            </div>

            {/* Summary */}
            <p className="text-sm text-gray-700 dark:text-gray-300">
                {review.summary}
            </p>

            {/* Strengths + Gaps */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {review.strengths.length > 0 && (
                    <div>
                        <p className="mb-1.5 text-xs font-semibold text-green-700 dark:text-green-400">
                            Strengths
                        </p>
                        <ul className="space-y-1">
                            {review.strengths.map((s, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400"
                                >
                                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {review.gaps.length > 0 && (
                    <div>
                        <p className="mb-1.5 text-xs font-semibold text-red-700 dark:text-red-400">
                            Gaps
                        </p>
                        <ul className="space-y-1">
                            {review.gaps.map((g, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400"
                                >
                                    <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                                    {g}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Recommendation */}
            <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-800 dark:bg-blue-950/30">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                    {review.recommendation}
                </p>
            </div>

            {/* Apply suggestion */}
            {review.suggested_status !== 'pending' && (
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">AI suggests:</span>
                    <Button
                        size="sm"
                        variant="outline"
                        className={`h-7 text-xs ${review.suggested_status === 'approved' ? 'border-green-400 text-green-700 hover:bg-green-50' : 'border-red-400 text-red-700 hover:bg-red-50'}`}
                        onClick={() => onApply(review.suggested_status)}
                    >
                        {review.suggested_status === 'approved' ? (
                            <>
                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />{' '}
                                Apply Approval
                            </>
                        ) : (
                            <>
                                <XCircle className="mr-1 h-3.5 w-3.5" /> Apply
                                Rejection
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}

export default function EvidenceIndex({
    evidence,
    frameworks,
    assessments,
    stats,
    filters,
}: Props) {
    const { auth } = usePage().props as any;
    const isAdmin = auth.user.role === 'admin';
    const canReview = isAdmin || auth.user.role === 'auditor';

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [frameworkId, setFramework] = useState(filters.framework_id ?? 'all');
    const [assessmentId, setAssessment] = useState(
        filters.assessment_id ?? 'all',
    );

    // AI review state
    const [reviewing, setReviewing] = useState<Record<number, boolean>>({});
    const [liveReviews, setLiveReviews] = useState<Record<number, AiReview>>(
        {},
    );
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});
    const [reviewError, setReviewError] = useState<Record<number, string>>({});

    const applyFilters = (overrides: Record<string, string> = {}) => {
        router.get(
            route('evidence.index'),
            {
                search,
                status: status === 'all' ? '' : status,
                framework_id: frameworkId === 'all' ? '' : frameworkId,
                assessment_id: assessmentId === 'all' ? '' : assessmentId,
                ...overrides,
            },
            { preserveState: true, replace: true },
        );
    };

    const approve = (id: number) => router.post(route('evidence.approve', id));
    const reject = (id: number) => router.post(route('evidence.reject', id));
    const destroy = (id: number, title: string) => {
        if (!confirm(`Delete evidence "${title}"?`)) return;
        router.delete(route('evidence.destroy', id));
    };

    const download = (id: number) => {
        window.open(route('evidence.download', id), '_blank');
    };

    const runAiReview = async (id: number) => {
        setReviewing((prev) => ({ ...prev, [id]: true }));
        setReviewError((prev) => {
            const n = { ...prev };
            delete n[id];
            return n;
        });

        try {
            const { data } = await axios.post(route('ai.review-evidence'), {
                evidence_id: id,
            });
            setLiveReviews((prev) => ({ ...prev, [id]: data }));
            setExpanded((prev) => ({ ...prev, [id]: true }));
        } catch (err: any) {
            const msg = err.response?.data?.error ?? 'AI review failed';
            setReviewError((prev) => ({ ...prev, [id]: msg }));
        } finally {
            setReviewing((prev) => ({ ...prev, [id]: false }));
        }
    };

    const togglePanel = (id: number) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const getReview = (ev: EvidenceItem): AiReview | null =>
        liveReviews[ev.id] ?? ev.ai_review ?? null;

    const formatSize = (type: string) =>
        type.split('/')[1]?.toUpperCase() ?? 'FILE';

    return (
        <AdminLayout>
            <Head title="Evidence" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Evidence
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        All uploaded compliance evidence files
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                        {
                            label: 'Total Files',
                            value: stats.total,
                            icon: FolderOpen,
                            color: 'text-blue-500',
                        },
                        {
                            label: 'Pending',
                            value: stats.pending,
                            icon: Clock,
                            color: 'text-yellow-500',
                        },
                        {
                            label: 'Approved',
                            value: stats.approved,
                            icon: CheckCircle,
                            color: 'text-green-500',
                        },
                        {
                            label: 'Rejected',
                            value: stats.rejected,
                            icon: XCircle,
                            color: 'text-red-500',
                        },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <Card key={label}>
                            <CardContent className="flex items-center gap-3 p-4">
                                <Icon className={`h-8 w-8 ${color}`} />
                                <div>
                                    <p className="text-2xl font-bold">
                                        {value}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {label}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-3">
                            <div className="relative min-w-[200px] flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search evidence..."
                                    value={search}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                    ) => setSearch(e.target.value)}
                                    onKeyDown={(e: React.KeyboardEvent) =>
                                        e.key === 'Enter' &&
                                        applyFilters({ search })
                                    }
                                    className="pl-9"
                                />
                            </div>
                            <Select
                                value={status}
                                onValueChange={(v: string) => {
                                    setStatus(v);
                                    applyFilters({
                                        status: v === 'all' ? '' : v,
                                    });
                                }}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Statuses
                                    </SelectItem>
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="approved">
                                        Approved
                                    </SelectItem>
                                    <SelectItem value="rejected">
                                        Rejected
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={frameworkId}
                                onValueChange={(v: string) => {
                                    setFramework(v);
                                    applyFilters({
                                        framework_id: v === 'all' ? '' : v,
                                    });
                                }}
                            >
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Framework" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Frameworks
                                    </SelectItem>
                                    {frameworks.map((f) => (
                                        <SelectItem
                                            key={f.id}
                                            value={String(f.id)}
                                        >
                                            {f.short_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={assessmentId}
                                onValueChange={(v: string) => {
                                    setAssessment(v);
                                    applyFilters({
                                        assessment_id: v === 'all' ? '' : v,
                                    });
                                }}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Assessment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Assessments
                                    </SelectItem>
                                    {assessments.map((a) => (
                                        <SelectItem
                                            key={a.id}
                                            value={String(a.id)}
                                        >
                                            {a.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                onClick={() => applyFilters({ search })}
                            >
                                Search
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Evidence List */}
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">
                            {evidence.total} file
                            {evidence.total !== 1 ? 's' : ''}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="mt-4 p-0">
                        {evidence.data.length === 0 ? (
                            <div className="p-12 text-center">
                                <FolderOpen className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                                <p className="font-medium text-gray-400">
                                    No evidence files found
                                </p>
                                <p className="mt-1 text-sm text-gray-400">
                                    Upload evidence from within a questionnaire.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {evidence.data.map((ev) => {
                                    const review = getReview(ev);
                                    const isExpanded = expanded[ev.id] ?? false;
                                    const isLoading = reviewing[ev.id] ?? false;
                                    const error = reviewError[ev.id];
                                    const hasReview = review !== null;

                                    return (
                                        <div
                                            key={ev.id}
                                            className="p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex min-w-0 flex-1 items-start gap-3">
                                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                                                        <FileIcon
                                                            type={ev.file_type}
                                                        />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="mb-1 flex flex-wrap items-center gap-2">
                                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                                {ev.title}
                                                            </p>
                                                            {hasReview && (
                                                                <Sparkles
                                                                    className="h-3.5 w-3.5 shrink-0 text-purple-500"
                                                                    aria-label="AI reviewed"
                                                                />
                                                            )}
                                                            <Badge
                                                                variant="outline"
                                                                className={`text-xs ${statusColors[ev.status]}`}
                                                            >
                                                                {ev.status}
                                                            </Badge>
                                                            {ev.is_expired && (
                                                                <Badge className="border border-red-300 bg-red-100 text-xs text-red-700">
                                                                    Expired
                                                                </Badge>
                                                            )}
                                                            {!ev.is_expired &&
                                                                ev.expires_soon && (
                                                                    <Badge className="border border-yellow-300 bg-yellow-100 text-xs text-yellow-700">
                                                                        Expiring
                                                                        Soon
                                                                    </Badge>
                                                                )}
                                                            {ev.ai_verdict &&
                                                                !liveReviews[
                                                                    ev.id
                                                                ] && (
                                                                    <span
                                                                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${verdictConfig[ev.ai_verdict]?.bg ?? ''} ${verdictConfig[ev.ai_verdict]?.color ?? ''}`}
                                                                    >
                                                                        {
                                                                            ev.ai_verdict
                                                                        }
                                                                    </span>
                                                                )}
                                                            <span className="font-mono text-xs text-gray-400">
                                                                {formatSize(
                                                                    ev.file_type,
                                                                )}
                                                            </span>
                                                        </div>

                                                        {/* Control info */}
                                                        {ev.assessment_item && (
                                                            <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                                <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono dark:bg-gray-800">
                                                                    {
                                                                        ev
                                                                            .assessment_item
                                                                            .control
                                                                            .control_id
                                                                    }
                                                                </span>
                                                                <span className="max-w-[250px] truncate">
                                                                    {
                                                                        ev
                                                                            .assessment_item
                                                                            .control
                                                                            .title
                                                                    }
                                                                </span>
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                >
                                                                    {
                                                                        ev
                                                                            .assessment_item
                                                                            .assessment
                                                                            .framework
                                                                            .short_name
                                                                    }
                                                                </Badge>
                                                            </div>
                                                        )}

                                                        {/* Assessment info */}
                                                        {ev.assessment_item && (
                                                            <p className="text-xs text-gray-400">
                                                                Assessment:{' '}
                                                                <span className="font-medium">
                                                                    {
                                                                        ev
                                                                            .assessment_item
                                                                            .assessment
                                                                            .title
                                                                    }
                                                                </span>{' '}
                                                                · Uploaded by{' '}
                                                                {ev.user
                                                                    ?.name ??
                                                                    'Unknown'}{' '}
                                                                ·{' '}
                                                                {new Date(
                                                                    ev.created_at,
                                                                ).toLocaleDateString()}
                                                            </p>
                                                        )}

                                                        {ev.description && (
                                                            <p className="mt-1 text-xs text-gray-500 italic">
                                                                {ev.description}
                                                            </p>
                                                        )}

                                                        <p className="mt-1 text-xs">
                                                            {ev.expiry_date ? (
                                                                <span
                                                                    className={
                                                                        ev.is_expired
                                                                            ? 'font-medium text-red-500'
                                                                            : ev.expires_soon
                                                                              ? 'font-medium text-yellow-600'
                                                                              : 'text-gray-400'
                                                                    }
                                                                >
                                                                    Expires:{' '}
                                                                    {new Date(
                                                                        ev.expiry_date,
                                                                    ).toLocaleDateString()}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400">
                                                                    No Expiry
                                                                </span>
                                                            )}
                                                        </p>

                                                        {/* Inline error */}
                                                        {error && (
                                                            <p className="mt-1 text-xs text-red-500">
                                                                {error}
                                                            </p>
                                                        )}

                                                        {/* Expandable AI review panel */}
                                                        {hasReview &&
                                                            isExpanded && (
                                                                <AiReviewPanel
                                                                    review={
                                                                        review
                                                                    }
                                                                    onApply={(
                                                                        suggestedStatus,
                                                                    ) => {
                                                                        if (
                                                                            suggestedStatus ===
                                                                            'approved'
                                                                        )
                                                                            approve(
                                                                                ev.id,
                                                                            );
                                                                        else if (
                                                                            suggestedStatus ===
                                                                            'rejected'
                                                                        )
                                                                            reject(
                                                                                ev.id,
                                                                            );
                                                                    }}
                                                                />
                                                            )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-1">
                                                    {/* AI Review button */}
                                                    {canReview && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 gap-1 px-2 text-xs text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/30"
                                                            onClick={() =>
                                                                hasReview
                                                                    ? togglePanel(
                                                                          ev.id,
                                                                      )
                                                                    : runAiReview(
                                                                          ev.id,
                                                                      )
                                                            }
                                                            disabled={isLoading}
                                                            title={
                                                                hasReview
                                                                    ? 'Toggle AI review'
                                                                    : 'Run AI review'
                                                            }
                                                        >
                                                            {isLoading ? (
                                                                <>
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />{' '}
                                                                    Reviewing...
                                                                </>
                                                            ) : hasReview ? (
                                                                <>
                                                                    {isExpanded ? (
                                                                        <ChevronUp className="h-3.5 w-3.5" />
                                                                    ) : (
                                                                        <ChevronDown className="h-3.5 w-3.5" />
                                                                    )}
                                                                    <Sparkles className="h-3.5 w-3.5" />{' '}
                                                                    AI Review
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Sparkles className="h-3.5 w-3.5" />{' '}
                                                                    AI Review
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-500 hover:bg-blue-50"
                                                        title="Download"
                                                        onClick={() =>
                                                            download(ev.id)
                                                        }
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>

                                                    {(isAdmin ||
                                                        auth.user.role ===
                                                            'auditor') &&
                                                        ev.status !==
                                                            'approved' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-green-500 hover:bg-green-50"
                                                                title="Approve"
                                                                onClick={() =>
                                                                    approve(
                                                                        ev.id,
                                                                    )
                                                                }
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                            </Button>
                                                        )}

                                                    {(isAdmin ||
                                                        auth.user.role ===
                                                            'auditor') &&
                                                        ev.status !==
                                                            'rejected' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-orange-500 hover:bg-orange-50"
                                                                title="Reject"
                                                                onClick={() =>
                                                                    reject(
                                                                        ev.id,
                                                                    )
                                                                }
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </Button>
                                                        )}

                                                    {isAdmin && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:bg-red-50"
                                                            title="Delete"
                                                            onClick={() =>
                                                                destroy(
                                                                    ev.id,
                                                                    ev.title,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {evidence.links.length > 3 && (
                            <div className="flex items-center justify-center gap-1 border-t p-4">
                                {evidence.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() =>
                                            link.url && router.get(link.url)
                                        }
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
