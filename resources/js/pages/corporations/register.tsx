import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    ChevronRight,
    Clock,
    FileText,
    Globe,
    Mail,
    Phone,
    Shield,
    User,
    Users,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
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
import { route } from '@/lib/routes';

interface Props {
    industries: Record<string, string>;
}

const steps = [
    { label: 'Register', desc: 'Submit your organisation details', icon: Shield },
    { label: 'Review',   desc: 'Admin approves your application',  icon: Clock },
    { label: 'Code',     desc: 'Receive your registration code',   icon: Users },
    { label: 'Launch',   desc: 'Team onboards and begins',         icon: CheckCircle2 },
];

export default function CorporationRegister({ industries }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        company_name: '',
        email: '',
        industry: '',
        website: '',
        description: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        message: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('corporations.store'));
    };

    const fillTestData = () => {
        const firstIndustry = Object.keys(industries)[0];
        setData({
            company_name: 'Test Acme Corp',
            email: `test-corp-${Date.now()}@example.com`,
            industry: firstIndustry,
            website: 'https://www.testacme.com',
            description: 'This is a test corporation for development and testing purposes.',
            contact_name: 'John Doe',
            contact_email: `contact-${Date.now()}@example.com`,
            contact_phone: '+1 (555) 123-4567',
            message: 'Testing the corporation registration flow.',
        });
    };

    return (
        <>
            <Head title="Register Your Corporation" />

            <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground antialiased">
                {/* Mesh + grid background, matches landing page */}
                <div
                    aria-hidden
                    className="pointer-events-none fixed inset-0 z-0"
                    style={{
                        background:
                            'radial-gradient(60% 60% at 18% 18%, color-mix(in srgb, var(--primary) 10%, transparent), transparent 70%),' +
                            'radial-gradient(50% 50% at 82% 6%, color-mix(in srgb, var(--chart-2) 8%, transparent), transparent 75%),' +
                            'radial-gradient(45% 45% at 88% 78%, color-mix(in srgb, var(--chart-3) 8%, transparent), transparent 78%)',
                    }}
                />
                <div
                    aria-hidden
                    className="pointer-events-none fixed inset-0 z-0"
                    style={{
                        backgroundImage:
                            'linear-gradient(color-mix(in srgb, var(--foreground) 5%, transparent) 1px, transparent 1px),' +
                            'linear-gradient(90deg, color-mix(in srgb, var(--foreground) 5%, transparent) 1px, transparent 1px)',
                        backgroundSize: '64px 64px',
                        maskImage: 'radial-gradient(ellipse at 50% 0%, #000 30%, transparent 75%)',
                        WebkitMaskImage: 'radial-gradient(ellipse at 50% 0%, #000 30%, transparent 75%)',
                    }}
                />

                {/* Glass nav */}
                <header
                    className="sticky top-0 z-30"
                    style={{
                        background: 'color-mix(in srgb, var(--card) 72%, transparent)',
                        backdropFilter: 'blur(14px) saturate(140%)',
                        WebkitBackdropFilter: 'blur(14px) saturate(140%)',
                        borderBottom: '1px solid color-mix(in srgb, var(--border) 70%, transparent)',
                    }}
                >
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                        <Link href={route('home')} className="flex items-center gap-3">
                            <AppLogoIcon className="size-20" />
                            <span
                                className="text-[12px] uppercase"
                                style={{ color: 'var(--foreground)', letterSpacing: '0.28em', fontWeight: 600 }}
                            >
                                GRC<span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}> · Charter</span>
                            </span>
                        </Link>

                        <div className="flex items-center gap-3">
                            <ThemeToggle compact />
                            <Link
                                href={route('home')}
                                className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] transition-colors"
                                style={{ color: 'var(--foreground)', border: '1px solid var(--border)' }}
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Home
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Hero */}
                <section className="relative z-10 mx-auto max-w-5xl px-6 pt-16 pb-12 text-center">
                    <div
                        className="mb-7 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px]"
                        style={{
                            background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
                            color: 'var(--primary)',
                            border: '1px solid color-mix(in srgb, var(--primary) 24%, transparent)',
                        }}
                    >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--primary)' }} />
                        Corporate Registration
                    </div>

                    <h1
                        className="text-4xl tracking-[-0.02em] sm:text-5xl lg:text-6xl"
                        style={{ color: 'var(--foreground)', fontWeight: 500, lineHeight: 1.05 }}
                    >
                        Register your{' '}
                        <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>organisation.</span>
                    </h1>
                    <p
                        className="mx-auto mt-6 max-w-xl text-base leading-relaxed sm:text-lg"
                        style={{ color: 'var(--muted-foreground)' }}
                    >
                        Onboard your corporation to the GRC platform. Once approved, your team gains
                        access to risk management, compliance assessments, and audit tooling.
                    </p>
                </section>

                {/* Process steps */}
                <section className="relative z-10 mx-auto max-w-5xl px-6 pb-16">
                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                        {steps.map(({ label, desc, icon: Icon }, i) => (
                            <div key={label} className="relative flex flex-col items-center text-center">
                                {i < steps.length - 1 && (
                                    <div
                                        className="absolute top-5 left-1/2 hidden h-px sm:block"
                                        style={{
                                            width: 'calc(100% - 2.5rem)',
                                            marginLeft: '1.25rem',
                                            background: 'linear-gradient(90deg, var(--border), transparent)',
                                        }}
                                    />
                                )}
                                <div
                                    className="relative z-10 mb-3 flex h-10 w-10 items-center justify-center rounded-full"
                                    style={{
                                        background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
                                        border: '1px solid color-mix(in srgb, var(--primary) 24%, transparent)',
                                        color: 'var(--primary)',
                                    }}
                                >
                                    <Icon className="h-4 w-4" strokeWidth={1.6} />
                                </div>
                                <p className="text-sm" style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                                    {label}
                                </p>
                                <p className="mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                    {desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Form */}
                <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
                    <form onSubmit={submit}>
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Organisation card */}
                            <div
                                className="rounded-2xl p-7 sm:p-8 space-y-5"
                                style={{
                                    background: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    boxShadow: '0 24px 60px -28px color-mix(in srgb, var(--foreground) 22%, transparent)',
                                }}
                            >
                                <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                                    <div
                                        className="flex h-9 w-9 items-center justify-center rounded-xl"
                                        style={{
                                            background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
                                            border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
                                            color: 'var(--primary)',
                                        }}
                                    >
                                        <Building2 className="h-4 w-4" strokeWidth={1.6} />
                                    </div>
                                    <div>
                                        <p className="text-base" style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                                            Organisation details
                                        </p>
                                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                            Tell us about your company
                                        </p>
                                    </div>
                                </div>

                                <Field label="Company name" required error={errors.company_name}>
                                    <Input
                                        id="company_name"
                                        type="text"
                                        required
                                        autoFocus
                                        value={data.company_name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('company_name', e.target.value)}
                                        placeholder="Acme Corporation"
                                        aria-invalid={!!errors.company_name}
                                    />
                                </Field>

                                <Field
                                    label={<span className="inline-flex items-center gap-1.5"><Mail className="h-3 w-3" /> Corporate email</span>}
                                    required
                                    error={errors.email}
                                >
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        value={data.email}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('email', e.target.value)}
                                        placeholder="corporate@company.com"
                                        aria-invalid={!!errors.email}
                                    />
                                </Field>

                                <Field label="Industry" required error={errors.industry}>
                                    <Select value={data.industry} onValueChange={(v: string) => setData('industry', v)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select your industry" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(industries).map(([key, value]) => (
                                                <SelectItem key={key} value={key}>{value}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field
                                    label={<span className="inline-flex items-center gap-1.5"><Globe className="h-3 w-3" /> Website</span>}
                                    error={errors.website}
                                >
                                    <Input
                                        id="website"
                                        type="url"
                                        value={data.website}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('website', e.target.value)}
                                        placeholder="https://www.company.com"
                                        aria-invalid={!!errors.website}
                                    />
                                </Field>

                                <Field
                                    label={<span className="inline-flex items-center gap-1.5"><FileText className="h-3 w-3" /> Description</span>}
                                    error={errors.description}
                                >
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                        placeholder="Brief description of your company and compliance needs…"
                                        className="min-h-28"
                                    />
                                </Field>
                            </div>

                            {/* Contact + submit */}
                            <div className="flex flex-col gap-6">
                                <div
                                    className="rounded-2xl p-7 sm:p-8 space-y-5 flex-1"
                                    style={{
                                        background: 'var(--card)',
                                        border: '1px solid var(--border)',
                                        boxShadow: '0 24px 60px -28px color-mix(in srgb, var(--foreground) 22%, transparent)',
                                    }}
                                >
                                    <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                                        <div
                                            className="flex h-9 w-9 items-center justify-center rounded-xl"
                                            style={{
                                                background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
                                                border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
                                                color: 'var(--primary)',
                                            }}
                                        >
                                            <User className="h-4 w-4" strokeWidth={1.6} />
                                        </div>
                                        <div>
                                            <p className="text-base" style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                                                Primary contact
                                            </p>
                                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                Who should we reach out to?
                                            </p>
                                        </div>
                                    </div>

                                    <Field label="Contact name" required error={errors.contact_name}>
                                        <Input
                                            id="contact_name"
                                            type="text"
                                            required
                                            value={data.contact_name}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('contact_name', e.target.value)}
                                            placeholder="Full name"
                                            aria-invalid={!!errors.contact_name}
                                        />
                                    </Field>

                                    <Field
                                        label={<span className="inline-flex items-center gap-1.5"><Mail className="h-3 w-3" /> Contact email</span>}
                                        required
                                        error={errors.contact_email}
                                    >
                                        <Input
                                            id="contact_email"
                                            type="email"
                                            required
                                            value={data.contact_email}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('contact_email', e.target.value)}
                                            placeholder="contact@company.com"
                                            aria-invalid={!!errors.contact_email}
                                        />
                                    </Field>

                                    <Field
                                        label={<span className="inline-flex items-center gap-1.5"><Phone className="h-3 w-3" /> Contact phone</span>}
                                        error={errors.contact_phone}
                                    >
                                        <Input
                                            id="contact_phone"
                                            type="tel"
                                            value={data.contact_phone}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('contact_phone', e.target.value)}
                                            placeholder="+1 (555) 000-0000"
                                            aria-invalid={!!errors.contact_phone}
                                        />
                                    </Field>

                                    <Field label="Additional message" error={errors.message}>
                                        <Textarea
                                            id="message"
                                            value={data.message}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('message', e.target.value)}
                                            placeholder="Any additional context or questions for the review team…"
                                            className="min-h-28"
                                        />
                                    </Field>
                                </div>

                                {/* Submit panel */}
                                <div
                                    className="rounded-2xl p-6 sm:p-7"
                                    style={{
                                        background: 'color-mix(in srgb, var(--primary) 5%, transparent)',
                                        border: '1px solid color-mix(in srgb, var(--primary) 18%, transparent)',
                                    }}
                                >
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                                        Your application will be reviewed by our administrators. You'll receive an email once a decision is made — typically within one business day.
                                    </p>

                                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-between">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={fillTestData}
                                        >
                                            Fill test data
                                        </Button>

                                        <Button type="submit" disabled={processing} className="px-6">
                                            {processing ? (
                                                <>
                                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                    Submitting…
                                                </>
                                            ) : (
                                                <>
                                                    Submit registration
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </section>

                {/* Footer */}
                <footer className="relative z-10" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
                        <div className="flex items-center gap-2">
                            <AppLogoIcon className="size-16" />
                            <span className="text-xs uppercase" style={{ color: 'var(--foreground)', letterSpacing: '0.28em', fontWeight: 600 }}>
                                GRC <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>· Charter</span>
                            </span>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                            Already registered?{' '}
                            <a href="/login" style={{ color: 'var(--primary)' }} className="underline-offset-4 hover:underline">
                                Log in →
                            </a>
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

function Field({
    label,
    required,
    error,
    children,
}: {
    label: React.ReactNode;
    required?: boolean;
    error?: string;
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
        </div>
    );
}
