import { Head, Link, router } from '@inertiajs/react';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { StatStrip } from '@/components/ui/stat-strip';
import { FilterBar } from '@/components/ui/filter-bar';
import { Search, XCircle, AlertTriangle, Eye, Loader2, X, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

interface Item {
    id: number;
    compliance_status: string;
    comments: string | null;
    control: {
        id: number;
        control_id: string;
        title: string;
        category: string;
        description: string;
    };
    assessment: {
        id: number;
        title: string;
        framework: { short_name: string };
        user: { name: string };
    };
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

interface Props {
    items: {
        data: Item[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    frameworks: { id: number; name: string; short_name: string }[];
    categories: string[];
    stats: {
        non_compliant: number;
        partially_compliant: number;
        by_framework: { name: string; non_compliant: number; partially_compliant: number }[];
    };
    filters: { search?: string; framework_id?: string; status?: string; category?: string };
}

const PRIORITY_STYLES: Record<string, string> = {
    Critical: 'bg-red-500/15 text-red-400 border-red-500/30',
    High:     'bg-orange-500/15 text-orange-400 border-orange-500/30',
    Medium:   'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Low:      'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

function formatPlanAsText(item: Item, plan: RemediationPlan): string {
    const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const lines: string[] = [
        `AI Remediation Plan — ${item.control.control_id}: ${item.control.title}`,
        `Generated: ${date}`,
        '',
        `Summary: ${plan.summary}`,
        `Priority: ${plan.priority} | Estimated Effort: ${plan.estimated_effort}`,
        '',
        'Quick Wins:',
        ...plan.quick_wins.map(w => `• ${w}`),
        '',
        'Remediation Steps:',
        ...plan.remediation_steps.map(s =>
            `${s.step}. ${s.action}\n   ${s.detail}\n   Evidence: ${s.evidence_needed}`
        ),
        '',
        'Resources Needed:',
        ...plan.resources_needed.map(r => `• ${r}`),
    ];
    return lines.join('\n');
}

export default function GapAnalysisIndex({ items, frameworks, categories, stats, filters }: Props) {
    const [search, setSearch]         = useState(filters.search ?? '');
    const [frameworkId, setFramework] = useState(filters.framework_id ?? 'all');
    const [status, setStatus]         = useState(filters.status ?? 'all');
    const [category, setCategory]     = useState(filters.category ?? 'all');

    const [analyzing, setAnalyzing]       = useState<number | null>(null);
    const [lastAnalyzed, setLastAnalyzed] = useState<number | null>(null);
    const [planModal, setPlanModal]       = useState<{ item: Item; plan: RemediationPlan } | null>(null);
    const [saving, setSaving]             = useState(false);
    const [saveError, setSaveError]       = useState<string | null>(null);
    const [savedRisk, setSavedRisk]       = useState<{ id: number; title: string } | null>(null);

    const applyFilters = (overrides: Record<string, string> = {}) => {
        router.get(route('gap-analysis.index'), {
            search,
            framework_id: frameworkId === 'all' ? '' : frameworkId,
            status:       status      === 'all' ? '' : status,
            category:     category    === 'all' ? '' : category,
            ...overrides,
        }, { preserveState: true, replace: true });
    };

    const handleAiFix = async (item: Item) => {
        setAnalyzing(item.id);
        try {
            const res = await axios.post('/ai/remediate-gap', {
                control_id:          item.control.id,
                control_code:        item.control.control_id,
                control_title:       item.control.title,
                control_description: item.control.description,
                control_category:    item.control.category,
                framework:           item.assessment.framework.short_name,
                compliance_status:   item.compliance_status,
            });
            setLastAnalyzed(item.id);
            setSavedRisk(null);
            setSaveError(null);
            setPlanModal({ item, plan: res.data });
        } catch {
            alert('Failed to generate remediation plan. Please try again.');
        } finally {
            setAnalyzing(null);
        }
    };

    const handleSave = async () => {
        if (!planModal) return;
        setSaving(true);
        setSaveError(null);
        try {
            const res = await axios.post('/ai/save-remediation', {
                control_id: planModal.item.control.id,
                plan_text:  formatPlanAsText(planModal.item, planModal.plan),
            });
            setSavedRisk({ id: res.data.risk_id, title: res.data.risk_title });
        } catch (err: any) {
            const msg = err?.response?.data?.error ?? 'Failed to save remediation notes.';
            setSaveError(msg);
        } finally {
            setSaving(false);
        }
    };

    const total = stats.non_compliant + stats.partially_compliant;

    return (
        <AdminLayout>
            <Head title="Gap Analysis" />

            <div className="space-y-6">

                <PageHeader
                    title="Gap Analysis"
                    description="Non-compliant and partially compliant controls across all completed assessments"
                />

                <StatStrip stats={[
                    { label: 'Non-Compliant',      value: stats.non_compliant,      tone: stats.non_compliant      > 0 ? 'bad'  : 'ok' },
                    { label: 'Partially Compliant', value: stats.partially_compliant, tone: stats.partially_compliant > 0 ? 'warn' : 'ok' },
                    { label: 'Total Gaps',          value: total,                    tone: total > 0 ? 'warn' : 'ok' },
                    { label: 'Frameworks Affected', value: stats.by_framework.length, tone: 'neutral' },
                ]} />

                {/* Framework breakdown */}
                {stats.by_framework.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Gaps by Framework</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {stats.by_framework.map(f => {
                                    const fTotal = f.non_compliant + f.partially_compliant;
                                    return (
                                        <div key={f.name} className="p-3 bg-muted/30 rounded-lg border border-border">
                                            <p className="font-medium text-xs text-muted-foreground mb-2 truncate">{f.name}</p>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-red-400">Non-Compliant</span>
                                                    <span className="font-mono tabular-nums">{f.non_compliant}</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-amber-400">Partial</span>
                                                    <span className="font-mono tabular-nums">{f.partially_compliant}</span>
                                                </div>
                                                <div className="w-full h-1 bg-border rounded-full mt-2 overflow-hidden flex">
                                                    {fTotal > 0 && (
                                                        <>
                                                            <div className="h-full bg-red-500" style={{ width: `${(f.non_compliant / fTotal) * 100}%` }} />
                                                            <div className="h-full bg-amber-400" style={{ width: `${(f.partially_compliant / fTotal) * 100}%` }} />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <FilterBar>
                    <div className="relative flex-1 min-w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search controls..."
                            value={search}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                            onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && applyFilters({ search })}
                            className="pl-9 h-8 text-sm"
                        />
                    </div>
                    <Select value={frameworkId} onValueChange={(v: string) => { setFramework(v); applyFilters({ framework_id: v === 'all' ? '' : v }); }}>
                        <SelectTrigger className="w-40 h-8 text-sm"><SelectValue placeholder="Framework" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Frameworks</SelectItem>
                            {frameworks.map(f => (
                                <SelectItem key={f.id} value={String(f.id)}>{f.short_name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={status} onValueChange={(v: string) => { setStatus(v); applyFilters({ status: v === 'all' ? '' : v }); }}>
                        <SelectTrigger className="w-45 h-8 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Gaps</SelectItem>
                            <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                            <SelectItem value="partially_compliant">Partially Compliant</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={category} onValueChange={(v: string) => { setCategory(v); applyFilters({ category: v === 'all' ? '' : v }); }}>
                        <SelectTrigger className="w-45 h-8 text-sm"><SelectValue placeholder="Category" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => applyFilters({ search })}>Search</Button>
                </FilterBar>

                {/* Gaps Table */}
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">{items.total} gap{items.total !== 1 ? 's' : ''} identified</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 mt-4">
                        {items.data.length === 0 ? (
                            <div className="p-12 text-center">
                                <XCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-muted-foreground font-medium">No gaps found</p>
                                <p className="text-muted-foreground/60 text-sm mt-1">
                                    {total === 0
                                        ? 'Complete assessments to identify compliance gaps.'
                                        : 'No gaps match your current filters.'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {items.data.map(item => (
                                    <div
                                        key={item.id}
                                        className={`p-4 hover:bg-accent/30 transition-colors ${
                                            item.compliance_status === 'non_compliant'
                                                ? 'border-l-4 border-red-400'
                                                : 'border-l-4 border-yellow-400'
                                        } ${lastAnalyzed === item.id ? 'ring-2 ring-purple-400 ring-inset' : ''}`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className="font-mono text-xs bg-muted/50 px-2 py-0.5 rounded text-foreground/80">
                                                        {item.control.control_id}
                                                    </span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.assessment.framework.short_name}
                                                    </Badge>
                                                    <span className="text-xs text-gray-400">{item.control.category}</span>
                                                </div>
                                                <p className="font-semibold text-foreground text-sm">
                                                    {item.control.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    {item.control.description}
                                                </p>
                                                {item.comments && (
                                                    <div className="mt-2 p-2 bg-muted/30 rounded text-xs text-foreground/80">
                                                        <span className="font-semibold">Notes: </span>{item.comments}
                                                    </div>
                                                )}
                                                <p className="text-xs text-gray-400 mt-2">
                                                    Assessment: <span className="font-medium">{item.assessment.title}</span>
                                                    {' '}· {item.assessment.user.name}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2 shrink-0">
                                                <Badge variant="outline" className={
                                                    item.compliance_status === 'non_compliant'
                                                        ? 'bg-red-950 text-red-400 border-red-200'
                                                        : 'bg-amber-950 text-amber-400 border-yellow-200'
                                                }>
                                                    {item.compliance_status === 'non_compliant' ? 'Non-Compliant' : 'Partial'}
                                                </Badge>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        size="sm"
                                                        disabled={analyzing === item.id}
                                                        onClick={() => handleAiFix(item)}
                                                        className="gap-1 text-xs bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-60"
                                                    >
                                                        {analyzing === item.id ? (
                                                            <><Loader2 className="w-3 h-3 animate-spin" /> Analyzing...</>
                                                        ) : (
                                                            <>✨ AI Fix</>
                                                        )}
                                                    </Button>
                                                    <Link href={route('assessments.show', item.assessment.id)}>
                                                        <Button variant="ghost" size="sm" className="gap-1 text-xs">
                                                            <Eye className="w-3 h-3" /> View
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {items.links.length > 3 && (
                            <div className="flex items-center justify-center gap-1 p-4 border-t">
                                {items.links.map((link, i) => (
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

            {/* Remediation Modal */}
            {planModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    onClick={(e) => e.target === e.currentTarget && setPlanModal(null)}
                >
                    <div className="bg-popover rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-border backdrop-blur-xl">

                        {/* Modal Header */}
                        <div className="flex items-start justify-between p-5 border-b border-border">
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                                <span className="text-violet-400 text-lg leading-none mt-0.5">✨</span>
                                <div className="min-w-0">
                                    <h2 className="font-semibold text-foreground text-sm leading-snug">
                                        AI Remediation Plan
                                    </h2>
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                        {planModal.item.control.control_id}: {planModal.item.control.title}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setPlanModal(null)}
                                className="text-muted-foreground hover:text-foreground ml-3 shrink-0 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="overflow-y-auto flex-1 p-5 space-y-5">

                            {/* Summary */}
                            <div className="p-3 bg-muted/30 rounded-lg text-sm text-foreground/85 border border-border">
                                {planModal.plan.summary}
                            </div>

                            {/* Priority + Effort */}
                            <div className="flex items-center gap-3">
                                <Badge
                                    variant="outline"
                                    className={`text-xs font-semibold ${PRIORITY_STYLES[planModal.plan.priority] ?? PRIORITY_STYLES['High']}`}
                                >
                                    {planModal.plan.priority} Priority
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    Estimated effort: <span className="font-medium text-foreground/85">{planModal.plan.estimated_effort}</span>
                                </span>
                            </div>

                            {/* Quick Wins */}
                            {planModal.plan.quick_wins.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-emerald-400 mb-2">⚡ Quick Wins — Do These First</p>
                                    <div className="space-y-1.5">
                                        {planModal.plan.quick_wins.map((win, i) => (
                                            <div key={i} className="flex items-start gap-2 p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                                <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                                <span className="text-xs text-foreground/80">{win}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Remediation Steps */}
                            {planModal.plan.remediation_steps.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-foreground/85 mb-3">Remediation Steps</p>
                                    <div className="space-y-3">
                                        {planModal.plan.remediation_steps.map((s) => (
                                            <div key={s.step} className="flex gap-3">
                                                <div className="shrink-0 w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold flex items-center justify-center">
                                                    {s.step}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground">{s.action}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{s.detail}</p>
                                                    <div className="mt-1.5 px-2 py-1 bg-muted/50 rounded text-xs text-muted-foreground border border-border">
                                                        Evidence needed: {s.evidence_needed}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Resources Needed */}
                            {planModal.plan.resources_needed.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-foreground/85 mb-2">Resources Needed</p>
                                    <ul className="space-y-1">
                                        {planModal.plan.resources_needed.map((r, i) => (
                                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                                <span className="text-muted-foreground/60 shrink-0">·</span>{r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-border">
                            {savedRisk ? (
                                <div className="flex flex-col items-center gap-3 py-1">
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span className="font-semibold text-sm">Remediation plan saved!</span>
                                    </div>
                                    <Button
                                        onClick={() => { router.visit(`/risks/${savedRisk.id}`); setPlanModal(null); setSavedRisk(null); }}
                                        className="w-full font-semibold py-2.5 gap-2 text-sm"
                                    >
                                        View Risk Record <ArrowRight className="w-4 h-4" />
                                    </Button>
                                    <p className="text-xs text-muted-foreground">Risk: {savedRisk.title}</p>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between gap-3">
                                    <div className="text-xs">
                                        {saveError && <span className="text-red-400">{saveError}</span>}
                                        {saving && <span className="text-muted-foreground">Creating risk and saving...</span>}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setPlanModal(null)}>
                                            Close
                                        </Button>
                                        <Button
                                            size="sm"
                                            disabled={saving}
                                            onClick={handleSave}
                                            className="gap-1"
                                        >
                                            {saving ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</> : 'Save to Risk Notes'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
