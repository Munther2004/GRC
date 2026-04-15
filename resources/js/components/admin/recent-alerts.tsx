import { AlertTriangle, AlertCircle, Info, ArrowUpRight } from "lucide-react"
import { Link } from "@inertiajs/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ActivityLog = {
    id: number
    description: string
    user_name: string
    action: string
    created_at: string
}

type Props = { activity?: ActivityLog[] }

function severity(action: string): 'critical' | 'warning' | 'info' {
    const a = action.toLowerCase()
    if (['deleted', 'failed', 'rejected'].some(x => a.includes(x))) return 'critical'
    if (['submitted', 'updated', 'overdue'].some(x => a.includes(x))) return 'warning'
    return 'info'
}

function dot(sev: string) {
    if (sev === 'critical') return <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
    if (sev === 'warning')  return <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
    return <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
}

export function RecentAlerts({ activity = [] }: Props) {
    return (
        <Card className="h-full">
            <CardHeader className="pb-3 flex-row items-start justify-between gap-4">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                <Link
                    href="/audit-logs"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    View all <ArrowUpRight className="w-3 h-3" />
                </Link>
            </CardHeader>
            <CardContent className="p-0">
                {activity.length === 0 ? (
                    <div className="text-center py-10 px-5">
                        <Info className="w-5 h-5 text-muted-foreground/60 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No recent activity</p>
                    </div>
                ) : (
                    <div className="border-t border-border">
                        {activity.map((log) => {
                            const sev = severity(log.action)
                            return (
                                <div
                                    key={log.id}
                                    className="flex items-start gap-3 px-5 py-3 border-b border-border last:border-0"
                                >
                                    {dot(sev)}
                                    <div className="flex-1 min-w-0 space-y-0.5">
                                        <p className="text-sm text-foreground/90 truncate">{log.description}</p>
                                        <p className="text-[11px] text-muted-foreground">
                                            <span className="text-foreground/60">{log.user_name}</span>
                                            <span className="mx-1.5 text-muted-foreground/40">·</span>
                                            <span className="font-mono">{log.created_at}</span>
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
