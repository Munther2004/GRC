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
    critical: '#8B2635',
    high: '#285A48',
    medium: '#408A71',
    low: '#B0E4CC',
};

export function RiskTrendChart({ trendData = [] }: Props) {
    const hasData = trendData.length > 0;

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="font-heading text-lg font-normal">
                    Risk Trend
                </CardTitle>
                <p className="font-body text-[11px] italic" style={{ color: '#7ABFA8' }}>
                    Risk levels over time — ISO/IEC 27005 scoring
                </p>
            </CardHeader>
            <CardContent>
                {!hasData ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="text-center">
                            <p className="font-body text-sm italic" style={{ color: '#7ABFA8' }}>
                                No trend data available yet
                            </p>
                            <p className="font-body mt-1 text-xs italic" style={{ color: 'rgba(156,139,122,0.6)' }}>
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
                                    {Object.entries(COLORS).map(([key, color]) => (
                                        <linearGradient key={key} id={`color-${key}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#285A48" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#7ABFA8', fontSize: 10, fontFamily: "'Cinzel', serif" }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#7ABFA8', fontSize: 10, fontFamily: "'Cinzel', serif" }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0D1F1C',
                                        border: '1px solid #285A48',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        padding: '6px 10px',
                                        fontFamily: "'Crimson Pro', serif",
                                        color: '#E0F5EC',
                                    }}
                                    labelStyle={{ color: '#408A71', fontFamily: "'Cinzel', serif", fontSize: '10px' }}
                                />
                                <Legend
                                    iconType="circle"
                                    iconSize={8}
                                    wrapperStyle={{
                                        fontSize: '10px',
                                        paddingTop: '10px',
                                        fontFamily: "'Cinzel', serif",
                                        letterSpacing: '0.05em',
                                        color: '#7ABFA8',
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
