import AdminLayout from '@/layouts/admin-layout';
import { Link, router } from '@inertiajs/react';
import { AlertTriangle, Bell, Clock, ExternalLink, FileCheck, Shield, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { useState } from 'react';

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

type Props = { notifications: PaginatedData };
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

const typeStyle: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    overdue_assessment: { icon: Clock,          color: '#8B2635', bg: 'rgba(139,38,53,0.1)'  },
    pending_evidence:   { icon: FileCheck,      color: '#C9A962', bg: 'rgba(201,169,98,0.1)' },
    critical_risk:      { icon: AlertTriangle,  color: '#8B2635', bg: 'rgba(139,38,53,0.1)'  },
    overdue_risk:       { icon: Shield,         color: '#B07840', bg: 'rgba(176,120,64,0.1)' },
    default:            { icon: Bell,           color: '#9C8B7A', bg: 'rgba(156,139,122,0.1)' },
};

const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all',                 label: 'All' },
    { key: 'unread',              label: 'Unread' },
    { key: 'critical_risk',       label: 'Critical Risk' },
    { key: 'overdue_risk',        label: 'Overdue Risk' },
    { key: 'overdue_assessment',  label: 'Overdue Assessment' },
    { key: 'pending_evidence',    label: 'Pending Evidence' },
];

export default function NotificationsPage({ notifications }: Props) {
    const [activeTab, setActiveTab] = useState<FilterTab>('all');

    const filtered = notifications.data.filter((n) => {
        if (activeTab === 'all')    return true;
        if (activeTab === 'unread') return !n.is_read;
        return n.type === activeTab;
    });

    const markRead = (n: NotificationItem) => {
        if (!n.is_read) router.post(`/notifications/${n.id}/read`, {}, { preserveScroll: true, onSuccess: () => router.reload({ only: ['notifications'] }) });
        if (n.url) router.visit(n.url);
    };

    const markAllRead = () => router.post('/notifications/read-all', {}, { preserveScroll: true, onSuccess: () => router.reload({ only: ['notifications'] }) });

    const deleteNotification = (id: number) => router.delete(`/notifications/${id}`, { preserveScroll: true, onSuccess: () => router.reload({ only: ['notifications'] }) });

    const clearAll = () => {
        if (confirm('Delete all notifications? This cannot be undone.')) {
            router.delete('/notifications', { preserveScroll: true, onSuccess: () => router.reload({ only: ['notifications'] }) });
        }
    };

    const unreadCount = notifications.data.filter((n) => !n.is_read).length;

    return (
        <AdminLayout>
            <div className="space-y-6">
                <PageHeader
                    title="Notifications"
                    description={`${notifications.total} total · ${unreadCount} unread`}
                >
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button variant="outline" size="sm" onClick={markAllRead}>
                                Mark all read
                            </Button>
                        )}
                        {notifications.total > 0 && (
                            <Button variant="destructive" size="sm" onClick={clearAll}>
                                <Trash2 className="mr-1 h-4 w-4" />
                                Clear all
                            </Button>
                        )}
                    </div>
                </PageHeader>

                {/* Filter tabs */}
                <div className="flex flex-wrap gap-1 pb-0" style={{ borderBottom: '1px solid #4A3F35' }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className="-mb-px px-3 py-2 font-display text-[10px] uppercase tracking-[0.15em] transition-colors"
                            style={activeTab === tab.key
                                ? { borderBottom: '2px solid #C9A962', color: '#C9A962' }
                                : { borderBottom: '2px solid transparent', color: '#9C8B7A' }
                            }
                            onMouseEnter={e => { if (activeTab !== tab.key) e.currentTarget.style.color = '#E8DFD4'; }}
                            onMouseLeave={e => { if (activeTab !== tab.key) e.currentTarget.style.color = '#9C8B7A'; }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Notification list */}
                <div className="space-y-2">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Bell className="mb-4 h-10 w-10" style={{ color: 'rgba(156,139,122,0.3)' }} />
                            <p className="font-body italic" style={{ color: '#9C8B7A' }}>No notifications found</p>
                        </div>
                    ) : (
                        filtered.map((n) => {
                            const ts = typeStyle[n.type] ?? typeStyle.default;
                            const Icon = ts.icon;
                            return (
                                <div
                                    key={n.id}
                                    className="flex items-start gap-4 rounded p-4 transition-colors"
                                    style={n.is_read
                                        ? { background: '#251E19', border: '1px solid #4A3F35' }
                                        : { background: 'rgba(201,169,98,0.04)', border: '1px solid rgba(201,169,98,0.25)', borderLeft: '3px solid #C9A962' }
                                    }
                                >
                                    {/* Icon */}
                                    <div className="shrink-0 rounded p-2" style={{ background: ts.bg }}>
                                        <Icon className="h-5 w-5" style={{ color: ts.color }} strokeWidth={1.5} />
                                    </div>

                                    {/* Content */}
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className="font-body text-sm"
                                            style={{ color: n.is_read ? '#9C8B7A' : '#E8DFD4', fontStyle: n.is_read ? 'italic' : 'normal' }}
                                        >
                                            {n.title}
                                        </p>
                                        <p className="font-body mt-0.5 text-sm italic" style={{ color: '#9C8B7A' }}>
                                            {n.message}
                                        </p>
                                        <p className="font-display mt-1 text-[9px] uppercase tracking-widest" style={{ color: 'rgba(156,139,122,0.5)' }}>
                                            {timeAgo(n.created_at)}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex shrink-0 items-center gap-2">
                                        {n.url && (
                                            <Button size="sm" variant="ghost" onClick={() => markRead(n)} title="Go to resource">
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button size="sm" variant="ghost" onClick={() => deleteNotification(n.id)} title="Delete notification">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {notifications.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                        {Array.from({ length: notifications.last_page }, (_, i) => i + 1).map((page) => (
                            <Link
                                key={page}
                                href={`/notifications?page=${page}`}
                                className="flex h-8 w-8 items-center justify-center rounded font-display text-[10px] transition-colors"
                                style={page === notifications.current_page
                                    ? { background: '#C9A962', color: '#1C1714' }
                                    : { color: '#9C8B7A', border: '1px solid #4A3F35' }
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
