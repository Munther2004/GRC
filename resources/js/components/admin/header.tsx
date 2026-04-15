import { AlertTriangle, Bell, Clock, FileCheck, Menu, Search, Shield, X } from "lucide-react"
import { Link, router, usePage } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

type NotificationItem = {
    id: number
    type: string
    title: string
    message: string
    url: string | null
    is_read: boolean
    created_at: string
}

type SharedProps = {
    auth: {
        user: {
            name: string
            email: string
            role: string
        }
    }
    notifications: {
        unread_count: number
        recent: NotificationItem[]
    }
}

function timeAgo(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}

function notificationIcon(type: string) {
    switch (type) {
        case 'overdue_assessment': return <Clock className="w-4 h-4 text-red-400 shrink-0" />
        case 'pending_evidence':   return <FileCheck className="w-4 h-4 text-yellow-400 shrink-0" />
        case 'critical_risk':      return <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
        case 'overdue_risk':       return <Shield className="w-4 h-4 text-orange-400 shrink-0" />
        default:                   return <Bell className="w-4 h-4 text-muted-foreground shrink-0" />
    }
}

export function AdminHeader() {
    const { auth, notifications } = usePage<SharedProps>().props
    const unreadCount = notifications?.unread_count ?? 0
    const recent = notifications?.recent ?? []
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    function handleNotificationClick(n: NotificationItem) {
        router.post(`/notifications/${n.id}/read`, {}, {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ['notifications'] }),
        })
        setOpen(false)
        if (n.url) router.visit(n.url)
    }

    function handleMarkAllRead() {
        router.post('/notifications/read-all', {}, {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ['notifications'] }),
        })
        setOpen(false)
    }

    function handleDismiss(e: React.MouseEvent, id: number) {
        e.stopPropagation()
        router.delete(`/notifications/${id}`, {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ['notifications'] }),
        })
    }

    return (
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background/70 backdrop-blur-xl px-6">
            <button className="lg:hidden p-2 -ml-2" aria-label="Open menu">
                <Menu className="h-5 w-5" />
            </button>

            <div className="flex flex-1 items-center">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="h-8 pl-9 pr-12 bg-muted/40 border-border text-sm placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-ring/40"
                    />
                    <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground">
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
                        onClick={() => setOpen(v => !v)}
                        aria-label="Notifications"
                    >
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-destructive rounded-full flex items-center justify-center text-[10px] font-bold text-destructive-foreground leading-none">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </Button>

                    {open && (
                        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-border bg-popover shadow-lg z-50">
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                                <span className="text-sm font-semibold text-popover-foreground">
                                    Notifications {unreadCount > 0 && (
                                        <span className="ml-1.5 text-xs bg-destructive text-destructive-foreground rounded-full px-1.5 py-0.5">
                                            {unreadCount}
                                        </span>
                                    )}
                                </span>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
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
                                    recent.map(n => (
                                        <div
                                            key={n.id}
                                            className={cn(
                                                "group flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0 transition-colors",
                                                !n.is_read && "bg-blue-500/5",
                                                "hover:bg-accent/50"
                                            )}
                                        >
                                            <button
                                                onClick={() => handleNotificationClick(n)}
                                                className="flex flex-1 gap-3 text-left min-w-0"
                                            >
                                                <div className="mt-0.5 shrink-0">{notificationIcon(n.type)}</div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={cn("text-sm truncate", !n.is_read && "font-semibold text-foreground")}>
                                                        {n.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                                        {n.message}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground/60 mt-1">
                                                        {timeAgo(n.created_at)}
                                                    </p>
                                                </div>
                                            </button>
                                            <button
                                                onClick={(e) => handleDismiss(e, n.id)}
                                                className="shrink-0 mt-0.5 p-0.5 rounded opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                                                title="Dismiss"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-2.5 border-t border-border">
                                <Link
                                    href="/notifications"
                                    onClick={() => setOpen(false)}
                                    className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    View all notifications
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
