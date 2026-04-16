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
    { name: 'ISO 27001', value: 0, fill: '#3b82f6' },
    { name: 'NIST 800-53', value: 0, fill: '#8b5cf6' },
    { name: 'OWASP ASVS', value: 0, fill: '#f59e0b' },
    { name: 'CIS Benchmarks', value: 0, fill: '#22c55e' },
];

export function ComplianceChart({ score = 0, frameworkScores }: Props) {
    const data = frameworkScores ?? defaultFrameworks;

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="font-heading text-lg font-normal">
                    Compliance by Framework
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative h-[280px] w-full">
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
                                background={{ fill: 'rgba(74,63,53,0.3)' }}
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
                                    <span style={{ color: '#9C8B7A', fontFamily: "'Cinzel', serif", fontSize: '10px', letterSpacing: '0.05em' }}>
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
                            <div className="font-heading text-3xl font-normal" style={{ color: '#E8DFD4' }}>
                                {Math.round(score)}%
                            </div>
                            <div className="font-display text-[9px] uppercase tracking-[0.2em]" style={{ color: '#9C8B7A' }}>
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
