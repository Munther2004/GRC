import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Code2, ShieldCheck } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { ThemeToggle } from '@/components/theme-toggle';

const members = [
    { name: 'Ghaith Abboud',    role: 'NIS Engineer', initials: 'GA' },
    { name: 'Moayyad Zeidan',   role: 'NIS Engineer', initials: 'MZ' },
    { name: 'Munther Elatrash', role: 'NIS Engineer', initials: 'ME' },
];

export default function Team() {
    return (
        <>
            <Head title="Team — GRC System" />
            <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground antialiased">
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
                            <AppLogoIcon className="size-20" />
                            <span className="text-[12px] uppercase" style={{ color: 'var(--foreground)', letterSpacing: '0.28em', fontWeight: 600 }}>
                                GRC<span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}> · Trustifyjo</span>
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

                <main className="relative z-10 mx-auto max-w-5xl px-6 py-16">
                    <div className="mb-14 text-center">
                        <div
                            className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px]"
                            style={{
                                background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
                                color: 'var(--primary)',
                                border: '1px solid color-mix(in srgb, var(--primary) 24%, transparent)',
                            }}
                        >
                            <Code2 className="h-3.5 w-3.5" />
                            Graduation Project · PSUT 2025/2026
                        </div>
                        <h1
                            className="mb-4 text-4xl tracking-[-0.02em] sm:text-5xl lg:text-6xl"
                            style={{ color: 'var(--foreground)', fontWeight: 500, lineHeight: 1.05 }}
                        >
                            Meet the{' '}
                            <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>team.</span>
                        </h1>
                        <p className="mx-auto max-w-2xl text-base" style={{ color: 'var(--muted-foreground)' }}>
                            Senior Design Project — Networks &amp; Information Security Engineering, PSUT, 2025/2026
                        </p>
                    </div>

                    <div className="mb-12 grid gap-5 md:grid-cols-3">
                        {members.map(({ name, role, initials }) => (
                            <div
                                key={name}
                                className="rounded-2xl p-7 text-center transition-all duration-200"
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
                                    className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
                                    style={{
                                        background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
                                        border: '1px solid color-mix(in srgb, var(--primary) 24%, transparent)',
                                        color: 'var(--primary)',
                                        fontWeight: 600,
                                        fontSize: '18px',
                                        letterSpacing: '0.05em',
                                    }}
                                >
                                    {initials}
                                </div>
                                <h3 className="mb-1 text-base" style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                                    {name}
                                </h3>
                                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{role}</p>
                            </div>
                        ))}
                    </div>

                    <div
                        className="rounded-2xl p-7 text-center"
                        style={{
                            background: 'color-mix(in srgb, var(--primary) 5%, transparent)',
                            border: '1px solid color-mix(in srgb, var(--primary) 18%, transparent)',
                        }}
                    >
                        <p className="mb-2 text-[11px] uppercase" style={{ color: 'var(--primary)', letterSpacing: '0.32em' }}>
                            Supervised by
                        </p>
                        <p className="text-xl" style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                            Prof. Ali Al-Haj
                        </p>
                    </div>
                </main>

                <footer className="relative z-10 mt-16" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                            <span className="text-xs uppercase" style={{ color: 'var(--foreground)', letterSpacing: '0.28em', fontWeight: 600 }}>
                                GRC <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>· Trustifyjo</span>
                            </span>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            © Twenty Twenty-Six · GRC Trustifyjo · All rights reserved
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
