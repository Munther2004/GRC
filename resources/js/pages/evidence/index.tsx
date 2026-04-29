import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    Search,
    FolderOpen,
    CheckCircle,
    XCircle,
    LayoutList,
    Layers,
    X,
    AlertTriangle,
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import type {
    AiReview,
    EvidenceItem,
    EvidenceRowProps} from '@/components/evidence-row';
import {
    EvidenceRow,
    getReviewFromItem,
} from '@/components/evidence-row';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterBar } from '@/components/ui/filter-bar';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { StatStrip } from '@/components/ui/stat-strip';
import AdminLayout from '@/layouts/admin-layout';
import { route } from '@/lib/routes';
import type { SharedProps } from '@/types';

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

type GroupStatus = 'adequate' | 'partial' | 'insufficient' | 'unreviewed';

const GROUP_STATUS: Record<
    GroupStatus,
    { dot: string; label: string; text: string }
> = {
    adequate: {
        dot: 'bg-[#46bd5f]',
        label: 'Adequate',
        text: 'text-[#46bd5f]',
    },
    partial: {
        dot: 'bg-[#f5b929]',
        label: 'Partially Adequate',
        text: 'text-[#f5b929]',
    },
    insufficient: {
        dot: 'bg-[#e5484d]',
        label: 'Insufficient',
        text: 'text-[#e5484d]',
    },
    unreviewed: {
        dot: 'bg-muted-foreground/40',
        label: 'No AI Review',
        text: 'text-muted-foreground',
    },
};

function getGroupStatus(
    items: EvidenceItem[],
    liveReviews: Record<number, AiReview>,
): GroupStatus {
    const verdicts = items
        .map((ev) => liveReviews[ev.id]?.verdict ?? ev.ai_verdict ?? '')
        .filter(Boolean);
    if (verdicts.length === 0) return 'unreviewed';
    if (verdicts.some((v) => v === 'Adequate')) return 'adequate';
    if (verdicts.some((v) => v === 'Partially Adequate')) return 'partial';
    return 'insufficient';
}

