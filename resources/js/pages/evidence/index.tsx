import { Head, router, usePage } from '@inertiajs/react';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Search, FolderOpen, CheckCircle, XCircle, Clock,
    Download, Trash2, FileText, FileImage, File
} from 'lucide-react';
import { useState } from 'react';

interface EvidenceItem {
    id: number;
    title: string;
    description: string | null;
    file_name: string;
    file_type: string;
    file_path: string;
    status: string;
    created_at: string;
    expiry_date: string | null;
    is_expired: boolean;
    expires_soon: boolean;
    user: { name: string } | null;
    assessment_item: {
        control: { control_id: string; title: string; category: string };
        assessment: {
            id: number;
            title: string;
            framework: { short_name: string };
            user: { name: string };
        };
    } | null;
}

interface Props {
    evidence: {
        data: EvidenceItem[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    frameworks:  { id: number; name: string; short_name: string }[];
    assessments: { id: number; title: string }[];
    stats:       { total: number; pending: number; approved: number; rejected: number };
    filters:     { search?: string; status?: string; framework_id?: string; assessment_id?: string };
}

const statusColors: Record<string, string> = {
    pending:  'bg-yellow-50 text-yellow-700 border-yellow-200',
    approved: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-600 border-red-200',
};

const FileIcon = ({ type }: { type: string }) => {
    if (type.includes('image')) return <FileImage className="w-5 h-5 text-blue-500" />;
    if (type.includes('pdf'))   return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
};

export default function EvidenceIndex({ evidence, frameworks, assessments, stats, filters }: Props) {
    const { auth } = usePage().props as any;
    const isAdmin  = auth.user.role === 'admin';

    const [search, setSearch]           = useState(filters.search ?? '');
    const [status, setStatus]           = useState(filters.status ?? 'all');
    const [frameworkId, setFramework]   = useState(filters.framework_id ?? 'all');
    const [assessmentId, setAssessment] = useState(filters.assessment_id ?? 'all');

    const applyFilters = (overrides: Record<string, string> = {}) => {
        router.get(route('evidence.index'), {
            search,
            status:        status       === 'all' ? '' : status,
            framework_id:  frameworkId  === 'all' ? '' : frameworkId,
            assessment_id: assessmentId === 'all' ? '' : assessmentId,
            ...overrides,
        }, { preserveState: true, replace: true });
    };

    const approve = (id: number) => router.post(route('evidence.approve', id));
    const reject  = (id: number) => router.post(route('evidence.reject', id));
    const destroy = (id: number, title: string) => {
        if (!confirm(`Delete evidence "${title}"?`)) return;
        router.delete(route('evidence.destroy', id));
    };

    const download = (id: number) => {
        window.open(route('evidence.download', id), '_blank');
    };

    const formatSize = (type: string) => type.split('/')[1]?.toUpperCase() ?? 'FILE';

    return (
        <AdminLayout>
            <Head title="Evidence" />

            <div className="space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Evidence</h1>
                    <p className="text-sm text-gray-500 mt-1">All uploaded compliance evidence files</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Files', value: stats.total,    icon: FolderOpen,  color: 'text-blue-500' },
                        { label: 'Pending',     value: stats.pending,  icon: Clock,       color: 'text-yellow-500' },
                        { label: 'Approved',    value: stats.approved, icon: CheckCircle, color: 'text-green-500' },
                        { label: 'Rejected',    value: stats.rejected, icon: XCircle,     color: 'text-red-500' },
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
                                    placeholder="Search evidence..."
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
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={frameworkId} onValueChange={(v: string) => { setFramework(v); applyFilters({ framework_id: v === 'all' ? '' : v }); }}>
                                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Framework" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Frameworks</SelectItem>
                                    {frameworks.map(f => (
                                        <SelectItem key={f.id} value={String(f.id)}>{f.short_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={assessmentId} onValueChange={(v: string) => { setAssessment(v); applyFilters({ assessment_id: v === 'all' ? '' : v }); }}>
                                <SelectTrigger className="w-[200px]"><SelectValue placeholder="Assessment" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Assessments</SelectItem>
                                    {assessments.map(a => (
                                        <SelectItem key={a.id} value={String(a.id)}>{a.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={() => applyFilters({ search })}>Search</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Evidence List */}
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">{evidence.total} file{evidence.total !== 1 ? 's' : ''}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 mt-4">
                        {evidence.data.length === 0 ? (
                            <div className="p-12 text-center">
                                <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-400 font-medium">No evidence files found</p>
                                <p className="text-gray-400 text-sm mt-1">Upload evidence from within a questionnaire.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {evidence.data.map(ev => (
                                    <div key={ev.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                                    <FileIcon type={ev.file_type} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{ev.title}</p>
                                                        <Badge variant="outline" className={`text-xs ${statusColors[ev.status]}`}>
                                                            {ev.status}
                                                        </Badge>
                                                        {ev.is_expired && (
                                                            <Badge className="text-xs bg-red-100 text-red-700 border border-red-300">Expired</Badge>
                                                        )}
                                                        {!ev.is_expired && ev.expires_soon && (
                                                            <Badge className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-300">Expiring Soon</Badge>
                                                        )}
                                                        <span className="text-xs text-gray-400 font-mono">{formatSize(ev.file_type)}</span>
                                                    </div>

                                                    {/* Control info */}
                                                    {ev.assessment_item && (
                                                        <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500 mb-1">
                                                            <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                                                {ev.assessment_item.control.control_id}
                                                            </span>
                                                            <span className="truncate max-w-[250px]">{ev.assessment_item.control.title}</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {ev.assessment_item.assessment.framework.short_name}
                                                            </Badge>
                                                        </div>
                                                    )}

                                                    {/* Assessment info */}
                                                    {ev.assessment_item && (
                                                        <p className="text-xs text-gray-400">
                                                            Assessment: <span className="font-medium">{ev.assessment_item.assessment.title}</span>
                                                            {' '}· Uploaded by {ev.user?.name ?? 'Unknown'}
                                                            {' '}· {new Date(ev.created_at).toLocaleDateString()}
                                                        </p>
                                                    )}

                                                    {ev.description && (
                                                        <p className="text-xs text-gray-500 mt-1 italic">{ev.description}</p>
                                                    )}

                                                    <p className="text-xs mt-1">
                                                        {ev.expiry_date
                                                            ? <span className={ev.is_expired ? 'text-red-500 font-medium' : ev.expires_soon ? 'text-yellow-600 font-medium' : 'text-gray-400'}>
                                                                Expires: {new Date(ev.expiry_date).toLocaleDateString()}
                                                              </span>
                                                            : <span className="text-gray-400">No Expiry</span>
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="h-8 w-8 text-blue-500 hover:bg-blue-50"
                                                    title="Download"
                                                    onClick={() => download(ev.id)}
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Button>

                                                {(isAdmin || auth.user.role === 'auditor') && ev.status !== 'approved' && (
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="h-8 w-8 text-green-500 hover:bg-green-50"
                                                        title="Approve"
                                                        onClick={() => approve(ev.id)}
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                )}

                                                {(isAdmin || auth.user.role === 'auditor') && ev.status !== 'rejected' && (
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="h-8 w-8 text-orange-500 hover:bg-orange-50"
                                                        title="Reject"
                                                        onClick={() => reject(ev.id)}
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                )}

                                                {isAdmin && (
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="h-8 w-8 text-red-500 hover:bg-red-50"
                                                        title="Delete"
                                                        onClick={() => destroy(ev.id, ev.title)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {evidence.links.length > 3 && (
                            <div className="flex items-center justify-center gap-1 p-4 border-t">
                                {evidence.links.map((link, i) => (
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
