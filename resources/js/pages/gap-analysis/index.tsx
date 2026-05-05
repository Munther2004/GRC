import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import {
    Search,
    XCircle,
    Eye,
    Loader2,
    X,
    ChevronRight,
    CheckCircle2,
    ArrowRight,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterBar } from '@/components/ui/filter-bar';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { StatStrip } from '@/components/ui/stat-strip';
import AdminLayout from '@/layouts/admin-layout';
import { route } from '@/lib/routes';

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
        by_framework: {
            name: string;
            non_compliant: number;
            partially_compliant: number;
        }[];
    };
    filters: {
        search?: string;
        framework_id?: string;
        status?: string;
        category?: string;
    };
}

const PRIORITY_STYLES: Record<string, string> = {
    Critical: 'bg-[rgba(229,72,77,0.12)] text-[#e5484d] border-[rgba(229,72,77,0.4)]',
    High: 'bg-[rgba(247,107,21,0.12)] text-[#f76b15] border-[rgba(247,107,21,0.4)]',
    Medium: 'bg-[rgba(245,185,41,0.12)] text-[#f5b929] border-[rgba(245,185,41,0.4)]',
    Low: 'bg-[rgba(70,189,95,0.12)] text-[#46bd5f] border-[rgba(70,189,95,0.4)]',
};

function formatPlanAsText(item: Item, plan: RemediationPlan): string {
    const date = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
    const lines: string[] = [
        `AI Remediation Plan — ${item.control.control_id}: ${item.control.title}`,
        `Generated: ${date}`,
        '',
        `Summary: ${plan.summary}`,
        `Priority: ${plan.priority} | Estimated Effort: ${plan.estimated_effort}`,
        '',
        'Quick Wins:',
        ...plan.quick_wins.map((w) => `• ${w}`),
        '',
        'Remediation Steps:',
        ...plan.remediation_steps.map(
            (s) =>
                `${s.step}. ${s.action}\n   ${s.detail}\n   Evidence: ${s.evidence_needed}`,
        ),
        '',
        'Resources Needed:',
        ...plan.resources_needed.map((r) => `• ${r}`),
    ];
    return lines.join('\n');
}

