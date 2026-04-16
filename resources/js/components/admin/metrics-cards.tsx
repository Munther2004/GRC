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

const toneColor: Record<Metric['tone'], string> = {
    neutral: '#7ABFA8',
    warn:    '#285A48',
    ok:      '#B0E4CC',
    bad:     '#8B2635',
};

export function MetricsCards({ stats }: { stats: Stats }) {
    const metrics: Metric[] = [
        {
            title: 'Total Risks',
            value: stats.total_risks.toString(),
            sub:   `${stats.open_risks} open`,
            tone:  'neutral',
        },
        {
            title: 'Critical Risks',
            value: stats.critical_risks.toString(),
            sub:   'need action',
            tone:  stats.critical_risks > 0 ? 'bad' : 'ok',
        },
        {
            title: 'Avg Compliance',
            value: stats.total_assessments > 0 ? `${Math.round(stats.compliance_score)}%` : '—',
            sub:   stats.total_assessments > 0 ? 'across all assessments' : 'no assessments yet',
            tone:  stats.compliance_score >= 70 ? 'ok' : stats.compliance_score >= 40 ? 'warn' : 'bad',
        },
        {
            title: 'Assessments',
            value: stats.total_assessments.toString(),
            sub:   `${stats.evidence_files} evidence files`,
            tone:  'neutral',
        },
    ];

    return (
        <div
            className="grid grid-cols-2 overflow-hidden rounded lg:grid-cols-4"
            style={{ gap: '1px', background: '#285A48' }}
        >
            {metrics.map((metric, idx) => (
                <Card
                    key={metric.title}
                    className="rounded-none border-0 shadow-none"
                    style={{ background: '#0D1F1C' }}
                >
                    <div
                        className="px-5 py-4"
                        style={idx === 0 ? { borderLeft: '2px solid #408A71' } : {}}
                    >
                        <div className="flex items-center gap-1.5">
                            <span
                                className="h-1 w-1 rounded-full shrink-0"
                                style={{ background: toneColor[metric.tone] }}
                            />
                            <p className="font-display text-[9px] uppercase tracking-[0.2em]" style={{ color: '#7ABFA8' }}>
                                {metric.title}
                            </p>
                        </div>
                        <p
                            className="font-heading mt-2.5 text-3xl font-normal tabular-nums"
                            style={{ color: toneColor[metric.tone] === '#7ABFA8' ? '#E0F5EC' : toneColor[metric.tone] }}
                        >
                            {metric.value}
                        </p>
                        <p className="font-body mt-1 text-xs italic" style={{ color: 'rgba(156,139,122,0.8)' }}>
                            {metric.sub}
                        </p>
                    </div>
                </Card>
            ))}
        </div>
    );
}
