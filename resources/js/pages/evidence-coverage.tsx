import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    CheckCircle2,
    Clock,
    Search,
    ShieldAlert,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { route } from '@/lib/routes';

type CoverageStatus =
    | 'fully_covered'
    | 'partially_covered'
    | 'insufficient'
    | 'no_evidence'
    | 'expiring';

type ExpiryStatus = 'valid' | 'expiring' | 'expired' | 'no_expiry' | 'none';

type SortKey = 'control_id' | 'evidence_count' | 'coverage_status' | 'framework';

type SortDirection = 'asc' | 'desc';

interface ControlRow {
    id: number;
    control_id: string;
    title: string;
    framework: { id: number; short_name: string; name: string } | null;
    evidence_count: number;
    ai_verdict: 'Adequate' | 'Partially Adequate' | 'Insufficient' | null;
    ai_confidence: 'High' | 'Medium' | 'Low' | null;
    expiry_status: ExpiryStatus;
    coverage_status: CoverageStatus;
}

interface PaginatorLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    controls: {
        data: ControlRow[];
        links: PaginatorLink[];
        from: number | null;
        to: number | null;
        total: number;
        current_page: number;
        last_page: number;
    };
    frameworks: { id: number; short_name: string; name: string }[];
    assessments: { id: number; title: string }[];
    stats: {
        total: number;
        fully_covered: number;
        fully_covered_pct: number;
        no_evidence: number;
        insufficient: number;
        expiring: number;
        partially_covered: number;
    };
    filters: {
        search: string;
        framework: string;
        assessment: string;
        coverage: string;
        sort: SortKey;
        direction: SortDirection;
    };
}

const COVERAGE_OPTIONS: { value: 'all' | CoverageStatus; label: string }[] = [
    { value: 'all', label: 'All coverage' },
    { value: 'fully_covered', label: 'Fully Covered' },
    { value: 'partially_covered', label: 'Partially Covered' },
    { value: 'insufficient', label: 'Insufficient' },
    { value: 'no_evidence', label: 'No Evidence' },
    { value: 'expiring', label: 'Expiring' },
];

function CoverageBadge({ status }: { status: CoverageStatus }) {
    switch (status) {
        case 'fully_covered':
            return (
                <Badge
                    variant="outline"
                    className="gap-1 border-green-300 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
                >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Fully Covered
                </Badge>
            );
        case 'partially_covered':
            return (
                <Badge
                    variant="outline"
                    className="gap-1 border-yellow-300 bg-yellow-100 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400"
                >
                    <Clock className="h-3.5 w-3.5" /> Partially Covered
                </Badge>
            );
        case 'insufficient':
            return (
                <Badge
                    variant="outline"
                    className="gap-1 border-orange-300 bg-orange-100 text-orange-700 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-400"
                >
                    <ShieldAlert className="h-3.5 w-3.5" /> Insufficient
                </Badge>
            );
        case 'no_evidence':
            return (
                <Badge
                    variant="outline"
                    className="gap-1 border-red-300 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
                >
                    <XCircle className="h-3.5 w-3.5" /> No Evidence
                </Badge>
            );
        case 'expiring':
            return (
                <Badge
                    variant="outline"
                    className="gap-1 border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                >
                    <AlertTriangle className="h-3.5 w-3.5" /> Expiring
                </Badge>
            );
    }
}

function ExpiryCell({ status }: { status: ExpiryStatus }) {
    switch (status) {
        case 'valid':
            return <span className="text-green-600 dark:text-green-400">Valid</span>;
        case 'expiring':
            return <span className="text-amber-600 dark:text-amber-400">Expiring Soon</span>;
        case 'expired':
            return <span className="text-red-600 dark:text-red-400">Expired</span>;
        case 'no_expiry':
            return <span className="text-muted-foreground">No expiry set</span>;
        case 'none':
        default:
            return <span className="text-muted-foreground">—</span>;
    }
}

