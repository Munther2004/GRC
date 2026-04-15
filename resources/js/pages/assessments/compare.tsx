import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, ArrowRight, GitCompare } from 'lucide-react';
import { useState, useMemo } from 'react';

interface Assessment {
    id: number;
    title: string;
    framework_id: number;
    framework: string;
    framework_name: string;
    status: string;
    compliance_percentage: number;
    created_at: string;
}

interface Props {
    assessments: Assessment[];
}

const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-950 text-blue-400',
    completed: 'bg-green-50 text-green-700',
};

export default function AssessmentCompare({ assessments }: Props) {
    const [selectedA, setSelectedA] = useState<string>('');
    const [selectedB, setSelectedB] = useState<string>('');

    // Group assessments by framework for the dropdowns
    const grouped = useMemo(() => {
        const map: Record<string, Assessment[]> = {};
        for (const a of assessments) {
            if (!map[a.framework]) map[a.framework] = [];
            map[a.framework].push(a);
        }
        return map;
    }, [assessments]);

    // Assessment B excludes whatever is selected as A
    const groupedB = useMemo(() => {
        const map: Record<string, Assessment[]> = {};
        for (const a of assessments) {
            if (String(a.id) === selectedA) continue;
            if (!map[a.framework]) map[a.framework] = [];
            map[a.framework].push(a);
        }
        return map;
    }, [assessments, selectedA]);

    const assessmentAObj =
        assessments.find((a) => String(a.id) === selectedA) ?? null;
    const assessmentBObj =
        assessments.find((a) => String(a.id) === selectedB) ?? null;

    const canCompare = selectedA && selectedB && selectedA !== selectedB;

    const compareHref = canCompare
        ? `/assessments/compare/result?assessment_a_id=${selectedA}&assessment_b_id=${selectedB}`
        : '#';

    const handleCompare = () => {
        if (!canCompare) return;
        router.get('/assessments/compare/result', {
            assessment_a_id: selectedA,
            assessment_b_id: selectedB,
        });
    };

    return (
        <AdminLayout>
            <Head title="Assessment Comparison" />

            <div className="max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/assessments">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-gray-500"
                        >
                            <ArrowLeft className="h-4 w-4" /> Assessments
                        </Button>
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <GitCompare className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Assessment Comparison
                        </h1>
                        <p className="text-sm text-gray-500">
                            Select two assessments to compare side by side
                        </p>
                    </div>
                </div>

                {/* Selector card */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                            Choose Assessments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[1fr_auto_1fr]">
                            {/* Assessment A */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                                    Assessment A — Baseline
                                </label>
                                <Select
                                    value={selectedA}
                                    onValueChange={(v) => {
                                        setSelectedA(v);
                                        if (v === selectedB) setSelectedB('');
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select baseline assessment…" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(grouped).map(
                                            ([fw, items]) => (
                                                <SelectGroup key={fw}>
                                                    <SelectLabel>
                                                        {fw}
                                                    </SelectLabel>
                                                    {items.map((a) => (
                                                        <SelectItem
                                                            key={a.id}
                                                            value={String(a.id)}
                                                        >
                                                            {a.title}
                                                            <span className="ml-1.5 text-xs text-gray-400">
                                                                — {a.created_at}
                                                            </span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>

                                {/* Preview card */}
                                {assessmentAObj && (
                                    <div className="space-y-1.5 rounded-lg border bg-accent/30 p-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="truncate text-sm font-medium">
                                                {assessmentAObj.title}
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className="shrink-0 text-xs"
                                            >
                                                {assessmentAObj.framework}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span
                                                className={`rounded px-1.5 py-0.5 text-xs font-medium ${statusColors[assessmentAObj.status] ?? ''}`}
                                            >
                                                {assessmentAObj.status.replace(
                                                    '_',
                                                    ' ',
                                                )}
                                            </span>
                                            <span>&middot;</span>
                                            <span>
                                                {
                                                    assessmentAObj.compliance_percentage
                                                }
                                                % compliance
                                            </span>
                                            <span>&middot;</span>
                                            <span>
                                                {assessmentAObj.created_at}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* vs divider */}
                            <div className="flex items-center justify-center pt-7">
                                <div className="flex flex-col items-center gap-1">
                                    <ArrowRight className="h-5 w-5 text-gray-400" />
                                    <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                                        vs
                                    </span>
                                </div>
                            </div>

                            {/* Assessment B */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                                    Assessment B — Latest
                                </label>
                                <Select
                                    value={selectedB}
                                    onValueChange={setSelectedB}
                                    disabled={!selectedA}
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                selectedA
                                                    ? 'Select latest assessment…'
                                                    : 'Select A first'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(groupedB).map(
                                            ([fw, items]) => (
                                                <SelectGroup key={fw}>
                                                    <SelectLabel>
                                                        {fw}
                                                    </SelectLabel>
                                                    {items.map((a) => (
                                                        <SelectItem
                                                            key={a.id}
                                                            value={String(a.id)}
                                                        >
                                                            {a.title}
                                                            <span className="ml-1.5 text-xs text-gray-400">
                                                                — {a.created_at}
                                                            </span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>

                                {/* Preview card */}
                                {assessmentBObj && (
                                    <div className="space-y-1.5 rounded-lg border bg-accent/30 p-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="truncate text-sm font-medium">
                                                {assessmentBObj.title}
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className="shrink-0 text-xs"
                                            >
                                                {assessmentBObj.framework}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span
                                                className={`rounded px-1.5 py-0.5 text-xs font-medium ${statusColors[assessmentBObj.status] ?? ''}`}
                                            >
                                                {assessmentBObj.status.replace(
                                                    '_',
                                                    ' ',
                                                )}
                                            </span>
                                            <span>&middot;</span>
                                            <span>
                                                {
                                                    assessmentBObj.compliance_percentage
                                                }
                                                % compliance
                                            </span>
                                            <span>&middot;</span>
                                            <span>
                                                {assessmentBObj.created_at}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Compare button */}
                        <div className="mt-6 flex justify-end">
                            <Button
                                className="min-w-[160px] gap-2"
                                disabled={!canCompare}
                                onClick={handleCompare}
                            >
                                <GitCompare className="h-4 w-4" />
                                Compare Assessments
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Empty state hint */}
                {assessments.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center text-gray-400">
                            No assessments found.{' '}
                            <Link
                                href="/assessments/create"
                                className="text-blue-500 hover:underline"
                            >
                                Create one
                            </Link>{' '}
                            to get started.
                        </CardContent>
                    </Card>
                )}

                {assessments.length === 1 && (
                    <Card>
                        <CardContent className="py-8 text-center text-sm text-gray-400">
                            You need at least two assessments to compare. Create
                            another assessment to use this feature.
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}
