import { Head, Link, router } from '@inertiajs/react';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Users, Shield, Eye, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

interface Props {
    users: {
        data: User[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    stats: { total: number; admins: number; auditors: number; users: number };
    filters: { search?: string; role?: string };
}

const roleColors: Record<string, string> = {
    admin:   'bg-red-50 text-red-600 border-red-200',
    auditor: 'bg-blue-50 text-blue-600 border-blue-200',
    user:    'bg-gray-100 text-gray-600 border-gray-200',
};

export default function UsersIndex({ users, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [role, setRole]     = useState(filters.role ?? 'all');

    const applyFilters = (overrides: Record<string, string> = {}) => {
        router.get(route('admin.users.index'), {
            search,
            role: role === 'all' ? '' : role,
            ...overrides,
        }, { preserveState: true, replace: true });
    };

    const deleteUser = (id: number, name: string) => {
        if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
        router.delete(route('admin.users.destroy', id));
    };

    return (
        <AdminLayout>
            <Head title="Users & Roles" />

            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users & Roles</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage user accounts and role-based access control</p>
                    </div>
                    <Link href={route('admin.users.create')}>
                        <Button className="gap-2"><Plus className="w-4 h-4" /> Add User</Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Users', value: stats.total,    color: 'text-blue-500',  icon: Users },
                        { label: 'Admins',      value: stats.admins,   color: 'text-red-500',   icon: Shield },
                        { label: 'Auditors',    value: stats.auditors, color: 'text-blue-500',  icon: Eye },
                        { label: 'Users',       value: stats.users,    color: 'text-gray-500',  icon: Users },
                    ].map(({ label, value, color, icon: Icon }) => (
                        <Card key={label}>
                            <CardContent className="p-4 flex items-center gap-3">
                                <Icon className={`w-8 h-8 ${color}`} />
                                <div>
                                    <p className="text-2xl font-bold">{value}</p>
                                    <p className="text-xs text-gray-500">{label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-3">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search by name or email..."
                                    value={search}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                                    onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && applyFilters({ search })}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={role} onValueChange={(v: string) => { setRole(v); applyFilters({ role: v === 'all' ? '' : v }); }}>
                                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Role" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="auditor">Auditor</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={() => applyFilters({ search })}>Search</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">{users.total} user{users.total !== 1 ? 's' : ''}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 mt-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
                                    <tr>
                                        {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {users.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-12 text-center text-gray-400">No users found.</td>
                                        </tr>
                                    ) : users.data.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-300">
                                                            {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{user.email}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className={`capitalize ${roleColors[user.role]}`}>
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <Link href={route('admin.users.edit', user.id)}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="h-8 w-8 text-red-500 hover:bg-red-50"
                                                        onClick={() => deleteUser(user.id, user.name)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {users.links.length > 3 && (
                            <div className="flex items-center justify-center gap-1 p-4 border-t">
                                {users.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}