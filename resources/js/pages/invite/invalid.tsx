import { Head, Link } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

interface Props {
    reason: string;
}

const REASON_MAP: Record<string, { title: string; body: string }> = {
    expired: { title: 'Invitation expired', body: 'This invitation link has expired. Ask your administrator to send a new one.' },
    used: { title: 'Invitation already used', body: 'This invitation has already been redeemed.' },
    revoked: { title: 'Invitation revoked', body: 'This invitation has been revoked by your administrator.' },
    not_found: { title: 'Invitation not found', body: 'We could not find that invitation. The link may be incorrect.' },
};

export default function InviteInvalid({ reason }: Props) {
    const { title, body } = REASON_MAP[reason] ?? REASON_MAP.not_found;

    return (
        <AuthLayout title={title} description={body}>
            <Head title={title} />
            <div className="space-y-4">
                <div
                    className="rounded-2xl p-5 flex gap-3"
                    style={{
                        background: 'color-mix(in srgb, var(--destructive) 6%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--destructive) 22%, transparent)',
                    }}
                >
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: 'var(--destructive)' }} />
                    <p className="text-sm" style={{ color: 'var(--foreground)' }}>{body}</p>
                </div>
                <Link href="/">
                    <Button variant="outline" className="w-full">Back to home</Button>
                </Link>
            </div>
        </AuthLayout>
    );
}
