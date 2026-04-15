import { Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    BarChart3,
    Bell,
    ChevronDown,
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

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
        pending_approvals_count: number;
        open_remediation_tasks: number;
    };
};

const mainNavigation = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['admin', 'auditor', 'user'],
    },
    {
        name: 'AI Assistant',
        href: '/chatbot',
        icon: Sparkles,
        roles: ['admin', 'auditor', 'user'],
    },
    {
        name: 'Risk Register',
        href: '/risks',
        icon: AlertTriangle,
        roles: ['admin', 'auditor', 'user'],
    },
    {
        name: 'Assessments',
        href: '/assessments',
        icon: ClipboardList,
        roles: ['admin', 'auditor', 'user'],
    },
    {
        name: 'Evidence',
        href: '/evidence',
        icon: FolderOpen,
        roles: ['admin', 'auditor', 'user'],
    },
    {
        name: 'Gap Analysis',
        href: '/gap-analysis',
        icon: FileCheck,
        roles: ['admin', 'auditor', 'user'],
    },
    {
        name: 'Crosswalk',
        href: '/crosswalk',
        icon: GitCompare,
        roles: ['admin', 'auditor', 'user'],
    },
    {
        name: 'Controls Hub',
        href: '/controls/hub',
        icon: LayoutGrid,
        roles: ['admin', 'auditor', 'user'],
    },
    {
        name: 'Remediation',
        href: '/remediation-tasks',
        icon: ClipboardList,
        roles: ['admin', 'user'],
        badgeKey: 'remediation',
    },
    {
        name: 'Reports',
        href: '/reports',
        icon: BarChart3,
        roles: ['admin', 'auditor', 'user'],
    },
];

const reviewNavigation = [
    {
        name: 'Approvals',
        href: '/controls/approvals',
        icon: Clock,
        roles: ['admin', 'auditor'],
        badgeKey: 'approvals',
    },
    {
        name: 'Audit Logs',
        href: '/audit-logs',
        icon: ScrollText,
        roles: ['admin', 'auditor'],
    },
    {
        name: 'Notifications',
        href: '/notifications',
        icon: Bell,
        roles: ['admin', 'auditor', 'user'],
        badgeKey: 'notifications',
    },
];

const adminNavigation = [
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Frameworks', href: '/admin/frameworks', icon: Shield },
    { name: 'Controls Library', href: '/admin/controls', icon: Settings },
    { name: 'Risk Appetite', href: '/risk-appetite', icon: Sliders },
];

