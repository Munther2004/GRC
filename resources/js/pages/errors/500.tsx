import { Head, Link } from '@inertiajs/react';
import { ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';

const themeColors = {
    background: '#091413',
    foreground: '#E0F5EC',
    border: '#285A48',
    muted: '#7ABFA8',
};

export default function Error500() {
    return (
        <>
            <Head title="500 — Server Error" />
            <div
                className="flex min-h-screen items-center justify-center p-6"
                style={{ background: themeColors.background }}
            >
                <div className="max-w-md text-center">
                    <div className="mb-6 flex justify-center">
                        <div
                            className="flex h-20 w-20 items-center justify-center rounded-full"
                            style={{ background: `rgba(40,90,72,0.1)`, border: `1px solid rgba(40,90,72,0.35)` }}
                        >
                            <ServerCrash className="h-10 w-10" style={{ color: themeColors.border }} strokeWidth={1.5} />
                        </div>
                    </div>
                    <p className="font-display mb-1 text-[10px] uppercase tracking-[0.3em]" style={{ color: themeColors.muted }}>
                        Error
                    </p>
                    <h1 className="font-heading mb-2 text-7xl font-normal" style={{ color: themeColors.border }}>
                        500
                    </h1>
                    <h2 className="font-heading mb-3 text-xl font-normal" style={{ color: themeColors.foreground }}>
                        Server Error
                    </h2>
                    <p className="font-body mb-8 italic" style={{ color: themeColors.muted }}>
                        Something went wrong on our end. Please try again later
                        or contact support if the problem persists.
                    </p>
                    <Link href="/">
                        <Button>Return to Dashboard</Button>
                    </Link>
                </div>
            </div>
        </>
    );
}
