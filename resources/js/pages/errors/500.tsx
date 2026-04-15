import { Head, Link } from '@inertiajs/react';
import { ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error500() {
    return (
        <>
            <Head title="500 — Server Error" />
            <div className="dark flex min-h-screen items-center justify-center bg-background p-6">
                <div className="max-w-md text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950">
                            <ServerCrash className="h-10 w-10 text-orange-500" />
                        </div>
                    </div>
                    <h1 className="mb-2 text-6xl font-bold text-foreground">
                        500
                    </h1>
                    <h2 className="mb-3 text-xl font-semibold text-muted-foreground">
                        Server Error
                    </h2>
                    <p className="mb-8 text-muted-foreground">
                        Something went wrong on our end. Please try again later
                        or contact support if the problem persists.
                    </p>
                    <Link href="/">
                        <Button>Go to Dashboard</Button>
                    </Link>
                </div>
            </div>
        </>
    );
}
