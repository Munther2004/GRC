import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { SharedProps } from '@/types';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';

// Inner component — only renders when user exists
function EditForm({ user }: { user: any }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        role: user.role,
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.users.update', user.id));
    };

    return (
        <>
            <Head title={`Edit — ${user.name}`} />
            <div className="mx-auto max-w-2xl space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('admin.users.index')}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Edit User
                        </h1>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Account Details
                            </CardTitle>
                            <CardDescription>
                                Leave password blank to keep unchanged
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                    ) => setData('name', e.target.value)}
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                    ) => setData('email', e.target.value)}
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label>Role *</Label>
                                <Select
                                    value={data.role}
                                    onValueChange={(v: string) =>
                                        setData('role', v)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">
                                            User — Complete assessments, manage
                                            risks
                                        </SelectItem>
                                        <SelectItem value="auditor">
                                            Auditor — Read-only access to all
                                            data
                                        </SelectItem>
                                        <SelectItem value="admin">
                                            Admin — Full system access
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.role && (
                                    <p className="text-xs text-red-500">
                                        {errors.role}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                    ) => setData('password', e.target.value)}
                                    placeholder="Leave blank to keep current password"
                                />
                                {errors.password && (
                                    <p className="text-xs text-red-500">
                                        {errors.password}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="password_confirmation">
                                    Confirm New Password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                    ) =>
                                        setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Repeat new password"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Link href={route('admin.users.index')}>
                            <Button variant="outline">Cancel</Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="gap-2"
                        >
                            <Save className="h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

// Outer component — handles the guard safely
export default function UserEdit() {
    const { user } = usePage<
        SharedProps & { user: Record<string, unknown> | null }
    >().props;

    return (
        <AdminLayout>
            {user ? (
                <EditForm user={user} />
            ) : (
                <div className="flex h-64 items-center justify-center">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            )}
        </AdminLayout>
    );
}