export default function GapAnalysisIndex({
    items,
    frameworks,
    categories,
    stats,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [frameworkId, setFramework] = useState(filters.framework_id ?? 'all');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [category, setCategory] = useState(filters.category ?? 'all');

    const [analyzing, setAnalyzing] = useState<number | null>(null);
    const [lastAnalyzed, setLastAnalyzed] = useState<number | null>(null);
    const [planModal, setPlanModal] = useState<{
        item: Item;
        plan: RemediationPlan;
    } | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [savedRisk, setSavedRisk] = useState<{
        id: number;
        title: string;
    } | null>(null);

    const applyFilters = (overrides: Record<string, string> = {}) => {
        router.get(
            route('gap-analysis.index'),
            {
                search,
                framework_id: frameworkId === 'all' ? '' : frameworkId,
                status: status === 'all' ? '' : status,
                category: category === 'all' ? '' : category,
                ...overrides,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleAiFix = async (item: Item) => {
        setAnalyzing(item.id);
        try {
            const res = await axios.post('/ai/remediate-gap', {
                control_id: item.control.id,
                control_code: item.control.control_id,
                control_title: item.control.title,
                control_description: item.control.description,
                control_category: item.control.category,
                framework: item.assessment.framework.short_name,
                compliance_status: item.compliance_status,
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
                plan_text: formatPlanAsText(planModal.item, planModal.plan),
            });
            setSavedRisk({ id: res.data.risk_id, title: res.data.risk_title });
        } catch (err: any) {
            const msg =
                err?.response?.data?.error ??
                'Failed to save remediation notes.';
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

                <StatStrip
                    stats={[
                        {
                            label: 'Non-Compliant',
                            value: stats.non_compliant,
                            tone: stats.non_compliant > 0 ? 'bad' : 'ok',
                        },
                        {
                            label: 'Partially Compliant',
                            value: stats.partially_compliant,
                            tone: stats.partially_compliant > 0 ? 'warn' : 'ok',
                        },
                        {
                            label: 'Total Gaps',
                            value: total,
                            tone: total > 0 ? 'warn' : 'ok',
                        },
                        {
                            label: 'Frameworks Affected',
                            value: stats.by_framework.length,
                            tone: 'neutral',
                        },
                    ]}
                />

                {/* Framework breakdown */}
                {stats.by_framework.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg" style={{ fontWeight: 500 }}>
                                Gaps by Framework
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                {stats.by_framework.map((f) => {
                                    const fTotal =
                                        f.non_compliant + f.partially_compliant;
                                    return (
                                        <div
                                            key={f.name}
                                            className="rounded-2xl border bg-muted/30 p-3"
                                        >
                                            <p className="mb-2 truncate text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                                                {f.name}
                                            </p>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span style={{ color: '#e5484d' }}>
                                                        Non-Compliant
                                                    </span>
                                                    <span className="font-mono tabular-nums">
                                                        {f.non_compliant}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span style={{ color: '#f5b929' }}>
                                                        Partial
                                                    </span>
                                                    <span className="font-mono tabular-nums">
                                                        {f.partially_compliant}
                                                    </span>
                                                </div>
                                                <div className="mt-2 flex h-1 w-full overflow-hidden rounded-full bg-border">
                                                    {fTotal > 0 && (
                                                        <>
                                                            <div
                                                                className="h-full"
                                                                style={{
                                                                    width: `${(f.non_compliant / fTotal) * 100}%`,
                                                                    background: '#e5484d',
                                                                }}
                                                            />
                                                            <div
                                                                className="h-full"
                                                                style={{
                                                                    width: `${(f.partially_compliant / fTotal) * 100}%`,
                                                                    background: '#f5b929',
                                                                }}
                                                            />
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
                    <div className="relative min-w-48 flex-1">
                        <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search controls..."
                            value={search}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) => setSearch(e.target.value)}
                            onKeyDown={(e: React.KeyboardEvent) =>
                                e.key === 'Enter' && applyFilters({ search })
                            }
                            className="h-8 pl-9 text-sm"
                        />
                    </div>
                    <Select
                        value={frameworkId}
                        onValueChange={(v: string) => {
                            setFramework(v);
                            applyFilters({
                                framework_id: v === 'all' ? '' : v,
                            });
                        }}
                    >
                        <SelectTrigger className="h-8 w-40 text-sm">
                            <SelectValue placeholder="Framework" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Frameworks</SelectItem>
                            {frameworks.map((f) => (
                                <SelectItem key={f.id} value={String(f.id)}>
                                    {f.short_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={status}
                        onValueChange={(v: string) => {
                            setStatus(v);
                            applyFilters({ status: v === 'all' ? '' : v });
                        }}
                    >
                        <SelectTrigger className="h-8 w-45 text-sm">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Gaps</SelectItem>
                            <SelectItem value="non_compliant">
                                Non-Compliant
                            </SelectItem>
                            <SelectItem value="partially_compliant">
                                Partially Compliant
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={category}
                        onValueChange={(v: string) => {
                            setCategory(v);
                            applyFilters({ category: v === 'all' ? '' : v });
                        }}
                    >
                        <SelectTrigger className="h-8 w-45 text-sm">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((c) => (
                                <SelectItem key={c} value={c}>
                                    {c}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyFilters({ search })}
                    >
                        Search
                    </Button>
                </FilterBar>

                {/* Gaps Table */}
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">
                            {items.total} gap{items.total !== 1 ? 's' : ''}{' '}
                            identified
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="mt-4 p-0">
                        {items.data.length === 0 ? (
                            <div className="p-12 text-center">
                                <XCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                                <p className="font-medium text-muted-foreground">
                                    No gaps found
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground/60">
                                    {total === 0
                                        ? 'Complete assessments to identify compliance gaps.'
                                        : 'No gaps match your current filters.'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {items.data.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`p-4 transition-colors hover:bg-muted/30 ${lastAnalyzed === item.id ? 'ring-2 ring-primary ring-inset' : ''}`}
                                        style={{ borderLeft: item.compliance_status === 'non_compliant' ? '4px solid #e5484d' : '4px solid #f5b929' }}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                                    <span className="rounded-full bg-muted/50 px-2 py-0.5 font-mono text-xs" style={{ color: 'var(--foreground)' }}>
                                                        {
                                                            item.control
                                                                .control_id
                                                        }
                                                    </span>
                                                    <Badge variant="outline">
                                                        {
                                                            item.assessment
                                                                .framework
                                                                .short_name
                                                        }
                                                    </Badge>
                                                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                        {item.control.category}
                                                    </span>
                                                </div>
                                                <p className="text-sm" style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                                                    {item.control.title}
                                                </p>
                                                <p className="mt-1 line-clamp-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                    {item.control.description}
                                                </p>
                                                {item.comments && (
                                                    <div className="mt-2 rounded-2xl bg-muted/30 p-2 text-xs" style={{ color: 'var(--foreground)' }}>
                                                        <span style={{ fontWeight: 500 }}>
                                                            Notes:{' '}
                                                        </span>
                                                        {item.comments}
                                                    </div>
                                                )}
                                                <p className="mt-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                    Assessment:{' '}
                                                    <span style={{ fontWeight: 500 }}>
                                                        {item.assessment.title}
                                                    </span>{' '}
                                                    ·{' '}
                                                    {item.assessment.user.name}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 flex-col items-end gap-2">
                                                <Badge
                                                    variant="outline"
                                                    style={
                                                        item.compliance_status === 'non_compliant'
                                                            ? { color: '#e5484d', borderColor: 'rgba(229,72,77,0.4)', background: 'rgba(229,72,77,0.1)' }
                                                            : { color: '#f5b929', borderColor: 'rgba(245,185,41,0.4)', background: 'rgba(245,185,41,0.1)' }
                                                    }
                                                >
                                                    {item.compliance_status ===
                                                    'non_compliant'
                                                        ? 'Non-Compliant'
                                                        : 'Partial'}
                                                </Badge>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={
                                                            analyzing ===
                                                            item.id
                                                        }
                                                        onClick={() =>
                                                            handleAiFix(item)
                                                        }
                                                        className="gap-1"
                                                    >
                                                        {analyzing ===
                                                        item.id ? (
                                                            <>
                                                                <Loader2 className="h-3 w-3 animate-spin" />{' '}
                                                                Analyzing...
                                                            </>
                                                        ) : (
                                                            <>AI Fix</>
                                                        )}
                                                    </Button>
                                                    <Link
                                                        href={route(
                                                            'assessments.show',
                                                            item.assessment.id,
                                                        )}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="gap-1"
                                                        >
                                                            <Eye className="h-3 w-3" />{' '}
                                                            View
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
                            <div className="flex items-center justify-center gap-1 border-t p-4">
                                {items.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() =>
                                            link.url && router.get(link.url)
                                        }
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
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
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={(e) =>
                        e.target === e.currentTarget && setPlanModal(null)
                    }
                >
                    <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border bg-popover shadow-2xl backdrop-blur-xl" style={{ borderColor: 'var(--border)' }}>
                        {/* Modal Header */}
                        <div className="flex items-start justify-between border-b p-5" style={{ borderColor: 'var(--border)' }}>
                            <div className="flex min-w-0 flex-1 items-start gap-2">
                                <span className="mt-0.5 text-lg leading-none" style={{ color: 'var(--primary)' }}>
                                    ✨
                                </span>
                                <div className="min-w-0">
                                    <h2 className="text-sm leading-snug" style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                                        AI Remediation Plan
                                    </h2>
                                    <p className="mt-0.5 truncate text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                        {planModal.item.control.control_id}:{' '}
                                        {planModal.item.control.title}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setPlanModal(null)}
                                className="ml-3 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="flex-1 space-y-5 overflow-y-auto p-5">
                            {/* Summary */}
                            <div className="rounded-2xl border bg-muted/30 p-3 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--foreground)', opacity: 0.9 }}>
                                {planModal.plan.summary}
                            </div>

                            {/* Priority + Effort */}
                            <div className="flex items-center gap-3">
                                <Badge
                                    variant="outline"
                                    className={PRIORITY_STYLES[planModal.plan.priority] ?? PRIORITY_STYLES['High']}
                                >
                                    {planModal.plan.priority} Priority
                                </Badge>
                                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                    Estimated effort:{' '}
                                    <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                                        {planModal.plan.estimated_effort}
                                    </span>
                                </span>
                            </div>

                            {/* Quick Wins */}
                            {planModal.plan.quick_wins.length > 0 && (
                                <div>
                                    <p className="mb-2 text-xs" style={{ color: '#46bd5f', fontWeight: 500 }}>
                                        Quick Wins — Do These First
                                    </p>
                                    <div className="space-y-1.5">
                                        {planModal.plan.quick_wins.map(
                                            (win, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-start gap-2 rounded-2xl border p-2.5"
                                                    style={{ borderColor: 'rgba(70,189,95,0.3)', background: 'rgba(70,189,95,0.08)' }}
                                                >
                                                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: '#46bd5f' }} />
                                                    <span className="text-xs" style={{ color: 'var(--foreground)' }}>
                                                        {win}
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Remediation Steps */}
                            {planModal.plan.remediation_steps.length > 0 && (
                                <div>
                                    <p className="mb-3 text-xs" style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                                        Remediation Steps
                                    </p>
                                    <div className="space-y-3">
                                        {planModal.plan.remediation_steps.map(
                                            (s) => (
                                                <div
                                                    key={s.step}
                                                    className="flex gap-3"
                                                >
                                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs" style={{ background: 'color-mix(in srgb, var(--primary) 20%, transparent)', color: 'var(--primary)', fontWeight: 600 }}>
                                                        {s.step}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm" style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                                                            {s.action}
                                                        </p>
                                                        <p className="mt-0.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                            {s.detail}
                                                        </p>
                                                        <div className="mt-1.5 rounded-full border bg-muted/50 px-2 py-1 text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                                                            Evidence needed:{' '}
                                                            {s.evidence_needed}
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Resources Needed */}
                            {planModal.plan.resources_needed.length > 0 && (
                                <div>
                                    <p className="mb-2 text-xs" style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                                        Resources Needed
                                    </p>
                                    <ul className="space-y-1">
                                        {planModal.plan.resources_needed.map(
                                            (r, i) => (
                                                <li
                                                    key={i}
                                                    className="flex items-start gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}
                                                >
                                                    <span className="shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                                                        ·
                                                    </span>
                                                    {r}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t p-4" style={{ borderColor: 'var(--border)' }}>
                            {savedRisk ? (
                                <div className="flex flex-col items-center gap-3 py-1">
                                    <div className="flex items-center gap-2" style={{ color: '#46bd5f' }}>
                                        <CheckCircle2 className="h-5 w-5" />
                                        <span className="text-sm" style={{ fontWeight: 500 }}>
                                            Remediation plan saved!
                                        </span>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            router.visit(
                                                `/risks/${savedRisk.id}`,
                                            );
                                            setPlanModal(null);
                                            setSavedRisk(null);
                                        }}
                                        className="w-full gap-2 py-2.5 text-sm font-medium"
                                    >
                                        View Risk Record{' '}
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                    <p className="text-xs text-muted-foreground">
                                        Risk: {savedRisk.title}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between gap-3">
                                    <div className="text-xs">
                                        {saveError && (
                                            <span style={{ color: 'var(--destructive)' }}>
                                                {saveError}
                                            </span>
                                        )}
                                        {saving && (
                                            <span style={{ color: 'var(--muted-foreground)' }}>
                                                Creating risk and saving...
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPlanModal(null)}
                                        >
                                            Close
                                        </Button>
                                        <Button
                                            size="sm"
                                            disabled={saving}
                                            onClick={handleSave}
                                            className="gap-1"
                                        >
                                            {saving ? (
                                                <>
                                                    <Loader2 className="h-3 w-3 animate-spin" />{' '}
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save to Risk Notes'
                                            )}
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
