import { Head, Link, router } from '@inertiajs/react';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Save, CheckCircle, Upload, ChevronRight, FlaskConical } from 'lucide-react';
import { useState, useRef } from 'react';

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

interface Props {
    assessment: Assessment;
    items: Item[];
    pagination: { current_page: number; total_pages: number; total_items: number; per_page: number };
    progress: { answered: number; total: number; percent: number };
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

export default function Questionnaire({ assessment, items, pagination, progress }: Props) {
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
