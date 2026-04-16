import { Head } from '@inertiajs/react';
import { ShieldCheck, BarChart3, FileSearch, FolderOpen, ClipboardList, Users, Shield } from 'lucide-react';

const heatmapColors: string[][] = [
    ['rgba(201,169,98,0.4)', 'rgba(176,120,64,0.55)', 'rgba(139,38,53,0.6)', 'rgba(139,38,53,0.75)', 'rgba(139,38,53,0.9)'],
    ['rgba(139,158,107,0.35)', 'rgba(201,169,98,0.35)', 'rgba(176,120,64,0.5)', 'rgba(139,38,53,0.55)', 'rgba(139,38,53,0.75)'],
    ['rgba(139,158,107,0.35)', 'rgba(201,169,98,0.3)', 'rgba(201,169,98,0.35)', 'rgba(176,120,64,0.5)', 'rgba(139,38,53,0.55)'],
    ['rgba(139,158,107,0.3)', 'rgba(139,158,107,0.3)', 'rgba(201,169,98,0.3)', 'rgba(201,169,98,0.35)', 'rgba(176,120,64,0.45)'],
    ['rgba(139,158,107,0.25)', 'rgba(139,158,107,0.25)', 'rgba(139,158,107,0.3)', 'rgba(201,169,98,0.3)', 'rgba(201,169,98,0.35)'],
];

