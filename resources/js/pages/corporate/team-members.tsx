import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Users, Mail, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { route } from '@/lib/routes';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

interface Corporation {
    id: number;
    name: string;
}

interface Props {
    corporation: Corporation;
    users: User[];
    stats: {
        total_users: number;
        admins: number;
        auditors: number;
        users: number;
    };
}

const roleColors: Record<string, string> = {
    super_admin: 'bg-red-900/30 text-red-400 border-red-200',
    admin: 'bg-amber-900/30 text-amber-400 border-amber-200',
    auditor: 'bg-blue-900/30 text-blue-400 border-blue-200',
    user: 'bg-slate-900/30 text-slate-400 border-slate-700',
};

const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    auditor: 'Auditor',
    user: 'User',
};

export default function TeamMembers({ users, stats }: Props) {
    return (
        <AppLayout>
            <Head title="Team Members" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href={route('corporate.dashboard')}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-heading text-3xl font-normal">
                            Team Members
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your organization's team
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg bg-slate-900/30 p-3">
                                    <Users className="h-6 w-6 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {stats.total_users}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Total Members
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg bg-amber-900/30 p-3">
                                    <Users className="h-6 w-6 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {stats.admins}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Admins
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg bg-blue-900/30 p-3">
                                    <Users className="h-6 w-6 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {stats.users}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Users
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Team Members List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            All Members
                        </CardTitle>
                        <CardDescription>
                            Complete list of your organization's team members
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {users.length > 0 ? (
                            <div className="space-y-3">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between rounded border border-border p-4 hover:bg-muted/50 transition"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">
                                                {user.name}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                                <div className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {user.email}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(
                                                        user.created_at,
                                                    ).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`capitalize ml-4 ${roleColors[user.role] || 'bg-slate-900/30 text-slate-400 border-slate-700'}`}
                                        >
                                            {roleLabels[user.role] ||
                                                user.role}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded border border-border bg-muted/50 p-8 text-center">
                                <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                                <p className="text-muted-foreground">
                                    No team members yet
                                </p>
                                <p className="text-sm text-muted-foreground/70 mt-1">
                                    Team members will appear here when they join
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Links */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Link href={route('corporate.dashboard')} className="flex-1">
                                <Button variant="outline" className="w-full">
                                    Back to Dashboard
                                </Button>
                            </Link>
                            <Link href={route('corporate.company-details')} className="flex-1">
                                <Button variant="outline" className="w-full">
                                    Company Details
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
