import { Head, Link } from '@inertiajs/react';
import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error404() {
    return (
        <>
            <Head title="404 — Not Found" />
            <div className="dark flex min-h-screen items-center justify-center bg-background p-6">
                <div className="max-w-md text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-950">
                            <SearchX className="h-10 w-10 text-yellow-500" />
                        </div>
                    </div>
                    <h1 className="mb-2 text-6xl font-bold text-foreground">
                        404
                    </h1>
                    <h2 className="mb-3 text-xl font-semibold text-gray-700 dark:text-gray-200">
                        Page Not Found
                    </h2>
                    <p className="mb-8 text-muted-foreground">
                        The page you're looking for doesn't exist or has been
                        moved.
                    </p>
                    <Link href="/">
                        <Button>Go to Dashboard</Button>
                    </Link>
                </div>
            </div>
        </>
    );
}