function DashboardCard() {
    return (
        <div className="relative mx-auto w-full max-w-105 lg:mr-0 lg:ml-auto">
            <div className="pointer-events-none absolute -inset-6 rounded-3xl blur-3xl" style={{ background: 'rgba(201,169,98,0.05)' }} />
            <div className="relative overflow-hidden rounded" style={{ border: '1px solid #4A3F35', background: '#251E19', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid #4A3F35', background: 'rgba(28,23,20,0.8)' }}>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'rgba(139,38,53,0.6)' }} />
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'rgba(176,120,64,0.6)' }} />
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'rgba(139,158,107,0.6)' }} />
                    <div className="mx-3 flex h-5 flex-1 items-center rounded px-2.5" style={{ background: 'rgba(74,63,53,0.5)' }}>
                        <span className="font-display text-[9px] uppercase tracking-widest" style={{ color: '#9C8B7A' }}>grc.library/dashboard</span>
                    </div>
                </div>

                {/* Dashboard content */}
                <div className="space-y-3 p-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded p-4" style={{ border: '1px solid #4A3F35', background: 'rgba(28,23,20,0.6)' }}>
                            <p className="font-display mb-1 text-[9px] uppercase tracking-widest" style={{ color: '#9C8B7A' }}>Risk Score</p>
                            <p className="font-heading mb-2 text-4xl leading-none font-normal" style={{ color: '#C9A962' }}>72</p>
                            <p className="font-display mb-2 text-[9px] uppercase tracking-wider" style={{ color: '#B07840' }}>▲ 4.2% vs last month</p>
                            <div className="h-0.5 w-full overflow-hidden rounded-full" style={{ background: 'rgba(74,63,53,0.5)' }}>
                                <div className="h-full rounded-full" style={{ width: '72%', background: '#B07840' }} />
                            </div>
                        </div>
                        <div className="rounded p-4" style={{ border: '1px solid #4A3F35', background: 'rgba(28,23,20,0.6)' }}>
                            <p className="font-display mb-1 text-[9px] uppercase tracking-widest" style={{ color: '#9C8B7A' }}>Compliance</p>
                            <p className="font-heading mb-3 text-4xl leading-none font-normal" style={{ color: '#8B9E6B' }}>94%</p>
                            <div className="space-y-1.5">
                                {[{ name: 'ISO 27001', pct: 94, color: '#8B9E6B' }, { name: 'NIST', pct: 88, color: '#8B9E6B' }, { name: 'OWASP', pct: 76, color: '#C9A962' }].map(({ name, pct, color }) => (
                                    <div key={name} className="flex items-center justify-between">
                                        <span className="font-display text-[9px] uppercase tracking-wider" style={{ color: '#9C8B7A' }}>{name}</span>
                                        <span className="font-heading text-sm" style={{ color }}>{pct}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="rounded p-4" style={{ border: '1px solid #4A3F35', background: 'rgba(28,23,20,0.6)' }}>
                        <p className="font-display mb-3 text-[9px] uppercase tracking-widest" style={{ color: '#9C8B7A' }}>Risk Heat Map</p>
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
    { icon: BarChart3,    title: 'Risk Assessment',         desc: 'ISO 27005 likelihood × impact matrix with automatic risk scoring and treatment tracking.', color: '#C9A962' },
    { icon: ClipboardList, title: 'Compliance Assessments', desc: 'Questionnaire-based compliance self-assessments with multi-framework support.',             color: '#B07840' },
    { icon: FileSearch,   title: 'Gap Analysis',            desc: 'Identify non-compliant and partially compliant controls across all your frameworks.',       color: '#8B9E6B' },
    { icon: FolderOpen,   title: 'Evidence Management',     desc: 'Upload, review, and approve compliance evidence files linked to specific controls.',        color: '#C9A962' },
    { icon: ShieldCheck,  title: 'Audit Trail',             desc: 'Complete, tamper-evident log of all system activity for internal and external auditors.',   color: '#8B2635' },
    { icon: Users,        title: 'Role-Based Access',       desc: 'Granular Admin, Auditor, and User roles control what each team member can see and do.',    color: '#9C8B7A' },
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

            <div className="min-h-screen antialiased" style={{ background: '#1C1714', color: '#E8DFD4' }}>
                {/* Nav */}
                <header className="sticky top-0 z-40" style={{ background: 'rgba(28,23,20,0.92)', borderBottom: '1px solid #4A3F35', backdropFilter: 'blur(12px)' }}>
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded" style={{ background: 'rgba(201,169,98,0.08)', border: '1px solid rgba(201,169,98,0.4)' }}>
                                <Shield className="h-4 w-4" style={{ color: '#C9A962' }} strokeWidth={1.5} />
                            </div>
                            <span className="font-display text-xs uppercase tracking-[0.25em]" style={{ color: '#E8DFD4' }}>GRC System</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {navLinks.map(({ label, href }) => (
                                <a key={label} href={href} className="font-display text-[10px] uppercase tracking-widest transition-colors" style={{ color: '#9C8B7A' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = '#C9A962')}
                                    onMouseLeave={e => (e.currentTarget.style.color = '#9C8B7A')}
                                >
                                    {label}
                                </a>
                            ))}
                            <a href="/login" className="font-display text-[10px] uppercase tracking-widest px-4 py-2 rounded transition-colors" style={{ color: '#9C8B7A', border: '1px solid #4A3F35' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A962'; e.currentTarget.style.color = '#C9A962'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#4A3F35'; e.currentTarget.style.color = '#9C8B7A'; }}
                            >
                                Log In
                            </a>
                            <a href="/register" className="font-display text-[10px] uppercase tracking-widest px-4 py-2 rounded transition-all" style={{ background: 'linear-gradient(135deg, #C9A962, #B8944A)', color: '#1C1714', boxShadow: '0 2px 8px rgba(201,169,98,0.3)' }}
                                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(201,169,98,0.45)')}
                                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(201,169,98,0.3)')}
                            >
                                Get Started
                            </a>
                        </div>
                    </div>
                </header>

                {/* Hero */}
                <section className="mx-auto max-w-7xl px-6 pt-24 pb-20">
                    <div className="grid items-center gap-16 lg:grid-cols-2">
                        <div>
                            <div className="mb-6 inline-flex items-center gap-2 rounded px-3 py-1.5" style={{ border: '1px solid rgba(201,169,98,0.3)', background: 'rgba(201,169,98,0.06)' }}>
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: '#C9A962' }} />
                                <span className="font-display text-[10px] uppercase tracking-[0.15em]" style={{ color: '#C9A962' }}>ISO 27001 · NIST · OWASP · CIS</span>
                            </div>

                            {/* Ornate divider */}
                            <div className="mb-8" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #4A3F35 30%, #C9A962 50%, #4A3F35 70%, transparent)', position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', color: '#C9A962', fontSize: '8px', background: '#1C1714', padding: '0 8px' }}>✶</span>
                            </div>

                            <h1 className="font-heading mb-6 text-5xl font-normal leading-tight lg:text-6xl" style={{ color: '#E8DFD4' }}>
                                Risk clarity.
                                <br />
                                <span style={{ color: '#C9A962' }}>Compliance</span>
                                <br />
                                confidence.
                            </h1>
                            <p className="font-body mb-10 max-w-lg text-lg leading-relaxed italic" style={{ color: '#9C8B7A' }}>
                                The scholarly GRC platform for managing governance, risk, and compliance across ISO 27001, NIST 800-53, OWASP ASVS, and CIS Benchmarks.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <a href="/register" className="font-display inline-flex items-center gap-2 rounded px-6 py-3 text-[11px] uppercase tracking-[0.15em] transition-all"
                                    style={{ background: 'linear-gradient(135deg, #C9A962, #B8944A)', color: '#1C1714', boxShadow: '0 2px 8px rgba(201,169,98,0.3)' }}
                                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,169,98,0.5)')}
                                    onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(201,169,98,0.3)')}
                                >
                                    Enter the Library →
                                </a>
                                <a href="/login" className="font-display inline-flex items-center gap-2 rounded px-6 py-3 text-[11px] uppercase tracking-[0.15em] transition-colors"
                                    style={{ border: '1px solid #4A3F35', color: '#9C8B7A' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A962'; e.currentTarget.style.color = '#C9A962'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#4A3F35'; e.currentTarget.style.color = '#9C8B7A'; }}
                                >
                                    Log In
                                </a>
                            </div>
                        </div>
                        <DashboardCard />
                    </div>
                </section>

                {/* Stats Bar */}
                <section style={{ borderTop: '1px solid #4A3F35', borderBottom: '1px solid #4A3F35', background: 'rgba(37,30,25,0.4)' }}>
                    <div className="mx-auto max-w-7xl px-6 py-10">
                        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                            {stats.map(({ value, label }) => (
                                <div key={label} className="text-center">
                                    <p className="font-heading mb-1 text-3xl font-normal" style={{ color: '#C9A962' }}>{value}</p>
                                    <p className="font-display text-[9px] uppercase tracking-[0.2em]" style={{ color: '#9C8B7A' }}>{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="mx-auto max-w-7xl px-6 py-24">
                    <div className="mb-14 text-center">
                        <p className="font-display mb-3 text-[10px] uppercase tracking-[0.3em]" style={{ color: '#9C8B7A' }}>Disciplines</p>
                        <h2 className="font-heading mb-3 text-3xl font-normal" style={{ color: '#E8DFD4' }}>
                            Everything you need for GRC
                        </h2>
                        <p className="font-body mx-auto max-w-xl italic" style={{ color: '#9C8B7A' }}>
                            One platform to manage your entire governance, risk, and compliance programme — from risk register to audit evidence.
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {features.map(({ icon: Icon, title, desc, color }) => (
                            <div
                                key={title}
                                className="rounded p-6 transition-all duration-200"
                                style={{ border: '1px solid #4A3F35', background: '#251E19' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,169,98,0.4)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#4A3F35'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <div className="inline-flex h-10 w-10 items-center justify-center rounded mb-4" style={{ background: 'rgba(201,169,98,0.08)', border: '1px solid rgba(201,169,98,0.25)' }}>
                                    <Icon className="h-5 w-5" style={{ color }} strokeWidth={1.5} />
                                </div>
                                <h3 className="font-heading mb-2 text-lg font-normal" style={{ color: '#E8DFD4' }}>{title}</h3>
                                <p className="font-body text-sm leading-relaxed italic" style={{ color: '#9C8B7A' }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="mx-auto max-w-7xl px-6 pb-24">
                    <div className="relative overflow-hidden rounded p-12 text-center" style={{ border: '1px solid rgba(201,169,98,0.3)', background: 'rgba(37,30,25,0.6)' }}>
                        <div className="pointer-events-none absolute top-0 left-1/2 h-32 w-96 -translate-x-1/2 rounded-full blur-3xl" style={{ background: 'rgba(201,169,98,0.05)' }} />
                        <div className="relative">
                            {/* Ornate divider */}
                            <div className="mx-auto mb-6 w-48" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #4A3F35 30%, #C9A962 50%, #4A3F35 70%, transparent)', position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', color: '#C9A962', fontSize: '8px', background: 'rgba(37,30,25,0.9)', padding: '0 8px' }}>✶</span>
                            </div>
                            <h2 className="font-heading mb-4 text-3xl font-normal" style={{ color: '#E8DFD4' }}>
                                Ready to take control of your GRC?
                            </h2>
                            <p className="font-body mx-auto mb-8 max-w-md italic" style={{ color: '#9C8B7A' }}>
                                Begin managing your risks and compliance. No setup fees, no complexity.
                            </p>
                            <a href="/register" className="font-display inline-flex items-center gap-2 rounded px-8 py-3.5 text-[11px] uppercase tracking-[0.15em] transition-all"
                                style={{ background: 'linear-gradient(135deg, #C9A962, #B8944A)', color: '#1C1714', boxShadow: '0 2px 8px rgba(201,169,98,0.3)' }}
                                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,169,98,0.5)')}
                                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(201,169,98,0.3)')}
                            >
                                Enter the Library →
                            </a>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer style={{ borderTop: '1px solid #4A3F35' }}>
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
                        <div>
                            <div className="mb-1 flex items-center gap-2">
                                <Shield className="h-4 w-4" style={{ color: '#C9A962' }} strokeWidth={1.5} />
                                <span className="font-display text-xs uppercase tracking-[0.2em]" style={{ color: '#E8DFD4' }}>GRC System</span>
                            </div>
                            <p className="font-body text-xs italic" style={{ color: '#9C8B7A' }}>
                                Governance, Risk & Compliance — simplified.
                            </p>
                        </div>

                        <nav className="flex flex-wrap items-center gap-6">
                            {navLinks.map(({ label, href }) => (
                                <a key={label} href={href} className="font-display text-[10px] uppercase tracking-widest transition-colors" style={{ color: '#9C8B7A' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = '#C9A962')}
                                    onMouseLeave={e => (e.currentTarget.style.color = '#9C8B7A')}
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
