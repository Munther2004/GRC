import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Globe, Mail, Briefcase } from 'lucide-react';
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

interface Corporation {
    id: number;
    name: string;
    email: string;
    industry: string;
    website: string;
    description: string;
    created_at: string;
    manager: {
        id: number;
        name: string;
        email: string;
    };
    users: Array<{
        id: number;
        name: string;
        email: string;
    }>;
}

interface Props {
    corporation: Corporation;
}

export default function CompanyDetails({ corporation }: Props) {
    return (
        <AppLayout>
            <Head title="Company Details" />

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
                            Company Details
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Information about your organization
                        </p>
                    </div>
                </div>

                {/* Company Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">
                            {corporation.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Industry */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-xs font-medium text-muted-foreground uppercase">
                                        Industry
                                    </p>
                                </div>
                                <p className="text-lg font-medium capitalize">
                                    {corporation.industry}
                                </p>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-xs font-medium text-muted-foreground uppercase">
                                        Email
                                    </p>
                                </div>
                                <a
                                    href={`mailto:${corporation.email}`}
                                    className="text-lg font-medium text-primary hover:underline"
                                >
                                    {corporation.email}
                                </a>
                            </div>

                            {/* Website */}
                            {corporation.website && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-xs font-medium text-muted-foreground uppercase">
                                            Website
                                        </p>
                                    </div>
                                    <a
                                        href={corporation.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-lg font-medium text-primary hover:underline"
                                    >
                                        {corporation.website}
                                    </a>
                                </div>
                            )}

                            {/* Created Date */}
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase">
                                    Registration Date
                                </p>
                                <p className="text-lg font-medium">
                                    {new Date(
                                        corporation.created_at,
                                    ).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        {corporation.description && (
                            <div className="border-t border-border pt-6">
                                <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
                                    About Your Company
                                </p>
                                <p className="text-sm leading-relaxed text-foreground">
                                    {corporation.description}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Manager Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Account Manager
                        </CardTitle>
                        <CardDescription>
                            Primary manager for this corporation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between rounded border border-border p-4">
                            <div>
                                <p className="font-medium">
                                    {corporation.manager.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {corporation.manager.email}
                                </p>
                            </div>
                            <Badge className="bg-amber-900/30 text-amber-400 border border-amber-200">
                                Manager
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Team Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Team Overview
                        </CardTitle>
                        <CardDescription>
                            Your organization's team members
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="rounded bg-slate-900/30 border border-slate-700 p-4">
                                <p className="text-2xl font-medium">
                                    {corporation.users.length}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Total Members
                                </p>
                            </div>
                            <Link href={route('corporate.team')}>
                                <Button className="w-full">
                                    View Team Members
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
