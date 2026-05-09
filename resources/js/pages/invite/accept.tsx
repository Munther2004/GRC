import { Head, useForm } from '@inertiajs/react';
import { Building2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { route } from '@/lib/routes';

interface Props {
    token: string;
    corporation: { id: number; name: string };
    email: string | null;
    isEmailLocked: boolean;
    expiresAt: string | null;
}

export default function InviteAccept({ token, corporation, email, isEmailLocked, expiresAt }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: email ?? '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('invite.register', token));
    };

    return (
        <AuthLayout
            title={`Join ${corporation.name}`}
            description="Set up your account to access the GRC Platform."
        >
            <Head title={`Join ${corporation.name}`} />

            <div className="space-y-6">
                <div
                    className="rounded-2xl p-5"
                    style={{
                        background: 'color-mix(in srgb, var(--primary) 6%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--primary) 22%, transparent)',
                    }}
                >
                    <div
                        className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px]"
                        style={{ color: 'var(--primary)', background: 'color-mix(in srgb, var(--primary) 10%, transparent)' }}
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Invited
                    </div>
                    <p className="text-sm leading-relaxed flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                        <Building2 className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                        You're joining <strong>{corporation.name}</strong>.
                    </p>
                    {expiresAt && (
                        <p className="mt-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            This invitation expires on {new Date(expiresAt).toLocaleString()}.
                        </p>
                    )}
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <Field label="Full name" required error={errors.name}>
                        <Input
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
                            type="email"
                            required
                            readOnly={isEmailLocked}
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="your@email.com"
                            aria-invalid={!!errors.email}
                        />
                    </Field>

                    <Field label="Password" required error={errors.password} hint="At least 8 characters">
                        <Input
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
