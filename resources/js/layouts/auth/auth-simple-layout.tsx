import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { ThemeToggle } from '@/components/theme-toggle';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col overflow-hidden bg-background text-foreground">
            {/* Ambient mesh halo + soft grid (matches landing page) */}
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

            {/* Glass nav (matches landing page) */}
            <header
                className="relative z-30 sticky top-0"
                style={{
                    background: 'color-mix(in srgb, var(--card) 72%, transparent)',
                    backdropFilter: 'blur(14px) saturate(140%)',
                    WebkitBackdropFilter: 'blur(14px) saturate(140%)',
                    borderBottom: '1px solid color-mix(in srgb, var(--border) 70%, transparent)',
                }}
            >
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <Link href={home()} className="flex items-center gap-3">
                        <AppLogoIcon className="size-14" />
                        <span
                            className="text-[12px] uppercase"
                            style={{ color: 'var(--foreground)', letterSpacing: '0.28em', fontWeight: 600 }}
                        >
                            GRC<span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}> · Charter</span>
                        </span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <ThemeToggle compact />
                    </div>
                </div>
            </header>

            <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-14">
                <div className="w-full max-w-sm">
                    <div className="flex flex-col gap-8">
                        {/* Wordmark + heading */}
                        <div className="flex flex-col items-center gap-5 text-center">
                            <AppLogoIcon className="size-32" />

                            <span
                                className="-mt-4 text-[10px] uppercase"
                                style={{ color: 'var(--primary)', letterSpacing: '0.4em' }}
                            >
                                The Charter
                            </span>

                            <div className="space-y-3">
                                <h1
                                    className="text-3xl tracking-[-0.02em]"
                                    style={{ color: 'var(--foreground)', fontWeight: 500, lineHeight: 1.1 }}
                                >
                                    {title}
                                </h1>
                                <p
                                    className="text-sm leading-relaxed"
                                    style={{ color: 'var(--muted-foreground)' }}
                                >
                                    {description}
                                </p>
                            </div>
                        </div>

                        {/* Form card */}
                        <div
                            className="rounded-2xl p-6 sm:p-7"
                            style={{
                                background: 'color-mix(in srgb, var(--card) 88%, transparent)',
                                border: '1px solid var(--border)',
                                boxShadow: '0 24px 60px -28px color-mix(in srgb, var(--foreground) 28%, transparent), 0 8px 22px -10px color-mix(in srgb, var(--foreground) 12%, transparent)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                            }}
                        >
                            {children}
                        </div>
                    </div>
                </div>
            </main>

            <footer
                className="relative z-10"
                style={{ borderTop: '1px solid var(--border)', background: 'color-mix(in srgb, var(--card) 70%, transparent)' }}
            >
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-5 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                    <span>© Twenty Twenty-Six · GRC Charter</span>
                    <span>Fides · Ratio · Ordo</span>
                </div>
            </footer>
        </div>
    );
}
