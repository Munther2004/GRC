import { Head } from '@inertiajs/react';
import { ShieldCheck, ArrowLeft, Code2 } from 'lucide-react';

const members = [
    { name: 'Ghaith Abboud',     role: 'Full Stack Developer', initials: 'GA', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { name: 'Moayyad Zeidan',    role: 'Full Stack Developer', initials: 'MZ', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { name: 'Munther Elatrash',  role: 'Full Stack Developer', initials: 'ME', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
];

export default function Team() {
    return (
        <>
            <Head title="Team — GRC System" />
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

                <main className="max-w-4xl mx-auto px-6 py-16">

                    {/* Hero */}
                    <div className="text-center mb-14">
                        <div className="inline-flex items-center gap-2 text-xs text-blue-400 border border-blue-500/30 bg-blue-500/10 rounded-full px-3 py-1.5 mb-6">
                            <Code2 className="w-3.5 h-3.5" />
                            Graduation Project · PSUT 2025/2026
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-3">Meet the Team</h1>
                        <p className="text-zinc-400">Graduation Project — PSUT, NIS Engineering, 2025/2026</p>
                    </div>

                    {/* Member cards */}
                    <div className="grid md:grid-cols-3 gap-5 mb-12">
                        {members.map(({ name, role, initials, color }) => (
                            <div key={name} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center hover:border-zinc-700 transition-colors">
                                {/* Avatar */}
                                <div className={`w-16 h-16 rounded-full border-2 ${color} flex items-center justify-center mx-auto mb-5 text-lg font-bold`}>
                                    {initials}
                                </div>
                                <h3 className="font-semibold text-white mb-1">{name}</h3>
                                <p className="text-sm text-zinc-500">{role}</p>
                            </div>
                        ))}
                    </div>

                    {/* Supervisor */}
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-center">
                        <p className="text-zinc-500 text-sm mb-1">Project Supervisor</p>
                        <p className="text-white font-semibold text-lg">Prof. Ali Al-Haj</p>
                        <p className="text-zinc-500 text-sm mt-1">Princess Sumaya University for Technology</p>
                    </div>

                </main>

                <footer className="border-t border-zinc-800 mt-8">
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
