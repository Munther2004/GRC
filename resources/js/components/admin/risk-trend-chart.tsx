import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type TrendDataPoint = {
    month: string;
    critical: number;
    high: number;
    medium: number;
    low: number;
};

type Props = {
    trendData?: TrendDataPoint[];
};

const COLORS = {
    critical: 'var(--destructive)',
    high:     'var(--chart-5)',
    medium:   'var(--primary)',
    low:      'var(--chart-2)',
};

export function RiskTrendChart({ trendData = [] }: Props) {
    const hasData = trendData.length > 0;

    const tooltipStyle = {
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        fontSize: '11px',
        padding: '6px 10px',
        fontFamily: "'Crimson Pro', serif",
        color: 'var(--foreground)',
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="font-heading text-lg font-normal">
                    Risk Trend
                </CardTitle>
                <p className="font-body text-[11px] italic text-muted-foreground">
                    Risk levels over time — ISO/IEC 27005 scoring
                </p>
            </CardHeader>
            <CardContent>
                {!hasData ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="text-center">
                            <p className="font-body text-sm italic text-muted-foreground">
                                No trend data available yet
                            </p>
                            <p className="font-body mt-1 text-xs italic text-muted-foreground opacity-60">
                                Data will appear as risks are recorded over time
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={trendData}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                                <defs>
                                    {(Object.entries(COLORS) as [string, string][]).map(([key, color]) => (
                                        <linearGradient key={key} id={`color-${key}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor={color} stopOpacity={0.35} />
                                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontFamily: "'Cinzel', serif" }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontFamily: "'Cinzel', serif" }}
                                />
                                <Tooltip
                                    contentStyle={tooltipStyle}
                                    labelStyle={{ color: 'var(--primary)', fontFamily: "'Cinzel', serif", fontSize: '10px' }}
                                />
                                <Legend
                                    iconType="circle"
                                    iconSize={8}
                                    wrapperStyle={{
                                        fontSize: '10px',
                                        paddingTop: '10px',
                                        fontFamily: "'Cinzel', serif",
                                        letterSpacing: '0.05em',
                                        color: 'var(--muted-foreground)',
                                    }}
                                />
                                <Area type="monotone" dataKey="low"      stackId="1" stroke={COLORS.low}      fill="url(#color-low)"      strokeWidth={1.5} />
                                <Area type="monotone" dataKey="medium"   stackId="1" stroke={COLORS.medium}   fill="url(#color-medium)"   strokeWidth={1.5} />
                                <Area type="monotone" dataKey="high"     stackId="1" stroke={COLORS.high}     fill="url(#color-high)"     strokeWidth={1.5} />
                                <Area type="monotone" dataKey="critical" stackId="1" stroke={COLORS.critical} fill="url(#color-critical)" strokeWidth={1.5} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
