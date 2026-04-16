import { Info, ArrowUpRight } from 'lucide-react';
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
    if (['deleted', 'failed', 'rejected'].some((x) => a.includes(x))) return 'critical';
    if (['submitted', 'updated', 'overdue'].some((x) => a.includes(x))) return 'warning';
    return 'info';
}

const sevColor: Record<string, string> = {
    critical: '#8B2635',
    warning:  '#285A48',
    info:     '#408A71',
};

export function RecentAlerts({ activity = [] }: Props) {
    return (
        <Card className="h-full">
            <CardHeader className="flex-row items-start justify-between gap-4 pb-3">
                <CardTitle className="font-heading text-lg font-normal">
                    Recent Activity
                </CardTitle>
                <Link
                    href="/audit-logs"
                    className="font-display inline-flex items-center gap-1 text-[10px] uppercase tracking-widest transition-colors"
                    style={{ color: '#7ABFA8' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#408A71')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#7ABFA8')}
                >
                    View all <ArrowUpRight className="h-3 w-3" />
                </Link>
            </CardHeader>
            <CardContent className="p-0">
                {activity.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                        <Info className="mx-auto mb-2 h-5 w-5" style={{ color: 'rgba(156,139,122,0.5)' }} />
                        <p className="font-body text-sm italic" style={{ color: '#7ABFA8' }}>
                            No recent activity
                        </p>
                    </div>
                ) : (
                    <div style={{ borderTop: '1px solid #285A48' }}>
                        {activity.map((log) => {
                            const sev = severity(log.action);
                            return (
                                <div
                                    key={log.id}
                                    className="flex items-start gap-3 px-5 py-3 last:border-0"
                                    style={{ borderBottom: '1px solid rgba(40,90,72,0.5)' }}
                                >
                                    <span
                                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                                        style={{ background: sevColor[sev] }}
                                    />
                                    <div className="min-w-0 flex-1 space-y-0.5">
                                        <p className="font-body truncate text-sm" style={{ color: '#E0F5EC' }}>
                                            {log.description}
                                        </p>
                                        <p className="font-body text-[11px] italic" style={{ color: '#7ABFA8' }}>
                                            <span style={{ color: 'rgba(232,223,212,0.6)' }}>{log.user_name}</span>
                                            <span className="mx-1.5" style={{ color: 'rgba(156,139,122,0.4)' }}>·</span>
                                            <span className="font-display not-italic text-[10px]">{log.created_at}</span>
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
