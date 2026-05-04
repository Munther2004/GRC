import { Head, Link, router } from '@inertiajs/react';
import {
    Upload,
    FileText,
    ShieldCheck,
    Trash2,
    Loader2,
    Eye,
    AlertTriangle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { PageHeader } from '@/components/ui/page-header';
import { StatStrip } from '@/components/ui/stat-strip';
import AdminLayout from '@/layouts/admin-layout';

interface AuditRow {
    id: number;
    file_name: string;
    file_type: string;
    file_size: number;
    status: 'pending' | 'analyzing' | 'completed' | 'failed';
    total_findings: number;
    critical_count: number;
    high_count: number;
    medium_count: number;
    low_count: number;
    info_count: number;
    compliance_score: number | null;
    analyzed_at: string | null;
    created_at: string | null;
    user: { id: number; name: string } | null;
}

interface Props {
    audits: {
        data: AuditRow[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    stats: {
        total: number;
        completed: number;
        in_progress: number;
        failed: number;
        critical_findings: number;
        high_findings: number;
    };
}

const ALLOWED_EXT = [
    'csv', 'txt', 'json', 'yaml', 'yml', 'ini', 'conf', 'config',
    'cfg', 'env', 'toml', 'xml', 'docx', 'xlsx',
];

function formatBytes(b: number): string {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function statusBadge(status: AuditRow['status']) {
    const map = {
        pending: { color: 'bg-slate-500/10 text-slate-400', label: 'Pending' },
        analyzing: { color: 'bg-blue-500/10 text-blue-400', label: 'Analyzing' },
        completed: { color: 'bg-emerald-500/10 text-emerald-400', label: 'Completed' },
        failed: { color: 'bg-red-500/10 text-red-400', label: 'Failed' },
    } as const;
    const s = map[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded ${s.color}`}>
            {status === 'analyzing' && <Loader2 className="h-3 w-3 animate-spin" />}
            {s.label}
        </span>
    );
}

export default function SecurityAuditsIndex({ audits, stats }: Props) {
    const confirm = useConfirm();
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const hasInProgress = audits.data.some(
        (a) => a.status === 'pending' || a.status === 'analyzing',
    );

    useEffect(() => {
        if (!hasInProgress) return;
        const id = setInterval(() => {
            router.reload({ only: ['audits', 'stats'] });
        }, 4000);
        return () => clearInterval(id);
    }, [hasInProgress]);

    const handleFile = (file: File | null) => {
        setError(null);
        if (!file) return;

        const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
        if (!ALLOWED_EXT.includes(ext)) {
            setError(`Unsupported file type ".${ext}". Allowed: ${ALLOWED_EXT.join(', ')}`);
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('File too large — maximum 10 MB.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        router.post('/security-audits', formData, {
            forceFormData: true,
            onFinish: () => setUploading(false),
            onError: (errs) => {
                setError(Object.values(errs).join(' '));
            },
        });
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0] ?? null;
        handleFile(file);
    };

    const destroy = async (id: number, name: string) => {
        const ok = await confirm({
            title: `Delete audit for "${name}"?`,
            confirmLabel: 'Delete',
            tone: 'destructive',
        });
        if (!ok) return;
        router.delete(`/security-audits/${id}`);
    };

    return (
        <AdminLayout>
            <Head title="Security Audits" />

            <PageHeader
                title="Security Configuration Auditor"
                description="Upload a configuration file and let Claude analyse it against best-practice security baselines."
            />

            <StatStrip
                stats={[
                    { label: 'Total Audits', value: stats.total, tone: 'brass' },
                    { label: 'Completed', value: stats.completed, tone: 'ok' },
                    { label: 'In Progress', value: stats.in_progress, tone: 'neutral' },
                    { label: 'Failed', value: stats.failed, tone: 'bad' },
                    { label: 'Critical Findings', value: stats.critical_findings, tone: 'bad' },
                    { label: 'High Findings', value: stats.high_findings, tone: 'warn' },
                ]}
                className="mb-6"
            />

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="h-4 w-4" /> Upload Configuration File
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragActive(true);
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative cursor-pointer border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
                            dragActive
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/60 hover:bg-muted/30'
                        }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept={ALLOWED_EXT.map((e) => `.${e}`).join(',')}
                            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                        />
                        {uploading ? (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <p>Uploading and queuing analysis…</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Upload className="h-10 w-10 text-muted-foreground" />
                                <p className="text-sm text-foreground">
                                    Drop a file here, or <span className="text-primary underline">browse</span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {ALLOWED_EXT.join(', ')} · max 10 MB
                                </p>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mt-3 flex items-center gap-2 rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                            <AlertTriangle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Recent Audits
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                    {audits.data.length === 0 ? (
                        <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                            No security audits yet. Upload a configuration file to get started.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left">File</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Findings</th>
                                        <th className="px-4 py-3 text-left">Score</th>
                                        <th className="px-4 py-3 text-left">Uploaded</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {audits.data.map((a) => (
                                        <tr key={a.id} className="border-t border-border/50 hover:bg-muted/20">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                                    <div>
                                                        <Link
                                                            href={`/security-audits/${a.id}`}
                                                            className="font-medium text-foreground hover:text-primary"
                                                        >
                                                            {a.file_name}
                                                        </Link>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatBytes(a.file_size)} · {a.user?.name ?? 'Unknown'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{statusBadge(a.status)}</td>
                                            <td className="px-4 py-3">
                                                {a.status === 'completed' ? (
                                                    <div className="flex items-center gap-1 text-xs">
                                                        {a.critical_count > 0 && (
                                                            <Badge className="bg-red-500/15 text-red-300 hover:bg-red-500/20">
                                                                {a.critical_count} Crit
                                                            </Badge>
                                                        )}
                                                        {a.high_count > 0 && (
                                                            <Badge className="bg-orange-500/15 text-orange-300 hover:bg-orange-500/20">
                                                                {a.high_count} High
                                                            </Badge>
                                                        )}
                                                        {a.medium_count > 0 && (
                                                            <Badge className="bg-yellow-500/15 text-yellow-300 hover:bg-yellow-500/20">
                                                                {a.medium_count} Med
                                                            </Badge>
                                                        )}
                                                        {a.total_findings === 0 && (
                                                            <span className="flex items-center gap-1 text-emerald-400">
                                                                <ShieldCheck className="h-3.5 w-3.5" /> Clean
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {a.compliance_score !== null ? (
                                                    <span
                                                        className={`font-medium tabular-nums ${
                                                            a.compliance_score >= 80
                                                                ? 'text-emerald-400'
                                                                : a.compliance_score >= 60
                                                                    ? 'text-yellow-400'
                                                                    : 'text-red-400'
                                                        }`}
                                                    >
                                                        {Number(a.compliance_score).toFixed(1)}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground">
                                                {a.created_at ? new Date(a.created_at).toLocaleString() : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-1">
                                                    <Link href={`/security-audits/${a.id}`}>
                                                        <Button size="sm" variant="ghost">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-red-400 hover:text-red-300"
                                                        onClick={() => destroy(a.id, a.file_name)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
