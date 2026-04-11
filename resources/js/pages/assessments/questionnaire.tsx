import { Head, Link, router } from '@inertiajs/react';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Save, CheckCircle, Upload, ChevronRight, FlaskConical, Sparkles, X, Loader2 } from 'lucide-react';
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
    pagination: { current_page: number; total_pages: number; total_items: number; per_page: number };
    progress: { answered: number; total: number; percent: number };
    prefilledCount: number;
}

const statusOptions = [
    { value: 'compliant',           label: 'Compliant',            color: 'bg-green-500' },
    { value: 'partially_compliant', label: 'Partially Compliant',  color: 'bg-yellow-500' },
    { value: 'non_compliant',       label: 'Non-Compliant',        color: 'bg-red-500' },
    { value: 'not_applicable',      label: 'Not Applicable',       color: 'bg-gray-400' },
];

const statusBadgeColors: Record<string, string> = {
    compliant:           'bg-green-50 text-green-700 border-green-200',
    partially_compliant: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    non_compliant:       'bg-red-50 text-red-600 border-red-200',
    not_applicable:      'bg-gray-100 text-gray-500 border-gray-200',
};

export default function Questionnaire({ assessment, items, pagination, progress, prefilledCount }: Props) {
    const [answers, setAnswers] = useState<Record<number, { compliance_status: string; comments: string }>>(
        Object.fromEntries(items.map(item => [item.id, {
            compliance_status: item.compliance_status,
            comments: item.comments ?? '',
        }]))
    );
    const [saving, setSaving]   = useState(false);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [pendingUpload, setPendingUpload] = useState<{ itemId: number; file: File } | null>(null);
    const [expiryDate, setExpiryDate] = useState('');
    const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

    // AI Help state
    const [activeHelpControlId, setActiveHelpControlId] = useState<number | null>(null);
    const [helpData, setHelpData] = useState<Record<number, ExplanationData>>({});
    const [helpLoading, setHelpLoading] = useState<Record<number, boolean>>({});
    const [helpError, setHelpError] = useState<Record<number, string | null>>({});

    const updateAnswer = (itemId: number, field: string, value: string) => {
        setAnswers(prev => ({ ...prev, [itemId]: { ...prev[itemId], [field]: value } }));
    };

    const saveAnswers = (andNavigate?: string) => {
        setSaving(true);
        const payload = Object.entries(answers).map(([id, ans]) => ({
            id: Number(id),
            ...ans,
        }));

        router.post(route('assessments.save-answers', assessment.id), {
            answers: payload,
        }, {
            onFinish: () => {
                setSaving(false);
                if (andNavigate) router.get(andNavigate);
            },
            preserveScroll: true,
        });
    };

    const goToPage = (page: number) => {
        saveAnswers(`/assessments/${assessment.id}/questionnaire?page=${page}`);
    };

    const submitAssessment = () => {
        if (!confirm('Submit this assessment? The compliance score will be calculated and status set to completed.')) return;
        router.post(route('assessments.submit', assessment.id));
    };

    const qaAutoFill = () => {
        if (!confirm('[QA] Auto-fill ALL controls with random statuses and submit? This will complete the assessment immediately.')) return;
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

        setHelpLoading(prev => ({ ...prev, [controlId]: true }));
        setHelpError(prev => ({ ...prev, [controlId]: null }));

        try {
            const response = await axios.post('/assessments/explain-control', { control_id: controlId });
            if (response.data?.success && response.data?.explanation) {
                setHelpData(prev => ({ ...prev, [controlId]: response.data.explanation }));
            } else {
                setHelpError(prev => ({ ...prev, [controlId]: 'Could not load AI guidance. Please try again.' }));
            }
        } catch (err: any) {
            if (err?.response?.status === 429) {
                setHelpError(prev => ({ ...prev, [controlId]: 'Too many requests. Please wait a moment before asking for more guidance.' }));
            } else {
                setHelpError(prev => ({ ...prev, [controlId]: 'Could not load AI guidance. Please try again.' }));
            }
        } finally {
            setHelpLoading(prev => ({ ...prev, [controlId]: false }));
        }
    };

    const retryControlHelp = (controlId: number) => {
        setHelpData(prev => { const next = { ...prev }; delete next[controlId]; return next; });
        setHelpError(prev => ({ ...prev, [controlId]: null }));
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
            }
        );
    };

    return (
        <AdminLayout>
            <Head title={`Questionnaire — ${assessment.title}`} />

            <div className="max-w-4xl mx-auto space-y-6">

                {/* Controls Hub pre-fill notice */}
                {prefilledCount > 0 && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 text-sm">
                        <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="text-blue-700 dark:text-blue-300">
                            <strong>{prefilledCount}</strong> control{prefilledCount !== 1 ? 's' : ''} pre-filled from Controls Hub — update if status has changed.
                        </span>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <Link href={route('assessments.index')}>
                            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{assessment.title}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">{assessment.framework.short_name}</Badge>
                                <span className="text-xs text-gray-400">
                                    Page {pagination.current_page} of {pagination.total_pages}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={qaAutoFill}
                            variant="outline"
                            className="gap-2 border-orange-400 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
                            disabled={saving}
                            title="QA: randomly fills all controls and submits the assessment"
                        >
                            <FlaskConical className="w-4 h-4" />
                            QA Auto-Fill
                        </Button>
                        <Button
                            onClick={submitAssessment}
                            className="gap-2 bg-green-600 hover:bg-green-700"
                            disabled={saving}
                        >
                            <CheckCircle className="w-4 h-4" />
                            Submit Assessment
                        </Button>
                    </div>
                </div>

                {/* Progress Bar */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Overall Progress</span>
                            <span className="text-sm text-gray-500">{progress.answered} / {progress.total} answered</span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${progress.percent}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{progress.percent}% complete</p>
                    </CardContent>
                </Card>

                {/* Controls */}
                <div className="space-y-4">
                    {items.map((item, index) => {
                        const globalIndex = (pagination.current_page - 1) * pagination.per_page + index + 1;
                        const answer = answers[item.id];
                        const isExpanded = expanded === item.id;
                        const isNA = answer?.compliance_status === 'not_applicable';

                        return (
                            <Card key={item.id} className={`transition-all ${
                                answer?.compliance_status === 'compliant'           ? 'border-green-200 dark:border-green-800' :
                                answer?.compliance_status === 'partially_compliant' ? 'border-yellow-200 dark:border-yellow-800' :
                                answer?.compliance_status === 'non_compliant'       ? 'border-red-200 dark:border-red-800' : ''
                            }`}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3 flex-1">
                                            <span className="text-xs text-gray-400 font-mono mt-0.5 w-6 flex-shrink-0">{globalIndex}</span>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                                                        {item.control.control_id}
                                                    </span>
                                                    <span className="text-xs text-gray-400">{item.control.category}</span>
                                                </div>
                                                <CardTitle className="text-sm font-semibold mt-1">{item.control.title}</CardTitle>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {answer?.compliance_status && (
                                                <Badge variant="outline" className={`text-xs capitalize ${statusBadgeColors[answer.compliance_status]}`}>
                                                    {answer.compliance_status.replace('_', ' ')}
                                                </Badge>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => fetchControlHelp(item.control_id)}
                                                disabled={helpLoading[item.control_id]}
                                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-all ${
                                                    activeHelpControlId === item.control_id
                                                        ? 'bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                                                        : 'border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                                                }`}
                                                title="Get AI explanation for this control"
                                            >
                                                {helpLoading[item.control_id]
                                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                                    : <Sparkles className="w-3 h-3" />
                                                }
                                                {helpLoading[item.control_id] ? 'Loading...' : 'AI Help'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setExpanded(isExpanded ? null : item.id)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                            </button>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Description */}
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{item.control.description}</p>

                                    {/* AI Help Panel */}
                                    {activeHelpControlId === item.control_id && (
                                        <div className="rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20 overflow-hidden transition-all duration-200">
                                            {/* Panel header */}
                                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-purple-200 dark:border-purple-800 bg-purple-100/60 dark:bg-purple-900/30">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                                    <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                                                        AI Guidance — {item.control.control_id} {item.control.title}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveHelpControlId(null)}
                                                    className="text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            {/* Loading state */}
                                            {helpLoading[item.control_id] && (
                                                <div className="flex items-center gap-2 px-4 py-4 text-sm text-purple-600 dark:text-purple-400">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Asking Claude for guidance...
                                                </div>
                                            )}

                                            {/* Error state */}
                                            {!helpLoading[item.control_id] && helpError[item.control_id] && (
                                                <div className="px-4 py-3 space-y-2">
                                                    <p className="text-xs text-red-600 dark:text-red-400">{helpError[item.control_id]}</p>
                                                    {helpError[item.control_id] !== 'Too many requests. Please wait a moment before asking for more guidance.' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => retryControlHelp(item.control_id)}
                                                            className="text-xs text-purple-600 dark:text-purple-400 underline hover:no-underline"
                                                        >
                                                            Retry
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Content */}
                                            {!helpLoading[item.control_id] && helpData[item.control_id] && (() => {
                                                const ex = helpData[item.control_id];
                                                return (
                                                    <div className="px-4 py-3 space-y-3 text-xs">
                                                        {/* Plain English */}
                                                        <div>
                                                            <p className="font-semibold text-purple-700 dark:text-purple-300 mb-1">💬 What this means</p>
                                                            <p className="text-gray-700 dark:text-gray-300">{ex.plain_english}</p>
                                                        </div>

                                                        {/* What it requires */}
                                                        <div>
                                                            <p className="font-semibold text-purple-700 dark:text-purple-300 mb-1">✅ What it requires</p>
                                                            <ul className="space-y-0.5 text-gray-700 dark:text-gray-300">
                                                                {ex.what_it_requires.map((req, i) => (
                                                                    <li key={i} className="flex gap-1.5"><span className="text-purple-400 flex-shrink-0">•</span>{req}</li>
                                                                ))}
                                                            </ul>
                                                        </div>

                                                        {/* Evidence examples */}
                                                        <div>
                                                            <p className="font-semibold text-purple-700 dark:text-purple-300 mb-1">📎 Evidence examples</p>
                                                            <ul className="space-y-0.5 text-gray-700 dark:text-gray-300">
                                                                {ex.evidence_examples.map((ev, i) => (
                                                                    <li key={i} className="flex gap-1.5"><span className="text-purple-400 flex-shrink-0">•</span>{ev}</li>
                                                                ))}
                                                            </ul>
                                                        </div>

                                                        {/* Compliant looks like */}
                                                        <div>
                                                            <p className="font-semibold text-purple-700 dark:text-purple-300 mb-1">✔ Compliant implementation looks like</p>
                                                            <p className="text-gray-700 dark:text-gray-300">{ex.compliant_looks_like}</p>
                                                        </div>

                                                        {/* Risk */}
                                                        <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2">
                                                            <p className="font-semibold text-amber-700 dark:text-amber-400 mb-0.5">⚠ Risk if not implemented</p>
                                                            <p className="text-gray-700 dark:text-gray-300">{ex.non_compliant_risks}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}

                                    {/* Guidance — expandable */}
                                    {isExpanded && item.control.implementation_guidance && (
                                        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                                            <p className="font-semibold mb-1">Implementation Guidance:</p>
                                            <p>{item.control.implementation_guidance}</p>
                                        </div>
                                    )}

                                    {/* Compliance Status Buttons */}
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Compliance Status</p>
                                        <div className="flex flex-wrap gap-2">
                                            {statusOptions.map(opt => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => updateAnswer(item.id, 'compliance_status', opt.value)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                                        answer?.compliance_status === opt.value
                                                            ? `${opt.color} text-white border-transparent`
                                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300'
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
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Comments</p>
                                            <textarea
                                                value={answer?.comments ?? ''}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateAnswer(item.id, 'comments', e.target.value)}
                                                rows={2}
                                                placeholder="Add implementation notes, findings, or observations..."
                                                className="w-full text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                            />
                                        </div>
                                    )}

                                    {/* Evidence Upload */}
                                    {!isNA && (
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Evidence</p>
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRefs.current[item.id]?.click()}
                                                    className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                                                >
                                                    <Upload className="w-3 h-3" /> Upload file
                                                </button>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    ref={el => { fileInputRefs.current[item.id] = el; }}
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleFileSelect(item.id, file);
                                                    }}
                                                />
                                            </div>

                                            {/* Expiry date picker shown when a file is selected for this item */}
                                            {pendingUpload?.itemId === item.id && (
                                                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg space-y-2">
                                                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                                        File selected: <span className="font-semibold">{pendingUpload.file.name}</span>
                                                    </p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1">
                                                            <label className="text-xs text-gray-500 block mb-1">Expiry Date (optional)</label>
                                                            <input
                                                                type="date"
                                                                value={expiryDate}
                                                                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                                                                onChange={(e) => setExpiryDate(e.target.value)}
                                                                className="text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            />
                                                        </div>
                                                        <div className="flex gap-2 pt-4">
                                                            <Button size="sm" onClick={confirmEvidenceUpload} className="text-xs h-7">
                                                                Upload
                                                            </Button>
                                                            <Button size="sm" variant="outline" onClick={() => setPendingUpload(null)} className="text-xs h-7">
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {item.evidence && item.evidence.length > 0 ? (
                                                <div className="space-y-1 mt-2">
                                                    {item.evidence.map(ev => (
                                                        <div key={ev.id} className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                                            <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                                                            <span className="truncate">{ev.title}</span>
                                                            <span className="text-gray-400 flex-shrink-0">({ev.file_name})</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-400 italic">No evidence uploaded</p>
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
                                disabled={pagination.current_page === 1 || saving}
                                onClick={() => goToPage(pagination.current_page - 1)}
                                className="gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> Previous
                            </Button>

                            <div className="flex items-center gap-2">
                                {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => page !== pagination.current_page && goToPage(page)}
                                        className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                                            page === pagination.current_page
                                                ? 'bg-blue-500 text-white'
                                                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
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
                                    <Save className="w-4 h-4" />
                                    {saving ? 'Saving...' : 'Save'}
                                </Button>
                                {pagination.current_page < pagination.total_pages ? (
                                    <Button
                                        onClick={() => goToPage(pagination.current_page + 1)}
                                        disabled={saving}
                                        className="gap-2"
                                    >
                                        Next <ArrowRight className="w-4 h-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={submitAssessment}
                                        disabled={saving}
                                        className="gap-2 bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Submit
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
