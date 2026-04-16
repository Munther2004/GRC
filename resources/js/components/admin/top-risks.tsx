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
        case 'critical': return '#8B2635';
        case 'high':     return '#B07840';
        case 'medium':   return '#C9A962';
        default:         return '#8B9E6B';
    }
};

const statusColor = (status: string): string => {
    switch (status) {
        case 'open':         return '#8B2635';
        case 'in_progress':  return '#C9A962';
        case 'under_review': return '#B07840';
        case 'closed':       return '#8B9E6B';
        default:             return '#9C8B7A';
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
                    <p className="font-body mt-0.5 text-[11px] italic" style={{ color: '#9C8B7A' }}>
                        Ranked by ISO/IEC 27005 likelihood × impact
                    </p>
                </div>
                <Link
                    href="/risks"
                    className="font-display inline-flex items-center gap-1 text-[10px] uppercase tracking-widest transition-colors"
                    style={{ color: '#9C8B7A' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#C9A962')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#9C8B7A')}
                >
                    View all <ArrowUpRight className="h-3 w-3" />
                </Link>
            </CardHeader>
            <CardContent className="p-0">
                {risks.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                        <p className="font-body text-sm italic" style={{ color: '#9C8B7A' }}>
                            No risks recorded yet
                        </p>
                        <Link
                            href="/risks/create"
                            className="font-display mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest transition-colors"
                            style={{ color: '#C9A962' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#E8DFD4')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#C9A962')}
                        >
                            Add first risk <ArrowUpRight className="h-3 w-3" />
                        </Link>
                    </div>
                ) : (
                    <div style={{ borderTop: '1px solid #4A3F35' }}>
                        {risks.map((risk) => (
                            <Link
                                key={risk.id}
                                href={`/risks/${risk.id}`}
                                className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-3 transition-colors last:border-0 md:grid-cols-[auto_2fr_1fr_auto_auto]"
                                style={{ borderBottom: '1px solid rgba(74,63,53,0.5)' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(61,51,43,0.4)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                <span className="font-display text-[10px] tabular-nums" style={{ color: '#9C8B7A' }}>
                                    RSK-{String(risk.id).padStart(3, '0')}
                                </span>
                                <div className="min-w-0">
                                    <p className="font-body truncate text-sm" style={{ color: '#E8DFD4' }}>
                                        {risk.title}
                                    </p>
                                    <p className="font-body truncate text-[11px] italic" style={{ color: '#9C8B7A' }}>
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
                                <span className="font-heading text-sm tabular-nums" style={{ color: '#C9A962' }}>
                                    {risk.risk_score}
                                    <span className="font-display text-[10px]" style={{ color: '#9C8B7A' }}>/25</span>
                                </span>
                                <ArrowUpRight
                                    className="h-3.5 w-3.5 transition-colors"
                                    style={{ color: 'rgba(156,139,122,0.4)' }}
                                />
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
