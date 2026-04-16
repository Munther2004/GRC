import { Head, Link, router } from '@inertiajs/react';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    ArrowRight,
    Save,
    CheckCircle,
    Upload,
    ChevronRight,
    FlaskConical,
    Sparkles,
    X,
    Loader2,
} from 'lucide-react';
import { useState, useRef } from 'react';
import axios from 'axios';

interface Control {
    id: number;
    control_id: string;
    title: string;
    description: string;
    category: string;
    implementation_guidance: string;
}

interface EvidenceFile {
    id: number;
    title: string;
    file_name: string;
}

interface Item {
    id: number;
    control_id: number;
    compliance_status: string;
    comments: string | null;
    control: Control;
    evidence: EvidenceFile[];
}

interface Assessment {
    id: number;
    title: string;
    status: string;
    framework: { name: string; short_name: string };
}

interface ExplanationData {
    plain_english: string;
    what_it_requires: string[];
    evidence_examples: string[];
    compliant_looks_like: string;
    non_compliant_risks: string;
}

interface Props {
    assessment: Assessment;
    items: Item[];
    pagination: {
        current_page: number;
        total_pages: number;
        total_items: number;
        per_page: number;
    };
    progress: { answered: number; total: number; percent: number };
    prefilledCount: number;
}

const statusOptions = [
    { value: 'compliant', label: 'Compliant', color: 'bg-green-500' },
    {
        value: 'partially_compliant',
        label: 'Partially Compliant',
        color: 'bg-yellow-500',
    },
    { value: 'non_compliant', label: 'Non-Compliant', color: 'bg-red-500' },
    { value: 'not_applicable', label: 'Not Applicable', color: 'bg-gray-400' },
];

const statusBadgeColors: Record<string, string> = {
    compliant: 'bg-green-50 text-green-700 border-green-200',
    partially_compliant: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    non_compliant: 'bg-red-950 text-red-400 border-red-200',
    not_applicable: 'bg-muted text-muted-foreground border-border',
};

