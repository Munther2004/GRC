import { Head, Link } from '@inertiajs/react';
import { ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error403() {
    return (
        <>
            <Head title="403 — Forbidden" />
            <div className="dark flex min-h-screen items-center justify-center bg-background p-6">
                <div className="max-w-md text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
                            <ShieldOff className="h-10 w-10 text-red-500" />
                        </div>
                    </div>
                    <h1 className="mb-2 text-6xl font-bold text-foreground">
                        403
                    </h1>
                    <h2 className="mb-3 text-xl font-semibold text-muted-foreground">
                        Access Denied
                    </h2>
                    <p className="mb-8 text-muted-foreground">
                        You don't have permission to access this page. Contact
                        your administrator if you believe this is a mistake.
                    </p>
                    <Link href="/">
                        <Button>Go to Dashboard</Button>
                    </Link>
                </div>
            </div>
        </>
    );
}
