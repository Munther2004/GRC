import { Head } from '@inertiajs/react';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
    CheckCircle2,
    XCircle,
    AlertCircle,
    MinusCircle,
    Clock,
    ArrowRight,
    Loader2,
} from 'lucide-react';
import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import type { SharedProps } from '@/types';
import axios from 'axios';
import {
    EvidenceItem,
    AiReview,
    EvidenceRow,
    getReviewFromItem,
} from '@/components/evidence-row';

// ── Types ────────────────────────────────────────────────────────────────────

interface StatusRequest {
    id: number;
    control_id: string;
    control_title: string;
    framework: string;
    requested_by: string;
    current_status: string | null;
    requested_status: string;
    justification: string | null;
    created_at: string;
    evidence: EvidenceItem | null;
}

interface Props {
    requests: StatusRequest[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
    compliant: 'Compliant',
    partially_compliant: 'Partially Compliant',
    non_compliant: 'Non-Compliant',
    not_applicable: 'N/A',
    not_set: 'Not Set',
};

const STATUS_BADGE: Record<string, string> = {
    compliant: 'bg-green-50 text-green-700 border-green-200',
    partially_compliant: 'bg-amber-50 text-amber-700 border-border',
    non_compliant: 'bg-red-950 text-red-400 border-red-200',
    not_applicable: 'bg-muted text-muted-foreground border-border',
    not_set: 'bg-card text-muted-foreground border-border',
};

function StatusBadge({ status }: { status: string | null }) {
    const key = status ?? 'not_set';
    return (
        <Badge
            variant="outline"
            className={`text-xs ${STATUS_BADGE[key] ?? ''}`}
        >
            {key === 'compliant' && <CheckCircle2 className="mr-1 h-3 w-3" />}
            {key === 'partially_compliant' && (
                <AlertCircle className="mr-1 h-3 w-3" />
            )}
            {key === 'non_compliant' && <XCircle className="mr-1 h-3 w-3" />}
            {key === 'not_applicable' && (
                <MinusCircle className="mr-1 h-3 w-3" />
            )}
            {STATUS_LABELS[key] ?? key}
        </Badge>
    );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function ApprovalQueue({ requests: initial }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const isAuditor = auth.user.role === 'auditor';

    const [requests, setRequests] = useState<StatusRequest[]>(initial);
    const [toast, setToast] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);

    // Per-request AI review state
    const [aiReviewing, setAiReviewing] = useState<Record<number, boolean>>({});
    const [liveReviews, setLiveReviews] = useState<Record<number, AiReview>>(
        {},
    );
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});
    const [reviewError, setReviewError] = useState<Record<number, string>>({});
    const [reviewWarning, setReviewWarning] = useState<Record<number, string>>(
        {},
    );

    // Per-request actioning state (accepting/rejecting via review-evidence)
    const [actioning, setActioning] = useState<number | null>(null);

    // Per-request reviewing state for no-evidence requests
    const [reviewing, setReviewing] = useState<{
        id: number;
        action: 'approve' | 'reject';
        notes: string;
    } | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const showToast = (type: 'success' | 'error', text: string) => {
        setToast({ type, text });
        setTimeout(() => setToast(null), 4000);
    };

    // ── Evidence review (requests with evidence) ─────────────────────────────

    const reviewEvidence = async (
        reqId: number,
        decision: 'accept' | 'reject',
    ) => {
        setActioning(reqId);
        try {
            await axios.post(
                route('controls.status-requests.review-evidence', reqId),
                { decision },
            );
            setRequests((prev) => prev.filter((r) => r.id !== reqId));
            showToast(
                'success',
                decision === 'accept'
                    ? 'Evidence accepted. Status change approved and applied.'
                    : 'Evidence rejected. Status remains unchanged. Requester has been notified.',
            );
        } catch (err: any) {
            const msg =
                err?.response?.data?.error ??
                'Failed to process request. Please try again.';
            showToast('error', msg);
        } finally {
            setActioning(null);
        }
    };

    // ── AI review helpers ─────────────────────────────────────────────────────

    const runAiReview = async (evidenceId: number) => {
        setAiReviewing((prev) => ({ ...prev, [evidenceId]: true }));
        setReviewError((prev) => {
            const n = { ...prev };
            delete n[evidenceId];
            return n;
        });
        setReviewWarning((prev) => {
            const n = { ...prev };
            delete n[evidenceId];
            return n;
        });
        try {
            const { data } = await axios.post(
                route('evidence.ai-review', evidenceId),
            );
            if (data.warning) {
                setReviewWarning((prev) => ({
                    ...prev,
                    [evidenceId]: data.warning,
                }));
                return;
            }
            if (!data.verdict) {
                setReviewError((prev) => ({
                    ...prev,
                    [evidenceId]:
                        'AI review could not be completed. Please try again.',
                }));
                return;
            }
            setLiveReviews((prev) => ({ ...prev, [evidenceId]: data }));
            setExpanded((prev) => ({ ...prev, [evidenceId]: true }));
        } catch (err: any) {
            const msg =
                err?.response?.data?.error ??
                'AI review could not be completed. Please try again.';
            setReviewError((prev) => ({ ...prev, [evidenceId]: msg }));
        } finally {
            setAiReviewing((prev) => ({ ...prev, [evidenceId]: false }));
        }
    };

    // ── No-evidence approve/reject ────────────────────────────────────────────

    const submitNoEvidenceReview = async () => {
        if (!reviewing) return;
        setSubmitting(true);
        try {
            const routeName =
                reviewing.action === 'approve'
                    ? 'controls.status-requests.approve'
                    : 'controls.status-requests.reject';
            await axios.post(route(routeName, reviewing.id), {
                notes: reviewing.notes || null,
            });
            setRequests((prev) => prev.filter((r) => r.id !== reviewing.id));
            setReviewing(null);
            showToast(
                'success',
                reviewing.action === 'approve'
                    ? 'Request approved. Control status has been updated.'
                    : 'Request rejected. The requester has been notified.',
            );
        } catch (err: any) {
            const msg =
                err?.response?.data?.error ??
                'Failed to process request. Please try again.';
            showToast('error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AdminLayout>
            <Head title="Approval Queue" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="font-heading text-4xl font-normal" style={{ color: '#E8DFD4' }}>
                        Approval Queue
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Review pending control status change requests
                    </p>
                </div>

                {/* Content */}
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <Clock className="h-4 w-4 text-amber-500" />
                            {requests.length === 0
                                ? 'No pending requests'
                                : `${requests.length} pending request${requests.length !== 1 ? 's' : ''}`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="mt-4 p-0">
                        {requests.length === 0 ? (
                            <div className="px-6 py-12 text-center text-muted-foreground">
                                <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-400" />
                                <p className="font-medium">All caught up!</p>
                                <p className="mt-1 text-sm">
                                    No pending status change requests at this
                                    time.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {requests.map((req) => (
                                    <div key={req.id} className="px-6 py-4">
                                        {/* Request info */}
                                        <div className="flex flex-wrap items-start gap-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <span className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-xs text-foreground/80">
                                                        {req.control_id}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {req.framework}
                                                    </Badge>
                                                </div>
                                                <p className="truncate text-sm font-medium text-foreground">
                                                    {req.control_title}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Requested by{' '}
                                                    <span className="font-medium">
                                                        {req.requested_by}
                                                    </span>
                                                    {' · '}
                                                    {new Date(
                                                        req.created_at,
                                                    ).toLocaleString()}
                                                </p>
                                            </div>

                                            {/* Status change arrow */}
                                            <div className="flex shrink-0 items-center gap-2 pt-1">
                                                <StatusBadge
                                                    status={req.current_status}
                                                />
                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                <StatusBadge
                                                    status={
                                                        req.requested_status
                                                    }
                                                />
                                            </div>
                                        </div>

                                        {/* Justification */}
                                        {req.justification && (
                                            <div className="mt-3 rounded-lg border border-border/50 bg-muted/30 p-2.5 text-xs text-foreground/80 dark:border-border">
                                                <span className="font-medium text-muted-foreground">
                                                    Justification:{' '}
                                                </span>
                                                {req.justification}
                                            </div>
                                        )}

                                        {/* Evidence row (if attached) */}
                                        {req.evidence ? (
                                            <div className="mt-3 overflow-hidden rounded-lg border border-border/50 dark:border-border">
                                                <p className="px-4 pt-3 text-xs text-muted-foreground/60">
                                                    Accepting the evidence will
                                                    approve the status change.
                                                    Rejecting will keep the
                                                    current status.
                                                </p>
                                                <EvidenceRow
                                                    ev={req.evidence}
                                                    review={getReviewFromItem(
                                                        req.evidence,
                                                        liveReviews,
                                                    )}
                                                    isExpanded={
                                                        expanded[
                                                            req.evidence.id
                                                        ] ?? false
                                                    }
                                                    isLoading={
                                                        aiReviewing[
                                                            req.evidence.id
                                                        ] ?? false
                                                    }
                                                    error={
                                                        reviewError[
                                                            req.evidence.id
                                                        ]
                                                    }
                                                    warning={
                                                        reviewWarning[
                                                            req.evidence.id
                                                        ]
                                                    }
                                                    canReview={true}
                                                    isAdmin={false}
                                                    isAuditor={isAuditor}
                                                    liveReviewExists={
                                                        !!liveReviews[
                                                            req.evidence.id
                                                        ]
                                                    }
                                                    onRunReview={() =>
                                                        runAiReview(
                                                            req.evidence!.id,
                                                        )
                                                    }
                                                    onTogglePanel={() =>
                                                        setExpanded((prev) => ({
                                                            ...prev,
                                                            [req.evidence!.id]:
                                                                !prev[
                                                                    req
                                                                        .evidence!
                                                                        .id
                                                                ],
                                                        }))
                                                    }
                                                    onApprove={() =>
                                                        reviewEvidence(
                                                            req.id,
                                                            'accept',
                                                        )
                                                    }
                                                    onReject={() =>
                                                        reviewEvidence(
                                                            req.id,
                                                            'reject',
                                                        )
                                                    }
                                                    onDestroy={() => {}}
                                                    onDownload={() =>
                                                        window.open(
                                                            route(
                                                                'evidence.download',
                                                                req.evidence!
                                                                    .id,
                                                            ),
                                                            '_blank',
                                                        )
                                                    }
                                                />
                                                {actioning === req.id && (
                                                    <div className="flex items-center gap-2 px-4 pb-3 text-xs text-muted-foreground">
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        Processing...
                                                    </div>
                                                )}
                                            </div>
                                        ) : /* No evidence — standard approve/reject with notes */
                                        reviewing?.id === req.id ? (
                                            <div className="mt-3 space-y-2">
                                                <Textarea
                                                    value={reviewing.notes}
                                                    onChange={(e) =>
                                                        setReviewing((r) =>
                                                            r
                                                                ? {
                                                                      ...r,
                                                                      notes: e
                                                                          .target
                                                                          .value,
                                                                  }
                                                                : r,
                                                        )
                                                    }
                                                    placeholder={
                                                        reviewing.action ===
                                                        'approve'
                                                            ? 'Optional note to the requester...'
                                                            : 'Reason for rejection (recommended)...'
                                                    }
                                                    rows={2}
                                                    className="text-sm"
                                                    autoFocus
                                                />
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        disabled={submitting}
                                                        onClick={
                                                            submitNoEvidenceReview
                                                        }
                                                        className={
                                                            reviewing.action ===
                                                            'approve'
                                                                ? 'gap-1 bg-green-600 text-white hover:bg-green-700'
                                                                : 'gap-1 bg-red-600 text-white hover:bg-red-700'
                                                        }
                                                    >
                                                        {submitting ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : reviewing.action ===
                                                          'approve' ? (
                                                            <>
                                                                <CheckCircle2 className="h-3.5 w-3.5" />{' '}
                                                                Confirm Approval
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="h-3.5 w-3.5" />{' '}
                                                                Confirm
                                                                Rejection
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            setReviewing(null)
                                                        }
                                                        disabled={submitting}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    className="h-8 gap-1 bg-green-600 text-white hover:bg-green-700"
                                                    onClick={() =>
                                                        setReviewing({
                                                            id: req.id,
                                                            action: 'approve',
                                                            notes: '',
                                                        })
                                                    }
                                                >
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 gap-1 border-red-200 text-red-400 hover:bg-red-50"
                                                    onClick={() =>
                                                        setReviewing({
                                                            id: req.id,
                                                            action: 'reject',
                                                            notes: '',
                                                        })
                                                    }
                                                >
                                                    <XCircle className="h-3.5 w-3.5" />
                                                    Reject
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Toast */}
            {toast && (
                <div
                    className={`fixed right-6 bottom-6 z-50 flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${ toast.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800' }`}
                >
                    {toast.type === 'success' ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    )}
                    <span className="flex-1">{toast.text}</span>
                </div>
            )}
        </AdminLayout>
    );
}