export default function Questionnaire({
    assessment,
    items,
    pagination,
    progress,
    prefilledCount,
}: Props) {
    const [answers, setAnswers] = useState<
        Record<number, { compliance_status: string; comments: string }>
    >(
        Object.fromEntries(
            items.map((item) => [
                item.id,
                {
                    compliance_status: item.compliance_status,
                    comments: item.comments ?? '',
                },
            ]),
        ),
    );
    const [saving, setSaving] = useState(false);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [pendingUpload, setPendingUpload] = useState<{
        itemId: number;
        file: File;
    } | null>(null);
    const [expiryDate, setExpiryDate] = useState('');
    const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

    // AI Help state
    const [activeHelpControlId, setActiveHelpControlId] = useState<
        number | null
    >(null);
    const [helpData, setHelpData] = useState<Record<number, ExplanationData>>(
        {},
    );
    const [helpLoading, setHelpLoading] = useState<Record<number, boolean>>({});
    const [helpError, setHelpError] = useState<Record<number, string | null>>(
        {},
    );

    const updateAnswer = (itemId: number, field: string, value: string) => {
        setAnswers((prev) => ({
            ...prev,
            [itemId]: { ...prev[itemId], [field]: value },
        }));
    };

    const saveAnswers = (andNavigate?: string) => {
        setSaving(true);
        const payload = Object.entries(answers).map(([id, ans]) => ({
            id: Number(id),
            ...ans,
        }));

        router.post(
            route('assessments.save-answers', assessment.id),
            {
                answers: payload,
            },
            {
                onFinish: () => {
                    setSaving(false);
                    if (andNavigate) router.get(andNavigate);
                },
                preserveScroll: true,
            },
        );
    };

    const goToPage = (page: number) => {
        saveAnswers(`/assessments/${assessment.id}/questionnaire?page=${page}`);
    };

    const submitAssessment = () => {
        if (
            !confirm(
                'Submit this assessment? The compliance score will be calculated and status set to completed.',
            )
        )
            return;
        router.post(route('assessments.submit', assessment.id));
    };

    const qaAutoFill = () => {
        if (
            !confirm(
                '[QA] Auto-fill ALL controls with random statuses and submit? This will complete the assessment immediately.',
            )
        )
            return;
        router.post(route('assessments.auto-fill', assessment.id));
    };

    const fetchControlHelp = async (controlId: number) => {
        // Toggle off if already active
        if (activeHelpControlId === controlId) {
            setActiveHelpControlId(null);
            return;
        }

        setActiveHelpControlId(controlId);

        // Use cached result if available
        if (helpData[controlId]) return;

        setHelpLoading((prev) => ({ ...prev, [controlId]: true }));
        setHelpError((prev) => ({ ...prev, [controlId]: null }));

        try {
            const response = await axios.post('/assessments/explain-control', {
                control_id: controlId,
            });
            if (response.data?.success && response.data?.explanation) {
                setHelpData((prev) => ({
                    ...prev,
                    [controlId]: response.data.explanation,
                }));
            } else {
                setHelpError((prev) => ({
                    ...prev,
                    [controlId]:
                        'Could not load AI guidance. Please try again.',
                }));
            }
        } catch (err: any) {
            if (err?.response?.status === 429) {
                setHelpError((prev) => ({
                    ...prev,
                    [controlId]:
                        'Too many requests. Please wait a moment before asking for more guidance.',
                }));
            } else {
                setHelpError((prev) => ({
                    ...prev,
                    [controlId]:
                        'Could not load AI guidance. Please try again.',
                }));
            }
        } finally {
            setHelpLoading((prev) => ({ ...prev, [controlId]: false }));
        }
    };

    const retryControlHelp = (controlId: number) => {
        setHelpData((prev) => {
            const next = { ...prev };
            delete next[controlId];
            return next;
        });
        setHelpError((prev) => ({ ...prev, [controlId]: null }));
        fetchControlHelp(controlId);
    };

    const handleFileSelect = (itemId: number, file: File) => {
        setPendingUpload({ itemId, file });
        setExpiryDate('');
    };

    const confirmEvidenceUpload = () => {
        if (!pendingUpload) return;
        const { itemId, file } = pendingUpload;
        const title = file.name.replace(/\.[^/.]+$/, '');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        if (expiryDate) formData.append('expiry_date', expiryDate);

        router.post(
            `/assessments/${assessment.id}/items/${itemId}/evidence`,
            formData as any,
            {
                preserveScroll: true,
                onFinish: () => {
                    setPendingUpload(null);
                    setExpiryDate('');
                },
            },
        );
    };

    return (
        <AdminLayout>
            <Head title={`Questionnaire — ${assessment.title}`} />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Controls Hub pre-fill notice */}
                {prefilledCount > 0 && (
                    <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm dark:border-primary/30 dark:bg-primary/10">
                        <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                        <span className="text-primary dark:text-primary">
                            <strong>{prefilledCount}</strong> control
                            {prefilledCount !== 1 ? 's' : ''} pre-filled from
                            Controls Hub — update if status has changed.
                        </span>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <Link href={route('assessments.index')}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">
                                {assessment.title}
                            </h1>
                            <div className="mt-1 flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                    {assessment.framework.short_name}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    Page {pagination.current_page} of{' '}
                                    {pagination.total_pages}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={qaAutoFill}
                            variant="outline"
                            className="gap-2 border-orange-400 text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950"
                            disabled={saving}
                            title="QA: randomly fills all controls and submits the assessment"
                        >
                            <FlaskConical className="h-4 w-4" />
                            QA Auto-Fill
                        </Button>
                        <Button
                            onClick={submitAssessment}
                            className="gap-2 bg-green-600 hover:bg-green-700"
                            disabled={saving}
                        >
                            <CheckCircle className="h-4 w-4" />
                            Submit Assessment
                        </Button>
                    </div>
                </div>

                {/* Progress Bar */}
                <Card>
                    <CardContent className="p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="font-heading text-lg font-normal">
                                Overall Progress
                            </span>
                            <span className="text-sm text-muted-foreground">
                                {progress.answered} / {progress.total} answered
                            </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-primary transition-all duration-500"
                                style={{ width: `${progress.percent}%` }}
                            />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {progress.percent}% complete
                        </p>
                    </CardContent>
                </Card>

                {/* Controls */}
                <div className="space-y-4">
                    {items.map((item, index) => {
                        const globalIndex =
                            (pagination.current_page - 1) *
                                pagination.per_page +
                            index +
                            1;
                        const answer = answers[item.id];
                        const isExpanded = expanded === item.id;
                        const isNA =
                            answer?.compliance_status === 'not_applicable';

                        return (
                            <Card
                                key={item.id}
                                className={`transition-all ${ answer?.compliance_status === 'compliant' ? 'border-green-200 dark:border-green-800' : answer?.compliance_status === 'partially_compliant' ? 'border-yellow-200 dark:border-yellow-800' : answer?.compliance_status === 'non_compliant' ? 'border-red-200 dark:border-red-800' : '' }`}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex flex-1 items-start gap-3">
                                            <span className="mt-0.5 w-6 shrink-0 font-mono text-xs text-muted-foreground">
                                                {globalIndex}
                                            </span>
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="rounded bg-muted/50 px-2 py-0.5 font-mono text-xs text-foreground/80">
                                                        {
                                                            item.control
                                                                .control_id
                                                        }
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {item.control.category}
                                                    </span>
                                                </div>
                                                <CardTitle className="mt-1 text-sm font-semibold">
                                                    {item.control.title}
                                                </CardTitle>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            {answer?.compliance_status && (
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs capitalize ${statusBadgeColors[answer.compliance_status]}`}
                                                >
                                                    {answer.compliance_status.replace(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </Badge>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    fetchControlHelp(
                                                        item.control_id,
                                                    )
                                                }
                                                disabled={
                                                    helpLoading[item.control_id]
                                                }
                                                className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-all ${ activeHelpControlId === item.control_id ? 'border-secondary/30 bg-secondary/20 text-secondary-foreground dark:border-secondary/30 dark:bg-secondary/40 dark:text-secondary-foreground' : 'border-secondary/20 text-secondary-foreground hover:bg-secondary/10 dark:border-secondary/20 dark:text-secondary-foreground dark:hover:bg-secondary/40' }`}
                                                title="Get AI explanation for this control"
                                            >
                                                {helpLoading[
                                                    item.control_id
                                                ] ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    <Sparkles className="h-3 w-3" />
                                                )}
                                                {helpLoading[item.control_id]
                                                    ? 'Loading...'
                                                    : 'AI Help'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setExpanded(
                                                        isExpanded
                                                            ? null
                                                            : item.id,
                                                    )
                                                }
                                                className="text-muted-foreground hover:text-muted-foreground"
                                            >
                                                <ChevronRight
                                                    className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Description */}
                                    <p className="text-sm text-foreground/80">
                                        {item.control.description}
                                    </p>

                                    {/* AI Help Panel */}
                                    {activeHelpControlId ===
                                        item.control_id && (
                                        <div className="overflow-hidden rounded-lg border border-secondary/20 bg-secondary/5 transition-all duration-200 dark:border-secondary/20 dark:bg-secondary/20">
                                            {/* Panel header */}
                                            <div className="flex items-center justify-between border-b border-secondary/20 bg-secondary/10 px-4 py-2.5 dark:border-secondary/20 dark:bg-secondary/30">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="h-3.5 w-3.5 text-secondary-foreground dark:text-secondary-foreground" />
                                                    <span className="text-xs font-semibold text-secondary-foreground dark:text-secondary-foreground">
                                                        AI Guidance —{' '}
                                                        {
                                                            item.control
                                                                .control_id
                                                        }{' '}
                                                        {item.control.title}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setActiveHelpControlId(
                                                            null,
                                                        )
                                                    }
                                                    className="text-secondary/60 transition-colors hover:text-secondary-foreground dark:hover:text-secondary-foreground"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>

                                            {/* Loading state */}
                                            {helpLoading[item.control_id] && (
                                                <div className="flex items-center gap-2 px-4 py-4 text-sm text-secondary-foreground dark:text-secondary-foreground">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Asking Claude for
                                                    guidance...
                                                </div>
                                            )}

                                            {/* Error state */}
                                            {!helpLoading[item.control_id] &&
                                                helpError[item.control_id] && (
                                                    <div className="space-y-2 px-4 py-3">
                                                        <p className="text-xs text-red-400 dark:text-red-400">
                                                            {
                                                                helpError[
                                                                    item
                                                                        .control_id
                                                                ]
                                                            }
                                                        </p>
                                                        {helpError[
                                                            item.control_id
                                                        ] !==
                                                            'Too many requests. Please wait a moment before asking for more guidance.' && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    retryControlHelp(
                                                                        item.control_id,
                                                                    )
                                                                }
                                                                className="text-xs text-secondary-foreground underline hover:no-underline dark:text-secondary-foreground"
                                                            >
                                                                Retry
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                            {/* Content */}
                                            {!helpLoading[item.control_id] &&
                                                helpData[item.control_id] &&
                                                (() => {
                                                    const ex =
                                                        helpData[
                                                            item.control_id
                                                        ];
                                                    return (
                                                        <div className="space-y-3 px-4 py-3 text-xs">
                                                            {/* Plain English */}
                                                            <div>
                                                                <p className="mb-1 font-semibold text-secondary-foreground dark:text-secondary-foreground">
                                                                    💬 What this
                                                                    means
                                                                </p>
                                                                <p className="text-foreground/85">
                                                                    {
                                                                        ex.plain_english
                                                                    }
                                                                </p>
                                                            </div>

                                                            {/* What it requires */}
                                                            <div>
                                                                <p className="mb-1 font-semibold text-secondary-foreground dark:text-secondary-foreground">
                                                                    ✅ What it
                                                                    requires
                                                                </p>
                                                                <ul className="space-y-0.5 text-foreground/85">
                                                                    {ex.what_it_requires.map(
                                                                        (
                                                                            req,
                                                                            i,
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    i
                                                                                }
                                                                                className="flex gap-1.5"
                                                                            >
                                                                                <span className="shrink-0 text-secondary/60">
                                                                                    •
                                                                                </span>
                                                                                {
                                                                                    req
                                                                                }
                                                                            </li>
                                                                        ),
                                                                    )}
                                                                </ul>
                                                            </div>

                                                            {/* Evidence examples */}
                                                            <div>
                                                                <p className="mb-1 font-semibold text-secondary-foreground dark:text-secondary-foreground">
                                                                    📎 Evidence
                                                                    examples
                                                                </p>
                                                                <ul className="space-y-0.5 text-foreground/85">
                                                                    {ex.evidence_examples.map(
                                                                        (
                                                                            ev,
                                                                            i,
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    i
                                                                                }
                                                                                className="flex gap-1.5"
                                                                            >
                                                                                <span className="shrink-0 text-secondary/60">
                                                                                    •
                                                                                </span>
                                                                                {
                                                                                    ev
                                                                                }
                                                                            </li>
                                                                        ),
                                                                    )}
                                                                </ul>
                                                            </div>

                                                            {/* Compliant looks like */}
                                                            <div>
                                                                <p className="mb-1 font-semibold text-secondary-foreground dark:text-secondary-foreground">
                                                                    ✔ Compliant
                                                                    implementation
                                                                    looks like
                                                                </p>
                                                                <p className="text-foreground/85">
                                                                    {
                                                                        ex.compliant_looks_like
                                                                    }
                                                                </p>
                                                            </div>

                                                            {/* Risk */}
                                                            <div className="rounded-md border border-border bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/30">
                                                                <p className="mb-0.5 font-semibold text-amber-700 dark:text-amber-400">
                                                                    ⚠ Risk if
                                                                    not
                                                                    implemented
                                                                </p>
                                                                <p className="text-foreground/85">
                                                                    {
                                                                        ex.non_compliant_risks
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                        </div>
                                    )}

                                    {/* Guidance — expandable */}
                                    {isExpanded &&
                                        item.control
                                            .implementation_guidance && (
                                            <div className="rounded-lg bg-primary/10 p-3 text-xs text-primary dark:bg-primary/10 dark:text-primary">
                                                <p className="mb-1 font-semibold">
                                                    Implementation Guidance:
                                                </p>
                                                <p>
                                                    {
                                                        item.control
                                                            .implementation_guidance
                                                    }
                                                </p>
                                            </div>
                                        )}

                                    {/* Compliance Status Buttons */}
                                    <div>
                                        <p className="mb-2 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                                            Compliance Status
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {statusOptions.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() =>
                                                        updateAnswer(
                                                            item.id,
                                                            'compliance_status',
                                                            opt.value,
                                                        )
                                                    }
                                                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                                                        answer?.compliance_status ===
                                                        opt.value
                                                            ? `${opt.color} border-transparent text-white`
                                                            : 'border-border bg-card text-foreground/80 hover:border-border dark:bg-secondary'
                                                    }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Comments */}
                                    {!isNA && (
                                        <div>
                                            <p className="mb-1 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                                                Comments
                                            </p>
                                            <textarea
                                                value={answer?.comments ?? ''}
                                                onChange={(
                                                    e: React.ChangeEvent<HTMLTextAreaElement>,
                                                ) =>
                                                    updateAnswer(
                                                        item.id,
                                                        'comments',
                                                        e.target.value,
                                                    )
                                                }
                                                rows={2}
                                                placeholder="Add implementation notes, findings, or observations..."
                                                className="w-full resize-none rounded-md border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none dark:bg-secondary"
                                            />
                                        </div>
                                    )}

                                    {/* Evidence Upload */}
                                    {!isNA && (
                                        <div>
                                            <div className="mb-1 flex items-center justify-between">
                                                <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                                                    Evidence
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        fileInputRefs.current[
                                                            item.id
                                                        ]?.click()
                                                    }
                                                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                                                >
                                                    <Upload className="h-3 w-3" />{' '}
                                                    Upload file
                                                </button>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    ref={(el) => {
                                                        fileInputRefs.current[
                                                            item.id
                                                        ] = el;
                                                    }}
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
                                                    onChange={(
                                                        e: React.ChangeEvent<HTMLInputElement>,
                                                    ) => {
                                                        const file =
                                                            e.target.files?.[0];
                                                        if (file)
                                                            handleFileSelect(
                                                                item.id,
                                                                file,
                                                            );
                                                    }}
                                                />
                                            </div>

                                            {/* Expiry date picker shown when a file is selected for this item */}
                                            {pendingUpload?.itemId ===
                                                item.id && (
                                                <div className="mt-2 space-y-2 rounded-lg border border-primary/20 bg-primary/10 p-3 dark:border-primary/30 dark:bg-primary/10">
                                                    <p className="text-xs font-medium text-primary dark:text-primary">
                                                        File selected:{' '}
                                                        <span className="font-semibold">
                                                            {
                                                                pendingUpload
                                                                    .file.name
                                                            }
                                                        </span>
                                                    </p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1">
                                                            <label className="mb-1 block text-xs text-muted-foreground">
                                                                Expiry Date
                                                                (optional)
                                                            </label>
                                                            <input
                                                                type="date"
                                                                value={
                                                                    expiryDate
                                                                }
                                                                min={
                                                                    new Date(
                                                                        Date.now() +
                                                                            86400000,
                                                                    )
                                                                        .toISOString()
                                                                        .split(
                                                                            'T',
                                                                        )[0]
                                                                }
                                                                onChange={(e) =>
                                                                    setExpiryDate(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="rounded border border-border bg-card px-2 py-1 text-xs focus:ring-2 focus:ring-ring focus:outline-none dark:bg-secondary"
                                                            />
                                                        </div>
                                                        <div className="flex gap-2 pt-4">
                                                            <Button
                                                                size="sm"
                                                                onClick={
                                                                    confirmEvidenceUpload
                                                                }
                                                                className="h-7 text-xs"
                                                            >
                                                                Upload
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    setPendingUpload(
                                                                        null,
                                                                    )
                                                                }
                                                                className="h-7 text-xs"
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {item.evidence &&
                                            item.evidence.length > 0 ? (
                                                <div className="mt-2 space-y-1">
                                                    {item.evidence.map((ev) => (
                                                        <div
                                                            key={ev.id}
                                                            className="flex items-center gap-2 rounded bg-muted/30 p-2 text-xs text-muted-foreground"
                                                        >
                                                            <CheckCircle className="h-3 w-3 shrink-0 text-green-500" />
                                                            <span className="truncate">
                                                                {ev.title}
                                                            </span>
                                                            <span className="shrink-0 text-muted-foreground">
                                                                ({ev.file_name})
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground italic">
                                                    No evidence uploaded
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Navigation */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <Button
                                variant="outline"
                                disabled={
                                    pagination.current_page === 1 || saving
                                }
                                onClick={() =>
                                    goToPage(pagination.current_page - 1)
                                }
                                className="gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" /> Previous
                            </Button>

                            <div className="flex items-center gap-2">
                                {Array.from(
                                    { length: pagination.total_pages },
                                    (_, i) => i + 1,
                                ).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() =>
                                            page !== pagination.current_page &&
                                            goToPage(page)
                                        }
                                        className={`h-8 w-8 rounded text-sm font-medium transition-colors ${ page === pagination.current_page ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted dark:hover:bg-secondary' }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => saveAnswers()}
                                    disabled={saving}
                                    className="gap-2"
                                >
                                    <Save className="h-4 w-4" />
                                    {saving ? 'Saving...' : 'Save'}
                                </Button>
                                {pagination.current_page <
                                pagination.total_pages ? (
                                    <Button
                                        onClick={() =>
                                            goToPage(
                                                pagination.current_page + 1,
                                            )
                                        }
                                        disabled={saving}
                                        className="gap-2"
                                    >
                                        Next <ArrowRight className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={submitAssessment}
                                        disabled={saving}
                                        className="gap-2 bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="h-4 w-4" />{' '}
                                        Submit
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
