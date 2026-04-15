import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type TrendDataPoint = {
    month: string
    critical: number
    high: number
    medium: number
    low: number
}

type Props = {
    trendData?: TrendDataPoint[]
}

const COLORS = {
    critical: "#ef4444",
    high:     "#f59e0b",
    medium:   "#eab308",
    low:      "#22c55e",
}

export function RiskTrendChart({ trendData = [] }: Props) {
    const hasData = trendData.length > 0

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Risk Trend</CardTitle>
                <p className="text-[11px] text-muted-foreground">
                    Risk levels over time — ISO/IEC 27005 scoring
                </p>
            </CardHeader>
            <CardContent>
                {!hasData ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">No trend data available yet</p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                                Data will appear as risks are recorded over time
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    {Object.entries(COLORS).map(([key, color]) => (
                                        <linearGradient key={key} id={`color-${key}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="rgba(255,255,255,0.1)"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#888', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#888', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'oklch(0.06 0 0)',
                                        border: '1px solid oklch(0.18 0 0)',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        padding: '6px 10px',
                                    }}
                                    labelStyle={{ color: '#fafafa' }}
                                />
                                <Legend
                                    iconType="circle"
                                    iconSize={8}
                                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                                />
                                <Area type="monotone" dataKey="low"      stackId="1" stroke={COLORS.low}      fill="url(#color-low)"      strokeWidth={2} />
                                <Area type="monotone" dataKey="medium"   stackId="1" stroke={COLORS.medium}   fill="url(#color-medium)"   strokeWidth={2} />
                                <Area type="monotone" dataKey="high"     stackId="1" stroke={COLORS.high}     fill="url(#color-high)"     strokeWidth={2} />
                                <Area type="monotone" dataKey="critical" stackId="1" stroke={COLORS.critical} fill="url(#color-critical)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}