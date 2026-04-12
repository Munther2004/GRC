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
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Sliders, Plus, CheckCircle2, AlertTriangle, Pencil, Trash2, Zap, Bell, BellOff } from 'lucide-react';
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
    name:                          '',
    acceptable_max_score:          '6',
    review_max_score:              '14',
    escalated_min_score:           '15',
    acceptable_label:              'Acceptable',
    review_label:                  'Requires Review',
    escalated_label:               'Escalated',
    notify_on_escalation:          true,
    escalation_notification_roles: ['admin', 'auditor'],
    notes:                         '',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function bandTailwind(color: string): { bg: string; text: string; border: string } {
    if (color === 'green') return { bg: 'bg-green-100 dark:bg-green-900/30',  text: 'text-green-700 dark:text-green-400',  border: 'border-green-200 dark:border-green-700' };
    if (color === 'amber') return { bg: 'bg-amber-100 dark:bg-amber-900/30',  text: 'text-amber-700 dark:text-amber-400',  border: 'border-amber-200 dark:border-amber-700' };
    return                        { bg: 'bg-red-100 dark:bg-red-900/30',      text: 'text-red-700 dark:text-red-400',      border: 'border-red-200 dark:border-red-700' };
}

// ── Active appetite card ───────────────────────────────────────────────────────

