import { Head, Link } from '@inertiajs/react';
import {
    Building2,
    Users,
    CheckCircle2,
    AlertCircle,
    BarChart3,
    Copy,
    Share2,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { route } from '@/lib/routes';

interface Corporation {
    id: number;
    name: string;
    email: string;
    industry: string;
    website: string;
    status: string;
    registration_code: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Stats {
    total_users: number;
    pending_approvals: number;
    total_assessments: number;
}

interface Props {
    corporation: Corporation;
    stats: Stats;
    users: User[];
}

export default function CorporateDashboard({ corporation, stats, users }: Props) {
    const [copied, setCopied] = useState(false);

    const copyCode = () => {
        navigator.clipboard.writeText(corporation.registration_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const signupLink = `${window.location.origin}/register?corporation_code=${corporation.registration_code}`;

    const copyLink = () => {
        navigator.clipboard.writeText(signupLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AppLayout>
            <Head title={`Corporate Dashboard: ${corporation.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="font-heading text-4xl font-normal text-foreground">
                        {corporation.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Organisation Dashboard & Team Management
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {[
                        { label: 'Team Members',    value: stats.total_users,        icon: Users,       color: 'text-blue-500' },
                        { label: 'Pending Actions', value: stats.pending_approvals,  icon: AlertCircle, color: 'text-yellow-500' },
                        { label: 'Assessments',     value: stats.total_assessments,  icon: BarChart3,   color: 'text-green-500' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <Card key={label}>
                            <CardContent className="flex items-center gap-3 p-4">
                                <Icon className={`h-8 w-8 ${color}`} />
                                <div>
                                    <p className="text-2xl font-medium">{value}</p>
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Registration Code — most prominent section */}
                <Card style={{ border: '1px solid rgba(176,228,204,0.4)', background: 'rgba(176,228,204,0.04)' }}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Share2 className="h-4 w-4 text-chart-1" />
                            Employee Registration Code
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Share this code with your team. Employees enter it when signing up at{' '}
                            <code className="text-xs">/register</code> to be linked to {corporation.name}.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Code display */}
                        <div className="flex items-center gap-2">
                            <code
                                className="flex-1 rounded p-3 font-mono text-xl font-medium tracking-widest"
                                style={{ background: 'rgba(var(--color-chart-1) / 0.08)', color: 'var(--chart-1)', border: '1px solid rgba(var(--color-chart-1) / 0.3)' }}
                            >
                                {corporation.registration_code}
                            </code>
                            <Button variant="outline" size="icon" onClick={copyCode} title="Copy code">
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Direct signup link */}
                        <div>
                            <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Or share the direct signup link</p>
                            <div className="flex items-center gap-2">
                                <code
                                    className="flex-1 rounded p-2.5 font-mono text-xs break-all"
                                    style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
                                >
                                    {signupLink}
                                </code>
                                <Button variant="outline" size="icon" onClick={copyLink} title="Copy link">
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {copied && (
                            <p className="text-xs text-chart-1">Copied to clipboard!</p>
                        )}
                    </CardContent>
                </Card>

                {/* Organisation Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Organisation Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase">Email</p>
                                <p>{corporation.email}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase">Industry</p>
                                <p className="capitalize">{corporation.industry}</p>
                            </div>
                            {corporation.website && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase">Website</p>
                                    <a
                                        href={corporation.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        {corporation.website}
                                    </a>
                                </div>
                            )}
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase">Status</p>
                                <Badge variant="outline" className="bg-green-950 text-green-400 border-green-200 capitalize">
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    {corporation.status}
                                </Badge>
                            </div>
                        </div>
                        <div className="border-t border-border pt-4">
                            <Link href={route('corporate.company-details')}>
                                <Button variant="outline" className="w-full gap-2">
                                    <Building2 className="h-4 w-4" />
                                    View Full Company Details
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Team Members */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Team Members ({users.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {users.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No team members yet. Share the registration code above to invite your team.
                            </p>
                        ) : (
                            <>
                                <div className="space-y-3 mb-4">
                                    {users.slice(0, 3).map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between rounded border border-border p-3"
                                        >
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {users.length > 3 && (
                                    <p className="text-xs text-muted-foreground mb-3">
                                        +{users.length - 3} more member(s)
                                    </p>
                                )}
                                <div className="grid gap-2">
                                    <Link href={route('corporate.team')}>
                                        <Button className="w-full gap-2">
                                            <Users className="h-4 w-4" />
                                            View All Team Members
                                        </Button>
                                    </Link>
                                    <Link href={route('admin.invites.index')}>
                                        <Button variant="outline" className="w-full gap-2">
                                            <Users className="h-4 w-4" />
                                            Invite Employees
                                        </Button>
                                    </Link>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
