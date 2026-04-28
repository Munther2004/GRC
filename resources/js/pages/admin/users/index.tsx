import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Search, Users, Shield, Eye, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { route } from '@/lib/routes';
import type { SharedProps } from '@/types';
import { ROLE_LABELS } from '@/types/auth';

interface RoleObj {
    id: number;
    name: string;
}

interface Corporation {
    id: number;
    name: string;
}

interface UserRow {
    id: number;
    name: string;
    email: string;
    role: string;
    corporation?: Corporation | null;
    roles: RoleObj[];
    created_at: string;
}

interface Permissions {
    is_super_admin: boolean;
    grantable_roles: string[];
}

interface Props extends SharedProps {
    users: {
        data: UserRow[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    stats: { total: number; super_admins: number; admins: number; auditors: number; users: number };
    filters: { search?: string; role?: string };
    permissions: Permissions;
}

const roleColors: Record<string, string> = {
    super_admin: 'bg-purple-950 text-purple-300 border-purple-300/40',
    admin: 'bg-red-950 text-red-400 border-red-200',
    auditor: 'bg-accent text-foreground border-primary/20',
    user: 'bg-muted text-foreground/75 border-border',
};

export default function UsersIndex() {
    const { users, stats, filters, permissions } = usePage<Props>().props;

    const [search, setSearch] = useState(filters.search ?? '');
    const [role, setRole] = useState(filters.role ?? 'all');

    const applyFilters = (overrides: Record<string, string> = {}) => {
        router.get(
            route('admin.users.index'),
            {
                search,
                role: role === 'all' ? '' : role,
                ...overrides,
            },
            { preserveState: true, replace: true },
        );
    };

    const deleteUser = (id: number, name: string) => {
        if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
        router.delete(route('admin.users.destroy', id));
    };

    const filterRoles = ['all', ...permissions.grantable_roles];
    if (permissions.is_super_admin && !filterRoles.includes('super_admin')) {
        filterRoles.splice(1, 0, 'super_admin');
    }

    const statTiles: { label: string; value: number; color: string; icon: React.ElementType }[] = [
        { label: 'Total Users', value: stats.total, color: 'text-primary', icon: Users },
    ];
    if (permissions.is_super_admin) {
        statTiles.push({ label: 'Super Admins', value: stats.super_admins, color: 'text-purple-400', icon: Shield });
    }
    statTiles.push(
        { label: 'Admins', value: stats.admins, color: 'text-red-500', icon: Shield },
        { label: 'Auditors', value: stats.auditors, color: 'text-primary', icon: Eye },
        { label: 'Users', value: stats.users, color: 'text-muted-foreground', icon: Users },
    );

    return (
        <AdminLayout>
            <Head title="Users & Roles" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-heading text-4xl font-normal text-foreground">
                            Users & Roles
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {permissions.is_super_admin
                                ? 'Manage users across all corporations.'
                                : 'Manage users in your corporation.'}
                        </p>
                    </div>
                    <Link href={route('admin.users.create')}>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Add User
                        </Button>
                    </Link>
                </div>

                <div className={`grid grid-cols-2 gap-4 md:grid-cols-${statTiles.length}`}>
                    {statTiles.map(({ label, value, color, icon: Icon }) => (
                        <Card key={label}>
                            <CardContent className="flex items-center gap-3 p-4">
                                <Icon className={`h-8 w-8 ${color}`} />
                                <div>
                                    <p className="text-2xl font-bold">{value}</p>
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-3">
                            <div className="relative min-w-[200px] flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or email..."
                                    value={search}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                                    onKeyDown={(e: React.KeyboardEvent) =>
                                        e.key === 'Enter' && applyFilters({ search })
                                    }
                                    className="pl-9"
                                />
                            </div>
                            <Select
                                value={role}
                                onValueChange={(v: string) => {
                                    setRole(v);
                                    applyFilters({ role: v === 'all' ? '' : v });
                                }}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filterRoles.map((r) => (
                                        <SelectItem key={r} value={r}>
                                            {r === 'all' ? 'All Roles' : ROLE_LABELS[r as keyof typeof ROLE_LABELS] ?? r}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={() => applyFilters({ search })}>
                                Search
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">
                            {users.total} user{users.total !== 1 ? 's' : ''}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="mt-4 p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-y border-border bg-muted/30">
                                    <tr>
                                        {[
                                            'Name',
                                            'Email',
                                            'Role',
                                            ...(permissions.is_super_admin ? ['Corporation'] : []),
                                            'Joined',
                                            'Actions',
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className="px-4 py-3 text-left text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {users.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={permissions.is_super_admin ? 6 : 5}
                                                className="px-4 py-12 text-center text-muted-foreground"
                                            >
                                                No users found.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.data.map((u) => (
                                            <tr key={u.id} className="transition-colors hover:bg-accent/30">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
                                                            <span className="text-xs font-semibold text-foreground">
                                                                {u.name
                                                                    .split(' ')
                                                                    .map((n) => n[0])
                                                                    .join('')
                                                                    .substring(0, 2)
                                                                    .toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <span className="font-medium text-foreground">{u.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-foreground/80">{u.email}</td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className={`capitalize ${roleColors[u.role] || 'bg-muted text-foreground'}`}
                                                    >
                                                        {ROLE_LABELS[u.role as keyof typeof ROLE_LABELS] ?? u.role}
                                                    </Badge>
                                                </td>
                                                {permissions.is_super_admin && (
                                                    <td className="px-4 py-3 text-foreground/80">
                                                        {u.corporation?.name ?? '—'}
                                                    </td>
                                                )}
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {new Date(u.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <Link href={route('admin.users.edit', u.id)}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:bg-red-50"
                                                            onClick={() => deleteUser(u.id, u.name)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {users.links && users.links.length > 0 && (
                    <div className="flex items-center justify-center gap-1">
                        {users.links.map((link, idx) => (
                            <Link key={idx} href={link.url || '#'}>
                                <Button
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
