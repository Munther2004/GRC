import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Risk = {
    id: number;
    title: string;
    category: string;
    owner: string;
    likelihood: number;
    impact: number;
    risk_level: string;
    risk_score: number;
    status: string;
};

type Props = {
    risks?: Risk[];
};

function getRiskLevelBadge(level: string) {
    switch (level) {
        case 'critical':
            return (
                <Badge variant="destructive" className="text-xs">
                    Critical
                </Badge>
            );
        case 'high':
            return (
                <Badge className="bg-amber-500/20 text-xs text-amber-500 hover:bg-amber-500/30">
                    High
                </Badge>
            );
        case 'medium':
            return (
                <Badge className="bg-yellow-500/20 text-xs text-yellow-500 hover:bg-yellow-500/30">
                    Medium
                </Badge>
            );
        default:
            return (
                <Badge variant="secondary" className="text-xs">
                    Low
                </Badge>
            );
    }
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'open':
            return (
                <Badge
                    variant="outline"
                    className="border-red-500/50 text-xs text-red-400"
                >
                    Open
                </Badge>
            );
        case 'in_progress':
            return (
                <Badge
                    variant="outline"
                    className="border-blue-500/50 text-xs text-blue-400"
                >
                    In Progress
                </Badge>
            );
        case 'under_review':
            return (
                <Badge
                    variant="outline"
                    className="border-amber-500/50 text-xs text-amber-400"
                >
                    Under Review
                </Badge>
            );
        case 'closed':
            return (
                <Badge
                    variant="outline"
                    className="border-green-500/50 text-xs text-green-400"
                >
                    Closed
                </Badge>
            );
        default:
            return (
                <Badge variant="outline" className="text-xs">
                    {status}
                </Badge>
            );
    }
}

export function TopRisks({ risks = [] }: Props) {
    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-medium">
                            Top Risks
                        </CardTitle>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Ranked by ISO/IEC 27005 likelihood × impact score
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                        asChild
                    >
                        <Link href="/risks">
                            View all
                            <ArrowUpRight className="ml-1 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {risks.length === 0 ? (
                    <div className="py-12 text-center">
                        <p className="text-sm text-muted-foreground">
                            No risks recorded yet
                        </p>
                        <Link href="/risks/create">
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-3"
                            >
                                Add First Risk
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Risk
                                    </th>
                                    <th className="hidden px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase md:table-cell">
                                        Category
                                    </th>
                                    <th className="hidden px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase lg:table-cell">
                                        Owner
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Score
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Level
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {risks.map((risk) => (
                                    <tr
                                        key={risk.id}
                                        className="transition-colors hover:bg-muted/50"
                                    >
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-sm text-muted-foreground">
                                                RSK-
                                                {String(risk.id).padStart(
                                                    3,
                                                    '0',
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-medium">
                                                {risk.title}
                                            </span>
                                        </td>
                                        <td className="hidden px-4 py-3 md:table-cell">
                                            <span className="text-sm text-muted-foreground">
                                                {risk.category ?? '—'}
                                            </span>
                                        </td>
                                        <td className="hidden px-4 py-3 lg:table-cell">
                                            <span className="text-sm text-muted-foreground">
                                                {risk.owner ?? '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-semibold tabular-nums">
                                                {risk.risk_score}
                                                <span className="text-xs font-normal text-muted-foreground">
                                                    /25
                                                </span>
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {getRiskLevelBadge(risk.risk_level)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStatusBadge(risk.status)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                asChild
                                            >
                                                <Link
                                                    href={`/risks/${risk.id}`}
                                                >
                                                    <ArrowUpRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
