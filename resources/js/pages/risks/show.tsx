import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Pencil,
    Trash2,
    AlertTriangle,
    User,
    Calendar,
    Tag,
    Shield,
    Link2,
    Unlink,
    Plus,
    Sparkles,
    ShieldCheck,
    X,
    Save,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { route } from '@/lib/routes';
import type { SharedProps } from '@/types';

interface TreatmentPlan {
    id: number;
    strategy: 'mitigate' | 'accept' | 'transfer' | 'avoid';
    description: string;
    owner: string;
    due_date: string | null;
    progress: number;
    status: 'not_started' | 'in_progress' | 'completed';
    residual_likelihood: number | null;
    residual_impact: number | null;
    residual_score: number | null;
    residual_level: string | null;
}

interface Risk {
    id: number;
    title: string;
    description: string;
    category: string;
    owner: string;
    likelihood: number;
    impact: number;
    risk_score: number;
    risk_level: string;
    status: string;
    treatment: string;
    treatment_plan: string | null;
    due_date: string | null;
    created_at: string;
    user: { name: string };
    auto_generated: number;
    ai_validated: boolean;
    source_control: { control_id: string; title: string } | null;
}

interface LinkedControl {
    id: number;
    control_id: string;
    title: string;
    description: string;
    implementation_guidance: string | null;
    category: string;
    auto_linked: boolean;
    link_type: string;
    link_reason: string | null;
    framework: string;
}

interface AllControl {
    id: number;
    control_id: string;
    title: string;
    framework: string;
}

interface Props {
    risk: Risk;
    linkedControls: LinkedControl[];
    allControls: AllControl[];
    treatmentPlans: TreatmentPlan[];
}

interface PlanFormState {
    strategy: 'mitigate' | 'accept' | 'transfer' | 'avoid';
    description: string;
    owner: string;
    due_date: string;
    progress: number;
    status: 'not_started' | 'in_progress' | 'completed';
    residual_likelihood: number | '';
    residual_impact: number | '';
}

const levelColors: Record<string, string> = {
    critical: 'border-[#e5484d]/40',
    high:     'border-[#f76b15]/40',
    medium:   'border-[#f5b929]/40',
    low:      'border-[#46bd5f]/40',
};
const levelStyle = (level: string): React.CSSProperties => ({
    critical: { color: '#e5484d', background: 'rgba(229,72,77,0.12)', borderColor: 'rgba(229,72,77,0.4)' },
    high:     { color: '#f76b15', background: 'rgba(247,107,21,0.12)', borderColor: 'rgba(247,107,21,0.4)' },
    medium:   { color: '#f5b929', background: 'rgba(245,185,41,0.12)', borderColor: 'rgba(245,185,41,0.4)' },
    low:      { color: '#46bd5f', background: 'rgba(70,189,95,0.12)', borderColor: 'rgba(70,189,95,0.4)' },
}[level] ?? { color: 'var(--muted-foreground)', background: 'color-mix(in srgb, var(--muted) 50%, transparent)' });

const strategyColors: Record<string, string> = {
    mitigate: 'bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-primary border-[color-mix(in_srgb,var(--primary)_30%,transparent)]',
    accept:   'bg-muted text-muted-foreground border-border',
    transfer: 'bg-[rgba(245,185,41,0.12)] text-[#f5b929] border-[rgba(245,185,41,0.3)]',
    avoid:    'bg-[rgba(229,72,77,0.12)] text-[#e5484d] border-[rgba(229,72,77,0.3)]',
};

const statusLabels: Record<string, string> = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    completed: 'Completed',
};

