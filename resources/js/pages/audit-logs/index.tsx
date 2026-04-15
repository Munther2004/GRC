import { Head, router } from '@inertiajs/react';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { PageHeader } from '@/components/ui/page-header';
import { StatStrip } from '@/components/ui/stat-strip';
import { Search, ScrollText, Activity, Calendar, Clock } from 'lucide-react';
import { useState } from 'react';

interface Log {
    id: number;
    action: string;
    model_type: string;
    model_id: number;
    description: string;
    ip_address: string;
    created_at: string;
    user: { name: string } | null;
    user_name: string;
}

interface Props {
    logs: {
        data: Log[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    actions: string[];
    modelTypes: string[];
    stats: { total: number; today: number; week: number };
    filters: {
        search?: string;
        action?: string;
        model_type?: string;
        date_from?: string;
        date_to?: string;
    };
}

const actionColors: Record<string, string> = {
    created: 'bg-green-50 text-green-700 border-green-200',
    updated: 'bg-blue-50 text-blue-700 border-blue-200',
    deleted: 'bg-red-950 text-red-400 border-red-200',
    submitted: 'bg-purple-50 text-purple-700 border-purple-200',
    uploaded: 'bg-yellow-50 text-yellow-700 border-yellow-200',
};

const modelColors: Record<string, string> = {
    Assessment: 'bg-blue-950 text-blue-400',
    Risk: 'bg-orange-950 text-orange-400',
    User: 'bg-purple-100 text-purple-700',
    Evidence: 'bg-amber-950 text-amber-400',
    Framework: 'bg-emerald-950 text-emerald-400',
    Control: 'bg-muted text-foreground',
};

export default function AuditLogsIndex({
    logs,
    actions,
    modelTypes,
    stats,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [action, setAction] = useState(filters.action ?? 'all');
    const [modelType, setModel] = useState(filters.model_type ?? 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    const applyFilters = (overrides: Record<string, string> = {}) => {
        router.get(
            route('audit-logs.index'),
            {
                search,
                action: action === 'all' ? '' : action,
                model_type: modelType === 'all' ? '' : modelType,
                date_from: dateFrom,
                date_to: dateTo,
                ...overrides,
            },
            { preserveState: true, replace: true },
        );
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return (
            d.toLocaleDateString() +
            ' ' +
            d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );
    };

    return (
        <AdminLayout>
            <Head title="Audit Logs" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Audit Logs
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Complete trail of all system activity
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        {
                            label: 'Total Events',
                            value: stats.total,
                            icon: ScrollText,
                            color: 'text-blue-500',
                        },
                        {
                            label: 'Today',
                            value: stats.today,
                            icon: Clock,
                            color: 'text-green-500',
                        },
                        {
                            label: 'This Week',
                            value: stats.week,
                            icon: Calendar,
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
                    <CardContent className="space-y-3 p-4">
                        <div className="flex flex-wrap gap-3">
                            <div className="relative min-w-[200px] flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search descriptions..."
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
                                value={action}
                                onValueChange={(v: string) => {
                                    setAction(v);
                                    applyFilters({
                                        action: v === 'all' ? '' : v,
                                    });
                                }}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Action" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Actions
                                    </SelectItem>
                                    {actions.map((a) => (
                                        <SelectItem
                                            key={a}
                                            value={a}
                                            className="capitalize"
                                        >
                                            {a}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={modelType}
                                onValueChange={(v: string) => {
                                    setModel(v);
                                    applyFilters({
                                        model_type: v === 'all' ? '' : v,
                                    });
                                }}
                            >
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Module" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Modules
                                    </SelectItem>
                                    {modelTypes.map((m) => (
                                        <SelectItem key={m} value={m}>
                                            {m}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                    From:
                                </span>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                    ) => setDateFrom(e.target.value)}
                                    className="w-[160px]"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                    To:
                                </span>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                    ) => setDateTo(e.target.value)}
                                    className="w-[160px]"
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => applyFilters({ search })}
                            >
                                Apply
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setSearch('');
                                    setAction('all');
                                    setModel('all');
                                    setDateFrom('');
                                    setDateTo('');
                                    router.get(route('audit-logs.index'));
                                }}
                            >
                                Clear
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Logs Table */}
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Activity className="h-4 w-4" />
                            {logs.total} events
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="mt-4 p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-y border-border bg-muted/30">
                                    <tr>
                                        {[
                                            'Time',
                                            'User',
                                            'Action',
                                            'Module',
                                            'Description',
                                            'IP',
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
                                    {logs.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-12 text-center text-gray-400"
                                            >
                                                No audit logs found.
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.data.map((log) => (
                                            <tr
                                                key={log.id}
                                                className="transition-colors hover:bg-accent/30"
                                            >
                                                <td className="px-4 py-3 text-xs whitespace-nowrap text-gray-500">
                                                    {formatDate(log.created_at)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-xs font-medium text-foreground">
                                                        {log.user?.name ??
                                                            log.user_name ??
                                                            'System'}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs capitalize ${actionColors[log.action] ?? 'bg-gray-100 text-gray-600'}`}
                                                    >
                                                        {log.action}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`rounded-full px-2 py-1 text-xs font-medium ${modelColors[log.model_type] ?? 'bg-gray-100 text-gray-600'}`}
                                                    >
                                                        {log.model_type}
                                                    </span>
                                                </td>
                                                <td className="max-w-xs truncate px-4 py-3 text-foreground/80">
                                                    {log.description}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-gray-400">
                                                    {log.ip_address ?? '—'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {logs.links.length > 3 && (
                            <div className="flex items-center justify-center gap-1 border-t p-4">
                                {logs.links.map((link, i) => (
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
