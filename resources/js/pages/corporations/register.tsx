import { Head, Link, useForm } from '@inertiajs/react';
import {
    Shield,
    Clock,
    Users,
    CheckCircle2,
    ArrowLeft,
    Building2,
    Globe,
    Mail,
    Phone,
    User,
    FileText,
    ChevronRight,
} from 'lucide-react';
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
    { n: '01', label: 'Register', desc: 'Submit your organisation details', icon: Shield },
    { n: '02', label: 'Review',   desc: 'Admin approves your application',  icon: Clock },
    { n: '03', label: 'Code',     desc: 'Receive your registration code',   icon: Users },
    { n: '04', label: 'Launch',   desc: 'Team onboards and starts using GRC', icon: CheckCircle2 },
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

            <div className="min-h-screen antialiased" style={{ background: '#091413', color: 'var(--foreground)' }}>

                {/* ── Nav ── */}
                <header
                    className="sticky top-0 z-40"
                    style={{ background: 'rgba(9,20,19,0.92)', borderBottom: '1px solid #285A48', backdropFilter: 'blur(12px)' }}
                >
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                        <Link href={route('home')} className="flex items-center gap-3 group">
                            <div
                                className="flex h-8 w-8 items-center justify-center rounded transition-colors"
                                style={{ background: 'rgba(64,138,113,0.08)', border: '1px solid rgba(64,138,113,0.4)' }}
                            >
                                <Shield className="h-4 w-4" style={{ color: '#408A71' }} strokeWidth={1.5} />
                            </div>
                            <span className="font-display text-xs uppercase tracking-[0.25em]" style={{ color: 'var(--foreground)' }}>
                                GRC System
                            </span>
                        </Link>

                        <Link
                            href={route('home')}
                            className="font-display flex items-center gap-1.5 text-[10px] uppercase tracking-widest transition-colors"
                            style={{ color: '#7ABFA8' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#408A71')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#7ABFA8')}
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back to home
                        </Link>
                    </div>
                </header>

                {/* ── Hero ── */}
                <section className="mx-auto max-w-7xl px-6 pt-16 pb-12">
                    <div className="text-center">
                        <div
                            className="mb-5 inline-flex items-center gap-2 rounded px-3 py-1.5"
                            style={{ border: '1px solid rgba(64,138,113,0.3)', background: 'rgba(64,138,113,0.06)' }}
                        >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#408A71' }} />
                            <span className="font-display text-[10px] uppercase tracking-[0.15em]" style={{ color: '#408A71' }}>
                                Corporate Registration
                            </span>
                        </div>

                        <h1 className="font-heading mb-3 text-4xl font-normal lg:text-5xl" style={{ color: 'var(--foreground)' }}>
                            Register Your Organisation
                        </h1>
                        <p className="font-body mx-auto max-w-xl text-base italic" style={{ color: '#7ABFA8' }}>
                            Onboard your organisation to the GRC platform. Once approved, your team will gain full
                            access to risk management, compliance assessments, and audit tooling.
                        </p>
                    </div>

                    {/* Ornate divider */}
                    <div
                        className="mx-auto mt-10 max-w-sm"
                        style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #285A48 30%, #408A71 50%, #285A48 70%, transparent)', position: 'relative' }}
                    >
                        <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', color: '#408A71', fontSize: '8px', background: '#091413', padding: '0 8px' }}>
                            ✶
                        </span>
                    </div>
                </section>

                {/* ── Process steps ── */}
                <section className="mx-auto max-w-7xl px-6 pb-12">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {steps.map(({ n, label, desc, icon: Icon }, i) => (
                            <div key={n} className="relative flex flex-col items-center text-center">
                                {/* connector line */}
                                {i < steps.length - 1 && (
                                    <div
                                        className="absolute top-5 left-1/2 hidden h-px md:block"
                                        style={{ width: 'calc(100% - 2.5rem)', marginLeft: '1.25rem', background: 'linear-gradient(90deg, #285A48, transparent)' }}
                                    />
                                )}
                                <div
                                    className="relative z-10 mb-3 flex h-10 w-10 items-center justify-center rounded-full"
                                    style={{ background: 'rgba(64,138,113,0.08)', border: '1px solid rgba(64,138,113,0.35)' }}
                                >
                                    <Icon className="h-4.5 w-4.5" style={{ color: '#408A71' }} strokeWidth={1.5} />
                                </div>
                                <span className="font-display mb-0.5 text-[9px] uppercase tracking-[0.2em]" style={{ color: 'rgba(64,138,113,0.5)' }}>
                                    {n}
                                </span>
                                <p className="font-heading text-sm font-normal" style={{ color: 'var(--foreground)' }}>{label}</p>
                                <p className="font-body mt-0.5 text-xs italic" style={{ color: '#7ABFA8' }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Form ── */}
                <section className="mx-auto max-w-7xl px-6 pb-24">
                    <form onSubmit={submit}>
                        <div className="grid gap-6 lg:grid-cols-2">

                            {/* ─ Left column: Corporation details ─ */}
                            <div
                                className="rounded p-8 space-y-6"
                                style={{ background: '#0D1F1C', border: '1px solid #285A48' }}
                            >
                                <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid #285A48' }}>
                                    <div
                                        className="flex h-8 w-8 items-center justify-center rounded"
                                        style={{ background: 'rgba(64,138,113,0.08)', border: '1px solid rgba(64,138,113,0.25)' }}
                                    >
                                        <Building2 className="h-4 w-4" style={{ color: '#408A71' }} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="font-heading text-base font-normal" style={{ color: 'var(--foreground)' }}>Organisation Details</p>
                                        <p className="font-body text-xs italic" style={{ color: '#7ABFA8' }}>Tell us about your company</p>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="company_name" className="font-display text-[10px] uppercase tracking-widest" style={{ color: '#7ABFA8' }}>
                                        Company Name <span style={{ color: '#408A71' }}>*</span>
                                    </Label>
                                    <Input
                                        id="company_name"
                                        type="text"
                                        required
                                        autoFocus
                                        value={data.company_name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('company_name', e.target.value)}
                                        placeholder="Acme Corporation"
                                        style={{ background: 'rgba(9,20,19,0.6)', borderColor: errors.company_name ? '#8B2635' : '#285A48', color: 'var(--foreground)' }}
                                        className="placeholder:text-[#285A48]"
                                    />
                                    {errors.company_name && <p className="font-body text-xs" style={{ color: '#8B2635' }}>{errors.company_name}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="email" className="font-display text-[10px] uppercase tracking-widest" style={{ color: '#7ABFA8' }}>
                                        <span className="inline-flex items-center gap-1.5"><Mail className="h-3 w-3" />Corporate Email <span style={{ color: '#408A71' }}>*</span></span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        value={data.email}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('email', e.target.value)}
                                        placeholder="corporate@company.com"
                                        style={{ background: 'rgba(9,20,19,0.6)', borderColor: errors.email ? '#8B2635' : '#285A48', color: 'var(--foreground)' }}
                                        className="placeholder:text-[#285A48]"
                                    />
                                    {errors.email && <p className="font-body text-xs" style={{ color: '#8B2635' }}>{errors.email}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="industry" className="font-display text-[10px] uppercase tracking-widest" style={{ color: '#7ABFA8' }}>
                                        Industry <span style={{ color: '#408A71' }}>*</span>
                                    </Label>
                                    <Select value={data.industry} onValueChange={(v: string) => setData('industry', v)}>
                                        <SelectTrigger
                                            style={{ background: 'rgba(9,20,19,0.6)', borderColor: errors.industry ? '#8B2635' : '#285A48', color: data.industry ? '#E0F5EC' : '#285A48' }}
                                        >
                                            <SelectValue placeholder="Select your industry" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(industries).map(([key, value]) => (
                                                <SelectItem key={key} value={key}>{value}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.industry && <p className="font-body text-xs" style={{ color: '#8B2635' }}>{errors.industry}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="website" className="font-display text-[10px] uppercase tracking-widest" style={{ color: '#7ABFA8' }}>
                                        <span className="inline-flex items-center gap-1.5"><Globe className="h-3 w-3" />Website</span>
                                    </Label>
                                    <Input
                                        id="website"
                                        type="url"
                                        value={data.website}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('website', e.target.value)}
                                        placeholder="https://www.company.com"
                                        style={{ background: 'rgba(9,20,19,0.6)', borderColor: errors.website ? '#8B2635' : '#285A48', color: 'var(--foreground)' }}
                                        className="placeholder:text-[#285A48]"
                                    />
                                    {errors.website && <p className="font-body text-xs" style={{ color: '#8B2635' }}>{errors.website}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="description" className="font-display text-[10px] uppercase tracking-widest" style={{ color: '#7ABFA8' }}>
                                        <span className="inline-flex items-center gap-1.5"><FileText className="h-3 w-3" />Description</span>
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                        placeholder="Brief description of your company and compliance needs…"
                                        className="min-h-28 placeholder:text-[#285A48] resize-none"
                                        style={{ background: 'rgba(9,20,19,0.6)', borderColor: errors.description ? '#8B2635' : '#285A48', color: 'var(--foreground)' }}
                                    />
                                    {errors.description && <p className="font-body text-xs" style={{ color: '#8B2635' }}>{errors.description}</p>}
                                </div>
                            </div>

                            {/* ─ Right column: Contact info + submit ─ */}
                            <div className="flex flex-col gap-6">
                                <div
                                    className="rounded p-8 space-y-6 flex-1"
                                    style={{ background: '#0D1F1C', border: '1px solid #285A48' }}
                                >
                                    <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid #285A48' }}>
                                        <div
                                            className="flex h-8 w-8 items-center justify-center rounded"
                                            style={{ background: 'rgba(64,138,113,0.08)', border: '1px solid rgba(64,138,113,0.25)' }}
                                        >
                                            <User className="h-4 w-4" style={{ color: '#408A71' }} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <p className="font-heading text-base font-normal" style={{ color: 'var(--foreground)' }}>Primary Contact</p>
                                            <p className="font-body text-xs italic" style={{ color: '#7ABFA8' }}>Who should we reach out to?</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="contact_name" className="font-display text-[10px] uppercase tracking-widest" style={{ color: '#7ABFA8' }}>
                                            Contact Name <span style={{ color: '#408A71' }}>*</span>
                                        </Label>
                                        <Input
                                            id="contact_name"
                                            type="text"
                                            required
                                            value={data.contact_name}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('contact_name', e.target.value)}
                                            placeholder="Full name"
                                            style={{ background: 'rgba(9,20,19,0.6)', borderColor: errors.contact_name ? '#8B2635' : '#285A48', color: 'var(--foreground)' }}
                                            className="placeholder:text-[#285A48]"
                                        />
                                        {errors.contact_name && <p className="font-body text-xs" style={{ color: '#8B2635' }}>{errors.contact_name}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="contact_email" className="font-display text-[10px] uppercase tracking-widest" style={{ color: '#7ABFA8' }}>
                                            <span className="inline-flex items-center gap-1.5"><Mail className="h-3 w-3" />Contact Email <span style={{ color: '#408A71' }}>*</span></span>
                                        </Label>
                                        <Input
                                            id="contact_email"
                                            type="email"
                                            required
                                            value={data.contact_email}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('contact_email', e.target.value)}
                                            placeholder="contact@company.com"
                                            style={{ background: 'rgba(9,20,19,0.6)', borderColor: errors.contact_email ? '#8B2635' : '#285A48', color: 'var(--foreground)' }}
                                            className="placeholder:text-[#285A48]"
                                        />
                                        {errors.contact_email && <p className="font-body text-xs" style={{ color: '#8B2635' }}>{errors.contact_email}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="contact_phone" className="font-display text-[10px] uppercase tracking-widest" style={{ color: '#7ABFA8' }}>
                                            <span className="inline-flex items-center gap-1.5"><Phone className="h-3 w-3" />Contact Phone</span>
                                        </Label>
                                        <Input
                                            id="contact_phone"
                                            type="tel"
                                            value={data.contact_phone}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('contact_phone', e.target.value)}
                                            placeholder="+1 (555) 000-0000"
                                            style={{ background: 'rgba(9,20,19,0.6)', borderColor: errors.contact_phone ? '#8B2635' : '#285A48', color: 'var(--foreground)' }}
                                            className="placeholder:text-[#285A48]"
                                        />
                                        {errors.contact_phone && <p className="font-body text-xs" style={{ color: '#8B2635' }}>{errors.contact_phone}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="message" className="font-display text-[10px] uppercase tracking-widest" style={{ color: '#7ABFA8' }}>
                                            Additional Message
                                        </Label>
                                        <Textarea
                                            id="message"
                                            value={data.message}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('message', e.target.value)}
                                            placeholder="Any additional context or questions for the review team…"
                                            className="min-h-28 placeholder:text-[#285A48] resize-none"
                                            style={{ background: 'rgba(9,20,19,0.6)', borderColor: errors.message ? '#8B2635' : '#285A48', color: 'var(--foreground)' }}
                                        />
                                        {errors.message && <p className="font-body text-xs" style={{ color: '#8B2635' }}>{errors.message}</p>}
                                    </div>
                                </div>

                                {/* ─ Submit panel ─ */}
                                <div
                                    className="rounded p-6 space-y-4"
                                    style={{ background: 'rgba(64,138,113,0.04)', border: '1px solid rgba(64,138,113,0.2)' }}
                                >
                                    <p className="font-body text-sm italic leading-relaxed" style={{ color: '#7ABFA8' }}>
                                        Your application will be reviewed by our administrators. You'll receive an email once a decision is made — typically within one business day.
                                    </p>

                                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={fillTestData}
                                            className="font-display text-[10px] uppercase tracking-widest"
                                            style={{ borderColor: '#285A48', color: '#7ABFA8', background: 'transparent' }}
                                        >
                                            Fill Test Data
                                        </Button>

                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="font-display inline-flex items-center justify-center gap-2 rounded px-8 py-3 text-[11px] uppercase tracking-[0.15em] transition-all disabled:opacity-60"
                                            style={{ background: 'linear-gradient(135deg, #408A71, #285A48)', color: '#091413', boxShadow: '0 2px 8px rgba(64,138,113,0.3)' }}
                                            onMouseEnter={e => { if (!processing) e.currentTarget.style.boxShadow = '0 4px 20px rgba(64,138,113,0.5)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(64,138,113,0.3)'; }}
                                        >
                                            {processing ? (
                                                <>
                                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                    Submitting…
                                                </>
                                            ) : (
                                                <>
                                                    Submit Registration
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </section>

                {/* ── Footer ── */}
                <footer style={{ borderTop: '1px solid #285A48' }}>
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" style={{ color: '#408A71' }} strokeWidth={1.5} />
                            <span className="font-display text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--foreground)' }}>GRC System</span>
                        </div>
                        <p className="font-body text-xs italic" style={{ color: '#7ABFA8' }}>
                            Already registered?{' '}
                            <a href="/login" style={{ color: '#408A71' }}>Log in to your account →</a>
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
