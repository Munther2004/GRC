import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface Permissions {
    is_super_admin: boolean;
    grantable_roles: string[];
    fixed_corporation_id: number | null;
}

interface Props extends SharedProps {
    roles: RoleObj[];
    corporations: Corporation[];
    permissions: Permissions;
}

export default function UserCreate() {
    const { roles, corporations, permissions } = usePage<Props>().props;

    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        role: string;
        corporation_id: string;
    }>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: roles[0]?.name ?? 'user',
        corporation_id: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.users.store'));
    };

    const showCorporationPicker =
        permissions.is_super_admin && data.role !== 'super_admin';

    return (
        <AdminLayout>
            <Head title="Add User" />

            <div className="mx-auto max-w-2xl space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('admin.users.index')}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-heading text-4xl font-normal" style={{ color: 'var(--foreground)' }}>
                            Add User
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Create a new user account
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Account Details
                            </CardTitle>
                            <CardDescription>
                                Basic information and login credentials
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="e.g. John Smith"
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500">{errors.name}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setData('email', e.target.value)
                                    }
                                    placeholder="e.g. john@company.com"
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500">{errors.email}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setData('password', e.target.value)
                                    }
                                    placeholder="Minimum 8 characters"
                                />
                                {errors.password && (
                                    <p className="text-xs text-red-500">{errors.password}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="password_confirmation">Confirm Password *</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setData('password_confirmation', e.target.value)
                                    }
                                    placeholder="Repeat password"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Role *</CardTitle>
                            <CardDescription>
                                {permissions.is_super_admin
                                    ? 'Choose any role; super_admin accounts are tenant-less.'
                                    : 'You can grant Auditor or User roles within your corporation.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Select
                                value={data.role}
                                onValueChange={(v: string) => setData('role', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {permissions.grantable_roles.map((r) => (
                                        <SelectItem key={r} value={r}>
                                            {ROLE_LABELS[r as keyof typeof ROLE_LABELS] ?? r}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-xs text-red-500">{errors.role}</p>
                            )}

                            {showCorporationPicker && (
                                <div className="space-y-1">
                                    <Label>Corporation</Label>
                                    <Select
                                        value={data.corporation_id}
                                        onValueChange={(v: string) => setData('corporation_id', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select corporation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {corporations.map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.corporation_id && (
                                        <p className="text-xs text-red-500">{errors.corporation_id}</p>
                                    )}
                                </div>
                            )}

                            {!permissions.is_super_admin && permissions.fixed_corporation_id && (
                                <p className="text-xs text-muted-foreground">
                                    User will be created inside your corporation.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Link href={route('admin.users.index')}>
                            <Button variant="outline">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing} className="gap-2">
                            <Save className="h-4 w-4" />
                            {processing ? 'Creating...' : 'Create User'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
