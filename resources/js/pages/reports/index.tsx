import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle, CheckCircle,
    XCircle, Clock, Eye, Download, Sparkles, Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { StatStrip } from '@/components/ui/stat-strip';
import AdminLayout from '@/layouts/admin-layout';
import { downloadPdf } from '@/lib/download-pdf';
import { route } from '@/lib/routes';

interface Props {
    overallCompliance: number;
    complianceByFramework: {
        id: number; name: string; short_name: string;
        latest_score: number | null; assessments_count: number; trend: number[];
    }[];
    riskByLevel:    { critical: number; high: number; medium: number; low: number };
    riskByCategory: Record<string, number>;
    riskByStatus:   { open: number; in_progress: number; under_review: number; closed: number };
    assessmentHistory: {
        id: number; title: string; framework: string;
        compliance_percentage: number; period: string; completed_at: string; user: string;
    }[];
    monthlyTrend: { month: string; score: number }[];
    stats: { total_risks: number; open_risks: number; total_assessments: number; total_frameworks: number };
}

const complianceColor = (pct: number) => pct >= 80 ? '#46bd5f' : pct >= 50 ? '#f5b929' : '#e5484d';
const complianceStyle = (pct: number): React.CSSProperties => ({ color: complianceColor(pct) });

const RISK_COLORS = { critical: '#e5484d', high: '#f76b15', medium: '#f5b929', low: '#46bd5f' };

const tooltipStyle = {
    contentStyle: { backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--foreground)' },
    labelStyle:   { color: 'var(--primary)', fontSize: '11px' },
};
const axisStyle = { fill: 'var(--muted-foreground)', fontSize: 11 };

