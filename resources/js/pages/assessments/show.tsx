import { Head, Link, router, usePage } from '@inertiajs/react';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, PlayCircle, CheckCircle, XCircle, MinusCircle, AlertTriangle, Download } from 'lucide-react';

interface Assessment {
    id: number; title: string; status: string; compliance_percentage: number;
    period: string; scope: string; description: string | null;
    due_date: string | null; created_at: string;
    user: { name: string };
    framework: { name: string; short_name: string };
}

interface Item {
    id: number;
    compliance_status: string;
    comments: string | null;
    control: { control_id: string; title: string; category: string };
}

interface Props {
    assessment: Assessment;
    breakdown: { compliant: number; partially_compliant: number; non_compliant: number; not_applicable: number };
    byCategory: Record<string, { total: number; compliant: number; percentage: number }>;
    items: Item[];
}

const complianceColor = (pct: number) => {
    if (pct >= 80) return 'text-green-600';
    if (pct >= 50) return 'text-yellow-600';
    return 'text-red-500';
};

const complianceBg = (pct: number) => {
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
};

export default function AssessmentShow({ assessment, breakdown, byCategory, items }: Props) {
    const { auth } = usePage().props as any;
    const canEdit  = auth.user.role === 'admin' || auth.user.role === 'user';

    const total = breakdown.compliant + breakdown.partially_compliant + breakdown.non_compliant + breakdown.not_applicable;
    const nonCompliantItems = items.filter(i => i.compliance_status === 'non_compliant' || i.compliance_status === 'partially_compliant');

    return (
        <AdminLayout>
            <Head title={assessment.title} />

            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <Link href={route('assessments.index')}>
                            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{assessment.title}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{assessment.framework.short_name}</Badge>
                                <span className="text-sm text-gray-500">{assessment.period}</span>
                                <span className="text-sm text-gray-400">by {assessment.user?.name}</span>
                            </div>
                        </div>
                    </div>
                    {canEdit && assessment.status !== 'completed' && (
                        <Link href={route('assessments.questionnaire', assessment.id)}>
                            <Button className="gap-2">
                                <PlayCircle className="w-4 h-4" /> Continue Questionnaire
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-6">

                    {/* Left — main content */}
                    <div className="col-span-2 space-y-6">

                        {/* Compliance Score */}
                        <Card>
                            <CardHeader><CardTitle className="text-base">Compliance Score</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex items-end gap-4 mb-4">
                                    <span className={`text-6xl font-bold ${complianceColor(assessment.compliance_percentage)}`}>
                                        {assessment.compliance_percentage}%
                                    </span>
                                    <div className="mb-2">
                                        <p className="text-sm text-gray-500">{assessment.framework.name}</p>
                                        <p className="text-xs text-gray-400">{total} controls assessed</p>
                                    </div>
                                </div>
                                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${complianceBg(assessment.compliance_percentage)}`}
                                        style={{ width: `${assessment.compliance_percentage}%` }}
                                    />
                                </div>

                                {/* Breakdown */}
                                <div className="grid grid-cols-4 gap-3 mt-4">
                                    {[
                                        { label: 'Compliant',   value: breakdown.compliant,           icon: CheckCircle, color: 'text-green-500' },
                                        { label: 'Partial',     value: breakdown.partially_compliant, icon: AlertTriangle, color: 'text-yellow-500' },
                                        { label: 'Non-Compliant', value: breakdown.non_compliant,     icon: XCircle, color: 'text-red-500' },
                                        { label: 'N/A',         value: breakdown.not_applicable,      icon: MinusCircle, color: 'text-gray-400' },
                                    ].map(({ label, value, icon: Icon, color }) => (
                                        <div key={label} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
                                            <p className="text-xl font-bold">{value}</p>
                                            <p className="text-xs text-gray-500">{label}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* By Category */}
                        <Card>
                            <CardHeader><CardTitle className="text-base">Compliance by Category</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                {Object.entries(byCategory).map(([category, data]) => (
                                    <div key={category}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="font-medium">{category}</span>
                                            <span className={`font-semibold ${complianceColor(data.percentage)}`}>
                                                {data.percentage}% <span className="text-gray-400 font-normal">({data.compliant}/{data.total})</span>
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${complianceBg(data.percentage)}`}
                                                style={{ width: `${data.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Gap Analysis — Non-Compliant Controls */}
                        {nonCompliantItems.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base text-red-600">
                                        Gap Analysis — {nonCompliantItems.length} controls require attention
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {nonCompliantItems.map(item => (
                                        <div key={item.id} className={`p-3 rounded-lg border text-sm ${
                                            item.compliance_status === 'non_compliant'
                                                ? 'border-red-200 bg-red-50 dark:bg-red-950'
                                                : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950'
                                        }`}>
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <span className="font-mono text-xs bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded mr-2">
                                                        {item.control.control_id}
                                                    </span>
                                                    <span className="font-medium">{item.control.title}</span>
                                                    {item.comments && (
                                                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{item.comments}</p>
                                                    )}
                                                </div>
                                                <Badge variant="outline" className={`text-xs flex-shrink-0 ${
                                                    item.compliance_status === 'non_compliant'
                                                        ? 'bg-red-50 text-red-600 border-red-200'
                                                        : 'bg-yellow-50 text-yellow-600 border-yellow-200'
                                                }`}>
                                                    {item.compliance_status === 'non_compliant' ? 'Non-Compliant' : 'Partial'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right column */}
                    <div className="space-y-4">
                        <Card>
                            <CardContent className="p-4 space-y-3">
                                <div>
                                    <p className="text-xs text-gray-400">Status</p>
                                    <Badge variant="outline" className="capitalize mt-1">
                                        {assessment.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Framework</p>
                                    <p className="text-sm font-medium">{assessment.framework.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Period</p>
                                    <p className="text-sm font-medium">{assessment.period}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Scope</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{assessment.scope}</p>
                                </div>
                                {assessment.due_date && (
                                    <div>
                                        <p className="text-xs text-gray-400">Due Date</p>
                                        <p className="text-sm font-medium">{new Date(assessment.due_date).toLocaleDateString()}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-gray-400">Created</p>
                                    <p className="text-sm">{new Date(assessment.created_at).toLocaleDateString()}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {assessment.status === 'completed' && (
                            <Card>
                                <CardContent className="p-4">
                                    <a href={route('assessments.export-pdf', assessment.id)} target="_blank">
                                        <Button variant="outline" className="w-full gap-2">
                                            <Download className="w-4 h-4" /> Export PDF Report
                                        </Button>
                                    </a>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}