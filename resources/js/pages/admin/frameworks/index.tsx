import { Head, Link, router } from '@inertiajs/react';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { StatStrip } from '@/components/ui/stat-strip';
import {
    Shield,
    Pencil,
    ToggleLeft,
    ToggleRight,
    BookOpen,
} from 'lucide-react';

interface Framework {
    id: number;
    name: string;
    short_name: string;
    description: string | null;
    version: string | null;
    is_active: boolean;
    controls_count: number;
}

interface Props {
    frameworks: Framework[];
}

export default function FrameworksIndex({ frameworks }: Props) {
    const total = frameworks.length;
    const active = frameworks.filter((f) => f.is_active).length;

    const toggle = (framework: Framework) => {
        const action = framework.is_active ? 'deactivate' : 'activate';
        if (
            !confirm(
                `${action.charAt(0).toUpperCase() + action.slice(1)} "${framework.name}"?`,
            )
        )
            return;
        router.post(route('admin.frameworks.toggle', framework.id));
    };

    return (
        <AdminLayout>
            <Head title="Frameworks" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="font-heading text-4xl font-normal" style={{ color: '#E8DFD4' }}>
                        Frameworks
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage compliance frameworks and their associated
                        controls
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {[
                        {
                            label: 'Total Frameworks',
                            value: total,
                            color: 'text-primary',
                            icon: Shield,
                        },
                        {
                            label: 'Active',
                            value: active,
                            color: 'text-green-500',
                            icon: ToggleRight,
                        },
                        {
                            label: 'Inactive',
                            value: total - active,
                            color: 'text-muted-foreground',
                            icon: ToggleLeft,
                        },
                    ].map(({ label, value, color, icon: Icon }) => (
                        <Card key={label}>
                            <CardContent className="flex items-center gap-3 p-4">
                                <Icon className={`h-8 w-8 ${color}`} />
                                <div>
                                    <p className="text-2xl font-bold">
                                        {value}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {label}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Table */}
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">
                            {total} framework{total !== 1 ? 's' : ''}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="mt-4 p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-y border-border bg-muted/30">
                                    <tr>
                                        {[
                                            'Framework',
                                            'Version',
                                            'Controls',
                                            'Status',
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
                                    {frameworks.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-4 py-12 text-center text-muted-foreground"
                                            >
                                                No frameworks found.
                                            </td>
                                        </tr>
                                    ) : (
                                        frameworks.map((framework) => (
                                            <tr
                                                key={framework.id}
                                                className="transition-colors hover:bg-accent/30"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 dark:bg-primary/20">
                                                            <span className="text-xs font-bold text-primary dark:text-primary">
                                                                {framework.short_name.substring(
                                                                    0,
                                                                    4,
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-foreground">
                                                                {framework.name}
                                                            </p>
                                                            {framework.description && (
                                                                <p className="max-w-xs truncate text-xs text-muted-foreground">
                                                                    {
                                                                        framework.description
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {framework.version ?? (
                                                        <span className="text-gray-300">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5 text-foreground/80">
                                                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                                                        {
                                                            framework.controls_count
                                                        }
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            framework.is_active
                                                                ? 'border-primary/50 bg-primary/10 text-primary'
                                                                : 'border-border bg-muted text-muted-foreground'
                                                        }
                                                    >
                                                        {framework.is_active
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <Link
                                                            href={route(
                                                                'admin.frameworks.edit',
                                                                framework.id,
                                                            )}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className={`h-8 w-8 ${framework.is_active ? 'text-destructive hover:bg-destructive/10' : 'text-primary hover:bg-primary/10'}`}
                                                            onClick={() =>
                                                                toggle(
                                                                    framework,
                                                                )
                                                            }
                                                            title={
                                                                framework.is_active
                                                                    ? 'Deactivate'
                                                                    : 'Activate'
                                                            }
                                                        >
                                                            {framework.is_active ? (
                                                                <ToggleRight className="h-4 w-4" />
                                                            ) : (
                                                                <ToggleLeft className="h-4 w-4" />
                                                            )}
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
            </div>
        </AdminLayout>
    );
}