export default function ReportsIndex({
    overallCompliance, complianceByFramework, riskByLevel, riskByCategory,
    riskByStatus, assessmentHistory, monthlyTrend, stats,
}: Props) {
    const [generating, setGenerating]       = useState(false);
    const [generatingGap, setGeneratingGap] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(t);
    }, [toast]);

    const generateExecutiveSummary = async () => {
        if (generating) return;
        setGenerating(true);
        try {
            await downloadPdf('/reports/executive-summary', `executive-summary-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch {
            setToast({ type: 'error', text: 'Failed to generate report. Please try again.' });
        } finally { setGenerating(false); }
    };

    const generateGapReport = async () => {
        if (generatingGap) return;
        setGeneratingGap(true);
        try {
            const res = await fetch('/gap-analysis/report', { method: 'GET', headers: { Accept: 'application/pdf' } });
            if (!res.ok) throw new Error('Server error');
            const blob = await res.blob();
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `gap-analysis-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); document.body.removeChild(a);
        } catch {
            setToast({ type: 'error', text: 'Failed to generate gap analysis. Please try again.' });
        } finally { setGeneratingGap(false); }
    };

    const riskLevelData = [
        { name: 'Critical', value: riskByLevel.critical, color: RISK_COLORS.critical },
        { name: 'High',     value: riskByLevel.high,     color: RISK_COLORS.high     },
        { name: 'Medium',   value: riskByLevel.medium,   color: RISK_COLORS.medium   },
        { name: 'Low',      value: riskByLevel.low,      color: RISK_COLORS.low      },
    ];
    const riskCategoryData  = Object.entries(riskByCategory).map(([name, value]) => ({ name, value }));
    const frameworkChartData = complianceByFramework.map((f) => ({ name: f.short_name, score: f.latest_score ?? 0 }));

    return (
        <AdminLayout>
            <Head title="Reports" />

            <div className="space-y-8">
                <div className="flex items-start justify-between gap-4">
                    <PageHeader title="Reports" description="Organisation security and compliance summary" />
                    <div className="flex shrink-0 items-center gap-2 pt-1">
                        <span className="text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
                            {new Date().toLocaleDateString()}
                        </span>
                        <a href="/reports/export-pdf" target="_blank">
                            <Button variant="outline" size="sm" className="gap-2">
                                <Download className="h-4 w-4" /> Export PDF
                            </Button>
                        </a>
                        <Button variant="outline" size="sm" className="gap-2" onClick={generateGapReport} disabled={generatingGap}>
                            {generatingGap ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            Gap Analysis
                        </Button>
                        <Button size="sm" className="gap-2" onClick={generateExecutiveSummary} disabled={generating}>
                            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            Executive Summary
                        </Button>
                    </div>
                </div>

                <StatStrip stats={[
                    { label: 'Overall Compliance', value: `${overallCompliance}%`, tone: overallCompliance >= 70 ? 'ok' : overallCompliance >= 40 ? 'warn' : 'bad' },
                    { label: 'Total Risks',   value: stats.total_risks,      tone: 'neutral' },
                    { label: 'Open Risks',    value: stats.open_risks,       tone: stats.open_risks > 0 ? 'warn' : 'ok' },
                    { label: 'Assessments',   value: stats.total_assessments, tone: 'neutral' },
                ]} />

                {/* Compliance Overview */}
                <div className="grid grid-cols-3 gap-6">
                    <Card>
                        <CardHeader><CardTitle className="text-lg" style={{ fontWeight: 500 }}>Overall Compliance</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-4">
                                <span className="text-7xl tabular-nums" style={{ ...complianceStyle(overallCompliance), fontWeight: 500, letterSpacing: '-0.02em' }}>
                                    {overallCompliance}%
                                </span>
                                <p className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>Across all frameworks</p>
                                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--muted)' }}>
                                    <div className="h-full rounded-full transition-all" style={{ width: `${overallCompliance}%`, backgroundColor: complianceColor(overallCompliance) }} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-2">
                        <CardHeader><CardTitle className="text-lg" style={{ fontWeight: 500 }}>Compliance by Framework</CardTitle></CardHeader>
                        <CardContent>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={frameworkChartData} barSize={40}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisStyle} />
                                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={axisStyle} />
                                        <Tooltip {...tooltipStyle} formatter={(v: any) => [`${v}%`, 'Compliance']} />
                                        <Bar dataKey="score" radius={[3, 3, 0, 0]}>
                                            {frameworkChartData.map((entry, i) => (
                                                <Cell key={i} fill={complianceColor(entry.score)} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 space-y-2">
                                {complianceByFramework.map((f) => (
                                    <div key={f.id} className="flex items-center justify-between">
                                        <span className="text-sm" style={{ color: 'var(--foreground)' }}>{f.short_name}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                {f.assessments_count} assessment{f.assessments_count !== 1 ? 's' : ''}
                                            </span>
                                            {f.latest_score !== null
                                                ? <span className="text-base tabular-nums" style={{ ...complianceStyle(f.latest_score), fontWeight: 500 }}>{f.latest_score}%</span>
                                                : <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>No data</span>
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Trend */}
                {monthlyTrend.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle className="text-lg" style={{ fontWeight: 500 }}>Compliance Trend — Last 6 Months</CardTitle></CardHeader>
                        <CardContent>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={monthlyTrend}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisStyle} />
                                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={axisStyle} />
                                        <Tooltip {...tooltipStyle} formatter={(v: any) => [`${v}%`, 'Avg Compliance']} />
                                        <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2} dot={{ fill: 'var(--primary)', r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Risk Summary */}
                <div className="grid grid-cols-3 gap-6">
                    <Card>
                        <CardHeader><CardTitle className="text-lg" style={{ fontWeight: 500 }}>Risks by Level</CardTitle></CardHeader>
                        <CardContent>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={riskLevelData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value">
                                            {riskLevelData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip {...tooltipStyle} />
                                        <Legend iconSize={8} wrapperStyle={{ fontSize: 10, color: 'var(--muted-foreground)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                {riskLevelData.map((r) => (
                                    <div key={r.name} className="flex items-center gap-2">
                                        <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.color }} />
                                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                            {r.name}: <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>{r.value}</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-lg" style={{ fontWeight: 500 }}>Risks by Category</CardTitle></CardHeader>
                        <CardContent>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={riskCategoryData} layout="vertical" barSize={10}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                                        <XAxis type="number" axisLine={false} tickLine={false} tick={axisStyle} />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ ...axisStyle, fontSize: 9 }} width={85} />
                                        <Tooltip {...tooltipStyle} />
                                        <Bar dataKey="value" fill="var(--primary)" radius={[0, 3, 3, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-lg" style={{ fontWeight: 500 }}>Risks by Status</CardTitle></CardHeader>
                        <CardContent className="space-y-2 pt-2">
                            {[
                                { label: 'Open',         value: riskByStatus.open,         icon: AlertTriangle, color: '#e5484d' },
                                { label: 'In Progress',  value: riskByStatus.in_progress,  icon: Clock,         color: 'var(--primary)' },
                                { label: 'Under Review', value: riskByStatus.under_review, icon: Eye,           color: '#f5b929' },
                                { label: 'Closed',       value: riskByStatus.closed,       icon: CheckCircle,   color: '#46bd5f' },
                            ].map(({ label, value, icon: Icon, color }) => (
                                <div key={label} className="flex items-center justify-between rounded-2xl p-3.5" style={{ background: `color-mix(in srgb, ${color} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 25%, transparent)` }}>
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" style={{ color }} strokeWidth={1.5} />
                                        <span className="text-[10px] uppercase" style={{ color: 'var(--foreground)', letterSpacing: '0.28em' }}>{label}</span>
                                    </div>
                                    <span className="text-xl tabular-nums" style={{ color, fontWeight: 500 }}>{value}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Assessment History */}
                <Card>
                    <CardHeader><CardTitle className="text-lg" style={{ fontWeight: 500 }}>Assessment History</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        {assessmentHistory.length === 0 ? (
                            <div className="p-8 text-center">
                                <p style={{ color: 'var(--muted-foreground)' }}>
                                    No completed assessments yet.{' '}
                                    <Link href="/assessments" className="text-primary hover:underline">Start one.</Link>
                                </p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead style={{ borderTopColor: 'var(--border)', borderTopWidth: '1px', borderBottomColor: 'var(--border)', borderBottomWidth: '1px', background: 'color-mix(in srgb, var(--muted) 30%, transparent)' }}>
                                    <tr>
                                        {['Assessment', 'Framework', 'Period', 'Score', 'Completed', 'By'].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em', fontWeight: 500 }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {assessmentHistory.map((a) => (
                                        <tr key={a.id} className="transition-colors hover:bg-muted/30" style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td className="px-4 py-3">
                                                <Link href={route('assessments.show', a.id)} className="text-sm transition-colors hover:underline" style={{ color: 'var(--primary)' }}>
                                                    {a.title}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline">{a.framework}</Badge>
                                            </td>
                                            <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{a.period}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1 w-16 overflow-hidden rounded-full" style={{ background: 'var(--muted)' }}>
                                                        <div className="h-full rounded-full" style={{ width: `${a.compliance_percentage}%`, background: complianceColor(a.compliance_percentage) }} />
                                                    </div>
                                                    <span className="text-base tabular-nums" style={{ ...complianceStyle(a.compliance_percentage), fontWeight: 500 }}>
                                                        {a.compliance_percentage}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>{a.completed_at}</td>
                                            <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{a.user}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Gap Analysis overlay */}
            {generatingGap && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="mx-4 flex max-w-sm flex-col items-center gap-4 rounded-2xl p-8 bg-card border" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
                        <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'color-mix(in srgb, var(--primary) 12%, transparent)', borderColor: 'color-mix(in srgb, var(--primary) 30%, transparent)', borderWidth: '1px' }}>
                            <Sparkles className="h-7 w-7 animate-pulse text-primary" />
                        </div>
                        <div className="text-center">
                            <p className="text-xl" style={{ color: 'var(--foreground)', fontWeight: 500 }}>Generating Gap Analysis</p>
                            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>AI is analysing your compliance gaps…</p>
                        </div>
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                </div>
            )}

            {/* Executive Summary overlay */}
            {generating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="mx-4 flex max-w-sm flex-col items-center gap-4 rounded-2xl p-8 bg-card border" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
                        <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'color-mix(in srgb, var(--primary) 12%, transparent)', borderColor: 'color-mix(in srgb, var(--primary) 30%, transparent)', borderWidth: '1px' }}>
                            <Sparkles className="h-7 w-7 animate-pulse text-primary" />
                        </div>
                        <div className="text-center">
                            <p className="text-xl" style={{ color: 'var(--foreground)', fontWeight: 500 }}>Generating Executive Summary</p>
                            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>AI is analysing your GRC data…</p>
                        </div>
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div
                    className="fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-full px-4 py-3 text-[10px] uppercase"
                    style={{
                        ...(toast.type === 'success'
                            ? { background: 'rgba(70,189,95,0.12)', borderColor: 'rgba(70,189,95,0.4)', color: '#46bd5f' }
                            : { background: 'color-mix(in srgb, var(--destructive) 12%, transparent)', borderColor: 'color-mix(in srgb, var(--destructive) 40%, transparent)', color: 'var(--destructive)' }
                        ),
                        borderWidth: '1px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                        letterSpacing: '0.28em',
                    }}
                >
                    {toast.type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
                    <span>{toast.text}</span>
                </div>
            )}
        </AdminLayout>
    );
}
