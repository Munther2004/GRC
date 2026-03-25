import { Link } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ActivityLog = {
    id: number;
    description: string;
    user_name: string;
    action: string;
    created_at: string;
};

type Props = {
    activity?: ActivityLog[];
};

function getActionSeverity(action: string): string {
    const critical = ['deleted', 'failed', 'rejected'];
    const warning = ['submitted', 'updated', 'overdue'];
    if (critical.some((a) => action.toLowerCase().includes(a)))
        return 'critical';
    if (warning.some((a) => action.toLowerCase().includes(a))) return 'warning';
    return 'info';
}

function getSeverityIcon(severity: string) {
    switch (severity) {
        case 'critical':
            return <AlertTriangle className="h-4 w-4 text-red-500" />;
        case 'warning':
            return <AlertCircle className="h-4 w-4 text-amber-500" />;
        default:
            return <Info className="h-4 w-4 text-blue-500" />;
    }
}

function getSeverityBadge(severity: string) {
    switch (severity) {
        case 'critical':
            return (
                <Badge
                    variant="destructive"
                    className="px-1.5 py-0 text-[10px]"
                >
                    Critical
                </Badge>
            );
        case 'warning':
            return (
                <Badge className="bg-amber-500/20 px-1.5 py-0 text-[10px] text-amber-500 hover:bg-amber-500/30">
                    Warning
                </Badge>
            );
        default:
            return (
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                    Info
                </Badge>
            );
    }
}

export function RecentAlerts({ activity = [] }: Props) {
    return (
        <Card className="h-full border-border bg-card">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium">
                        Recent Activity
                    </CardTitle>
                    <Link href="/audit-logs">
                        <Badge
                            variant="outline"
                            className="cursor-pointer text-xs hover:bg-muted"
                        >
                            View all
                        </Badge>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {activity.length === 0 ? (
                    <div className="py-8 text-center">
                        <Info className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            No recent activity
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/70">
                            Activity will appear as users interact with the
                            system
                        </p>
                    </div>
                ) : (
                    activity.map((log) => {
                        const severity = getActionSeverity(log.action);
                        return (
                            <div
                                key={log.id}
                                className="flex cursor-pointer gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
                            >
                                <div className="mt-0.5">
                                    {getSeverityIcon(severity)}
                                </div>
                                <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="truncate text-sm font-medium">
                                            {log.description}
                                        </p>
                                        {getSeverityBadge(severity)}
                                    </div>
                                    <p className="truncate text-xs text-muted-foreground">
                                        By {log.user_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground/70">
                                        {log.created_at}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
}
