import { Link, usePage } from "@inertiajs/react"
import {
    AlertTriangle,
    BarChart3,
    Bell,
    Building2,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Clock,
    FileCheck,
    FileSearch,
    FileText,
    FolderOpen,
    GitCompare,
    LayoutDashboard,
    LayoutGrid,
    LogOut,
    ScrollText,
    Settings,
    Shield,
    ShieldAlert,
    Sliders,
    Sparkles,
    UserPlus,
    Users,
    X,
} from "lucide-react"
import { useEffect, useRef } from "react"
import { useSidebarCollapsed, useSidebarDrawer } from "@/hooks/use-sidebar-state"
import { cn } from "@/lib/utils"

type SharedProps = {
    auth: {
        user: { name: string; email: string; role: string }
    }
    notifications: {
        unread_count: number
        pending_approvals_count: number
        open_remediation_tasks: number
        security_audits_in_progress: number
    }
}

const ALL_ROLES = ['super_admin','admin','auditor','user'] as const
const REVIEW_ROLES = ['super_admin','admin','auditor'] as const
const WRITE_ROLES = ['super_admin','admin','user'] as const

const mainNavigation = [
    { name: "Dashboard",           href: "/dashboard",            icon: LayoutDashboard, roles: ALL_ROLES },
    { name: "Executive Dashboard", href: "/executive-dashboard",  icon: FileText,        roles: ALL_ROLES },
    { name: "AI Assistant",        href: "/chatbot",              icon: Sparkles,        roles: ALL_ROLES },
    { name: "Risk Register",href: "/risks",             icon: AlertTriangle,   roles: ALL_ROLES },
    { name: "Assessments",  href: "/assessments",       icon: ClipboardList,   roles: ALL_ROLES },
    { name: "Evidence",     href: "/evidence",          icon: FolderOpen,      roles: ALL_ROLES },
    { name: "Gap Analysis", href: "/gap-analysis",      icon: FileCheck,       roles: ALL_ROLES },
    { name: "Security Audit", href: "/security-audits", icon: ShieldAlert,     roles: ALL_ROLES, badgeKey: 'security_audits' },
    { name: "Crosswalk",    href: "/crosswalk",         icon: GitCompare,      roles: ALL_ROLES },
    { name: "Controls Hub", href: "/controls/hub",      icon: LayoutGrid,      roles: ALL_ROLES },
    { name: "Remediation",  href: "/remediation-tasks", icon: ClipboardList,   roles: WRITE_ROLES,                 badgeKey: 'remediation' },
    { name: "Reports",      href: "/reports",           icon: BarChart3,       roles: ALL_ROLES },
]

const reviewNavigation = [
    { name: "Approvals",         href: "/controls/approvals", icon: Clock,      roles: REVIEW_ROLES, badgeKey: 'approvals' },
    { name: "Evidence Coverage", href: "/evidence-coverage",  icon: FileSearch, roles: REVIEW_ROLES },
    { name: "Audit Logs",        href: "/audit-logs",         icon: ScrollText, roles: REVIEW_ROLES },
    { name: "Notifications",     href: "/notifications",      icon: Bell,       roles: ALL_ROLES, badgeKey: 'notifications' },
]

// Items shown to corporation admins and super_admins.
const adminNavigation = [
    { name: "Users",            href: "/admin/users",           icon: Users,    roles: ['super_admin','admin'] as const },
    { name: "Invite Employees", href: "/admin/invites",         icon: UserPlus, roles: ['super_admin','admin'] as const },
    { name: "Risk Appetite",    href: "/risk-appetite",         icon: Sliders,  roles: ['super_admin','admin'] as const },
]

// Platform-only — super_admin sees corporations, frameworks, controls library.
const platformNavigation = [
    { name: "Corporations",     href: "/admin/corporations",    icon: Building2, roles: ['super_admin'] as const },
    { name: "Frameworks",       href: "/admin/frameworks",      icon: Shield,    roles: ['super_admin'] as const },
    { name: "Controls Library", href: "/admin/controls",        icon: Settings,  roles: ['super_admin'] as const },
]

