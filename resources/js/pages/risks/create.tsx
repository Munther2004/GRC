import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import type {
    ValidationResult} from '@/lib/risk-utils';
import {
    levelColors,
    levelFromScore
} from '@/lib/risk-utils';
import { route } from '@/lib/routes';

interface Props {
    categories: string[];
    statuses: { value: string; label: string }[];
    treatments: { value: string; label: string }[];
}

interface ThreatSuggestion {
    threat: string;
    explanation: string;
    likelihood: number;
    impact: number;
    suggested_treatment: string;
}

export default function RiskCreate({
    categories,
    statuses,
    treatments,
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        category: '',
        owner: '',
        likelihood: '3',
        impact: '3',
        status: 'open',
        treatment: 'mitigate',
        treatment_plan: '',
        due_date: '',
        ai_validated: false,
    });

    const [threats, setThreats] = useState<ThreatSuggestion[]>([]);
    const [loadingThreats, setLoadingThreats] = useState(false);
    const [threatError, setThreatError] = useState('');

    const [validationResult, setValidationResult] =
        useState<ValidationResult | null>(null);
    const [loadingValidation, setLoadingValidation] = useState(false);
    const [validationError, setValidationError] = useState('');

    const score = Number(data.likelihood) * Number(data.impact);
    const level = levelFromScore(score);

    const canSuggest = data.title.length >= 10 && data.description.length >= 10;
    const canValidate = data.title.length >= 5 && data.description.length >= 10;

    const suggestThreats = async () => {
        if (!canSuggest) return;
        setLoadingThreats(true);
        setThreatError('');
        setThreats([]);
        try {
            const res = await axios.post('/ai/suggest-threats', {
                title: data.title,
                description: data.description,
                category: data.category || 'General',
            });
            setThreats(res.data);
        } catch {
            setThreatError('AI suggestion failed. Please try again.');
        } finally {
            setLoadingThreats(false);
        }
    };

    const applyThreatSuggestion = (t: ThreatSuggestion) => {
        setData({
            ...data,
            title: t.threat,
            description: t.explanation,
            likelihood: String(t.likelihood),
            impact: String(t.impact),
            treatment: t.suggested_treatment,
        });
        setThreats([]);
    };

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
        post(route('risks.store'));
    };

    return (
        <AdminLayout>
            <Head title="Add Risk" />

            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('risks.index')}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="font-heading text-4xl font-normal" style={{ color: 'var(--foreground)' }}>
                                Add New Risk
                            </h1>
                            <Badge className="text-xs">
                                <Sparkles className="mr-1 h-3 w-3" />
                                AI Powered
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            ISO/IEC 27005 risk assessment
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Risk Details
                            </CardTitle>
                            <CardDescription>
                                Basic information about the risk
                            </CardDescription>
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
                                            className="gap-1.5" style={{ borderColor: "rgba(64,138,113,0.5)", color: "#408A71" }}
                                            onClick={suggestThreats}
                                            disabled={loadingThreats}
                                        >
                                            {loadingThreats ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Sparkles className="h-3.5 w-3.5" />
                                            )}
                                            {loadingThreats
                                                ? 'Thinking...'
                                                : 'Suggest Threats'}
                                        </Button>
                                    )}
                                </div>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                    ) => setData('title', e.target.value)}
                                    placeholder="e.g. Unauthorized access to customer data"
                                />
                                {errors.title && (
                                    <p className="font-body text-xs italic" style={{ color: "#8B2635" }}>
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
                                    placeholder="Describe the risk in detail..."
                                />
                                {errors.description && (
                                    <p className="font-body text-xs italic" style={{ color: "#8B2635" }}>
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
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem key={c} value={c}>
                                                    {c}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category && (
                                        <p className="font-body text-xs italic" style={{ color: "#8B2635" }}>
                                            {errors.category}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="owner">Risk Owner *</Label>
                                    <Input
                                        id="owner"
                                        value={data.owner}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>,
                                        ) => setData('owner', e.target.value)}
                                        placeholder="e.g. IT Department"
                                    />
                                    {errors.owner && (
                                        <p className="font-body text-xs italic" style={{ color: "#8B2635" }}>
                                            {errors.owner}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Threat Suggestions */}
                    {threatError && (
                        <p className="font-body px-1 text-sm italic" style={{ color: "#8B2635" }}>
                            {threatError}
                        </p>
                    )}

                    {threats.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4" style={{ color: "#408A71" }} />
                                <p className="font-display text-[10px] uppercase tracking-widest" style={{ color: "#408A71" }}>
                                    AI Threat Suggestions — click "Use This" to
                                    populate the form
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {threats.map((t, i) => (
                                    <Card
                                        key={i}
                                        className="" style={{ borderColor: "rgba(64,138,113,0.3)", background: "rgba(13,31,28,0.4)" }}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 space-y-1.5">
                                                    <p className="text-sm font-medium text-foreground">
                                                        {t.threat}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {t.explanation}
                                                    </p>
                                                    <div className="flex items-center gap-2 pt-1">
                                                        <Badge
                                                            className={`text-xs ${levelColors[t.likelihood]}`}
                                                        >
                                                            L: {t.likelihood}
                                                        </Badge>
                                                        <Badge
                                                            className={`text-xs ${levelColors[t.impact]}`}
                                                        >
                                                            I: {t.impact}
                                                        </Badge>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs capitalize"
                                                        >
                                                            {
                                                                t.suggested_treatment
                                                            }
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="shrink-0"
                                                    onClick={() =>
                                                        applyThreatSuggestion(t)
                                                    }
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
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">
                                        Risk Scoring
                                    </CardTitle>
                                    <CardDescription>
                                        ISO/IEC 27005 — Likelihood × Impact
                                        matrix (1–5 scale)
                                    </CardDescription>
                                </div>
                                {data.ai_validated && (
                                    <Badge className="text-xs">
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
                                        className="w-full" style={{ accentColor: "#408A71" }}
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
                                        className="w-full" style={{ accentColor: "#408A71" }}
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
                                    className="gap-1.5" style={{ borderColor: "rgba(64,138,113,0.4)", color: "#408A71" }}
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
                                <div className="flex items-start gap-2 rounded p-3" style={{ background: "rgba(139,38,53,0.1)", border: "1px solid rgba(139,38,53,0.3)" }}>
                                    <XCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "#8B2635" }} />
                                    <p className="font-body text-sm italic" style={{ color: "#8B2635" }}>
                                        {validationError}
                                    </p>
                                </div>
                            )}

                            {validationResult &&
                                validationResult.error === true && (
                                    <div className="rounded" style={{ background: "rgba(139,38,53,0.08)", border: "1px solid rgba(139,38,53,0.3)" }}>
                                        <div className="flex items-center gap-2 rounded-t px-4 py-2" style={{ background: "rgba(139,38,53,0.15)" }}>
                                            <XCircle className="h-4 w-4" style={{ color: "#8B2635" }} />
                                            <span className="font-display text-[10px] uppercase tracking-widest" style={{ color: "#8B2635" }}>
                                                Validation Unavailable
                                            </span>
                                        </div>
                                        <div className="px-4 py-3">
                                            <p className="font-body text-sm italic" style={{ color: "#8B2635" }}>
                                                {validationResult.reasoning}
                                            </p>
                                        </div>
                                    </div>
                                )}

                            {validationResult &&
                                !validationResult.error &&
                                validationResult.valid && (
                                    <div className="rounded" style={{ background: "rgba(176,228,204,0.08)", border: "1px solid rgba(176,228,204,0.3)" }}>
                                        <div className="flex items-center gap-2 rounded-t px-4 py-2" style={{ background: "rgba(176,228,204,0.15)" }}>
                                            <CheckCircle2 className="h-4 w-4" style={{ color: "#B0E4CC" }} />
                                            <span className="font-display text-[10px] uppercase tracking-widest" style={{ color: "#B0E4CC" }}>
                                                Scores Validated — Looks Good
                                            </span>
                                            <span
                                                className="ml-auto font-display rounded px-1.5 py-0.5 text-[9px] uppercase tracking-widest" style={{ color: validationResult.confidence === 'high' ? '#B0E4CC' : validationResult.confidence === 'medium' ? '#408A71' : '#7ABFA8' }}
                                            >
                                                {validationResult.confidence}{' '}
                                                confidence
                                            </span>
                                        </div>
                                        <div className="px-4 py-3">
                                            <p className="text-sm text-muted-foreground">
                                                {validationResult.reasoning}
                                            </p>
                                        </div>
                                    </div>
                                )}

                            {validationResult &&
                                !validationResult.error &&
                                !validationResult.valid && (
                                    <div className="rounded" style={{ background: "rgba(40,90,72,0.08)", border: "1px solid rgba(40,90,72,0.3)" }}>
                                        <div className="flex items-center gap-2 rounded-t px-4 py-2" style={{ background: "rgba(40,90,72,0.15)" }}>
                                            <AlertTriangle className="h-4 w-4" style={{ color: "#285A48" }} />
                                            <span className="font-display text-[10px] uppercase tracking-widest" style={{ color: "#285A48" }}>
                                                Scores Adjusted —
                                                Recommendations Available
                                            </span>
                                            <span
                                                className="ml-auto font-display rounded px-1.5 py-0.5 text-[9px] uppercase tracking-widest" style={{ color: validationResult.confidence === 'high' ? '#B0E4CC' : validationResult.confidence === 'medium' ? '#408A71' : '#7ABFA8' }}
                                            >
                                                {validationResult.confidence}{' '}
                                                confidence
                                            </span>
                                        </div>
                                        <div className="space-y-3 px-4 py-3">
                                            <p className="text-sm text-muted-foreground">
                                                {validationResult.reasoning}
                                            </p>
                                            <div className="flex items-center justify-between gap-4 pt-1">
                                                <div className="flex items-center gap-3 text-sm">
                                                    <span className="text-muted-foreground">
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
                                                    className="shrink-0" style={{ background: "#408A71", color: "#091413" }}
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
                                className="flex items-center justify-between rounded border p-4" style={level.style}
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
                            <CardDescription>
                                ISO/IEC 27005 treatment strategies
                            </CardDescription>
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
                                    placeholder="Describe the treatment plan, actions, and responsible parties..."
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
                        <Link href={route('risks.index')}>
                            <Button variant="outline">Cancel</Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="gap-2"
                        >
                            <Save className="h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Risk'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
