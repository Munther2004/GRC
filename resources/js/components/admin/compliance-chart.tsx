import {
    RadialBarChart,
    RadialBar,
    ResponsiveContainer,
    Legend,
    PolarAngleAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type FrameworkScore = {
    name: string;
    value: number;
    fill: string;
};

type Props = {
    score?: number;
    frameworkScores?: FrameworkScore[];
};

const defaultFrameworks: FrameworkScore[] = [
    { name: 'ISO 27001', value: 0, fill: 'var(--chart-1)' },
    { name: 'NIST 800-53', value: 0, fill: 'var(--chart-2)' },
    { name: 'OWASP ASVS', value: 0, fill: 'var(--chart-3)' },
    { name: 'CIS Benchmarks', value: 0, fill: 'var(--chart-4)' },
];

export function ComplianceChart({ score = 0, frameworkScores }: Props) {
    const data = frameworkScores ?? defaultFrameworks;

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg" style={{ fontWeight: 500 }}>
                    Compliance by framework
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative h-[280px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                            cx="50%"
                            cy="50%"
                            innerRadius="20%"
                            outerRadius="90%"
                            barSize={12}
                            data={data}
                            startAngle={90}
                            endAngle={-270}
                        >
                            <PolarAngleAxis
                                type="number"
                                domain={[0, 100]}
                                angleAxisId={0}
                                tick={false}
                            />
                            <RadialBar
                                background={{ fill: 'color-mix(in srgb, var(--primary) 12%, transparent)' }}
                                dataKey="value"
                                cornerRadius={6}
                            />
                            <Legend
                                iconSize={10}
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                                wrapperStyle={{
                                    fontSize: '12px',
                                    paddingTop: '20px',
                                }}
                                formatter={(value: string, entry: any) => (
                                    <span style={{ color: 'var(--muted-foreground)', fontSize: '11px', letterSpacing: '0.05em' }}>
                                        {value} ({entry.payload.value}%)
                                    </span>
                                )}
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>

                    {/* Center score */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none',
                            marginTop: '-40px',
                        }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <div className="text-3xl tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 500, letterSpacing: '-0.02em' }}>
                                {Math.round(score)}%
                            </div>
                            <div className="mt-1 text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
                                Overall
                            </div>
                        </div>
                    </div>
                </div>

                {data.every((d) => d.value === 0) && (
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                        Complete assessments to see compliance scores
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