export function AdminSidebar() {
    const { auth, notifications } = usePage<SharedProps>().props
    const unreadCount          = notifications?.unread_count ?? 0
    const pendingApprovals     = notifications?.pending_approvals_count ?? 0
    const openRemediationTasks = notifications?.open_remediation_tasks ?? 0
    const securityAuditsInProgress = notifications?.security_audits_in_progress ?? 0
    const url       = usePage().url as string
    const role      = auth.user.role
    const isSuper   = role === 'super_admin'
    const isAdmin   = role === 'admin'
    const showAdminSection = isSuper || isAdmin
    const showPlatformSection = isSuper
    const initials  = auth.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

    const [collapsed, setCollapsed] = useSidebarCollapsed()
    const [drawerOpen, setDrawerOpen] = useSidebarDrawer()
    const lastUrlRef = useRef(url)

    // Close mobile drawer when URL changes (SPA route nav). Skip first run.
    useEffect(() => {
        if (lastUrlRef.current !== url) {
            lastUrlRef.current = url
            if (drawerOpen) setDrawerOpen(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url])

    // ESC closes mobile drawer.
    useEffect(() => {
        if (!drawerOpen) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setDrawerOpen(false)
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [drawerOpen])

    const getBadge = (key?: string): number | undefined => {
        if (!key) return undefined
        if (key === 'notifications' && unreadCount > 0)          return unreadCount
        if (key === 'approvals'     && pendingApprovals > 0)     return pendingApprovals
        if (key === 'remediation'   && openRemediationTasks > 0) return openRemediationTasks
        if (key === 'security_audits' && securityAuditsInProgress > 0) return securityAuditsInProgress
        return undefined
    }

    return (
        <>
            {/* ── Mobile drawer scrim ─────────────────────────────────── */}
            {drawerOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    style={{ background: 'color-mix(in srgb, var(--foreground) 40%, transparent)', backdropFilter: 'blur(2px)' }}
                    onClick={() => setDrawerOpen(false)}
                    aria-hidden
                />
            )}

            <aside
                aria-label="Primary navigation"
                className={cn(
                    // mobile drawer behaviour
                    'fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300 ease-out lg:transition-[width] lg:duration-200',
                    drawerOpen ? 'translate-x-0' : '-translate-x-full',
                    'lg:translate-x-0',
                    collapsed ? 'lg:w-16' : 'lg:w-64',
                    'w-64',
                )}
                style={{ background: 'var(--sidebar)', borderRight: '1px solid var(--sidebar-border)' }}
            >
                {/* ── Wordmark + collapse / close control ───────────── */}
                <div
                    className={cn(
                        'flex h-16 shrink-0 items-center gap-3',
                        collapsed ? 'lg:justify-center lg:px-0' : 'px-5',
                    )}
                    style={{ borderBottom: '1px solid var(--sidebar-border)' }}
                >
                    <img
                        src="/logo-dark.png"
                        alt="GRC logo"
                        className="h-14 w-14 shrink-0 object-contain"
                    />
                    {!collapsed && (
                        <span className="flex-1 truncate text-[12px] uppercase" style={{ color: 'var(--sidebar-foreground)', letterSpacing: '0.28em', fontWeight: 600 }}>
                            GRC<span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}> · Charter</span>
                        </span>
                    )}
                    {/* Mobile close (drawer mode only) */}
                    <button
                        type="button"
                        className="ml-auto rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
                        onClick={() => setDrawerOpen(false)}
                        aria-label="Close navigation"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>


                <nav className={cn('flex flex-1 min-h-0 flex-col gap-5 overflow-y-auto py-4', collapsed ? 'lg:px-2' : 'px-3')}>
                    {/* Main */}
                    <ul className="flex flex-col gap-0.5">
                        {mainNavigation
                            .filter(item => (item.roles as readonly string[]).includes(role))
                            .map(item => (
                                <NavItem key={item.name} item={item} currentUrl={url} badge={getBadge((item as any).badgeKey)} collapsed={collapsed} />
                            ))
                        }
                    </ul>

                    {/* Review */}
                    <div>
                        <SectionLabel collapsed={collapsed}>Review</SectionLabel>
                        <ul className="flex flex-col gap-0.5">
                            {reviewNavigation
                                .filter(item => (item.roles as readonly string[]).includes(role))
                                .map(item => (
                                    <NavItem key={item.name} item={item} currentUrl={url} badge={getBadge((item as any).badgeKey)} collapsed={collapsed} />
                                ))
                            }
                        </ul>
                    </div>

                    {/* Administration (corp admins + super admins) */}
                    {showAdminSection && (
                        <div>
                            <SectionLabel collapsed={collapsed}>Administration</SectionLabel>
                            <ul className="flex flex-col gap-0.5">
                                {adminNavigation
                                    .filter(item => (item.roles as readonly string[]).includes(role))
                                    .map(item => (
                                        <NavItem key={item.name} item={item} currentUrl={url} collapsed={collapsed} />
                                    ))}
                            </ul>
                        </div>
                    )}

                    {/* Platform (super admin only) */}
                    {showPlatformSection && (
                        <div>
                            <SectionLabel collapsed={collapsed}>Platform</SectionLabel>
                            <ul className="flex flex-col gap-0.5">
                                {platformNavigation
                                    .filter(item => (item.roles as readonly string[]).includes(role))
                                    .map(item => (
                                        <NavItem key={item.name} item={item} currentUrl={url} collapsed={collapsed} />
                                    ))}
                            </ul>
                        </div>
                    )}
                </nav>

                {/* ── User footer ───────────────────────────────────────── */}
                <div className="shrink-0" style={{ borderTop: '1px solid var(--sidebar-border)', padding: collapsed ? '8px' : '12px' }}>
                    <div
                        className={cn(
                            'flex items-center rounded-2xl',
                            collapsed ? 'lg:justify-center lg:p-1.5' : 'gap-3 px-3 py-2.5',
                        )}
                        style={collapsed
                            ? { background: 'transparent' }
                            : { background: 'color-mix(in srgb, var(--sidebar-primary) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--sidebar-primary) 14%, transparent)' }
                        }
                    >
                        <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                            style={{ background: 'var(--sidebar-primary)', color: 'var(--sidebar-primary-foreground)' }}
                            title={collapsed ? auth.user.name : undefined}
                        >
                            <span className="text-[10px]" style={{ fontWeight: 600 }}>{initials}</span>
                        </div>
                        {!collapsed && (
                            <>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm leading-tight" style={{ color: 'var(--sidebar-foreground)', fontWeight: 500 }}>
                                        {auth.user.name}
                                    </p>
                                    <p className="mt-0.5 truncate text-[11px] leading-tight" style={{ color: 'var(--muted-foreground)' }}>
                                        {auth.user.email}
                                    </p>
                                </div>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    title="Log out"
                                    className="rounded-full p-1 transition-colors duration-200"
                                    style={{ color: 'var(--muted-foreground)' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--sidebar-primary)')}
                                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                                >
                                    <LogOut className="h-3.5 w-3.5" />
                                </Link>
                            </>
                        )}
                    </div>
                    {collapsed && (
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            title="Log out"
                            className="mt-1.5 hidden w-full items-center justify-center rounded-2xl p-1.5 text-muted-foreground transition-colors hover:text-destructive lg:flex"
                        >
                            <LogOut className="h-4 w-4" />
                        </Link>
                    )}
                </div>

                {/* ── Desktop collapse toggle (rail) ────────────────── */}
                <button
                    type="button"
                    onClick={() => setCollapsed((c) => !c)}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    className="absolute -right-3 top-20 z-10 hidden h-6 w-6 items-center justify-center rounded-full border bg-card shadow-sm transition-all hover:scale-105 lg:flex"
                    style={{
                        borderColor: 'var(--border)',
                        color: 'var(--muted-foreground)',
                        boxShadow: '0 4px 12px -4px color-mix(in srgb, var(--foreground) 25%, transparent)',
                    }}
                >
                    {collapsed
                        ? <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                        : <ChevronLeft  className="h-3.5 w-3.5" strokeWidth={2} />
                    }
                </button>
            </aside>
        </>
    )
}

function SectionLabel({ children, collapsed }: { children: React.ReactNode; collapsed?: boolean }) {
    if (collapsed) {
        // Render a thin divider to separate sections in icon-only mode.
        return <div className="my-1 hidden h-px lg:block" style={{ background: 'var(--sidebar-border)' }} aria-hidden />
    }
    return (
        <p className="px-3 pb-2 text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
            {children}
        </p>
    )
}

function NavItem({
    item,
    currentUrl,
    badge,
    collapsed,
}: {
    item: { name: string; href: string; icon: any }
    currentUrl: string
    badge?: number
    collapsed?: boolean
}) {
    const isActive = currentUrl.startsWith(item.href) &&
        (item.href !== '/dashboard' || currentUrl === '/dashboard')

    return (
        <li>
            <Link
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={cn(
                    "group flex items-center gap-3 rounded-full transition-all duration-200 text-sm",
                    collapsed ? 'lg:justify-center lg:px-0 lg:py-2 px-3 py-2' : 'px-3 py-2',
                )}
                style={isActive
                    ? { color: 'var(--sidebar-primary)', background: 'color-mix(in srgb, var(--sidebar-primary) 10%, transparent)', fontWeight: 500 }
                    : { color: 'var(--muted-foreground)', background: 'transparent', fontWeight: 400 }
                }
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = 'var(--sidebar-foreground)'; e.currentTarget.style.background = 'color-mix(in srgb, var(--sidebar-primary) 6%, transparent)' } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = 'var(--muted-foreground)'; e.currentTarget.style.background = 'transparent' } }}
            >
                <div className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                    <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                    {/* tiny dot indicator on collapsed state when there's a badge */}
                    {collapsed && badge !== undefined && badge > 0 && (
                        <span
                            className="absolute -right-1 -top-1 hidden h-2 w-2 rounded-full lg:block"
                            style={{ background: 'var(--destructive)' }}
                            aria-hidden
                        />
                    )}
                </div>
                {!collapsed && (
                    <>
                        <span className="flex-1 truncate">{item.name}</span>
                        {badge !== undefined && badge > 0 && (
                            <span
                                className="rounded-full px-2 py-0.5 text-[10px] tabular-nums"
                                style={{ background: 'color-mix(in srgb, var(--destructive) 14%, transparent)', color: 'var(--destructive)', fontWeight: 500 }}
                            >
                                {badge > 99 ? '99+' : badge}
                            </span>
                        )}
                    </>
                )}
            </Link>
        </li>
    )
}
