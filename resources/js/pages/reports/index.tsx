import { Head, Link } from '@inertiajs/react';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { StatStrip } from '@/components/ui/stat-strip';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';
import {
    Shield,
    AlertTriangle,
    ClipboardList,
    TrendingUp,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Download,
    Sparkles,
    Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { downloadPdf } from '@/lib/download-pdf';

interface Props {
    overallCompliance: number;
    complianceByFramework: {
        id: number;
        name: string;
        short_name: string;
        latest_score: number | null;
        assessments_count: number;
        trend: number[];
    }[];
    riskByLevel: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    riskByCategory: Record<string, number>;
    riskByStatus: {
        open: number;
        in_progress: number;
        under_review: number;
        closed: number;
    };
    assessmentHistory: {
        id: number;
        title: string;
        framework: string;
        compliance_percentage: number;
        period: string;
        completed_at: string;
        user: string;
    }[];
    monthlyTrend: { month: string; score: number }[];
    stats: {
        total_risks: number;
        open_risks: number;
        total_assessments: number;
        total_frameworks: number;
    };
}

const complianceColor = (pct: number) => {
    if (pct >= 80) return '#22c55e';
    if (pct >= 50) return '#f59e0b';
    return '#ef4444';
};

const complianceTextColor = (pct: number) => {
    if (pct >= 80) return 'text-emerald-400';
    if (pct >= 50) return 'text-amber-400';
    return 'text-red-500';
};

const RISK_COLORS = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#f59e0b',
    low: '#22c55e',
};

