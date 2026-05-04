import { Link, router } from '@inertiajs/react';
import { AlertTriangle, Bell, Clock, ExternalLink, FileCheck, Shield, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { PageHeader } from '@/components/ui/page-header';
import AdminLayout from '@/layouts/admin-layout';

type NotificationItem = {
    id: number;
    type: string;
    title: string;
    message: string;
    url: string | null;
    is_read: boolean;
    created_at: string;
    updated_at: string;
};

type PaginatedData = {
    data: NotificationItem[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
};

// Renamed from `notifications` so the shared sidebar-badge prop
// (also keyed `notifications`) is not overwritten on this page.
type Props = { notificationList: PaginatedData };
type FilterTab = 'all' | 'unread' | 'overdue_assessment' | 'pending_evidence' | 'critical_risk' | 'overdue_risk';

function timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now  = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60)    return `${diff}s ago`;
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

const typeStyle: Record<string, { icon: React.ElementType; color: string }> = {
    overdue_assessment: { icon: Clock,         color: '#e5484d' },
    pending_evidence:   { icon: FileCheck,     color: 'var(--primary)' },
    critical_risk:      { icon: AlertTriangle, color: '#e5484d' },
    overdue_risk:       { icon: Shield,        color: '#f76b15' },
    default:            { icon: Bell,          color: 'var(--muted-foreground)' },
};

const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all',                 label: 'All' },
    { key: 'unread',              label: 'Unread' },
    { key: 'critical_risk',       label: 'Critical risk' },
    { key: 'overdue_risk',        label: 'Overdue risk' },
    { key: 'overdue_assessment',  label: 'Overdue assessment' },
    { key: 'pending_evidence',    label: 'Pending evidence' },
];

export default function NotificationsPage({ notificationList }: Props) {
    const confirm = useConfirm();
    const [activeTab, setActiveTab] = useState<FilterTab>('all');

    const filtered = notificationList.data.filter((n) => {
        if (activeTab === 'all')    return true;
        if (activeTab === 'unread') return !n.is_read;
        return n.type === activeTab;
    });

    // Reload both the page list AND the shared `notifications` badge prop so
    // the sidebar count stays in sync after read/delete actions.
    const reloadAll = () => router.reload({ only: ['notificationList', 'notifications'] });

    const markRead = (n: NotificationItem) => {
        if (!n.is_read) router.post(`/notifications/${n.id}/read`, {}, { preserveScroll: true, onSuccess: reloadAll });
        if (n.url) router.visit(n.url);
    };

    const markAllRead = () => router.post('/notifications/read-all', {}, { preserveScroll: true, onSuccess: reloadAll });

    const deleteNotification = (id: number) => router.delete(`/notifications/${id}`, { preserveScroll: true, onSuccess: reloadAll });

    const clearAll = async () => {
        const ok = await confirm({
            title: 'Delete all notifications?',
            description: `Are you sure you want to delete all ${notificationList.total} notifications? This cannot be undone.`,
            confirmLabel: 'Delete all',
            tone: 'destructive',
        });
        if (!ok) return;
        router.delete('/notifications', { preserveScroll: true, onSuccess: reloadAll });
    };

    const unreadCount = notificationList.data.filter((n) => !n.is_read).length;

    return (
        <AdminLayout>
            <div className="space-y-6">
                <PageHeader
                    title="Notifications"
                    description={`${notificationList.total} total · ${unreadCount} unread`}
                >
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button variant="outline" size="sm" onClick={markAllRead}>
                                Mark all read
                            </Button>
                        )}
                        {notificationList.total > 0 && (
                            <Button variant="destructive" size="sm" onClick={clearAll}>
                                <Trash2 className="mr-1 h-4 w-4" />
                                Clear all
                            </Button>
                        )}
                    </div>
                </PageHeader>

                {/* Filter tabs */}
                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className="rounded-full px-4 py-1.5 text-[12px] transition-all duration-200"
                            style={activeTab === tab.key
                                ? { background: 'var(--primary)', color: 'var(--primary-foreground)', fontWeight: 500 }
                                : { background: 'transparent', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }
                            }
                            onMouseEnter={e => { if (activeTab !== tab.key) { e.currentTarget.style.color = 'var(--foreground)'; e.currentTarget.style.borderColor = 'var(--foreground)'; } }}
                            onMouseLeave={e => { if (activeTab !== tab.key) { e.currentTarget.style.color = 'var(--muted-foreground)'; e.currentTarget.style.borderColor = 'var(--border)'; } }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Notification list */}
                <div className="space-y-2.5">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Bell className="mb-4 h-10 w-10" style={{ color: 'var(--muted-foreground)', opacity: 0.4 }} />
                            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No notifications found</p>
                        </div>
                    ) : (
                        filtered.map((n) => {
                            const ts = typeStyle[n.type] ?? typeStyle.default;
                            const Icon = ts.icon;
                            return (
                                <div
                                    key={n.id}
                                    className="flex items-start gap-4 rounded-2xl p-4 transition-all duration-200"
                                    style={n.is_read
                                        ? { background: 'var(--card)', border: '1px solid var(--border)' }
                                        : { background: 'color-mix(in srgb, var(--primary) 4%, var(--card))', border: '1px solid color-mix(in srgb, var(--primary) 22%, transparent)' }
                                    }
                                >
                                    {/* Icon */}
                                    <div
                                        className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl"
                                        style={{ background: `color-mix(in srgb, ${ts.color} 12%, transparent)`, color: ts.color }}
                                    >
                                        <Icon className="h-4 w-4" strokeWidth={1.6} />
                                    </div>

                                    {/* Content */}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm" style={{ color: 'var(--foreground)', fontWeight: n.is_read ? 400 : 500 }}>
                                            {n.title}
                                        </p>
                                        <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                                            {n.message}
                                        </p>
                                        <p className="mt-2 text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', opacity: 0.6, letterSpacing: '0.22em' }}>
                                            {timeAgo(n.created_at)}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex shrink-0 items-center gap-1">
                                        {n.url && (
                                            <Button size="icon" variant="ghost" onClick={() => markRead(n)} title="Go to resource">
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button size="icon" variant="ghost" onClick={() => deleteNotification(n.id)} title="Delete notification">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {notificationList.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                        {Array.from({ length: notificationList.last_page }, (_, i) => i + 1).map((page) => (
                            <Link
                                key={page}
                                href={`/notifications?page=${page}`}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors"
                                style={page === notificationList.current_page
                                    ? { background: 'var(--primary)', color: 'var(--primary-foreground)', fontWeight: 500 }
                                    : { color: 'var(--muted-foreground)', border: '1px solid var(--border)' }
                                }
                            >
                                {page}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
