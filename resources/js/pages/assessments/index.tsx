import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Plus,
    Search,
    ClipboardList,
    CheckCircle,
    Clock,
    TrendingUp,
    Eye,
    Trash2,
    PlayCircle,
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

interface Assessment {
    id: number;
    title: string;
    status: string;
    compliance_percentage: number;
    period: string;
    due_date: string | null;
    created_at: string;
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
    draft: 'bg-gray-100 text-gray-600 border-gray-200',
    in_progress: 'bg-blue-50 text-blue-600 border-blue-200',
    submitted: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    completed: 'bg-green-50 text-green-600 border-green-200',
};

const complianceColor = (pct: number) => {
    if (pct >= 80) return 'text-green-600';
    if (pct >= 50) return 'text-yellow-600';
    return 'text-red-500';
};

export default function AssessmentsIndex({
    assessments,
    frameworks,
    stats,
    filters,
}: Props) {
    const { auth } = usePage().props as any;
    const isAdmin = auth.user.role === 'admin';
    const canEdit = auth.user.role === 'admin' || auth.user.role === 'user';

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [frameworkId, setFramework] = useState(filters.framework_id ?? 'all');

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

    const deleteAssessment = (id: number, title: string) => {
        if (!confirm(`Delete assessment "${title}"? This cannot be undone.`))
            return;
        router.delete(route('assessments.destroy', id));
    };

    return (
        <AdminLayout>
            <Head title="Assessments" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Compliance Assessments
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Self-assessment questionnaires per framework
                        </p>
                    </div>
                    {canEdit && (
                        <Link href={route('assessments.create')}>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" /> New Assessment
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                        {
                            label: 'Total',
                            value: stats.total,
                            icon: ClipboardList,
                            color: 'text-blue-500',
                        },
                        {
                            label: 'In Progress',
                            value: stats.in_progress,
                            icon: Clock,
                            color: 'text-yellow-500',
                        },
                        {
                            label: 'Completed',
                            value: stats.completed,
                            icon: CheckCircle,
                            color: 'text-green-500',
                        },
                        {
                            label: 'Avg Compliance',
                            value: `${stats.avg_compliance}%`,
                            icon: TrendingUp,
                            color: 'text-purple-500',
                        },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <Card key={label}>
                            <CardContent className="flex items-center gap-3 p-4">
                                <Icon className={`h-8 w-8 ${color}`} />
                                <div>
                                    <p className="text-2xl font-bold">
                                        {value}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {label}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-3">
                            <div className="relative min-w-[200px] flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search assessments..."
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
                                value={status}
                                onValueChange={(v: string) => {
                                    setStatus(v);
                                    applyFilters({
                                        status: v === 'all' ? '' : v,
                                    });
                                }}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Statuses
                                    </SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="in_progress">
                                        In Progress
                                    </SelectItem>
                                    <SelectItem value="completed">
                                        Completed
                                    </SelectItem>
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
                                <SelectTrigger className="w-[180px]">
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
                            <Button
                                variant="outline"
                                onClick={() => applyFilters({ search })}
                            >
                                Search
                            </Button>
                        </div>
                    </CardContent>
                </Card>

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
                                <thead className="border-y border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                                    <tr>
                                        {[
                                            'Assessment',
                                            'Framework',
                                            'Period',
                                            'Compliance',
                                            'Status',
                                            'Due Date',
                                            'Actions',
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {assessments.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-4 py-12 text-center text-gray-400"
                                            >
                                                No assessments found.{' '}
                                                <Link
                                                    href={route(
                                                        'assessments.create',
                                                    )}
                                                    className="text-blue-500 hover:underline"
                                                >
                                                    Create one.
                                                </Link>
                                            </td>
                                        </tr>
                                    ) : (
                                        assessments.data.map((a) => (
                                            <tr
                                                key={a.id}
                                                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                            >
                                                <td className="px-4 py-3">
                                                    <p className="max-w-[220px] truncate font-medium text-gray-900 dark:text-white">
                                                        {a.title}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
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
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                    {a.period}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {a.status === 'draft' ? (
                                                        <span className="text-xs text-gray-400">
                                                            Not started
                                                        </span>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200">
                                                                <div
                                                                    className="h-full rounded-full bg-blue-500"
                                                                    style={{
                                                                        width: `${a.compliance_percentage}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <span
                                                                className={`text-sm font-semibold ${complianceColor(a.compliance_percentage)}`}
                                                            >
                                                                {
                                                                    a.compliance_percentage
                                                                }
                                                                %
                                                            </span>
                                                        </div>
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
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
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
                                                                        className="h-8 w-8 text-blue-500"
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
                                                                className="h-8 w-8 text-red-500 hover:bg-red-50"
                                                                onClick={() =>
                                                                    deleteAssessment(
                                                                        a.id,
                                                                        a.title,
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
        </AdminLayout>
    );
}
