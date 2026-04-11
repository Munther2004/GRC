import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    ArrowLeft,
    ArrowRight,
    Download,
    Search,
    TrendingUp,
    TrendingDown,
    Minus,
    ShieldCheck,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────

interface AssessmentMeta {
    id: number;
    title: string;
    date: string;
    framework: string;
    compliance_percentage: number;
}

interface ComparisonRow {
    control_id: number;
    control_code: string;
    control_name: string;
    framework: string;
    status_a: string;
    status_b: string;
    changed: boolean;
    direction: 'improved' | 'regressed' | 'unchanged' | 'new' | 'removed';
    evidence_verdict_a: string | null;
    evidence_verdict_b: string | null;
}

interface Summary {
    compliance_score_a: number;
    compliance_score_b: number;
    compliance_delta: number;
    total_controls: number;
    changed_count: number;
    improved_count: number;
    regressed_count: number;
    evidence_quality_a: number;
    evidence_quality_b: number;
    evidence_quality_delta: number;
}

interface Props {
    assessmentA: AssessmentMeta;
    assessmentB: AssessmentMeta;
    rows: ComparisonRow[];
    summary: Summary;
}

// ── Badge config maps ──────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; cls: string }> = {
    compliant:           { label: 'Compliant',     cls: 'bg-green-100 text-green-700 border-green-200' },
    partially_compliant: { label: 'Partial',       cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    non_compliant:       { label: 'Non-Compliant', cls: 'bg-red-100 text-red-700 border-red-200' },
    not_applicable:      { label: 'N/A',           cls: 'bg-gray-100 text-gray-500 border-gray-200' },
    not_assessed:        { label: 'Not Assessed',  cls: 'bg-gray-100 text-gray-400 border-gray-200' },
};

