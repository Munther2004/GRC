import { Head } from '@inertiajs/react';
import { ShieldCheck, ArrowLeft, BookOpen, Lock, Server, Globe, Shield } from 'lucide-react';

const frameworks = [
    {
        name: 'ISO 27001',
        icon: Lock,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10 border-blue-500/20',
        desc: 'International standard for information security management systems (ISMS). Defines requirements for establishing, implementing, and continuously improving information security.',
    },
    {
        name: 'NIST 800-53',
        icon: Server,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10 border-purple-500/20',
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
            <div className="min-h-screen bg-[#0a0a0a] text-white font-sans antialiased">

                {/* Nav */}
                <header className="sticky top-0 z-40 border-b border-zinc-800/60 bg-[#0a0a0a]/80 backdrop-blur">
                    <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                        <a href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </a>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-blue-500" />
                            <span className="font-bold text-white">GRC System</span>
                        </div>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-6 py-16 space-y-16">

                    {/* Hero */}
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 text-xs text-blue-400 border border-blue-500/30 bg-blue-500/10 rounded-full px-3 py-1.5 mb-6">
                            <BookOpen className="w-3.5 h-3.5" />
                            Graduation Project · PSUT 2025/2026
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4">About This Project</h1>
                        <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl mx-auto">
                            A graduation project developed at <span className="text-white font-medium">Princess Sumaya University for Technology (PSUT)</span>,
                            Faculty of Computer Engineering. Built to demonstrate a fully functional Governance, Risk & Compliance
                            management system using modern web technologies.
                        </p>
                    </div>

                    {/* What is GRC */}
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8">
                        <h2 className="text-xl font-bold text-white mb-4">What is GRC?</h2>
                        <p className="text-zinc-400 leading-relaxed mb-4">
                            <span className="text-white font-medium">Governance, Risk & Compliance (GRC)</span> is an integrated approach
                            that helps organisations align their IT infrastructure with business objectives, manage uncertainty,
                            and act with integrity.
                        </p>
                        <ul className="space-y-3">
                            {[
                                { term: 'Governance', def: 'Ensures that organisational activities align with business goals through policies, processes, and decision-making frameworks.' },
                                { term: 'Risk Management', def: 'Identifies, assesses, and mitigates threats that could affect the organisation\'s ability to achieve its objectives.' },
                                { term: 'Compliance', def: 'Confirms that the organisation meets all relevant laws, regulations, and industry standards.' },
                            ].map(({ term, def }) => (
                                <li key={term} className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                                    <p className="text-zinc-400 text-sm leading-relaxed">
                                        <span className="text-white font-medium">{term} — </span>{def}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Frameworks */}
                    <div>
                        <h2 className="text-xl font-bold text-white mb-6">Frameworks Supported</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {frameworks.map(({ name, icon: Icon, color, bg, desc }) => (
                                <div key={name} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 hover:border-zinc-700 transition-colors">
                                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border ${bg} mb-4`}>
                                        <Icon className={`w-5 h-5 ${color}`} />
                                    </div>
                                    <h3 className="font-semibold text-white mb-2">{name}</h3>
                                    <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </main>

                <footer className="border-t border-zinc-800 mt-16">
                    <div className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-bold text-white">GRC System</span>
                        </div>
                        <p className="text-xs text-zinc-600">© 2026 GRC System. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
