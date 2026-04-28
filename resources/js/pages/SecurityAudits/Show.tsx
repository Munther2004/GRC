import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    AlertTriangle,
    AlertCircle,
    Info,
    ShieldAlert,
    ShieldCheck,
    Shield,
    Download,
    FileText,
    Loader2,
    Wand2,
    FileCheck2,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import AdminLayout from '@/layouts/admin-layout';

interface Audit {
    id: number;
    file_name: string;
    file_type: string;
    file_size: number;
    status: 'pending' | 'analyzing' | 'completed' | 'failed';
    summary: string | null;
    total_findings: number;
    critical_count: number;
    high_count: number;
    medium_count: number;
    low_count: number;
    info_count: number;
    compliance_score: number | null;
    frameworks_checked: string[];
    controls_referenced: string[];
    risks_generated: number;
    evidence_id: number | null;
    error_message: string | null;
    analyzed_at: string | null;
    created_at: string | null;
    user: { id: number; name: string } | null;
}

interface Finding {
    id: number;
    finding_number: number;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    title: string;
    description: string;
    affected_item: string | null;
    recommendation: string;
    control_reference: string | null;
    compliance_impact: string | null;
    control: { id: number; control_id: string; title: string } | null;
    risk: { id: number; title: string } | null;
}

interface Props {
    audit: Audit;
    findings: Finding[];
}

const SEVERITY_CONFIG = {
    critical: {
        icon: ShieldAlert,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/40',
        pill: 'bg-red-500 text-white',
    },
    high: {
        icon: AlertTriangle,
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/40',
        pill: 'bg-orange-500 text-white',
    },
    medium: {
        icon: AlertCircle,
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/40',
        pill: 'bg-yellow-500 text-black',
    },
    low: {
        icon: Info,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/40',
        pill: 'bg-blue-500 text-white',
    },
    info: {
        icon: Info,
        color: 'text-slate-400',
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/40',
        pill: 'bg-slate-500 text-white',
    },
} as const;

