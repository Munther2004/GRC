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

const levelStyle = (level: string) => {
    switch (level) {
        case 'critical':
            return { dot: 'bg-red-400', text: 'text-red-400' };
        case 'high':
            return { dot: 'bg-orange-400', text: 'text-orange-400' };
        case 'medium':
            return { dot: 'bg-amber-400', text: 'text-amber-400' };
        default:
            return { dot: 'bg-emerald-400', text: 'text-emerald-400' };
    }
};

const statusStyle = (status: string) => {
    switch (status) {
        case 'open':
            return 'text-red-400/90';
        case 'in_progress':
            return 'text-blue-400/90';
        case 'under_review':
            return 'text-amber-400/90';
        case 'closed':
            return 'text-emerald-400/90';
        default:
            return 'text-muted-foreground';
    }
};

export function TopRisks({ risks = [] }: Props) {
    return (
        <Card>
            <CardHeader className="flex-row items-start justify-between gap-4 pb-3">
                <div>
                    <CardTitle className="text-sm font-medium">
                        Top Risks
                    </CardTitle>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Ranked by ISO/IEC 27005 likelihood × impact
                    </p>
                </div>
                <Link
                    href="/risks"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                    View all <ArrowUpRight className="h-3 w-3" />
                </Link>
            </CardHeader>
            <CardContent className="p-0">
                {risks.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                        <p className="text-sm text-muted-foreground">
                            No risks recorded yet
                        </p>
                        <Link
                            href="/risks/create"
                            className="mt-3 inline-flex items-center gap-1 text-xs text-foreground hover:underline"
                        >
                            Add first risk <ArrowUpRight className="h-3 w-3" />
                        </Link>
                    </div>
                ) : (
                    <div className="border-t border-border">
                        {risks.map((risk) => {
                            const ls = levelStyle(risk.risk_level);
                            return (
                                <Link
                                    key={risk.id}
                                    href={`/risks/${risk.id}`}
                                    className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-border px-5 py-3 transition-colors last:border-0 hover:bg-accent/30 md:grid-cols-[auto_2fr_1fr_auto_auto]"
                                >
                                    <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                                        RSK-{String(risk.id).padStart(3, '0')}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-foreground">
                                            {risk.title}
                                        </p>
                                        <p className="truncate text-[11px] text-muted-foreground">
                                            {risk.category || '—'}
                                            {risk.owner ? (
                                                <>
                                                    {' '}
                                                    · <span>{risk.owner}</span>
                                                </>
                                            ) : null}
                                        </p>
                                    </div>
                                    <div className="hidden items-center gap-1.5 text-xs md:flex">
                                        <span
                                            className={`h-1 w-1 rounded-full ${ls.dot}`}
                                        />
                                        <span
                                            className={`capitalize ${ls.text}`}
                                        >
                                            {risk.risk_level}
                                        </span>
                                        <span
                                            className={`ml-2 text-[11px] capitalize ${statusStyle(risk.status)}`}
                                        >
                                            · {risk.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <span className="font-mono text-sm font-semibold text-foreground tabular-nums">
                                        {risk.risk_score}
                                        <span className="text-[10px] font-normal text-muted-foreground">
                                            /25
                                        </span>
                                    </span>
                                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 transition-colors group-hover:text-foreground" />
                                </Link>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
