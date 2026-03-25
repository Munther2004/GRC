import { usePage } from '@inertiajs/react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/header';
import { AdminSidebar } from '@/components/admin/sidebar';

function FlashToast() {
    const { flash } = usePage().props as any;

    // Derive message directly from flash prop (no state sync needed)
    const flashKey = (flash?.success ?? '') + (flash?.error ?? '');
    const message = flash?.success
        ? { type: 'success' as const, text: flash.success as string }
        : flash?.error
          ? { type: 'error' as const, text: flash.error as string }
          : null;

    const [dismissedKey, setDismissedKey] = useState('');

    const visible = flashKey !== '' && flashKey !== dismissedKey;

    useEffect(() => {
        if (!visible) return;
        const t = setTimeout(() => setDismissedKey(flashKey), 4000);
        return () => clearTimeout(t);
    }, [visible, flashKey]);

    if (!visible || !message) return null;

    const isSuccess = message.type === 'success';

    return (
        <div
            className={`fixed right-6 bottom-6 z-50 flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${
                isSuccess
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-red-200 bg-red-50 text-red-800'
            }`}
        >
            {isSuccess ? (
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
            ) : (
                <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
            )}
            <span className="flex-1">{message.text}</span>
            <button
                onClick={() => setDismissedKey(flashKey)}
                className="flex-shrink-0 opacity-60 hover:opacity-100"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="dark min-h-screen bg-background">
            <AdminSidebar />
            <div className="lg:pl-64">
                <AdminHeader />
                <main className="p-6">{children}</main>
            </div>
            <FlashToast />
        </div>
    );
}
