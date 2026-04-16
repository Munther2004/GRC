import { Head } from '@inertiajs/react';
import { ShieldCheck, BarChart3, FileSearch, FolderOpen, ClipboardList, Users, Shield } from 'lucide-react';

const heatmapColors: string[][] = [
    ['rgba(64,138,113,0.4)', 'rgba(40,90,72,0.55)', 'rgba(139,38,53,0.6)', 'rgba(139,38,53,0.75)', 'rgba(139,38,53,0.9)'],
    ['rgba(176,228,204,0.35)', 'rgba(64,138,113,0.35)', 'rgba(40,90,72,0.5)', 'rgba(139,38,53,0.55)', 'rgba(139,38,53,0.75)'],
    ['rgba(176,228,204,0.35)', 'rgba(64,138,113,0.3)', 'rgba(64,138,113,0.35)', 'rgba(40,90,72,0.5)', 'rgba(139,38,53,0.55)'],
    ['rgba(176,228,204,0.3)', 'rgba(176,228,204,0.3)', 'rgba(64,138,113,0.3)', 'rgba(64,138,113,0.35)', 'rgba(40,90,72,0.45)'],
    ['rgba(176,228,204,0.25)', 'rgba(176,228,204,0.25)', 'rgba(176,228,204,0.3)', 'rgba(64,138,113,0.3)', 'rgba(64,138,113,0.35)'],
];

