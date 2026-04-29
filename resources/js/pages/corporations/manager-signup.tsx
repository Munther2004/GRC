import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2, Lock, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { route } from '@/lib/routes';

interface Corporation {
    id: number;
    name: string;
    email: string;
}

interface Props {
    corporation: Corporation;
}

export default function ManagerSignup({ corporation }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('corporations.manager-register', corporation.id));
    };

    return (
        <AuthLayout
            title="Create your manager account"
            description={`Set up your account for ${corporation.name}`}
        >
            <Head title="Create Manager Account" />

            <div className="space-y-6">
                <div
                    className="rounded-2xl p-5"
                    style={{
                        background: 'color-mix(in srgb, var(--primary) 6%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--primary) 22%, transparent)',
                    }}
                >
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px]" style={{ color: 'var(--primary)', background: 'color-mix(in srgb, var(--primary) 10%, transparent)' }}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approved
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
                        <span style={{ fontWeight: 500 }}>{corporation.name}</span> is approved. Create your manager account to begin.
                    </p>

                    <div className="mt-4 grid gap-3">
                        {[
                            { icon: User, title: 'As manager', body: 'Manage compliance, controls, and team members.' },
                            { icon: Lock, title: 'Secure access', body: 'Your account is unique and encrypted at rest.' },
                        ].map(({ icon: Icon, title, body }) => (
                            <div key={title} className="flex gap-3 rounded-xl px-3 py-2.5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                                <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                                <div className="text-sm">
                                    <p style={{ color: 'var(--foreground)', fontWeight: 500 }}>{title}</p>
                                    <p className="mt-0.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>{body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <Field label="Full name" required error={errors.name}>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Your full name"
                            aria-invalid={!!errors.name}
                        />
                    </Field>

                    <Field label="Email address" required error={errors.email}>
                        <Input
                            id="email"
                            type="email"
                            required
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="your@email.com"
                            aria-invalid={!!errors.email}
                        />
                    </Field>

                    <Field
                        label="Password"
                        required
                        error={errors.password}
                        hint="At least 8 characters"
                    >
                        <Input
                            id="password"
                            type="password"
                            required
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            aria-invalid={!!errors.password}
                        />
                    </Field>

                    <Field label="Confirm password" required>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="••••••••"
                        />
                    </Field>

                    <Button type="submit" disabled={processing} className="mt-2 w-full">
                        {processing ? 'Creating account…' : 'Create account & sign in'}
                    </Button>
                </form>

                <div
                    className="rounded-2xl p-4 flex gap-3"
                    style={{
                        background: 'color-mix(in srgb, var(--chart-2) 6%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--chart-2) 18%, transparent)',
                    }}
                >
                    <Mail className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'var(--chart-2)' }} />
                    <div className="text-xs" style={{ color: 'var(--foreground)' }}>
                        <p style={{ fontWeight: 500 }}>Next steps</p>
                        <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
                            After signing in, invite team members and begin onboarding compliance controls.
                        </p>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}

function Field({
    label,
    required,
    error,
    hint,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <Label className="flex items-center gap-1">
                {label}
                {required && <span style={{ color: 'var(--primary)' }}>*</span>}
            </Label>
            {children}
            {error && <p className="text-xs" style={{ color: 'var(--destructive)' }}>{error}</p>}
            {hint && !error && <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{hint}</p>}
        </div>
    );
}
