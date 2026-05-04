import { usePage }       from '@inertiajs/react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AdminHeader }   from '@/components/admin/header';
import { AdminSidebar }  from '@/components/admin/sidebar';
import { CommandPalette } from '@/components/ui/command-palette';
import { SidebarStateProvider, useSidebarCollapsed } from '@/hooks/use-sidebar-state';
import type { SharedProps } from '@/types';

function FlashToast() {
    const { flash } = usePage<SharedProps>().props;
    const text      = (flash?.success ?? flash?.error ?? null) as string | null;
    const isSuccess = !!flash?.success;

    const [visible, setVisible]   = useState(!!text);
    const prevTextRef             = useRef<string | null>(text);

    if (text !== prevTextRef.current) {
        prevTextRef.current = text;
        setVisible(!!text);
    }

    useEffect(() => {
        if (!visible) return;
        const t = setTimeout(() => setVisible(false), 4000);
        return () => clearTimeout(t);
    }, [visible]);

    if (!visible || !text) return null;

    // Anchor to the bottom-right corner with explicit inline styles so the
    // position can't be lost to a Tailwind purge or cascade conflict.
    // max-w-sm (24rem) keeps the toast's left edge well clear of the sidebar
    // at any viewport width: at lg+ the sidebar is at most 256px and the toast
    // sits at right:24px with width ≤ 384px, so its left edge can't reach the
    // sidebar. At <lg the sidebar is off-canvas.
    return (
        <div
            className="fixed z-50 flex max-w-sm items-start gap-3 rounded px-4 py-3 text-sm ornate-frame bg-card border"
            style={{
                // `.ornate-frame` sets `position: relative` in app.css and beats
                // Tailwind's `.fixed` on specificity ties. Inline style wins, so
                // we force fixed positioning here.
                position: 'fixed',
                right: '24px',
                bottom: '24px',
                left: 'auto',
                borderColor: isSuccess ? 'rgba(var(--color-primary) / 0.4)' : 'rgba(var(--color-destructive) / 0.4)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(12px)',
            }}
        >
            {isSuccess
                ? <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--primary)' }} />
                : <XCircle    className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--destructive)' }} />
            }
            <span className="flex-1 font-body text-foreground">{text}</span>
            <button
                onClick={() => setVisible(false)}
                className="shrink-0 transition-colors duration-200"
                style={{ color: 'var(--muted-foreground)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
    const [collapsed] = useSidebarCollapsed();
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Background: gradient mesh halo (matches landing aesthetic) */}
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

            {/* Background: subtle 64×64 grid masked to a soft top-down halo */}
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

            {/* Atmospheric vignette (preserved) */}
            <div
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 0%, transparent 55%, rgba(0,0,0,0.2))',
                }}
                aria-hidden
            />

            <CommandPalette />
            <AdminSidebar />
            <div className={`relative z-10 transition-[padding] duration-200 ${collapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
                <AdminHeader />
                <main className="mx-auto max-w-[1440px] px-6 py-8">
                    {children}
                </main>
            </div>
            <FlashToast />
        </div>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarStateProvider>
            <AdminLayoutInner>{children}</AdminLayoutInner>
        </SidebarStateProvider>
    );
}
