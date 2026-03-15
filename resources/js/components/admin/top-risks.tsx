import { Link } from "@inertiajs/react"
import { ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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

type Props = {
    risks?: Risk[]
}

function getRiskLevelBadge(level: string) {
    switch (level) {
        case "critical":
            return <Badge variant="destructive" className="text-xs">Critical</Badge>
        case "high":
            return <Badge className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 text-xs">High</Badge>
        case "medium":
            return <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 text-xs">Medium</Badge>
        default:
            return <Badge variant="secondary" className="text-xs">Low</Badge>
    }
}

function getStatusBadge(status: string) {
    switch (status) {
        case "open":
            return <Badge variant="outline" className="text-xs border-red-500/50 text-red-400">Open</Badge>
        case "in_progress":
            return <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">In Progress</Badge>
        case "under_review":
            return <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-400">Under Review</Badge>
        case "closed":
            return <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">Closed</Badge>
        default:
            return <Badge variant="outline" className="text-xs">{status}</Badge>
    }
}

export function TopRisks({ risks = [] }: Props) {
    return (
        <Card className="bg-card border-border">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-medium">Top Risks</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                            Ranked by ISO/IEC 27005 likelihood × impact score
                        </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                        <Link href="/risks">
                            View all
                            <ArrowUpRight className="w-4 h-4 ml-1" />
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {risks.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-sm text-muted-foreground">No risks recorded yet</p>
                        <Link href="/risks/create">
                            <Button variant="outline" size="sm" className="mt-3">
                                Add First Risk
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Risk</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Category</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Owner</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Score</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Level</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {risks.map((risk) => (
                                    <tr key={risk.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="py-3 px-4">
                                            <span className="text-sm font-mono text-muted-foreground">
                                                RSK-{String(risk.id).padStart(3, '0')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm font-medium">{risk.title}</span>
                                        </td>
                                        <td className="py-3 px-4 hidden md:table-cell">
                                            <span className="text-sm text-muted-foreground">{risk.category ?? '—'}</span>
                                        </td>
                                        <td className="py-3 px-4 hidden lg:table-cell">
                                            <span className="text-sm text-muted-foreground">{risk.owner ?? '—'}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm font-semibold tabular-nums">
                                                {risk.risk_score}
                                                <span className="text-xs text-muted-foreground font-normal">/25</span>
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">{getRiskLevelBadge(risk.risk_level)}</td>
                                        <td className="py-3 px-4">{getStatusBadge(risk.status)}</td>
                                        <td className="py-3 px-4">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                <Link href={`/risks/${risk.id}`}>
                                                    <ArrowUpRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}