const directionConfig: Record<string, { label: string; cls: string }> = {
    improved:  { label: '↑ Improved',  cls: 'bg-green-100 text-green-700 border-green-200' },
    regressed: { label: '↓ Regressed', cls: 'bg-red-100 text-red-700 border-red-200' },
    unchanged: { label: '→ Unchanged', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
    new:       { label: '✦ New',       cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    removed:   { label: '✕ Removed',   cls: 'bg-gray-100 text-gray-500 border-gray-200' },
};

const verdictConfig: Record<string, { label: string; cls: string }> = {
    adequate:           { label: 'Adequate',      cls: 'bg-green-100 text-green-700 border-green-200' },
    partially_adequate: { label: 'Partial',       cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    insufficient:       { label: 'Insufficient',  cls: 'bg-red-100 text-red-700 border-red-200' },
};

// ── Helper components ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const cfg = statusConfig[status] ?? { label: status, cls: 'bg-gray-100 text-gray-500 border-gray-200' };
    return (
        <Badge variant="outline" className={cn('text-xs whitespace-nowrap', cfg.cls)}>
            {cfg.label}
        </Badge>
    );
}

function DirectionBadge({ direction }: { direction: string }) {
    const cfg = directionConfig[direction] ?? { label: direction, cls: 'bg-gray-100 text-gray-500' };
    return (
        <Badge variant="outline" className={cn('text-xs font-semibold whitespace-nowrap', cfg.cls)}>
            {cfg.label}
        </Badge>
    );
}

function VerdictBadge({ verdict }: { verdict: string | null }) {
    if (!verdict) {
        return <span className="text-xs text-gray-400">—</span>;
    }
    const cfg = verdictConfig[verdict] ?? { label: verdict, cls: 'bg-gray-100 text-gray-500' };
    return (
        <Badge variant="outline" className={cn('text-xs', cfg.cls)}>
            {cfg.label}
        </Badge>
    );
}

function DeltaChip({ delta, suffix = '' }: { delta: number; suffix?: string }) {
    if (delta === 0) return <span className="text-xs text-gray-500 font-medium">No change</span>;
    const positive = delta > 0;
    return (
        <span className={cn('text-xs font-bold', positive ? 'text-green-600' : 'text-red-600')}>
            {positive ? '+' : ''}{delta}{suffix}
        </span>
    );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function CompareResult({ assessmentA, assessmentB, rows, summary }: Props) {
    const [filterDir, setFilterDir]   = useState<string>('all');
    const [search, setSearch]         = useState('');
    const [frameworkFilter, setFw]    = useState<string>('all');

    // Unique frameworks in this comparison
    const frameworks = useMemo(() => {
        const set = new Set(rows.map(r => r.framework));
        return Array.from(set).sort();
    }, [rows]);

    const multipleFrameworks = frameworks.length > 1;

    // Client-side filtering
    const filtered = useMemo(() => {
        return rows.filter(row => {
            if (filterDir !== 'all' && row.direction !== filterDir) return false;
            if (frameworkFilter !== 'all' && row.framework !== frameworkFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                if (
                    !row.control_code.toLowerCase().includes(q) &&
                    !row.control_name.toLowerCase().includes(q)
                ) return false;
            }
            return true;
        });
    }, [rows, filterDir, search, frameworkFilter]);

    // Net change indicator
    const netChange = summary.compliance_delta > 0
        ? { label: 'Overall Improved', cls: 'bg-green-100 text-green-700 border-green-200' }
        : summary.compliance_delta < 0
        ? { label: 'Overall Regressed', cls: 'bg-red-100 text-red-700 border-red-200' }
        : { label: 'No Change', cls: 'bg-gray-100 text-gray-600 border-gray-200' };

    const exportUrl = `/assessments/compare/export?assessment_a_id=${assessmentA.id}&assessment_b_id=${assessmentB.id}`;

    return (
        <AdminLayout>
            <Head title={`Compare: ${assessmentA.title} vs ${assessmentB.title}`} />

            <div className="space-y-6">

                {/* Top nav */}
                <div className="flex items-center justify-between gap-4">
                    <Link href="/assessments/compare">
                        <Button variant="ghost" size="sm" className="gap-1 text-gray-500">
                            <ArrowLeft className="w-4 h-4" /> Change Selection
                        </Button>
                    </Link>
                    <a href={exportUrl} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Download className="w-4 h-4" /> Export PDF
                        </Button>
                    </a>
                </div>

                {/* Header "A vs B" */}
                <div className="rounded-xl border bg-white dark:bg-gray-900 p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-center">
                        <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Baseline (A)</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{assessmentA.title}</p>
                            <div className="flex items-center justify-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">{assessmentA.framework}</Badge>
                                <span className="text-xs text-gray-400">{assessmentA.date}</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-0.5 px-4">
                            <ArrowRight className="w-6 h-6 text-gray-300" />
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">vs</span>
                        </div>

                        <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Latest (B)</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{assessmentB.title}</p>
                            <div className="flex items-center justify-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">{assessmentB.framework}</Badge>
                                <span className="text-xs text-gray-400">{assessmentB.date}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">

                    {/* Compliance Score */}
                    <Card className="col-span-2 md:col-span-1">
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Compliance Score</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-gray-700 dark:text-gray-200">
                                    {summary.compliance_score_a}%
                                </span>
                                <ArrowRight className="w-4 h-4 text-gray-300" />
                                <span className="text-xl font-bold text-gray-900 dark:text-white">
                                    {summary.compliance_score_b}%
                                </span>
                            </div>
                            <div className="mt-1">
                                <DeltaChip delta={summary.compliance_delta} suffix="%" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Controls Changed */}
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Controls Changed</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.changed_count}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                <span className="text-green-600 font-medium">{summary.improved_count}↑</span>
                                {' / '}
                                <span className="text-red-600 font-medium">{summary.regressed_count}↓</span>
                            </p>
                        </CardContent>
                    </Card>

                    {/* Evidence Quality */}
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Evidence Quality</p>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-gray-700 dark:text-gray-200">
                                    {summary.evidence_quality_a}%
                                </span>
                                <ArrowRight className="w-3 h-3 text-gray-300" />
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                    {summary.evidence_quality_b}%
                                </span>
                            </div>
                            <div className="mt-1">
                                <DeltaChip delta={summary.evidence_quality_delta} suffix="%" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Controls */}
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Controls</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total_controls}</p>
                            <p className="text-xs text-gray-500 mt-1">across both assessments</p>
                        </CardContent>
                    </Card>

                    {/* Net Change */}
                    <Card>
                        <CardContent className="p-4 flex flex-col items-start justify-center h-full">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Net Change</p>
                            <Badge variant="outline" className={cn('text-xs font-semibold px-2 py-1', netChange.cls)}>
                                {summary.compliance_delta > 0 && <TrendingUp className="w-3 h-3 inline mr-1" />}
                                {summary.compliance_delta < 0 && <TrendingDown className="w-3 h-3 inline mr-1" />}
                                {summary.compliance_delta === 0 && <Minus className="w-3 h-3 inline mr-1" />}
                                {netChange.label}
                            </Badge>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Bar */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-3">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search control code or name…"
                                    value={search}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            {/* Direction filter */}
                            <Select value={filterDir} onValueChange={setFilterDir}>
                                <SelectTrigger className="w-[170px]">
                                    <SelectValue placeholder="Show" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Controls</SelectItem>
                                    <SelectItem value="improved">↑ Improved</SelectItem>
                                    <SelectItem value="regressed">↓ Regressed</SelectItem>
                                    <SelectItem value="unchanged">→ Unchanged</SelectItem>
                                    <SelectItem value="new">✦ New</SelectItem>
                                    <SelectItem value="removed">✕ Removed</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Framework filter — only if multiple */}
                            {multipleFrameworks && (
                                <Select value={frameworkFilter} onValueChange={setFw}>
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="Framework" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Frameworks</SelectItem>
                                        {frameworks.map(fw => (
                                            <SelectItem key={fw} value={fw}>{fw}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {/* Clear */}
                            {(filterDir !== 'all' || search || frameworkFilter !== 'all') && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => { setFilterDir('all'); setSearch(''); setFw('all'); }}
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Comparison Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Control
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Framework
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Status A
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Status B
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Change
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Evidence A
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Evidence B
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                                                No controls match the current filters.
                                            </td>
                                        </tr>
                                    ) : filtered.map(row => (
                                        <tr
                                            key={row.control_id}
                                            className={cn(
                                                'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
                                                row.direction === 'improved'  && 'border-l-2 border-l-green-500',
                                                row.direction === 'regressed' && 'border-l-2 border-l-red-500',
                                            )}
                                        >
                                            {/* Control */}
                                            <td className="px-4 py-3">
                                                <p className="font-mono text-xs text-gray-500">{row.control_code}</p>
                                                <p className="font-medium text-gray-900 dark:text-white max-w-[260px] truncate">
                                                    {row.control_name}
                                                </p>
                                            </td>

                                            {/* Framework */}
                                            <td className="px-3 py-3">
                                                <Badge variant="outline" className="text-xs">{row.framework}</Badge>
                                            </td>

                                            {/* Status A */}
                                            <td className="px-3 py-3">
                                                <StatusBadge status={row.status_a} />
                                            </td>

                                            {/* Status B */}
                                            <td className="px-3 py-3">
                                                <StatusBadge status={row.status_b} />
                                            </td>

                                            {/* Direction */}
                                            <td className="px-3 py-3">
                                                <DirectionBadge direction={row.direction} />
                                            </td>

                                            {/* Evidence A */}
                                            <td className="px-3 py-3">
                                                <VerdictBadge verdict={row.evidence_verdict_a} />
                                            </td>

                                            {/* Evidence B */}
                                            <td className="px-3 py-3">
                                                <VerdictBadge verdict={row.evidence_verdict_b} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Row count */}
                        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
                            Showing {filtered.length} of {rows.length} control{rows.length !== 1 ? 's' : ''}
                            {filterDir !== 'all' || search || frameworkFilter !== 'all'
                                ? ' (filtered)'
                                : ''}
                        </div>
                    </CardContent>
                </Card>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 items-center text-xs text-gray-500 pb-4">
                    <ShieldCheck className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-400">Legend:</span>
                    {Object.entries(directionConfig).map(([key, cfg]) => (
                        <span key={key} className={cn('px-2 py-0.5 rounded-full border text-[11px] font-medium', cfg.cls)}>
                            {cfg.label}
                        </span>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
