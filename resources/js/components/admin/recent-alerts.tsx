import { Link } from '@inertiajs/react';
import { Info, ArrowUpRight } from 'lucide-react';
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
    if (['deleted', 'failed', 'rejected'].some((x) => a.includes(x))) return 'critical';
    if (['submitted', 'updated', 'overdue'].some((x) => a.includes(x))) return 'warning';
    return 'info';
}

const sevColor: Record<string, string> = {
    critical: 'var(--severity-critical)',
    warning:  'var(--severity-medium)',
    info:     'var(--primary)',
};

export function RecentAlerts({ activity = [] }: Props) {
    return (
        <Card className="h-full">
            <CardHeader className="flex-row items-start justify-between gap-4 pb-3">
                <div>
                    <CardTitle className="text-base" style={{ fontWeight: 500 }}>
                        Recent activity
                    </CardTitle>
                    <p className="mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        Audit trail · most recent first
                    </p>
                </div>
                <Link
                    href="/audit-logs"
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px] uppercase transition-colors"
                    style={{ color: 'var(--muted-foreground)', letterSpacing: '0.18em' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--foreground)'; e.currentTarget.style.color = 'var(--foreground)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted-foreground)'; }}
                >
                    View all <ArrowUpRight className="h-3 w-3" />
                </Link>
            </CardHeader>
            <CardContent className="p-0">
                {activity.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                        <Info className="mx-auto mb-2 h-5 w-5" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                            No recent activity
                        </p>
                    </div>
                ) : (
                    <div style={{ borderTop: '1px solid var(--border)' }}>
                        {activity.map((log) => {
                            const sev = severity(log.action);
                            return (
                                <div
                                    key={log.id}
                                    className="flex items-start gap-3 px-5 py-3 last:border-0"
                                    style={{ borderBottom: '1px solid color-mix(in srgb, var(--border) 50%, transparent)' }}
                                >
                                    <span
                                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                                        style={{ background: sevColor[sev] }}
                                    />
                                    <div className="min-w-0 flex-1 space-y-0.5">
                                        <p className="truncate text-sm" style={{ color: 'var(--foreground)' }}>
                                            {log.description}
                                        </p>
                                        <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                                            <span style={{ color: 'var(--foreground)', opacity: 0.7 }}>{log.user_name}</span>
                                            <span className="mx-1.5 opacity-40">·</span>
                                            <span>{log.created_at}</span>
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
