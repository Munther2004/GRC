import { Head, Link } from '@inertiajs/react';
import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error404() {
    return (
        <>
            <Head title="404 — Not Found" />
            <div className="min-h-screen bg-background dark flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-950 flex items-center justify-center">
                            <SearchX className="w-10 h-10 text-yellow-500" />
                        </div>
                    </div>
                    <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Page Not Found</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                    <Link href="/">
                        <Button>Go to Dashboard</Button>
                    </Link>
                </div>
            </div>
        </>
    );
}
