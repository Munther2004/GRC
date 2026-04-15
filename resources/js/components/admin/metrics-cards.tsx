import { Card } from '@/components/ui/card';

type Stats = {
    total_risks: number;
    critical_risks: number;
    compliance_score: number;
    open_risks: number;
    total_assessments: number;
    evidence_files: number;
};

type Metric = {
    title: string;
    value: string;
    sub: string;
    tone: 'neutral' | 'warn' | 'ok' | 'bad';
};

export function MetricsCards({ stats }: { stats: Stats }) {
    const metrics: Metric[] = [
        {
            title: 'Total Risks',
            value: stats.total_risks.toString(),
            sub: `${stats.open_risks} open`,
            tone: 'neutral',
        },
        {
            title: 'Critical Risks',
            value: stats.critical_risks.toString(),
            sub: 'need action',
            tone: stats.critical_risks > 0 ? 'bad' : 'ok',
        },
        {
            title: 'Avg Compliance',
            value:
                stats.total_assessments > 0
                    ? `${Math.round(stats.compliance_score)}%`
                    : '—',
            sub:
                stats.total_assessments > 0
                    ? 'across all assessments'
                    : 'no assessments yet',
            tone:
                stats.compliance_score >= 70
                    ? 'ok'
                    : stats.compliance_score >= 40
                      ? 'warn'
                      : 'bad',
        },
        {
            title: 'Assessments',
            value: stats.total_assessments.toString(),
            sub: `${stats.evidence_files} evidence files`,
            tone: 'neutral',
        },
    ];

    const dotTone = (t: Metric['tone']) =>
        ({
            neutral: 'bg-foreground/40',
            warn: 'bg-amber-400',
            ok: 'bg-emerald-400',
            bad: 'bg-red-400',
        })[t];

    return (
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">
            {metrics.map((metric) => (
                <Card
                    key={metric.title}
                    className="rounded-none border-0 bg-card shadow-none"
                >
                    <div className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                            <span
                                className={`h-1 w-1 rounded-full ${dotTone(metric.tone)}`}
                            />
                            <p className="text-[11px] font-medium tracking-tight text-muted-foreground">
                                {metric.title}
                            </p>
                        </div>
                        <p className="mt-2.5 text-3xl font-semibold tracking-tight text-foreground tabular-nums">
                            {metric.value}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/80">
                            {metric.sub}
                        </p>
                    </div>
                </Card>
            ))}
        </div>
    );
}
