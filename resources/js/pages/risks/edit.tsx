import { Head, Link, useForm } from '@inertiajs/react';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
    ArrowLeft,
    Save,
    AlertTriangle,
    Sparkles,
    Loader2,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import {
    levelColors,
    levelFromScore,
    ValidationResult,
} from '@/lib/risk-utils';

interface Risk {
    id: number;
    title: string;
    description: string;
    category: string;
    owner: string;
    likelihood: number;
    impact: number;
    status: string;
    treatment: string;
    treatment_plan: string | null;
    due_date: string | null;
    ai_validated: boolean;
}

interface Props {
    risk: Risk;
    categories: string[];
    statuses: { value: string; label: string }[];
    treatments: { value: string; label: string }[];
}

export default function RiskEdit({
    risk,
    categories,
    statuses,
    treatments,
}: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title: risk.title,
        description: risk.description,
        category: risk.category,
        owner: risk.owner,
        likelihood: String(risk.likelihood),
        impact: String(risk.impact),
        status: risk.status,
        treatment: risk.treatment,
        treatment_plan: risk.treatment_plan ?? '',
        due_date: risk.due_date?.split('T')[0] ?? '',
        ai_validated: risk.ai_validated ?? false,
    });

    const [validationResult, setValidationResult] =
        useState<ValidationResult | null>(null);
    const [loadingValidation, setLoadingValidation] = useState(false);
    const [validationError, setValidationError] = useState('');

    const score = Number(data.likelihood) * Number(data.impact);
    const level = levelFromScore(score);

    const canValidate = data.title.length >= 5 && data.description.length >= 10;

    const validateScores = async () => {
        if (!canValidate) return;
        setLoadingValidation(true);
        setValidationError('');
        setValidationResult(null);
        try {
            const res = await axios.post('/risks/validate-scores', {
                title: data.title,
                description: data.description,
                likelihood: Number(data.likelihood),
                impact: Number(data.impact),
            });
            setValidationResult(res.data);
            if (!res.data.error) setData('ai_validated', true);
        } catch {
            setValidationError('AI validation failed. Please try again.');
        } finally {
            setLoadingValidation(false);
        }
    };

    const applyRecommendations = () => {
        if (!validationResult) return;
        setData({
            ...data,
            likelihood: String(validationResult.recommended_likelihood),
            impact: String(validationResult.recommended_impact),
            ai_validated: true,
        });
        setValidationResult(null);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('risks.update', risk.id));
    };

    return (
        <AdminLayout>
            <Head title={`Edit — ${risk.title}`} />

            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('risks.show', risk.id)}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Edit Risk
                        </h1>
                        <p className="max-w-md truncate text-sm text-muted-foreground">
                            {risk.title}
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Risk Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="title">Risk Title *</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                    ) => setData('title', e.target.value)}
                                />
                                {errors.title && (
                                    <p className="text-xs text-red-500">
                                        {errors.title}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="description">
                                    Description *
                                </Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLTextAreaElement>,
                                    ) => setData('description', e.target.value)}
                                    rows={4}
                                />
                                {errors.description && (
                                    <p className="text-xs text-red-500">
                                        {errors.description}
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Category *</Label>
                                    <Select
                                        value={data.category}
                                        onValueChange={(v: string) =>
                                            setData('category', v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem key={c} value={c}>
                                                    {c}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="owner">Risk Owner *</Label>
                                    <Input
                                        id="owner"
                                        value={data.owner}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>,
                                        ) => setData('owner', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">
                                        Risk Scoring
                                    </CardTitle>
                                    <CardDescription>
                                        ISO/IEC 27005 — Likelihood × Impact
                                    </CardDescription>
                                </div>
                                {data.ai_validated && (
                                    <Badge className="border-blue-200 bg-blue-950 text-xs text-blue-400">
                                        <Sparkles className="mr-1 h-3 w-3" />
                                        AI Validated
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>
                                        Likelihood: {data.likelihood}/5
                                    </Label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        value={data.likelihood}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>,
                                        ) =>
                                            setData(
                                                'likelihood',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full accent-blue-600"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground/70">
                                        <span>Rare</span>
                                        <span>Unlikely</span>
                                        <span>Possible</span>
                                        <span>Likely</span>
                                        <span>Almost Certain</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Impact: {data.impact}/5</Label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        value={data.impact}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>,
                                        ) => setData('impact', e.target.value)}
                                        className="w-full accent-blue-600"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground/70">
                                        <span>Negligible</span>
                                        <span>Minor</span>
                                        <span>Moderate</span>
                                        <span>Major</span>
                                        <span>Catastrophic</span>
                                    </div>
                                </div>
                            </div>

                            {/* Validate Scores */}
                            <div className="flex items-center justify-between">
                                <div />
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="gap-1.5 border-blue-300 text-blue-700 hover:border-blue-400 hover:bg-blue-50"
                                    onClick={validateScores}
                                    disabled={loadingValidation || !canValidate}
                                >
                                    {loadingValidation ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Sparkles className="h-3.5 w-3.5" />
                                    )}
                                    {loadingValidation
                                        ? 'Validating...'
                                        : '✨ Validate Scores'}
                                </Button>
                            </div>

                            {validationError && (
                                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                                    <p className="text-sm text-red-700">
                                        {validationError}
                                    </p>
                                </div>
                            )}

                            {validationResult &&
                                validationResult.error === true && (
                                    <div className="rounded-lg border border-red-200 bg-red-50">
                                        <div className="flex items-center gap-2 rounded-t-lg bg-red-100 px-4 py-2">
                                            <XCircle className="h-4 w-4 text-red-400" />
                                            <span className="text-sm font-semibold text-red-800">
                                                Validation Unavailable
                                            </span>
                                        </div>
                                        <div className="px-4 py-3">
                                            <p className="text-sm text-red-700">
                                                {validationResult.reasoning}
                                            </p>
                                        </div>
                                    </div>
                                )}

                            {validationResult &&
                                !validationResult.error &&
                                validationResult.valid && (
                                    <div className="rounded-lg border border-green-200 bg-green-50">
                                        <div className="flex items-center gap-2 rounded-t-lg bg-green-100 px-4 py-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                            <span className="text-sm font-semibold text-green-800">
                                                Scores Validated — Looks Good
                                            </span>
                                            <span
                                                className={`ml-auto rounded px-1.5 py-0.5 text-xs capitalize ${validationResult.confidence === 'high' ? 'bg-green-200 text-green-800' : validationResult.confidence === 'medium' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-700'}`}
                                            >
                                                {validationResult.confidence}{' '}
                                                confidence
                                            </span>
                                        </div>
                                        <div className="px-4 py-3">
                                            <p className="text-sm text-gray-700">
                                                {validationResult.reasoning}
                                            </p>
                                        </div>
                                    </div>
                                )}

                            {validationResult &&
                                !validationResult.error &&
                                !validationResult.valid && (
                                    <div className="rounded-lg border border-border bg-amber-50">
                                        <div className="flex items-center gap-2 rounded-t-lg bg-amber-100 px-4 py-2">
                                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                                            <span className="text-sm font-semibold text-amber-800">
                                                Scores Adjusted —
                                                Recommendations Available
                                            </span>
                                            <span
                                                className={`ml-auto rounded px-1.5 py-0.5 text-xs capitalize ${validationResult.confidence === 'high' ? 'bg-green-200 text-green-800' : validationResult.confidence === 'medium' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-700'}`}
                                            >
                                                {validationResult.confidence}{' '}
                                                confidence
                                            </span>
                                        </div>
                                        <div className="space-y-3 px-4 py-3">
                                            <p className="text-sm text-gray-700">
                                                {validationResult.reasoning}
                                            </p>
                                            <div className="flex items-center justify-between gap-4 pt-1">
                                                <div className="flex items-center gap-3 text-sm">
                                                    <span className="text-gray-500">
                                                        Recommended:
                                                    </span>
                                                    <span className="font-medium">
                                                        Likelihood{' '}
                                                        <span
                                                            className={`rounded px-1.5 py-0.5 text-xs font-bold ${levelColors[validationResult.recommended_likelihood]}`}
                                                        >
                                                            {
                                                                validationResult.recommended_likelihood
                                                            }
                                                        </span>
                                                    </span>
                                                    <span className="font-medium">
                                                        Impact{' '}
                                                        <span
                                                            className={`rounded px-1.5 py-0.5 text-xs font-bold ${levelColors[validationResult.recommended_impact]}`}
                                                        >
                                                            {
                                                                validationResult.recommended_impact
                                                            }
                                                        </span>
                                                    </span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="shrink-0 bg-amber-500 text-white hover:bg-amber-700"
                                                    onClick={
                                                        applyRecommendations
                                                    }
                                                >
                                                    Apply Recommendations
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            <div
                                className={`flex items-center justify-between rounded-lg border p-4 ${level.color}`}
                            >
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    <span className="font-semibold">
                                        Risk Level: {level.label}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-bold">
                                        {score}
                                    </span>
                                    <span className="ml-1 text-sm">/ 25</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Risk Treatment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Treatment Strategy *</Label>
                                    <Select
                                        value={data.treatment}
                                        onValueChange={(v: string) =>
                                            setData('treatment', v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {treatments.map((t) => (
                                                <SelectItem
                                                    key={t.value}
                                                    value={t.value}
                                                >
                                                    {t.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Status *</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(v: string) =>
                                            setData('status', v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statuses.map((s) => (
                                                <SelectItem
                                                    key={s.value}
                                                    value={s.value}
                                                >
                                                    {s.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="treatment_plan">
                                    Treatment Plan
                                </Label>
                                <Textarea
                                    id="treatment_plan"
                                    value={data.treatment_plan}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLTextAreaElement>,
                                    ) =>
                                        setData(
                                            'treatment_plan',
                                            e.target.value,
                                        )
                                    }
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="due_date">Due Date</Label>
                                <Input
                                    id="due_date"
                                    type="date"
                                    value={data.due_date}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                    ) => setData('due_date', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Link href={route('risks.show', risk.id)}>
                            <Button variant="outline">Cancel</Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="gap-2"
                        >
                            <Save className="h-4 w-4" />
                            {processing ? 'Saving...' : 'Update Risk'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
