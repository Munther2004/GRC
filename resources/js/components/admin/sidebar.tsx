import { Link, usePage } from "@inertiajs/react"
import {
    AlertTriangle,
    BarChart3,
    Bell,
    ClipboardList,
    Clock,
    FileCheck,
    FolderOpen,
    GitCompare,
    LayoutDashboard,
    LayoutGrid,
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
        user: {
            name: string
            email: string
            role: string
        }
    }
    notifications: {
        unread_count: number
        pending_approvals_count: number
        open_remediation_tasks: number
    }
}

const mainNavigation = [
    { name: "Dashboard",         href: "/dashboard",         icon: LayoutDashboard, roles: ['admin', 'auditor', 'user'] },
    { name: "AI Assistant",      href: "/chatbot",            icon: Sparkles,        roles: ['admin', 'auditor', 'user'] },
    { name: "Risk Register",     href: "/risks",              icon: AlertTriangle,   roles: ['admin', 'auditor', 'user'] },
    { name: "Assessments",       href: "/assessments",        icon: ClipboardList,   roles: ['admin', 'auditor', 'user'] },
    { name: "Evidence",          href: "/evidence",           icon: FolderOpen,      roles: ['admin', 'auditor', 'user'] },
    { name: "Gap Analysis",      href: "/gap-analysis",       icon: FileCheck,       roles: ['admin', 'auditor', 'user'] },
    { name: "Crosswalk",         href: "/crosswalk",          icon: GitCompare,      roles: ['admin', 'auditor', 'user'] },
    { name: "Controls Hub",      href: "/controls/hub",       icon: LayoutGrid,      roles: ['admin', 'auditor', 'user'] },
    { name: "Remediation Tasks", href: "/remediation-tasks",  icon: ClipboardList,   roles: ['admin', 'user'], badgeKey: 'remediation' },
    { name: "Reports",           href: "/reports",            icon: BarChart3,       roles: ['admin', 'auditor', 'user'] },
]

const reviewNavigation = [
    { name: "Approval Queue", href: "/controls/approvals", icon: Clock,      roles: ['admin', 'auditor'], badgeKey: 'approvals' },
    { name: "Audit Logs",     href: "/audit-logs",         icon: ScrollText, roles: ['admin', 'auditor'] },
    { name: "Notifications",  href: "/notifications",      icon: Bell,       roles: ['admin', 'auditor', 'user'], badgeKey: 'notifications' },
]

const adminNavigation = [
    { name: "Users & Roles",    href: "/admin/users",      icon: Users },
    { name: "Frameworks",       href: "/admin/frameworks", icon: Shield },
    { name: "Controls Library", href: "/admin/controls",   icon: Settings },
    { name: "Risk Appetite",    href: "/risk-appetite",    icon: Sliders },
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
    const roleName  = isAdmin ? 'Administrator' : isAuditor ? 'Auditor' : 'User'

    const getBadge = (badgeKey?: string): number | undefined => {
        if (!badgeKey) return undefined
        if (badgeKey === 'notifications' && unreadCount > 0)          return unreadCount
        if (badgeKey === 'approvals'     && pendingApprovals > 0)     return pendingApprovals
        if (badgeKey === 'remediation'   && openRemediationTasks > 0) return openRemediationTasks
        return undefined
    }

    return (
        <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-sidebar border-r border-sidebar-border px-4 pb-4">

                {/* Logo */}
                <div className="flex h-16 shrink-0 items-center gap-3 px-2">
                    <div className="w-8 h-8 bg-sidebar-primary rounded-sm flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 text-sidebar-primary-foreground" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm text-sidebar-foreground leading-tight">GRC System</p>
                        <p className="text-xs text-sidebar-foreground/50">Management Platform</p>
                    </div>
                </div>

                <nav className="flex flex-1 flex-col gap-y-6">

                    {/* Main Navigation — filtered by role */}
                    <ul role="list" className="flex flex-col gap-y-1">
                        {mainNavigation
                            .filter(item => item.roles.includes(auth.user.role))
                            .map((item) => (
                                <NavItem
                                    key={item.name}
                                    item={item}
                                    currentUrl={url}
                                    badge={getBadge((item as any).badgeKey)}
                                />
                            ))
                        }
                    </ul>

                    {/* Review Section */}
                    <div>
                        <p className="px-3 text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider mb-1">
                            Review
                        </p>
                        <ul role="list" className="flex flex-col gap-y-1">
                            {reviewNavigation
                                .filter(item => item.roles.includes(auth.user.role))
                                .map((item) => (
                                    <NavItem
                                        key={item.name}
                                        item={item}
                                        currentUrl={url}
                                        badge={getBadge((item as any).badgeKey)}
                                    />
                                ))
                            }
                        </ul>
                    </div>

                    {/* Admin Section — Admin only */}
                    {isAdmin && (
                        <div>
                            <p className="px-3 text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider mb-1">
                                Administration
                            </p>
                            <ul role="list" className="flex flex-col gap-y-1">
                                {adminNavigation.map((item) => (
                                    <NavItem key={item.name} item={item} currentUrl={url} />
                                ))}
                            </ul>
                        </div>
                    )}
                </nav>

                {/* User Footer */}
                <div className="border-t border-sidebar-border pt-4">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-9 h-9 rounded-full bg-sidebar-primary flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-sidebar-primary-foreground">
                                {initials}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-sidebar-foreground truncate">
                                {auth.user.name}
                            </p>
                            <p className="text-xs text-sidebar-foreground/50 truncate">{roleName}</p>
                        </div>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
                            title="Log out"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </aside>
    )
}

function NavItem({ item, currentUrl, badge }: { item: { name: string; href: string; icon: any }; currentUrl: string; badge?: number }) {
    const isActive = currentUrl.startsWith(item.href) && (item.href !== '/dashboard' || currentUrl === '/dashboard')

    return (
        <li>
            <Link
                href={item.href}
                className={cn(
                    "group flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-colors",
                    isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
            >
                <item.icon className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50"
                )} />
                <span className="flex-1">{item.name}</span>
                {badge !== undefined && badge > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 bg-destructive rounded-full flex items-center justify-center text-[10px] font-bold text-destructive-foreground leading-none">
                        {badge > 99 ? '99+' : badge}
                    </span>
                )}
            </Link>
        </li>
    )
}
