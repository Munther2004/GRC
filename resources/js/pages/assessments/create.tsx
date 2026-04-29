import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Shield } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { route } from '@/lib/routes';

interface Framework {
    id: number;
    name: string;
    short_name: string;
    description: string;
}

interface Props {
    frameworks: Framework[];
}

export default function AssessmentCreate({ frameworks }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        framework_id: '',
        scope: '',
        period: '',
        due_date: '',
        description: '',
    });

    const selectedFramework = frameworks.find(
        (f) => String(f.id) === data.framework_id,
    );

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('assessments.store'));
    };

    return (
        <AdminLayout>
            <Head title="New Assessment" />

            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('assessments.index')}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-4xl tracking-[-0.02em]" style={{ color: 'var(--foreground)', fontWeight: 500, lineHeight: 1.1 }}>
                            New Assessment
                        </h1>
                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                            Create a compliance self-assessment
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Framework Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Select Framework
                            </CardTitle>
                            <CardDescription>
                                The questionnaire will be generated from this
                                framework's controls
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-3">
                                {frameworks.map((f) => (
                                    <button
                                        key={f.id}
                                        type="button"
                                        onClick={() =>
                                            setData(
                                                'framework_id',
                                                String(f.id),
                                            )
                                        }
                                        className="rounded-2xl border-2 p-4 text-left transition-all"
                                        style={data.framework_id === String(f.id) ? { borderColor: 'var(--primary)', background: 'color-mix(in srgb, var(--primary) 10%, transparent)' } : { borderColor: 'var(--border)' }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                                                style={data.framework_id === String(f.id) ? { background: 'var(--primary)' } : { background: 'color-mix(in srgb, var(--muted) 60%, transparent)' }}
                                            >
                                                <Shield
                                                    className="h-5 w-5"
                                                    style={data.framework_id === String(f.id) ? { color: 'var(--primary-foreground)' } : { color: 'var(--muted-foreground)' }}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm" style={{ fontWeight: 500 }}>
                                                    {f.short_name}
                                                </p>
                                                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                    {f.name}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            {errors.framework_id && (
                                <p className="text-xs" style={{ color: 'var(--destructive)' }}>
                                    {errors.framework_id}
                                </p>
                            )}

                            {selectedFramework && (
                                <div className="rounded-2xl p-3 text-sm" style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)' }}>
                                    {selectedFramework.description}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Assessment Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Assessment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="title">
                                    Assessment Title *
                                </Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                    ) => setData('title', e.target.value)}
                                    placeholder="e.g. ISO 27001 Annual Audit Q1 2026"
                                />
                                {errors.title && (
                                    <p className="text-xs" style={{ color: 'var(--destructive)' }}>
                                        {errors.title}
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="period">Period *</Label>
                                    <Input
                                        id="period"
                                        value={data.period}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>,
                                        ) => setData('period', e.target.value)}
                                        placeholder="e.g. Q1 2026"
                                    />
                                    {errors.period && (
                                        <p className="text-xs text-red-500">
                                            {errors.period}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="due_date">Due Date</Label>
                                    <Input
                                        id="due_date"
                                        type="date"
                                        value={data.due_date}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>,
                                        ) =>
                                            setData('due_date', e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="scope">Scope *</Label>
                                <Textarea
                                    id="scope"
                                    value={data.scope}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLTextAreaElement>,
                                    ) => setData('scope', e.target.value)}
                                    rows={3}
                                    placeholder="Describe the scope of this assessment, e.g. departments, systems, or processes covered..."
                                />
                                {errors.scope && (
                                    <p className="text-xs" style={{ color: 'var(--destructive)' }}>
                                        {errors.scope}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLTextAreaElement>,
                                    ) => setData('description', e.target.value)}
                                    rows={2}
                                    placeholder="Optional additional notes..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Link href={route('assessments.index')}>
                            <Button variant="outline">Cancel</Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing || !data.framework_id}
                            className="gap-2"
                        >
                            <Save className="h-4 w-4" />
                            {processing
                                ? 'Creating...'
                                : 'Create & Start Questionnaire'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
