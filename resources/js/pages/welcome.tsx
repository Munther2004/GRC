import { Head } from '@inertiajs/react';
import {
    ShieldCheck, BarChart3, FileSearch, FolderOpen,
    ClipboardList, Users,
} from 'lucide-react';

// ─── Mock Dashboard Card ────────────────────────────────────────────────────

// Rows top→bottom = Likelihood 5→1, columns left→right = Impact 1→5
// Score = L×I  |  ≤4 green · 5-9 yellow · 10-14 orange · ≥15 red
const heatmap: string[][] = [
    ['bg-yellow-300', 'bg-orange-400', 'bg-red-400',   'bg-red-500',   'bg-red-600'],   // L=5: 5,10,15,20,25
    ['bg-green-400',  'bg-yellow-300', 'bg-orange-400','bg-red-400',   'bg-red-500'],   // L=4: 4,8,12,16,20
    ['bg-green-400',  'bg-yellow-300', 'bg-yellow-300','bg-orange-400','bg-red-400'],   // L=3: 3,6,9,12,15
    ['bg-green-400',  'bg-green-400',  'bg-yellow-300','bg-yellow-300','bg-orange-400'],// L=2: 2,4,6,8,10
    ['bg-green-400',  'bg-green-400',  'bg-green-400', 'bg-yellow-300','bg-yellow-300'],// L=1: 1,2,3,4,5
];

