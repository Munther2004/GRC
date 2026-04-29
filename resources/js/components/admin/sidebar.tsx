import { Link, usePage } from "@inertiajs/react"
import {
    AlertTriangle,
    BarChart3,
    Bell,
    Building2,
    ClipboardList,
    Clock,
    FileCheck,
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
    Users,
} from "lucide-react"
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
    { name: "Dashboard",    href: "/dashboard",        icon: LayoutDashboard, roles: ALL_ROLES },
    { name: "AI Assistant", href: "/chatbot",           icon: Sparkles,        roles: ALL_ROLES },
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
    { name: "Approvals",     href: "/controls/approvals", icon: Clock,      roles: REVIEW_ROLES, badgeKey: 'approvals' },
    { name: "Audit Logs",    href: "/audit-logs",         icon: ScrollText, roles: REVIEW_ROLES },
    { name: "Notifications", href: "/notifications",      icon: Bell,       roles: ALL_ROLES, badgeKey: 'notifications' },
]

// Items shown to corporation admins and super_admins.
const adminNavigation = [
    { name: "Users",            href: "/admin/users",           icon: Users,    roles: ['super_admin','admin'] as const },
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

    const getBadge = (key?: string): number | undefined => {
        if (!key) return undefined
        if (key === 'notifications' && unreadCount > 0)          return unreadCount
        if (key === 'approvals'     && pendingApprovals > 0)     return pendingApprovals
        if (key === 'remediation'   && openRemediationTasks > 0) return openRemediationTasks
        if (key === 'security_audits' && securityAuditsInProgress > 0) return securityAuditsInProgress
        return undefined
    }

    return (
        <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
            <div
                className="flex grow flex-col overflow-y-auto"
                style={{ background: 'var(--sidebar)', borderRight: '1px solid var(--sidebar-border)' }}
            >
                {/* ── Wordmark ───────────────────────────────────────────── */}
                <div
                    className="flex h-16 shrink-0 items-center gap-3 px-5"
                    style={{ borderBottom: '1px solid var(--sidebar-border)' }}
                >
                    <div
                        className="flex items-center justify-center w-8 h-8 rounded-lg"
                        style={{ background: 'var(--sidebar-foreground)', color: 'var(--sidebar)' }}
                    >
                        <Shield className="w-3.5 h-3.5" strokeWidth={1.8} />
                    </div>
                    <span className="text-[12px] uppercase" style={{ color: 'var(--sidebar-foreground)', letterSpacing: '0.28em', fontWeight: 600 }}>
                        GRC<span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}> · Charter</span>
                    </span>
                </div>


                <nav className="flex flex-1 flex-col gap-5 px-3 py-4">
                    {/* Main */}
                    <ul className="flex flex-col gap-0.5">
                        {mainNavigation
                            .filter(item => (item.roles as readonly string[]).includes(role))
                            .map(item => (
                                <NavItem key={item.name} item={item} currentUrl={url} badge={getBadge((item as any).badgeKey)} />
                            ))
                        }
                    </ul>

                    {/* Review */}
                    <div>
                        <SectionLabel>Review</SectionLabel>
                        <ul className="flex flex-col gap-0.5">
                            {reviewNavigation
                                .filter(item => (item.roles as readonly string[]).includes(role))
                                .map(item => (
                                    <NavItem key={item.name} item={item} currentUrl={url} badge={getBadge((item as any).badgeKey)} />
                                ))
                            }
                        </ul>
                    </div>

                    {/* Administration (corp admins + super admins) */}
                    {showAdminSection && (
                        <div>
                            <SectionLabel>Administration</SectionLabel>
                            <ul className="flex flex-col gap-0.5">
                                {adminNavigation
                                    .filter(item => (item.roles as readonly string[]).includes(role))
                                    .map(item => (
                                        <NavItem key={item.name} item={item} currentUrl={url} />
                                    ))}
                            </ul>
                        </div>
                    )}

                    {/* Platform (super admin only) */}
                    {showPlatformSection && (
                        <div>
                            <SectionLabel>Platform</SectionLabel>
                            <ul className="flex flex-col gap-0.5">
                                {platformNavigation
                                    .filter(item => (item.roles as readonly string[]).includes(role))
                                    .map(item => (
                                        <NavItem key={item.name} item={item} currentUrl={url} />
                                    ))}
                            </ul>
                        </div>
                    )}
                </nav>

                {/* ── User footer ───────────────────────────────────────── */}
                <div style={{ borderTop: '1px solid var(--sidebar-border)', padding: '12px' }}>
                    <div className="flex items-center gap-3 rounded-2xl px-3 py-2.5" style={{ background: 'color-mix(in srgb, var(--sidebar-primary) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--sidebar-primary) 14%, transparent)' }}>
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: 'var(--sidebar-primary)', color: 'var(--sidebar-primary-foreground)' }}
                        >
                            <span className="text-[10px]" style={{ fontWeight: 600 }}>{initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm truncate leading-tight" style={{ color: 'var(--sidebar-foreground)', fontWeight: 500 }}>
                                {auth.user.name}
                            </p>
                            <p className="text-[11px] truncate leading-tight mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                                {auth.user.email}
                            </p>
                        </div>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            title="Log out"
                            className="transition-colors duration-200 p-1 rounded-full"
                            style={{ color: 'var(--muted-foreground)' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--sidebar-primary)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                        >
                            <LogOut className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>
        </aside>
    )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
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
}: {
    item: { name: string; href: string; icon: any }
    currentUrl: string
    badge?: number
}) {
    const isActive = currentUrl.startsWith(item.href) &&
        (item.href !== '/dashboard' || currentUrl === '/dashboard')

    return (
        <li>
            <Link
                href={item.href}
                className={cn(
                    "group flex items-center gap-3 rounded-full px-3 py-2 transition-all duration-200",
                    "text-sm",
                )}
                style={isActive
                    ? { color: 'var(--sidebar-primary)', background: 'color-mix(in srgb, var(--sidebar-primary) 10%, transparent)', fontWeight: 500 }
                    : { color: 'var(--muted-foreground)', background: 'transparent', fontWeight: 400 }
                }
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = 'var(--sidebar-foreground)'; e.currentTarget.style.background = 'color-mix(in srgb, var(--sidebar-primary) 6%, transparent)' } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = 'var(--muted-foreground)'; e.currentTarget.style.background = 'transparent' } }}
            >
                <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                <span className="flex-1 truncate">{item.name}</span>
                {badge !== undefined && badge > 0 && (
                    <span
                        className="text-[10px] px-2 py-0.5 rounded-full tabular-nums"
                        style={{ background: 'color-mix(in srgb, var(--destructive) 14%, transparent)', color: 'var(--destructive)', fontWeight: 500 }}
                    >
                        {badge > 99 ? '99+' : badge}
                    </span>
                )}
            </Link>
        </li>
    )
}
