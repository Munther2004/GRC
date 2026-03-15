import { Head, Link } from '@inertiajs/react';
import { ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error500() {
    return (
        <>
            <Head title="500 — Server Error" />
            <div className="min-h-screen bg-background dark flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                            <ServerCrash className="w-10 h-10 text-orange-500" />
                        </div>
                    </div>
                    <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">500</h1>
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Server Error</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        Something went wrong on our end. Please try again later or contact support if the problem persists.
                    </p>
                    <Link href="/">
                        <Button>Go to Dashboard</Button>
                    </Link>
                </div>
            </div>
        </>
    );
}
