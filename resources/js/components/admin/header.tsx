import { AlertTriangle, Bell, Clock, FileCheck, Menu, Search, Shield, X } from "lucide-react"
import { Link, router, usePage } from "@inertiajs/react"
import { useState, useRef, useEffect } from "react"

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
    auth: { user: { name: string; email: string; role: string } }
    notifications: { unread_count: number; recent: NotificationItem[] }
}

function timeAgo(dateStr: string): string {
    const date = new Date(dateStr)
    const now  = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60)    return `${diff}s ago`
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}

function notificationIcon(type: string) {
    const cls = "w-4 h-4 shrink-0"
    switch (type) {
        case 'overdue_assessment': return <Clock        className={cls} style={{ color: 'var(--destructive)' }} />
        case 'pending_evidence':   return <FileCheck    className={cls} style={{ color: 'var(--primary)' }} />
        case 'critical_risk':      return <AlertTriangle className={cls} style={{ color: 'var(--destructive)' }} />
        case 'overdue_risk':       return <Shield       className={cls} style={{ color: 'var(--border)' }} />
        default:                   return <Bell         className={cls} style={{ color: 'var(--muted-foreground)' }} />
    }
}

export function AdminHeader() {
    const { notifications } = usePage<SharedProps>().props
    const unreadCount = notifications?.unread_count ?? 0
    const recent      = notifications?.recent ?? []
    const [open, setOpen] = useState(false)
    const dropdownRef     = useRef<HTMLDivElement>(null)

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
        <header
            className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-4 px-6"
            style={{
                background: 'color-mix(in srgb, var(--background) 92%, transparent)',
                borderBottom: '1px solid var(--border)',
                backdropFilter: 'blur(12px)',
            }}
        >
            <button className="lg:hidden p-2 -ml-2" aria-label="Open menu">
                <Menu className="h-5 w-5" style={{ color: 'var(--muted-foreground)' }} />
            </button>

            {/* Search */}
            <div className="flex flex-1 items-center">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                    <input
                        type="search"
                        placeholder="Search..."
                        className="h-8 w-full rounded pl-9 pr-12 text-sm outline-none transition-all duration-300 font-body"
                        style={{
                            background: 'var(--card)',
                            border: '1px solid var(--border)',
                            color: 'var(--foreground)',
                        }}
                        onFocus={e  => (e.currentTarget.style.borderColor = 'var(--primary)')}
                        onBlur={e   => (e.currentTarget.style.borderColor = 'var(--border)')}
                    />
                    <kbd
                        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center rounded border px-1.5 font-display text-[9px] uppercase tracking-wider"
                        style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
                    >
                        ⌘K
                    </kbd>
                </div>
            </div>

            {/* Bell */}
            <div className="relative" ref={dropdownRef}>
                <button
                    className="relative flex items-center justify-center w-9 h-9 rounded transition-colors duration-200"
                    style={{ color: 'var(--muted-foreground)' }}
                    onClick={() => setOpen(v => !v)}
                    aria-label="Notifications"
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <span
                            className="absolute top-1 right-1 min-w-3.5 h-3.5 px-0.5 rounded-full flex items-center justify-center font-display text-[8px]"
                            style={{ background: 'var(--destructive)', color: 'var(--destructive-foreground)' }}
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>

                {open && (
                    <div
                        className="absolute right-0 top-full mt-2 w-80 rounded z-50 overflow-hidden"
                        style={{
                            background: 'var(--card)',
                            border: '1px solid var(--border)',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.65)',
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                            <span className="font-heading text-base" style={{ color: 'var(--foreground)' }}>
                                Notifications
                                {unreadCount > 0 && (
                                    <span
                                        className="ml-2 font-display text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                                        style={{
                                            background: 'color-mix(in srgb, var(--destructive) 25%, transparent)',
                                            color: 'var(--primary)',
                                            border: '1px solid color-mix(in srgb, var(--destructive) 40%, transparent)',
                                        }}
                                    >
                                        {unreadCount}
                                    </span>
                                )}
                            </span>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="font-display text-[9px] uppercase tracking-wider transition-colors duration-200"
                                    style={{ color: 'var(--muted-foreground)' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-80 overflow-y-auto">
                            {recent.length === 0 ? (
                                <div className="px-4 py-8 text-center font-body italic text-sm" style={{ color: 'var(--muted-foreground)' }}>
                                    No new notifications
                                </div>
                            ) : (
                                recent.map(n => (
                                    <div
                                        key={n.id}
                                        className="group flex items-start gap-3 px-4 py-3 last:border-0 transition-colors duration-150"
                                        style={{
                                            borderBottom: '1px solid color-mix(in srgb, var(--border) 40%, transparent)',
                                            background: n.is_read ? 'transparent' : 'color-mix(in srgb, var(--primary) 4%, transparent)',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--primary) 8%, transparent)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = n.is_read ? 'transparent' : 'color-mix(in srgb, var(--primary) 4%, transparent)')}
                                    >
                                        <button onClick={() => handleNotificationClick(n)} className="flex flex-1 gap-3 text-left min-w-0">
                                            <div className="mt-0.5 shrink-0">{notificationIcon(n.type)}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm truncate font-body" style={{ color: n.is_read ? 'var(--muted-foreground)' : 'var(--foreground)' }}>
                                                    {n.title}
                                                </p>
                                                <p className="font-body text-xs italic line-clamp-2 mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                                                    {n.message}
                                                </p>
                                                <p className="font-display text-[9px] uppercase tracking-wider mt-1" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }}>
                                                    {timeAgo(n.created_at)}
                                                </p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={e => handleDismiss(e, n.id)}
                                            className="shrink-0 mt-0.5 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-all duration-200"
                                            style={{ color: 'var(--muted-foreground)' }}
                                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--destructive)')}
                                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-2.5" style={{ borderTop: '1px solid var(--border)' }}>
                            <Link
                                href="/notifications"
                                onClick={() => setOpen(false)}
                                className="block text-center font-display text-[9px] uppercase tracking-[0.2em] transition-colors duration-200"
                                style={{ color: 'var(--muted-foreground)' }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                            >
                                View all notifications
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
