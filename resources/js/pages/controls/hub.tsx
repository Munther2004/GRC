import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import type {
    File} from 'lucide-react';
import {
    CheckCircle2,
    XCircle,
    MinusCircle,
    AlertCircle,
    Shield,
    Search,
    Clock,
    FileWarning,
    FileX,
    FileCheck2,
    Loader2,
    History,
    ChevronRight,
    ArrowRight,
    X,
    Upload,
    Paperclip,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layout';
import { route } from '@/lib/routes';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// ── Types ────────────────────────────────────────────────────────────────────

interface ControlRow {
    id: number;
    control_id: string;
    title: string;
    description: string;
    category: string;
    current_status:
        | 'compliant'
        | 'partially_compliant'
        | 'non_compliant'
        | 'not_applicable'
        | null;
    last_remediated_at: string | null;
    remediation_notes: string | null;
    framework: { id: number; short_name: string };
    risks_count: number;
    highest_risk_level: 'critical' | 'high' | 'medium' | 'low' | null;
    evidence_status: 'valid' | 'expiring' | 'expired' | 'none';
    has_weak_evidence: boolean;
    linked_evidence: EvidenceItem[];
    latest_history: {
        user_name: string;
        created_at: string;
        new_status: string;
    } | null;
    pending_request: {
        id: number;
        requested_status: string;
        requested_by: string;
        created_at: string;
    } | null;
}

interface EvidenceItem {
    id: number;
    title: string;
    file_name: string;
    status: string;
    is_expired: boolean;
    expires_soon: boolean;
    expiry_date: string | null;
    ai_verdict: string | null;
}

interface HistoryEntry {
    id: number;
    old_status: string | null;
    new_status: string;
    notes: string | null;
    user_name: string;
    created_at: string;
}

interface Stats {
    total: number;
    compliant: number;
    partiallyCompliant: number;
    nonCompliant: number;
    notApplicable: number;
    notSet: number;
    compliancePct: number;
}

interface Props {
    controls: {
        data: ControlRow[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    frameworks: { id: number; short_name: string; name: string }[];
    filters: { search?: string; status?: string; framework?: string };
    stats: Stats;
}

interface RemediationStep {
    step: number;
    action: string;
    detail: string;
    evidence_needed: string;
}

interface RemediationPlan {
    summary: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    estimated_effort: string;
    remediation_steps: RemediationStep[];
    quick_wins: string[];
    resources_needed: string[];
}

// ── Status helpers ───────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
    compliant: 'Compliant',
    partially_compliant: 'Partially Compliant',
    non_compliant: 'Non-Compliant',
    not_applicable: 'N/A',
};

const STATUS_BADGE: Record<string, string> = {
    compliant:
        'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
    partially_compliant:
        'bg-amber-50 text-amber-700 border-border dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    non_compliant:
        'bg-red-950 text-red-400 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    not_applicable:
        'bg-muted text-muted-foreground border-border dark:bg-secondary dark:text-muted-foreground dark:border-border',
};

const RISK_LEVEL_BADGE: Record<string, string> = {
    critical: 'bg-red-600 text-white',
    high: 'bg-orange-500 text-white',
    medium: 'bg-yellow-500 text-black',
    low: 'bg-green-600 text-white',
};

const PRIORITY_STYLES: Record<string, string> = {
    Critical: 'bg-red-950 text-red-400 border-red-300',
    High: 'bg-orange-950 text-orange-400 border-orange-300',
    Medium: 'bg-amber-950 text-amber-400 border-yellow-300',
    Low: 'bg-emerald-950 text-emerald-400 border-green-300',
};

function StatusBadge({ status }: { status: ControlRow['current_status'] }) {
    if (!status) {
        return (
            <Badge
                variant="outline"
                className="border-border bg-card text-xs text-muted-foreground dark:bg-secondary dark:text-muted-foreground"
            >
                Not Set
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className={`text-xs ${STATUS_BADGE[status]}`}>
            {status === 'compliant' && (
                <CheckCircle2 className="mr-1 h-3 w-3" />
            )}
            {status === 'partially_compliant' && (
                <AlertCircle className="mr-1 h-3 w-3" />
            )}
            {status === 'non_compliant' && <XCircle className="mr-1 h-3 w-3" />}
            {status === 'not_applicable' && (
                <MinusCircle className="mr-1 h-3 w-3" />
            )}
            {STATUS_LABELS[status]}
        </Badge>
    );
}

function EvidenceBadge({ status }: { status: ControlRow['evidence_status'] }) {
    if (status === 'none') {
        return <span className="text-muted-foreground">—</span>;
    }
    const config = {
        valid: {
            icon: FileCheck2,
            cls: 'text-emerald-400',
            label: 'Evidence OK',
        },
        expiring: {
            icon: FileWarning,
            cls: 'text-amber-400',
            label: 'Expiring Soon',
        },
        expired: { icon: FileX, cls: 'text-red-500', label: 'Expired' },
    }[status];

    const Icon = config.icon;
    return (
        <span className={`flex items-center gap-1 text-xs ${config.cls}`}>
            <Icon className="h-3.5 w-3.5" /> {config.label}
        </span>
    );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function ControlsHub({
    controls,
    frameworks,
    filters,
    stats,
}: Props) {
    const { auth } = usePage<{
        auth: { user: { role: string; name: string } };
    }>().props;
    const canReview =
        auth.user.role === 'super_admin' || auth.user.role === 'admin' || auth.user.role === 'auditor';

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [framework, setFramework] = useState(filters.framework ?? 'all');

    // Local controls state (for optimistic update after status change)
    const [localControls, setLocalControls] = useState<ControlRow[]>(
        controls.data,
    );

    // Sync when Inertia reloads
    useEffect(() => {
        setLocalControls(controls.data);
    }, [controls.data]);

    // Toast
    const [toast, setToast] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(t);
    }, [toast]);

    // Update Status modal
    const [updateModal, setUpdateModal] = useState<ControlRow | null>(null);
    const [updateForm, setUpdateForm] = useState({
        new_status: '',
        notes: '',
        evidence_id: '',
    });
    const [submitting, setSubmitting] = useState(false);

    // Evidence upload state (inside the Update Status modal)
    const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
    const [evidenceTitle, setEvidenceTitle] = useState('');
    const [evidenceDescription, setEvidenceDescription] = useState('');
    const evidenceFileRef = useRef<HTMLInputElement | null>(null);

    const openUpdate = (ctrl: ControlRow) => {
        setUpdateModal(ctrl);
        setUpdateForm({
            new_status: ctrl.current_status ?? '',
            notes: '',
            evidence_id: '',
        });
        setEvidenceFile(null);
        setEvidenceTitle('');
        setEvidenceDescription('');
    };

    const submitUpdate = async () => {
        if (!updateModal || !updateForm.new_status) return;
        setSubmitting(true);
        try {
            let payload: FormData | Record<string, any>;
            let config: Record<string, any> = {};

            if (evidenceFile) {
                const fd = new FormData();
                fd.append('new_status', updateForm.new_status);
                if (updateForm.notes)
                    fd.append('justification', updateForm.notes);
                fd.append('file', evidenceFile);
                fd.append('evidence_title', evidenceTitle || evidenceFile.name);
                if (evidenceDescription)
                    fd.append('evidence_description', evidenceDescription);
                payload = fd;
                config = { headers: { 'Content-Type': 'multipart/form-data' } };
            } else {
                payload = {
                    new_status: updateForm.new_status,
                    justification: updateForm.notes || null,
                };
            }
            const res = await axios.post(
                route('controls.request-status', { control: updateModal.id }),
                payload,
                config,
            );
            // Update local state: control stays at current status, pending_request is set
            setLocalControls((prev) =>
                prev.map((c) => {
                    if (c.id !== updateModal.id) return c;
                    return { ...c, pending_request: res.data.pending_request };
                }),
            );
            const evidenceNote = res.data.evidence_uploaded
                ? ' Evidence uploaded for review.'
                : '';
            setToast({
                type: 'success',
                text: `Status change submitted for approval.${evidenceNote}`,
            });
            setUpdateModal(null);
        } catch (err: any) {
            const msg =
                err?.response?.data?.error ??
                'Failed to submit request. Please try again.';
            setToast({ type: 'error', text: msg });
        } finally {
            setSubmitting(false);
        }
    };

    // View History modal
    const [historyModal, setHistoryModal] = useState<{
        ctrl: ControlRow;
        entries: HistoryEntry[];
    } | null>(null);
    const [historyLoading, setHistoryLoading] = useState(false);

    const openHistory = async (ctrl: ControlRow) => {
        setHistoryLoading(true);
        setHistoryModal({ ctrl, entries: [] });
        try {
            const res = await axios.get(route('controls.history', ctrl.id));
            setHistoryModal({ ctrl, entries: res.data });
        } catch {
            setToast({ type: 'error', text: 'Failed to load history.' });
            setHistoryModal(null);
        } finally {
            setHistoryLoading(false);
        }
    };

    // AI Fix modal (reuses gap remediation endpoint)
    const [analyzing, setAnalyzing] = useState<number | null>(null);
    const [planModal, setPlanModal] = useState<{
        ctrl: ControlRow;
        plan: RemediationPlan;
    } | null>(null);
    const [saving, setSaving] = useState(false);
    const [savedRisk, setSavedRisk] = useState<{
        id: number;
        title: string;
    } | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    const handleAiFix = async (ctrl: ControlRow) => {
        setAnalyzing(ctrl.id);
        try {
            const res = await axios.post('/ai/remediate-gap', {
                control_id: ctrl.id,
                control_code: ctrl.control_id,
                control_title: ctrl.title,
                control_description: ctrl.description,
                control_category: ctrl.category,
                framework: ctrl.framework.short_name,
                compliance_status: 'non_compliant',
            });
            setSavedRisk(null);
            setSaveError(null);
            setPlanModal({ ctrl, plan: res.data });
        } catch {
            setToast({
                type: 'error',
                text: 'Failed to generate remediation plan. Please try again.',
            });
        } finally {
            setAnalyzing(null);
        }
    };

    const handleSavePlan = async () => {
        if (!planModal) return;
        setSaving(true);
        setSaveError(null);
        try {
            const res = await axios.post('/ai/save-remediation', {
                control_id: planModal.ctrl.id,
                plan_text: formatPlan(planModal.ctrl, planModal.plan),
            });
            setSavedRisk({ id: res.data.risk_id, title: res.data.risk_title });
        } catch (err: any) {
            setSaveError(
                err?.response?.data?.error ??
                    'Failed to save remediation notes.',
            );
        } finally {
            setSaving(false);
        }
    };

    // Filters
    const applyFilters = (overrides: Record<string, string> = {}) => {
        router.get(
            route('controls.hub'),
            {
                search,
                status: status === 'all' ? '' : status,
                framework: framework === 'all' ? '' : framework,
                ...overrides,
            },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AdminLayout>
            <Head title="Controls Hub" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-heading text-4xl font-normal text-foreground">
                            Controls Hub
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Live compliance status across all controls
                        </p>
                    </div>
                    {canReview && (
                        <Link href={route('controls.approvals')}>
                            <Button variant="outline" className="gap-2 text-sm">
                                <Clock className="h-4 w-4 text-amber-500" />
                                Approval Queue
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Summary bar */}
                <Card>
                    <CardContent className="space-y-3 p-4">
                        <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-6">
                            <div>
                                <p className="text-2xl font-bold">
                                    {stats.total}
                                </p>
                                <p className="text-xs text-muted-foreground">Total</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-emerald-400">
                                    {stats.compliant}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Compliant
                                </p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-amber-400">
                                    {stats.partiallyCompliant}
                                </p>
                                <p className="text-xs text-muted-foreground">Partial</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-400">
                                    {stats.nonCompliant}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Non-Compliant
                                </p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-muted-foreground">
                                    {stats.notApplicable}
                                </p>
                                <p className="text-xs text-muted-foreground">N/A</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {stats.compliancePct}%
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Compliant Rate
                                </p>
                            </div>
                        </div>
                        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
                            {stats.total > 0 && (
                                <>
                                    <div
                                        className="h-full bg-green-500 transition-all"
                                        style={{
                                            width: `${(stats.compliant / stats.total) * 100}%`,
                                        }}
                                    />
                                    <div
                                        className="h-full bg-amber-400 transition-all"
                                        style={{
                                            width: `${(stats.partiallyCompliant / stats.total) * 100}%`,
                                        }}
                                    />
                                    <div
                                        className="h-full bg-red-500 transition-all"
                                        style={{
                                            width: `${(stats.nonCompliant / stats.total) * 100}%`,
                                        }}
                                    />
                                    <div
                                        className="h-full bg-gray-400 transition-all"
                                        style={{
                                            width: `${(stats.notApplicable / stats.total) * 100}%`,
                                        }}
                                    />
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Filter bar */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-3">
                            <div className="relative min-w-[200px] flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search controls..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' &&
                                        applyFilters({ search })
                                    }
                                    className="pl-9"
                                />
                            </div>
                            <Select
                                value={status}
                                onValueChange={(v) => {
                                    setStatus(v);
                                    applyFilters({
                                        status: v === 'all' ? '' : v,
                                    });
                                }}
                            >
                                <SelectTrigger className="w-[170px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Statuses
                                    </SelectItem>
                                    <SelectItem value="compliant">
                                        Compliant
                                    </SelectItem>
                                    <SelectItem value="partially_compliant">
                                        Partially Compliant
                                    </SelectItem>
                                    <SelectItem value="non_compliant">
                                        Non-Compliant
                                    </SelectItem>
                                    <SelectItem value="not_applicable">
                                        N/A
                                    </SelectItem>
                                    <SelectItem value="not_set">
                                        Not Set
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={framework}
                                onValueChange={(v) => {
                                    setFramework(v);
                                    applyFilters({
                                        framework: v === 'all' ? '' : v,
                                    });
                                }}
                            >
                                <SelectTrigger className="w-[150px]">
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
                            <Button
                                variant="outline"
                                onClick={() => applyFilters({ search })}
                            >
                                Search
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Controls table */}
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle className="font-heading text-xl font-normal">
                            {controls.total} control
                            {controls.total !== 1 ? 's' : ''}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="mt-4 p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-y border-border bg-muted/30">
                                    <tr>
                                        {[
                                            'Control',
                                            'Status',
                                            'Risks',
                                            'Evidence',
                                            'Last Updated',
                                            'Actions',
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className="px-4 py-3 text-left text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {localControls.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-12 text-center text-muted-foreground"
                                            >
                                                No controls found matching your
                                                filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        localControls.map((ctrl) => (
                                            <tr
                                                key={ctrl.id}
                                                className="transition-colors hover:bg-accent/30"
                                            >
                                                {/* Control name */}
                                                <td className="max-w-[280px] px-4 py-3">
                                                    <div className="mb-0.5 flex items-center gap-1.5">
                                                        <span className="shrink-0 rounded bg-muted/50 px-1.5 py-0.5 font-mono text-xs text-foreground/80">
                                                            {ctrl.control_id}
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className="shrink-0 text-xs"
                                                        >
                                                            {
                                                                ctrl.framework
                                                                    .short_name
                                                            }
                                                        </Badge>
                                                    </div>
                                                    <p className="truncate text-sm font-medium text-foreground">
                                                        {ctrl.title}
                                                    </p>
                                                    {ctrl.category && (
                                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                                            {ctrl.category}
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col gap-1">
                                                        <StatusBadge
                                                            status={
                                                                ctrl.current_status
                                                            }
                                                        />
                                                        {ctrl.pending_request && (
                                                            <span className="inline-flex w-fit items-center gap-1 rounded border border-border bg-amber-50 px-1.5 py-0.5 text-xs text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                                                                <Clock className="h-2.5 w-2.5 shrink-0" />
                                                                Pending:{' '}
                                                                {STATUS_LABELS[
                                                                    ctrl
                                                                        .pending_request
                                                                        .requested_status
                                                                ] ??
                                                                    ctrl
                                                                        .pending_request
                                                                        .requested_status}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Risks */}
                                                <td className="px-4 py-3">
                                                    {ctrl.highest_risk_level ? (
                                                        <span
                                                            className={`rounded px-1.5 py-0.5 text-xs font-bold ${RISK_LEVEL_BADGE[ctrl.highest_risk_level]}`}
                                                        >
                                                            {ctrl.highest_risk_level
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                ctrl.highest_risk_level.slice(
                                                                    1,
                                                                )}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            —
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Evidence */}
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col gap-1">
                                                        <EvidenceBadge
                                                            status={
                                                                ctrl.evidence_status
                                                            }
                                                        />
                                                        {ctrl.has_weak_evidence && (
                                                            <span className="flex items-center gap-1 text-xs font-medium text-red-400 dark:text-red-400">
                                                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                                                Weak Evidence
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Last updated */}
                                                <td className="px-4 py-3">
                                                    {ctrl.latest_history ? (
                                                        <div>
                                                            <p className="text-xs text-foreground/80">
                                                                {new Date(
                                                                    ctrl
                                                                        .latest_history
                                                                        .created_at,
                                                                ).toLocaleDateString()}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {
                                                                    ctrl
                                                                        .latest_history
                                                                        .user_name
                                                                }
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            —
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        {ctrl.pending_request ? (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-7 cursor-default border-amber-300 px-2 text-xs text-amber-400"
                                                                disabled
                                                                title={`Pending approval — requested by ${ctrl.pending_request.requested_by}`}
                                                            >
                                                                <Clock className="mr-1 h-3 w-3" />
                                                                Pending
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-7 px-2 text-xs"
                                                                onClick={() =>
                                                                    openUpdate(
                                                                        ctrl,
                                                                    )
                                                                }
                                                            >
                                                                Update
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 px-2 text-xs"
                                                            onClick={() =>
                                                                openHistory(
                                                                    ctrl,
                                                                )
                                                            }
                                                        >
                                                            <History className="h-3.5 w-3.5" />
                                                        </Button>
                                                        {ctrl.current_status ===
                                                            'non_compliant' && (
                                                            <Button
                                                                size="sm"
                                                                disabled={
                                                                    analyzing ===
                                                                    ctrl.id
                                                                }
                                                                onClick={() =>
                                                                    handleAiFix(
                                                                        ctrl,
                                                                    )
                                                                }
                                                                className="h-7 bg-secondary px-2 text-xs text-foreground hover:bg-secondary/80 disabled:opacity-60"
                                                            >
                                                                {analyzing ===
                                                                ctrl.id ? (
                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                ) : (
                                                                    <>
                                                                        ✨ AI
                                                                        Fix
                                                                    </>
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {controls.links.length > 3 && (
                            <div className="flex items-center justify-center gap-1 border-t p-4">
                                {controls.links.map((link, i) => (
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

            {/* ── Update Status Modal ─────────────────────────────────────────── */}
            <Dialog
                open={!!updateModal}
                onOpenChange={(open) => {
                    if (!open) {
                        setUpdateModal(null);
                        setEvidenceFile(null);
                        setEvidenceTitle('');
                        setEvidenceDescription('');
                    }
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogDescription className="sr-only">
                        Update control status and provide justification for the change
                    </DialogDescription>
                    <DialogHeader>
                        <DialogTitle>Request Status Change</DialogTitle>
                    </DialogHeader>

                    {updateModal && (
                        <div className="space-y-4 py-2">
                            <div className="rounded-lg bg-muted/30 p-3">
                                <p className="font-mono text-xs text-muted-foreground">
                                    {updateModal.control_id}
                                </p>
                                <p className="mt-0.5 text-sm font-medium">
                                    {updateModal.title}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                        Current:
                                    </span>
                                    <StatusBadge
                                        status={updateModal.current_status}
                                    />
                                </div>
                            </div>

                            <div className="flex items-start gap-2 rounded-lg border border-border bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950/20">
                                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                                <p className="text-xs text-amber-700 dark:text-amber-400">
                                    Status changes require approval from an
                                    administrator or auditor before taking
                                    effect.
                                </p>
                            </div>

                            <div className="space-y-1">
                                <Label>New Status *</Label>
                                <Select
                                    value={updateForm.new_status}
                                    onValueChange={(v) =>
                                        setUpdateForm((f) => ({
                                            ...f,
                                            new_status: v,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select new status..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="compliant">
                                            Compliant
                                        </SelectItem>
                                        <SelectItem value="partially_compliant">
                                            Partially Compliant
                                        </SelectItem>
                                        <SelectItem value="non_compliant">
                                            Non-Compliant
                                        </SelectItem>
                                        <SelectItem value="not_applicable">
                                            Not Applicable
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label>Justification</Label>
                                <Textarea
                                    value={updateForm.notes}
                                    onChange={(e) =>
                                        setUpdateForm((f) => ({
                                            ...f,
                                            notes: e.target.value,
                                        }))
                                    }
                                    placeholder="Reason for this status change (optional but recommended)..."
                                    rows={3}
                                />
                            </div>

                            {/* Evidence Upload */}
                            <div className="space-y-2 border-t border-border/50 pt-1 dark:border-border">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                                        Upload New Evidence
                                    </Label>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            evidenceFileRef.current?.click()
                                        }
                                        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                                    >
                                        <Upload className="h-3 w-3" /> Select
                                        file
                                    </button>
                                    <input
                                        type="file"
                                        ref={evidenceFileRef}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
                                        onChange={(e) => {
                                            const f =
                                                e.target.files?.[0] ?? null;
                                            setEvidenceFile(f);
                                            if (f && !evidenceTitle)
                                                setEvidenceTitle(
                                                    f.name.replace(
                                                        /\.[^/.]+$/,
                                                        '',
                                                    ),
                                                );
                                        }}
                                    />
                                </div>

                                {evidenceFile ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-2 text-xs text-primary dark:bg-primary/20 dark:text-primary">
                                            <Paperclip className="h-3.5 w-3.5 shrink-0" />
                                            <span className="flex-1 truncate">
                                                {evidenceFile.name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEvidenceFile(null);
                                                    setEvidenceTitle('');
                                                    setEvidenceDescription('');
                                                    if (evidenceFileRef.current)
                                                        evidenceFileRef.current.value =
                                                            '';
                                                }}
                                                className="opacity-60 hover:opacity-100"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">
                                                Evidence Title *
                                            </Label>
                                            <Input
                                                value={evidenceTitle}
                                                onChange={(e) =>
                                                    setEvidenceTitle(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. Security policy document"
                                                className="h-8 text-xs"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">
                                                Description (optional)
                                            </Label>
                                            <Textarea
                                                value={evidenceDescription}
                                                onChange={(e) =>
                                                    setEvidenceDescription(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="What does this evidence demonstrate?"
                                                rows={2}
                                                className="text-xs"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        PDF, DOC, DOCX, XLS, PNG, JPG up to 10MB
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setUpdateModal(null);
                                setEvidenceFile(null);
                                setEvidenceTitle('');
                                setEvidenceDescription('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={submitting || !updateForm.new_status}
                            onClick={submitUpdate}
                            className="gap-1"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />{' '}
                                    Submitting...
                                </>
                            ) : (
                                'Submit for Approval'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── View History Modal ──────────────────────────────────────────── */}
            <Dialog
                open={!!historyModal}
                onOpenChange={(open) => !open && setHistoryModal(null)}
            >
                <DialogContent className="max-w-lg">
                    <DialogDescription className="sr-only">
                        Control dialog
                    </DialogDescription>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Status History
                        </DialogTitle>
                    </DialogHeader>

                    {historyModal && (
                        <div>
                            <p className="mb-4 text-xs text-muted-foreground">
                                <span className="font-mono">
                                    {historyModal.ctrl.control_id}
                                </span>{' '}
                                — {historyModal.ctrl.title}
                            </p>

                            {historyLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : historyModal.entries.length === 0 ? (
                                <div className="py-8 text-center text-sm text-muted-foreground">
                                    No status changes recorded yet.
                                </div>
                            ) : (
                                <div className="max-h-[400px] space-y-3 overflow-y-auto pr-1">
                                    {historyModal.entries.map((entry, i) => (
                                        <div
                                            key={entry.id}
                                            className="flex gap-3"
                                        >
                                            <div className="flex flex-col items-center">
                                                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                                                {i <
                                                    historyModal.entries
                                                        .length -
                                                        1 && (
                                                    <div className="mt-1 w-px flex-1 bg-muted" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1 pb-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {entry.old_status ? (
                                                        <StatusBadge
                                                            status={
                                                                entry.old_status as ControlRow['current_status']
                                                            }
                                                        />
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            Not Set
                                                        </span>
                                                    )}
                                                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                    <StatusBadge
                                                        status={
                                                            entry.new_status as ControlRow['current_status']
                                                        }
                                                    />
                                                </div>
                                                {entry.notes && (
                                                    <p className="mt-1.5 rounded bg-muted/30 p-2 text-xs text-foreground/80">
                                                        {entry.notes}
                                                    </p>
                                                )}
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {entry.user_name} ·{' '}
                                                    {new Date(
                                                        entry.created_at,
                                                    ).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setHistoryModal(null)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── AI Fix Modal ────────────────────────────────────────────────── */}
            {planModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={(e) =>
                        e.target === e.currentTarget && setPlanModal(null)
                    }
                >
                    <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-secondary/20 bg-background shadow-2xl dark:border-secondary/20">
                        <div className="flex items-start justify-between border-b border-border/50 p-5 dark:border-border">
                            <div className="flex min-w-0 flex-1 items-start gap-2">
                                <span className="mt-0.5 text-lg leading-none text-secondary-foreground">
                                    ✨
                                </span>
                                <div className="min-w-0">
                                    <h2 className="text-sm font-bold text-foreground">
                                        AI Remediation Plan
                                    </h2>
                                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                        {planModal.ctrl.control_id}:{' '}
                                        {planModal.ctrl.title}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setPlanModal(null)}
                                className="ml-3 shrink-0 text-muted-foreground hover:text-muted-foreground dark:hover:text-gray-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 space-y-5 overflow-y-auto p-5">
                            <div className="rounded-lg bg-muted/30 p-3 text-sm text-foreground/85">
                                {planModal.plan.summary}
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge
                                    variant="outline"
                                    className={`text-xs font-semibold ${PRIORITY_STYLES[planModal.plan.priority] ?? PRIORITY_STYLES['High']}`}
                                >
                                    {planModal.plan.priority} Priority
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    Effort:{' '}
                                    <span className="font-medium text-foreground/85">
                                        {planModal.plan.estimated_effort}
                                    </span>
                                </span>
                            </div>
                            {planModal.plan.quick_wins.length > 0 && (
                                <div>
                                    <p className="mb-2 text-xs font-semibold text-emerald-400">
                                        ⚡ Quick Wins
                                    </p>
                                    <div className="space-y-1.5">
                                        {planModal.plan.quick_wins.map(
                                            (w, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-start gap-2 rounded-lg bg-green-50 p-2.5 dark:bg-green-900/20"
                                                >
                                                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                                                    <span className="text-xs text-green-800 dark:text-green-300">
                                                        {w}
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                            {planModal.plan.remediation_steps.length > 0 && (
                                <div>
                                    <p className="mb-3 text-xs font-semibold text-foreground/85">
                                        Remediation Steps
                                    </p>
                                    <div className="space-y-3">
                                        {planModal.plan.remediation_steps.map(
                                            (s) => (
                                                <div
                                                    key={s.step}
                                                    className="flex gap-3"
                                                >
                                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-xs font-bold text-secondary-foreground dark:bg-secondary/40 dark:text-secondary-foreground">
                                                        {s.step}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {s.action}
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                                            {s.detail}
                                                        </p>
                                                        <div className="mt-1.5 rounded bg-muted/50 px-2 py-1 text-xs text-muted-foreground">
                                                            Evidence:{' '}
                                                            {s.evidence_needed}
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-border/50 p-4 dark:border-border">
                            {savedRisk ? (
                                <div className="flex flex-col items-center gap-3 py-1">
                                    <div className="flex items-center gap-2 text-emerald-400 dark:text-green-400">
                                        <CheckCircle2 className="h-5 w-5" />
                                        <span className="text-sm font-semibold">
                                            Remediation plan saved!
                                        </span>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            router.visit(
                                                `/risks/${savedRisk.id}`,
                                            );
                                            setPlanModal(null);
                                            setSavedRisk(null);
                                        }}
                                        className="w-full gap-2 bg-secondary py-2.5 text-sm font-semibold text-foreground hover:bg-secondary/80"
                                    >
                                        View Risk Record{' '}
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between gap-3">
                                    <div className="text-xs">
                                        {saveError && (
                                            <span className="text-red-500">
                                                {saveError}
                                            </span>
                                        )}
                                        {saving && (
                                            <span className="text-muted-foreground">
                                                Saving...
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPlanModal(null)}
                                        >
                                            Close
                                        </Button>
                                        <Button
                                            size="sm"
                                            disabled={saving}
                                            onClick={handleSavePlan}
                                            className="gap-1 bg-secondary text-foreground hover:bg-secondary/80"
                                        >
                                            {saving ? (
                                                <>
                                                    <Loader2 className="h-3 w-3 animate-spin" />{' '}
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save to Risk Notes'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Toast ───────────────────────────────────────────────────────── */}
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
                    <button
                        onClick={() => setToast(null)}
                        className="opacity-60 hover:opacity-100"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}
        </AdminLayout>
    );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatPlan(ctrl: ControlRow, plan: RemediationPlan): string {
    const date = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
    return [
        `AI Remediation Plan — ${ctrl.control_id}: ${ctrl.title}`,
        `Generated: ${date}`,
        '',
        `Summary: ${plan.summary}`,
        `Priority: ${plan.priority} | Effort: ${plan.estimated_effort}`,
        '',
        'Quick Wins:',
        ...plan.quick_wins.map((w) => `• ${w}`),
        '',
        'Remediation Steps:',
        ...plan.remediation_steps.map(
            (s) =>
                `${s.step}. ${s.action}\n   ${s.detail}\n   Evidence: ${s.evidence_needed}`,
        ),
        '',
        'Resources Needed:',
        ...plan.resources_needed.map((r) => `• ${r}`),
    ].join('\n');
}
