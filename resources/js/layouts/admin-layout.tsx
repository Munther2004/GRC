import { usePage }       from '@inertiajs/react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AdminHeader }   from '@/components/admin/header';
import { AdminSidebar }  from '@/components/admin/sidebar';
import { CommandPalette } from '@/components/ui/command-palette';
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

    return (
        <div
            className="fixed right-6 bottom-6 z-50 flex max-w-sm items-start gap-3 rounded px-4 py-3 text-sm ornate-frame bg-card border"
            style={{
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Atmospheric vignette */}
            <div
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 0%, transparent 55%, rgba(0,0,0,0.2))',
                }}
                aria-hidden
            />

            <CommandPalette />
            <AdminSidebar />
            <div className="lg:pl-64 relative z-10">
                <AdminHeader />
                <main className="mx-auto max-w-[1440px] px-6 py-8">
                    {children}
                </main>
            </div>
            <FlashToast />
        </div>
    );
}
