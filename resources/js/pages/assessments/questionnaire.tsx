import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
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
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirm } from '@/components/ui/confirm-dialog';
import AdminLayout from '@/layouts/admin-layout';
import { route } from '@/lib/routes';

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
    { value: 'compliant', label: 'Compliant', color: 'bg-[#46bd5f]' },
    {
        value: 'partially_compliant',
        label: 'Partially Compliant',
        color: 'bg-[#f5b929]',
    },
    { value: 'non_compliant', label: 'Non-Compliant', color: 'bg-[#e5484d]' },
    { value: 'not_applicable', label: 'Not Applicable', color: 'bg-muted-foreground' },
];

const statusBadgeColors: Record<string, string> = {
    compliant: 'bg-[rgba(70,189,95,0.12)] text-[#46bd5f] border-[rgba(70,189,95,0.4)]',
    partially_compliant: 'bg-[rgba(245,185,41,0.12)] text-[#f5b929] border-[rgba(245,185,41,0.4)]',
    non_compliant: 'bg-[rgba(229,72,77,0.12)] text-[#e5484d] border-[rgba(229,72,77,0.4)]',
    not_applicable: 'bg-muted text-muted-foreground border-border',
};

export default function Questionnaire({
    assessment,
    items,
    pagination,
    progress,
    prefilledCount,
}: Props) {
    const confirm = useConfirm();
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

    // Keep latest saveAnswers reachable from a ref so the keyboard shortcut
    // and floating button always see the most recent answers state.
    const saveRef = useRef(saveAnswers);
    saveRef.current = saveAnswers;

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                saveRef.current();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const goToPage = (page: number) => {
        saveAnswers(`/assessments/${assessment.id}/questionnaire?page=${page}`);
    };

    const submitAssessment = async () => {
        const ok = await confirm({
            title: 'Submit this assessment?',
            description: 'The compliance score will be calculated and the status set to completed.',
            confirmLabel: 'Submit',
        });
        if (!ok) return;
        router.post(route('assessments.submit', assessment.id));
    };

    const qaAutoFill = async () => {
        const ok = await confirm({
            title: '[QA] Auto-fill ALL controls?',
            description: 'Random statuses will be applied and the assessment will be submitted immediately.',
            confirmLabel: 'Auto-fill & submit',
            tone: 'destructive',
        });
        if (!ok) return;
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
                    <div className="flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: 'color-mix(in srgb, var(--primary) 25%, transparent)', background: 'color-mix(in srgb, var(--primary) 8%, transparent)' }}>
                        <CheckCircle className="h-4 w-4 shrink-0" style={{ color: 'var(--primary)' }} />
                        <span style={{ color: 'var(--primary)' }}>
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
                            <h1 className="text-2xl tracking-[-0.02em]" style={{ color: 'var(--foreground)', fontWeight: 500, lineHeight: 1.1 }}>
                                {assessment.title}
                            </h1>
                            <div className="mt-1 flex items-center gap-2">
                                <Badge variant="outline">
                                    {assessment.framework.short_name}
                                </Badge>
                                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
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
                            className="gap-2"
                            style={{ borderColor: '#f76b15', color: '#f76b15' }}
                            disabled={saving}
                            title="QA: randomly fills all controls and submits the assessment"
                        >
                            <FlaskConical className="h-4 w-4" />
                            QA Auto-Fill
                        </Button>
                        <Button
                            onClick={submitAssessment}
                            className="gap-2"
                            style={{ background: '#46bd5f', color: '#091413' }}
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
                            <span className="text-lg" style={{ fontWeight: 500 }}>
                                Overall Progress
                            </span>
                            <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                                {progress.answered} / {progress.total} answered
                            </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--muted)' }}>
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${progress.percent}%`, background: 'var(--primary)' }}
                            />
                        </div>
                        <p className="mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
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
                                className="transition-all"
                                style={
                                    answer?.compliance_status === 'compliant' ? { borderColor: 'rgba(70,189,95,0.4)' }
                                    : answer?.compliance_status === 'partially_compliant' ? { borderColor: 'rgba(245,185,41,0.4)' }
                                    : answer?.compliance_status === 'non_compliant' ? { borderColor: 'rgba(229,72,77,0.4)' }
                                    : undefined
                                }
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex flex-1 items-start gap-3">
                                            <span className="mt-0.5 w-6 shrink-0 font-mono text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                {globalIndex}
                                            </span>
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="rounded-full px-2 py-0.5 font-mono text-xs" style={{ background: 'color-mix(in srgb, var(--muted) 50%, transparent)', color: 'var(--foreground)' }}>
                                                        {
                                                            item.control
                                                                .control_id
                                                        }
                                                    </span>
                                                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                        {item.control.category}
                                                    </span>
                                                </div>
                                                <CardTitle className="mt-1 text-sm">
                                                    {item.control.title}
                                                </CardTitle>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            {answer?.compliance_status && (
                                                <Badge
                                                    variant="outline"
                                                    className={`capitalize ${statusBadgeColors[answer.compliance_status]}`}
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
                                                className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all"
                                                style={activeHelpControlId === item.control_id ? { borderColor: 'color-mix(in srgb, var(--primary) 30%, transparent)', background: 'color-mix(in srgb, var(--primary) 18%, transparent)', color: 'var(--primary)' } : { borderColor: 'color-mix(in srgb, var(--primary) 25%, transparent)', color: 'var(--primary)' }}
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
                                                className="text-muted-foreground hover:text-foreground"
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
                                    <p className="text-sm" style={{ color: 'var(--foreground)', opacity: 0.85 }}>
                                        {item.control.description}
                                    </p>

                                    {/* AI Help Panel */}
                                    {activeHelpControlId ===
                                        item.control_id && (
                                        <div className="overflow-hidden rounded-2xl border transition-all duration-200" style={{ borderColor: 'color-mix(in srgb, var(--primary) 25%, transparent)', background: 'color-mix(in srgb, var(--primary) 5%, transparent)' }}>
                                            {/* Panel header */}
                                            <div className="flex items-center justify-between border-b px-4 py-2.5" style={{ borderColor: 'color-mix(in srgb, var(--primary) 25%, transparent)', background: 'color-mix(in srgb, var(--primary) 12%, transparent)' }}>
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
                                                    <span className="text-xs" style={{ color: 'var(--primary)', fontWeight: 500 }}>
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
                                                    className="transition-colors hover:opacity-80"
                                                    style={{ color: 'var(--muted-foreground)' }}
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>

                                            {/* Loading state */}
                                            {helpLoading[item.control_id] && (
                                                <div className="flex items-center gap-2 px-4 py-4 text-sm" style={{ color: 'var(--primary)' }}>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Asking Claude for
                                                    guidance...
                                                </div>
                                            )}

                                            {/* Error state */}
                                            {!helpLoading[item.control_id] &&
                                                helpError[item.control_id] && (
                                                    <div className="space-y-2 px-4 py-3">
                                                        <p className="text-xs" style={{ color: 'var(--destructive)' }}>
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
                                                                className="text-xs underline hover:no-underline" style={{ color: 'var(--primary)' }}
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
                                                                <p className="mb-1" style={{ color: 'var(--primary)', fontWeight: 500 }}>
                                                                    What this means
                                                                </p>
                                                                <p style={{ color: 'var(--foreground)', opacity: 0.85 }}>
                                                                    {
                                                                        ex.plain_english
                                                                    }
                                                                </p>
                                                            </div>

                                                            {/* What it requires */}
                                                            <div>
                                                                <p className="mb-1" style={{ color: 'var(--primary)', fontWeight: 500 }}>
                                                                    What it requires
                                                                </p>
                                                                <ul className="space-y-0.5" style={{ color: 'var(--foreground)', opacity: 0.85 }}>
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
                                                                                <span className="shrink-0" style={{ color: 'var(--muted-foreground)' }}>
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
                                                                <p className="mb-1" style={{ color: 'var(--primary)', fontWeight: 500 }}>
                                                                    Evidence examples
                                                                </p>
                                                                <ul className="space-y-0.5" style={{ color: 'var(--foreground)', opacity: 0.85 }}>
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
                                                                                <span className="shrink-0" style={{ color: 'var(--muted-foreground)' }}>
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
                                                                <p className="mb-1" style={{ color: 'var(--primary)', fontWeight: 500 }}>
                                                                    Compliant implementation looks like
                                                                </p>
                                                                <p style={{ color: 'var(--foreground)', opacity: 0.85 }}>
                                                                    {
                                                                        ex.compliant_looks_like
                                                                    }
                                                                </p>
                                                            </div>

                                                            {/* Risk */}
                                                            <div className="rounded-2xl border px-3 py-2" style={{ borderColor: 'rgba(245,185,41,0.4)', background: 'rgba(245,185,41,0.08)' }}>
                                                                <p className="mb-0.5" style={{ color: '#f5b929', fontWeight: 500 }}>
                                                                    Risk if not implemented
                                                                </p>
                                                                <p style={{ color: 'var(--foreground)', opacity: 0.85 }}>
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
                                            <div className="rounded-2xl p-3 text-xs" style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)' }}>
                                                <p className="mb-1" style={{ fontWeight: 500 }}>
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
                                        <p className="mb-2 text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
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
                                                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                                                        answer?.compliance_status ===
                                                        opt.value
                                                            ? `${opt.color} border-transparent text-white`
                                                            : 'border-border bg-card text-foreground hover:border-foreground'
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
                                            <p className="mb-1 text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
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
                                                className="w-full resize-none rounded-2xl border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                                            />
                                        </div>
                                    )}

                                    {/* Evidence Upload */}
                                    {!isNA && (
                                        <div>
                                            <div className="mb-1 flex items-center justify-between">
                                                <p className="text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
                                                    Evidence
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        fileInputRefs.current[
                                                            item.id
                                                        ]?.click()
                                                    }
                                                    className="flex items-center gap-1 text-xs hover:opacity-80" style={{ color: 'var(--primary)' }}
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
                                                <div className="mt-2 space-y-2 rounded-2xl border p-3" style={{ borderColor: 'color-mix(in srgb, var(--primary) 25%, transparent)', background: 'color-mix(in srgb, var(--primary) 8%, transparent)' }}>
                                                    <p className="text-xs" style={{ color: 'var(--primary)', fontWeight: 500 }}>
                                                        File selected:{' '}
                                                        <span style={{ fontWeight: 600 }}>
                                                            {
                                                                pendingUpload
                                                                    .file.name
                                                            }
                                                        </span>
                                                    </p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1">
                                                            <label className="mb-1 block text-xs" style={{ color: 'var(--muted-foreground)' }}>
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
                                                                className="rounded-full border border-border bg-card px-3 py-1 text-xs focus:ring-2 focus:ring-ring focus:outline-none"
                                                            />
                                                        </div>
                                                        <div className="flex gap-2 pt-4">
                                                            <Button
                                                                size="sm"
                                                                onClick={
                                                                    confirmEvidenceUpload
                                                                }
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
                                                            className="flex items-center gap-2 rounded-full p-2 text-xs" style={{ background: 'color-mix(in srgb, var(--muted) 30%, transparent)', color: 'var(--muted-foreground)' }}
                                                        >
                                                            <CheckCircle className="h-3 w-3 shrink-0" style={{ color: '#46bd5f' }} />
                                                            <span className="truncate">
                                                                {ev.title}
                                                            </span>
                                                            <span className="shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                                                                ({ev.file_name})
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
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

                {/* Floating top-right control box — Prev / Save / Next, always reachable */}
                <div
                    className="fixed top-20 right-6 z-30 hidden flex-col gap-1.5 rounded-2xl border border-border p-2 backdrop-blur-md lg:flex"
                    style={{
                        background: 'color-mix(in srgb, var(--card) 92%, transparent)',
                        boxShadow:
                            '0 18px 40px -22px color-mix(in srgb, var(--foreground) 30%, transparent), 0 4px 10px -4px color-mix(in srgb, var(--foreground) 14%, transparent)',
                    }}
                >
                    <div
                        className="px-2 pt-1 text-[10px] uppercase"
                        style={{ color: 'var(--muted-foreground)', letterSpacing: '0.22em' }}
                    >
                        Page {pagination.current_page} / {pagination.total_pages}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            disabled={pagination.current_page === 1 || saving}
                            onClick={() => goToPage(pagination.current_page - 1)}
                            title="Previous page"
                            aria-label="Previous page"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            onClick={() => saveAnswers()}
                            disabled={saving}
                            className="h-9 gap-2 rounded-full px-4"
                            title={saving ? 'Saving...' : 'Save (Ctrl+S)'}
                        >
                            <Save className="h-4 w-4" />
                            {saving ? 'Saving...' : 'Save'}
                        </Button>
                        {pagination.current_page < pagination.total_pages ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                disabled={saving}
                                onClick={() => goToPage(pagination.current_page + 1)}
                                title="Next page"
                                aria-label="Next page"
                            >
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                disabled={saving}
                                onClick={submitAssessment}
                                title="Submit assessment"
                                aria-label="Submit assessment"
                                style={{ color: '#46bd5f' }}
                            >
                                <CheckCircle className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
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
                                        className="h-8 w-8 rounded-full text-sm font-medium transition-colors"
                                        style={page === pagination.current_page ? { background: 'var(--primary)', color: 'var(--primary-foreground)' } : { color: 'var(--muted-foreground)' }}
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
                                        className="gap-2"
                                        style={{ background: '#46bd5f', color: '#091413' }}
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
