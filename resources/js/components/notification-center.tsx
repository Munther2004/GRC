import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface Notification {
    id: number;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
    data?: Record<string, any>;
}

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/notifications');
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Refresh notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleMarkAsRead = async (notificationId: number) => {
        try {
            await fetch(`/api/notifications/${notificationId}/mark-as-read`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'corporation_approved':
                return '✅';
            case 'corporation_signup':
                return '🏢';
            case 'status_update':
                return '📋';
            default:
                return '📢';
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    title="Notifications"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -right-1 -top-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h2 className="font-semibold text-sm">Notifications</h2>
                    {unreadCount > 0 && (
                        <Badge variant="secondary">{unreadCount} new</Badge>
                    )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Loading...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No notifications yet
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`px-4 py-3 hover:bg-accent transition-colors ${
                                        !notification.is_read
                                            ? 'bg-blue-50 dark:bg-blue-950'
                                            : ''
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg">
                                                    {getNotificationIcon(
                                                        notification.type,
                                                    )}
                                                </span>
                                                <p className="text-sm font-medium text-foreground leading-tight">
                                                    {notification.message}
                                                </p>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(
                                                    notification.created_at,
                                                ).toLocaleDateString()} at{' '}
                                                {new Date(
                                                    notification.created_at,
                                                ).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        {!notification.is_read && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    handleMarkAsRead(
                                                        notification.id,
                                                    )
                                                }
                                                className="h-6 w-6 p-0"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-4 py-2 border-t text-center">
                    <Button
                        variant="link"
                        className="text-xs"
                        onClick={() => {
                            setIsOpen(false);
                            router.visit('/notifications');
                        }}
                    >
                        View all notifications
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
