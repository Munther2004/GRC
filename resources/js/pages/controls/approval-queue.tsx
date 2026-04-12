import { Head } from '@inertiajs/react';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
    CheckCircle2, XCircle, AlertCircle, MinusCircle, Clock,
    ArrowRight, Loader2,
} from 'lucide-react';
import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import type { SharedProps } from '@/types';
import axios from 'axios';
import { EvidenceItem, AiReview, EvidenceRow, getReviewFromItem } from '@/components/evidence-row';

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
    compliant:            'Compliant',
    partially_compliant:  'Partially Compliant',
    non_compliant:        'Non-Compliant',
    not_applicable:       'N/A',
    not_set:              'Not Set',
};

const STATUS_BADGE: Record<string, string> = {
    compliant:            'bg-green-50 text-green-700 border-green-200',
    partially_compliant:  'bg-amber-50 text-amber-700 border-amber-200',
    non_compliant:        'bg-red-50 text-red-600 border-red-200',
    not_applicable:       'bg-gray-100 text-gray-500 border-gray-200',
    not_set:              'bg-gray-50 text-gray-400 border-gray-200',
};

function StatusBadge({ status }: { status: string | null }) {
    const key = status ?? 'not_set';
    return (
        <Badge variant="outline" className={`text-xs ${STATUS_BADGE[key] ?? ''}`}>
            {key === 'compliant'           && <CheckCircle2 className="w-3 h-3 mr-1" />}
            {key === 'partially_compliant' && <AlertCircle  className="w-3 h-3 mr-1" />}
            {key === 'non_compliant'       && <XCircle      className="w-3 h-3 mr-1" />}
            {key === 'not_applicable'      && <MinusCircle  className="w-3 h-3 mr-1" />}
            {STATUS_LABELS[key] ?? key}
        </Badge>
    );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function ApprovalQueue({ requests: initial }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const isAuditor = auth.user.role === 'auditor';

    const [requests, setRequests] = useState<StatusRequest[]>(initial);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Per-request AI review state
    const [aiReviewing, setAiReviewing]     = useState<Record<number, boolean>>({});
    const [liveReviews, setLiveReviews]     = useState<Record<number, AiReview>>({});
    const [expanded, setExpanded]           = useState<Record<number, boolean>>({});
    const [reviewError, setReviewError]     = useState<Record<number, string>>({});
    const [reviewWarning, setReviewWarning] = useState<Record<number, string>>({});

    // Per-request actioning state (accepting/rejecting via review-evidence)
    const [actioning, setActioning] = useState<number | null>(null);

    // Per-request reviewing state for no-evidence requests
    const [reviewing, setReviewing] = useState<{ id: number; action: 'approve' | 'reject'; notes: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const showToast = (type: 'success' | 'error', text: string) => {
        setToast({ type, text });
        setTimeout(() => setToast(null), 4000);
    };

    // ── Evidence review (requests with evidence) ─────────────────────────────

    const reviewEvidence = async (reqId: number, decision: 'accept' | 'reject') => {
        setActioning(reqId);
        try {
            await axios.post(route('controls.status-requests.review-evidence', reqId), { decision });
            setRequests(prev => prev.filter(r => r.id !== reqId));
            showToast(
                'success',
                decision === 'accept'
                    ? 'Evidence accepted. Status change approved and applied.'
                    : 'Evidence rejected. Status remains unchanged. Requester has been notified.'
            );
        } catch (err: any) {
            const msg = err?.response?.data?.error ?? 'Failed to process request. Please try again.';
            showToast('error', msg);
        } finally {
            setActioning(null);
        }
    };

    // ── AI review helpers ─────────────────────────────────────────────────────

    const runAiReview = async (evidenceId: number) => {
        setAiReviewing(prev => ({ ...prev, [evidenceId]: true }));
        setReviewError(prev => { const n = { ...prev }; delete n[evidenceId]; return n; });
        setReviewWarning(prev => { const n = { ...prev }; delete n[evidenceId]; return n; });
        try {
            const { data } = await axios.post(route('evidence.ai-review', evidenceId));
            if (data.warning) {
                setReviewWarning(prev => ({ ...prev, [evidenceId]: data.warning }));
                return;
            }
            if (!data.verdict) {
                setReviewError(prev => ({ ...prev, [evidenceId]: 'AI review could not be completed. Please try again.' }));
                return;
            }
            setLiveReviews(prev => ({ ...prev, [evidenceId]: data }));
            setExpanded(prev => ({ ...prev, [evidenceId]: true }));
        } catch (err: any) {
            const msg = err?.response?.data?.error ?? 'AI review could not be completed. Please try again.';
            setReviewError(prev => ({ ...prev, [evidenceId]: msg }));
        } finally {
            setAiReviewing(prev => ({ ...prev, [evidenceId]: false }));
        }
    };

    // ── No-evidence approve/reject ────────────────────────────────────────────

    const submitNoEvidenceReview = async () => {
        if (!reviewing) return;
        setSubmitting(true);
        try {
            const routeName = reviewing.action === 'approve'
                ? 'controls.status-requests.approve'
                : 'controls.status-requests.reject';
            await axios.post(route(routeName, reviewing.id), { notes: reviewing.notes || null });
            setRequests(prev => prev.filter(r => r.id !== reviewing.id));
            setReviewing(null);
            showToast(
                'success',
                reviewing.action === 'approve'
                    ? 'Request approved. Control status has been updated.'
                    : 'Request rejected. The requester has been notified.'
            );
        } catch (err: any) {
            const msg = err?.response?.data?.error ?? 'Failed to process request. Please try again.';
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Approval Queue</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Review pending control status change requests
                    </p>
                </div>

                {/* Content */}
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-500" />
                            {requests.length === 0
                                ? 'No pending requests'
                                : `${requests.length} pending request${requests.length !== 1 ? 's' : ''}`
                            }
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 mt-4">
                        {requests.length === 0 ? (
                            <div className="px-6 py-12 text-center text-gray-400">
                                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-400" />
                                <p className="font-medium">All caught up!</p>
                                <p className="text-sm mt-1">No pending status change requests at this time.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {requests.map(req => (
                                    <div key={req.id} className="px-6 py-4">

                                        {/* Request info */}
                                        <div className="flex flex-wrap items-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">
                                                        {req.control_id}
                                                    </span>
                                                    <Badge variant="outline" className="text-xs">{req.framework}</Badge>
                                                </div>
                                                <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                                    {req.control_title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Requested by <span className="font-medium">{req.requested_by}</span>
                                                    {' · '}
                                                    {new Date(req.created_at).toLocaleString()}
                                                </p>
                                            </div>

                                            {/* Status change arrow */}
                                            <div className="flex items-center gap-2 shrink-0 pt-1">
                                                <StatusBadge status={req.current_status} />
                                                <ArrowRight className="w-4 h-4 text-gray-400" />
                                                <StatusBadge status={req.requested_status} />
                                            </div>
                                        </div>

                                        {/* Justification */}
                                        {req.justification && (
                                            <div className="mt-3 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                                                <span className="font-medium text-gray-500 dark:text-gray-400">Justification: </span>
                                                {req.justification}
                                            </div>
                                        )}

                                        {/* Evidence row (if attached) */}
                                        {req.evidence ? (
                                            <div className="mt-3 rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                                                <p className="px-4 pt-3 text-xs text-gray-400 dark:text-gray-500">
                                                    Accepting the evidence will approve the status change. Rejecting will keep the current status.
                                                </p>
                                                <EvidenceRow
                                                    ev={req.evidence}
                                                    review={getReviewFromItem(req.evidence, liveReviews)}
                                                    isExpanded={expanded[req.evidence.id] ?? false}
                                                    isLoading={aiReviewing[req.evidence.id] ?? false}
                                                    error={reviewError[req.evidence.id]}
                                                    warning={reviewWarning[req.evidence.id]}
                                                    canReview={true}
                                                    isAdmin={false}
                                                    isAuditor={isAuditor}
                                                    liveReviewExists={!!liveReviews[req.evidence.id]}
                                                    onRunReview={() => runAiReview(req.evidence!.id)}
                                                    onTogglePanel={() => setExpanded(prev => ({ ...prev, [req.evidence!.id]: !prev[req.evidence!.id] }))}
                                                    onApprove={() => reviewEvidence(req.id, 'accept')}
                                                    onReject={() => reviewEvidence(req.id, 'reject')}
                                                    onDestroy={() => {}}
                                                    onDownload={() => window.open(route('evidence.download', req.evidence!.id), '_blank')}
                                                />
                                                {actioning === req.id && (
                                                    <div className="px-4 pb-3 flex items-center gap-2 text-xs text-gray-400">
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        Processing...
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            /* No evidence — standard approve/reject with notes */
                                            reviewing?.id === req.id ? (
                                                <div className="mt-3 space-y-2">
                                                    <Textarea
                                                        value={reviewing.notes}
                                                        onChange={e => setReviewing(r => r ? { ...r, notes: e.target.value } : r)}
                                                        placeholder={reviewing.action === 'approve'
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
                                                            onClick={submitNoEvidenceReview}
                                                            className={reviewing.action === 'approve'
                                                                ? 'bg-green-600 hover:bg-green-700 text-white gap-1'
                                                                : 'bg-red-600 hover:bg-red-700 text-white gap-1'
                                                            }
                                                        >
                                                            {submitting
                                                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                : reviewing.action === 'approve'
                                                                    ? <><CheckCircle2 className="w-3.5 h-3.5" /> Confirm Approval</>
                                                                    : <><XCircle className="w-3.5 h-3.5" /> Confirm Rejection</>
                                                            }
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={() => setReviewing(null)} disabled={submitting}>
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 text-white gap-1 h-8"
                                                        onClick={() => setReviewing({ id: req.id, action: 'approve', notes: '' })}
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-red-200 text-red-600 hover:bg-red-50 gap-1 h-8"
                                                        onClick={() => setReviewing({ id: req.id, action: 'reject', notes: '' })}
                                                    >
                                                        <XCircle className="w-3.5 h-3.5" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            )
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
                <div className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg text-sm max-w-sm
                    ${toast.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                    {toast.type === 'success'
                        ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
                        : <XCircle      className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                    }
                    <span className="flex-1">{toast.text}</span>
                </div>
            )}
        </AdminLayout>
    );
}
