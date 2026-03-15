import { Head, Link, useForm } from '@inertiajs/react';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';


interface Risk {
    id: number; title: string; description: string; category: string;
    owner: string; likelihood: number; impact: number; status: string;
    treatment: string; treatment_plan: string | null; due_date: string | null;
}
interface Props {
    risk: Risk;
    categories: string[];
    statuses:   { value: string; label: string }[];
    treatments: { value: string; label: string }[];
}

const levelFromScore = (score: number) => {
    if (score >= 20) return { label: 'Critical', color: 'text-red-500 bg-red-50 border-red-200' };
    if (score >= 13) return { label: 'High',     color: 'text-orange-500 bg-orange-50 border-orange-200' };
    if (score >= 7)  return { label: 'Medium',   color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    return                   { label: 'Low',     color: 'text-green-600 bg-green-50 border-green-200' };
};

export default function RiskEdit({ risk, categories, statuses, treatments }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title:          risk.title,
        description:    risk.description,
        category:       risk.category,
        owner:          risk.owner,
        likelihood:     String(risk.likelihood),
        impact:         String(risk.impact),
        status:         risk.status,
        treatment:      risk.treatment,
        treatment_plan: risk.treatment_plan ?? '',
        due_date:       risk.due_date?.split('T')[0] ?? '',
    });

    const score = Number(data.likelihood) * Number(data.impact);
    const level = levelFromScore(score);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('risks.update', risk.id));
    };

    return (
        <AdminLayout>
            <Head title={`Edit — ${risk.title}`} />

            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('risks.show', risk.id)}>
                        <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Risk</h1>
                        <p className="text-sm text-gray-500 truncate max-w-md">{risk.title}</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Risk Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="title">Risk Title *</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('title', e.target.value)}
                                />
                                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                    rows={4}
                                />
                                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Category *</Label>
                                    <Select value={data.category} onValueChange={(v: string) => setData('category', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="owner">Risk Owner *</Label>
                                    <Input
                                        id="owner"
                                        value={data.owner}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('owner', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Risk Scoring</CardTitle>
                            <CardDescription>ISO/IEC 27005 — Likelihood × Impact</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Likelihood: {data.likelihood}/5</Label>
                                    <input
                                        type="range" min="1" max="5" value={data.likelihood}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('likelihood', e.target.value)}
                                        className="w-full accent-blue-600"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Rare</span><span>Unlikely</span><span>Possible</span><span>Likely</span><span>Almost Certain</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Impact: {data.impact}/5</Label>
                                    <input
                                        type="range" min="1" max="5" value={data.impact}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('impact', e.target.value)}
                                        className="w-full accent-blue-600"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Negligible</span><span>Minor</span><span>Moderate</span><span>Major</span><span>Catastrophic</span>
                                    </div>
                                </div>
                            </div>
                            <div className={`flex items-center justify-between p-4 rounded-lg border ${level.color}`}>
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    <span className="font-semibold">Risk Level: {level.label}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-bold">{score}</span>
                                    <span className="text-sm ml-1">/ 25</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Risk Treatment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Treatment Strategy *</Label>
                                    <Select value={data.treatment} onValueChange={(v: string) => setData('treatment', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {treatments.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Status *</Label>
                                    <Select value={data.status} onValueChange={(v: string) => setData('status', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {statuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="treatment_plan">Treatment Plan</Label>
                                <Textarea
                                    id="treatment_plan"
                                    value={data.treatment_plan}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('treatment_plan', e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="due_date">Due Date</Label>
                                <Input
                                    id="due_date"
                                    type="date"
                                    value={data.due_date}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('due_date', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Link href={route('risks.show', risk.id)}>
                            <Button variant="outline">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing} className="gap-2">
                            <Save className="w-4 h-4" />
                            {processing ? 'Saving...' : 'Update Risk'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}