import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle, XCircle, Download, Trash2, FileText, FileImage, File,
    Loader2, CheckCircle2, AlertTriangle,
    ChevronDown, ChevronUp, Sparkles, Ban,
} from 'lucide-react';
import { useState } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

export interface AiReview {
    verdict:        'Adequate' | 'Partially Adequate' | 'Insufficient';
    confidence:     'High' | 'Medium' | 'Low';
    strengths:      string;
    gaps:           string;
    recommendation: string;
    is_relevant:    boolean;
}

export interface EvidenceItem {
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
    ai_verdict:        string | null;
    ai_confidence:     string | null;
    ai_strengths:      string | null;
    ai_gaps:           string | null;
    ai_recommendation: string | null;
    ai_is_relevant:    boolean | null;
    ai_reviewed_at:    string | null;
    ai_review:         AiReview | null;
    user: { name: string } | null;
    control: {
        control_id: string;
        title: string;
        framework: { short_name: string } | null;
    } | null;
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

export interface EvidenceRowProps {
    ev: EvidenceItem;
    review: AiReview | null;
    isExpanded: boolean;
    isLoading: boolean;
    error?: string;
    warning?: string;
    canReview: boolean;
    isAdmin: boolean;
    isAuditor: boolean;
    liveReviewExists: boolean;
    onRunReview: () => void;
    onTogglePanel: () => void;
    onApprove: () => void;
    onReject: () => void;
    onRejectForRelevance?: () => void;
    onDestroy: () => void;
    onDownload: () => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const statusColors: Record<string, string> = {
    pending:  'bg-yellow-50 text-yellow-700 border-yellow-200',
    approved: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-600 border-red-200',
};

export const verdictConfig: Record<string, { color: string; bg: string }> = {
    'Adequate':           { color: 'text-green-700',  bg: 'bg-green-100 border-green-300' },
    'Partially Adequate': { color: 'text-yellow-700', bg: 'bg-yellow-100 border-yellow-300' },
    'Insufficient':       { color: 'text-red-700',    bg: 'bg-red-100 border-red-300' },
};

export const CONFIDENCE_BADGE: Record<string, string> = {
    High:   'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
    Low:    'bg-red-100 text-red-600 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
};

// ── Sub-components ────────────────────────────────────────────────────────────

export const FileIcon = ({ type }: { type: string }) => {
    if (type.includes('image')) return <FileImage className="w-5 h-5 text-blue-500" />;
    if (type.includes('pdf'))   return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
};

export function AiReviewPanel({ review, onRejectForRelevance }: {
    review: AiReview;
    onRejectForRelevance?: () => void;
}) {
    const vc = verdictConfig[review.verdict] ?? verdictConfig['Insufficient'];
    const [confirmingReject, setConfirmingReject] = useState(false);

    const showRejectButton = review.verdict === 'Insufficient' && review.is_relevant === false && !!onRejectForRelevance;

    return (
        <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${vc.bg} ${vc.color}`}>
                    {review.verdict === 'Adequate'           && <CheckCircle2  className="w-3.5 h-3.5" />}
                    {review.verdict === 'Partially Adequate' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {review.verdict === 'Insufficient'       && <XCircle       className="w-3.5 h-3.5" />}
                    {review.verdict}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${CONFIDENCE_BADGE[review.confidence] ?? CONFIDENCE_BADGE['Medium']}`}>
                    {review.confidence} Confidence
                </span>
                {review.is_relevant === false && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800">
                        <Ban className="w-3 h-3" /> Not Relevant
                    </span>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {review.strengths && (
                    <div>
                        <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">Strengths</p>
                        <p className="text-xs text-green-800 dark:text-green-300 leading-relaxed">{review.strengths}</p>
                    </div>
                )}
                {review.gaps && (
                    <div>
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Gaps</p>
                        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">{review.gaps}</p>
                    </div>
                )}
            </div>
            {review.recommendation && (
                <div className="flex items-start gap-2 bg-muted/60 border border-border rounded-lg px-3 py-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">{review.recommendation}</p>
                </div>
            )}

            {showRejectButton && (
                <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 px-3 py-2.5">
                    {!confirmingReject ? (
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-start gap-2">
                                <Ban className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-red-700 dark:text-red-400">
                                    AI flagged this evidence as <strong>not relevant</strong> to the linked control.
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="h-7 px-3 text-xs shrink-0"
                                onClick={() => setConfirmingReject(true)}
                            >
                                Reject Evidence
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                                Reject this evidence? This marks it as rejected and removes it from compliance counting.
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-7 px-3 text-xs"
                                    onClick={() => { setConfirmingReject(false); onRejectForRelevance!(); }}
                                >
                                    Yes, Reject
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-3 text-xs"
                                    onClick={() => setConfirmingReject(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── EvidenceActions ───────────────────────────────────────────────────────────

interface EvidenceActionsProps {
    ev:           EvidenceItem;
    review:       AiReview | null;
    isExpanded:   boolean;
    isLoading:    boolean;
    canReview:    boolean;
    isAdmin:      boolean;
    isAuditor:    boolean;
    onRunReview:          () => void;
    onTogglePanel:        () => void;
    onApprove:            () => void;
    onReject:             () => void;
    onRejectForRelevance?: () => void;
    onDestroy:            () => void;
    onDownload:           () => void;
}

function EvidenceActions({
    ev, review, isExpanded, isLoading,
    canReview, isAdmin, isAuditor,
    onRunReview, onTogglePanel, onApprove, onReject, onDestroy, onDownload,
}: EvidenceActionsProps) {
    const hasReview = review !== null;
    return (
        <div className="flex items-center gap-1 flex-shrink-0 flex-wrap justify-end">
            {canReview && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-xs gap-1"
                    onClick={() => hasReview ? onTogglePanel() : onRunReview()}
                    disabled={isLoading}
                    title={hasReview ? 'Toggle AI review' : 'Run AI review'}
                >
                    {isLoading
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Reviewing...</>
                        : hasReview
                            ? <>{isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}<Sparkles className="w-3.5 h-3.5" /> AI Review</>
                            : <><Sparkles className="w-3.5 h-3.5" /> AI Review</>
                    }
                </Button>
            )}

            <Button
                variant="ghost" size="icon"
                className="h-8 w-8 text-blue-500 hover:bg-blue-50"
                title="Download"
                onClick={onDownload}
            >
                <Download className="w-4 h-4" />
            </Button>

            {(isAdmin || isAuditor) && ev.status !== 'approved' && (
                <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 text-green-500 hover:bg-green-50"
                    title="Approve"
                    onClick={onApprove}
                >
                    <CheckCircle className="w-4 h-4" />
                </Button>
            )}

            {(isAdmin || isAuditor) && ev.status !== 'rejected' && (
                <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 text-orange-500 hover:bg-orange-50"
                    title="Reject"
                    onClick={onReject}
                >
                    <XCircle className="w-4 h-4" />
                </Button>
            )}

            {isAdmin && (
                <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-50"
                    title="Delete"
                    onClick={onDestroy}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            )}
        </div>
    );
}

// ── EvidenceRow ───────────────────────────────────────────────────────────────

export function EvidenceRow({
    ev, review, isExpanded, isLoading, error, warning,
    canReview, isAdmin, isAuditor, liveReviewExists,
    onRunReview, onTogglePanel, onApprove, onReject, onRejectForRelevance, onDestroy, onDownload,
}: EvidenceRowProps) {
    const hasReview  = review !== null;
    const formatSize = (type: string) => type.split('/')[1]?.toUpperCase() ?? 'FILE';

    return (
        <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <FileIcon type={ev.file_type} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">{ev.title}</p>
                            {hasReview && (
                                <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" aria-label="AI reviewed" />
                            )}
                            <Badge variant="outline" className={`text-xs ${statusColors[ev.status] ?? ''}`}>
                                {ev.status}
                            </Badge>
                            {ev.is_expired && (
                                <Badge className="text-xs bg-red-100 text-red-700 border border-red-300">Expired</Badge>
                            )}
                            {!ev.is_expired && ev.expires_soon && (
                                <Badge className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-300">Expiring Soon</Badge>
                            )}
                            {ev.ai_verdict && !liveReviewExists && (
                                <span
                                    title={ev.ai_reviewed_at ? `Last reviewed: ${new Date(ev.ai_reviewed_at).toLocaleDateString()}` : 'AI reviewed'}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border cursor-default ${verdictConfig[ev.ai_verdict]?.bg ?? ''} ${verdictConfig[ev.ai_verdict]?.color ?? ''}`}
                                >
                                    {ev.ai_verdict}
                                </span>
                            )}
                            <span className="text-xs text-gray-400 font-mono">{formatSize(ev.file_type)}</span>
                        </div>

                        {ev.assessment_item && (
                            <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500 mb-1">
                                <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                    {ev.assessment_item.control.control_id}
                                </span>
                                <span className="truncate max-w-[250px]">{ev.assessment_item.control.title}</span>
                                <Badge variant="outline" className="text-xs">
                                    {ev.assessment_item.assessment.framework.short_name}
                                </Badge>
                            </div>
                        )}

                        {ev.assessment_item && (
                            <p className="text-xs text-gray-400">
                                Assessment: <span className="font-medium">{ev.assessment_item.assessment.title}</span>
                                {' '}· Uploaded by {ev.user?.name ?? 'Unknown'}
                                {' '}· {new Date(ev.created_at).toLocaleDateString()}
                            </p>
                        )}

                        {ev.description && (
                            <p className="text-xs text-gray-500 mt-1 italic">{ev.description}</p>
                        )}

                        <p className="text-xs mt-1">
                            {ev.expiry_date
                                ? <span className={ev.is_expired ? 'text-red-500 font-medium' : ev.expires_soon ? 'text-yellow-600 font-medium' : 'text-gray-400'}>
                                    Expires: {new Date(ev.expiry_date).toLocaleDateString()}
                                  </span>
                                : <span className="text-gray-400">No Expiry</span>
                            }
                        </p>

                        {warning && (
                            <div className="flex items-start gap-2 mt-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-700 dark:text-amber-400">{warning}</p>
                            </div>
                        )}

                        {error && (
                            <p className="text-xs text-red-500 mt-1">{error}</p>
                        )}

                        {hasReview && isExpanded && (
                            <AiReviewPanel review={review} onRejectForRelevance={onRejectForRelevance} />
                        )}
                    </div>
                </div>

                {/* Actions */}
                <EvidenceActions
                    ev={ev} review={review} isExpanded={isExpanded} isLoading={isLoading}
                    canReview={canReview} isAdmin={isAdmin} isAuditor={isAuditor}
                    onRunReview={onRunReview} onTogglePanel={onTogglePanel}
                    onApprove={onApprove} onReject={onReject}
                    onRejectForRelevance={onRejectForRelevance}
                    onDestroy={onDestroy} onDownload={onDownload}
                />
            </div>
        </div>
    );
}

// ── Helper: build AiReview object from flat EvidenceItem fields ───────────────

export function getReviewFromItem(ev: EvidenceItem, liveReviews: Record<number, AiReview>): AiReview | null {
    if (liveReviews[ev.id]) return liveReviews[ev.id];
    if (ev.ai_verdict && ev.ai_strengths !== null) {
        return {
            verdict:        ev.ai_verdict        as AiReview['verdict'],
            confidence:     (ev.ai_confidence ?? 'Medium') as AiReview['confidence'],
            strengths:      ev.ai_strengths      ?? '',
            gaps:           ev.ai_gaps           ?? '',
            recommendation: ev.ai_recommendation ?? '',
            is_relevant:    ev.ai_is_relevant    ?? true,
        };
    }
    return null;
}
