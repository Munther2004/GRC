import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Eye,
    Trash2,
    PlayCircle,
    AlertTriangle,
    GitCompare,
    Plus,
} from 'lucide-react';
import { useState } from 'react';
import { CorporationFilter } from '@/components/corporation-filter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
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
import type { SharedProps } from '@/types';

interface Assessment {
    id: number;
    title: string;
    status: string;
    compliance_percentage: number;
    evidence_weighted_score: number | null;
    period: string;
    due_date: string | null;
    created_at: string;
    items_count: number;
    user: { name: string };
    framework: { name: string; short_name: string };
}

interface Props {
    assessments: {
        data: Assessment[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    frameworks: { id: number; name: string; short_name: string }[];
    stats: {
        total: number;
        in_progress: number;
        completed: number;
        avg_compliance: number;
    };
    filters: { search?: string; status?: string; framework_id?: string };
}

const statusColors: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground border-border',
    in_progress: 'bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary border-[color-mix(in_srgb,var(--primary)_25%,transparent)]',
    submitted: 'bg-[rgba(245,185,41,0.12)] text-[#f5b929] border-[rgba(245,185,41,0.4)]',
    completed: 'bg-[rgba(70,189,95,0.12)] text-[#46bd5f] border-[rgba(70,189,95,0.4)]',
};

const complianceColor = (pct: number) => {
    if (pct >= 80) return 'text-[#46bd5f]';
    if (pct >= 50) return 'text-[#f5b929]';
    return 'text-[#e5484d]';
};

export default function AssessmentsIndex({
    assessments,
    frameworks,
    stats,
    filters,
}: Props) {
    const { auth } = usePage<SharedProps>().props;
    const isAdmin = auth.user.role === 'super_admin' || auth.user.role === 'admin';
    const canEdit = auth.user.role === 'super_admin' || auth.user.role === 'admin' || auth.user.role === 'user';

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [frameworkId, setFramework] = useState(filters.framework_id ?? 'all');
    const [deleteModal, setDeleteModal] = useState<Assessment | null>(null);
    const [deleting, setDeleting] = useState(false);

    const applyFilters = (overrides: Record<string, string> = {}) => {
        router.get(
            route('assessments.index'),
            {
                search,
                status: status === 'all' ? '' : status,
                framework_id: frameworkId === 'all' ? '' : frameworkId,
                ...overrides,
            },
            { preserveState: true, replace: true },
        );
    };

    const confirmDelete = () => {
        if (!deleteModal || deleting) return;
        setDeleting(true);
        router.delete(route('assessments.destroy', deleteModal.id), {
            onSuccess: () => {
                setDeleteModal(null);
                setDeleting(false);
            },
            onError: () => setDeleting(false),
        });
    };

    return (
        <AdminLayout>
            <Head title="Assessments" />

            <div className="space-y-6">
                <PageHeader
                    title="Assessments"
                    description="Self-assessment questionnaires per framework"
                >
                    <CorporationFilter />
                    <Link href="/assessments/compare">
                        <Button variant="outline" size="sm" className="gap-2">
                            <GitCompare className="h-3.5 w-3.5" /> Compare
                        </Button>
                    </Link>
                    {canEdit && (
                        <Link href={route('assessments.create')}>
                            <Button size="sm" className="gap-2">
                                <Plus className="h-3.5 w-3.5" /> New Assessment
                            </Button>
                        </Link>
                    )}
                </PageHeader>

                <StatStrip
                    stats={[
                        { label: 'Total', value: stats.total, tone: 'neutral' },
                        {
                            label: 'In Progress',
                            value: stats.in_progress,
                            tone: stats.in_progress > 0 ? 'warn' : 'neutral',
                        },
                        {
                            label: 'Completed',
                            value: stats.completed,
                            tone: 'ok',
                        },
                        {
                            label: 'Avg Compliance',
                            value: `${stats.avg_compliance}%`,
                            tone:
                                stats.avg_compliance >= 70
                                    ? 'ok'
                                    : stats.avg_compliance >= 40
                                      ? 'warn'
                                      : 'bad',
                        },
                    ]}
                />

                <FilterBar>
                    <div className="relative min-w-44 flex-1">
                        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
                            <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                        </span>
                        <Input
                            placeholder="Search assessments..."
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
                        value={status}
                        onValueChange={(v: string) => {
                            setStatus(v);
                            applyFilters({ status: v === 'all' ? '' : v });
                        }}
                    >
                        <SelectTrigger className="h-8 w-36 text-sm">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="in_progress">
                                In Progress
                            </SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={frameworkId}
                        onValueChange={(v: string) => {
                            setFramework(v);
                            applyFilters({
                                framework_id: v === 'all' ? '' : v,
                            });
                        }}
                    >
                        <SelectTrigger className="h-8 w-44 text-sm">
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
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => applyFilters({ search })}
                    >
                        Search
                    </Button>
                </FilterBar>

                {/* Table */}
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">
                            {assessments.total} assessment
                            {assessments.total !== 1 ? 's' : ''}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="mt-4 p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-y border-border bg-muted/30">
                                    <tr>
                                        {[
                                            'Assessment',
                                            'Framework',
                                            'Period',
                                            'Self-Assessed',
                                            'Evidence Score',
                                            'Status',
                                            'Due Date',
                                            'Actions',
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className="px-4 py-3 text-left text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {assessments.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="px-4 py-12 text-center text-muted-foreground"
                                            >
                                                No assessments found.{' '}
                                                <Link
                                                    href={route(
                                                        'assessments.create',
                                                    )}
                                                    className="text-primary hover:underline"
                                                >
                                                    Create one.
                                                </Link>
                                            </td>
                                        </tr>
                                    ) : (
                                        assessments.data.map((a) => (
                                            <tr
                                                key={a.id}
                                                className="transition-colors hover:bg-accent/30"
                                            >
                                                <td className="px-4 py-3">
                                                    <p className="max-w-[220px] truncate font-medium text-foreground">
                                                        {a.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {a.user?.name}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {
                                                            a.framework
                                                                ?.short_name
                                                        }
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-foreground/80">
                                                    {a.period}
                                                </td>
                                                {/* Self-Assessed column */}
                                                <td className="px-4 py-3">
                                                    {a.status === 'draft' ? (
                                                        <span className="text-xs text-muted-foreground">
                                                            Not started
                                                        </span>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                                                                <div
                                                                    className="h-full rounded-full bg-primary"
                                                                    style={{
                                                                        width: `${a.compliance_percentage}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <span
                                                                className={`text-sm font-medium ${complianceColor(a.compliance_percentage)}`}
                                                            >
                                                                {
                                                                    a.compliance_percentage
                                                                }
                                                                %
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Evidence Score column */}
                                                <td className="px-4 py-3">
                                                    {a.evidence_weighted_score !==
                                                    null ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                                                                <div
                                                                    className="h-full rounded-full"
                                                                    style={{
                                                                        width: `${a.evidence_weighted_score}%`,
                                                                        background: a.evidence_weighted_score >= 70 ? '#46bd5f' : a.evidence_weighted_score >= 40 ? '#f5b929' : '#e5484d',
                                                                    }}
                                                                />
                                                            </div>
                                                            <span
                                                                className="text-sm tabular-nums"
                                                                style={{ color: a.evidence_weighted_score >= 70 ? '#46bd5f' : a.evidence_weighted_score >= 40 ? '#f5b929' : '#e5484d', fontWeight: 500 }}
                                                            >
                                                                {
                                                                    a.evidence_weighted_score
                                                                }
                                                                %
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            Pending review
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className={`capitalize ${statusColors[a.status]}`}
                                                    >
                                                        {a.status.replace(
                                                            '_',
                                                            ' ',
                                                        )}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-foreground/80">
                                                    {a.due_date
                                                        ? new Date(
                                                              a.due_date,
                                                          ).toLocaleDateString()
                                                        : '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        {canEdit &&
                                                            a.status !==
                                                                'completed' && (
                                                                <Link
                                                                    href={route(
                                                                        'assessments.questionnaire',
                                                                        a.id,
                                                                    )}
                                                                >
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-primary"
                                                                        title="Open Questionnaire"
                                                                    >
                                                                        <PlayCircle className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                        <Link
                                                            href={route(
                                                                'assessments.show',
                                                                a.id,
                                                            )}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        {isAdmin && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                style={{ color: 'var(--destructive)' }}
                                                                onClick={() =>
                                                                    setDeleteModal(
                                                                        a,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {assessments.links.length > 3 && (
                            <div className="flex items-center justify-center gap-1 border-t p-4">
                                {assessments.links.map((link, i) => (
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

            {/* ── Delete Confirmation Modal ───────────────────────────────────── */}
            <Dialog
                open={!!deleteModal}
                onOpenChange={(open) => {
                    if (!open && !deleting) setDeleteModal(null);
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogDescription className="sr-only">
                        Delete assessment confirmation dialog
                    </DialogDescription>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2" style={{ color: 'var(--destructive)' }}>
                            <Trash2 className="h-4 w-4" /> Delete Assessment
                        </DialogTitle>
                    </DialogHeader>

                    {deleteModal && (
                        <div className="space-y-4 py-1">
                            {/* Assessment info */}
                            <div className="rounded-2xl border p-3" style={{ background: 'color-mix(in srgb, var(--muted) 30%, transparent)' }}>
                                <p className="text-lg" style={{ fontWeight: 500 }}>
                                    {deleteModal.title}
                                </p>
                                <p className="mt-0.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                    {deleteModal.framework.short_name} &middot;{' '}
                                    {deleteModal.items_count} control
                                    {deleteModal.items_count !== 1 ? 's' : ''}{' '}
                                    &middot; Created{' '}
                                    {new Date(
                                        deleteModal.created_at,
                                    ).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Warning */}
                            <div className="flex items-start gap-2 rounded-2xl border p-3" style={{ borderColor: 'color-mix(in srgb, var(--destructive) 30%, transparent)', background: 'color-mix(in srgb, var(--destructive) 8%, transparent)' }}>
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--destructive)' }} />
                                <p className="text-sm" style={{ color: 'var(--destructive)' }}>
                                    Deleting this assessment will reset all{' '}
                                    {deleteModal.items_count} control status
                                    {deleteModal.items_count !== 1 ? 'es' : ''}{' '}
                                    to Not Set in the Controls Hub. This action
                                    cannot be undone.
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex-wrap gap-2 sm:gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteModal(null)}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => confirmDelete()}
                            disabled={deleting}
                        >
                            Delete Assessment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
