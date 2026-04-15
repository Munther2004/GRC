import { Link } from "@inertiajs/react"
import { ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Risk = {
    id: number
    title: string
    category: string
    owner: string
    likelihood: number
    impact: number
    risk_level: string
    risk_score: number
    status: string
}

type Props = { risks?: Risk[] }

const levelStyle = (level: string) => {
    switch (level) {
        case 'critical': return { dot: 'bg-red-400',     text: 'text-red-400' }
        case 'high':     return { dot: 'bg-orange-400',  text: 'text-orange-400' }
        case 'medium':   return { dot: 'bg-amber-400',   text: 'text-amber-400' }
        default:         return { dot: 'bg-emerald-400', text: 'text-emerald-400' }
    }
}

const statusStyle = (status: string) => {
    switch (status) {
        case 'open':         return 'text-red-400/90'
        case 'in_progress':  return 'text-blue-400/90'
        case 'under_review': return 'text-amber-400/90'
        case 'closed':       return 'text-emerald-400/90'
        default:             return 'text-muted-foreground'
    }
}

export function TopRisks({ risks = [] }: Props) {
    return (
        <Card>
            <CardHeader className="pb-3 flex-row items-start justify-between gap-4">
                <div>
                    <CardTitle className="text-sm font-medium">Top Risks</CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        Ranked by ISO/IEC 27005 likelihood × impact
                    </p>
                </div>
                <Link
                    href="/risks"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    View all <ArrowUpRight className="w-3 h-3" />
                </Link>
            </CardHeader>
            <CardContent className="p-0">
                {risks.length === 0 ? (
                    <div className="py-12 text-center px-5">
                        <p className="text-sm text-muted-foreground">No risks recorded yet</p>
                        <Link
                            href="/risks/create"
                            className="inline-flex items-center gap-1 mt-3 text-xs text-foreground hover:underline"
                        >
                            Add first risk <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>
                ) : (
                    <div className="border-t border-border">
                        {risks.map((risk) => {
                            const ls = levelStyle(risk.risk_level)
                            return (
                                <Link
                                    key={risk.id}
                                    href={`/risks/${risk.id}`}
                                    className="group grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_2fr_1fr_auto_auto] items-center gap-4 px-5 py-3 border-b border-border last:border-0 hover:bg-accent/30 transition-colors"
                                >
                                    <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                                        RSK-{String(risk.id).padStart(3, '0')}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{risk.title}</p>
                                        <p className="text-[11px] text-muted-foreground truncate">
                                            {risk.category || '—'}{risk.owner ? <> · <span>{risk.owner}</span></> : null}
                                        </p>
                                    </div>
                                    <div className="hidden md:flex items-center gap-1.5 text-xs">
                                        <span className={`w-1 h-1 rounded-full ${ls.dot}`} />
                                        <span className={`capitalize ${ls.text}`}>{risk.risk_level}</span>
                                        <span className={`ml-2 text-[11px] capitalize ${statusStyle(risk.status)}`}>
                                            · {risk.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                                        {risk.risk_score}<span className="text-[10px] text-muted-foreground font-normal">/25</span>
                                    </span>
                                    <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                                </Link>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
