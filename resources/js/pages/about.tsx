import { Head } from '@inertiajs/react';
import {
    ShieldCheck,
    ArrowLeft,
    BookOpen,
    Lock,
    Server,
    Globe,
    Shield,
} from 'lucide-react';

const frameworks = [
    {
        name: 'ISO 27001',
        icon: Lock,
        color: 'text-primary',
        bg: 'bg-primary/10 border-primary/20',
        desc: 'International standard for information security management systems (ISMS). Defines requirements for establishing, implementing, and continuously improving information security.',
    },
    {
        name: 'NIST 800-53',
        icon: Server,
        color: 'text-secondary-foreground',
        bg: 'bg-secondary/10 border-secondary/20',
        desc: 'NIST Special Publication providing a catalogue of security and privacy controls for federal information systems, widely adopted by private sector organisations.',
    },
    {
        name: 'OWASP ASVS',
        icon: Globe,
        color: 'text-green-400',
        bg: 'bg-green-500/10 border-green-500/20',
        desc: 'Application Security Verification Standard — a framework for testing web application security controls and a basis for secure development.',
    },
    {
        name: 'CIS Benchmarks',
        icon: Shield,
        color: 'text-orange-400',
        bg: 'bg-orange-500/10 border-orange-500/20',
        desc: 'Center for Internet Security benchmarks provide prescriptive configuration guidance for hardening operating systems, cloud platforms, and software.',
    },
];

export default function About() {
    return (
        <>
            <Head title="About — GRC System" />
            <div className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased">
                {/* Nav */}
                <header className="sticky top-0 z-40 border-b border-zinc-800/60 bg-[#0a0a0a]/80 backdrop-blur">
                    <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
                        <a
                            href="/"
                            className="flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </a>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            <span className="font-bold text-white">
                                GRC System
                            </span>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-4xl space-y-16 px-6 py-16">
                    {/* Hero */}
                    <div className="text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs text-primary">
                            <BookOpen className="h-3.5 w-3.5" />
                            Graduation Project · PSUT 2025/2026
                        </div>
                        <h1 className="mb-4 text-4xl font-bold text-white">
                            About This Project
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-zinc-400">
                            A graduation project developed at{' '}
                            <span className="font-medium text-white">
                                Princess Sumaya University for Technology (PSUT)
                            </span>
                            , Faculty of Computer Engineering. Built to
                            demonstrate a fully functional Governance, Risk &
                            Compliance management system using modern web
                            technologies.
                        </p>
                    </div>

                    {/* What is GRC */}
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8">
                        <h2 className="mb-4 text-xl font-bold text-white">
                            What is GRC?
                        </h2>
                        <p className="mb-4 leading-relaxed text-zinc-400">
                            <span className="font-medium text-white">
                                Governance, Risk & Compliance (GRC)
                            </span>{' '}
                            is an integrated approach that helps organisations
                            align their IT infrastructure with business
                            objectives, manage uncertainty, and act with
                            integrity.
                        </p>
                        <ul className="space-y-3">
                            {[
                                {
                                    term: 'Governance',
                                    def: 'Ensures that organisational activities align with business goals through policies, processes, and decision-making frameworks.',
                                },
                                {
                                    term: 'Risk Management',
                                    def: "Identifies, assesses, and mitigates threats that could affect the organisation's ability to achieve its objectives.",
                                },
                                {
                                    term: 'Compliance',
                                    def: 'Confirms that the organisation meets all relevant laws, regulations, and industry standards.',
                                },
                            ].map(({ term, def }) => (
                                <li key={term} className="flex gap-3">
                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                    <p className="text-sm leading-relaxed text-zinc-400">
                                        <span className="font-medium text-white">
                                            {term} —{' '}
                                        </span>
                                        {def}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Frameworks */}
                    <div>
                        <h2 className="mb-6 text-xl font-bold text-white">
                            Frameworks Supported
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            {frameworks.map(
                                ({ name, icon: Icon, color, bg, desc }) => (
                                    <div
                                        key={name}
                                        className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition-colors hover:border-zinc-700"
                                    >
                                        <div
                                            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${bg} mb-4`}
                                        >
                                            <Icon
                                                className={`h-5 w-5 ${color}`}
                                            />
                                        </div>
                                        <h3 className="mb-2 font-semibold text-white">
                                            {name}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-zinc-400">
                                            {desc}
                                        </p>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                </main>

                <footer className="mt-16 border-t border-zinc-800">
                    <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-8">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            <span className="text-sm font-bold text-white">
                                GRC System
                            </span>
                        </div>
                        <p className="text-xs text-zinc-600">
                            © 2026 GRC System. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
