import { Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Clock,
    FileCheck,
    Zap,
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { ComplianceChart } from '@/components/admin/compliance-chart';
import { MetricsCards } from '@/components/admin/metrics-cards';
import { QuickActions } from '@/components/admin/quick-actions';
import { RecentAlerts } from '@/components/admin/recent-alerts';
import { RiskHeatmap } from '@/components/admin/risk-heatmap';
import { RiskTrendChart } from '@/components/admin/risk-trend-chart';
import { TopRisks } from '@/components/admin/top-risks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';

type Stats = {
    total_risks: number;
    critical_risks: number;
    high_risks: number;
    medium_risks: number;
    low_risks: number;
    open_risks: number;
    compliance_score: number;
    total_assessments: number;
    evidence_files: number;
    pending_evidence: number;
};

type Risk = {
    id: number;
    title: string;
    category: string;
    owner: string;
    impact: number;
    likelihood: number;
    risk_level: string;
    risk_score: number;
    status: string;
};

type HeatmapRisk = {
    id: number;
    title: string;
    likelihood: number;
    impact: number;
    score: number;
    status: string;
};

type Kpis = {
    evidence_approval_rate: number;
    open_risks_by_level: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    assessments_due_soon: number;
    pending_evidence: number;
    compliance_this_week: number;
    compliance_last_week: number;
};

type NotificationItem = {
    id: number;
    type: string;
    is_read: boolean;
};

type KriSnapshot = {
    snapshot_date: string;
    compliance_percentage: number;
    open_risks_critical: number;
    open_risks_high: number;
    open_risks_medium: number;
    open_risks_low: number;
    overdue_risks: number;
    overdue_assessments: number;
    evidence_approval_rate: number;
    ai_generated_risks: number;
    total_risks: number;
    total_controls: number;
    compliant_controls: number;
};

type Props = {
    stats: Stats;
    recentRisks: Risk[];
    recentActivity: any[];
    recentAssessments: any[];
    trendData: any[];
    heatmap: HeatmapRisk[];
    kpis: Kpis;
    ruleAdjustments: number;
    lastSchedulerRun: string | null;
    kriSnapshots: KriSnapshot[];
};

function KpiCards({ kpis }: { kpis: Kpis }) {
    const approvalRate = kpis.evidence_approval_rate;
    const complianceDelta = +(
        kpis.compliance_this_week - kpis.compliance_last_week
    ).toFixed(1);
    const isUp = complianceDelta >= 0;

    const approvalColor =
        approvalRate >= 70
            ? 'text-green-500'
            : approvalRate >= 40
              ? 'text-yellow-500'
              : 'text-red-500';

    return (
        <div className="space-y-3">
            <h2 className="text-base font-semibold tracking-tight">
                Key Performance Indicators
            </h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {/* Card 1 — Evidence Approval Rate */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Evidence Approved
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className={`text-3xl font-bold ${approvalColor}`}>
                            {approvalRate}%
                        </p>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className={`h-full rounded-full transition-all ${approvalRate >= 70 ? 'bg-green-500' : approvalRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${approvalRate}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            of all evidence files
                        </p>
                    </CardContent>
                </Card>

                {/* Card 2 — Assessments Due Soon */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Due in Next 7 Days
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Clock
                                className={`h-5 w-5 ${kpis.assessments_due_soon > 0 ? 'text-red-500' : 'text-green-500'}`}
                            />
                            <p
                                className={`text-3xl font-bold ${kpis.assessments_due_soon > 0 ? 'text-red-500' : 'text-green-500'}`}
                            >
                                {kpis.assessments_due_soon}
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            assessments pending
                        </p>
                    </CardContent>
                </Card>

                {/* Card 3 — Compliance Trend */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Avg Compliance This Week
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <p className="text-3xl font-bold">
                            {kpis.compliance_this_week}%
                        </p>
                        <div
                            className={`flex items-center gap-1 text-xs font-medium ${isUp ? 'text-green-500' : 'text-red-500'}`}
                        >
                            {isUp ? (
                                <TrendingUp className="h-3.5 w-3.5" />
                            ) : (
                                <TrendingDown className="h-3.5 w-3.5" />
                            )}
                            {isUp ? '+' : ''}
                            {complianceDelta}% vs last week
                        </div>
                    </CardContent>
                </Card>

                {/* Card 4 — Pending Evidence */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Pending Review
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="flex items-center gap-2">
                            <FileCheck
                                className={`h-5 w-5 ${kpis.pending_evidence > 0 ? 'text-red-500' : 'text-green-500'}`}
                            />
                            <p
                                className={`text-3xl font-bold ${kpis.pending_evidence > 0 ? 'text-red-500' : 'text-green-500'}`}
                            >
                                {kpis.pending_evidence}
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            evidence files
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function formatSnapshotDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

function KriTrends({ snapshots }: { snapshots: KriSnapshot[] }) {
    const lastSnapshot =
        snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;

    const chartData = snapshots.map((s) => ({
        date: formatSnapshotDate(s.snapshot_date),
        compliance: s.compliance_percentage,
        critical: s.open_risks_critical,
        high: s.open_risks_high,
        medium: s.open_risks_medium,
        low: s.open_risks_low,
    }));

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold tracking-tight">
                    KRI Trends
                </h2>
                {lastSnapshot && (
                    <span className="text-xs text-muted-foreground">
                        Last snapshot:{' '}
                        {formatSnapshotDate(lastSnapshot.snapshot_date)}
                    </span>
                )}
            </div>

            {snapshots.length < 2 ? (
                <Card>
                    <CardContent className="p-8 text-center text-sm text-muted-foreground">
                        <p className="mb-1 font-medium">Not enough data yet</p>
                        <p>
                            Trends will appear after the first few nightly
                            snapshots.
                        </p>
                        <p className="mt-2 inline-block rounded bg-muted px-2 py-1 font-mono text-xs">
                            php artisan kri:snapshot
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Compliance Trend */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Compliance % Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart
                                    data={chartData}
                                    margin={{
                                        top: 5,
                                        right: 16,
                                        left: 0,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="currentColor"
                                        strokeOpacity={0.1}
                                    />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 11 }}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        tick={{ fontSize: 11 }}
                                        unit="%"
                                    />
                                    <Tooltip
                                        formatter={(v: number | string) => [
                                            `${v}%`,
                                            'Compliance',
                                        ]}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="compliance"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                        activeDot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Risk Distribution Trend */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Open Risk Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart
                                    data={chartData}
                                    margin={{
                                        top: 5,
                                        right: 16,
                                        left: 0,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="currentColor"
                                        strokeOpacity={0.1}
                                    />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 11 }}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fontSize: 11 }}
                                    />
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                    <Bar
                                        dataKey="critical"
                                        name="Critical"
                                        stackId="a"
                                        fill="#dc2626"
                                    />
                                    <Bar
                                        dataKey="high"
                                        name="High"
                                        stackId="a"
                                        fill="#f97316"
                                    />
                                    <Bar
                                        dataKey="medium"
                                        name="Medium"
                                        stackId="a"
                                        fill="#eab308"
                                    />
                                    <Bar
                                        dataKey="low"
                                        name="Low"
                                        stackId="a"
                                        fill="#16a34a"
                                        radius={[2, 2, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default function AdminDashboard({
    stats,
    recentRisks,
    recentActivity,
    trendData,
    heatmap,
    kpis,
    ruleAdjustments,
    lastSchedulerRun,
    kriSnapshots,
}: Props) {
    const { notifications } = usePage<{
        notifications: { unread_count: number; recent: NotificationItem[] };
    }>().props;
    const unreadCount = notifications?.unread_count ?? 0;
    const recent: NotificationItem[] = notifications?.recent ?? [];

    const hasCritical = recent.some(
        (n) => n.type === 'critical_risk' || n.type === 'overdue_risk',
    );
    const hasPending = recent.some(
        (n) => n.type === 'pending_evidence' || n.type === 'overdue_assessment',
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Your risk overview at a glance
                    </p>
                </div>

                {/* Notification banners */}
                {unreadCount > 0 && (
                    <div className="flex flex-col gap-3">
                        {hasCritical && (
                            <div className="flex items-center justify-between rounded-lg border border-red-800 bg-red-950 p-4">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
                                    <div>
                                        <p className="text-sm font-semibold text-red-200">
                                            Critical risks require your
                                            attention
                                        </p>
                                        <p className="text-xs text-red-400">
                                            Overdue risk treatments or critical
                                            alerts detected
                                        </p>
                                    </div>
                                </div>
                                <Link href="/notifications">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-red-700 text-red-300 hover:bg-red-900"
                                    >
                                        View All
                                    </Button>
                                </Link>
                            </div>
                        )}
                        {hasPending && (
                            <div className="flex items-center justify-between rounded-lg border border-yellow-800 bg-yellow-950 p-4">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-400" />
                                    <div>
                                        <p className="text-sm font-semibold text-yellow-200">
                                            {unreadCount} item
                                            {unreadCount > 1 ? 's' : ''} require
                                            your attention
                                        </p>
                                        <p className="text-xs text-yellow-400">
                                            Pending evidence or overdue
                                            assessments
                                        </p>
                                    </div>
                                </div>
                                <Link href="/notifications">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-yellow-700 text-yellow-300 hover:bg-yellow-900"
                                    >
                                        View All
                                    </Button>
                                </Link>
                            </div>
                        )}
                        {!hasCritical && !hasPending && (
                            <div className="flex items-center justify-between rounded-lg border border-red-800 bg-red-950 p-4">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
                                    <div>
                                        <p className="text-sm font-semibold text-red-200">
                                            {unreadCount} item
                                            {unreadCount > 1 ? 's' : ''} require
                                            your attention
                                        </p>
                                        <p className="text-xs text-red-400">
                                            Overdue risks, pending evidence, or
                                            critical alerts
                                        </p>
                                    </div>
                                </div>
                                <Link href="/notifications">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-red-700 text-red-300 hover:bg-red-900"
                                    >
                                        View All
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                <MetricsCards stats={stats} />
                <QuickActions />

                {/* KPI Section */}
                <KpiCards kpis={kpis} />

                {/* KRI Trends */}
                <KriTrends snapshots={kriSnapshots} />

                {/* Rule Adjustments Indicator */}
                <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm dark:border-blue-800 dark:bg-blue-950">
                    <Zap className="h-4 w-4 shrink-0 text-blue-500" />
                    <span className="text-blue-700 dark:text-blue-300">
                        <strong>{ruleAdjustments}</strong> risk score
                        {ruleAdjustments !== 1 ? 's' : ''} auto-adjusted by
                        compliance rules in the last 30 days
                    </span>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <RiskHeatmap risks={heatmap} />
                    </div>
                    <div>
                        <RecentAlerts activity={recentActivity} />
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <RiskTrendChart trendData={trendData} />
                    <ComplianceChart score={stats.compliance_score} />
                </div>

                <TopRisks risks={recentRisks} />

                <p className="pb-2 text-center text-xs text-gray-400 dark:text-gray-600">
                    🕐 Nightly checks run at 02:00 — Last run:{' '}
                    {lastSchedulerRun ?? 'Never'}
                </p>
            </div>
        </AdminLayout>
    );
}
