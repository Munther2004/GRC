import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import type { File } from 'lucide-react';
import {
    CheckCircle2,
    XCircle,
    MinusCircle,
    AlertCircle,
    Search,
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { route } from '@/lib/routes';

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
    linked_evidence: EvidenceItem[];
    latest_history: {
        user_name: string;
        created_at: string;
        new_status: string;
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
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    non_compliant:
        'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    not_applicable:
        'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
};

const RISK_LEVEL_BADGE: Record<string, string> = {
    critical: 'bg-red-600 text-white',
    high: 'bg-orange-500 text-white',
    medium: 'bg-yellow-500 text-black',
    low: 'bg-green-600 text-white',
};

const PRIORITY_STYLES: Record<string, string> = {
    Critical: 'bg-red-100 text-red-700 border-red-300',
    High: 'bg-orange-100 text-orange-700 border-orange-300',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    Low: 'bg-green-100 text-green-700 border-green-300',
};

function StatusBadge({ status }: { status: ControlRow['current_status'] }) {
    if (!status) {
        return (
            <Badge
                variant="outline"
                className="border-gray-200 bg-gray-50 text-xs text-gray-400 dark:bg-gray-800 dark:text-gray-500"
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
        return <span className="text-gray-400">—</span>;
    }
    const config = {
        valid: {
            icon: FileCheck2,
            cls: 'text-green-600',
            label: 'Evidence OK',
        },
        expiring: {
            icon: FileWarning,
            cls: 'text-yellow-600',
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
                if (updateForm.notes) fd.append('notes', updateForm.notes);
                if (updateForm.evidence_id)
                    fd.append('evidence_id', updateForm.evidence_id);
                fd.append('file', evidenceFile);
                fd.append('evidence_title', evidenceTitle || evidenceFile.name);
                if (evidenceDescription)
                    fd.append('evidence_description', evidenceDescription);
                payload = fd;
                config = { headers: { 'Content-Type': 'multipart/form-data' } };
            } else {
                payload = {
                    new_status: updateForm.new_status,
                    notes: updateForm.notes || null,
                    evidence_id: updateForm.evidence_id || null,
                };
            }

            const res = await axios.post(
                route('controls.update-status', updateModal.id),
                payload,
                config,
            );
            // Optimistic update in local state
            setLocalControls((prev) =>
                prev.map((c) => {
                    if (c.id !== updateModal.id) return c;
                    return {
                        ...c,
                        current_status: res.data.current_status,
                        last_remediated_at: res.data.last_remediated_at,
                        latest_history: res.data.history_entry
                            ? {
                                  user_name: res.data.history_entry.user_name,
                                  created_at: res.data.history_entry.created_at,
                                  new_status: res.data.history_entry.new_status,
                              }
                            : c.latest_history,
                    };
                }),
            );
            const evidenceNote = res.data.evidence_uploaded
                ? ' · Evidence uploaded.'
                : '';
            setToast({
                type: 'success',
                text: `Status updated to ${STATUS_LABELS[res.data.current_status] ?? res.data.current_status}${evidenceNote}`,
            });
            setUpdateModal(null);
        } catch {
            setToast({
                type: 'error',
                text: 'Failed to update status. Please try again.',
            });
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
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Controls Hub
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Live compliance status across all controls
                    </p>
                </div>

                {/* Summary bar */}
                <Card>
                    <CardContent className="space-y-3 p-4">
                        <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-6">
                            <div>
                                <p className="text-2xl font-bold">
                                    {stats.total}
                                </p>
                                <p className="text-xs text-gray-500">Total</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">
                                    {stats.compliant}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Compliant
                                </p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-amber-600">
                                    {stats.partiallyCompliant}
                                </p>
                                <p className="text-xs text-gray-500">Partial</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-600">
                                    {stats.nonCompliant}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Non-Compliant
                                </p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-400">
                                    {stats.notApplicable}
                                </p>
                                <p className="text-xs text-gray-500">N/A</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {stats.compliancePct}%
                                </p>
                                <p className="text-xs text-gray-500">
                                    Compliant Rate
                                </p>
                            </div>
                        </div>
                        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
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
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                        <CardTitle className="text-base font-semibold">
                            {controls.total} control
                            {controls.total !== 1 ? 's' : ''}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="mt-4 p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-y border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
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
                                                className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {localControls.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-12 text-center text-gray-400"
                                            >
                                                No controls found matching your
                                                filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        localControls.map((ctrl) => (
                                            <tr
                                                key={ctrl.id}
                                                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                            >
                                                {/* Control name */}
                                                <td className="max-w-[280px] px-4 py-3">
                                                    <div className="mb-0.5 flex items-center gap-1.5">
                                                        <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
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
                                                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                                        {ctrl.title}
                                                    </p>
                                                    {ctrl.category && (
                                                        <p className="mt-0.5 text-xs text-gray-400">
                                                            {ctrl.category}
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="px-4 py-3">
                                                    <StatusBadge
                                                        status={
                                                            ctrl.current_status
                                                        }
                                                    />
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
                                                        <span className="text-gray-400">
                                                            —
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Evidence */}
                                                <td className="px-4 py-3">
                                                    <EvidenceBadge
                                                        status={
                                                            ctrl.evidence_status
                                                        }
                                                    />
                                                </td>

                                                {/* Last updated */}
                                                <td className="px-4 py-3">
                                                    {ctrl.latest_history ? (
                                                        <div>
                                                            <p className="text-xs text-gray-600 dark:text-gray-300">
                                                                {new Date(
                                                                    ctrl
                                                                        .latest_history
                                                                        .created_at,
                                                                ).toLocaleDateString()}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {
                                                                    ctrl
                                                                        .latest_history
                                                                        .user_name
                                                                }
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">
                                                            —
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 px-2 text-xs"
                                                            onClick={() =>
                                                                openUpdate(ctrl)
                                                            }
                                                        >
                                                            Update
                                                        </Button>
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
                                                                className="h-7 bg-purple-600 px-2 text-xs text-white hover:bg-purple-700 disabled:opacity-60"
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
                    <DialogHeader>
                        <DialogTitle>Update Control Status</DialogTitle>
                    </DialogHeader>

                    {updateModal && (
                        <div className="space-y-4 py-2">
                            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                                <p className="font-mono text-xs text-gray-500">
                                    {updateModal.control_id}
                                </p>
                                <p className="mt-0.5 text-sm font-medium">
                                    {updateModal.title}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-xs text-gray-500">
                                        Current:
                                    </span>
                                    <StatusBadge
                                        status={updateModal.current_status}
                                    />
                                </div>
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
                                <Label>Notes</Label>
                                <Textarea
                                    value={updateForm.notes}
                                    onChange={(e) =>
                                        setUpdateForm((f) => ({
                                            ...f,
                                            notes: e.target.value,
                                        }))
                                    }
                                    placeholder="Optional: describe what changed, remediation taken..."
                                    rows={3}
                                />
                            </div>

                            {updateModal.linked_evidence.length > 0 && (
                                <div className="space-y-1">
                                    <Label>
                                        Attach Existing Evidence (optional)
                                    </Label>
                                    <Select
                                        value={updateForm.evidence_id}
                                        onValueChange={(v) =>
                                            setUpdateForm((f) => ({
                                                ...f,
                                                evidence_id: v,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select evidence..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">
                                                None
                                            </SelectItem>
                                            {updateModal.linked_evidence.map(
                                                (e) => (
                                                    <SelectItem
                                                        key={e.id}
                                                        value={String(e.id)}
                                                    >
                                                        {e.title}{' '}
                                                        {e.is_expired
                                                            ? '(expired)'
                                                            : e.expires_soon
                                                              ? '(expiring)'
                                                              : ''}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Evidence Upload */}
                            <div className="space-y-2 border-t border-gray-100 pt-1 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                        Upload New Evidence
                                    </Label>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            evidenceFileRef.current?.click()
                                        }
                                        className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600"
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
                                        <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-2 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
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
                                    <p className="text-xs text-gray-400">
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
                                    Saving...
                                </>
                            ) : (
                                'Save Status'
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
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Status History
                        </DialogTitle>
                    </DialogHeader>

                    {historyModal && (
                        <div>
                            <p className="mb-4 text-xs text-gray-500">
                                <span className="font-mono">
                                    {historyModal.ctrl.control_id}
                                </span>{' '}
                                — {historyModal.ctrl.title}
                            </p>

                            {historyLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                                </div>
                            ) : historyModal.entries.length === 0 ? (
                                <div className="py-8 text-center text-sm text-gray-400">
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
                                                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                                                {i <
                                                    historyModal.entries
                                                        .length -
                                                        1 && (
                                                    <div className="mt-1 w-px flex-1 bg-gray-200 dark:bg-gray-700" />
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
                                                        <span className="text-xs text-gray-400">
                                                            Not Set
                                                        </span>
                                                    )}
                                                    <ArrowRight className="h-3 w-3 text-gray-400" />
                                                    <StatusBadge
                                                        status={
                                                            entry.new_status as ControlRow['current_status']
                                                        }
                                                    />
                                                </div>
                                                {entry.notes && (
                                                    <p className="mt-1.5 rounded bg-gray-50 p-2 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                        {entry.notes}
                                                    </p>
                                                )}
                                                <p className="mt-1 text-xs text-gray-400">
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
                    <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-purple-200 bg-white shadow-2xl dark:border-purple-800 dark:bg-gray-900">
                        <div className="flex items-start justify-between border-b border-gray-100 p-5 dark:border-gray-800">
                            <div className="flex min-w-0 flex-1 items-start gap-2">
                                <span className="mt-0.5 text-lg leading-none text-purple-600">
                                    ✨
                                </span>
                                <div className="min-w-0">
                                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                                        AI Remediation Plan
                                    </h2>
                                    <p className="mt-0.5 truncate text-xs text-gray-500">
                                        {planModal.ctrl.control_id}:{' '}
                                        {planModal.ctrl.title}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setPlanModal(null)}
                                className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 space-y-5 overflow-y-auto p-5">
                            <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                {planModal.plan.summary}
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge
                                    variant="outline"
                                    className={`text-xs font-semibold ${PRIORITY_STYLES[planModal.plan.priority] ?? PRIORITY_STYLES['High']}`}
                                >
                                    {planModal.plan.priority} Priority
                                </Badge>
                                <span className="text-xs text-gray-500">
                                    Effort:{' '}
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        {planModal.plan.estimated_effort}
                                    </span>
                                </span>
                            </div>
                            {planModal.plan.quick_wins.length > 0 && (
                                <div>
                                    <p className="mb-2 text-xs font-semibold text-green-700 dark:text-green-400">
                                        ⚡ Quick Wins
                                    </p>
                                    <div className="space-y-1.5">
                                        {planModal.plan.quick_wins.map(
                                            (w, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-start gap-2 rounded-lg bg-green-50 p-2.5 dark:bg-green-900/20"
                                                >
                                                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-600" />
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
                                    <p className="mb-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Remediation Steps
                                    </p>
                                    <div className="space-y-3">
                                        {planModal.plan.remediation_steps.map(
                                            (s) => (
                                                <div
                                                    key={s.step}
                                                    className="flex gap-3"
                                                >
                                                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                                                        {s.step}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {s.action}
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-gray-500">
                                                            {s.detail}
                                                        </p>
                                                        <div className="mt-1.5 rounded bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-gray-800">
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

                        <div className="border-t border-gray-100 p-4 dark:border-gray-800">
                            {savedRisk ? (
                                <div className="flex flex-col items-center gap-3 py-1">
                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
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
                                        className="w-full gap-2 bg-purple-600 py-2.5 text-sm font-semibold text-white hover:bg-purple-700"
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
                                            <span className="text-gray-400">
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
                                            className="gap-1 bg-purple-600 text-white hover:bg-purple-700"
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
                    className={`fixed right-6 bottom-6 z-50 flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${
                        toast.type === 'success'
                            ? 'border-green-200 bg-green-50 text-green-800'
                            : 'border-red-200 bg-red-50 text-red-800'
                    }`}
                >
                    {toast.type === 'success' ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    ) : (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
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
