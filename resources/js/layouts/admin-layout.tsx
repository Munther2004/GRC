import { AdminHeader }   from '@/components/admin/header';
import { AdminSidebar }  from '@/components/admin/sidebar';
import { CommandPalette } from '@/components/ui/command-palette';
import { usePage }       from '@inertiajs/react';
import type { SharedProps } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

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
            className="fixed right-6 bottom-6 z-50 flex max-w-sm items-start gap-3 rounded px-4 py-3 text-sm ornate-frame"
            style={{
                background: '#251E19',
                border: `1px solid ${isSuccess ? 'rgba(201,169,98,0.4)' : 'rgba(139,38,53,0.4)'}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(12px)',
            }}
        >
            {isSuccess
                ? <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: '#C9A962' }} />
                : <XCircle    className="mt-0.5 h-4 w-4 shrink-0" style={{ color: '#8B2635' }} />
            }
            <span className="flex-1 font-body" style={{ color: '#E8DFD4' }}>{text}</span>
            <button
                onClick={() => setVisible(false)}
                className="shrink-0 transition-colors duration-200"
                style={{ color: '#9C8B7A' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#C9A962')}
                onMouseLeave={e => (e.currentTarget.style.color = '#9C8B7A')}
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="min-h-screen"
            style={{ background: '#1C1714', color: '#E8DFD4' }}
        >
            {/* Atmospheric vignette */}
            <div
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 0%, transparent 55%, rgba(28,23,20,0.5) 100%)',
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
