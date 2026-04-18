import { Head } from '@inertiajs/react';
import { ShieldCheck, ArrowLeft, Code2 } from 'lucide-react';

const members = [
    {
        name: 'Ghaith Abboud',
        role: 'Full Stack Developer',
        initials: 'GA',
        color: 'bg-primary/20 text-primary border-primary/30',
    },
    {
        name: 'Moayyad Zeidan',
        role: 'Full Stack Developer',
        initials: 'MZ',
        color: 'bg-secondary/20 text-secondary-foreground border-secondary/30',
    },
    {
        name: 'Munther Elatrash',
        role: 'Full Stack Developer',
        initials: 'ME',
        color: 'bg-green-500/20 text-green-400 border-green-500/30',
    },
];

export default function Team() {
    return (
        <>
            <Head title="Team — GRC System" />
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

                <main className="mx-auto max-w-4xl px-6 py-16">
                    {/* Hero */}
                    <div className="mb-14 text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs text-primary">
                            <Code2 className="h-3.5 w-3.5" />
                            Graduation Project · PSUT 2025/2026
                        </div>
                        <h1 className="mb-3 text-4xl font-bold text-white">
                            Meet the Team
                        </h1>
                        <p className="text-zinc-400">
                            Graduation Project — PSUT, NIS Engineering,
                            2025/2026
                        </p>
                    </div>

                    {/* Member cards */}
                    <div className="mb-12 grid gap-5 md:grid-cols-3">
                        {members.map(({ name, role, initials, color }) => (
                            <div
                                key={name}
                                className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center transition-colors hover:border-zinc-700"
                            >
                                {/* Avatar */}
                                <div
                                    className={`h-16 w-16 rounded-full border-2 ${color} mx-auto mb-5 flex items-center justify-center text-lg font-bold`}
                                >
                                    {initials}
                                </div>
                                <h3 className="mb-1 font-semibold text-white">
                                    {name}
                                </h3>
                                <p className="text-sm text-zinc-500">{role}</p>
                            </div>
                        ))}
                    </div>

                    {/* Supervisor */}
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-center">
                        <p className="mb-1 text-sm text-zinc-500">
                            Project Supervisor
                        </p>
                        <p className="text-lg font-semibold text-white">
                            Prof. Ali Al-Haj
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                            Princess Sumaya University for Technology
                        </p>
                    </div>
                </main>

                <footer className="mt-8 border-t border-zinc-800">
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