const ScoreCell = ({ value, active, color }: { value: number; active: boolean; color: string }) => (
    <div
        className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm ${active ? color : ''}`}
        style={!active ? { border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--muted-foreground)', fontWeight: 500 } : { fontWeight: 500 }}
    >
        {value}
    </div>
);

const emptyPlan: PlanFormState = {
    strategy: 'mitigate',
    description: '',
    owner: '',
    due_date: '',
    progress: 0,
    status: 'not_started',
    residual_likelihood: '',
    residual_impact: '',
};

export default function RiskShow({
    risk,
    linkedControls,
    allControls,
    treatmentPlans,
}: Props) {
    const { auth } = usePage<SharedProps>().props;
    const isAdmin = auth.user.role === 'super_admin' || auth.user.role === 'admin';
    const canEdit = auth.user.role === 'super_admin' || auth.user.role === 'admin' || auth.user.role === 'user';
    const confirm = useConfirm();

    const [selectedControlId, setSelectedControlId] = useState<number | ''>('');
    const [controlSearch, setControlSearch] = useState('');

    // Treatment plan state
    const [showPlanForm, setShowPlanForm] = useState(false);
    const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
    const [planForm, setPlanForm] = useState<PlanFormState>({ ...emptyPlan });

    const deleteRisk = async () => {
        const ok = await confirm({
            title: `Delete "${risk.title}"?`,
            description: 'This cannot be undone.',
            confirmLabel: 'Delete',
            tone: 'destructive',
        });
        if (!ok) return;
        router.delete(route('risks.destroy', risk.id));
    };

    const linkControl = () => {
        if (!selectedControlId) return;
        router.post(
            route('risks.link-control', risk.id),
            { control_id: selectedControlId },
            {
                onSuccess: () => {
                    setSelectedControlId('');
                    setControlSearch('');
                },
            },
        );
    };

    const unlinkControl = async (controlId: number) => {
        const ok = await confirm({
            title: 'Unlink this control?',
            confirmLabel: 'Unlink',
        });
        if (!ok) return;
        router.post(route('risks.unlink-control', risk.id), {
            control_id: controlId,
        });
    };

    const filteredControls = allControls.filter(
        (c) =>
            !linkedControls.some((lc) => lc.id === c.id) &&
            (controlSearch === '' ||
                c.control_id
                    .toLowerCase()
                    .includes(controlSearch.toLowerCase()) ||
                c.title.toLowerCase().includes(controlSearch.toLowerCase()) ||
                c.framework
                    .toLowerCase()
                    .includes(controlSearch.toLowerCase())),
    );

    const submitPlan = () => {
        const data = {
            ...planForm,
            residual_likelihood:
                planForm.residual_likelihood === ''
                    ? null
                    : planForm.residual_likelihood,
            residual_impact:
                planForm.residual_impact === ''
                    ? null
                    : planForm.residual_impact,
        };
        if (editingPlanId) {
            router.put(
                route('risks.treatment-plans.update', {
                    risk: risk.id,
                    plan: editingPlanId,
                }),
                data,
                {
                    onSuccess: () => {
                        setEditingPlanId(null);
                        setShowPlanForm(false);
                    },
                },
            );
        } else {
            router.post(route('risks.treatment-plans.store', risk.id), data, {
                onSuccess: () => {
                    setShowPlanForm(false);
                    setPlanForm({ ...emptyPlan });
                },
            });
        }
    };

    const startEdit = (p: TreatmentPlan) => {
        setEditingPlanId(p.id);
        setPlanForm({
            strategy: p.strategy,
            description: p.description,
            owner: p.owner,
            due_date: p.due_date ?? '',
            progress: p.progress,
            status: p.status,
            residual_likelihood: p.residual_likelihood ?? '',
            residual_impact: p.residual_impact ?? '',
        });
        setShowPlanForm(true);
    };

    const cancelForm = () => {
        setShowPlanForm(false);
        setEditingPlanId(null);
        setPlanForm({ ...emptyPlan });
    };

    const deletePlan = async (planId: number) => {
        const ok = await confirm({
            title: 'Delete this treatment plan?',
            confirmLabel: 'Delete',
            tone: 'destructive',
        });
        if (!ok) return;
        router.delete(
            route('risks.treatment-plans.destroy', {
                risk: risk.id,
                plan: planId,
            }),
        );
    };

    const score = risk.likelihood * risk.impact;

    return (
        <AdminLayout>
            <Head title={risk.title} />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <Link href={route('risks.index')}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-4xl tracking-[-0.02em]" style={{ color: 'var(--foreground)', fontWeight: 500, lineHeight: 1.1 }}>
                                {risk.title}
                            </h1>
                            <p className="mt-0.5 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                                Created by {risk.user?.name} ·{' '}
                                {new Date(risk.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {canEdit && (
                            <Link href={route('risks.edit', risk.id)}>
                                <Button variant="outline" className="gap-2">
                                    <Pencil className="h-4 w-4" /> Edit
                                </Button>
                            </Link>
                        )}
                        {isAdmin && (
                            <Button
                                variant="destructive"
                                className="gap-2"
                                onClick={deleteRisk}
                            >
                                <Trash2 className="h-4 w-4" /> Delete
                            </Button>
                        )}
                    </div>
                </div>

                {/* AI-generated banner */}
                {risk.auto_generated === 1 && risk.source_control && (
                    <div className="flex items-start gap-3 rounded-2xl p-4" style={{ background: 'color-mix(in srgb, var(--primary) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)' }}>
                        <Sparkles className="mt-0.5 h-5 w-5 shrink-0" style={{ color: 'var(--primary)' }} />
                        <div>
                            <p className="text-[10px] uppercase" style={{ color: 'var(--primary)', letterSpacing: '0.28em' }}>
                                This risk was automatically generated by AI
                            </p>
                            <p className="mt-0.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                From non-compliant control:{' '}
                                <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                                    {risk.source_control.control_id}
                                </span>{' '}
                                — {risk.source_control.title}
                            </p>
                        </div>
                    </div>
                )}

                {/* AI Validated banner */}
                {risk.ai_validated && (
                    <div className="flex items-center gap-3 rounded-2xl p-3" style={{ background: 'color-mix(in srgb, var(--primary) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)' }}>
                        <Sparkles className="h-4 w-4 shrink-0" style={{ color: 'var(--primary)' }} />
                        <p className="text-[10px] uppercase" style={{ color: 'var(--primary)', letterSpacing: '0.28em' }}>
                            Risk scores have been validated by AI
                        </p>
                        <Badge className="ml-auto shrink-0">
                            <Sparkles className="mr-1 h-3 w-3" />
                            AI Validated
                        </Badge>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-6">
                    {/* Left column */}
                    <div className="col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Description
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap text-foreground/85">
                                    {risk.description}
                                </p>
                            </CardContent>
                        </Card>

                        {risk.treatment_plan && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Treatment Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="whitespace-pre-wrap text-foreground/85">
                                        {risk.treatment_plan}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Risk Matrix */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Risk Matrix — ISO/IEC 27005
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1">
                                        <span className="w-20 pr-2 text-right text-[9px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
                                            Impact →
                                        </span>
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div
                                                key={i}
                                                className="w-10 text-center text-[10px]" style={{ color: 'var(--muted-foreground)' }}
                                            >
                                                {i}
                                            </div>
                                        ))}
                                    </div>
                                    {[5, 4, 3, 2, 1].map((l) => (
                                        <div
                                            key={l}
                                            className="flex items-center gap-1"
                                        >
                                            <span className="w-20 pr-2 text-right text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                L={l}
                                            </span>
                                            {[1, 2, 3, 4, 5].map((i) => {
                                                const s = l * i;
                                                const isActive =
                                                    l === risk.likelihood &&
                                                    i === risk.impact;
                                                const c =
                                                    s >= 20 ? 'bg-[#e5484d] text-white border-[#e5484d]'
                                                    : s >= 13 ? 'bg-[#f76b15] text-white border-[#f76b15]'
                                                    : s >= 7  ? 'bg-[#f5b929] text-[#091413] border-[#f5b929]'
                                                    : 'bg-[#46bd5f] text-white border-[#46bd5f]';
                                                return (
                                                    <ScoreCell
                                                        key={i}
                                                        value={s}
                                                        active={isActive}
                                                        color={c}
                                                    />
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right column */}
                    <div className="space-y-4">
                        <Card>
                            <CardContent
                                className="mt-4 rounded-2xl p-4"
                                style={levelStyle(risk.risk_level)}
                            >
                                <div className="mb-2 flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    <span className="text-[10px] uppercase" style={{ letterSpacing: '0.28em' }}>
                                        {risk.risk_level} Risk
                                    </span>
                                </div>
                                <div className="text-4xl tabular-nums" style={{ fontWeight: 500 }}>
                                    {score}
                                    <span className="text-lg" style={{ opacity: 0.6 }}>
                                        {' '} / 25
                                    </span>
                                </div>
                                <p className="mt-1 text-xs">
                                    {risk.likelihood} (likelihood) × {risk.impact} (impact)
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="space-y-3 p-4">
                                {[
                                    {
                                        icon: Tag,
                                        label: 'Category',
                                        value: risk.category,
                                    },
                                    {
                                        icon: User,
                                        label: 'Owner',
                                        value: risk.owner,
                                    },
                                    {
                                        icon: Shield,
                                        label: 'Treatment',
                                        value: risk.treatment,
                                    },
                                    {
                                        icon: Calendar,
                                        label: 'Due Date',
                                        value: risk.due_date
                                            ? new Date(
                                                  risk.due_date,
                                              ).toLocaleDateString()
                                            : 'Not set',
                                    },
                                ].map(({ icon: Icon, label, value }) => (
                                    <div
                                        key={label}
                                        className="flex items-start gap-3"
                                    >
                                        <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                                        <div>
                                            <p className="text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
                                                {label}
                                            </p>
                                            <p className="text-sm capitalize" style={{ color: 'var(--foreground)' }}>
                                                {value}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                                    <p className="mb-1 text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
                                        Status
                                    </p>
                                    <Badge variant="outline" className="capitalize">
                                        {risk.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* ── Treatment Plans ─────────────────────────────────────────── */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ShieldCheck className="h-4 w-4" />
                            Treatment Plans
                            <Badge variant="secondary" className="ml-1">
                                {treatmentPlans.length}
                            </Badge>
                        </CardTitle>
                        {canEdit && !showPlanForm && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                onClick={() => {
                                    setEditingPlanId(null);
                                    setPlanForm({ ...emptyPlan });
                                    setShowPlanForm(true);
                                }}
                            >
                                <Plus className="h-3.5 w-3.5" /> Add Plan
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Inline form */}
                        {showPlanForm && canEdit && (
                            <div className="space-y-3 rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                                <p className="text-sm" style={{ fontWeight: 500 }}>
                                    {editingPlanId
                                        ? 'Edit Treatment Plan'
                                        : 'New Treatment Plan'}
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
                                            Strategy
                                        </label>
                                        <Select
                                            value={planForm.strategy}
                                            onValueChange={(v) =>
                                                setPlanForm((f) => ({
                                                    ...f,
                                                    strategy: v as any,
                                                }))
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="mitigate">Mitigate</SelectItem>
                                                <SelectItem value="accept">Accept</SelectItem>
                                                <SelectItem value="transfer">Transfer</SelectItem>
                                                <SelectItem value="avoid">Avoid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
                                            Status
                                        </label>
                                        <Select
                                            value={planForm.status}
                                            onValueChange={(v) =>
                                                setPlanForm((f) => ({
                                                    ...f,
                                                    status: v as any,
                                                }))
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="not_started">Not Started</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
                                        Owner
                                    </label>
                                    <input
                                        type="text"
                                        value={planForm.owner}
                                        onChange={(e) =>
                                            setPlanForm((f) => ({
                                                ...f,
                                                owner: e.target.value,
                                            }))
                                        }
                                        placeholder="Responsible person or team"
                                        className="w-full rounded-full px-3 py-1.5 text-sm focus:outline-none" style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
                                        Description
                                    </label>
                                    <textarea
                                        value={planForm.description}
                                        onChange={(e) =>
                                            setPlanForm((f) => ({
                                                ...f,
                                                description: e.target.value,
                                            }))
                                        }
                                        rows={3}
                                        placeholder="Describe the treatment actions..."
                                        className="w-full resize-none rounded-2xl px-3 py-1.5 text-sm focus:outline-none" style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
                                            Due Date
                                        </label>
                                        <input
                                            type="date"
                                            value={planForm.due_date}
                                            onChange={(e) =>
                                                setPlanForm((f) => ({
                                                    ...f,
                                                    due_date: e.target.value,
                                                }))
                                            }
                                            className="w-full rounded-full px-3 py-1.5 text-sm focus:outline-none" style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
                                            Progress ({planForm.progress}%)
                                        </label>
                                        <input
                                            type="range"
                                            min={0}
                                            max={100}
                                            step={5}
                                            value={planForm.progress}
                                            onChange={(e) =>
                                                setPlanForm((f) => ({
                                                    ...f,
                                                    progress: Number(
                                                        e.target.value,
                                                    ),
                                                }))
                                            }
                                            className="mt-2 w-full" style={{ accentColor: 'var(--primary)' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-2 text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                                        Residual Risk (after treatment)
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="mb-1 block text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
                                                Likelihood (1–5)
                                            </label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={5}
                                                value={
                                                    planForm.residual_likelihood
                                                }
                                                onChange={(e) =>
                                                    setPlanForm((f) => ({
                                                        ...f,
                                                        residual_likelihood:
                                                            e.target.value ===
                                                            ''
                                                                ? ('' as any)
                                                                : Number(
                                                                      e.target
                                                                          .value,
                                                                  ),
                                                    }))
                                                }
                                                placeholder="—"
                                                className="w-full rounded-full px-3 py-1.5 text-sm focus:outline-none" style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
                                                Impact (1–5)
                                            </label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={5}
                                                value={planForm.residual_impact}
                                                onChange={(e) =>
                                                    setPlanForm((f) => ({
                                                        ...f,
                                                        residual_impact:
                                                            e.target.value ===
                                                            ''
                                                                ? ('' as any)
                                                                : Number(
                                                                      e.target
                                                                          .value,
                                                                  ),
                                                    }))
                                                }
                                                placeholder="—"
                                                className="w-full rounded-full px-3 py-1.5 text-sm focus:outline-none" style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-1">
                                    <Button
                                        size="sm"
                                        onClick={submitPlan}
                                        className="gap-1"
                                    >
                                        <Save className="h-3.5 w-3.5" /> Save
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={cancelForm}
                                        className="gap-1"
                                    >
                                        <X className="h-3.5 w-3.5" /> Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Plans list */}
                        {treatmentPlans.length === 0 && !showPlanForm && (
                            <p className="text-sm text-muted-foreground">
                                No treatment plans yet.{' '}
                                {canEdit ? 'Add one above.' : ''}
                            </p>
                        )}

                        {treatmentPlans.map((plan) => {
                            const residualScore = plan.residual_score;
                            const residualLevel = plan.residual_level;
                            const residualColor = residualLevel
                                ? levelColors[residualLevel]
                                : '';

                            return (
                                <div
                                    key={plan.id}
                                    className="space-y-3 rounded-2xl border p-4"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge
                                                className={`border capitalize ${strategyColors[plan.strategy]}`}
                                            >
                                                {plan.strategy}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                style={plan.status === 'completed' ? { color: '#46bd5f', borderColor: 'rgba(70,189,95,0.4)', background: 'rgba(70,189,95,0.1)' } : plan.status === 'in_progress' ? { color: 'var(--primary)', borderColor: 'color-mix(in srgb, var(--primary) 40%, transparent)', background: 'color-mix(in srgb, var(--primary) 10%, transparent)' } : { color: 'var(--muted-foreground)' }}
                                            >
                                                {statusLabels[plan.status]}
                                            </Badge>
                                        </div>
                                        {canEdit && (
                                            <div className="flex shrink-0 gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-7 px-2"
                                                    onClick={() =>
                                                        startEdit(plan)
                                                    }
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-7 px-2" style={{ color: 'var(--destructive)' }}
                                                    onClick={() =>
                                                        deletePlan(plan.id)
                                                    }
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                                        {plan.description}
                                    </p>

                                    <div className="grid grid-cols-2 gap-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                        <div className="flex items-center gap-1">
                                            <User className="h-3.5 w-3.5" />
                                            <span>{plan.owner}</span>
                                        </div>
                                        {plan.due_date && (
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>
                                                    {new Date(
                                                        plan.due_date,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Progress bar */}
                                    <div>
                                        <div className="mb-1 flex justify-between text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                            <span>Progress</span>
                                            <span>{plan.progress}%</span>
                                        </div>
                                        <div className="h-1 overflow-hidden rounded-full" style={{ background: 'var(--muted)' }}>
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${plan.progress}%`,
                                                    background: plan.progress === 100 ? '#46bd5f' : plan.progress >= 50 ? 'var(--primary)' : '#f5b929',
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Before vs After risk score */}
                                    {residualScore !== null && (
                                        <div className="grid grid-cols-2 gap-3 border-t pt-1">
                                            <div>
                                                <p className="mb-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                    Current Risk
                                                </p>
                                                <div
                                                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${levelColors[risk.risk_level]}`}
                                                >
                                                    <AlertTriangle className="h-3 w-3" />
                                                    {score}/25{' '}
                                                    <span className="capitalize">
                                                        ({risk.risk_level})
                                                    </span>
                                                </div>
                                                <p className="mt-0.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                    {risk.likelihood}L ×{' '}
                                                    {risk.impact}I
                                                </p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                    After Treatment
                                                </p>
                                                <div
                                                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${residualColor}`}
                                                >
                                                    <ShieldCheck className="h-3 w-3" />
                                                    {residualScore}/25{' '}
                                                    <span className="capitalize">
                                                        ({residualLevel})
                                                    </span>
                                                </div>
                                                <p className="mt-0.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                    {plan.residual_likelihood}L
                                                    × {plan.residual_impact}I
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Linked Controls */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Link2 className="h-4 w-4" />
                            Linked Controls
                            <Badge variant="secondary" className="ml-1">
                                {linkedControls.length}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {linkedControls.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No controls linked to this risk.
                            </p>
                        ) : (
                            <div>
                                <p className="mb-3 text-xs text-muted-foreground/70 italic">
                                    Follow these controls to achieve compliance
                                </p>
                                <div className="divide-y divide-border rounded-md border">
                                    {linkedControls.map((ctrl) => (
                                        <div
                                            key={ctrl.id}
                                            className="px-4 py-3"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="shrink-0 font-mono text-xs"
                                                    >
                                                        {ctrl.control_id}
                                                    </Badge>
                                                    <span className="text-sm font-medium text-foreground">
                                                        {ctrl.title}
                                                    </span>
                                                    <Badge
                                                        variant="secondary"
                                                        className="shrink-0 text-xs"
                                                    >
                                                        {ctrl.framework}
                                                    </Badge>
                                                    {ctrl.link_type === 'ai' ? (
                                                        <Badge className="shrink-0">
                                                            <Sparkles className="mr-0.5 h-2.5 w-2.5" />
                                                            AI
                                                        </Badge>
                                                    ) : ctrl.link_type ===
                                                      'manual' ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="shrink-0"
                                                            style={{ color: 'var(--primary)', borderColor: 'color-mix(in srgb, var(--primary) 30%, transparent)' }}
                                                        >
                                                            Manual
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="shrink-0"
                                                        >
                                                            Auto
                                                        </Badge>
                                                    )}
                                                </div>
                                                {isAdmin && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 shrink-0 px-2" style={{ color: 'var(--destructive)' }}
                                                        onClick={() =>
                                                            unlinkControl(
                                                                ctrl.id,
                                                            )
                                                        }
                                                    >
                                                        <Unlink className="mr-1 h-3.5 w-3.5" />{' '}
                                                        Unlink
                                                    </Button>
                                                )}
                                            </div>
                                            {ctrl.implementation_guidance && (
                                                <div className="mt-2 pl-1">
                                                    <p className="mb-0.5 text-xs font-medium text-muted-foreground/70">
                                                        Implementation Guidance:
                                                    </p>
                                                    <p className="text-xs leading-relaxed text-foreground/70">
                                                        {
                                                            ctrl.implementation_guidance
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isAdmin && (
                            <div className="space-y-2 border-t pt-2">
                                <p className="text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
                                    Add Control
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Search by ID, title or framework..."
                                        value={controlSearch}
                                        onChange={(e) =>
                                            setControlSearch(e.target.value)
                                        }
                                        className="flex-1 rounded-full border bg-card px-3 py-1.5 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                                    />
                                </div>
                                {controlSearch &&
                                    filteredControls.length > 0 && (
                                        <div className="max-h-48 divide-y overflow-y-auto rounded-2xl border">
                                            {filteredControls
                                                .slice(0, 10)
                                                .map((c) => (
                                                    <button
                                                        key={c.id}
                                                        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted" style={{ color: 'var(--foreground)' }}
                                                        onClick={() => {
                                                            setSelectedControlId(
                                                                c.id,
                                                            );
                                                            setControlSearch(
                                                                `[${c.framework}] ${c.control_id} — ${c.title}`,
                                                            );
                                                        }}
                                                    >
                                                        <Badge
                                                            variant="outline"
                                                            className="shrink-0 font-mono"
                                                        >
                                                            {c.control_id}
                                                        </Badge>
                                                        <span className="truncate">
                                                            {c.title}
                                                        </span>
                                                        <Badge
                                                            variant="secondary"
                                                            className="ml-auto shrink-0"
                                                        >
                                                            {c.framework}
                                                        </Badge>
                                                    </button>
                                                ))}
                                        </div>
                                    )}
                                {controlSearch &&
                                    filteredControls.length === 0 && (
                                        <p className="px-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                            No matching controls found.
                                        </p>
                                    )}
                                <Button
                                    size="sm"
                                    disabled={!selectedControlId}
                                    onClick={linkControl}
                                    className="gap-1"
                                >
                                    <Plus className="h-3.5 w-3.5" /> Link
                                    Control
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