function formatBytes(b: number): string {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export default function SecurityAuditShow({ audit, findings }: Props) {
    const [filter, setFilter] = useState<'all' | Finding['severity']>('all');
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});

    // Live polling while still being analyzed
    useEffect(() => {
        if (audit.status !== 'pending' && audit.status !== 'analyzing') return;
        const id = setInterval(() => router.reload({ only: ['audit', 'findings'] }), 4000);
        return () => clearInterval(id);
    }, [audit.status]);

    const filtered = useMemo(
        () => (filter === 'all' ? findings : findings.filter((f) => f.severity === filter)),
        [filter, findings],
    );

    const generateRisks = () => {
        if (!confirm('Generate risks from critical, high, and medium findings?')) return;
        router.post(`/security-audits/${audit.id}/generate-risks`);
    };

    const saveAsEvidence = () => {
        if (!confirm('Save this audit report as a piece of evidence?')) return;
        router.post(`/security-audits/${audit.id}/save-as-evidence`);
    };

    const exportPdf = () => {
        window.open(`/security-audits/${audit.id}/export-pdf`, '_blank');
    };

    const toggle = (id: number) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

    return (
        <AdminLayout>
            <Head title={`Security Audit · ${audit.file_name}`} />

            <div className="mb-4">
                <Link
                    href="/security-audits"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to audits
                </Link>
            </div>

            <PageHeader
                title={audit.file_name}
                description={`${audit.file_type} · ${formatBytes(audit.file_size)} · uploaded by ${audit.user?.name ?? 'Unknown'}`}
            >
                {audit.status === 'completed' && (
                    <>
                        <Button onClick={exportPdf} variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1.5" /> Export PDF
                        </Button>
                        <Button onClick={generateRisks} variant="outline" size="sm">
                            <Wand2 className="h-4 w-4 mr-1.5" /> Generate Risks
                        </Button>
                        <Button onClick={saveAsEvidence} size="sm" disabled={!!audit.evidence_id}>
                            <FileCheck2 className="h-4 w-4 mr-1.5" />
                            {audit.evidence_id ? 'Saved as Evidence' : 'Save as Evidence'}
                        </Button>
                    </>
                )}
            </PageHeader>

            {/* Status banners */}
            {(audit.status === 'pending' || audit.status === 'analyzing') && (
                <Card className="mb-6 border-blue-500/40 bg-blue-500/5">
                    <CardContent className="flex items-center gap-3 py-5">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                        <div>
                            <p className="font-medium text-blue-300">
                                {audit.status === 'pending'
                                    ? 'Queued for analysis…'
                                    : 'Claude is analyzing the configuration…'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                This page will refresh automatically when results are ready.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {audit.status === 'failed' && (
                <Card className="mb-6 border-red-500/40 bg-red-500/5">
                    <CardContent className="flex items-start gap-3 py-5">
                        <ShieldAlert className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-red-300">Analysis failed</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {audit.error_message ?? 'An unknown error occurred.'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {audit.status === 'completed' && (
                <>
                    {/* Executive summary + score */}
                    <div className="grid gap-4 md:grid-cols-3 mb-6">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> Executive Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-relaxed text-foreground/90">
                                    {audit.summary || 'No summary provided by AI analysis.'}
                                </p>

                                {(audit.frameworks_checked.length > 0 || audit.controls_referenced.length > 0) && (
                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        {audit.frameworks_checked.length > 0 && (
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                                                    Frameworks Checked
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {audit.frameworks_checked.map((f) => (
                                                        <Badge key={f} variant="outline">
                                                            {f}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {audit.controls_referenced.length > 0 && (
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                                                    Controls Referenced
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {audit.controls_referenced.map((c) => (
                                                        <Badge key={c} variant="outline">
                                                            {c}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" /> Posture Score
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {audit.compliance_score !== null ? (
                                    <div className="text-center">
                                        <p
                                            className={`text-5xl font-bold tabular-nums ${
                                                audit.compliance_score >= 80
                                                    ? 'text-emerald-400'
                                                    : audit.compliance_score >= 60
                                                        ? 'text-yellow-400'
                                                        : 'text-red-400'
                                            }`}
                                        >
                                            {Number(audit.compliance_score).toFixed(1)}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">out of 100</p>
                                        {audit.risks_generated > 0 && (
                                            <p className="mt-3 text-xs text-muted-foreground">
                                                {audit.risks_generated} risk(s) generated
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center">
                                        Not scored
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Severity filter buttons */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <Button
                            size="sm"
                            variant={filter === 'all' ? 'default' : 'outline'}
                            onClick={() => setFilter('all')}
                        >
                            All ({audit.total_findings})
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === 'critical' ? 'default' : 'outline'}
                            onClick={() => setFilter('critical')}
                            className={filter === 'critical' ? 'bg-red-500 hover:bg-red-600' : ''}
                        >
                            Critical ({audit.critical_count})
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === 'high' ? 'default' : 'outline'}
                            onClick={() => setFilter('high')}
                            className={filter === 'high' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                        >
                            High ({audit.high_count})
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === 'medium' ? 'default' : 'outline'}
                            onClick={() => setFilter('medium')}
                            className={filter === 'medium' ? 'bg-yellow-500 text-black hover:bg-yellow-600' : ''}
                        >
                            Medium ({audit.medium_count})
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === 'low' ? 'default' : 'outline'}
                            onClick={() => setFilter('low')}
                            className={filter === 'low' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                        >
                            Low ({audit.low_count})
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === 'info' ? 'default' : 'outline'}
                            onClick={() => setFilter('info')}
                        >
                            Info ({audit.info_count})
                        </Button>
                    </div>

                    {/* Findings list */}
                    {filtered.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                                <ShieldCheck className="h-10 w-10 text-emerald-400" />
                                <p className="text-sm text-muted-foreground">
                                    {findings.length === 0
                                        ? 'No findings — this configuration appears clean.'
                                        : 'No findings match the selected filter.'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((f) => {
                                const cfg = SEVERITY_CONFIG[f.severity];
                                const Icon = cfg.icon;
                                const isOpen = expanded[f.id] ?? (f.severity === 'critical' || f.severity === 'high');

                                return (
                                    <Card key={f.id} className={`${cfg.border} border-l-4`}>
                                        <CardHeader
                                            className="cursor-pointer pb-3"
                                            onClick={() => toggle(f.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <Icon className={`h-5 w-5 mt-0.5 ${cfg.color} shrink-0`} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span
                                                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${cfg.pill}`}
                                                        >
                                                            {f.severity}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            #{f.finding_number}
                                                        </span>
                                                        {f.risk && (
                                                            <Badge variant="outline" className="text-[10px]">
                                                                Risk #{f.risk.id}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <CardTitle className="text-base font-semibold">
                                                        {f.title}
                                                    </CardTitle>
                                                </div>
                                                {isOpen ? (
                                                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                                                )}
                                            </div>
                                        </CardHeader>

                                        {isOpen && (
                                            <CardContent className="space-y-3 pt-0 text-sm">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                                                        Description
                                                    </p>
                                                    <p className="text-foreground/90">{f.description}</p>
                                                </div>

                                                {f.affected_item && (
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                                                            Affected Item
                                                        </p>
                                                        <code className="inline-block bg-muted px-2 py-1 rounded text-xs font-mono text-foreground/90">
                                                            {f.affected_item}
                                                        </code>
                                                    </div>
                                                )}

                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                                                        Recommendation
                                                    </p>
                                                    <p className="text-foreground/90">{f.recommendation}</p>
                                                </div>

                                                {(f.control_reference || f.control) && (
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                                                            Control Reference
                                                        </p>
                                                        <div className="text-foreground/90">
                                                            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                                                                {f.control_reference}
                                                            </span>
                                                            {f.control && (
                                                                <span className="ml-2 text-muted-foreground">
                                                                    — {f.control.title}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {f.compliance_impact && (
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                                                            Compliance Impact
                                                        </p>
                                                        <p className="text-foreground/90">
                                                            {f.compliance_impact}
                                                        </p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </AdminLayout>
    );
}
