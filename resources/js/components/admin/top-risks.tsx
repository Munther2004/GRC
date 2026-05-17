import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Risk = {
    id: number;
    title: string;
    category: string;
    owner: string;
    likelihood: number;
    impact: number;
    risk_level: string;
    risk_score: number;
    status: string;
};

type Props = { risks?: Risk[] };

const levelColor = (level: string): string => {
    switch (level) {
        case 'critical': return 'var(--severity-critical)';
        case 'high':     return 'var(--severity-high)';
        case 'medium':   return 'var(--severity-medium)';
        case 'low':      return 'var(--severity-low)';
        default:         return 'var(--muted-foreground)';
    }
};

const statusColor = (status: string): string => {
    switch (status) {
        case 'open':         return 'var(--severity-critical)';
        case 'in_progress':  return 'var(--primary)';
        case 'under_review': return 'var(--severity-medium)';
        case 'closed':       return 'var(--muted-foreground)';
        default:             return 'var(--muted-foreground)';
    }
};

export function TopRisks({ risks = [] }: Props) {
    return (
        <Card className="h-full">
            <CardHeader className="flex-row items-start justify-between gap-4 pb-3">
                <div>
                    <CardTitle className="text-base" style={{ fontWeight: 500 }}>
                        Top risks
                    </CardTitle>
                    <p className="mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        Ranked by ISO/IEC 27005 likelihood × impact
                    </p>
                </div>
                <Link
                    href="/risks"
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px] uppercase transition-colors"
                    style={{ color: 'var(--muted-foreground)', letterSpacing: '0.18em' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--foreground)'; e.currentTarget.style.color = 'var(--foreground)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted-foreground)'; }}
                >
                    View all <ArrowUpRight className="h-3 w-3" />
                </Link>
            </CardHeader>
            <CardContent className="p-0">
                {risks.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                            No risks recorded yet
                        </p>
                        <Link
                            href="/risks/create"
                            className="mt-4 inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm transition-colors"
                            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontWeight: 500 }}
                        >
                            Add first risk <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                ) : (
                    <div style={{ borderTop: '1px solid var(--border)' }}>
                        {risks.map((risk) => (
                            <Link
                                key={risk.id}
                                href={`/risks/${risk.id}`}
                                className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-3 transition-colors last:border-0 md:grid-cols-[auto_2fr_1fr_auto_auto]"
                                style={{ borderBottom: '1px solid color-mix(in srgb, var(--border) 50%, transparent)' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--muted) 60%, transparent)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                <span className="text-[11px] tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
                                    RSK-{String(risk.id).padStart(3, '0')}
                                </span>
                                <div className="min-w-0">
                                    <p className="truncate text-sm" style={{ color: 'var(--foreground)' }}>
                                        {risk.title}
                                    </p>
                                    <p className="truncate text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                                        {risk.category || '-'}
                                        {risk.owner ? <> · <span>{risk.owner}</span></> : null}
                                    </p>
                                </div>
                                <div className="hidden items-center gap-2 md:flex">
                                    <span
                                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] uppercase capitalize"
                                        style={{
                                            background: `color-mix(in srgb, ${levelColor(risk.risk_level)} 12%, transparent)`,
                                            color: levelColor(risk.risk_level),
                                            letterSpacing: '0.16em',
                                        }}
                                    >
                                        {risk.risk_level}
                                    </span>
                                    <span
                                        className="inline-flex rounded-full px-2 py-0.5 text-[10px] uppercase capitalize"
                                        style={{
                                            color: statusColor(risk.status),
                                            border: `1px solid color-mix(in srgb, ${statusColor(risk.status)} 25%, transparent)`,
                                            letterSpacing: '0.16em',
                                        }}
                                    >
                                        {risk.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <span className="text-base tabular-nums" style={{ color: 'var(--primary)', fontWeight: 500, letterSpacing: '-0.02em' }}>
                                    {risk.risk_score}
                                    <span className="text-[11px] ml-0.5" style={{ color: 'var(--muted-foreground)' }}>/25</span>
                                </span>
                                <ArrowUpRight
                                    className="h-3.5 w-3.5 text-muted-foreground opacity-40 transition-opacity group-hover:opacity-100"
                                />
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
