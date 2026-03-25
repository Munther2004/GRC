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
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { route } from '@/lib/routes';

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
}

const levelColors: Record<string, string> = {
    critical: 'text-red-500 bg-red-50 border-red-200',
    high: 'text-orange-500 bg-orange-50 border-orange-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    low: 'text-green-600 bg-green-50 border-green-200',
};

const ScoreCell = ({
    value,
    active,
    color,
}: {
    value: number;
    active: boolean;
    color: string;
}) => (
    <div
        className={`flex h-10 w-10 items-center justify-center rounded border text-xs font-bold ${active ? color : 'border-gray-200 bg-gray-100 text-gray-400 dark:bg-gray-800'}`}
    >
        {value}
    </div>
);

export default function RiskShow({ risk, linkedControls, allControls }: Props) {
    const { auth } = usePage().props as any;
    const isAdmin = auth.user.role === 'admin';
    const canEdit = auth.user.role === 'admin' || auth.user.role === 'user';

    const [selectedControlId, setSelectedControlId] = useState<number | ''>('');
    const [controlSearch, setControlSearch] = useState('');

    const deleteRisk = () => {
        if (!confirm(`Delete "${risk.title}"? This cannot be undone.`)) return;
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

    const unlinkControl = (controlId: number) => {
        if (!confirm('Unlink this control?')) return;
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

    const score = risk.likelihood * risk.impact;
    const levelColor = levelColors[risk.risk_level];

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
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {risk.title}
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
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
                                variant="outline"
                                className="gap-2 border-red-200 text-red-500 hover:bg-red-50"
                                onClick={deleteRisk}
                            >
                                <Trash2 className="h-4 w-4" /> Delete
                            </Button>
                        )}
                    </div>
                </div>

                {/* AI-generated banner */}
                {risk.auto_generated === 1 && risk.source_control && (
                    <div className="flex items-start gap-3 rounded-lg border border-purple-200 bg-purple-50 p-4">
                        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
                        <div>
                            <p className="text-sm font-medium text-purple-800">
                                This risk was automatically generated by AI
                            </p>
                            <p className="mt-0.5 text-xs text-purple-600">
                                From non-compliant control:{' '}
                                <span className="font-mono font-semibold">
                                    {risk.source_control.control_id}
                                </span>{' '}
                                — {risk.source_control.title}
                            </p>
                        </div>
                    </div>
                )}

                {/* AI Validated banner */}
                {risk.ai_validated && (
                    <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                        <Sparkles className="h-4 w-4 shrink-0 text-blue-600" />
                        <p className="text-sm font-medium text-blue-800">
                            Risk scores have been validated by AI
                        </p>
                        <Badge className="ml-auto shrink-0 border-blue-200 bg-blue-100 text-xs text-blue-700">
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
                                <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                                    {risk.description}
                                </p>
                            </CardContent>
                        </Card>

                        {risk.treatment_plan && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Treatment Plan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
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
                                        <span className="w-20 pr-2 text-right text-xs text-gray-400">
                                            Impact →
                                        </span>
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div
                                                key={i}
                                                className="w-10 text-center text-xs text-gray-400"
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
                                            <span className="w-20 pr-2 text-right text-xs text-gray-400">
                                                L={l}
                                            </span>
                                            {[1, 2, 3, 4, 5].map((i) => {
                                                const s = l * i;
                                                const isActive =
                                                    l === risk.likelihood &&
                                                    i === risk.impact;
                                                const c =
                                                    s >= 20
                                                        ? 'bg-red-500 text-white border-red-600'
                                                        : s >= 13
                                                          ? 'bg-orange-400 text-white border-orange-500'
                                                          : s >= 7
                                                            ? 'bg-yellow-400 text-gray-800 border-yellow-500'
                                                            : 'bg-green-400 text-white border-green-500';
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
                                className={`mt-4 rounded-lg border p-4 ${levelColor}`}
                            >
                                <div className="mb-2 flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    <span className="font-semibold capitalize">
                                        {risk.risk_level} Risk
                                    </span>
                                </div>
                                <div className="text-4xl font-bold">
                                    {score}
                                    <span className="text-lg font-normal">
                                        {' '}
                                        / 25
                                    </span>
                                </div>
                                <p className="mt-1 text-xs">
                                    {risk.likelihood} (likelihood) ×{' '}
                                    {risk.impact} (impact)
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
                                        <Icon className="mt-0.5 h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-400">
                                                {label}
                                            </p>
                                            <p className="text-sm font-medium capitalize">
                                                {value}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div className="border-t pt-2">
                                    <p className="mb-1 text-xs text-gray-400">
                                        Status
                                    </p>
                                    <Badge
                                        variant="outline"
                                        className="capitalize"
                                    >
                                        {risk.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

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
                                <p className="mb-3 text-xs text-gray-400 italic">
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
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {ctrl.title}
                                                    </span>
                                                    <Badge
                                                        variant="secondary"
                                                        className="shrink-0 text-xs"
                                                    >
                                                        {ctrl.framework}
                                                    </Badge>
                                                    {ctrl.link_type === 'ai' ? (
                                                        <Badge className="shrink-0 border-purple-200 bg-purple-100 text-xs text-purple-700">
                                                            <Sparkles className="mr-0.5 h-2.5 w-2.5" />
                                                            AI
                                                        </Badge>
                                                    ) : ctrl.link_type ===
                                                      'manual' ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="shrink-0 border-purple-200 bg-purple-50 text-xs text-purple-600"
                                                        >
                                                            Manual
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="shrink-0 border-gray-200 bg-gray-50 text-xs text-gray-500"
                                                        >
                                                            Auto
                                                        </Badge>
                                                    )}
                                                </div>
                                                {isAdmin && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 shrink-0 px-2 text-red-500 hover:bg-red-50 hover:text-red-600"
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
                                                    <p className="mb-0.5 text-xs font-medium text-gray-400">
                                                        Implementation Guidance:
                                                    </p>
                                                    <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
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
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
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
                                        className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                                    />
                                </div>
                                {controlSearch &&
                                    filteredControls.length > 0 && (
                                        <div className="max-h-48 divide-y overflow-y-auto rounded-md border">
                                            {filteredControls
                                                .slice(0, 10)
                                                .map((c) => (
                                                    <button
                                                        key={c.id}
                                                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
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
                                                            className="shrink-0 font-mono text-xs"
                                                        >
                                                            {c.control_id}
                                                        </Badge>
                                                        <span className="truncate">
                                                            {c.title}
                                                        </span>
                                                        <Badge
                                                            variant="secondary"
                                                            className="ml-auto shrink-0 text-xs"
                                                        >
                                                            {c.framework}
                                                        </Badge>
                                                    </button>
                                                ))}
                                        </div>
                                    )}
                                {controlSearch &&
                                    filteredControls.length === 0 && (
                                        <p className="px-1 text-xs text-muted-foreground">
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
