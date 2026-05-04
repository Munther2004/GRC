import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    DefaultLegendContent,
} from 'recharts';
import type { LegendPayload } from 'recharts/types/component/DefaultLegendContent';
import type { Payload, NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
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
    critical: 'var(--severity-critical)',
    high:     'var(--severity-high)',
    medium:   'var(--severity-medium)',
    low:      'var(--severity-low)',
};

const SEVERITY_RANK: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const severityRankOf = (key: unknown): number =>
    SEVERITY_RANK[typeof key === 'string' ? key.toLowerCase() : ''] ?? 99;
const severityItemSorter = (item: Payload<ValueType, NameType>): number =>
    severityRankOf(item.dataKey);
const severityOrderedLegend = (payload?: ReadonlyArray<LegendPayload>): ReadonlyArray<LegendPayload> =>
    payload ? [...payload].sort((a, b) => severityRankOf(a.dataKey) - severityRankOf(b.dataKey)) : [];

export function RiskTrendChart({ trendData = [] }: Props) {
    const hasData = trendData.length > 0;

    const tooltipStyle = {
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        fontSize: '11px',
        padding: '8px 12px',
        color: 'var(--foreground)',
        boxShadow: '0 18px 40px -18px color-mix(in srgb, var(--foreground) 28%, transparent)',
    };

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-base" style={{ fontWeight: 500 }}>
                    Risk trend
                </CardTitle>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Levels over time · ISO/IEC 27005 scoring
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
                    <div className="h-[280px] w-full min-w-0">
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
                                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                                />
                                <Tooltip
                                    contentStyle={tooltipStyle}
                                    labelStyle={{ color: 'var(--primary)', fontSize: '10px' }}
                                    itemSorter={severityItemSorter}
                                />
                                <Legend
                                    iconType="circle"
                                    iconSize={8}
                                    wrapperStyle={{
                                        fontSize: '10px',
                                        paddingTop: '10px',
                                        letterSpacing: '0.05em',
                                        color: 'var(--muted-foreground)',
                                    }}
                                    content={(props) => (
                                        <DefaultLegendContent
                                            {...props}
                                            payload={severityOrderedLegend(props.payload)}
                                        />
                                    )}
                                />
                                <Area type="monotone" dataKey="critical" name="Critical" stackId="1" stroke={COLORS.critical} fill="url(#color-critical)" strokeWidth={1.5} />
                                <Area type="monotone" dataKey="high"     name="High"     stackId="1" stroke={COLORS.high}     fill="url(#color-high)"     strokeWidth={1.5} />
                                <Area type="monotone" dataKey="medium"   name="Medium"   stackId="1" stroke={COLORS.medium}   fill="url(#color-medium)"   strokeWidth={1.5} />
                                <Area type="monotone" dataKey="low"      name="Low"      stackId="1" stroke={COLORS.low}      fill="url(#color-low)"      strokeWidth={1.5} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
