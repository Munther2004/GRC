import { Head, router, usePage } from '@inertiajs/react';
import type { SharedProps } from '@/types';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Sliders,
    Plus,
    CheckCircle2,
    AlertTriangle,
    Pencil,
    Trash2,
    Zap,
    Bell,
    BellOff,
} from 'lucide-react';
import { useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RiskAppetite {
    id: number;
    name: string;
    is_active: boolean;
    acceptable_max_score: number;
    review_max_score: number;
    escalated_min_score: number;
    acceptable_label: string;
    review_label: string;
    escalated_label: string;
    acceptable_color: string;
    review_color: string;
    escalated_color: string;
    notify_on_escalation: boolean;
    escalation_notification_roles: string[] | null;
    notes: string | null;
}

interface Props {
    appetites: RiskAppetite[];
    active_appetite: RiskAppetite | null;
}

interface FormState {
    name: string;
    acceptable_max_score: string;
    review_max_score: string;
    escalated_min_score: string;
    acceptable_label: string;
    review_label: string;
    escalated_label: string;
    notify_on_escalation: boolean;
    escalation_notification_roles: string[];
    notes: string;
}

const defaultForm: FormState = {
    name: '',
    acceptable_max_score: '6',
    review_max_score: '14',
    escalated_min_score: '15',
    acceptable_label: 'Acceptable',
    review_label: 'Requires Review',
    escalated_label: 'Escalated',
    notify_on_escalation: true,
    escalation_notification_roles: ['admin', 'auditor'],
    notes: '',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function bandTailwind(color: string): {
    bg: string;
    text: string;
    border: string;
} {
    if (color === 'green')
        return {
            bg: 'bg-green-100 dark:bg-green-900/30',
            text: 'text-green-700 dark:text-green-400',
            border: 'border-green-200 dark:border-green-700',
        };
    if (color === 'amber')
        return {
            bg: 'bg-amber-100 dark:bg-amber-900/30',
            text: 'text-amber-700 dark:text-amber-400',
            border: 'border-amber-200 dark:border-amber-700',
        };
    return {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-200 dark:border-red-700',
    };
}

// ── Active appetite card ───────────────────────────────────────────────────────

function ActiveAppetiteCard({ appetite }: { appetite: RiskAppetite }) {
    const total = 25;
    const acceptablePct = Math.round(
        (appetite.acceptable_max_score / total) * 100,
    );
    const reviewPct = Math.round(
        ((appetite.review_max_score - appetite.acceptable_max_score) / total) *
            100,
    );
    const escalatedPct = 100 - acceptablePct - reviewPct;

    return (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                        <Sliders className="h-4 w-4 text-primary" />
                        {appetite.name}
                    </CardTitle>
                    <Badge className="border-green-200 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Active
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Gradient bar */}
                <div>
                    <div className="flex h-8 overflow-hidden rounded-lg border border-border dark:border-border">
                        <div
                            className="flex items-center justify-center bg-green-500 text-xs font-semibold text-white"
                            style={{ width: `${acceptablePct}%` }}
                            title={appetite.acceptable_label}
                        >
                            {acceptablePct >= 12
                                ? appetite.acceptable_label
                                : ''}
                        </div>
                        <div
                            className="flex items-center justify-center bg-amber-400 text-xs font-semibold text-white"
                            style={{ width: `${reviewPct}%` }}
                            title={appetite.review_label}
                        >
                            {reviewPct >= 12 ? appetite.review_label : ''}
                        </div>
                        <div
                            className="flex flex-1 items-center justify-center bg-red-500 text-xs font-semibold text-white"
                            title={appetite.escalated_label}
                        >
                            {escalatedPct >= 12 ? appetite.escalated_label : ''}
                        </div>
                    </div>
                    <div className="mt-1.5 flex text-xs text-muted-foreground">
                        <div style={{ width: `${acceptablePct}%` }}>
                            Score 1–{appetite.acceptable_max_score}
                        </div>
                        <div style={{ width: `${reviewPct}%` }}>
                            {appetite.acceptable_max_score + 1}–
                            {appetite.review_max_score}
                        </div>
                        <div className="flex-1 text-right">
                            {appetite.escalated_min_score}–25
                        </div>
                    </div>
                </div>

                {/* Legend pills */}
                <div className="flex flex-wrap gap-2">
                    {[
                        {
                            label: appetite.acceptable_label,
                            range: `≤ ${appetite.acceptable_max_score}`,
                            color: 'green',
                        },
                        {
                            label: appetite.review_label,
                            range: `${appetite.acceptable_max_score + 1}–${appetite.review_max_score}`,
                            color: 'amber',
                        },
                        {
                            label: appetite.escalated_label,
                            range: `≥ ${appetite.escalated_min_score}`,
                            color: 'red',
                        },
                    ].map(({ label, range, color }) => {
                        const tw = bandTailwind(color);
                        return (
                            <span
                                key={label}
                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${tw.bg} ${tw.text} ${tw.border}`}
                            >
                                {label}{' '}
                                <span className="opacity-60">({range})</span>
                            </span>
                        );
                    })}
                </div>

                {/* Notify row */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground">
                    {appetite.notify_on_escalation ? (
                        <>
                            <Bell className="h-3.5 w-3.5 text-primary" />
                            <span>
                                Notifications enabled for:{' '}
                                {(
                                    appetite.escalation_notification_roles ?? []
                                ).join(', ')}
                            </span>
                        </>
                    ) : (
                        <>
                            <BellOff className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Escalation notifications disabled</span>
                        </>
                    )}
                </div>

                {appetite.notes && (
                    <p className="border-t pt-2 text-xs text-muted-foreground italic">
                        {appetite.notes}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

// ── Add / Edit Modal ──────────────────────────────────────────────────────────

function AppetiteModal({
    open,
    onClose,
    editTarget,
    saving,
    onSave,
}: {
    open: boolean;
    onClose: () => void;
    editTarget: RiskAppetite | null;
    saving: boolean;
    onSave: (form: FormState) => void;
}) {
    const [form, setForm] = useState<FormState>(
        editTarget
            ? {
                  name: editTarget.name,
                  acceptable_max_score: String(editTarget.acceptable_max_score),
                  review_max_score: String(editTarget.review_max_score),
                  escalated_min_score: String(editTarget.escalated_min_score),
                  acceptable_label: editTarget.acceptable_label,
                  review_label: editTarget.review_label,
                  escalated_label: editTarget.escalated_label,
                  notify_on_escalation: editTarget.notify_on_escalation,
                  escalation_notification_roles:
                      editTarget.escalation_notification_roles ?? [],
                  notes: editTarget.notes ?? '',
              }
            : defaultForm,
    );

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Auto-compute escalated_min from review_max
    const reviewMaxNum = parseInt(form.review_max_score) || 0;
    const escalatedMin = reviewMaxNum + 1;

    const set = (key: keyof FormState, value: any) => {
        setForm((f) => ({ ...f, [key]: value }));
        if (key === 'review_max_score') {
            setForm((f) => ({
                ...f,
                review_max_score: value,
                escalated_min_score: String(parseInt(value) + 1 || ''),
            }));
        }
    };

    const toggleRole = (role: string) => {
        setForm((f) => ({
            ...f,
            escalation_notification_roles:
                f.escalation_notification_roles.includes(role)
                    ? f.escalation_notification_roles.filter((r) => r !== role)
                    : [...f.escalation_notification_roles, role],
        }));
    };

    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        const acc = parseInt(form.acceptable_max_score);
        const rev = parseInt(form.review_max_score);
        if (!form.name.trim()) errs.name = 'Name is required.';
        if (!acc || acc < 1 || acc > 24)
            errs.acceptable_max_score = 'Must be between 1 and 24.';
        if (!rev || rev < 2 || rev > 25)
            errs.review_max_score = 'Must be between 2 and 25.';
        if (rev <= acc)
            errs.review_max_score = 'Must be greater than Acceptable score.';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        onSave({ ...form, escalated_min_score: String(escalatedMin) });
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !saving && !v && onClose()}>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sliders className="h-4 w-4" />
                        {editTarget
                            ? 'Edit Configuration'
                            : 'Add Configuration'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Name */}
                    <div>
                        <Label>Configuration Name</Label>
                        <Input
                            value={form.name}
                            onChange={(e) => set('name', e.target.value)}
                            placeholder="e.g. ISO 27001 Risk Appetite"
                            className="mt-1"
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Score thresholds */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <Label className="text-xs">Acceptable up to</Label>
                            <Input
                                type="number"
                                min={1}
                                max={24}
                                value={form.acceptable_max_score}
                                onChange={(e) =>
                                    set('acceptable_max_score', e.target.value)
                                }
                                className="mt-1"
                            />
                            {errors.acceptable_max_score && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.acceptable_max_score}
                                </p>
                            )}
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Score 1–25
                            </p>
                        </div>
                        <div>
                            <Label className="text-xs">Review up to</Label>
                            <Input
                                type="number"
                                min={2}
                                max={25}
                                value={form.review_max_score}
                                onChange={(e) =>
                                    set('review_max_score', e.target.value)
                                }
                                className="mt-1"
                            />
                            {errors.review_max_score && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.review_max_score}
                                </p>
                            )}
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                &gt; Acceptable
                            </p>
                        </div>
                        <div>
                            <Label className="text-xs">Escalated from</Label>
                            <Input
                                type="number"
                                value={isNaN(escalatedMin) ? '' : escalatedMin}
                                readOnly
                                className="mt-1 cursor-not-allowed bg-muted/50 dark:bg-secondary"
                            />
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Auto-calculated
                            </p>
                        </div>
                    </div>

                    {/* Labels */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <Label className="flex items-center gap-1 text-xs">
                                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                                Acceptable Label
                            </Label>
                            <Input
                                value={form.acceptable_label}
                                onChange={(e) =>
                                    set('acceptable_label', e.target.value)
                                }
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label className="flex items-center gap-1 text-xs">
                                <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                                Review Label
                            </Label>
                            <Input
                                value={form.review_label}
                                onChange={(e) =>
                                    set('review_label', e.target.value)
                                }
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label className="flex items-center gap-1 text-xs">
                                <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                                Escalated Label
                            </Label>
                            <Input
                                value={form.escalated_label}
                                onChange={(e) =>
                                    set('escalated_label', e.target.value)
                                }
                                className="mt-1"
                            />
                        </div>
                    </div>

                    {/* Notify on escalation */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                set(
                                    'notify_on_escalation',
                                    !form.notify_on_escalation,
                                )
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${ form.notify_on_escalation ? 'bg-primary' : 'bg-gray-300 ' }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-card transition-transform ${ form.notify_on_escalation ? 'translate-x-6' : 'translate-x-1' }`}
                            />
                        </button>
                        <Label
                            className="cursor-pointer"
                            onClick={() =>
                                set(
                                    'notify_on_escalation',
                                    !form.notify_on_escalation,
                                )
                            }
                        >
                            Notify on escalation
                        </Label>
                    </div>

                    {/* Roles (only if notify enabled) */}
                    {form.notify_on_escalation && (
                        <div>
                            <Label className="mb-2 block text-xs">
                                Notify Roles
                            </Label>
                            <div className="flex gap-3">
                                {(['admin', 'auditor', 'user'] as const).map(
                                    (role) => (
                                        <label
                                            key={role}
                                            className="flex cursor-pointer items-center gap-1.5 text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={form.escalation_notification_roles.includes(
                                                    role,
                                                )}
                                                onChange={() =>
                                                    toggleRole(role)
                                                }
                                                className="rounded"
                                            />
                                            <span className="capitalize">
                                                {role}
                                            </span>
                                        </label>
                                    ),
                                )}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <Label className="text-xs">Notes (optional)</Label>
                        <Textarea
                            value={form.notes}
                            onChange={(e) => set('notes', e.target.value)}
                            rows={2}
                            className="mt-1"
                            placeholder="Context or rationale for this configuration…"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving…' : editTarget ? 'Update' : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function RiskAppetiteIndex({
    appetites,
    active_appetite,
}: Props) {
    const { errors: pageErrors } = usePage<SharedProps>().props;
    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<RiskAppetite | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<RiskAppetite | null>(null);

    const handleSave = (form: FormState) => {
        setSaving(true);
        if (editTarget) {
            router.put(
                `/risk-appetite/${editTarget.id}`,
                {
                    ...form,
                    acceptable_max_score: parseInt(form.acceptable_max_score),
                    review_max_score: parseInt(form.review_max_score),
                    escalated_min_score: parseInt(form.escalated_min_score),
                    acceptable_color: 'green',
                    review_color: 'amber',
                    escalated_color: 'red',
                    notify_on_escalation: form.notify_on_escalation ? 1 : 0,
                },
                {
                    onFinish: () => {
                        setSaving(false);
                        setEditTarget(null);
                    },
                },
            );
        } else {
            router.post(
                '/risk-appetite',
                {
                    ...form,
                    acceptable_max_score: parseInt(form.acceptable_max_score),
                    review_max_score: parseInt(form.review_max_score),
                    escalated_min_score: parseInt(form.escalated_min_score),
                    acceptable_color: 'green',
                    review_color: 'amber',
                    escalated_color: 'red',
                    notify_on_escalation: form.notify_on_escalation ? 1 : 0,
                },
                {
                    onFinish: () => {
                        setSaving(false);
                        setAddOpen(false);
                    },
                },
            );
        }
    };

    const handleActivate = (appetite: RiskAppetite) => {
        if (
            !confirm(
                `Activate "${appetite.name}"? This will deactivate the current configuration and re-classify all risks.`,
            )
        )
            return;
        router.post(`/risk-appetite/${appetite.id}/activate`);
    };

    const handleDelete = (appetite: RiskAppetite) => {
        router.delete(`/risk-appetite/${appetite.id}`, {
            onFinish: () => setDeleteTarget(null),
        });
    };

    return (
        <AdminLayout>
            <Head title="Risk Appetite Configuration" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Risk Appetite Configuration
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Define acceptable risk thresholds for your
                            organization
                        </p>
                    </div>
                    <Button onClick={() => setAddOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" /> Add Configuration
                    </Button>
                </div>

                {/* Error from backend */}
                {pageErrors?.appetite && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {pageErrors.appetite}
                    </div>
                )}

                {/* Active Appetite Card */}
                {active_appetite ? (
                    <ActiveAppetiteCard appetite={active_appetite} />
                ) : (
                    <Card className="border-2 border-dashed border-border dark:border-border">
                        <CardContent className="p-8 text-center text-muted-foreground">
                            <Sliders className="mx-auto mb-2 h-8 w-8 opacity-40" />
                            <p className="font-medium">
                                No active appetite configured
                            </p>
                            <p className="mt-1 text-sm">
                                Add a configuration and activate it to start
                                classifying risks.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* All Configurations Table */}
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base font-semibold">
                            All Configurations ({appetites.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="mt-4 p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-y border-border bg-muted/50 dark:border-border dark:bg-secondary">
                                    <tr>
                                        {[
                                            'Name',
                                            'Acceptable (≤)',
                                            'Review (≤)',
                                            'Escalated (≥)',
                                            'Notify',
                                            'Status',
                                            'Actions',
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {appetites.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-4 py-10 text-center text-muted-foreground"
                                            >
                                                No configurations yet. Click
                                                "Add Configuration" to create
                                                one.
                                            </td>
                                        </tr>
                                    ) : (
                                        appetites.map((a) => (
                                            <tr
                                                key={a.id}
                                                className={`transition-colors hover:bg-muted/50 dark:hover:bg-secondary/50 ${a.is_active ? 'bg-blue-50/30 dark:bg-blue-950/10' : ''}`}
                                            >
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-foreground">
                                                        {a.name}
                                                    </p>
                                                    {a.notes && (
                                                        <p className="max-w-[200px] truncate text-xs text-muted-foreground">
                                                            {a.notes}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                        ≤{' '}
                                                        {a.acceptable_max_score}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                        ≤ {a.review_max_score}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                        ≥{' '}
                                                        {a.escalated_min_score}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {a.notify_on_escalation ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="gap-1 border-blue-200 bg-blue-50 text-xs text-primary"
                                                        >
                                                            <Bell className="h-3 w-3" />{' '}
                                                            Yes
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="gap-1 text-xs text-muted-foreground"
                                                        >
                                                            <BellOff className="h-3 w-3" />{' '}
                                                            No
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {a.is_active ? (
                                                        <Badge className="gap-1 border-green-200 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                            <CheckCircle2 className="h-3 w-3" />{' '}
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="gap-1 text-muted-foreground"
                                                        >
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        {!a.is_active && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 gap-1 text-xs text-primary hover:bg-blue-50 hover:text-blue-700"
                                                                onClick={() =>
                                                                    handleActivate(
                                                                        a,
                                                                    )
                                                                }
                                                            >
                                                                <Zap className="h-3.5 w-3.5" />{' '}
                                                                Activate
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() =>
                                                                setEditTarget(a)
                                                            }
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className={`h-8 w-8 ${a.is_active ? 'cursor-not-allowed text-gray-300' : 'text-red-500 hover:bg-red-50 hover:text-red-600'}`}
                                                            onClick={() =>
                                                                !a.is_active &&
                                                                setDeleteTarget(
                                                                    a,
                                                                )
                                                            }
                                                            disabled={
                                                                a.is_active
                                                            }
                                                            title={
                                                                a.is_active
                                                                    ? 'Cannot delete the active configuration'
                                                                    : 'Delete'
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Add Modal */}
            {addOpen && (
                <AppetiteModal
                    open={addOpen}
                    onClose={() => setAddOpen(false)}
                    editTarget={null}
                    saving={saving}
                    onSave={handleSave}
                />
            )}

            {/* Edit Modal */}
            {editTarget && (
                <AppetiteModal
                    open={!!editTarget}
                    onClose={() => setEditTarget(null)}
                    editTarget={editTarget}
                    saving={saving}
                    onSave={handleSave}
                />
            )}

            {/* Delete Confirm Dialog */}
            <Dialog
                open={!!deleteTarget}
                onOpenChange={(v) => !v && setDeleteTarget(null)}
            >
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="h-4 w-4" /> Delete Configuration
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                        Are you sure you want to delete{' '}
                        <strong>"{deleteTarget?.name}"</strong>? This cannot be
                        undone.
                    </p>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                deleteTarget && handleDelete(deleteTarget)
                            }
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
