import { Head, Link, router } from '@inertiajs/react';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, XCircle, AlertTriangle, Eye } from 'lucide-react';
import { useState } from 'react';

interface Item {
    id: number;
    compliance_status: string;
    comments: string | null;
    control: {
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
        by_framework: { name: string; non_compliant: number; partially_compliant: number }[];
    };
    filters: { search?: string; framework_id?: string; status?: string; category?: string };
}

export default function GapAnalysisIndex({ items, frameworks, categories, stats, filters }: Props) {
    const [search, setSearch]         = useState(filters.search ?? '');
    const [frameworkId, setFramework] = useState(filters.framework_id ?? 'all');
    const [status, setStatus]         = useState(filters.status ?? 'all');
    const [category, setCategory]     = useState(filters.category ?? 'all');

    const applyFilters = (overrides: Record<string, string> = {}) => {
        router.get(route('gap-analysis.index'), {
            search,
            framework_id: frameworkId === 'all' ? '' : frameworkId,
            status:       status      === 'all' ? '' : status,
            category:     category    === 'all' ? '' : category,
            ...overrides,
        }, { preserveState: true, replace: true });
    };

    const total = stats.non_compliant + stats.partially_compliant;

    return (
        <AdminLayout>
            <Head title="Gap Analysis" />

            <div className="space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gap Analysis</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Non-compliant and partially compliant controls across all completed assessments
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <XCircle className="w-8 h-8 text-red-500" />
                            <div>
                                <p className="text-2xl font-bold">{stats.non_compliant}</p>
                                <p className="text-xs text-gray-500">Non-Compliant</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <AlertTriangle className="w-8 h-8 text-yellow-500" />
                            <div>
                                <p className="text-2xl font-bold">{stats.partially_compliant}</p>
                                <p className="text-xs text-gray-500">Partially Compliant</p>
                            </div>
                        </CardContent>
                    </Card>
                    {stats.by_framework.slice(0, 2).map(f => (
                        <Card key={f.name}>
                            <CardContent className="p-4">
                                <p className="text-xs font-semibold text-gray-500 mb-1">{f.name}</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-red-500 font-bold">{f.non_compliant}</span>
                                    <span className="text-gray-400 text-xs">non-compliant</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-yellow-500 font-bold">{f.partially_compliant}</span>
                                    <span className="text-gray-400 text-xs">partial</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Framework breakdown */}
                {stats.by_framework.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle className="text-base">Gaps by Framework</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {stats.by_framework.map(f => {
                                    const fTotal = f.non_compliant + f.partially_compliant;
                                    return (
                                        <div key={f.name} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <p className="font-semibold text-sm mb-2">{f.name}</p>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-red-500">Non-Compliant</span>
                                                    <span className="font-bold">{f.non_compliant}</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-yellow-600">Partial</span>
                                                    <span className="font-bold">{f.partially_compliant}</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden flex">
                                                    {fTotal > 0 && (
                                                        <>
                                                            <div className="h-full bg-red-500" style={{ width: `${(f.non_compliant / fTotal) * 100}%` }} />
                                                            <div className="h-full bg-yellow-400" style={{ width: `${(f.partially_compliant / fTotal) * 100}%` }} />
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
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search controls..."
                                    value={search}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                                    onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && applyFilters({ search })}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={frameworkId} onValueChange={(v: string) => { setFramework(v); applyFilters({ framework_id: v === 'all' ? '' : v }); }}>
                                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Framework" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Frameworks</SelectItem>
                                    {frameworks.map(f => (
                                        <SelectItem key={f.id} value={String(f.id)}>{f.short_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={status} onValueChange={(v: string) => { setStatus(v); applyFilters({ status: v === 'all' ? '' : v }); }}>
                                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Gaps</SelectItem>
                                    <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                                    <SelectItem value="partially_compliant">Partially Compliant</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={category} onValueChange={(v: string) => { setCategory(v); applyFilters({ category: v === 'all' ? '' : v }); }}>
                                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map(c => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={() => applyFilters({ search })}>Search</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Gaps Table */}
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">{items.total} gap{items.total !== 1 ? 's' : ''} identified</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 mt-4">
                        {items.data.length === 0 ? (
                            <div className="p-12 text-center">
                                <XCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-400 font-medium">No gaps found</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    {total === 0
                                        ? 'Complete assessments to identify compliance gaps.'
                                        : 'No gaps match your current filters.'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {items.data.map(item => (
                                    <div key={item.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                                        item.compliance_status === 'non_compliant'
                                            ? 'border-l-4 border-red-400'
                                            : 'border-l-4 border-yellow-400'
                                    }`}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                                                        {item.control.control_id}
                                                    </span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.assessment.framework.short_name}
                                                    </Badge>
                                                    <span className="text-xs text-gray-400">{item.control.category}</span>
                                                </div>
                                                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                                    {item.control.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    {item.control.description}
                                                </p>
                                                {item.comments && (
                                                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-300">
                                                        <span className="font-semibold">Notes: </span>{item.comments}
                                                    </div>
                                                )}
                                                <p className="text-xs text-gray-400 mt-2">
                                                    Assessment: <span className="font-medium">{item.assessment.title}</span>
                                                    {' '}· {item.assessment.user.name}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                <Badge variant="outline" className={
                                                    item.compliance_status === 'non_compliant'
                                                        ? 'bg-red-50 text-red-600 border-red-200'
                                                        : 'bg-yellow-50 text-yellow-600 border-yellow-200'
                                                }>
                                                    {item.compliance_status === 'non_compliant' ? 'Non-Compliant' : 'Partial'}
                                                </Badge>
                                                <Link href={route('assessments.show', item.assessment.id)}>
                                                    <Button variant="ghost" size="sm" className="gap-1 text-xs">
                                                        <Eye className="w-3 h-3" /> View
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {items.links.length > 3 && (
                            <div className="flex items-center justify-center gap-1 p-4 border-t">
                                {items.links.map((link, i) => (
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