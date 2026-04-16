import { Head, Link } from '@inertiajs/react';
import { ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error403() {
    return (
        <>
            <Head title="403 — Forbidden" />
            <div
                className="flex min-h-screen items-center justify-center p-6"
                style={{ background: '#091413' }}
            >
                <div className="max-w-md text-center">
                    <div className="mb-6 flex justify-center">
                        <div
                            className="flex h-20 w-20 items-center justify-center rounded-full"
                            style={{ background: 'rgba(139,38,53,0.12)', border: '1px solid rgba(139,38,53,0.4)' }}
                        >
                            <ShieldOff className="h-10 w-10" style={{ color: '#8B2635' }} strokeWidth={1.5} />
                        </div>
                    </div>
                    <p className="font-display mb-1 text-[10px] uppercase tracking-[0.3em]" style={{ color: '#7ABFA8' }}>
                        Error
                    </p>
                    <h1 className="font-heading mb-2 text-7xl font-normal" style={{ color: '#8B2635' }}>
                        403
                    </h1>
                    <h2 className="font-heading mb-3 text-xl font-normal" style={{ color: '#E0F5EC' }}>
                        Access Denied
                    </h2>
                    <p className="font-body mb-8 italic" style={{ color: '#7ABFA8' }}>
                        You don't have permission to access this page. Contact
                        your administrator if you believe this is a mistake.
                    </p>
                    <Link href="/">
                        <Button>Return to Dashboard</Button>
                    </Link>
                </div>
            </div>
        </>
    );
}
