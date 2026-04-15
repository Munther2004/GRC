import { Head } from '@inertiajs/react';
import {
    ShieldCheck,
    BarChart3,
    FileSearch,
    FolderOpen,
    ClipboardList,
    Users,
} from 'lucide-react';

// ─── Mock Dashboard Card ────────────────────────────────────────────────────

// Rows top→bottom = Likelihood 5→1, columns left→right = Impact 1→5
// Score = L×I  |  ≤4 green · 5-9 yellow · 10-14 orange · ≥15 red
const heatmap: string[][] = [
    [
        'bg-yellow-300',
        'bg-orange-400',
        'bg-red-400',
        'bg-red-500',
        'bg-red-600',
    ], // L=5: 5,10,15,20,25
    [
        'bg-green-400',
        'bg-yellow-300',
        'bg-orange-400',
        'bg-red-400',
        'bg-red-500',
    ], // L=4: 4,8,12,16,20
    [
        'bg-green-400',
        'bg-yellow-300',
        'bg-yellow-300',
        'bg-orange-400',
        'bg-red-400',
    ], // L=3: 3,6,9,12,15
    [
        'bg-green-400',
        'bg-green-400',
        'bg-yellow-300',
        'bg-yellow-300',
        'bg-orange-400',
    ], // L=2: 2,4,6,8,10
    [
        'bg-green-400',
        'bg-green-400',
        'bg-green-400',
        'bg-yellow-300',
        'bg-yellow-300',
    ], // L=1: 1,2,3,4,5
];

