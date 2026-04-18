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
        case 'critical': return 'var(--destructive)';
        case 'high':     return 'color-mix(in srgb, var(--destructive) 70%, var(--foreground))';
        case 'medium':   return 'var(--primary)';
        default:         return 'var(--muted-foreground)';
    }
};

const statusColor = (status: string): string => {
    switch (status) {
        case 'open':         return 'var(--destructive)';
        case 'in_progress':  return 'var(--primary)';
        case 'under_review': return 'color-mix(in srgb, var(--primary) 70%, var(--foreground))';
        case 'closed':       return 'var(--muted-foreground)';
        default:             return 'var(--muted-foreground)';
    }
};

export function TopRisks({ risks = [] }: Props) {
    return (
        <Card>
            <CardHeader className="flex-row items-start justify-between gap-4 pb-3">
                <div>
                    <CardTitle className="font-heading text-lg font-normal">
                        Top Risks
                    </CardTitle>
                    <p className="font-body mt-0.5 text-[11px] italic text-muted-foreground">
                        Ranked by ISO/IEC 27005 likelihood × impact
                    </p>
                </div>
                <Link
                    href="/risks"
                    className="font-display inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
                >
                    View all <ArrowUpRight className="h-3 w-3" />
                </Link>
            </CardHeader>
            <CardContent className="p-0">
                {risks.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                        <p className="font-body text-sm italic text-muted-foreground">
                            No risks recorded yet
                        </p>
                        <Link
                            href="/risks/create"
                            className="font-display mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-primary transition-colors hover:text-foreground"
                        >
                            Add first risk <ArrowUpRight className="h-3 w-3" />
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
                                <span className="font-display text-[10px] tabular-nums text-muted-foreground">
                                    RSK-{String(risk.id).padStart(3, '0')}
                                </span>
                                <div className="min-w-0">
                                    <p className="font-body truncate text-sm text-foreground">
                                        {risk.title}
                                    </p>
                                    <p className="font-body truncate text-[11px] italic text-muted-foreground">
                                        {risk.category || '—'}
                                        {risk.owner ? <> · <span>{risk.owner}</span></> : null}
                                    </p>
                                </div>
                                <div className="hidden items-center gap-1.5 md:flex">
                                    <span
                                        className="h-1.5 w-1.5 rounded-full shrink-0"
                                        style={{ background: levelColor(risk.risk_level) }}
                                    />
                                    <span
                                        className="font-display text-[10px] capitalize tracking-[0.05em]"
                                        style={{ color: levelColor(risk.risk_level) }}
                                    >
                                        {risk.risk_level}
                                    </span>
                                    <span
                                        className="font-display ml-2 text-[10px] capitalize tracking-[0.05em]"
                                        style={{ color: statusColor(risk.status) }}
                                    >
                                        · {risk.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <span className="font-heading text-sm tabular-nums text-primary">
                                    {risk.risk_score}
                                    <span className="font-display text-[10px] text-muted-foreground">/25</span>
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
