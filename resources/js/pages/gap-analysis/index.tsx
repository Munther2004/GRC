import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import {
    Search,
    XCircle,
    AlertTriangle,
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
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
    Critical: 'bg-red-100 text-red-700 border-red-300',
    High: 'bg-orange-100 text-orange-700 border-orange-300',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    Low: 'bg-green-100 text-green-700 border-green-300',
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
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Gap Analysis
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Non-compliant and partially compliant controls across
                        all completed assessments
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center gap-3 p-4">
                            <XCircle className="h-8 w-8 text-red-500" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {stats.non_compliant}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Non-Compliant
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 p-4">
                            <AlertTriangle className="h-8 w-8 text-yellow-500" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {stats.partially_compliant}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Partially Compliant
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    {stats.by_framework.slice(0, 2).map((f) => (
                        <Card key={f.name}>
                            <CardContent className="p-4">
                                <p className="mb-1 text-xs font-semibold text-gray-500">
                                    {f.name}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-red-500">
                                        {f.non_compliant}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        non-compliant
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-yellow-500">
                                        {f.partially_compliant}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        partial
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Framework breakdown */}
                {stats.by_framework.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Gaps by Framework
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                {stats.by_framework.map((f) => {
                                    const fTotal =
                                        f.non_compliant + f.partially_compliant;
                                    return (
                                        <div
                                            key={f.name}
                                            className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                                        >
                                            <p className="mb-2 text-sm font-semibold">
                                                {f.name}
                                            </p>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-red-500">
                                                        Non-Compliant
                                                    </span>
                                                    <span className="font-bold">
                                                        {f.non_compliant}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-yellow-600">
                                                        Partial
                                                    </span>
                                                    <span className="font-bold">
                                                        {f.partially_compliant}
                                                    </span>
                                                </div>
                                                <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                                                    {fTotal > 0 && (
                                                        <>
                                                            <div
                                                                className="h-full bg-red-500"
                                                                style={{
                                                                    width: `${(f.non_compliant / fTotal) * 100}%`,
                                                                }}
                                                            />
                                                            <div
                                                                className="h-full bg-yellow-400"
                                                                style={{
                                                                    width: `${(f.partially_compliant / fTotal) * 100}%`,
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

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-3">
                            <div className="relative min-w-[200px] flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search controls..."
                                    value={search}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                    ) => setSearch(e.target.value)}
                                    onKeyDown={(e: React.KeyboardEvent) =>
                                        e.key === 'Enter' &&
                                        applyFilters({ search })
                                    }
                                    className="pl-9"
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
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Framework" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Frameworks
                                    </SelectItem>
                                    {frameworks.map((f) => (
                                        <SelectItem
                                            key={f.id}
                                            value={String(f.id)}
                                        >
                                            {f.short_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={status}
                                onValueChange={(v: string) => {
                                    setStatus(v);
                                    applyFilters({
                                        status: v === 'all' ? '' : v,
                                    });
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Gaps
                                    </SelectItem>
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
                                    applyFilters({
                                        category: v === 'all' ? '' : v,
                                    });
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Categories
                                    </SelectItem>
                                    {categories.map((c) => (
                                        <SelectItem key={c} value={c}>
                                            {c}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                onClick={() => applyFilters({ search })}
                            >
                                Search
                            </Button>
                        </div>
                    </CardContent>
                </Card>

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
                                <XCircle className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                                <p className="font-medium text-gray-400">
                                    No gaps found
                                </p>
                                <p className="mt-1 text-sm text-gray-400">
                                    {total === 0
                                        ? 'Complete assessments to identify compliance gaps.'
                                        : 'No gaps match your current filters.'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {items.data.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                                            item.compliance_status ===
                                            'non_compliant'
                                                ? 'border-l-4 border-red-400'
                                                : 'border-l-4 border-yellow-400'
                                        } ${lastAnalyzed === item.id ? 'ring-2 ring-purple-400 ring-inset' : ''}`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                                    <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                        {
                                                            item.control
                                                                .control_id
                                                        }
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {
                                                            item.assessment
                                                                .framework
                                                                .short_name
                                                        }
                                                    </Badge>
                                                    <span className="text-xs text-gray-400">
                                                        {item.control.category}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {item.control.title}
                                                </p>
                                                <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                                                    {item.control.description}
                                                </p>
                                                {item.comments && (
                                                    <div className="mt-2 rounded bg-gray-50 p-2 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                        <span className="font-semibold">
                                                            Notes:{' '}
                                                        </span>
                                                        {item.comments}
                                                    </div>
                                                )}
                                                <p className="mt-2 text-xs text-gray-400">
                                                    Assessment:{' '}
                                                    <span className="font-medium">
                                                        {item.assessment.title}
                                                    </span>{' '}
                                                    ·{' '}
                                                    {item.assessment.user.name}
                                                </p>
                                            </div>
                                            <div className="flex flex-shrink-0 flex-col items-end gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        item.compliance_status ===
                                                        'non_compliant'
                                                            ? 'border-red-200 bg-red-50 text-red-600'
                                                            : 'border-yellow-200 bg-yellow-50 text-yellow-600'
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
                                                        disabled={
                                                            analyzing ===
                                                            item.id
                                                        }
                                                        onClick={() =>
                                                            handleAiFix(item)
                                                        }
                                                        className="gap-1 bg-purple-600 text-xs text-white hover:bg-purple-700 disabled:opacity-60"
                                                    >
                                                        {analyzing ===
                                                        item.id ? (
                                                            <>
                                                                <Loader2 className="h-3 w-3 animate-spin" />{' '}
                                                                Analyzing...
                                                            </>
                                                        ) : (
                                                            <>✨ AI Fix</>
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
                                                            className="gap-1 text-xs"
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
                    <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-purple-200 bg-white shadow-2xl dark:border-purple-800 dark:bg-gray-900">
                        {/* Modal Header */}
                        <div className="flex items-start justify-between border-b border-gray-100 p-5 dark:border-gray-800">
                            <div className="flex min-w-0 flex-1 items-start gap-2">
                                <span className="mt-0.5 text-lg leading-none text-purple-600">
                                    ✨
                                </span>
                                <div className="min-w-0">
                                    <h2 className="text-sm leading-snug font-bold text-gray-900 dark:text-white">
                                        AI Remediation Plan
                                    </h2>
                                    <p className="mt-0.5 truncate text-xs text-gray-500">
                                        {planModal.item.control.control_id}:{' '}
                                        {planModal.item.control.title}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setPlanModal(null)}
                                className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="flex-1 space-y-5 overflow-y-auto p-5">
                            {/* Summary */}
                            <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
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
                                <span className="text-xs text-gray-500">
                                    Estimated effort:{' '}
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        {planModal.plan.estimated_effort}
                                    </span>
                                </span>
                            </div>

                            {/* Quick Wins */}
                            {planModal.plan.quick_wins.length > 0 && (
                                <div>
                                    <p className="mb-2 text-xs font-semibold text-green-700 dark:text-green-400">
                                        ⚡ Quick Wins — Do These First
                                    </p>
                                    <div className="space-y-1.5">
                                        {planModal.plan.quick_wins.map(
                                            (win, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-start gap-2 rounded-lg bg-green-50 p-2.5 dark:bg-green-900/20"
                                                >
                                                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-600" />
                                                    <span className="text-xs text-green-800 dark:text-green-300">
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
                                    <p className="mb-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Remediation Steps
                                    </p>
                                    <div className="space-y-3">
                                        {planModal.plan.remediation_steps.map(
                                            (s) => (
                                                <div
                                                    key={s.step}
                                                    className="flex gap-3"
                                                >
                                                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                                                        {s.step}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {s.action}
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-gray-500">
                                                            {s.detail}
                                                        </p>
                                                        <div className="mt-1.5 rounded bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-gray-800">
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
                                    <p className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Resources Needed
                                    </p>
                                    <ul className="space-y-1">
                                        {planModal.plan.resources_needed.map(
                                            (r, i) => (
                                                <li
                                                    key={i}
                                                    className="flex items-start gap-1.5 text-xs text-gray-500"
                                                >
                                                    <span className="flex-shrink-0 text-gray-400">
                                                        •
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
                        <div className="border-t border-gray-100 p-4 dark:border-gray-800">
                            {savedRisk ? (
                                <div className="flex flex-col items-center gap-3 py-1">
                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                        <CheckCircle2 className="h-5 w-5" />
                                        <span className="text-sm font-semibold">
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
                                        className="w-full gap-2 bg-purple-600 py-2.5 text-sm font-semibold text-white hover:bg-purple-700"
                                    >
                                        View Risk Record{' '}
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                        Risk: {savedRisk.title}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between gap-3">
                                    <div className="text-xs">
                                        {saveError && (
                                            <span className="text-red-500">
                                                {saveError}
                                            </span>
                                        )}
                                        {saving && (
                                            <span className="text-gray-400">
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
                                            className="gap-1 bg-purple-600 text-white hover:bg-purple-700"
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
