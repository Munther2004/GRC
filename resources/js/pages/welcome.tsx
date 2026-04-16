import { Head } from '@inertiajs/react';
import { ShieldCheck, BarChart3, FileSearch, FolderOpen, ClipboardList, Users, Shield } from 'lucide-react';

function DashboardCard() {
    return (
        <div className="relative mx-auto w-full max-w-[420px] lg:mr-0 lg:ml-auto">
            <div
                className="pointer-events-none absolute -inset-6 rounded-3xl blur-3xl"
                style={{ background: 'color-mix(in srgb, var(--primary) 5%, transparent)' }}
            />
            <div
                className="relative overflow-hidden rounded"
                style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
            >
                {/* Browser chrome */}
                <div
                    className="flex items-center gap-2 px-4 py-3"
                    style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.3)' }}
                >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'color-mix(in srgb, var(--destructive) 60%, transparent)' }} />
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'color-mix(in srgb, var(--border) 60%, transparent)' }} />
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'color-mix(in srgb, var(--primary) 60%, transparent)' }} />
                    <div
                        className="mx-3 flex h-5 flex-1 items-center rounded px-2.5"
                        style={{ background: 'color-mix(in srgb, var(--border) 50%, transparent)' }}
                    >
                        <span className="font-display text-[9px] uppercase tracking-widest text-muted-foreground">grc.system/dashboard</span>
                    </div>
                </div>

                {/* Dashboard content */}
                <div className="space-y-3 p-4" style={{ background: 'var(--background)' }}>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                            <p className="font-display mb-1 text-[9px] uppercase tracking-widest text-muted-foreground">Risk Score</p>
                            <p className="font-heading mb-2 text-4xl leading-none font-normal" style={{ color: 'var(--primary)' }}>72</p>
                            <p className="font-display mb-2 text-[9px] uppercase tracking-wider text-muted-foreground opacity-60">▲ 4.2% vs last month</p>
                            <div className="h-0.5 w-full overflow-hidden rounded-full" style={{ background: 'color-mix(in srgb, var(--border) 50%, transparent)' }}>
                                <div className="h-full rounded-full" style={{ width: '72%', background: 'var(--primary)' }} />
                            </div>
                        </div>
                        <div className="rounded p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                            <p className="font-display mb-1 text-[9px] uppercase tracking-widest text-muted-foreground">Compliance</p>
                            <p className="font-heading mb-3 text-4xl leading-none font-normal" style={{ color: 'var(--chart-1)' }}>94%</p>
                            <div className="space-y-1.5">
                                {[{ name: 'ISO 27001', pct: 94 }, { name: 'NIST', pct: 88 }, { name: 'OWASP', pct: 76 }].map(({ name, pct }) => (
                                    <div key={name} className="flex items-center justify-between">
                                        <span className="font-display text-[9px] uppercase tracking-wider text-muted-foreground">{name}</span>
                                        <span className="font-heading text-sm" style={{ color: 'var(--primary)' }}>{pct}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Heat map */}
                    <div className="rounded p-4" style={{ border: '1px solid var(--border)', background: 'color-mix(in srgb, var(--background) 60%, transparent)' }}>
                        <p className="font-display mb-3 text-[9px] uppercase tracking-widest text-muted-foreground">Risk Heat Map</p>
                        <div className="flex flex-col gap-1.5">
                            {[
                                [0.4, 0.55, 0.6, 0.75, 0.9],
                                [0.35, 0.35, 0.5, 0.55, 0.75],
                                [0.3, 0.3, 0.35, 0.5, 0.55],
                                [0.25, 0.25, 0.3, 0.35, 0.45],
                                [0.2, 0.2, 0.25, 0.3, 0.35],
                            ].map((row, ri) => (
                                <div key={ri} className="flex gap-1.5">
                                    {row.map((op, ci) => (
                                        <div
                                            key={ci}
                                            className="aspect-square flex-1 rounded"
                                            style={{
                                                background: op > 0.5
                                                    ? `color-mix(in srgb, var(--destructive) ${Math.round(op * 100)}%, transparent)`
                                                    : `color-mix(in srgb, var(--primary) ${Math.round(op * 100)}%, transparent)`,
                                            }}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const features = [
    { icon: BarChart3,     title: 'Risk Assessment',         desc: 'ISO 27005 likelihood × impact matrix with automatic risk scoring and treatment tracking.' },
    { icon: ClipboardList, title: 'Compliance Assessments',  desc: 'Questionnaire-based compliance self-assessments with multi-framework support.' },
    { icon: FileSearch,    title: 'Gap Analysis',            desc: 'Identify non-compliant and partially compliant controls across all your frameworks.' },
    { icon: FolderOpen,    title: 'Evidence Management',     desc: 'Upload, review, and approve compliance evidence files linked to specific controls.' },
    { icon: ShieldCheck,   title: 'Audit Trail',             desc: 'Complete, tamper-evident log of all system activity for internal and external auditors.' },
    { icon: Users,         title: 'Role-Based Access',       desc: 'Granular Admin, Auditor, and User roles control what each team member can see and do.' },
];

const stats = [
    { value: '4',         label: 'Frameworks' },
    { value: '443+',      label: 'Controls' },
    { value: '3',         label: 'Roles' },
    { value: 'ISO 27005', label: 'Risk Methodology' },
];

const navLinks = [{ label: 'Features', href: '#features' }, { label: 'About', href: '/about' }];

export default function Welcome() {
    return (
        <>
            <Head title="GRC System — Risk clarity. Compliance confidence." />

            <div className="min-h-screen antialiased" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>

                {/* Nav */}
                <header
                    className="sticky top-0 z-40"
                    style={{
                        background: 'color-mix(in srgb, var(--background) 92%, transparent)',
                        borderBottom: '1px solid var(--border)',
                        backdropFilter: 'blur(12px)',
                    }}
                >
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <div
                                className="flex h-8 w-8 items-center justify-center rounded"
                                style={{
                                    background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                                    border: '1px solid color-mix(in srgb, var(--primary) 40%, transparent)',
                                }}
                            >
                                <Shield className="h-4 w-4" style={{ color: 'var(--primary)' }} strokeWidth={1.5} />
                            </div>
                            <span className="font-display text-xs uppercase tracking-[0.25em]" style={{ color: 'var(--foreground)' }}>GRC System</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {navLinks.map(({ label, href }) => (
                                <a
                                    key={label} href={href}
                                    className="font-display text-[10px] uppercase tracking-widest transition-colors"
                                    style={{ color: 'var(--muted-foreground)' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                                >
                                    {label}
                                </a>
                            ))}
                            <a
                                href="/login"
                                className="font-display text-[10px] uppercase tracking-widest px-4 py-2 rounded transition-colors"
                                style={{ color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted-foreground)'; }}
                            >
                                Log In
                            </a>
                            <a
                                href="/corporation/register"
                                className="font-display text-[10px] uppercase tracking-widest px-4 py-2 rounded transition-all"
                                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', boxShadow: '0 2px 8px color-mix(in srgb, var(--primary) 30%, transparent)' }}
                                onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
                                onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
                            >
                                Register Your Corporation
                            </a>
                        </div>
                    </div>
                </header>

                {/* Hero */}
                <section className="mx-auto max-w-7xl px-6 pt-24 pb-20">
                    <div className="grid items-center gap-16 lg:grid-cols-2">
                        <div>
                            <div
                                className="mb-6 inline-flex items-center gap-2 rounded px-3 py-1.5"
                                style={{
                                    border: '1px solid color-mix(in srgb, var(--primary) 30%, transparent)',
                                    background: 'color-mix(in srgb, var(--primary) 6%, transparent)',
                                }}
                            >
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: 'var(--primary)' }} />
                                <span className="font-display text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--primary)' }}>
                                    ISO 27001 · NIST · OWASP · CIS
                                </span>
                            </div>

                            <div
                                className="mb-8"
                                style={{
                                    height: '1px',
                                    background: 'linear-gradient(90deg, transparent, var(--border) 30%, var(--primary) 50%, var(--border) 70%, transparent)',
                                    position: 'relative',
                                }}
                            >
                                <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', color: 'var(--primary)', fontSize: '8px', background: 'var(--background)', padding: '0 8px' }}>✶</span>
                            </div>

                            <h1 className="font-heading mb-6 text-5xl font-normal leading-tight lg:text-6xl" style={{ color: 'var(--foreground)' }}>
                                Risk clarity.
                                <br />
                                <span style={{ color: 'var(--primary)' }}>Compliance</span>
                                <br />
                                confidence.
                            </h1>
                            <p className="font-body mb-10 max-w-lg text-lg leading-relaxed italic" style={{ color: 'var(--muted-foreground)' }}>
                                The scholarly GRC platform for managing governance, risk, and compliance across ISO 27001, NIST 800-53, OWASP ASVS, and CIS Benchmarks.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <a
                                    href="/corporation/register"
                                    className="font-display inline-flex items-center gap-2 rounded px-6 py-3 text-[11px] uppercase tracking-[0.15em] transition-all"
                                    style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', boxShadow: '0 2px 8px color-mix(in srgb, var(--primary) 30%, transparent)' }}
                                    onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
                                    onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
                                >
                                    Register Your Corporation →
                                </a>
                                <a
                                    href="/login"
                                    className="font-display inline-flex items-center gap-2 rounded px-6 py-3 text-[11px] uppercase tracking-[0.15em] transition-colors"
                                    style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted-foreground)'; }}
                                >
                                    Log In
                                </a>
                            </div>
                        </div>
                        <DashboardCard />
                    </div>
                </section>

                {/* Stats Bar */}
                <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'color-mix(in srgb, var(--card) 40%, transparent)' }}>
                    <div className="mx-auto max-w-7xl px-6 py-10">
                        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                            {stats.map(({ value, label }) => (
                                <div key={label} className="text-center">
                                    <p className="font-heading mb-1 text-3xl font-normal" style={{ color: 'var(--primary)' }}>{value}</p>
                                    <p className="font-display text-[9px] uppercase tracking-[0.2em]" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="mx-auto max-w-7xl px-6 py-24">
                    <div className="mb-14 text-center">
                        <p className="font-display mb-3 text-[10px] uppercase tracking-[0.3em]" style={{ color: 'var(--muted-foreground)' }}>Disciplines</p>
                        <h2 className="font-heading mb-3 text-3xl font-normal" style={{ color: 'var(--foreground)' }}>Everything you need for GRC</h2>
                        <p className="font-body mx-auto max-w-xl italic" style={{ color: 'var(--muted-foreground)' }}>
                            One platform to manage your entire governance, risk, and compliance programme.
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {features.map(({ icon: Icon, title, desc }) => (
                            <div
                                key={title}
                                className="rounded p-6 transition-all duration-200"
                                style={{ border: '1px solid var(--border)', background: 'var(--card)' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--primary) 40%, transparent)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <div
                                    className="inline-flex h-10 w-10 items-center justify-center rounded mb-4"
                                    style={{
                                        background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                                        border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
                                    }}
                                >
                                    <Icon className="h-5 w-5" style={{ color: 'var(--primary)' }} strokeWidth={1.5} />
                                </div>
                                <h3 className="font-heading mb-2 text-lg font-normal" style={{ color: 'var(--foreground)' }}>{title}</h3>
                                <p className="font-body text-sm leading-relaxed italic" style={{ color: 'var(--muted-foreground)' }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="mx-auto max-w-7xl px-6 pb-24">
                    <div
                        className="relative overflow-hidden rounded p-12 text-center"
                        style={{
                            border: '1px solid color-mix(in srgb, var(--primary) 30%, transparent)',
                            background: 'color-mix(in srgb, var(--card) 60%, transparent)',
                        }}
                    >
                        <div
                            className="pointer-events-none absolute top-0 left-1/2 h-32 w-96 -translate-x-1/2 rounded-full blur-3xl"
                            style={{ background: 'color-mix(in srgb, var(--primary) 5%, transparent)' }}
                        />
                        <div className="relative">
                            <div
                                className="mx-auto mb-6 w-48"
                                style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--border) 30%, var(--primary) 50%, var(--border) 70%, transparent)', position: 'relative' }}
                            >
                                <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', color: 'var(--primary)', fontSize: '8px', background: 'var(--card)', padding: '0 8px' }}>✶</span>
                            </div>
                            <h2 className="font-heading mb-4 text-3xl font-normal" style={{ color: 'var(--foreground)' }}>
                                Ready to take control of your GRC?
                            </h2>
                            <p className="font-body mx-auto mb-8 max-w-md italic" style={{ color: 'var(--muted-foreground)' }}>
                                Begin managing your risks and compliance. No setup fees, no complexity.
                            </p>
                            <a
                                href="/corporation/register"
                                className="font-display inline-flex items-center gap-2 rounded px-8 py-3.5 text-[11px] uppercase tracking-[0.15em] transition-all"
                                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', boxShadow: '0 2px 8px color-mix(in srgb, var(--primary) 30%, transparent)' }}
                                onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
                                onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
                            >
                                Register Your Corporation →
                            </a>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
                        <div>
                            <div className="mb-1 flex items-center gap-2">
                                <Shield className="h-4 w-4" style={{ color: 'var(--primary)' }} strokeWidth={1.5} />
                                <span className="font-display text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--foreground)' }}>GRC System</span>
                            </div>
                            <p className="font-body text-xs italic" style={{ color: 'var(--muted-foreground)' }}>
                                Governance, Risk & Compliance — simplified.
                            </p>
                        </div>
                        <nav className="flex flex-wrap items-center gap-6">
                            {navLinks.map(({ label, href }) => (
                                <a
                                    key={label} href={href}
                                    className="font-display text-[10px] uppercase tracking-widest transition-colors"
                                    style={{ color: 'var(--muted-foreground)' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                                >
                                    {label}
                                </a>
                            ))}
                        </nav>
                        <p className="font-display text-[9px] uppercase tracking-wider" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }}>
                            © 2026 GRC System. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
