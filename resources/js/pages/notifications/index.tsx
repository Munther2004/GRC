import { Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Bell,
    Clock,
    ExternalLink,
    FileCheck,
    Shield,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

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

type Props = {
    notifications: PaginatedData;
};

type FilterTab =
    | 'all'
    | 'unread'
    | 'overdue_assessment'
    | 'pending_evidence'
    | 'critical_risk'
    | 'overdue_risk';

function timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function NotificationIcon({ type }: { type: string }) {
    switch (type) {
        case 'overdue_assessment':
            return <Clock className="h-5 w-5 text-red-400" />;
        case 'pending_evidence':
            return <FileCheck className="h-5 w-5 text-yellow-400" />;
        case 'critical_risk':
            return <AlertTriangle className="h-5 w-5 text-red-400" />;
        case 'overdue_risk':
            return <Shield className="h-5 w-5 text-orange-400" />;
        default:
            return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
}

function iconBg(type: string): string {
    switch (type) {
        case 'overdue_assessment':
            return 'bg-red-500/10';
        case 'pending_evidence':
            return 'bg-yellow-500/10';
        case 'critical_risk':
            return 'bg-red-500/10';
        case 'overdue_risk':
            return 'bg-orange-500/10';
        default:
            return 'bg-muted';
    }
}

const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'critical_risk', label: 'Critical Risk' },
    { key: 'overdue_risk', label: 'Overdue Risk' },
    { key: 'overdue_assessment', label: 'Overdue Assessment' },
    { key: 'pending_evidence', label: 'Pending Evidence' },
];

export default function NotificationsPage({ notifications }: Props) {
    const [activeTab, setActiveTab] = useState<FilterTab>('all');

    const filtered = notifications.data.filter((n) => {
        if (activeTab === 'all') return true;
        if (activeTab === 'unread') return !n.is_read;
        return n.type === activeTab;
    });

    function markRead(n: NotificationItem) {
        if (!n.is_read) {
            router.post(
                `/notifications/${n.id}/read`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => router.reload({ only: ['notifications'] }),
                },
            );
        }
        if (n.url) router.visit(n.url);
    }

    function markAllRead() {
        router.post(
            '/notifications/read-all',
            {},
            {
                preserveScroll: true,
                onSuccess: () => router.reload({ only: ['notifications'] }),
            },
        );
    }

    function deleteNotification(id: number) {
        router.delete(`/notifications/${id}`, {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ['notifications'] }),
        });
    }

    function clearAll() {
        if (confirm('Delete all notifications? This cannot be undone.')) {
            router.delete('/notifications', {
                preserveScroll: true,
                onSuccess: () => router.reload({ only: ['notifications'] }),
            });
        }
    }

    const unreadCount = notifications.data.filter((n) => !n.is_read).length;

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Notifications
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {notifications.total} total &bull; {unreadCount}{' '}
                            unread
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={markAllRead}
                            >
                                Mark all read
                            </Button>
                        )}
                        {notifications.total > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearAll}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="mr-1 h-4 w-4" />
                                Clear all
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex flex-wrap gap-1 border-b border-border pb-0">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                                activeTab === tab.key
                                    ? 'border-primary text-foreground'
                                    : 'border-transparent text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Notification list */}
                <div className="space-y-2">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Bell className="mb-4 h-10 w-10 text-muted-foreground/30" />
                            <p className="text-muted-foreground">
                                No notifications found
                            </p>
                        </div>
                    ) : (
                        filtered.map((n) => (
                            <div
                                key={n.id}
                                className={cn(
                                    'flex items-start gap-4 rounded-lg border p-4 transition-colors',
                                    n.is_read
                                        ? 'border-border bg-card'
                                        : 'border-l-4 border-blue-500/30 border-l-blue-500 bg-blue-500/5',
                                )}
                            >
                                {/* Icon */}
                                <div
                                    className={cn(
                                        'shrink-0 rounded-lg p-2',
                                        iconBg(n.type),
                                    )}
                                >
                                    <NotificationIcon type={n.type} />
                                </div>

                                {/* Content */}
                                <div className="min-w-0 flex-1">
                                    <p
                                        className={cn(
                                            'text-sm',
                                            !n.is_read &&
                                                'font-semibold text-foreground',
                                        )}
                                    >
                                        {n.title}
                                    </p>
                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                        {n.message}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground/60">
                                        {timeAgo(n.created_at)}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex shrink-0 items-center gap-2">
                                    {n.url && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => markRead(n)}
                                            title="Go to resource"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => deleteNotification(n.id)}
                                        className="text-muted-foreground hover:text-destructive"
                                        title="Delete notification"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {notifications.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                        {Array.from(
                            { length: notifications.last_page },
                            (_, i) => i + 1,
                        ).map((page) => (
                            <Link
                                key={page}
                                href={`/notifications?page=${page}`}
                                className={cn(
                                    'flex h-8 w-8 items-center justify-center rounded text-sm',
                                    page === notifications.current_page
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                                )}
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
