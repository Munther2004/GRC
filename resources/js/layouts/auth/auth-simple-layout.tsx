import { Link } from '@inertiajs/react';
import { Shield } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden p-6 bg-background text-foreground md:p-10">
            {/* Ambient gradient mesh */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 mesh-bg"
            />

            {/* Theme toggle (top-right) */}
            <div className="absolute right-4 top-4 z-10 md:right-6 md:top-6">
                <ThemeToggle compact />
            </div>

            <div className="relative z-10 w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    {/* Wordmark */}
                    <div className="flex flex-col items-center gap-4">
                        <Link href={home()} className="flex flex-col items-center gap-3">
                            <div
                                className="flex h-12 w-12 items-center justify-center rounded-lg"
                                style={{
                                    background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
                                    border: '1px solid color-mix(in srgb, var(--primary) 40%, transparent)',
                                }}
                            >
                                <Shield className="h-6 w-6" style={{ color: 'var(--primary)' }} strokeWidth={1.5} />
                            </div>
                            <span className="font-display text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--foreground)' }}>
                                GRC Platform
                            </span>
                        </Link>

                        {/* Ornate divider */}
                        <div style={{ position: 'relative', height: '1px', width: '100%', background: 'linear-gradient(90deg, transparent, var(--border) 30%, var(--primary) 50%, var(--border) 70%, transparent)' }}>
                            <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', color: 'var(--primary)', fontSize: '8px', background: 'var(--background)', padding: '0 8px' }}>✶</span>
                        </div>

                        <div className="space-y-2 text-center">
                            <h1 className="font-heading text-2xl font-normal" style={{ color: 'var(--foreground)' }}>{title}</h1>
                            <p className="font-body text-center text-sm italic" style={{ color: 'var(--muted-foreground)' }}>
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* Form card with soft elevation + glass tint */}
                    <div
                        className="elev-2 rounded-xl p-6"
                        style={{
                            background: 'color-mix(in srgb, var(--card) 92%, transparent)',
                            border: '1px solid var(--border)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                        }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
