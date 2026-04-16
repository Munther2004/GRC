import { Link } from '@inertiajs/react';
import { Shield } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div
            className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10"
            style={{ background: '#1C1714' }}
        >
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    {/* Wordmark */}
                    <div className="flex flex-col items-center gap-4">
                        <Link href={home()} className="flex flex-col items-center gap-3">
                            <div
                                className="flex h-12 w-12 items-center justify-center rounded"
                                style={{ background: 'rgba(201,169,98,0.08)', border: '1px solid rgba(201,169,98,0.4)' }}
                            >
                                <Shield className="h-6 w-6" style={{ color: '#C9A962' }} strokeWidth={1.5} />
                            </div>
                            <span className="font-display text-xs uppercase tracking-[0.3em]" style={{ color: '#E8DFD4' }}>
                                GRC Platform
                            </span>
                        </Link>

                        {/* Ornate divider */}
                        <div style={{ position: 'relative', height: '1px', width: '100%', background: 'linear-gradient(90deg, transparent, #4A3F35 30%, #C9A962 50%, #4A3F35 70%, transparent)' }}>
                            <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', color: '#C9A962', fontSize: '8px', background: '#1C1714', padding: '0 8px' }}>✶</span>
                        </div>

                        <div className="space-y-2 text-center">
                            <h1 className="font-heading text-2xl font-normal" style={{ color: '#E8DFD4' }}>{title}</h1>
                            <p className="font-body text-center text-sm italic" style={{ color: '#9C8B7A' }}>
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* Form card */}
                    <div
                        className="rounded p-6"
                        style={{ background: '#251E19', border: '1px solid #4A3F35' }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