function DashboardCard() {
    return (
        <div className="relative mx-auto w-full max-w-[420px] lg:mr-0 lg:ml-auto">
            {/* Subtle glow */}
            <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-blue-500/10 blur-3xl" />

            {/* Browser chrome wrapper */}
            <div className="relative overflow-hidden rounded-2xl border border-zinc-700/60 bg-zinc-900 shadow-2xl">
                {/* Browser chrome bar */}
                <div className="flex items-center gap-2 border-b border-zinc-700/60 bg-zinc-800/80 px-4 py-3">
                    <span className="h-3 w-3 rounded-full bg-red-500/80" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <span className="h-3 w-3 rounded-full bg-green-500/80" />
                    <div className="mx-3 flex h-5 flex-1 items-center rounded-md bg-zinc-700/60 px-2.5">
                        <span className="font-mono text-[10px] text-zinc-500">
                            grc-tool.app/dashboard
                        </span>
                    </div>
                </div>

                {/* Dashboard content */}
                <div className="space-y-3 p-4">
                    {/* Top two stat panels */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Risk Score */}
                        <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/70 p-4">
                            <p className="mb-1 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                                Risk Score
                            </p>
                            <p className="mb-2 text-4xl leading-none font-bold text-white">
                                72
                            </p>
                            <p className="mb-2 text-[10px] font-medium text-orange-400">
                                ▲ 4.2% vs last month
                            </p>
                            {/* Progress bar */}
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-700">
                                <div className="h-full w-[72%] rounded-full bg-orange-400" />
                            </div>
                        </div>

                        {/* Compliance */}
                        <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/70 p-4">
                            <p className="mb-1 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                                Compliance
                            </p>
                            <p className="mb-3 text-4xl leading-none font-bold text-white">
                                94%
                            </p>
                            <div className="space-y-1.5">
                                {[
                                    {
                                        name: 'ISO 27001',
                                        pct: 94,
                                        color: 'text-green-400',
                                    },
                                    {
                                        name: 'NIST',
                                        pct: 88,
                                        color: 'text-green-400',
                                    },
                                    {
                                        name: 'OWASP',
                                        pct: 76,
                                        color: 'text-yellow-400',
                                    },
                                ].map(({ name, pct, color }) => (
                                    <div
                                        key={name}
                                        className="flex items-center justify-between"
                                    >
                                        <span className="text-[10px] text-zinc-400">
                                            {name}
                                        </span>
                                        <span
                                            className={`text-[10px] font-semibold ${color}`}
                                        >
                                            {pct}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Risk Heat Map panel */}
                    <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/70 p-4">
                        <p className="mb-3 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                            Risk Heat Map
                        </p>
                        <div className="flex flex-col gap-1.5">
                            {heatmap.map((row, ri) => (
                                <div key={ri} className="flex gap-1.5">
                                    {row.map((cell, ci) => (
                                        <div
                                            key={ci}
                                            className={`aspect-square flex-1 rounded-lg ${cell} opacity-90`}
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
    { value: '4', label: 'Frameworks' },
    { value: '443+', label: 'Controls' },
    { value: '3', label: 'Roles' },
    { value: 'ISO 27005', label: 'Risk Methodology' },
];

const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'About', href: '/about' },
    { label: 'Team', href: '/team' },
];

export default function Welcome() {
    return (
        <>
            <Head title="GRC System — Risk clarity. Compliance confidence." />

            <div className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased">
                {/* ── Nav ── */}
                <header className="sticky top-0 z-40 border-b border-zinc-800/60 bg-[#0a0a0a]/80 backdrop-blur">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-6 w-6 text-blue-500" />
                            <span className="text-lg font-bold tracking-tight">
                                GRC System
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <a
                                href="/login"
                                className="rounded-lg px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                            >
                                Log In
                            </a>
                            <a
                                href="/register"
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                            >
                                Get Started
                            </a>
                        </div>
                    </div>
                </header>

                {/* ── Hero ── */}
                <section className="mx-auto max-w-7xl px-6 pt-24 pb-20">
                    <div className="grid items-center gap-16 lg:grid-cols-2">
                        {/* Left */}
                        <div>
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
                                ISO 27001 · NIST · OWASP · CIS
                            </div>
                            <h1 className="mb-6 text-5xl leading-[1.08] font-bold tracking-tight text-white lg:text-6xl">
                                Risk clarity.
                                <br />
                                <span className="text-blue-500">
                                    Compliance
                                </span>
                                <br />
                                confidence.
                            </h1>
                            <p className="mb-10 max-w-lg text-lg leading-relaxed text-zinc-400">
                                The modern GRC platform for managing governance,
                                risk, and compliance across ISO 27001, NIST
                                800-53, OWASP ASVS, and CIS Benchmarks.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <a
                                    href="/register"
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                                >
                                    Get Started
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                                        />
                                    </svg>
                                </a>
                                <a
                                    href="/login"
                                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
                                >
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
                    <div className="mx-auto max-w-7xl px-6 py-10">
                        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                            {stats.map(({ value, label }) => (
                                <div key={label} className="text-center">
                                    <p className="mb-1 text-3xl font-bold text-white">
                                        {value}
                                    </p>
                                    <p className="text-sm text-zinc-500">
                                        {label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Features ── */}
                <section id="features" className="mx-auto max-w-7xl px-6 py-24">
                    <div className="mb-14 text-center">
                        <h2 className="mb-3 text-3xl font-bold text-white">
                            Everything you need for GRC
                        </h2>
                        <p className="mx-auto max-w-xl text-zinc-400">
                            One platform to manage your entire governance, risk,
                            and compliance programme — from risk register to
                            audit evidence.
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {features.map(
                            ({ icon: Icon, title, desc, color, bg }) => (
                                <div
                                    key={title}
                                    className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition-colors hover:border-zinc-700 hover:bg-zinc-900"
                                >
                                    <div
                                        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${bg} mb-4`}
                                    >
                                        <Icon className={`h-5 w-5 ${color}`} />
                                    </div>
                                    <h3 className="mb-2 font-semibold text-white">
                                        {title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-zinc-400">
                                        {desc}
                                    </p>
                                </div>
                            ),
                        )}
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="mx-auto max-w-7xl px-6 pb-24">
                    <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-blue-950/40 p-12 text-center">
                        {/* Decorative glow */}
                        <div className="pointer-events-none absolute top-0 left-1/2 h-32 w-96 -translate-x-1/2 rounded-full bg-blue-600/15 blur-3xl" />
                        <div className="relative">
                            <h2 className="mb-4 text-3xl font-bold text-white">
                                Ready to take control of your GRC?
                            </h2>
                            <p className="mx-auto mb-8 max-w-md text-zinc-400">
                                Start managing your risks and compliance in
                                minutes. No setup fees, no complexity.
                            </p>
                            <a
                                href="/register"
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                            >
                                Get Started
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                                    />
                                </svg>
                            </a>
                        </div>
                    </div>
                </section>

                {/* ── Footer ── */}
                <footer className="border-t border-zinc-800">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
                        <div>
                            <div className="mb-1 flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-blue-500" />
                                <span className="font-bold text-white">
                                    GRC System
                                </span>
                            </div>
                            <p className="text-xs text-zinc-600">
                                Governance, Risk & Compliance — simplified.
                            </p>
                        </div>

                        <nav className="flex flex-wrap items-center gap-6">
                            {navLinks.map(({ label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
                                >
                                    {label}
                                </a>
                            ))}
                        </nav>

                        <p className="text-xs text-zinc-600">
                            © 2026 GRC System. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
