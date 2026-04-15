import { RadialBarChart, RadialBar, ResponsiveContainer, Legend, PolarAngleAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type FrameworkScore = {
    name: string
    value: number
    fill: string
}

type Props = {
    score?: number
    frameworkScores?: FrameworkScore[]
}

const defaultFrameworks: FrameworkScore[] = [
    { name: "ISO 27001",      value: 0, fill: "#3b82f6" },
    { name: "NIST 800-53",    value: 0, fill: "#8b5cf6" },
    { name: "OWASP ASVS",     value: 0, fill: "#f59e0b" },
    { name: "CIS Benchmarks", value: 0, fill: "#22c55e" },
]

export function ComplianceChart({ score = 0, frameworkScores }: Props) {
    const data = frameworkScores ?? defaultFrameworks

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Compliance by Framework</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="w-full h-[280px] relative">
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
                                background={{ fill: 'rgba(255,255,255,0.05)' }}
                                dataKey="value"
                                cornerRadius={6}
                            />
                            <Legend
                                iconSize={10}
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                                wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                                formatter={(value: string, entry: any) => (
                                    <span style={{ color: '#888' }}>
                                        {value} ({entry.payload.value}%)
                                    </span>
                                )}
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>

                    {/* Center score */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', pointerEvents: 'none',
                        marginTop: '-40px'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div className="text-3xl font-bold">{Math.round(score)}%</div>
                            <div className="text-xs text-muted-foreground">Overall</div>
                        </div>
                    </div>
                </div>

                {data.every(d => d.value === 0) && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                        Complete assessments to see compliance scores
                    </p>
                )}
            </CardContent>
        </Card>
    )
}