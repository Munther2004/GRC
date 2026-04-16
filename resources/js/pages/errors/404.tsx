import { Head, Link } from '@inertiajs/react';
import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error404() {
    return (
        <>
            <Head title="404 — Not Found" />
            <div
                className="flex min-h-screen items-center justify-center p-6"
                style={{ background: '#1C1714' }}
            >
                <div className="max-w-md text-center">
                    <div className="mb-6 flex justify-center">
                        <div
                            className="flex h-20 w-20 items-center justify-center rounded-full"
                            style={{ background: 'rgba(201,169,98,0.08)', border: '1px solid rgba(201,169,98,0.3)' }}
                        >
                            <SearchX className="h-10 w-10" style={{ color: '#C9A962' }} strokeWidth={1.5} />
                        </div>
                    </div>
                    <p className="font-display mb-1 text-[10px] uppercase tracking-[0.3em]" style={{ color: '#9C8B7A' }}>
                        Error
                    </p>
                    <h1 className="font-heading mb-2 text-7xl font-normal" style={{ color: '#C9A962' }}>
                        404
                    </h1>
                    <h2 className="font-heading mb-3 text-xl font-normal" style={{ color: '#E8DFD4' }}>
                        Page Not Found
                    </h2>
                    <p className="font-body mb-8 italic" style={{ color: '#9C8B7A' }}>
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                    <Link href="/">
                        <Button>Return to Dashboard</Button>
                    </Link>
                </div>
            </div>
        </>
    );
}
