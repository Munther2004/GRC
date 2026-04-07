import { Head, router, usePage } from '@inertiajs/react';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Search, FolderOpen, CheckCircle, XCircle, Clock,
    Download, Trash2, FileText, FileImage, File,
    Loader2, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

interface AiReview {
    verdict:        'Adequate' | 'Partially Adequate' | 'Insufficient';
    confidence:     'High' | 'Medium' | 'Low';
    strengths:      string;
    gaps:           string;
    recommendation: string;
}

interface EvidenceItem {
    id: number;
    title: string;
    description: string | null;
    file_name: string;
    file_type: string;
    file_path: string;
    status: string;
    created_at: string;
    expiry_date: string | null;
    is_expired: boolean;
    expires_soon: boolean;
    ai_verdict:        string | null;
    ai_confidence:     string | null;
    ai_strengths:      string | null;
    ai_gaps:           string | null;
    ai_recommendation: string | null;
    ai_reviewed_at:    string | null;
    ai_review:         AiReview | null;
    user: { name: string } | null;
    assessment_item: {
        control: { control_id: string; title: string; category: string };
        assessment: {
            id: number;
            title: string;
            framework: { short_name: string };
            user: { name: string };
        };
    } | null;
}

interface Props {
    evidence: {
        data: EvidenceItem[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    frameworks:  { id: number; name: string; short_name: string }[];
    assessments: { id: number; title: string }[];
    stats:       { total: number; pending: number; approved: number; rejected: number };
    filters:     { search?: string; status?: string; framework_id?: string; assessment_id?: string };
}

const statusColors: Record<string, string> = {
    pending:  'bg-yellow-50 text-yellow-700 border-yellow-200',
    approved: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-600 border-red-200',
};

const verdictConfig: Record<string, { color: string; bg: string }> = {
    'Adequate':           { color: 'text-green-700',  bg: 'bg-green-100 border-green-300' },
    'Partially Adequate': { color: 'text-yellow-700', bg: 'bg-yellow-100 border-yellow-300' },
    'Insufficient':       { color: 'text-red-700',    bg: 'bg-red-100 border-red-300' },
};

const FileIcon = ({ type }: { type: string }) => {
    if (type.includes('image')) return <FileImage className="w-5 h-5 text-blue-500" />;
    if (type.includes('pdf'))   return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
};

const CONFIDENCE_BADGE: Record<string, string> = {
    High:   'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
    Low:    'bg-red-100 text-red-600 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
};

function AiReviewPanel({ review }: { review: AiReview }) {
    const vc = verdictConfig[review.verdict] ?? verdictConfig['Insufficient'];

    return (
        <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800 space-y-3">
            {/* Verdict + confidence */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${vc.bg} ${vc.color}`}>
                    {review.verdict === 'Adequate'           && <CheckCircle2  className="w-3.5 h-3.5" />}
                    {review.verdict === 'Partially Adequate' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {review.verdict === 'Insufficient'       && <XCircle       className="w-3.5 h-3.5" />}
                    {review.verdict}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${CONFIDENCE_BADGE[review.confidence] ?? CONFIDENCE_BADGE['Medium']}`}>
                    {review.confidence} Confidence
                </span>
            </div>

            {/* Strengths + Gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {review.strengths && (
                    <div>
                        <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">Strengths</p>
                        <p className="text-xs text-green-800 dark:text-green-300 leading-relaxed">{review.strengths}</p>
                    </div>
                )}
                {review.gaps && (
                    <div>
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Gaps</p>
                        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">{review.gaps}</p>
                    </div>
                )}
            </div>

            {/* Recommendation */}
            {review.recommendation && (
                <div className="flex items-start gap-2 bg-muted/60 border border-border rounded-lg px-3 py-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">{review.recommendation}</p>
                </div>
            )}
        </div>
    );
}

export default function EvidenceIndex({ evidence, frameworks, assessments, stats, filters }: Props) {
    const { auth } = usePage().props as any;
    const isAdmin  = auth.user.role === 'admin';
    const canReview = isAdmin || auth.user.role === 'auditor';

    const [search, setSearch]           = useState(filters.search ?? '');
    const [status, setStatus]           = useState(filters.status ?? 'all');
    const [frameworkId, setFramework]   = useState(filters.framework_id ?? 'all');
    const [assessmentId, setAssessment] = useState(filters.assessment_id ?? 'all');

    // AI review state
    const [reviewing, setReviewing]     = useState<Record<number, boolean>>({});
    const [liveReviews, setLiveReviews] = useState<Record<number, AiReview>>({});
    const [expanded, setExpanded]       = useState<Record<number, boolean>>({});
    const [reviewError, setReviewError] = useState<Record<number, string>>({});

    const applyFilters = (overrides: Record<string, string> = {}) => {
        router.get(route('evidence.index'), {
            search,
            status:        status       === 'all' ? '' : status,
            framework_id:  frameworkId  === 'all' ? '' : frameworkId,
            assessment_id: assessmentId === 'all' ? '' : assessmentId,
            ...overrides,
        }, { preserveState: true, replace: true });
    };

    const approve = (id: number) => router.post(route('evidence.approve', id));
    const reject  = (id: number) => router.post(route('evidence.reject', id));
    const destroy = (id: number, title: string) => {
        if (!confirm(`Delete evidence "${title}"?`)) return;
        router.delete(route('evidence.destroy', id));
    };

    const download = (id: number) => {
        window.open(route('evidence.download', id), '_blank');
    };

    const runAiReview = async (id: number) => {
        setReviewing(prev => ({ ...prev, [id]: true }));
        setReviewError(prev => { const n = { ...prev }; delete n[id]; return n; });

        try {
            const { data } = await axios.post(route('evidence.ai-review', id));
            if (!data.verdict) {
                setReviewError(prev => ({ ...prev, [id]: 'AI review could not be completed. Please try again.' }));
                return;
            }
            setLiveReviews(prev => ({ ...prev, [id]: data }));
            setExpanded(prev => ({ ...prev, [id]: true }));
        } catch (err: any) {
            const msg = err.response?.data?.error ?? 'AI review could not be completed. Please try again.';
            setReviewError(prev => ({ ...prev, [id]: msg }));
        } finally {
            setReviewing(prev => ({ ...prev, [id]: false }));
        }
    };

    const togglePanel = (id: number) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getReview = (ev: EvidenceItem): AiReview | null => {
        if (liveReviews[ev.id]) return liveReviews[ev.id];
        // New structured columns take precedence over the legacy ai_review JSON blob
        if (ev.ai_verdict && ev.ai_strengths !== null) {
            return {
                verdict:        ev.ai_verdict        as AiReview['verdict'],
                confidence:     (ev.ai_confidence ?? 'Medium') as AiReview['confidence'],
                strengths:      ev.ai_strengths      ?? '',
                gaps:           ev.ai_gaps           ?? '',
                recommendation: ev.ai_recommendation ?? '',
            };
        }
        return null;
    };

    const formatSize = (type: string) => type.split('/')[1]?.toUpperCase() ?? 'FILE';

    return (
        <AdminLayout>
            <Head title="Evidence" />

            <div className="space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Evidence</h1>
                    <p className="text-sm text-gray-500 mt-1">All uploaded compliance evidence files</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Files', value: stats.total,    icon: FolderOpen,  color: 'text-blue-500' },
                        { label: 'Pending',     value: stats.pending,  icon: Clock,       color: 'text-yellow-500' },
                        { label: 'Approved',    value: stats.approved, icon: CheckCircle, color: 'text-green-500' },
                        { label: 'Rejected',    value: stats.rejected, icon: XCircle,     color: 'text-red-500' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <Card key={label}>
                            <CardContent className="p-4 flex items-center gap-3">
                                <Icon className={`w-8 h-8 ${color}`} />
                                <div>
                                    <p className="text-2xl font-bold">{value}</p>
                                    <p className="text-xs text-gray-500">{label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-3">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search evidence..."
                                    value={search}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                                    onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && applyFilters({ search })}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={status} onValueChange={(v: string) => { setStatus(v); applyFilters({ status: v === 'all' ? '' : v }); }}>
                                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={frameworkId} onValueChange={(v: string) => { setFramework(v); applyFilters({ framework_id: v === 'all' ? '' : v }); }}>
                                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Framework" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Frameworks</SelectItem>
                                    {frameworks.map(f => (
                                        <SelectItem key={f.id} value={String(f.id)}>{f.short_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={assessmentId} onValueChange={(v: string) => { setAssessment(v); applyFilters({ assessment_id: v === 'all' ? '' : v }); }}>
                                <SelectTrigger className="w-[200px]"><SelectValue placeholder="Assessment" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Assessments</SelectItem>
                                    {assessments.map(a => (
                                        <SelectItem key={a.id} value={String(a.id)}>{a.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={() => applyFilters({ search })}>Search</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Evidence List */}
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">{evidence.total} file{evidence.total !== 1 ? 's' : ''}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 mt-4">
                        {evidence.data.length === 0 ? (
                            <div className="p-12 text-center">
                                <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-400 font-medium">No evidence files found</p>
                                <p className="text-gray-400 text-sm mt-1">Upload evidence from within a questionnaire.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {evidence.data.map(ev => {
                                    const review     = getReview(ev);
                                    const isExpanded = expanded[ev.id] ?? false;
                                    const isLoading  = reviewing[ev.id] ?? false;
                                    const error      = reviewError[ev.id];
                                    const hasReview  = review !== null;

                                    return (
                                        <div key={ev.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                                        <FileIcon type={ev.file_type} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                                            <p className="font-semibold text-sm text-gray-900 dark:text-white">{ev.title}</p>
                                                            {hasReview && (
                                                                <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" aria-label="AI reviewed" />
                                                            )}
                                                            <Badge variant="outline" className={`text-xs ${statusColors[ev.status]}`}>
                                                                {ev.status}
                                                            </Badge>
                                                            {ev.is_expired && (
                                                                <Badge className="text-xs bg-red-100 text-red-700 border border-red-300">Expired</Badge>
                                                            )}
                                                            {!ev.is_expired && ev.expires_soon && (
                                                                <Badge className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-300">Expiring Soon</Badge>
                                                            )}
                                                            {ev.ai_verdict && !liveReviews[ev.id] && (
                                                                <span
                                                                    title={ev.ai_reviewed_at ? `Last reviewed: ${new Date(ev.ai_reviewed_at).toLocaleDateString()}` : 'AI reviewed'}
                                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border cursor-default ${verdictConfig[ev.ai_verdict]?.bg ?? ''} ${verdictConfig[ev.ai_verdict]?.color ?? ''}`}
                                                                >
                                                                    {ev.ai_verdict}
                                                                </span>
                                                            )}
                                                            <span className="text-xs text-gray-400 font-mono">{formatSize(ev.file_type)}</span>
                                                        </div>

                                                        {/* Control info */}
                                                        {ev.assessment_item && (
                                                            <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500 mb-1">
                                                                <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                                                    {ev.assessment_item.control.control_id}
                                                                </span>
                                                                <span className="truncate max-w-[250px]">{ev.assessment_item.control.title}</span>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {ev.assessment_item.assessment.framework.short_name}
                                                                </Badge>
                                                            </div>
                                                        )}

                                                        {/* Assessment info */}
                                                        {ev.assessment_item && (
                                                            <p className="text-xs text-gray-400">
                                                                Assessment: <span className="font-medium">{ev.assessment_item.assessment.title}</span>
                                                                {' '}· Uploaded by {ev.user?.name ?? 'Unknown'}
                                                                {' '}· {new Date(ev.created_at).toLocaleDateString()}
                                                            </p>
                                                        )}

                                                        {ev.description && (
                                                            <p className="text-xs text-gray-500 mt-1 italic">{ev.description}</p>
                                                        )}

                                                        <p className="text-xs mt-1">
                                                            {ev.expiry_date
                                                                ? <span className={ev.is_expired ? 'text-red-500 font-medium' : ev.expires_soon ? 'text-yellow-600 font-medium' : 'text-gray-400'}>
                                                                    Expires: {new Date(ev.expiry_date).toLocaleDateString()}
                                                                  </span>
                                                                : <span className="text-gray-400">No Expiry</span>
                                                            }
                                                        </p>

                                                        {/* Inline error */}
                                                        {error && (
                                                            <p className="text-xs text-red-500 mt-1">{error}</p>
                                                        )}

                                                        {/* Expandable AI review panel */}
                                                        {hasReview && isExpanded && (
                                                            <AiReviewPanel review={review} />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1 flex-shrink-0 flex-wrap justify-end">
                                                    {/* AI Review button */}
                                                    {canReview && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-xs gap-1"
                                                            onClick={() => hasReview ? togglePanel(ev.id) : runAiReview(ev.id)}
                                                            disabled={isLoading}
                                                            title={hasReview ? 'Toggle AI review' : 'Run AI review'}
                                                        >
                                                            {isLoading
                                                                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Reviewing...</>
                                                                : hasReview
                                                                    ? <>{isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}<Sparkles className="w-3.5 h-3.5" /> AI Review</>
                                                                    : <><Sparkles className="w-3.5 h-3.5" /> AI Review</>
                                                            }
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="h-8 w-8 text-blue-500 hover:bg-blue-50"
                                                        title="Download"
                                                        onClick={() => download(ev.id)}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>

                                                    {(isAdmin || auth.user.role === 'auditor') && ev.status !== 'approved' && (
                                                        <Button
                                                            variant="ghost" size="icon"
                                                            className="h-8 w-8 text-green-500 hover:bg-green-50"
                                                            title="Approve"
                                                            onClick={() => approve(ev.id)}
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </Button>
                                                    )}

                                                    {(isAdmin || auth.user.role === 'auditor') && ev.status !== 'rejected' && (
                                                        <Button
                                                            variant="ghost" size="icon"
                                                            className="h-8 w-8 text-orange-500 hover:bg-orange-50"
                                                            title="Reject"
                                                            onClick={() => reject(ev.id)}
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </Button>
                                                    )}

                                                    {isAdmin && (
                                                        <Button
                                                            variant="ghost" size="icon"
                                                            className="h-8 w-8 text-red-500 hover:bg-red-50"
                                                            title="Delete"
                                                            onClick={() => destroy(ev.id, ev.title)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {evidence.links.length > 3 && (
                            <div className="flex items-center justify-center gap-1 p-4 border-t">
                                {evidence.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
