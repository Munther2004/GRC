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
    }
}

const mainNavigation = [
    { name: "Dashboard",    href: "/dashboard",        icon: LayoutDashboard, roles: ['admin','auditor','user'] },
    { name: "AI Assistant", href: "/chatbot",           icon: Sparkles,        roles: ['admin','auditor','user'] },
    { name: "Risk Register",href: "/risks",             icon: AlertTriangle,   roles: ['admin','auditor','user'] },
    { name: "Assessments",  href: "/assessments",       icon: ClipboardList,   roles: ['admin','auditor','user'] },
    { name: "Evidence",     href: "/evidence",          icon: FolderOpen,      roles: ['admin','auditor','user'] },
    { name: "Gap Analysis", href: "/gap-analysis",      icon: FileCheck,       roles: ['admin','auditor','user'] },
    { name: "Crosswalk",    href: "/crosswalk",         icon: GitCompare,      roles: ['admin','auditor','user'] },
    { name: "Controls Hub", href: "/controls/hub",      icon: LayoutGrid,      roles: ['admin','auditor','user'] },
    { name: "Remediation",  href: "/remediation-tasks", icon: ClipboardList,   roles: ['admin','user'],           badgeKey: 'remediation' },
    { name: "Reports",      href: "/reports",           icon: BarChart3,       roles: ['admin','auditor','user'] },
]

const reviewNavigation = [
    { name: "Approvals",     href: "/controls/approvals", icon: Clock,      roles: ['admin','auditor'], badgeKey: 'approvals' },
    { name: "Audit Logs",    href: "/audit-logs",         icon: ScrollText, roles: ['admin','auditor'] },
    { name: "Notifications", href: "/notifications",      icon: Bell,       roles: ['admin','auditor','user'], badgeKey: 'notifications' },
]

const adminNavigation = [
    { name: "Users",            href: "/admin/users",           icon: Users    },
    { name: "Corporations",     href: "/admin/corporations",    icon: Building2 },
    { name: "Frameworks",       href: "/admin/frameworks",      icon: Shield   },
    { name: "Controls Library", href: "/admin/controls",        icon: Settings },
    { name: "Risk Appetite",    href: "/risk-appetite",         icon: Sliders  },
]

export function AdminSidebar() {
    const { auth, notifications } = usePage<SharedProps>().props
    const unreadCount          = notifications?.unread_count ?? 0
    const pendingApprovals     = notifications?.pending_approvals_count ?? 0
    const openRemediationTasks = notifications?.open_remediation_tasks ?? 0
    const url       = usePage().url as string
    const isAdmin   = auth.user.role === 'admin'
    const isAuditor = auth.user.role === 'auditor'
    const initials  = auth.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    const roleName  = isAdmin ? 'Admin' : isAuditor ? 'Auditor' : 'Member'

    const getBadge = (key?: string): number | undefined => {
        if (!key) return undefined
        if (key === 'notifications' && unreadCount > 0)          return unreadCount
        if (key === 'approvals'     && pendingApprovals > 0)     return pendingApprovals
        if (key === 'remediation'   && openRemediationTasks > 0) return openRemediationTasks
        return undefined
    }

    return (
        <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
            <div
                className="flex grow flex-col overflow-y-auto"
                style={{ background: '#091413', borderRight: '1px solid #285A48' }}
            >
                {/* ── Wordmark ───────────────────────────────────────────── */}
                <div
                    className="flex h-16 shrink-0 items-center gap-3 px-5"
                    style={{ borderBottom: '1px solid #285A48' }}
                >
                    <div
                        className="flex items-center justify-center w-7 h-7 rounded-sm"
                        style={{ border: '1px solid rgba(64,138,113,0.6)', background: 'rgba(64,138,113,0.08)' }}
                    >
                        <Shield className="w-3.5 h-3.5" style={{ color: '#408A71' }} strokeWidth={1.5} />
                    </div>
                    <span className="font-display text-xs uppercase tracking-[0.25em]" style={{ color: '#E0F5EC' }}>
                        GRC
                    </span>
                    <span
                        className="ml-auto font-display text-[9px] uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-sm"
                        style={{ color: '#7ABFA8', border: '1px solid #285A48' }}
                    >
                        {roleName}
                    </span>
                </div>

                {/* Ornate divider */}
                <div style={{ position: 'relative', height: '1px', margin: '0 16px', background: 'linear-gradient(90deg, transparent, #285A48 30%, #408A71 50%, #285A48 70%, transparent)' }}>
                    <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', color: '#408A71', fontSize: '8px', background: '#091413', padding: '0 8px' }}>✶</span>
                </div>

                <nav className="flex flex-1 flex-col gap-5 px-3 py-4">
                    {/* Main */}
                    <ul className="flex flex-col gap-0.5">
                        {mainNavigation
                            .filter(item => item.roles.includes(auth.user.role))
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
                                .filter(item => item.roles.includes(auth.user.role))
                                .map(item => (
                                    <NavItem key={item.name} item={item} currentUrl={url} badge={getBadge((item as any).badgeKey)} />
                                ))
                            }
                        </ul>
                    </div>

                    {/* Admin */}
                    {isAdmin && (
                        <div>
                            <SectionLabel>Administration</SectionLabel>
                            <ul className="flex flex-col gap-0.5">
                                {adminNavigation.map(item => (
                                    <NavItem key={item.name} item={item} currentUrl={url} />
                                ))}
                            </ul>
                        </div>
                    )}
                </nav>

                {/* ── User footer ───────────────────────────────────────── */}
                <div style={{ borderTop: '1px solid #285A48', padding: '12px' }}>
                    <div className="flex items-center gap-2.5 rounded px-2 py-1.5">
                        {/* Initials medallion */}
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(64,138,113,0.12)', border: '1px solid rgba(64,138,113,0.5)' }}
                        >
                            <span className="font-display text-[10px]" style={{ color: '#408A71' }}>{initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-heading text-sm truncate leading-tight" style={{ color: '#E0F5EC' }}>
                                {auth.user.name}
                            </p>
                            <p className="font-body text-[11px] italic truncate leading-tight" style={{ color: '#7ABFA8' }}>
                                {auth.user.email}
                            </p>
                        </div>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            title="Log out"
                            className="transition-colors duration-200"
                            style={{ color: '#7ABFA8' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#408A71')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#7ABFA8')}
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
        <p className="px-3 pb-2 font-display text-[9px] uppercase tracking-[0.25em]" style={{ color: '#7ABFA8' }}>
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
                    "group flex items-center gap-2.5 rounded px-3 py-2 transition-all duration-200",
                    "font-display text-[10px] uppercase tracking-[0.14em]",
                )}
                style={isActive
                    ? { color: '#408A71', background: 'rgba(64,138,113,0.1)', borderLeft: '2px solid #408A71', paddingLeft: '10px' }
                    : { color: '#7ABFA8', background: 'transparent', borderLeft: '2px solid transparent', paddingLeft: '10px' }
                }
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#E0F5EC'; e.currentTarget.style.background = 'rgba(61,51,43,0.5)' } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#7ABFA8'; e.currentTarget.style.background = 'transparent' } }}
            >
                <item.icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                <span className="flex-1 truncate">{item.name}</span>
                {badge !== undefined && badge > 0 && (
                    <span
                        className="font-display text-[9px] px-1.5 py-0.5 rounded-full tabular-nums"
                        style={{ background: 'rgba(139,38,53,0.25)', color: '#408A71', border: '1px solid rgba(139,38,53,0.4)' }}
                    >
                        {badge > 99 ? '99+' : badge}
                    </span>
                )}
            </Link>
        </li>
    )
}
