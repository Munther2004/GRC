import { AlertTriangle, AlertCircle, Info, ArrowUpRight } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ActivityLog = {
    id: number;
    description: string;
    user_name: string;
    action: string;
    created_at: string;
};

type Props = { activity?: ActivityLog[] };

function severity(action: string): 'critical' | 'warning' | 'info' {
    const a = action.toLowerCase();
    if (['deleted', 'failed', 'rejected'].some((x) => a.includes(x)))
        return 'critical';
    if (['submitted', 'updated', 'overdue'].some((x) => a.includes(x)))
        return 'warning';
    return 'info';
}

function dot(sev: string) {
    if (sev === 'critical')
        return (
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
        );
    if (sev === 'warning')
        return (
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
        );
    return (
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
    );
}

export function RecentAlerts({ activity = [] }: Props) {
    return (
        <Card className="h-full">
            <CardHeader className="flex-row items-start justify-between gap-4 pb-3">
                <CardTitle className="text-sm font-medium">
                    Recent Activity
                </CardTitle>
                <Link
                    href="/audit-logs"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                    View all <ArrowUpRight className="h-3 w-3" />
                </Link>
            </CardHeader>
            <CardContent className="p-0">
                {activity.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                        <Info className="mx-auto mb-2 h-5 w-5 text-muted-foreground/60" />
                        <p className="text-sm text-muted-foreground">
                            No recent activity
                        </p>
                    </div>
                ) : (
                    <div className="border-t border-border">
                        {activity.map((log) => {
                            const sev = severity(log.action);
                            return (
                                <div
                                    key={log.id}
                                    className="flex items-start gap-3 border-b border-border px-5 py-3 last:border-0"
                                >
                                    {dot(sev)}
                                    <div className="min-w-0 flex-1 space-y-0.5">
                                        <p className="truncate text-sm text-foreground/90">
                                            {log.description}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            <span className="text-foreground/60">
                                                {log.user_name}
                                            </span>
                                            <span className="mx-1.5 text-muted-foreground/40">
                                                ·
                                            </span>
                                            <span className="font-mono">
                                                {log.created_at}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
