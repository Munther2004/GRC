import { Head, Link, router } from '@inertiajs/react';
import {
    Search,
    Building2,
    Eye,
    Trash2,
    CheckCircle2,
    Clock,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { route } from '@/lib/routes';

interface Corporation {
    id: number;
    name: string;
    email: string;
    industry: string;
    status: 'pending' | 'approved' | 'rejected';
    user_count?: number;
    created_at: string;
}

interface Props {
    corporations: {
        data: Corporation[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    stats: {
        total: number;
        approved: number;
        pending: number;
        rejected: number;
    };
    filters: { search?: string; status?: string };
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-950 text-yellow-400 border-yellow-200',
    approved: 'bg-green-950 text-green-400 border-green-200',
    rejected: 'bg-red-950 text-red-400 border-red-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="h-4 w-4" />,
    approved: <CheckCircle2 className="h-4 w-4" />,
    rejected: <XCircle className="h-4 w-4" />,
};

export default function CorporationsIndex({
    corporations,
    stats,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');

    const applyFilters = (overrides: Record<string, string> = {}) => {
        router.get(
            route('admin.corporations.index'),
            {
                search,
                status: status === 'all' ? '' : status,
                ...overrides,
            },
            { preserveState: true, replace: true },
        );
    };

    const deleteCorporation = (id: number, _name: string) => {
        router.delete(route('admin.corporations.destroy', id));
    };

    return (
        <AdminLayout>
            <Head title="Corporations" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1
                            className="font-heading text-4xl font-normal"
                            style={{ color: 'var(--foreground)' }}
                        >
                            Corporations
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage registered corporations and approve sign-ups
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                        {
                            label: 'Total',
                            value: stats.total,
                            color: 'text-primary',
                            icon: Building2,
                        },
                        {
                            label: 'Approved',
                            value: stats.approved,
                            color: 'text-green-500',
                            icon: CheckCircle2,
                        },
                        {
                            label: 'Pending',
                            value: stats.pending,
                            color: 'text-yellow-500',
                            icon: Clock,
                        },
                        {
                            label: 'Rejected',
                            value: stats.rejected,
                            color: 'text-red-500',
                            icon: XCircle,
                        },
                    ].map(({ label, value, color, icon: Icon }) => (
                        <Card key={label}>
                            <CardContent className="flex items-center gap-3 p-4">
                                <Icon className={`h-8 w-8 ${color}`} />
                                <div>
                                    <p className="text-2xl font-medium">
                                        {value}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
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
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or email..."
                                    value={search}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                    ) => setSearch(e.target.value)}
                                    onKeyDown={(
                                        e: React.KeyboardEvent,
                                    ) =>
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
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="approved">
                                        Approved
                                    </SelectItem>
                                    <SelectItem value="rejected">
                                        Rejected
                                    </SelectItem>
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
                            {corporations.total} corporation
                            {corporations.total !== 1 ? 's' : ''}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="mt-4 p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-y border-border bg-muted/30">
                                    <tr>
                                        {[
                                            'Corporation',
                                            'Industry',
                                            'Email',
                                            'Status',
                                            'Users',
                                            'Created',
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
                                    {corporations.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-4 py-12 text-center text-muted-foreground"
                                            >
                                                No corporations found.
                                            </td>
                                        </tr>
                                    ) : (
                                        corporations.data.map(
                                            (corporation) => (
                                                <tr
                                                    key={corporation.id}
                                                    className="transition-colors hover:bg-accent/30"
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">
                                                                {
                                                                    corporation.name
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground capitalize">
                                                        {corporation.industry}
                                                    </td>
                                                    <td className="px-4 py-3 text-foreground/80">
                                                        {corporation.email}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge
                                                            variant="outline"
                                                            className={`capitalize flex w-fit items-center gap-1 ${statusColors[corporation.status]}`}
                                                        >
                                                            {
                                                                statusIcons[
                                                                    corporation
                                                                        .status
                                                                ]
                                                            }
                                                            {corporation.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {corporation.user_count ??
                                                            0}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {new Date(
                                                            corporation.created_at,
                                                        ).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1">
                                                            <Link
                                                                href={route(
                                                                    'admin.corporations.show',
                                                                    corporation.id,
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
                                                            <AlertDialog>
                                                                <AlertDialogTrigger
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-red-500 hover:bg-red-50"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogTitle>
                                                                        Delete
                                                                        Corporation
                                                                    </AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you
                                                                        sure you
                                                                        want to
                                                                        delete
                                                                        this
                                                                        corporation?
                                                                        This
                                                                        cannot be
                                                                        undone.
                                                                    </AlertDialogDescription>
                                                                    <div className="flex gap-3 justify-end">
                                                                        <AlertDialogCancel>
                                                                            Cancel
                                                                        </AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() =>
                                                                                deleteCorporation(
                                                                                    corporation.id,
                                                                                    corporation.name,
                                                                                )
                                                                            }
                                                                            className="bg-red-600 hover:bg-red-700"
                                                                        >
                                                                            Delete
                                                                        </AlertDialogAction>
                                                                    </div>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ),
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {corporations.links &&
                    corporations.links.length > 0 && (
                        <div className="flex items-center justify-center gap-1">
                            {corporations.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                >
                                    <Button
                                        variant={
                                            link.active
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        disabled={!link.url}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                </Link>
                            ))}
                        </div>
                    )}
            </div>
        </AdminLayout>
    );
}
