import { Head, Link } from '@inertiajs/react';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { StatStrip } from '@/components/ui/stat-strip';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
    AlertTriangle, ClipboardList, TrendingUp, CheckCircle,
    XCircle, Clock, Eye, Download, Sparkles, Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { downloadPdf } from '@/lib/download-pdf';

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

const complianceColor = (pct: number) => pct >= 80 ? '#8B9E6B' : pct >= 50 ? '#C9A962' : '#8B2635';
const complianceStyle = (pct: number): React.CSSProperties => ({ color: complianceColor(pct) });

const RISK_COLORS = { critical: '#8B2635', high: '#B07840', medium: '#C9A962', low: '#8B9E6B' };

const tooltipStyle = {
    contentStyle: { backgroundColor: '#251E19', border: '1px solid #4A3F35', borderRadius: '4px', fontFamily: "'Crimson Pro', serif", color: '#E8DFD4' },
    labelStyle:   { color: '#C9A962', fontFamily: "'Cinzel', serif", fontSize: '10px' },
};
const axisStyle = { fill: '#9C8B7A', fontSize: 11, fontFamily: "'Cinzel', serif" };

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
                    <PageHeader icon={TrendingUp} title="Reports" description="Organisation security and compliance summary" />
                    <div className="flex shrink-0 items-center gap-2 pt-1">
                        <span className="font-display text-[9px] uppercase tracking-wider" style={{ color: 'rgba(156,139,122,0.6)' }}>
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
                        <CardHeader><CardTitle className="font-heading text-lg font-normal">Overall Compliance</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-4">
                                <span className="font-heading text-7xl font-normal" style={complianceStyle(overallCompliance)}>
                                    {overallCompliance}%
                                </span>
                                <p className="font-body mt-2 text-sm italic" style={{ color: '#9C8B7A' }}>Across all frameworks</p>
                                <div className="mt-4 h-1 w-full overflow-hidden rounded-full" style={{ background: 'rgba(74,63,53,0.5)' }}>
                                    <div className="h-full rounded-full transition-all" style={{ width: `${overallCompliance}%`, backgroundColor: complianceColor(overallCompliance) }} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-2">
                        <CardHeader><CardTitle className="font-heading text-lg font-normal">Compliance by Framework</CardTitle></CardHeader>
                        <CardContent>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={frameworkChartData} barSize={40}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#4A3F35" vertical={false} />
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
                                        <span className="font-body text-sm" style={{ color: '#E8DFD4' }}>{f.short_name}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="font-body text-xs italic" style={{ color: '#9C8B7A' }}>
                                                {f.assessments_count} assessment{f.assessments_count !== 1 ? 's' : ''}
                                            </span>
                                            {f.latest_score !== null
                                                ? <span className="font-heading text-base" style={complianceStyle(f.latest_score)}>{f.latest_score}%</span>
                                                : <span className="font-body text-xs italic" style={{ color: '#9C8B7A' }}>No data</span>
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
                        <CardHeader><CardTitle className="font-heading text-lg font-normal">Compliance Trend — Last 6 Months</CardTitle></CardHeader>
                        <CardContent>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={monthlyTrend}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#4A3F35" vertical={false} />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisStyle} />
                                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={axisStyle} />
                                        <Tooltip {...tooltipStyle} formatter={(v: any) => [`${v}%`, 'Avg Compliance']} />
                                        <Line type="monotone" dataKey="score" stroke="#C9A962" strokeWidth={2} dot={{ fill: '#C9A962', r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Risk Summary */}
                <div className="grid grid-cols-3 gap-6">
                    <Card>
                        <CardHeader><CardTitle className="font-heading text-lg font-normal">Risks by Level</CardTitle></CardHeader>
                        <CardContent>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={riskLevelData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value">
                                            {riskLevelData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip {...tooltipStyle} />
                                        <Legend iconSize={8} wrapperStyle={{ fontSize: 10, fontFamily: "'Cinzel', serif", color: '#9C8B7A' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                {riskLevelData.map((r) => (
                                    <div key={r.name} className="flex items-center gap-2">
                                        <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.color }} />
                                        <span className="font-body text-xs" style={{ color: '#9C8B7A' }}>
                                            {r.name}: <span className="font-heading not-italic" style={{ color: '#E8DFD4' }}>{r.value}</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="font-heading text-lg font-normal">Risks by Category</CardTitle></CardHeader>
                        <CardContent>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={riskCategoryData} layout="vertical" barSize={10}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#4A3F35" horizontal={false} />
                                        <XAxis type="number" axisLine={false} tickLine={false} tick={axisStyle} />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ ...axisStyle, fontSize: 9 }} width={85} />
                                        <Tooltip {...tooltipStyle} />
                                        <Bar dataKey="value" fill="#C9A962" radius={[0, 3, 3, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="font-heading text-lg font-normal">Risks by Status</CardTitle></CardHeader>
                        <CardContent className="space-y-2 pt-2">
                            {[
                                { label: 'Open',         value: riskByStatus.open,         icon: AlertTriangle, color: '#8B2635', bg: 'rgba(139,38,53,0.1)'  },
                                { label: 'In Progress',  value: riskByStatus.in_progress,  icon: Clock,         color: '#C9A962', bg: 'rgba(201,169,98,0.1)' },
                                { label: 'Under Review', value: riskByStatus.under_review, icon: Eye,           color: '#B07840', bg: 'rgba(176,120,64,0.1)' },
                                { label: 'Closed',       value: riskByStatus.closed,       icon: CheckCircle,   color: '#8B9E6B', bg: 'rgba(139,158,107,0.1)' },
                            ].map(({ label, value, icon: Icon, color, bg }) => (
                                <div key={label} className="flex items-center justify-between rounded p-3" style={{ background: bg, border: `1px solid ${color}33` }}>
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" style={{ color }} strokeWidth={1.5} />
                                        <span className="font-display text-[10px] uppercase tracking-[0.1em]" style={{ color: '#E8DFD4' }}>{label}</span>
                                    </div>
                                    <span className="font-heading text-xl font-normal" style={{ color }}>{value}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Assessment History */}
                <Card>
                    <CardHeader><CardTitle className="font-heading text-lg font-normal">Assessment History</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        {assessmentHistory.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="font-body italic" style={{ color: '#9C8B7A' }}>
                                    No completed assessments yet.{' '}
                                    <Link href="/assessments" style={{ color: '#C9A962' }}>Start one.</Link>
                                </p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead style={{ borderTop: '1px solid #4A3F35', borderBottom: '1px solid #4A3F35', background: 'rgba(37,30,25,0.6)' }}>
                                    <tr>
                                        {['Assessment', 'Framework', 'Period', 'Score', 'Completed', 'By'].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left font-display text-[9px] uppercase tracking-[0.15em]" style={{ color: '#9C8B7A' }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {assessmentHistory.map((a) => (
                                        <tr key={a.id} className="transition-colors" style={{ borderBottom: '1px solid rgba(74,63,53,0.4)' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(61,51,43,0.3)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            <td className="px-4 py-3">
                                                <Link href={route('assessments.show', a.id)} className="font-body text-sm transition-colors" style={{ color: '#C9A962' }}
                                                    onMouseEnter={e => (e.currentTarget.style.color = '#E8DFD4')}
                                                    onMouseLeave={e => (e.currentTarget.style.color = '#C9A962')}
                                                >
                                                    {a.title}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline">{a.framework}</Badge>
                                            </td>
                                            <td className="px-4 py-3 font-body italic" style={{ color: '#9C8B7A' }}>{a.period}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1 w-16 overflow-hidden rounded-full" style={{ background: 'rgba(74,63,53,0.5)' }}>
                                                        <div className="h-full rounded-full" style={{ width: `${a.compliance_percentage}%`, background: complianceColor(a.compliance_percentage) }} />
                                                    </div>
                                                    <span className="font-heading text-base" style={complianceStyle(a.compliance_percentage)}>
                                                        {a.compliance_percentage}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-display text-[10px]" style={{ color: '#9C8B7A' }}>{a.completed_at}</td>
                                            <td className="px-4 py-3 font-body italic" style={{ color: '#9C8B7A' }}>{a.user}</td>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(28,23,20,0.85)', backdropFilter: 'blur(4px)' }}>
                    <div className="mx-4 flex max-w-sm flex-col items-center gap-4 rounded p-8" style={{ background: '#251E19', border: '1px solid #4A3F35', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}>
                        <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'rgba(201,169,98,0.1)', border: '1px solid rgba(201,169,98,0.3)' }}>
                            <Sparkles className="h-7 w-7 animate-pulse" style={{ color: '#C9A962' }} />
                        </div>
                        <div className="text-center">
                            <p className="font-heading text-xl font-normal" style={{ color: '#E8DFD4' }}>Generating Gap Analysis</p>
                            <p className="font-body text-sm italic" style={{ color: '#9C8B7A' }}>AI is analysing your compliance gaps…</p>
                        </div>
                        <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#C9A962' }} />
                    </div>
                </div>
            )}

            {/* Executive Summary overlay */}
            {generating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(28,23,20,0.85)', backdropFilter: 'blur(4px)' }}>
                    <div className="mx-4 flex max-w-sm flex-col items-center gap-4 rounded p-8" style={{ background: '#251E19', border: '1px solid #4A3F35', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}>
                        <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'rgba(201,169,98,0.1)', border: '1px solid rgba(201,169,98,0.3)' }}>
                            <Sparkles className="h-7 w-7 animate-pulse" style={{ color: '#C9A962' }} />
                        </div>
                        <div className="text-center">
                            <p className="font-heading text-xl font-normal" style={{ color: '#E8DFD4' }}>Generating Executive Summary</p>
                            <p className="font-body text-sm italic" style={{ color: '#9C8B7A' }}>AI is analysing your GRC data…</p>
                        </div>
                        <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#C9A962' }} />
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div
                    className="fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded px-4 py-3 font-display text-[10px] uppercase tracking-widest"
                    style={toast.type === 'success'
                        ? { background: 'rgba(139,158,107,0.15)', border: '1px solid rgba(139,158,107,0.4)', color: '#8B9E6B', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }
                        : { background: 'rgba(139,38,53,0.15)',  border: '1px solid rgba(139,38,53,0.4)',  color: '#8B2635', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }
                    }
                >
                    {toast.type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
                    <span>{toast.text}</span>
                </div>
            )}
        </AdminLayout>
    );
}
