import {
    AlertTriangle,
    Bell,
    Clock,
    FileCheck,
    Menu,
    Search,
    Shield,
    X,
} from 'lucide-react';
import { Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

type NotificationItem = {
    id: number;
    type: string;
    title: string;
    message: string;
    url: string | null;
    is_read: boolean;
    created_at: string;
};

type SharedProps = {
    auth: {
        user: {
            name: string;
            email: string;
            role: string;
        };
    };
    notifications: {
        unread_count: number;
        recent: NotificationItem[];
    };
};

function timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function notificationIcon(type: string) {
    switch (type) {
        case 'overdue_assessment':
            return <Clock className="h-4 w-4 shrink-0 text-red-400" />;
        case 'pending_evidence':
            return <FileCheck className="h-4 w-4 shrink-0 text-yellow-400" />;
        case 'critical_risk':
            return <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />;
        case 'overdue_risk':
            return <Shield className="h-4 w-4 shrink-0 text-orange-400" />;
        default:
            return <Bell className="h-4 w-4 shrink-0 text-muted-foreground" />;
    }
}

export function AdminHeader() {
    const { auth, notifications } = usePage<SharedProps>().props;
    const unreadCount = notifications?.unread_count ?? 0;
    const recent = notifications?.recent ?? [];
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    function handleNotificationClick(n: NotificationItem) {
        router.post(
            `/notifications/${n.id}/read`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => router.reload({ only: ['notifications'] }),
            },
        );
        setOpen(false);
        if (n.url) router.visit(n.url);
    }

    function handleMarkAllRead() {
        router.post(
            '/notifications/read-all',
            {},
            {
                preserveScroll: true,
                onSuccess: () => router.reload({ only: ['notifications'] }),
            },
        );
        setOpen(false);
    }

    function handleDismiss(e: React.MouseEvent, id: number) {
        e.stopPropagation();
        router.delete(`/notifications/${id}`, {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ['notifications'] }),
        });
    }

    return (
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background/70 px-6 backdrop-blur-xl">
            <button className="-ml-2 p-2 lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
            </button>

            <div className="flex flex-1 items-center">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="h-8 border-border bg-muted/40 pr-12 pl-9 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-ring/40"
                    />
                    <kbd className="pointer-events-none absolute top-1/2 right-2 hidden h-5 -translate-y-1/2 items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
                        ⌘K
                    </kbd>
                </div>
            </div>

            <div className="flex items-center gap-1">
                {/* Notifications bell */}
                <div className="relative" ref={dropdownRef}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative"
                        onClick={() => setOpen((v) => !v)}
                        aria-label="Notifications"
                    >
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-0.5 text-[10px] leading-none font-bold text-destructive-foreground">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </Button>

                    {open && (
                        <div className="absolute top-full right-0 z-50 mt-2 w-80 rounded-lg border border-border bg-popover shadow-lg">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                                <span className="text-sm font-semibold text-popover-foreground">
                                    Notifications{' '}
                                    {unreadCount > 0 && (
                                        <span className="ml-1.5 rounded-full bg-destructive px-1.5 py-0.5 text-xs text-destructive-foreground">
                                            {unreadCount}
                                        </span>
                                    )}
                                </span>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            {/* Notification list */}
                            <div className="max-h-80 overflow-y-auto">
                                {recent.length === 0 ? (
                                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                        No new notifications
                                    </div>
                                ) : (
                                    recent.map((n) => (
                                        <div
                                            key={n.id}
                                            className={cn(
                                                'group flex items-start gap-3 border-b border-border/50 px-4 py-3 transition-colors last:border-0',
                                                !n.is_read && 'bg-blue-500/5',
                                                'hover:bg-accent/50',
                                            )}
                                        >
                                            <button
                                                onClick={() =>
                                                    handleNotificationClick(n)
                                                }
                                                className="flex min-w-0 flex-1 gap-3 text-left"
                                            >
                                                <div className="mt-0.5 shrink-0">
                                                    {notificationIcon(n.type)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p
                                                        className={cn(
                                                            'truncate text-sm',
                                                            !n.is_read &&
                                                                'font-semibold text-foreground',
                                                        )}
                                                    >
                                                        {n.title}
                                                    </p>
                                                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                                                        {n.message}
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground/60">
                                                        {timeAgo(n.created_at)}
                                                    </p>
                                                </div>
                                            </button>
                                            <button
                                                onClick={(e) =>
                                                    handleDismiss(e, n.id)
                                                }
                                                className="mt-0.5 shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:text-destructive"
                                                title="Dismiss"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            <div className="border-t border-border px-4 py-2.5">
                                <Link
                                    href="/notifications"
                                    onClick={() => setOpen(false)}
                                    className="block text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    View all notifications
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