function DashboardCard() {
    return (
        <div className="relative mx-auto w-full max-w-105 lg:mr-0 lg:ml-auto">
            <div className="pointer-events-none absolute -inset-6 rounded-3xl blur-3xl" style={{ background: 'rgba(64,138,113,0.05)' }} />
            <div className="relative overflow-hidden rounded" style={{ border: '1px solid #285A48', background: '#0D1F1C', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid #285A48', background: 'rgba(9,20,19,0.8)' }}>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'rgba(139,38,53,0.6)' }} />
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'rgba(40,90,72,0.6)' }} />
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'rgba(176,228,204,0.6)' }} />
                    <div className="mx-3 flex h-5 flex-1 items-center rounded px-2.5" style={{ background: 'rgba(40,90,72,0.5)' }}>
                        <span className="font-display text-[9px] uppercase tracking-widest" style={{ color: '#7ABFA8' }}>grc.library/dashboard</span>
                    </div>
                </div>

                {/* Dashboard content */}
                <div className="space-y-3 p-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded p-4" style={{ border: '1px solid #285A48', background: 'rgba(9,20,19,0.6)' }}>
                            <p className="font-display mb-1 text-[9px] uppercase tracking-widest" style={{ color: '#7ABFA8' }}>Risk Score</p>
                            <p className="font-heading mb-2 text-4xl leading-none font-normal" style={{ color: '#408A71' }}>72</p>
                            <p className="font-display mb-2 text-[9px] uppercase tracking-wider" style={{ color: '#285A48' }}>▲ 4.2% vs last month</p>
                            <div className="h-0.5 w-full overflow-hidden rounded-full" style={{ background: 'rgba(40,90,72,0.5)' }}>
                                <div className="h-full rounded-full" style={{ width: '72%', background: '#285A48' }} />
                            </div>
                        </div>
                        <div className="rounded p-4" style={{ border: '1px solid #285A48', background: 'rgba(9,20,19,0.6)' }}>
                            <p className="font-display mb-1 text-[9px] uppercase tracking-widest" style={{ color: '#7ABFA8' }}>Compliance</p>
                            <p className="font-heading mb-3 text-4xl leading-none font-normal" style={{ color: '#B0E4CC' }}>94%</p>
                            <div className="space-y-1.5">
                                {[{ name: 'ISO 27001', pct: 94, color: '#B0E4CC' }, { name: 'NIST', pct: 88, color: '#B0E4CC' }, { name: 'OWASP', pct: 76, color: '#408A71' }].map(({ name, pct, color }) => (
                                    <div key={name} className="flex items-center justify-between">
                                        <span className="font-display text-[9px] uppercase tracking-wider" style={{ color: '#7ABFA8' }}>{name}</span>
                                        <span className="font-heading text-sm" style={{ color }}>{pct}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="rounded p-4" style={{ border: '1px solid #285A48', background: 'rgba(9,20,19,0.6)' }}>
                        <p className="font-display mb-3 text-[9px] uppercase tracking-widest" style={{ color: '#7ABFA8' }}>Risk Heat Map</p>
                        <div className="flex flex-col gap-1.5">
                            {heatmapColors.map((row, ri) => (
                                <div key={ri} className="flex gap-1.5">
                                    {row.map((color, ci) => (
                                        <div key={ci} className="aspect-square flex-1 rounded" style={{ background: color }} />
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
    { icon: BarChart3,    title: 'Risk Assessment',         desc: 'ISO 27005 likelihood × impact matrix with automatic risk scoring and treatment tracking.', color: '#408A71' },
    { icon: ClipboardList, title: 'Compliance Assessments', desc: 'Questionnaire-based compliance self-assessments with multi-framework support.',             color: '#285A48' },
    { icon: FileSearch,   title: 'Gap Analysis',            desc: 'Identify non-compliant and partially compliant controls across all your frameworks.',       color: '#B0E4CC' },
    { icon: FolderOpen,   title: 'Evidence Management',     desc: 'Upload, review, and approve compliance evidence files linked to specific controls.',        color: '#408A71' },
    { icon: ShieldCheck,  title: 'Audit Trail',             desc: 'Complete, tamper-evident log of all system activity for internal and external auditors.',   color: '#8B2635' },
    { icon: Users,        title: 'Role-Based Access',       desc: 'Granular Admin, Auditor, and User roles control what each team member can see and do.',    color: '#7ABFA8' },
];

const stats = [
    { value: '4',        label: 'Frameworks' },
    { value: '443+',     label: 'Controls' },
    { value: '3',        label: 'Roles' },
    { value: 'ISO 27005', label: 'Risk Methodology' },
];

const navLinks = [{ label: 'Features', href: '#features' }, { label: 'About', href: '/about' }, { label: 'Team', href: '/team' }];

export default function Welcome() {
    return (
        <>
            <Head title="GRC System — Risk clarity. Compliance confidence." />

            <div className="min-h-screen antialiased" style={{ background: '#091413', color: '#E0F5EC' }}>
                {/* Nav */}
                <header className="sticky top-0 z-40" style={{ background: 'rgba(9,20,19,0.92)', borderBottom: '1px solid #285A48', backdropFilter: 'blur(12px)' }}>
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded" style={{ background: 'rgba(64,138,113,0.08)', border: '1px solid rgba(64,138,113,0.4)' }}>
                                <Shield className="h-4 w-4" style={{ color: '#408A71' }} strokeWidth={1.5} />
                            </div>
                            <span className="font-display text-xs uppercase tracking-[0.25em]" style={{ color: '#E0F5EC' }}>GRC System</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {navLinks.map(({ label, href }) => (
                                <a key={label} href={href} className="font-display text-[10px] uppercase tracking-widest transition-colors" style={{ color: '#7ABFA8' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = '#408A71')}
                                    onMouseLeave={e => (e.currentTarget.style.color = '#7ABFA8')}
                                >
                                    {label}
                                </a>
                            ))}
                            <a href="/login" className="font-display text-[10px] uppercase tracking-widest px-4 py-2 rounded transition-colors" style={{ color: '#7ABFA8', border: '1px solid #285A48' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#408A71'; e.currentTarget.style.color = '#408A71'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#285A48'; e.currentTarget.style.color = '#7ABFA8'; }}
                            >
                                Log In
                            </a>
                            <a href="/corporation/register" className="font-display text-[10px] uppercase tracking-widest px-4 py-2 rounded transition-all" style={{ background: 'linear-gradient(135deg, #408A71, #285A48)', color: '#091413', boxShadow: '0 2px 8px rgba(64,138,113,0.3)' }}
                                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(64,138,113,0.45)')}
                                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(64,138,113,0.3)')}
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
                            <div className="mb-6 inline-flex items-center gap-2 rounded px-3 py-1.5" style={{ border: '1px solid rgba(64,138,113,0.3)', background: 'rgba(64,138,113,0.06)' }}>
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: '#408A71' }} />
                                <span className="font-display text-[10px] uppercase tracking-[0.15em]" style={{ color: '#408A71' }}>ISO 27001 · NIST · OWASP · CIS</span>
                            </div>

                            {/* Ornate divider */}
                            <div className="mb-8" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #285A48 30%, #408A71 50%, #285A48 70%, transparent)', position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', color: '#408A71', fontSize: '8px', background: '#091413', padding: '0 8px' }}>✶</span>
                            </div>

                            <h1 className="font-heading mb-6 text-5xl font-normal leading-tight lg:text-6xl" style={{ color: '#E0F5EC' }}>
                                Risk clarity.
                                <br />
                                <span style={{ color: '#408A71' }}>Compliance</span>
                                <br />
                                confidence.
                            </h1>
                            <p className="font-body mb-10 max-w-lg text-lg leading-relaxed italic" style={{ color: '#7ABFA8' }}>
                                The scholarly GRC platform for managing governance, risk, and compliance across ISO 27001, NIST 800-53, OWASP ASVS, and CIS Benchmarks.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <a href="/corporation/register" className="font-display inline-flex items-center gap-2 rounded px-6 py-3 text-[11px] uppercase tracking-[0.15em] transition-all"
                                    style={{ background: 'linear-gradient(135deg, #408A71, #285A48)', color: '#091413', boxShadow: '0 2px 8px rgba(64,138,113,0.3)' }}
                                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(64,138,113,0.5)')}
                                    onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(64,138,113,0.3)')}
                                >
                                    Register Your Corporation →
                                </a>
                                <a href="/login" className="font-display inline-flex items-center gap-2 rounded px-6 py-3 text-[11px] uppercase tracking-[0.15em] transition-colors"
                                    style={{ border: '1px solid #285A48', color: '#7ABFA8' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#408A71'; e.currentTarget.style.color = '#408A71'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#285A48'; e.currentTarget.style.color = '#7ABFA8'; }}
                                >
                                    Log In
                                </a>
                            </div>
                        </div>
                        <DashboardCard />
                    </div>
                </section>

                {/* Stats Bar */}
                <section style={{ borderTop: '1px solid #285A48', borderBottom: '1px solid #285A48', background: 'rgba(13,31,28,0.4)' }}>
                    <div className="mx-auto max-w-7xl px-6 py-10">
                        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                            {stats.map(({ value, label }) => (
                                <div key={label} className="text-center">
                                    <p className="font-heading mb-1 text-3xl font-normal" style={{ color: '#408A71' }}>{value}</p>
                                    <p className="font-display text-[9px] uppercase tracking-[0.2em]" style={{ color: '#7ABFA8' }}>{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="mx-auto max-w-7xl px-6 py-24">
                    <div className="mb-14 text-center">
                        <p className="font-display mb-3 text-[10px] uppercase tracking-[0.3em]" style={{ color: '#7ABFA8' }}>Disciplines</p>
                        <h2 className="font-heading mb-3 text-3xl font-normal" style={{ color: '#E0F5EC' }}>
                            Everything you need for GRC
                        </h2>
                        <p className="font-body mx-auto max-w-xl italic" style={{ color: '#7ABFA8' }}>
                            One platform to manage your entire governance, risk, and compliance programme — from risk register to audit evidence.
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {features.map(({ icon: Icon, title, desc, color }) => (
                            <div
                                key={title}
                                className="rounded p-6 transition-all duration-200"
                                style={{ border: '1px solid #285A48', background: '#0D1F1C' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(64,138,113,0.4)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#285A48'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <div className="inline-flex h-10 w-10 items-center justify-center rounded mb-4" style={{ background: 'rgba(64,138,113,0.08)', border: '1px solid rgba(64,138,113,0.25)' }}>
                                    <Icon className="h-5 w-5" style={{ color }} strokeWidth={1.5} />
                                </div>
                                <h3 className="font-heading mb-2 text-lg font-normal" style={{ color: '#E0F5EC' }}>{title}</h3>
                                <p className="font-body text-sm leading-relaxed italic" style={{ color: '#7ABFA8' }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="mx-auto max-w-7xl px-6 pb-24">
                    <div className="relative overflow-hidden rounded p-12 text-center" style={{ border: '1px solid rgba(64,138,113,0.3)', background: 'rgba(13,31,28,0.6)' }}>
                        <div className="pointer-events-none absolute top-0 left-1/2 h-32 w-96 -translate-x-1/2 rounded-full blur-3xl" style={{ background: 'rgba(64,138,113,0.05)' }} />
                        <div className="relative">
                            {/* Ornate divider */}
                            <div className="mx-auto mb-6 w-48" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #285A48 30%, #408A71 50%, #285A48 70%, transparent)', position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', color: '#408A71', fontSize: '8px', background: 'rgba(13,31,28,0.9)', padding: '0 8px' }}>✶</span>
                            </div>
                            <h2 className="font-heading mb-4 text-3xl font-normal" style={{ color: '#E0F5EC' }}>
                                Ready to take control of your GRC?
                            </h2>
                            <p className="font-body mx-auto mb-8 max-w-md italic" style={{ color: '#7ABFA8' }}>
                                Begin managing your risks and compliance. No setup fees, no complexity.
                            </p>
                            <a href="/corporation/register" className="font-display inline-flex items-center gap-2 rounded px-8 py-3.5 text-[11px] uppercase tracking-[0.15em] transition-all"
                                style={{ background: 'linear-gradient(135deg, #408A71, #285A48)', color: '#091413', boxShadow: '0 2px 8px rgba(64,138,113,0.3)' }}
                                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(64,138,113,0.5)')}
                                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(64,138,113,0.3)')}
                            >
                                Register Your Corporation →
                            </a>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer style={{ borderTop: '1px solid #285A48' }}>
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
                        <div>
                            <div className="mb-1 flex items-center gap-2">
                                <Shield className="h-4 w-4" style={{ color: '#408A71' }} strokeWidth={1.5} />
                                <span className="font-display text-xs uppercase tracking-[0.2em]" style={{ color: '#E0F5EC' }}>GRC System</span>
                            </div>
                            <p className="font-body text-xs italic" style={{ color: '#7ABFA8' }}>
                                Governance, Risk & Compliance — simplified.
                            </p>
                        </div>

                        <nav className="flex flex-wrap items-center gap-6">
                            {navLinks.map(({ label, href }) => (
                                <a key={label} href={href} className="font-display text-[10px] uppercase tracking-widest transition-colors" style={{ color: '#7ABFA8' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = '#408A71')}
                                    onMouseLeave={e => (e.currentTarget.style.color = '#7ABFA8')}
                                >
                                    {label}
                                </a>
                            ))}
                        </nav>

                        <p className="font-display text-[9px] uppercase tracking-wider" style={{ color: 'rgba(156,139,122,0.5)' }}>
                            © 2026 GRC System. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
