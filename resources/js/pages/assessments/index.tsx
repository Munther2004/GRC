import { Head, Link, router, usePage } from '@inertiajs/react';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, ClipboardList, CheckCircle, Clock, TrendingUp, Eye, Trash2, PlayCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface Assessment {
    id: number;
    title: string;
    status: string;
    compliance_percentage: number;
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
    stats: { total: number; in_progress: number; completed: number; avg_compliance: number };
    filters: { search?: string; status?: string; framework_id?: string };
}

const statusColors: Record<string, string> = {
    draft:       'bg-gray-100 text-gray-600 border-gray-200',
    in_progress: 'bg-blue-50 text-blue-600 border-blue-200',
    submitted:   'bg-yellow-50 text-yellow-600 border-yellow-200',
    completed:   'bg-green-50 text-green-600 border-green-200',
};

const complianceColor = (pct: number) => {
    if (pct >= 80) return 'text-green-600';
    if (pct >= 50) return 'text-yellow-600';
    return 'text-red-500';
};

export default function AssessmentsIndex({ assessments, frameworks, stats, filters }: Props) {
    const { auth } = usePage().props as any;
    const isAdmin  = auth.user.role === 'admin';
    const canEdit  = auth.user.role === 'admin' || auth.user.role === 'user';

    const [search, setSearch]         = useState(filters.search ?? '');
    const [status, setStatus]         = useState(filters.status ?? 'all');
    const [frameworkId, setFramework] = useState(filters.framework_id ?? 'all');
    const [deleteModal, setDeleteModal] = useState<Assessment | null>(null);
    const [deleting, setDeleting]       = useState(false);

    const applyFilters = (overrides: Record<string, string> = {}) => {
        router.get(route('assessments.index'), {
            search,
            status:       status      === 'all' ? '' : status,
            framework_id: frameworkId === 'all' ? '' : frameworkId,
            ...overrides,
        }, { preserveState: true, replace: true });
    };

    const confirmDelete = (resetControls: boolean) => {
        if (!deleteModal || deleting) return;
        setDeleting(true);
        router.delete(route('assessments.destroy', deleteModal.id), {
            data: { reset_controls: resetControls },
            onSuccess: () => { setDeleteModal(null); setDeleting(false); },
            onError:   () => setDeleting(false),
        });
    };

    return (
        <AdminLayout>
            <Head title="Assessments" />

            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Compliance Assessments</h1>
                        <p className="text-sm text-gray-500 mt-1">Self-assessment questionnaires per framework</p>
                    </div>
                    {canEdit && (
                        <Link href={route('assessments.create')}>
                            <Button className="gap-2"><Plus className="w-4 h-4" /> New Assessment</Button>
                        </Link>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total',        value: stats.total,          icon: ClipboardList, color: 'text-blue-500' },
                        { label: 'In Progress',  value: stats.in_progress,    icon: Clock,         color: 'text-yellow-500' },
                        { label: 'Completed',    value: stats.completed,      icon: CheckCircle,   color: 'text-green-500' },
                        { label: 'Avg Compliance', value: `${stats.avg_compliance}%`, icon: TrendingUp, color: 'text-purple-500' },
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
                                    placeholder="Search assessments..."
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
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={frameworkId} onValueChange={(v: string) => { setFramework(v); applyFilters({ framework_id: v === 'all' ? '' : v }); }}>
                                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Framework" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Frameworks</SelectItem>
                                    {frameworks.map(f => (
                                        <SelectItem key={f.id} value={String(f.id)}>{f.short_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={() => applyFilters({ search })}>Search</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">{assessments.total} assessment{assessments.total !== 1 ? 's' : ''}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 mt-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
                                    <tr>
                                        {['Assessment', 'Framework', 'Period', 'Compliance', 'Status', 'Due Date', 'Actions'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {assessments.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                                                No assessments found. <Link href={route('assessments.create')} className="text-blue-500 hover:underline">Create one.</Link>
                                            </td>
                                        </tr>
                                    ) : assessments.data.map(a => (
                                        <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900 dark:text-white max-w-[220px] truncate">{a.title}</p>
                                                <p className="text-xs text-gray-400">{a.user?.name}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className="text-xs">{a.framework?.short_name}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{a.period}</td>
                                            <td className="px-4 py-3">
                                                {a.status === 'draft' ? (
                                                    <span className="text-gray-400 text-xs">Not started</span>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full bg-blue-500"
                                                                style={{ width: `${a.compliance_percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className={`text-sm font-semibold ${complianceColor(a.compliance_percentage)}`}>
                                                            {a.compliance_percentage}%
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className={`capitalize ${statusColors[a.status]}`}>
                                                    {a.status.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                {a.due_date ? new Date(a.due_date).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    {canEdit && a.status !== 'completed' && (
                                                        <Link href={route('assessments.questionnaire', a.id)}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" title="Open Questionnaire">
                                                                <PlayCircle className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    <Link href={route('assessments.show', a.id)}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    {isAdmin && (
                                                        <Button
                                                            variant="ghost" size="icon"
                                                            className="h-8 w-8 text-red-500 hover:bg-red-50"
                                                            onClick={() => setDeleteModal(a)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {assessments.links.length > 3 && (
                            <div className="flex items-center justify-center gap-1 p-4 border-t">
                                {assessments.links.map((link, i) => (
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

            {/* ── Delete Confirmation Modal ───────────────────────────────────── */}
            <Dialog open={!!deleteModal} onOpenChange={open => { if (!open && !deleting) setDeleteModal(null); }}>
                <DialogContent className="max-w-md" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="w-4 h-4" /> Delete Assessment
                        </DialogTitle>
                    </DialogHeader>

                    {deleteModal && (
                        <div className="space-y-4 py-1">
                            {/* Assessment info */}
                            <div className="rounded-lg border bg-gray-50 dark:bg-gray-800/50 p-3">
                                <p className="font-medium text-sm">{deleteModal.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {deleteModal.framework.short_name} &middot; {deleteModal.items_count} control{deleteModal.items_count !== 1 ? 's' : ''} &middot; Created {new Date(deleteModal.created_at).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Option A */}
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-1">
                                <p className="text-sm font-semibold">
                                    Option A — Delete assessment only
                                    <span className="ml-1.5 text-xs font-normal text-gray-400">(default)</span>
                                </p>
                                <p className="text-xs text-gray-500">
                                    Keeps all control statuses in the Controls Hub and all AI-generated risks in the register.
                                </p>
                            </div>

                            {/* Option B */}
                            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700 p-3 space-y-2">
                                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                                    Option B — Delete and reset control statuses
                                </p>
                                <p className="text-xs text-amber-700 dark:text-amber-400">
                                    Resets all assessed control statuses to <em>Not Set</em> in the Controls Hub. AI-generated risks are kept in the register.
                                </p>
                                <div className="flex items-start gap-2 pt-0.5">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                                    <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                                        This will reset <strong>{deleteModal.items_count}</strong> control status{deleteModal.items_count !== 1 ? 'es' : ''} to Not Set. This cannot be undone.
                                    </p>
                                </div>
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
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30"
                            onClick={() => confirmDelete(false)}
                            disabled={deleting}
                        >
                            Delete Only
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => confirmDelete(true)}
                            disabled={deleting}
                        >
                            Delete &amp; Reset Controls
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}