function DashboardCard() {
    return (
        <div className="relative w-full max-w-[420px] mx-auto lg:ml-auto lg:mr-0">
            {/* Subtle glow */}
            <div className="absolute -inset-6 bg-blue-500/10 rounded-3xl blur-3xl pointer-events-none" />

            {/* Browser chrome wrapper */}
            <div className="relative rounded-2xl border border-zinc-700/60 bg-zinc-900 shadow-2xl overflow-hidden">

                {/* Browser chrome bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-zinc-800/80 border-b border-zinc-700/60">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <span className="w-3 h-3 rounded-full bg-green-500/80" />
                    <div className="flex-1 mx-3 h-5 rounded-md bg-zinc-700/60 flex items-center px-2.5">
                        <span className="text-[10px] text-zinc-500 font-mono">grc-tool.app/dashboard</span>
                    </div>
                </div>

                {/* Dashboard content */}
                <div className="p-4 space-y-3">

                    {/* Top two stat panels */}
                    <div className="grid grid-cols-2 gap-3">

                        {/* Risk Score */}
                        <div className="rounded-xl bg-zinc-800/70 border border-zinc-700/50 p-4">
                            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Risk Score</p>
                            <p className="text-4xl font-bold text-white leading-none mb-2">72</p>
                            <p className="text-[10px] text-orange-400 font-medium mb-2">▲ 4.2% vs last month</p>
                            {/* Progress bar */}
                            <div className="w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                                <div className="h-full w-[72%] bg-orange-400 rounded-full" />
                            </div>
                        </div>

                        {/* Compliance */}
                        <div className="rounded-xl bg-zinc-800/70 border border-zinc-700/50 p-4">
                            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Compliance</p>
                            <p className="text-4xl font-bold text-white leading-none mb-3">94%</p>
                            <div className="space-y-1.5">
                                {[
                                    { name: 'ISO 27001', pct: 94, color: 'text-green-400' },
                                    { name: 'NIST',      pct: 88, color: 'text-green-400' },
                                    { name: 'OWASP',     pct: 76, color: 'text-yellow-400' },
                                ].map(({ name, pct, color }) => (
                                    <div key={name} className="flex items-center justify-between">
                                        <span className="text-[10px] text-zinc-400">{name}</span>
                                        <span className={`text-[10px] font-semibold ${color}`}>{pct}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Risk Heat Map panel */}
                    <div className="rounded-xl bg-zinc-800/70 border border-zinc-700/50 p-4">
                        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">Risk Heat Map</p>
                        <div className="flex flex-col gap-1.5">
                            {heatmap.map((row, ri) => (
                                <div key={ri} className="flex gap-1.5">
                                    {row.map((cell, ci) => (
                                        <div key={ci} className={`flex-1 aspect-square rounded-lg ${cell} opacity-90`} />
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

// ─── Page ───────────────────────────────────────────────────────────────────

const features = [
    {
        icon: BarChart3,
        title: 'Risk Assessment',
        desc: 'ISO 27005 likelihood × impact matrix with automatic risk scoring and treatment tracking.',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
        icon: ClipboardList,
        title: 'Compliance Assessments',
        desc: 'Questionnaire-based compliance self-assessments with multi-framework support.',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
        icon: FileSearch,
        title: 'Gap Analysis',
        desc: 'Identify non-compliant and partially compliant controls across all your frameworks.',
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10 border-yellow-500/20',
    },
    {
        icon: FolderOpen,
        title: 'Evidence Management',
        desc: 'Upload, review, and approve compliance evidence files linked to specific controls.',
        color: 'text-green-400',
        bg: 'bg-green-500/10 border-green-500/20',
    },
    {
        icon: ShieldCheck,
        title: 'Audit Trail',
        desc: 'Complete, tamper-evident log of all system activity for internal and external auditors.',
        color: 'text-orange-400',
        bg: 'bg-orange-500/10 border-orange-500/20',
    },
    {
        icon: Users,
        title: 'Role-Based Access',
        desc: 'Granular Admin, Auditor, and User roles control what each team member can see and do.',
        color: 'text-pink-400',
        bg: 'bg-pink-500/10 border-pink-500/20',
    },
];

const stats = [
    { value: '4',    label: 'Frameworks' },
    { value: '443+', label: 'Controls' },
    { value: '3',    label: 'Roles' },
    { value: 'ISO 27005', label: 'Risk Methodology' },
];

const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'About',    href: '/about' },
    { label: 'Team',     href: '/team' },
];

export default function Welcome() {
    return (
        <>
            <Head title="GRC System — Risk clarity. Compliance confidence." />

            <div className="min-h-screen bg-[#0a0a0a] text-white font-sans antialiased">

                {/* ── Nav ── */}
                <header className="sticky top-0 z-40 border-b border-zinc-800/60 bg-[#0a0a0a]/80 backdrop-blur">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-blue-500" />
                            <span className="font-bold text-lg tracking-tight">GRC System</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <a href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-zinc-800">
                                Log In
                            </a>
                            <a href="/register" className="text-sm bg-blue-600 hover:bg-blue-500 transition-colors text-white px-4 py-2 rounded-lg font-medium">
                                Get Started
                            </a>
                        </div>
                    </div>
                </header>

                {/* ── Hero ── */}
                <section className="max-w-7xl mx-auto px-6 pt-24 pb-20">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left */}
                        <div>
                            <div className="inline-flex items-center gap-2 text-xs text-blue-400 border border-blue-500/30 bg-blue-500/10 rounded-full px-3 py-1.5 mb-6 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                ISO 27001 · NIST · OWASP · CIS
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight text-white mb-6">
                                Risk clarity.<br />
                                <span className="text-blue-500">Compliance</span><br />
                                confidence.
                            </h1>
                            <p className="text-lg text-zinc-400 leading-relaxed mb-10 max-w-lg">
                                The modern GRC platform for managing governance, risk, and compliance across
                                ISO 27001, NIST 800-53, OWASP ASVS, and CIS Benchmarks.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <a href="/register"
                                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition-colors text-white font-semibold px-6 py-3 rounded-xl text-sm">
                                    Get Started
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                    </svg>
                                </a>
                                <a href="/login"
                                    className="inline-flex items-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white transition-colors font-semibold px-6 py-3 rounded-xl text-sm">
                                    Log In
                                </a>
                            </div>
                        </div>

                        {/* Right — mock dashboard */}
                        <DashboardCard />
                    </div>
                </section>

                {/* ── Stats Bar ── */}
                <section className="border-y border-zinc-800 bg-zinc-900/40">
                    <div className="max-w-7xl mx-auto px-6 py-10">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map(({ value, label }) => (
                                <div key={label} className="text-center">
                                    <p className="text-3xl font-bold text-white mb-1">{value}</p>
                                    <p className="text-sm text-zinc-500">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Features ── */}
                <section id="features" className="max-w-7xl mx-auto px-6 py-24">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-white mb-3">Everything you need for GRC</h2>
                        <p className="text-zinc-400 max-w-xl mx-auto">
                            One platform to manage your entire governance, risk, and compliance programme — from risk register to audit evidence.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map(({ icon: Icon, title, desc, color, bg }) => (
                            <div key={title} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 hover:border-zinc-700 hover:bg-zinc-900 transition-colors">
                                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border ${bg} mb-4`}>
                                    <Icon className={`w-5 h-5 ${color}`} />
                                </div>
                                <h3 className="font-semibold text-white mb-2">{title}</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="max-w-7xl mx-auto px-6 pb-24">
                    <div className="relative rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-blue-950/40 p-12 text-center overflow-hidden">
                        {/* Decorative glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-blue-600/15 blur-3xl rounded-full pointer-events-none" />
                        <div className="relative">
                            <h2 className="text-3xl font-bold text-white mb-4">Ready to take control of your GRC?</h2>
                            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                                Start managing your risks and compliance in minutes. No setup fees, no complexity.
                            </p>
                            <a href="/register"
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition-colors text-white font-semibold px-8 py-3.5 rounded-xl text-sm">
                                Get Started
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </section>

                {/* ── Footer ── */}
                <footer className="border-t border-zinc-800">
                    <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldCheck className="w-5 h-5 text-blue-500" />
                                <span className="font-bold text-white">GRC System</span>
                            </div>
                            <p className="text-xs text-zinc-600">Governance, Risk & Compliance — simplified.</p>
                        </div>

                        <nav className="flex flex-wrap items-center gap-6">
                            {navLinks.map(({ label, href }) => (
                                <a key={label} href={href} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                                    {label}
                                </a>
                            ))}
                        </nav>

                        <p className="text-xs text-zinc-600">© 2026 GRC System. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