export function AdminSidebar() {
    const { auth, notifications } = usePage<SharedProps>().props;
    const unreadCount = notifications?.unread_count ?? 0;
    const pendingApprovals = notifications?.pending_approvals_count ?? 0;
    const openRemediationTasks = notifications?.open_remediation_tasks ?? 0;
    const url = usePage().url as string;
    const isAdmin = auth.user.role === 'admin';
    const isAuditor = auth.user.role === 'auditor';
    const initials = auth.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    const roleName = isAdmin ? 'Admin' : isAuditor ? 'Auditor' : 'Member';

    const [expandedGroups, setExpandedGroups] = useState<
        Record<string, boolean>
    >({
        main: true,
        review: true,
        admin: true,
    });

    const toggleGroup = (group: string) => {
        setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
    };

    const getBadge = (badgeKey?: string): number | undefined => {
        if (!badgeKey) return undefined;
        if (badgeKey === 'notifications' && unreadCount > 0) return unreadCount;
        if (badgeKey === 'approvals' && pendingApprovals > 0)
            return pendingApprovals;
        if (badgeKey === 'remediation' && openRemediationTasks > 0)
            return openRemediationTasks;
        return undefined;
    };

    return (
        <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-60 lg:flex-col">
            <div className="flex grow flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar">
                {/* Wordmark */}
                <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-5">
                    <svg
                        viewBox="0 0 76 65"
                        className="h-4 w-4 fill-sidebar-foreground"
                        aria-hidden
                    >
                        <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                    </svg>
                    <span className="text-[13px] font-semibold tracking-tight text-sidebar-foreground">
                        grc
                    </span>
                    <span className="ml-auto font-mono text-[10px] tracking-wider text-sidebar-foreground/40 uppercase">
                        {roleName}
                    </span>
                </div>

                <nav className="flex flex-1 flex-col gap-2 px-2 py-4">
                    {/* Main */}
                    <NavGroup
                        name="Navigation"
                        expanded={expandedGroups.main}
                        onToggle={() => toggleGroup('main')}
                        items={mainNavigation
                            .filter((item) =>
                                item.roles.includes(auth.user.role),
                            )
                            .map((item) => ({
                                ...item,
                                badge: getBadge((item as any).badgeKey),
                            }))}
                        currentUrl={url}
                    />

                    {/* Review */}
                    <NavGroup
                        name="Review"
                        expanded={expandedGroups.review}
                        onToggle={() => toggleGroup('review')}
                        items={reviewNavigation
                            .filter((item) =>
                                item.roles.includes(auth.user.role),
                            )
                            .map((item) => ({
                                ...item,
                                badge: getBadge((item as any).badgeKey),
                            }))}
                        currentUrl={url}
                    />

                    {/* Admin */}
                    {isAdmin && (
                        <NavGroup
                            name="Administration"
                            expanded={expandedGroups.admin}
                            onToggle={() => toggleGroup('admin')}
                            items={adminNavigation}
                            currentUrl={url}
                        />
                    )}
                </nav>

                {/* User */}
                <div className="border-t border-sidebar-border p-3">
                    <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-sidebar-accent">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-neutral-700 to-neutral-900 ring-1 ring-sidebar-border">
                            <span className="text-[11px] font-medium text-sidebar-foreground">
                                {initials}
                            </span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] leading-tight font-medium text-sidebar-foreground">
                                {auth.user.name}
                            </p>
                            <p className="truncate text-[11px] leading-tight text-sidebar-foreground/45">
                                {auth.user.email}
                            </p>
                        </div>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="text-sidebar-foreground/40 transition-colors hover:text-sidebar-foreground"
                            title="Log out"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            </div>
        </aside>
    );
}

function NavGroup({
    name,
    expanded,
    onToggle,
    items,
    currentUrl,
}: {
    name: string;
    expanded: boolean;
    onToggle: () => void;
    items: Array<{ name: string; href: string; icon: any; badge?: number }>;
    currentUrl: string;
}) {
    return (
        <div>
            <button
                onClick={onToggle}
                className="flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-medium tracking-[0.12em] text-sidebar-foreground/50 uppercase transition-colors hover:text-sidebar-foreground/70"
            >
                <span>{name}</span>
                <ChevronDown
                    className={cn(
                        'h-3.5 w-3.5 transition-transform',
                        expanded ? 'rotate-180' : '',
                    )}
                />
            </button>
            {expanded && (
                <ul className="mt-1 flex flex-col gap-0.5">
                    {items.map((item) => (
                        <NavItem
                            key={item.name}
                            item={item}
                            currentUrl={currentUrl}
                            badge={item.badge}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
}

function NavItem({
    item,
    currentUrl,
    badge,
}: {
    item: { name: string; href: string; icon: any };
    currentUrl: string;
    badge?: number;
}) {
    const isActive =
        currentUrl.startsWith(item.href) &&
        (item.href !== '/dashboard' || currentUrl === '/dashboard');

    return (
        <li>
            <Link
                href={item.href}
                className={cn(
                    'group relative flex items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors',
                    isActive
                        ? 'bg-sidebar-accent text-sidebar-foreground'
                        : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                )}
            >
                <item.icon
                    className={cn(
                        'h-4 w-4 shrink-0 transition-colors',
                        isActive
                            ? 'text-sidebar-foreground'
                            : 'text-sidebar-foreground/45 group-hover:text-sidebar-foreground/80',
                    )}
                />
                <span className="flex-1 truncate">{item.name}</span>
                {badge !== undefined && badge > 0 && (
                    <span className="font-mono text-[10px] font-medium text-sidebar-foreground/60 tabular-nums">
                        {badge > 99 ? '99+' : badge}
                    </span>
                )}
            </Link>
        </li>
    );
}