export default function EvidenceIndex({
    evidence,
    frameworks,
    assessments,
    stats,
    filters,
}: Props) {
    const { auth } = usePage<SharedProps>().props;
    const isAdmin = auth.user.role === 'super_admin' || auth.user.role === 'admin';
    const isAuditor = auth.user.role === 'auditor';
    const canReview = isAdmin || isAuditor;

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [frameworkId, setFramework] = useState(filters.framework_id ?? 'all');
    const [assessmentId, setAssessment] = useState(
        filters.assessment_id ?? 'all',
    );
    const [viewMode, setViewMode] = useState<'list' | 'policy'>('list');

    // Toast
    const [toast, setToast] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 5000);
        return () => clearTimeout(t);
    }, [toast]);

    const formatStatus = (s: string | null) => {
        if (!s || s === 'not_set') return 'Not Set';
        return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    };

    // AI review state
    const [reviewing, setReviewing] = useState<Record<number, boolean>>({});
    const [liveReviews, setLiveReviews] = useState<Record<number, AiReview>>(
        {},
    );
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});
    const [reviewError, setReviewError] = useState<Record<number, string>>({});
    const [reviewWarning, setReviewWarning] = useState<Record<number, string>>(
        {},
    );

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

    const rejectForRelevance = async (id: number) => {
        try {
            const { data } = await axios.post(route('evidence.reject', id));
            const msg = data.control_reverted
                ? `Evidence rejected. Control status reverted to "${formatStatus(data.reverted_to)}".`
                : 'Evidence rejected.';
            setToast({ type: 'success', text: msg });
            router.reload({ only: ['evidence', 'stats'] });
        } catch {
            setToast({
                type: 'error',
                text: 'Failed to reject evidence. Please try again.',
            });
        }
    };
    const destroy = (id: number, title: string) => {
        if (!confirm(`Delete evidence "${title}"?`)) return;
        router.delete(route('evidence.destroy', id));
    };
    const download = (id: number) =>
        window.open(route('evidence.download', id), '_blank');

    const runAiReview = async (id: number) => {
        setReviewing((prev) => ({ ...prev, [id]: true }));
        setReviewError((prev) => {
            const n = { ...prev };
            delete n[id];
            return n;
        });
        setReviewWarning((prev) => {
            const n = { ...prev };
            delete n[id];
            return n;
        });

        try {
            const { data } = await axios.post(route('evidence.ai-review', id));
            if (data.warning) {
                setReviewWarning((prev) => ({ ...prev, [id]: data.warning }));
                return;
            }
            if (!data.verdict) {
                setReviewError((prev) => ({
                    ...prev,
                    [id]: 'AI review could not be completed. Please try again.',
                }));
                return;
            }
            setLiveReviews((prev) => ({ ...prev, [id]: data }));
            setExpanded((prev) => ({ ...prev, [id]: true }));
        } catch (err: any) {
            const msg =
                err.response?.data?.error ??
                'AI review could not be completed. Please try again.';
            setReviewError((prev) => ({ ...prev, [id]: msg }));
        } finally {
            setReviewing((prev) => ({ ...prev, [id]: false }));
        }
    };

    const togglePanel = (id: number) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // Group evidence by control for Policy View
    const { controlGroups, unlinked } = useMemo(() => {
        const groupMap: Record<
            string,
            {
                key: string;
                controlId: string;
                controlTitle: string;
                framework: string;
                items: EvidenceItem[];
            }
        > = {};
        const unlinkedItems: EvidenceItem[] = [];

        for (const ev of evidence.data) {
            // Prefer assessment_item.control, fall back to direct control link (Controls Hub uploads)
            const ctrl = ev.assessment_item?.control ?? ev.control ?? null;
            const framework =
                ev.assessment_item?.assessment.framework.short_name ??
                ev.control?.framework?.short_name ??
                'Unknown';

            if (ctrl) {
                const key = ctrl.control_id;
                if (!groupMap[key]) {
                    groupMap[key] = {
                        key,
                        controlId: ctrl.control_id,
                        controlTitle: ctrl.title,
                        framework,
                        items: [],
                    };
                }
                groupMap[key].items.push(ev);
            } else {
                unlinkedItems.push(ev);
            }
        }

        return {
            controlGroups: Object.values(groupMap).sort((a, b) =>
                a.controlId.localeCompare(b.controlId),
            ),
            unlinked: unlinkedItems,
        };
    }, [evidence.data]);

    const rowProps = (ev: EvidenceItem): EvidenceRowProps => ({
        ev,
        review: getReviewFromItem(ev, liveReviews),
        isExpanded: expanded[ev.id] ?? false,
        isLoading: reviewing[ev.id] ?? false,
        error: reviewError[ev.id],
        warning: reviewWarning[ev.id],
        canReview,
        isAdmin,
        isAuditor,
        liveReviewExists: !!liveReviews[ev.id],
        onRunReview: () => runAiReview(ev.id),
        onTogglePanel: () => togglePanel(ev.id),
        onApprove: () => approve(ev.id),
        onReject: () => reject(ev.id),
        onRejectForRelevance: () => rejectForRelevance(ev.id),
        onDestroy: () => destroy(ev.id, ev.title),
        onDownload: () => download(ev.id),
    });

    return (
        <AdminLayout>
            <Head title="Evidence" />

            <div className="space-y-6">
                <PageHeader
                    title="Evidence"
                    description="All uploaded compliance evidence files"
                />

                <StatStrip
                    stats={[
                        {
                            label: 'Total Files',
                            value: stats.total,
                            tone: 'neutral',
                        },
                        {
                            label: 'Pending',
                            value: stats.pending,
                            tone: stats.pending > 0 ? 'warn' : 'neutral',
                        },
                        {
                            label: 'Approved',
                            value: stats.approved,
                            tone: stats.approved > 0 ? 'ok' : 'neutral',
                        },
                        {
                            label: 'Rejected',
                            value: stats.rejected,
                            tone: stats.rejected > 0 ? 'bad' : 'neutral',
                        },
                    ]}
                />

                <FilterBar>
                    <div className="relative min-w-48 flex-1">
                        <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search evidence..."
                            value={search}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) => setSearch(e.target.value)}
                            onKeyDown={(e: React.KeyboardEvent) =>
                                e.key === 'Enter' && applyFilters({ search })
                            }
                            className="h-8 pl-9 text-sm"
                        />
                    </div>
                    <Select
                        value={status}
                        onValueChange={(v: string) => {
                            setStatus(v);
                            applyFilters({ status: v === 'all' ? '' : v });
                        }}
                    >
                        <SelectTrigger className="h-8 w-36 text-sm">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
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
                        <SelectTrigger className="h-8 w-40 text-sm">
                            <SelectValue placeholder="Framework" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Frameworks</SelectItem>
                            {frameworks.map((f) => (
                                <SelectItem key={f.id} value={String(f.id)}>
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
                        <SelectTrigger className="h-8 w-48 text-sm">
                            <SelectValue placeholder="Assessment" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Assessments</SelectItem>
                            {assessments.map((a) => (
                                <SelectItem key={a.id} value={String(a.id)}>
                                    {a.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyFilters({ search })}
                    >
                        Search
                    </Button>
                </FilterBar>

                {/* View Toggle + Evidence */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {evidence.total} file
                            {evidence.total !== 1 ? 's' : ''}
                        </p>
                        <div className="flex items-center gap-1 rounded-full bg-muted p-1">
                            <Button
                                variant={
                                    viewMode === 'list' ? 'default' : 'ghost'
                                }
                                size="sm"
                                className="h-7 gap-1.5 px-3 text-xs"
                                onClick={() => setViewMode('list')}
                            >
                                <LayoutList className="h-3.5 w-3.5" />
                                List View
                            </Button>
                            <Button
                                variant={
                                    viewMode === 'policy' ? 'default' : 'ghost'
                                }
                                size="sm"
                                className="h-7 gap-1.5 px-3 text-xs"
                                onClick={() => setViewMode('policy')}
                            >
                                <Layers className="h-3.5 w-3.5" />
                                Policy View
                            </Button>
                        </div>
                    </div>

                    {/* LIST VIEW */}
                    {viewMode === 'list' && (
                        <Card>
                            <CardContent className="p-0">
                                {evidence.data.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <FolderOpen className="mx-auto mb-3 h-12 w-12" style={{ color: 'var(--muted-foreground)' }} />
                                        <p className="font-medium text-muted-foreground">
                                            No evidence files found
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Upload evidence from within a
                                            questionnaire.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {evidence.data.map((ev) => (
                                            <EvidenceRow
                                                key={ev.id}
                                                {...rowProps(ev)}
                                            />
                                        ))}
                                    </div>
                                )}
                                {evidence.links.length > 3 && (
                                    <div className="flex items-center justify-center gap-1 border-t p-4">
                                        {evidence.links.map((link, i) => (
                                            <Button
                                                key={i}
                                                variant={
                                                    link.active
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() =>
                                                    link.url &&
                                                    router.get(link.url)
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
                    )}

                    {/* POLICY VIEW */}
                    {viewMode === 'policy' && (
                        <div className="space-y-4">
                            {evidence.data.length === 0 && (
                                <Card>
                                    <CardContent className="p-12 text-center">
                                        <FolderOpen className="mx-auto mb-3 h-12 w-12" style={{ color: 'var(--muted-foreground)' }} />
                                        <p className="font-medium text-muted-foreground">
                                            No evidence files found
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Upload evidence from within a
                                            questionnaire.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Unlinked evidence */}
                            {unlinked.length > 0 && (
                                <Card style={{ borderColor: 'rgba(245,185,41,0.3)' }}>
                                    <CardHeader className="px-4 pt-4 pb-2">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: '#f5b929' }} />
                                            <CardTitle className="text-sm" style={{ color: '#f5b929', fontWeight: 500 }}>
                                                Unlinked Evidence (
                                                {unlinked.length} file
                                                {unlinked.length !== 1
                                                    ? 's'
                                                    : ''}
                                                )
                                            </CardTitle>
                                        </div>
                                        <p className="mt-1 text-xs" style={{ color: '#f5b929', opacity: 0.7 }}>
                                            These files are not linked to any
                                            control and will not count toward
                                            compliance. Link them to a control
                                            from within a questionnaire.
                                        </p>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y" style={{ borderColor: 'rgba(245,185,41,0.2)' }}>
                                            {unlinked.map((ev) => (
                                                <EvidenceRow
                                                    key={ev.id}
                                                    {...rowProps(ev)}
                                                />
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Control groups */}
                            {controlGroups.map((group) => {
                                const groupStatus = getGroupStatus(
                                    group.items,
                                    liveReviews,
                                );
                                const sc = GROUP_STATUS[groupStatus];

                                return (
                                    <Card key={group.key}>
                                        <CardHeader className="px-4 pt-4 pb-2">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <span
                                                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${sc.dot}`}
                                                    />
                                                    <CardTitle className="text-sm" style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                                                        <span className="mr-1.5 font-mono" style={{ color: 'var(--muted-foreground)' }}>
                                                            {group.controlId}
                                                        </span>
                                                        {group.controlTitle}
                                                    </CardTitle>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {group.framework}
                                                    </Badge>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs text-muted-foreground"
                                                    >
                                                        {group.items.length}{' '}
                                                        file
                                                        {group.items.length !==
                                                        1
                                                            ? 's'
                                                            : ''}
                                                    </Badge>
                                                    <span
                                                        className={`text-xs font-medium ${sc.text}`}
                                                    >
                                                        {sc.label}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="divide-y divide-border">
                                                {group.items.map((ev) => (
                                                    <EvidenceRow
                                                        key={ev.id}
                                                        {...rowProps(ev)}
                                                    />
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Toast notification */}
            {toast && (
                <div
                    className="fixed right-6 bottom-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-xl backdrop-blur-xl"
                    style={{
                        borderColor: toast.type === 'success' ? 'rgba(70,189,95,0.3)' : 'rgba(229,72,77,0.3)',
                        background: 'var(--popover)',
                        color: 'var(--foreground)',
                    }}
                >
                    {toast.type === 'success' ? (
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: '#46bd5f' }} />
                    ) : (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--destructive)' }} />
                    )}
                    <span className="flex-1">{toast.text}</span>
                    <button
                        onClick={() => setToast(null)}
                        className="shrink-0 opacity-60 hover:opacity-100"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}
        </AdminLayout>
    );
}
