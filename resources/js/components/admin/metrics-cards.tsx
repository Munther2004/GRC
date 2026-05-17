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
    neutral: 'var(--muted-foreground)',
    warn:    'var(--border)',
    ok:      'var(--success)',
    bad:     'var(--destructive)',
};

const toneValueColor: Record<Metric['tone'], string> = {
    neutral: 'var(--foreground)',
    warn:    'var(--border)',
    ok:      'var(--success)',
    bad:     'var(--destructive)',
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
            value: stats.total_assessments > 0 ? `${Math.round(stats.compliance_score)}%` : '-',
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
            className="grid grid-cols-2 overflow-hidden rounded-2xl lg:grid-cols-4"
            style={{
                gap: '1px',
                background: 'var(--border)',
                boxShadow: '0 10px 30px -16px color-mix(in srgb, var(--foreground) 18%, transparent)',
                border: '1px solid var(--border)',
            }}
        >
            {metrics.map((metric) => (
                <Card
                    key={metric.title}
                    className="rounded-none border-0 shadow-none hover:shadow-none hover:translate-y-0"
                    style={{ background: 'var(--card)' }}
                >
                    <div className="px-5 py-5">
                        <div className="flex items-center gap-2">
                            <span
                                className="h-1.5 w-1.5 rounded-full shrink-0"
                                style={{ background: toneColor[metric.tone] }}
                            />
                            <p className="text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
                                {metric.title}
                            </p>
                        </div>
                        <p
                            className="mt-3 text-3xl tabular-nums leading-none"
                            style={{ color: toneValueColor[metric.tone], fontWeight: 500, letterSpacing: '-0.02em' }}
                        >
                            {metric.value}
                        </p>
                        <p className="mt-2 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                            {metric.sub}
                        </p>
                    </div>
                </Card>
            ))}
        </div>
    );
}
