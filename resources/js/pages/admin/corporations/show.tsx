import { Head, Link, router, useForm } from '@inertiajs/react';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Copy,
    RefreshCw,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface CorporationRegistration {
    id: number;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    message: string;
    status: string;
    admin_notes: string;
}

interface Corporation {
    id: number;
    name: string;
    email: string;
    industry: string;
    website: string;
    description: string;
    registration_code: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    approved_at: string;
    users: User[];
    registrations: CorporationRegistration[];
}

interface Props {
    corporation: Corporation;
    managerCredentials?: {
        username: string;
        passwordGenerated: boolean;
    };
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-950 text-yellow-400 border-yellow-200',
    approved: 'bg-green-950 text-green-400 border-green-200',
    rejected: 'bg-red-950 text-red-400 border-red-200',
};

export default function CorporationShow({ corporation, managerCredentials }: Props) {
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedUsername, setCopiedUsername] = useState(false);
    const { data: rejectData, setData: setRejectData, post: postReject } =
        useForm({
            reason: '',
        });

    const copyCode = () => {
        navigator.clipboard.writeText(corporation.registration_code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const copyUsername = () => {
        if (managerCredentials?.username) {
            navigator.clipboard.writeText(managerCredentials.username);
            setCopiedUsername(true);
            setTimeout(() => setCopiedUsername(false), 2000);
        }
    };

    const handleApprove = () => {
        router.post(route('admin.corporations.approve', corporation.id));
    };

    const handleReject = () => {
        postReject(route('admin.corporations.reject', corporation.id));
    };

    const handleRegenerate = () => {
        if (
            !confirm(
                'Regenerate the registration code? The old code will no longer work.',
            )
        )
            return;
        router.post(
            route('admin.corporations.regenerate-code', corporation.id),
        );
    };

    return (
        <AdminLayout>
            <Head title={`Corporation — ${corporation.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href={route('admin.corporations.index')}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1
                            className="font-heading text-4xl font-normal"
                            style={{ color: '#E0F5EC' }}
                        >
                            {corporation.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {corporation.email}
                        </p>
                    </div>
                    <div className="ml-auto">
                        <Badge
                            variant="outline"
                            className={`capitalize flex w-fit items-center gap-2 ${statusColors[corporation.status]}`}
                        >
                            {corporation.status === 'pending' && (
                                <Clock className="h-4 w-4" />
                            )}
                            {corporation.status === 'approved' && (
                                <CheckCircle2 className="h-4 w-4" />
                            )}
                            {corporation.status === 'rejected' && (
                                <XCircle className="h-4 w-4" />
                            )}
                            {corporation.status}
                        </Badge>
                    </div>
                </div>

                {/* Main Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Corporation Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                                Industry
                            </p>
                            <p className="capitalize">{corporation.industry}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                                Email
                            </p>
                            <p>{corporation.email}</p>
                        </div>
                        {corporation.website && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase">
                                    Website
                                </p>
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
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                                Created
                            </p>
                            <p>
                                {new Date(
                                    corporation.created_at,
                                ).toLocaleDateString()}
                            </p>
                        </div>
                        {corporation.description && (
                            <div className="col-span-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase">
                                    Description
                                </p>
                                <p className="text-sm">
                                    {corporation.description}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Registration Code */}
                {corporation.status === 'approved' && (
                    <Card className="border-green-200">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Registration Code
                            </CardTitle>
                            <CardDescription>
                                Exclusive code for manager sign-up
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <code className="flex-1 rounded bg-muted p-3 font-mono text-lg font-bold tracking-widest text-foreground">
                                    {corporation.registration_code}
                                </code>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={copyCode}
                                    title="Copy code"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                            {copiedCode && (
                                <p className="text-xs text-green-600">
                                    Code copied to clipboard!
                                </p>
                            )}
                            <Button
                                variant="outline"
                                onClick={handleRegenerate}
                                className="w-full gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Regenerate Code
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Manager Credentials */}
                {corporation.status === 'approved' && managerCredentials?.username && (
                    <Card className="border-blue-200">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Manager Credentials
                            </CardTitle>
                            <CardDescription>
                                Login credentials for corporation manager
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                                        Manager Username
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 rounded bg-muted p-3 font-mono text-foreground">
                                            {managerCredentials.username}
                                        </code>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={copyUsername}
                                            title="Copy username"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {copiedUsername && (
                                        <p className="text-xs text-green-600 mt-1">
                                            Username copied to clipboard!
                                        </p>
                                    )}
                                </div>
                                <div className="rounded bg-amber-950/30 border border-amber-200 p-3">
                                    <p className="text-xs font-medium text-amber-700">
                                        ⚠️ Password Note
                                    </p>
                                    <p className="text-xs text-amber-600 mt-1">
                                        Password was generated and sent via email to {corporation.email}. Passwords cannot be retrieved after sending, but can be reset by the manager.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Users */}
                {corporation.users && corporation.users.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Team Members ({corporation.users.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {corporation.users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between rounded border border-border p-3"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {user.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Registrations */}
                {corporation.registrations &&
                    corporation.registrations.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Registration Requests
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {corporation.registrations.map(
                                    (registration) => (
                                        <div
                                            key={registration.id}
                                            className="rounded border border-border p-4"
                                        >
                                            <p className="font-medium">
                                                {registration.contact_name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {registration.contact_email}
                                            </p>
                                            {registration.contact_phone && (
                                                <p className="text-sm text-muted-foreground">
                                                    {
                                                        registration.contact_phone
                                                    }
                                                </p>
                                            )}
                                            {registration.message && (
                                                <p className="mt-2 text-sm">
                                                    {registration.message}
                                                </p>
                                            )}
                                        </div>
                                    ),
                                )}
                            </CardContent>
                        </Card>
                    )}

                {/* Actions */}
                {corporation.status === 'pending' && (
                    <Card className="border-yellow-200">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Review Registration
                            </CardTitle>
                            <CardDescription>
                                Approve or reject this corporation registration
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleApprove}
                                    className="flex-1 gap-2"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Approve
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            className="flex-1 gap-2"
                                        >
                                            <XCircle className="h-4 w-4" />
                                            Reject
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogTitle>
                                            Reject Registration
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            <div className="space-y-4">
                                                <p>
                                                    Are you sure you want to
                                                    reject this registration?
                                                </p>
                                                <div className="space-y-2">
                                                    <Label htmlFor="reason">
                                                        Reason (optional)
                                                    </Label>
                                                    <Textarea
                                                        id="reason"
                                                        value={rejectData.reason}
                                                        onChange={(
                                                            e: React.ChangeEvent<HTMLTextAreaElement>,
                                                        ) =>
                                                            setRejectData(
                                                                'reason',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Why are you rejecting this registration?"
                                                    />
                                                </div>
                                            </div>
                                        </AlertDialogDescription>
                                        <div className="flex gap-3 justify-end">
                                            <AlertDialogCancel>
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleReject}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                Reject
                                            </AlertDialogAction>
                                        </div>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}