export default function ReportsIndex({
    overallCompliance,
    complianceByFramework,
    riskByLevel,
    riskByCategory,
    riskByStatus,
    assessmentHistory,
    monthlyTrend,
    stats,
}: Props) {
    const [generating, setGenerating] = useState(false);
    const [generatingGap, setGeneratingGap] = useState(false);
    const [toast, setToast] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(t);
    }, [toast]);

    const generateExecutiveSummary = async () => {
        if (generating) return;
        setGenerating(true);
        try {
            await downloadPdf(
                '/reports/executive-summary',
                `executive-summary-${new Date().toISOString().split('T')[0]}.pdf`,
            );
        } catch {
            setToast({
                type: 'error',
                text: 'Failed to generate report. Please try again.',
            });
        } finally {
            setGenerating(false);
        }
    };

    const generateGapReport = async () => {
        if (generatingGap) return;
        setGeneratingGap(true);
        try {
            const res = await fetch('/gap-analysis/report', {
                method: 'GET',
                headers: { Accept: 'application/pdf' },
            });
            if (!res.ok) throw new Error('Server error');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gap-analysis-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch {
            setToast({
                type: 'error',
                text: 'Failed to generate gap analysis. Please try again.',
            });
        } finally {
            setGeneratingGap(false);
        }
    };

    const riskLevelData = [
        {
            name: 'Critical',
            value: riskByLevel.critical,
            color: RISK_COLORS.critical,
        },
        { name: 'High', value: riskByLevel.high, color: RISK_COLORS.high },
        {
            name: 'Medium',
            value: riskByLevel.medium,
            color: RISK_COLORS.medium,
        },
        { name: 'Low', value: riskByLevel.low, color: RISK_COLORS.low },
    ];

    const riskCategoryData = Object.entries(riskByCategory).map(
        ([name, value]) => ({ name, value }),
    );

    const frameworkChartData = complianceByFramework.map((f) => ({
        name: f.short_name,
        score: f.latest_score ?? 0,
    }));

    return (
        <AdminLayout>
            <Head title="Reports" />

            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <PageHeader
                        icon={TrendingUp}
                        title="Reports"
                        description="Organization security and compliance summary"
                    />
                    <div className="flex items-center gap-3">
                        <p className="text-xs text-muted-foreground/70">
                            Generated: {new Date().toLocaleDateString()}
                        </p>
                        <a href="/reports/export-pdf" target="_blank">
                            <Button variant="outline" className="gap-2 text-sm">
                                <Download className="h-4 w-4" /> Export PDF
                            </Button>
                        </a>
                        <Button
                            className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-sm text-white hover:from-violet-700 hover:to-purple-700"
                            onClick={generateGapReport}
                            disabled={generatingGap}
                        >
                            {generatingGap ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />{' '}
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" /> Gap
                                    Analysis
                                </>
                            )}
                        </Button>
                        <Button
                            className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-sm text-white hover:from-blue-700 hover:to-indigo-700"
                            onClick={generateExecutiveSummary}
                            disabled={generating}
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />{' '}
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" /> Executive
                                    Summary
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <StatStrip
                    stats={[
                        {
                            label: 'Overall Compliance',
                            value: `${overallCompliance}%`,
                            variant: 'primary',
                        },
                        {
                            label: 'Total Risks',
                            value: stats.total_risks,
                            variant: 'warning',
                        },
                        {
                            label: 'Open Risks',
                            value: stats.open_risks,
                            variant: 'danger',
                        },
                        {
                            label: 'Assessments Done',
                            value: stats.total_assessments,
                            variant: 'success',
                        },
                    ]}
                />

                {/* Compliance Overview */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Overall Score */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Overall Compliance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-4">
                                <span
                                    className={`text-7xl font-bold ${complianceTextColor(overallCompliance)}`}
                                >
                                    {overallCompliance}%
                                </span>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Across all frameworks
                                </p>
                                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                            width: `${overallCompliance}%`,
                                            backgroundColor:
                                                complianceColor(
                                                    overallCompliance,
                                                ),
                                        }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Per Framework Bar Chart */}
                    <Card className="col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Compliance by Framework
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={frameworkChartData}
                                        barSize={40}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#e5e7eb"
                                        />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <Tooltip
                                            formatter={(v: any) => [
                                                `${v}%`,
                                                'Compliance',
                                            ]}
                                        />
                                        <Bar
                                            dataKey="score"
                                            radius={[4, 4, 0, 0]}
                                        >
                                            {frameworkChartData.map(
                                                (entry, i) => (
                                                    <Cell
                                                        key={i}
                                                        fill={complianceColor(
                                                            entry.score,
                                                        )}
                                                    />
                                                ),
                                            )}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Framework detail rows */}
                            <div className="mt-4 space-y-2">
                                {complianceByFramework.map((f) => (
                                    <div
                                        key={f.id}
                                        className="flex items-center justify-between text-sm"
                                    >
                                        <span className="font-medium">
                                            {f.short_name}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-muted-foreground">
                                                {f.assessments_count} assessment
                                                {f.assessments_count !== 1
                                                    ? 's'
                                                    : ''}
                                            </span>
                                            {f.latest_score !== null ? (
                                                <span
                                                    className={`font-bold ${complianceTextColor(f.latest_score)}`}
                                                >
                                                    {f.latest_score}%
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    No data
                                                </span>
                                            )}
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
                        <CardHeader>
                            <CardTitle className="text-base">
                                Compliance Trend — Last 6 Months
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={monthlyTrend}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#e5e7eb"
                                        />
                                        <XAxis
                                            dataKey="month"
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <Tooltip
                                            formatter={(v: any) => [
                                                `${v}%`,
                                                'Avg Compliance',
                                            ]}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="score"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            dot={{ fill: '#3b82f6', r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Risk Summary */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Risk by Level — Pie */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Risks by Level
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={riskLevelData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            dataKey="value"
                                        >
                                            {riskLevelData.map((entry, i) => (
                                                <Cell
                                                    key={i}
                                                    fill={entry.color}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend
                                            iconSize={10}
                                            wrapperStyle={{ fontSize: 12 }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                {riskLevelData.map((r) => (
                                    <div
                                        key={r.name}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        <div
                                            className="h-3 w-3 shrink-0 rounded-full"
                                            style={{ backgroundColor: r.color }}
                                        />
                                        <span className="text-foreground/80">
                                            {r.name}: <strong>{r.value}</strong>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Risk by Category */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Risks by Category
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={riskCategoryData}
                                        layout="vertical"
                                        barSize={14}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#e5e7eb"
                                        />
                                        <XAxis
                                            type="number"
                                            tick={{ fontSize: 11 }}
                                        />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            tick={{ fontSize: 10 }}
                                            width={90}
                                        />
                                        <Tooltip />
                                        <Bar
                                            dataKey="value"
                                            fill="#3b82f6"
                                            radius={[0, 4, 4, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Risk by Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Risks by Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-2">
                            {[
                                {
                                    label: 'Open',
                                    value: riskByStatus.open,
                                    icon: AlertTriangle,
                                    color: 'text-red-500',
                                    bg: 'bg-red-50 dark:bg-red-950',
                                },
                                {
                                    label: 'In Progress',
                                    value: riskByStatus.in_progress,
                                    icon: Clock,
                                    color: 'text-primary',
                                    bg: 'bg-blue-50 dark:bg-blue-950',
                                },
                                {
                                    label: 'Under Review',
                                    value: riskByStatus.under_review,
                                    icon: Eye,
                                    color: 'text-yellow-500',
                                    bg: 'bg-yellow-50 dark:bg-yellow-950',
                                },
                                {
                                    label: 'Closed',
                                    value: riskByStatus.closed,
                                    icon: CheckCircle,
                                    color: 'text-green-500',
                                    bg: 'bg-green-50 dark:bg-green-950',
                                },
                            ].map(({ label, value, icon: Icon, color, bg }) => (
                                <div
                                    key={label}
                                    className={`flex items-center justify-between rounded-lg p-3 ${bg}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon className={`h-4 w-4 ${color}`} />
                                        <span className="text-sm font-medium">
                                            {label}
                                        </span>
                                    </div>
                                    <span className="text-xl font-bold">
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Assessment History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Assessment History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {assessmentHistory.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No completed assessments yet.
                                <Link
                                    href="/assessments"
                                    className="ml-1 text-primary hover:underline"
                                >
                                    Start one.
                                </Link>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="border-y border-border bg-muted/30">
                                    <tr>
                                        {[
                                            'Assessment',
                                            'Framework',
                                            'Period',
                                            'Score',
                                            'Completed',
                                            'By',
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
                                    {assessmentHistory.map((a) => (
                                        <tr
                                            key={a.id}
                                            className="hover:bg-accent/30"
                                        >
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={route(
                                                        'assessments.show',
                                                        a.id,
                                                    )}
                                                    className="font-medium text-primary hover:underline"
                                                >
                                                    {a.title}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {a.framework}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-foreground/80">
                                                {a.period}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-16 overflow-hidden rounded-full bg-secondary">
                                                        <div
                                                            className="h-full rounded-full"
                                                            style={{
                                                                width: `${a.compliance_percentage}%`,
                                                                backgroundColor:
                                                                    complianceColor(
                                                                        a.compliance_percentage,
                                                                    ),
                                                            }}
                                                        />
                                                    </div>
                                                    <span
                                                        className={`font-semibold ${complianceTextColor(a.compliance_percentage)}`}
                                                    >
                                                        {
                                                            a.compliance_percentage
                                                        }
                                                        %
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {a.completed_at}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {a.user}
                                            </td>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="mx-4 flex max-w-sm flex-col items-center gap-4 rounded-xl bg-background p-8 shadow-2xl">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 dark:bg-violet-950">
                            <Sparkles className="h-7 w-7 animate-pulse text-violet-600" />
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-foreground">
                                Generating Gap Analysis
                            </p>
                            <p className="text-sm text-muted-foreground">
                                AI is analysing your compliance gaps&hellip;
                            </p>
                        </div>
                        <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                    </div>
                </div>
            )}

            {/* Executive Summary overlay */}
            {generating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="mx-4 flex max-w-sm flex-col items-center gap-4 rounded-xl bg-background p-8 shadow-2xl">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">
                            <Sparkles className="h-7 w-7 animate-pulse text-blue-400" />
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-foreground">
                                Generating Executive Summary
                            </p>
                            <p className="text-sm text-muted-foreground">
                                AI is analysing your GRC data&hellip;
                            </p>
                        </div>
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div
                    className={`fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
                >
                    {toast.type === 'success' ? (
                        <CheckCircle className="h-4 w-4 shrink-0" />
                    ) : (
                        <XCircle className="h-4 w-4 shrink-0" />
                    )}
                    <span>{toast.text}</span>
                </div>
            )}
        </AdminLayout>
    );
}
