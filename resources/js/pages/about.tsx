import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Globe,
    Lock,
    Server,
    Shield,
    ShieldCheck,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

const frameworks = [
    {
        name: 'ISO 27001',
        icon: Lock,
        desc: 'International standard for information security management systems (ISMS). Defines requirements for establishing, implementing, and continuously improving information security.',
    },
    {
        name: 'NIST 800-53',
        icon: Server,
        desc: 'NIST Special Publication providing a catalogue of security and privacy controls for federal information systems, widely adopted by private sector organisations.',
    },
    {
        name: 'OWASP ASVS',
        icon: Globe,
        desc: 'Application Security Verification Standard — a framework for testing web application security controls and a basis for secure development.',
    },
    {
        name: 'CIS Benchmarks',
        icon: Shield,
        desc: 'Center for Internet Security benchmarks provide prescriptive configuration guidance for hardening operating systems, cloud platforms, and software.',
    },
];

export default function About() {
    return (
        <>
            <Head title="About — GRC System" />
            <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground antialiased">
                {/* Mesh + grid background */}
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
                    <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
                        <Link href="/" className="flex items-center gap-3">
                            <span
                                className="flex h-8 w-8 items-center justify-center rounded-lg"
                                style={{ background: 'var(--foreground)', color: 'var(--background)' }}
                            >
                                <Shield className="h-4 w-4" strokeWidth={1.8} />
                            </span>
                            <span className="text-[12px] uppercase" style={{ color: 'var(--foreground)', letterSpacing: '0.28em', fontWeight: 600 }}>
                                GRC<span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}> · Charter</span>
                            </span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <ThemeToggle compact />
                            <Link
                                href="/"
                                className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[12px] transition-colors"
                                style={{ color: 'var(--foreground)', borderColor: 'var(--border)' }}
                            >
                                <ArrowLeft className="h-3.5 w-3.5" /> Home
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="relative z-10 mx-auto max-w-5xl space-y-16 px-6 py-16">
                    {/* Hero */}
                    <div className="text-center">
                        <div
                            className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px]"
                            style={{
                                background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
                                color: 'var(--primary)',
                                border: '1px solid color-mix(in srgb, var(--primary) 24%, transparent)',
                            }}
                        >
                            <BookOpen className="h-3.5 w-3.5" />
                            Graduation Project · PSUT 2025/2026
                        </div>
                        <h1
                            className="mb-5 text-4xl tracking-[-0.02em] sm:text-5xl lg:text-6xl"
                            style={{ color: 'var(--foreground)', fontWeight: 500, lineHeight: 1.05 }}
                        >
                            About this{' '}
                            <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>charter.</span>
                        </h1>
                        <p
                            className="mx-auto max-w-2xl text-base leading-relaxed sm:text-lg"
                            style={{ color: 'var(--muted-foreground)' }}
                        >
                            A graduation project developed at{' '}
                            <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                                Princess Sumaya University for Technology (PSUT)
                            </span>
                            , Faculty of Computer Engineering. Built to demonstrate a fully functional governance, risk, and compliance management system using modern web technologies.
                        </p>
                    </div>

                    {/* What is GRC */}
                    <div
                        className="rounded-2xl p-8"
                        style={{
                            background: 'var(--card)',
                            border: '1px solid var(--border)',
                            boxShadow: '0 24px 60px -28px color-mix(in srgb, var(--foreground) 22%, transparent)',
                        }}
                    >
                        <p className="mb-5 text-[11px] uppercase" style={{ color: 'var(--primary)', letterSpacing: '0.4em' }}>
                            The Discipline
                        </p>
                        <h2
                            className="mb-5 text-2xl tracking-[-0.01em]"
                            style={{ color: 'var(--foreground)', fontWeight: 500 }}
                        >
                            What is GRC?
                        </h2>
                        <p className="mb-6 text-base leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                            <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                                Governance, Risk &amp; Compliance (GRC)
                            </span>{' '}
                            is an integrated approach that helps organisations align their IT infrastructure with business objectives, manage uncertainty, and act with integrity.
                        </p>
                        <ul className="space-y-4">
                            {[
                                { term: 'Governance', def: 'Ensures that organisational activities align with business goals through policies, processes, and decision-making frameworks.' },
                                { term: 'Risk management', def: "Identifies, assesses, and mitigates threats that could affect the organisation's ability to achieve its objectives." },
                                { term: 'Compliance', def: 'Confirms that the organisation meets all relevant laws, regulations, and industry standards.' },
                            ].map(({ term, def }) => (
                                <li key={term} className="flex gap-3">
                                    <span
                                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                                        style={{ background: 'var(--primary)' }}
                                    />
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                                        <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>{term} — </span>
                                        {def}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Frameworks */}
                    <div>
                        <p className="mb-4 text-[11px] uppercase" style={{ color: 'var(--primary)', letterSpacing: '0.4em' }}>
                            Frameworks Supported
                        </p>
                        <h2
                            className="mb-8 text-3xl tracking-[-0.01em]"
                            style={{ color: 'var(--foreground)', fontWeight: 500 }}
                        >
                            Four standards. <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>One ledger.</span>
                        </h2>
                        <div className="grid gap-5 md:grid-cols-2">
                            {frameworks.map(({ name, icon: Icon, desc }) => (
                                <div
                                    key={name}
                                    className="rounded-2xl p-7 transition-all duration-200"
                                    style={{
                                        background: 'var(--card)',
                                        border: '1px solid var(--border)',
                                        boxShadow: '0 10px 30px -16px color-mix(in srgb, var(--foreground) 18%, transparent)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 24px 60px -28px color-mix(in srgb, var(--foreground) 28%, transparent)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = '';
                                        e.currentTarget.style.boxShadow = '0 10px 30px -16px color-mix(in srgb, var(--foreground) 18%, transparent)';
                                    }}
                                >
                                    <div
                                        className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                                        style={{
                                            background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
                                            border: '1px solid color-mix(in srgb, var(--primary) 22%, transparent)',
                                            color: 'var(--primary)',
                                        }}
                                    >
                                        <Icon className="h-5 w-5" strokeWidth={1.6} />
                                    </div>
                                    <h3 className="mb-2 text-lg" style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                                        {name}
                                    </h3>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                                        {desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                <footer className="relative z-10 mt-16" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                            <span className="text-xs uppercase" style={{ color: 'var(--foreground)', letterSpacing: '0.28em', fontWeight: 600 }}>
                                GRC <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>· Charter</span>
                            </span>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            © Twenty Twenty-Six · GRC Charter · All rights reserved
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
