import { Head, Link } from '@inertiajs/react';
import { ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error500() {
    return (
        <>
            <Head title="500 — Server Error" />
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6 text-foreground">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(60% 60% at 50% 50%, color-mix(in srgb, var(--chart-3) 10%, transparent), transparent 70%)',
                    }}
                />
                <div className="relative max-w-md text-center">
                    <div className="mb-6 flex justify-center">
                        <div
                            className="flex h-20 w-20 items-center justify-center rounded-2xl"
                            style={{
                                background: 'color-mix(in srgb, var(--chart-3) 8%, transparent)',
                                border: '1px solid color-mix(in srgb, var(--chart-3) 24%, transparent)',
                                color: 'var(--chart-3)',
                            }}
                        >
                            <ServerCrash className="h-9 w-9" strokeWidth={1.6} />
                        </div>
                    </div>
                    <p className="mb-2 text-[11px] uppercase" style={{ color: 'var(--chart-3)', letterSpacing: '0.4em' }}>
                        Error
                    </p>
                    <h1 className="mb-3 text-7xl" style={{ color: 'var(--foreground)', fontWeight: 500, letterSpacing: '-0.04em' }}>
                        500
                    </h1>
                    <h2 className="mb-3 text-2xl tracking-[-0.01em]" style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                        Server error.
                    </h2>
                    <p className="mb-8 text-base" style={{ color: 'var(--muted-foreground)' }}>
                        Something went wrong on our end. Please try again later or contact support if the problem persists.
                    </p>
                    <Link href="/">
                        <Button>Return home</Button>
                    </Link>
                </div>
            </div>
        </>
    );
}
