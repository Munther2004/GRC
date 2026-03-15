import { Head, Link, router, usePage } from '@inertiajs/react';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Plus, Search, Shield, TrendingUp, Clock, Eye, Pencil, Trash2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { RouteName, RouteParams } from 'ziggy-js';


declare global {
    function route(name: RouteName, params?: RouteParams<RouteName>, absolute?: boolean): string;
}

interface Risk {
    id: number;
    title: string;
    category: string;
    owner: string;
    likelihood: number;
    impact: number;
    risk_score: number;
    risk_level: string;
    status: string;
    treatment: string;
    due_date: string | null;
    auto_generated: number;
    user: { name: string };
}

interface Props {
    risks: {
        data: Risk[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    stats: { total: number; open: number; critical: number; overdue: number };
    filters: { search?: string; status?: string; level?: string; category?: string };
}

const levelColors: Record<string, string> = {
    critical: 'bg-red-500/10 text-red-500 border-red-500/20',
    high:     'bg-orange-500/10 text-orange-500 border-orange-500/20',
    medium:   'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    low:      'bg-green-500/10 text-green-600 border-green-500/20',
};

const statusColors: Record<string, string> = {
    open:         'bg-blue-500/10 text-blue-600 border-blue-500/20',
    in_progress:  'bg-purple-500/10 text-purple-600 border-purple-500/20',
    under_review: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    closed:       'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export default function RisksIndex({ risks, stats, filters }: Props) {
    const { auth } = usePage().props as any;
    const isAdmin  = auth.user.role === 'admin';
    const canEdit  = auth.user.role === 'admin' || auth.user.role === 'user';

    const [search, setSearch]     = useState(filters.search ?? '');
    const [status, setStatus]     = useState(filters.status ?? 'all');
    const [level, setLevel]       = useState(filters.level ?? 'all');
    const [category, setCategory] = useState(filters.category ?? 'all');

    const applyFilters = (overrides: Record<string, string> = {}) => {
        router.get(route('risks.index'), {
            search,
            status:   status   === 'all' ? '' : status,
            level:    level    === 'all' ? '' : level,
            category: category === 'all' ? '' : category,
            ...overrides,
        }, { preserveState: true, replace: true });
    };

    const deleteRisk = (id: number, title: string) => {
        if (!confirm(`Delete risk "${title}"? This cannot be undone.`)) return;
        router.delete(route('risks.destroy', id));
    };

    return (
        <AdminLayout>
            <Head title="Risk Register" />

            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Risk Register</h1>
                        <p className="text-sm text-gray-500 mt-1">ISO/IEC 27005 — Likelihood × Impact risk management</p>
                    </div>
                    {canEdit && (
                        <Link href={route('risks.create')}>
                            <Button className="gap-2">
                                <Plus className="w-4 h-4" /> Add Risk
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Risks',     value: stats.total,    icon: Shield,        color: 'text-blue-500' },
                        { label: 'Open Risks',      value: stats.open,     icon: AlertTriangle, color: 'text-orange-500' },
                        { label: 'Critical',        value: stats.critical, icon: TrendingUp,    color: 'text-red-500' },
                        { label: 'Overdue',         value: stats.overdue,  icon: Clock,         color: 'text-yellow-500' },
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
                                    placeholder="Search risks..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && applyFilters({ search })}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={status} onValueChange={v => { setStatus(v); applyFilters({ status: v === 'all' ? '' : v }); }}>
                                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="under_review">Under Review</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={level} onValueChange={v => { setLevel(v); applyFilters({ level: v === 'all' ? '' : v }); }}>
                                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Risk Level" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={category} onValueChange={v => { setCategory(v); applyFilters({ category: v === 'all' ? '' : v }); }}>
                                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {['Information Security','Operational','Compliance','Financial','Strategic','Technical','Human Resources','Third Party','Physical','Legal'].map(c => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
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
                        <CardTitle className="text-base font-semibold">
                            {risks.total} risk{risks.total !== 1 ? 's' : ''} found
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 mt-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
                                    <tr>
                                        {['Risk', 'Category', 'Owner', 'Score', 'Level', 'Status', 'Treatment', 'Due Date', 'Actions'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {risks.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                                                No risks found. <Link href={route('risks.create')} className="text-blue-500 hover:underline">Add the first one.</Link>
                                            </td>
                                        </tr>
                                    ) : risks.data.map(risk => (
                                        <tr key={risk.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="font-medium text-gray-900 dark:text-white max-w-[200px] truncate">{risk.title}</p>
                                                    {risk.auto_generated === 1 && (
                                                        <Badge className="text-xs bg-purple-100 text-purple-700 border-purple-200 shrink-0 px-1 py-0">
                                                            <Sparkles className="w-2.5 h-2.5 mr-0.5" />AI
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400">{risk.user?.name}</p>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{risk.category}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{risk.owner}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold text-lg">{risk.likelihood * risk.impact}</span>
                                                    <span className="text-xs text-gray-400">/ 25</span>
                                                </div>
                                                <p className="text-xs text-gray-400">{risk.likelihood}×{risk.impact}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className={`capitalize ${levelColors[risk.risk_level]}`}>
                                                    {risk.risk_level}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className={`capitalize ${statusColors[risk.status]}`}>
                                                    {risk.status.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 capitalize text-gray-600 dark:text-gray-300">{risk.treatment}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                {risk.due_date ? new Date(risk.due_date).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <Link href={route('risks.show', risk.id)}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    {canEdit && (
                                                        <Link href={route('risks.edit', risk.id)}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    {canEdit && (
                                                        <Button
                                                            variant="ghost" size="icon"
                                                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                            onClick={() => deleteRisk(risk.id, risk.title)}
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

                        {/* Pagination */}
                        {risks.links.length > 3 && (
                            <div className="flex items-center justify-center gap-1 p-4 border-t">
                                {risks.links.map((link, i) => (
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
        </AdminLayout>
    );
}