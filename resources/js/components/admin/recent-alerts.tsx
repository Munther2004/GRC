import { AlertCircle, AlertTriangle, Info } from "lucide-react"
import { Link } from "@inertiajs/react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ActivityLog = {
    id: number
    description: string
    user_name: string
    action: string
    created_at: string
}

type Props = {
    activity?: ActivityLog[]
}

function getActionSeverity(action: string): string {
    const critical = ['deleted', 'failed', 'rejected']
    const warning = ['submitted', 'updated', 'overdue']
    if (critical.some(a => action.toLowerCase().includes(a))) return 'critical'
    if (warning.some(a => action.toLowerCase().includes(a))) return 'warning'
    return 'info'
}

function getSeverityIcon(severity: string) {
    switch (severity) {
        case "critical":
            return <AlertTriangle className="w-4 h-4 text-red-500" />
        case "warning":
            return <AlertCircle className="w-4 h-4 text-amber-500" />
        default:
            return <Info className="w-4 h-4 text-blue-500" />
    }
}

function getSeverityBadge(severity: string) {
    switch (severity) {
        case "critical":
            return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Critical</Badge>
        case "warning":
            return <Badge className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 text-[10px] px-1.5 py-0">Warning</Badge>
        default:
            return <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Info</Badge>
    }
}

export function RecentAlerts({ activity = [] }: Props) {
    return (
        <Card className="bg-card border-border h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
                    <Link href="/audit-logs">
                        <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                            View all
                        </Badge>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {activity.length === 0 ? (
                    <div className="text-center py-8">
                        <Info className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No recent activity</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                            Activity will appear as users interact with the system
                        </p>
                    </div>
                ) : (
                    activity.map((log) => {
                        const severity = getActionSeverity(log.action)
                        return (
                            <div
                                key={log.id}
                                className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                            >
                                <div className="mt-0.5">{getSeverityIcon(severity)}</div>
                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm font-medium truncate">{log.description}</p>
                                        {getSeverityBadge(severity)}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">
                                        By {log.user_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground/70">{log.created_at}</p>
                                </div>
                            </div>
                        )
                    })
                )}
            </CardContent>
        </Card>
    )
}