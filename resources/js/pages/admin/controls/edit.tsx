import { Head, Link, useForm } from '@inertiajs/react';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';

interface Control {
    id: number; control_id: string; title: string; description: string;
    category: string; implementation_guidance: string; is_active: boolean;
    framework: { name: string; short_name: string };
}

interface Props { control: Control }

export default function ControlEdit({ control }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title:                   control.title,
        description:             control.description,
        category:                control.category,
        implementation_guidance: control.implementation_guidance ?? '',
        is_active:               control.is_active,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.controls.update', control.id));
    };

    return (
        <AdminLayout>
            <Head title={`Edit Control — ${control.control_id}`} />

            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('admin.controls.index')}>
                        <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Edit Control</h1>
                        <p className="text-sm text-gray-500">
                            <span className="font-mono">{control.control_id}</span> — {control.framework.short_name}
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Control Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('title', e.target.value)}
                                />
                                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="category">Category *</Label>
                                <Input
                                    id="category"
                                    value={data.category}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('category', e.target.value)}
                                />
                                {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
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
                            <div className="space-y-1">
                                <Label htmlFor="implementation_guidance">Implementation Guidance</Label>
                                <Textarea
                                    id="implementation_guidance"
                                    value={data.implementation_guidance}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('implementation_guidance', e.target.value)}
                                    rows={4}
                                    placeholder="Guidance for implementing this control..."
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('is_active', e.target.checked)}
                                    className="w-4 h-4 accent-blue-600"
                                />
                                <Label htmlFor="is_active">Active — include in assessments</Label>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Link href={route('admin.controls.index')}>
                            <Button variant="outline">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing} className="gap-2">
                            <Save className="w-4 h-4" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
