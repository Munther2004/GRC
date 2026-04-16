import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { Bell, X, CheckCheck, Building2, ClipboardList, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Notification {
    id: number;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
    data?: Record<string, any>;
}

function NotifIcon({ type }: { type: string }) {
    const cls = 'h-3.5 w-3.5 shrink-0';
    switch (type) {
        case 'corporation_approved': return <CheckCheck className={cls} style={{ color: 'var(--primary)' }} />;
        case 'corporation_signup':   return <Building2  className={cls} style={{ color: 'var(--primary)' }} />;
        case 'status_update':        return <ClipboardList className={cls} style={{ color: 'var(--muted-foreground)' }} />;
        default:                     return <Megaphone className={cls} style={{ color: 'var(--muted-foreground)' }} />;
    }
}

function formatTime(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 1000;
    if (diff < 60)   return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
}

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/notifications');
            if (response.ok) setNotifications(await response.json());
        } catch {
            // silent
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleMarkAsRead = async (id: number) => {
        try {
            await fetch(`/api/notifications/${id}/mark-as-read`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
            });
            fetchNotifications();
        } catch {
            // silent
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    title="Notifications"
                    className="relative flex h-8 w-8 items-center justify-center rounded transition-colors"
                    style={{ color: 'var(--muted-foreground)' }}
                    onMouseEnter={e => {
                        e.currentTarget.style.color = 'var(--foreground)';
                        e.currentTarget.style.background = 'color-mix(in srgb, var(--primary) 8%, transparent)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.color = 'var(--muted-foreground)';
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <span
                            className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full font-display text-[9px] tabular-nums"
                            style={{ background: 'var(--destructive)', color: 'var(--destructive-foreground)' }}
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-80 p-0 overflow-hidden"
                style={{
                    background: 'var(--popover)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom: '1px solid var(--border)' }}
                >
                    <div className="flex items-center gap-2">
                        <p className="font-display text-[11px] uppercase tracking-widest" style={{ color: 'var(--foreground)' }}>
                            Notifications
                        </p>
                        {unreadCount > 0 && (
                            <span
                                className="rounded-full px-1.5 py-0.5 font-display text-[9px] tabular-nums"
                                style={{
                                    background: 'color-mix(in srgb, var(--primary) 15%, transparent)',
                                    color: 'var(--primary)',
                                }}
                            >
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                </div>

                {/* List */}
                <div className="max-h-96 overflow-y-auto">
                    {isLoading ? (
                        <div className="px-4 py-8 text-center">
                            <p className="font-body text-sm italic text-muted-foreground">Loading…</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                            <Bell className="mx-auto mb-2 h-5 w-5 opacity-20" style={{ color: 'var(--muted-foreground)' }} />
                            <p className="font-body text-sm italic text-muted-foreground">No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map((n, idx) => (
                            <div
                                key={n.id}
                                className="flex items-start gap-3 px-4 py-3 transition-colors"
                                style={{
                                    background: !n.is_read ? 'color-mix(in srgb, var(--primary) 6%, transparent)' : 'transparent',
                                    borderBottom: idx < notifications.length - 1 ? '1px solid color-mix(in srgb, var(--border) 50%, transparent)' : 'none',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--primary) 8%, transparent)')}
                                onMouseLeave={e => (e.currentTarget.style.background = !n.is_read ? 'color-mix(in srgb, var(--primary) 6%, transparent)' : 'transparent')}
                            >
                                {/* Unread dot */}
                                <div className="mt-1.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                                    {!n.is_read
                                        ? <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--primary)' }} />
                                        : <span className="h-1.5 w-1.5 rounded-full opacity-0" />
                                    }
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start gap-1.5 mb-0.5">
                                        <NotifIcon type={n.type} />
                                        <p className="font-body text-[12px] leading-snug" style={{ color: 'var(--foreground)' }}>
                                            {n.message}
                                        </p>
                                    </div>
                                    <p className="font-display text-[10px] tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
                                        {formatTime(n.created_at)}
                                    </p>
                                </div>

                                {!n.is_read && (
                                    <button
                                        onClick={() => handleMarkAsRead(n.id)}
                                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors"
                                        title="Mark as read"
                                        style={{ color: 'var(--muted-foreground)' }}
                                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--foreground)')}
                                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div
                    className="px-4 py-2.5 text-center"
                    style={{ borderTop: '1px solid var(--border)' }}
                >
                    <button
                        className="font-display text-[10px] uppercase tracking-widest transition-colors"
                        style={{ color: 'var(--muted-foreground)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                        onClick={() => { setIsOpen(false); router.visit('/notifications'); }}
                    >
                        View all notifications
                    </button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