function VerdictCell({
    verdict,
}: {
    verdict: ControlRow['ai_verdict'];
}) {
    if (!verdict) {
        return <span className="text-xs italic text-muted-foreground">Not reviewed</span>;
    }
    const tone =
        verdict === 'Adequate'
            ? 'text-green-600 dark:text-green-400'
            : verdict === 'Partially Adequate'
              ? 'text-yellow-600 dark:text-yellow-400'
              : 'text-red-600 dark:text-red-400';
    return <span className={`text-xs font-medium ${tone}`}>{verdict}</span>;
}

function ConfidenceCell({ confidence }: { confidence: ControlRow['ai_confidence'] }) {
    if (!confidence) {
        return <span className="text-muted-foreground">—</span>;
    }
    return <span className="text-xs">{confidence}</span>;
}

function SortHeader({
    label,
    columnKey,
    activeSort,
    activeDirection,
    onSort,
    align = 'left',
}: {
    label: string;
    columnKey: SortKey;
    activeSort: SortKey;
    activeDirection: SortDirection;
    onSort: (key: SortKey) => void;
    align?: 'left' | 'right';
}) {
    const isActive = activeSort === columnKey;
    const Icon = !isActive
        ? ArrowUpDown
        : activeDirection === 'asc'
          ? ArrowUp
          : ArrowDown;

    return (
        <button
            type="button"
            onClick={() => onSort(columnKey)}
            className={`inline-flex w-full items-center gap-1 ${
                align === 'right' ? 'justify-end' : 'justify-start'
            } text-[11px] font-medium uppercase tracking-wide ${
                isActive ? 'text-foreground' : 'text-muted-foreground'
            } hover:text-foreground`}
        >
            <span>{label}</span>
            <Icon className="h-3 w-3" />
        </button>
    );
}