function ActiveAppetiteCard({ appetite }: { appetite: RiskAppetite }) {
    const total = 25;
    const acceptablePct  = Math.round((appetite.acceptable_max_score / total) * 100);
    const reviewPct      = Math.round(((appetite.review_max_score - appetite.acceptable_max_score) / total) * 100);
    const escalatedPct   = 100 - acceptablePct - reviewPct;

    return (
        <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-blue-600" />
                        {appetite.name}
                    </CardTitle>
                    <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-400">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Gradient bar */}
                <div>
                    <div className="flex h-8 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div
                            className="bg-green-500 flex items-center justify-center text-white text-xs font-semibold"
                            style={{ width: `${acceptablePct}%` }}
                            title={appetite.acceptable_label}
                        >
                            {acceptablePct >= 12 ? appetite.acceptable_label : ''}
                        </div>
                        <div
                            className="bg-amber-400 flex items-center justify-center text-white text-xs font-semibold"
                            style={{ width: `${reviewPct}%` }}
                            title={appetite.review_label}
                        >
                            {reviewPct >= 12 ? appetite.review_label : ''}
                        </div>
                        <div
                            className="bg-red-500 flex items-center justify-center text-white text-xs font-semibold flex-1"
                            title={appetite.escalated_label}
                        >
                            {escalatedPct >= 12 ? appetite.escalated_label : ''}
                        </div>
                    </div>
                    <div className="flex text-xs text-gray-500 mt-1.5">
                        <div style={{ width: `${acceptablePct}%` }}>Score 1–{appetite.acceptable_max_score}</div>
                        <div style={{ width: `${reviewPct}%` }}>{appetite.acceptable_max_score + 1}–{appetite.review_max_score}</div>
                        <div className="flex-1 text-right">{appetite.escalated_min_score}–25</div>
                    </div>
                </div>

                {/* Legend pills */}
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: appetite.acceptable_label, range: `≤ ${appetite.acceptable_max_score}`, color: 'green' },
                        { label: appetite.review_label,     range: `${appetite.acceptable_max_score + 1}–${appetite.review_max_score}`, color: 'amber' },
                        { label: appetite.escalated_label,  range: `≥ ${appetite.escalated_min_score}`, color: 'red' },
                    ].map(({ label, range, color }) => {
                        const tw = bandTailwind(color);
                        return (
                            <span key={label} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${tw.bg} ${tw.text} ${tw.border}`}>
                                {label} <span className="opacity-60">({range})</span>
                            </span>
                        );
                    })}
                </div>

                {/* Notify row */}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    {appetite.notify_on_escalation ? (
                        <>
                            <Bell className="w-3.5 h-3.5 text-blue-500" />
                            <span>Notifications enabled for: {(appetite.escalation_notification_roles ?? []).join(', ')}</span>
                        </>
                    ) : (
                        <>
                            <BellOff className="w-3.5 h-3.5 text-gray-400" />
                            <span>Escalation notifications disabled</span>
                        </>
                    )}
                </div>

                {appetite.notes && (
                    <p className="text-xs text-gray-500 italic border-t pt-2">{appetite.notes}</p>
                )}
            </CardContent>
        </Card>
    );
}

// ── Add / Edit Modal ──────────────────────────────────────────────────────────

function AppetiteModal({
    open, onClose, editTarget, saving, onSave,
}: {
    open: boolean;
    onClose: () => void;
    editTarget: RiskAppetite | null;
    saving: boolean;
    onSave: (form: FormState) => void;
}) {
    const [form, setForm] = useState<FormState>(
        editTarget ? {
            name:                          editTarget.name,
            acceptable_max_score:          String(editTarget.acceptable_max_score),
            review_max_score:              String(editTarget.review_max_score),
            escalated_min_score:           String(editTarget.escalated_min_score),
            acceptable_label:              editTarget.acceptable_label,
            review_label:                  editTarget.review_label,
            escalated_label:               editTarget.escalated_label,
            notify_on_escalation:          editTarget.notify_on_escalation,
            escalation_notification_roles: editTarget.escalation_notification_roles ?? [],
            notes:                         editTarget.notes ?? '',
        } : defaultForm
    );

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Auto-compute escalated_min from review_max
    const reviewMaxNum = parseInt(form.review_max_score) || 0;
    const escalatedMin = reviewMaxNum + 1;

    const set = (key: keyof FormState, value: any) => {
        setForm(f => ({ ...f, [key]: value }));
        if (key === 'review_max_score') {
            setForm(f => ({ ...f, review_max_score: value, escalated_min_score: String(parseInt(value) + 1 || '') }));
        }
    };

    const toggleRole = (role: string) => {
        setForm(f => ({
            ...f,
            escalation_notification_roles: f.escalation_notification_roles.includes(role)
                ? f.escalation_notification_roles.filter(r => r !== role)
                : [...f.escalation_notification_roles, role],
        }));
    };

    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        const acc = parseInt(form.acceptable_max_score);
        const rev = parseInt(form.review_max_score);
        if (!form.name.trim()) errs.name = 'Name is required.';
        if (!acc || acc < 1 || acc > 24) errs.acceptable_max_score = 'Must be between 1 and 24.';
        if (!rev || rev < 2 || rev > 25) errs.review_max_score = 'Must be between 2 and 25.';
        if (rev <= acc) errs.review_max_score = 'Must be greater than Acceptable score.';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        onSave({ ...form, escalated_min_score: String(escalatedMin) });
    };

    return (
        <Dialog open={open} onOpenChange={v => !saving && !v && onClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sliders className="w-4 h-4" />
                        {editTarget ? 'Edit Configuration' : 'Add Configuration'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Name */}
                    <div>
                        <Label>Configuration Name</Label>
                        <Input
                            value={form.name}
                            onChange={e => set('name', e.target.value)}
                            placeholder="e.g. ISO 27001 Risk Appetite"
                            className="mt-1"
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    {/* Score thresholds */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <Label className="text-xs">Acceptable up to</Label>
                            <Input
                                type="number" min={1} max={24}
                                value={form.acceptable_max_score}
                                onChange={e => set('acceptable_max_score', e.target.value)}
                                className="mt-1"
                            />
                            {errors.acceptable_max_score && <p className="text-xs text-red-500 mt-1">{errors.acceptable_max_score}</p>}
                            <p className="text-xs text-gray-400 mt-0.5">Score 1–25</p>
                        </div>
                        <div>
                            <Label className="text-xs">Review up to</Label>
                            <Input
                                type="number" min={2} max={25}
                                value={form.review_max_score}
                                onChange={e => set('review_max_score', e.target.value)}
                                className="mt-1"
                            />
                            {errors.review_max_score && <p className="text-xs text-red-500 mt-1">{errors.review_max_score}</p>}
                            <p className="text-xs text-gray-400 mt-0.5">&gt; Acceptable</p>
                        </div>
                        <div>
                            <Label className="text-xs">Escalated from</Label>
                            <Input
                                type="number"
                                value={isNaN(escalatedMin) ? '' : escalatedMin}
                                readOnly
                                className="mt-1 bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-0.5">Auto-calculated</p>
                        </div>
                    </div>

                    {/* Labels */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <Label className="text-xs flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                                Acceptable Label
                            </Label>
                            <Input value={form.acceptable_label} onChange={e => set('acceptable_label', e.target.value)} className="mt-1" />
                        </div>
                        <div>
                            <Label className="text-xs flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                                Review Label
                            </Label>
                            <Input value={form.review_label} onChange={e => set('review_label', e.target.value)} className="mt-1" />
                        </div>
                        <div>
                            <Label className="text-xs flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                                Escalated Label
                            </Label>
                            <Input value={form.escalated_label} onChange={e => set('escalated_label', e.target.value)} className="mt-1" />
                        </div>
                    </div>

                    {/* Notify on escalation */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => set('notify_on_escalation', !form.notify_on_escalation)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                form.notify_on_escalation ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    form.notify_on_escalation ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                        <Label className="cursor-pointer" onClick={() => set('notify_on_escalation', !form.notify_on_escalation)}>
                            Notify on escalation
                        </Label>
                    </div>

                    {/* Roles (only if notify enabled) */}
                    {form.notify_on_escalation && (
                        <div>
                            <Label className="text-xs mb-2 block">Notify Roles</Label>
                            <div className="flex gap-3">
                                {(['admin', 'auditor', 'user'] as const).map(role => (
                                    <label key={role} className="flex items-center gap-1.5 cursor-pointer text-sm">
                                        <input
                                            type="checkbox"
                                            checked={form.escalation_notification_roles.includes(role)}
                                            onChange={() => toggleRole(role)}
                                            className="rounded"
                                        />
                                        <span className="capitalize">{role}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <Label className="text-xs">Notes (optional)</Label>
                        <Textarea
                            value={form.notes}
                            onChange={e => set('notes', e.target.value)}
                            rows={2}
                            className="mt-1"
                            placeholder="Context or rationale for this configuration…"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving…' : editTarget ? 'Update' : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function RiskAppetiteIndex({ appetites, active_appetite }: Props) {
    const { errors: pageErrors } = usePage<SharedProps>().props;
    const [addOpen,    setAddOpen]    = useState(false);
    const [editTarget, setEditTarget] = useState<RiskAppetite | null>(null);
    const [saving,     setSaving]     = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<RiskAppetite | null>(null);

    const handleSave = (form: FormState) => {
        setSaving(true);
        if (editTarget) {
            router.put(`/risk-appetite/${editTarget.id}`, {
                ...form,
                acceptable_max_score:          parseInt(form.acceptable_max_score),
                review_max_score:              parseInt(form.review_max_score),
                escalated_min_score:           parseInt(form.escalated_min_score),
                acceptable_color:              'green',
                review_color:                  'amber',
                escalated_color:               'red',
                notify_on_escalation:          form.notify_on_escalation ? 1 : 0,
            }, {
                onFinish: () => { setSaving(false); setEditTarget(null); },
            });
        } else {
            router.post('/risk-appetite', {
                ...form,
                acceptable_max_score:          parseInt(form.acceptable_max_score),
                review_max_score:              parseInt(form.review_max_score),
                escalated_min_score:           parseInt(form.escalated_min_score),
                acceptable_color:              'green',
                review_color:                  'amber',
                escalated_color:               'red',
                notify_on_escalation:          form.notify_on_escalation ? 1 : 0,
            }, {
                onFinish: () => { setSaving(false); setAddOpen(false); },
            });
        }
    };

    const handleActivate = (appetite: RiskAppetite) => {
        if (!confirm(`Activate "${appetite.name}"? This will deactivate the current configuration and re-classify all risks.`)) return;
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Risk Appetite Configuration</h1>
                        <p className="text-sm text-gray-500 mt-1">Define acceptable risk thresholds for your organization</p>
                    </div>
                    <Button onClick={() => setAddOpen(true)} className="gap-2">
                        <Plus className="w-4 h-4" /> Add Configuration
                    </Button>
                </div>

                {/* Error from backend */}
                {pageErrors?.appetite && (
                    <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        {pageErrors.appetite}
                    </div>
                )}

                {/* Active Appetite Card */}
                {active_appetite ? (
                    <ActiveAppetiteCard appetite={active_appetite} />
                ) : (
                    <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700">
                        <CardContent className="p-8 text-center text-gray-400">
                            <Sliders className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="font-medium">No active appetite configured</p>
                            <p className="text-sm mt-1">Add a configuration and activate it to start classifying risks.</p>
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
                    <CardContent className="p-0 mt-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
                                    <tr>
                                        {['Name', 'Acceptable (≤)', 'Review (≤)', 'Escalated (≥)', 'Notify', 'Status', 'Actions'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {appetites.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                                                No configurations yet. Click "Add Configuration" to create one.
                                            </td>
                                        </tr>
                                    ) : appetites.map(a => (
                                        <tr key={a.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${a.is_active ? 'bg-blue-50/30 dark:bg-blue-950/10' : ''}`}>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900 dark:text-white">{a.name}</p>
                                                {a.notes && <p className="text-xs text-gray-400 truncate max-w-[200px]">{a.notes}</p>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                    ≤ {a.acceptable_max_score}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                    ≤ {a.review_max_score}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                    ≥ {a.escalated_min_score}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {a.notify_on_escalation ? (
                                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200 gap-1">
                                                        <Bell className="w-3 h-3" /> Yes
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-xs text-gray-400 gap-1">
                                                        <BellOff className="w-3 h-3" /> No
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {a.is_active ? (
                                                    <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-gray-400 gap-1">
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    {!a.is_active && (
                                                        <Button
                                                            variant="ghost" size="sm"
                                                            className="h-8 text-xs gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                            onClick={() => handleActivate(a)}
                                                        >
                                                            <Zap className="w-3.5 h-3.5" /> Activate
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => setEditTarget(a)}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className={`h-8 w-8 ${a.is_active ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:text-red-600 hover:bg-red-50'}`}
                                                        onClick={() => !a.is_active && setDeleteTarget(a)}
                                                        disabled={a.is_active}
                                                        title={a.is_active ? 'Cannot delete the active configuration' : 'Delete'}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
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
            <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Delete Configuration
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete <strong>"{deleteTarget?.name}"</strong>? This cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteTarget && handleDelete(deleteTarget)}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
