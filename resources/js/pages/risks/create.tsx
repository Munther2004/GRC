import { Head, Link, useForm } from '@inertiajs/react';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';


interface Props {
    categories: string[];
    statuses:   { value: string; label: string }[];
    treatments: { value: string; label: string }[];
}

interface ThreatSuggestion {
    threat:              string;
    explanation:         string;
    likelihood:          number;
    impact:              number;
    suggested_treatment: string;
}

const levelFromScore = (score: number) => {
    if (score >= 20) return { label: 'Critical', color: 'text-red-500 bg-red-50 border-red-200' };
    if (score >= 13) return { label: 'High',     color: 'text-orange-500 bg-orange-50 border-orange-200' };
    if (score >= 7)  return { label: 'Medium',   color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    return                   { label: 'Low',     color: 'text-green-600 bg-green-50 border-green-200' };
};

const levelColors: Record<number, string> = {
    1: 'bg-green-100 text-green-700',
    2: 'bg-lime-100 text-lime-700',
    3: 'bg-yellow-100 text-yellow-700',
    4: 'bg-orange-100 text-orange-700',
    5: 'bg-red-100 text-red-700',
};

export default function RiskCreate({ categories, statuses, treatments }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title:          '',
        description:    '',
        category:       '',
        owner:          '',
        likelihood:     '3',
        impact:         '3',
        status:         'open',
        treatment:      'mitigate',
        treatment_plan: '',
        due_date:       '',
    });

    const [threats, setThreats]           = useState<ThreatSuggestion[]>([]);
    const [loadingThreats, setLoadingThreats] = useState(false);
    const [threatError, setThreatError]   = useState('');

    const score = Number(data.likelihood) * Number(data.impact);
    const level = levelFromScore(score);

    const canSuggest = data.title.length >= 10 && data.description.length >= 10;

    const suggestThreats = async () => {
        if (!canSuggest) return;
        setLoadingThreats(true);
        setThreatError('');
        setThreats([]);
        try {
            const res = await axios.post('/ai/suggest-threats', {
                title:       data.title,
                description: data.description,
                category:    data.category || 'General',
            });
            setThreats(res.data);
        } catch {
            setThreatError('AI suggestion failed. Please try again.');
        } finally {
            setLoadingThreats(false);
        }
    };

    const useThreat = (t: ThreatSuggestion) => {
        setData({
            ...data,
            title:       t.threat,
            description: t.explanation,
            likelihood:  String(t.likelihood),
            impact:      String(t.impact),
            treatment:   t.suggested_treatment,
        });
        setThreats([]);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('risks.store'));
    };

    return (
        <AdminLayout>
            <Head title="Add Risk" />

            <div className="max-w-3xl mx-auto space-y-6">

                <div className="flex items-center gap-3">
                    <Link href={route('risks.index')}>
                        <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Risk</h1>
                            <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                                <Sparkles className="w-3 h-3 mr-1" />AI Powered
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-500">ISO/IEC 27005 risk assessment</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Risk Details</CardTitle>
                            <CardDescription>Basic information about the risk</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="title">Risk Title *</Label>
                                    {canSuggest && (
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="gap-1.5 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400"
                                            onClick={suggestThreats}
                                            disabled={loadingThreats}
                                        >
                                            {loadingThreats
                                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                : <Sparkles className="w-3.5 h-3.5" />
                                            }
                                            {loadingThreats ? 'Thinking...' : 'Suggest Threats'}
                                        </Button>
                                    )}
                                </div>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('title', e.target.value)}
                                    placeholder="e.g. Unauthorized access to customer data"
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
                                    placeholder="Describe the risk in detail..."
                                />
                                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Category *</Label>
                                    <Select value={data.category} onValueChange={(v: string) => setData('category', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                        <SelectContent>
                                            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="owner">Risk Owner *</Label>
                                    <Input
                                        id="owner"
                                        value={data.owner}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('owner', e.target.value)}
                                        placeholder="e.g. IT Department"
                                    />
                                    {errors.owner && <p className="text-xs text-red-500">{errors.owner}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Threat Suggestions */}
                    {threatError && (
                        <p className="text-sm text-red-500 px-1">{threatError}</p>
                    )}

                    {threats.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                <p className="text-sm font-medium text-purple-700">AI Threat Suggestions — click "Use This" to populate the form</p>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {threats.map((t, i) => (
                                    <Card key={i} className="border-purple-200 bg-purple-50/30">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 space-y-1.5">
                                                    <p className="font-medium text-sm text-gray-900 dark:text-white">{t.threat}</p>
                                                    <p className="text-xs text-gray-600">{t.explanation}</p>
                                                    <div className="flex items-center gap-2 pt-1">
                                                        <Badge className={`text-xs ${levelColors[t.likelihood]}`}>
                                                            L: {t.likelihood}
                                                        </Badge>
                                                        <Badge className={`text-xs ${levelColors[t.impact]}`}>
                                                            I: {t.impact}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs capitalize">
                                                            {t.suggested_treatment}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="shrink-0 bg-purple-600 hover:bg-purple-700 text-white"
                                                    onClick={() => useThreat(t)}
                                                >
                                                    Use This
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Risk Scoring</CardTitle>
                            <CardDescription>ISO/IEC 27005 — Likelihood × Impact matrix (1–5 scale)</CardDescription>
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
                            <CardDescription>ISO/IEC 27005 treatment strategies</CardDescription>
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
                                    placeholder="Describe the treatment plan, actions, and responsible parties..."
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
                        <Link href={route('risks.index')}>
                            <Button variant="outline">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing} className="gap-2">
                            <Save className="w-4 h-4" />
                            {processing ? 'Saving...' : 'Save Risk'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