export default function EvidenceCoverage({
    controls,
    frameworks,
    assessments,
    stats,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [framework, setFramework] = useState(filters.framework ?? 'all');
    const [assessment, setAssessment] = useState(filters.assessment ?? 'all');
    const [coverage, setCoverage] = useState(filters.coverage ?? 'all');

    // Debounced search
    useEffect(() => {
        if (search === filters.search) return;
        const t = setTimeout(() => {
            applyFilters({ search });
        }, 300);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    function applyFilters(overrides: Partial<Props['filters']> = {}) {
        const params = {
            search,
            framework,
            assessment,
            coverage,
            sort: filters.sort,
            direction: filters.direction,
            ...overrides,
        };
        router.get(route('evidence-coverage.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    function onFrameworkChange(value: string) {
        setFramework(value);
        applyFilters({ framework: value });
    }

    function onAssessmentChange(value: string) {
        setAssessment(value);
        applyFilters({ assessment: value });
    }

    function onCoverageChange(value: string) {
        setCoverage(value);
        applyFilters({ coverage: value });
    }

    function onSort(columnKey: SortKey) {
        const nextDirection: SortDirection =
            filters.sort === columnKey && filters.direction === 'asc'
                ? 'desc'
                : 'asc';
        applyFilters({ sort: columnKey, direction: nextDirection });
    }

    function clearAll() {
        setSearch('');
        setFramework('all');
        setAssessment('all');
        setCoverage('all');
        router.get(
            route('evidence-coverage.index'),
            {},
            { preserveScroll: true, replace: true },
        );
    }

    const hasActiveFilters =
        search !== '' ||
        framework !== 'all' ||
        assessment !== 'all' ||
        coverage !== 'all';

    return (
        <AdminLayout>
            <Head title="Evidence Coverage" />

            <div className="space-y-6">
                <PageHeader
                    title="Evidence Coverage Matrix"
                    description="Per-control view of evidence count, AI verdict, expiry, and overall coverage."
                />

                <StatStrip
                    stats={[
                        { label: 'Total Controls', value: stats.total, tone: 'neutral' },
                        {
                            label: 'Fully Covered',
                            value: `${stats.fully_covered} (${stats.fully_covered_pct}%)`,
                            tone: stats.fully_covered > 0 ? 'ok' : 'neutral',
                        },
                        {
                            label: 'No Evidence',
                            value: stats.no_evidence,
                            tone: stats.no_evidence > 0 ? 'bad' : 'neutral',
                        },
                        {
                            label: 'Insufficient',
                            value: stats.insufficient,
                            tone: stats.insufficient > 0 ? 'bad' : 'neutral',
                        },
                        {
                            label: 'Expiring Soon',
                            value: stats.expiring,
                            tone: stats.expiring > 0 ? 'warn' : 'neutral',
                        },
                    ]}
                />

                <FilterBar>
                    <div className="relative min-w-[220px] flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by control code or name…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <Select value={framework} onValueChange={onFrameworkChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All frameworks" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All frameworks</SelectItem>
                            {frameworks.map((f) => (
                                <SelectItem key={f.id} value={String(f.id)}>
                                    {f.short_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={assessment} onValueChange={onAssessmentChange}>
                        <SelectTrigger className="w-[240px]">
                            <SelectValue placeholder="All assessments" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All assessments</SelectItem>
                            {assessments.map((a) => (
                                <SelectItem key={a.id} value={String(a.id)}>
                                    {a.title}
                                </SelectItem>
                            ))}
                            {assessments.length === 0 && (
                                <SelectItem value="__none" disabled>
                                    No assessments yet
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>

                    <Select value={coverage} onValueChange={onCoverageChange}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="All coverage" />
                        </SelectTrigger>
                        <SelectContent>
                            {COVERAGE_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={clearAll}
                            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                        >
                            Clear filters
                        </button>
                    )}
                </FilterBar>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <SortHeader
                                            label="Code"
                                            columnKey="control_id"
                                            activeSort={filters.sort}
                                            activeDirection={filters.direction}
                                            onSort={onSort}
                                        />
                                    </TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>
                                        <SortHeader
                                            label="Framework"
                                            columnKey="framework"
                                            activeSort={filters.sort}
                                            activeDirection={filters.direction}
                                            onSort={onSort}
                                        />
                                    </TableHead>
                                    <TableHead className="text-right">
                                        <SortHeader
                                            label="Evidence"
                                            columnKey="evidence_count"
                                            activeSort={filters.sort}
                                            activeDirection={filters.direction}
                                            onSort={onSort}
                                            align="right"
                                        />
                                    </TableHead>
                                    <TableHead>AI Verdict</TableHead>
                                    <TableHead>Confidence</TableHead>
                                    <TableHead>Expiry</TableHead>
                                    <TableHead>
                                        <SortHeader
                                            label="Coverage"
                                            columnKey="coverage_status"
                                            activeSort={filters.sort}
                                            activeDirection={filters.direction}
                                            onSort={onSort}
                                        />
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {controls.data.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="py-12 text-center text-sm text-muted-foreground"
                                        >
                                            No controls match the current filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {controls.data.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="font-mono text-xs">
                                            {row.control_id}
                                        </TableCell>
                                        <TableCell className="max-w-[360px] truncate text-sm">
                                            {row.title}
                                        </TableCell>
                                        <TableCell>
                                            {row.framework ? (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {row.framework.short_name}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-xs">
                                            {row.evidence_count}
                                        </TableCell>
                                        <TableCell>
                                            <VerdictCell
                                                verdict={row.ai_verdict}
                                            />
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            <ConfidenceCell
                                                confidence={row.ai_confidence}
                                            />
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            <ExpiryCell
                                                status={row.expiry_status}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <CoverageBadge
                                                status={row.coverage_status}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination footer */}
                {controls.last_page > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                        <p>
                            Showing {controls.from ?? 0}–{controls.to ?? 0} of{' '}
                            {controls.total} controls
                        </p>
                        <div className="flex flex-wrap items-center gap-1">
                            {controls.links.map((link, i) =>
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        preserveScroll
                                        preserveState
                                        replace
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                        className={`rounded border border-border px-2.5 py-1 text-xs transition-colors hover:bg-accent ${
                                            link.active
                                                ? 'bg-primary/10 text-foreground'
                                                : ''
                                        }`}
                                    />
                                ) : (
                                    <span
                                        key={i}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                        className="rounded border border-border px-2.5 py-1 text-xs text-muted-foreground/60"
                                    />
                                ),
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
