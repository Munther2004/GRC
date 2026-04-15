import { Head, Link } from '@inertiajs/react';
import { ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error403() {
    return (
        <>
            <Head title="403 — Forbidden" />
            <div className="min-h-screen bg-background dark flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                            <ShieldOff className="w-10 h-10 text-red-500" />
                        </div>
                    </div>
                    <h1 className="text-6xl font-bold text-foreground mb-2">403</h1>
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Access Denied</h2>
                    <p className="text-muted-foreground mb-8">
                        You don't have permission to access this page. Contact your administrator if you believe this is a mistake.
                    </p>
                    <Link href="/">
                        <Button>Go to Dashboard</Button>
                    </Link>
                </div>
            </div>
        </>
    );
}
