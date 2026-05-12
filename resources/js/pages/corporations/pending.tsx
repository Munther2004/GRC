import { Head, Link } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Clock, LogIn, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';
import { route } from '@/lib/routes';

interface Corporation {
    id: number;
    name: string;
    email: string;
    status: 'pending' | 'approved' | 'rejected';
}

interface Props {
    corporation: Corporation;
}

export default function CorporationPending({ corporation }: Props) {
    const isPending = corporation.status === 'pending';
    const isApproved = corporation.status === 'approved';
    const isRejected = corporation.status === 'rejected';

    const statusIcon = isPending ? <Clock className="h-4 w-4" /> : isApproved ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />;
    const statusLabel = isPending ? 'Pending approval' : isApproved ? 'Approved' : 'Rejected';
    const statusTone = isPending
        ? 'var(--chart-3)'
        : isApproved
            ? 'var(--primary)'
            : 'var(--destructive)';

    return (
        <AuthLayout
            title="Registration status"
            description={`Status of your registration for ${corporation.name}`}
        >
            <Head title="Registration Status" />

            <div className="space-y-5">
                <div
                    className="rounded-2xl p-5"
                    style={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <span
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px]"
                            style={{
                                background: `color-mix(in srgb, ${statusTone} 12%, transparent)`,
                                color: statusTone,
                                border: `1px solid color-mix(in srgb, ${statusTone} 28%, transparent)`,
                            }}
                        >
                            {statusIcon}
                            {statusLabel}
                        </span>
                    </div>
                    <p className="mt-3 text-base" style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                        {corporation.name}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        {corporation.email}
                    </p>
                </div>

                {isPending && (
                    <div className="space-y-4">
                        <InfoBlock
                            tone="var(--chart-3)"
                            icon={<Clock className="h-4 w-4" />}
                            title="Awaiting administrator review"
                            body="Your registration is under review. We will notify you once a decision is made."
                        />
                        <InfoBlock
                            tone="var(--chart-2)"
                            icon={<Mail className="h-4 w-4" />}
                            title="Email notification"
                            body={
                                <>
                                    When approved, we will email <strong style={{ color: 'var(--foreground)' }}>{corporation.email}</strong> with your manager credentials and next steps.
                                </>
                            }
                        />
                        <InfoBlock
                            tone="var(--primary)"
                            icon={<Shield className="h-4 w-4" />}
                            title="What to expect"
                            body={
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Manager account credentials</li>
                                    <li>Direct link to log in to the platform</li>
                                    <li>Access to controls and assessments</li>
                                </ul>
                            }
                        />
                    </div>
                )}

                {isApproved && (
                    <>
                        <InfoBlock
                            tone="var(--primary)"
                            icon={<CheckCircle2 className="h-4 w-4" />}
                            title="Your corporation is approved."
                            body={
                                <>
                                    Manager credentials have been emailed to <strong style={{ color: 'var(--foreground)' }}>{corporation.email}</strong>. Use them to log in below.
                                </>
                            }
                        />

                        <Link href={route('login')}>
                            <Button className="w-full gap-2">
                                <LogIn className="h-4 w-4" />
                                Log in to GRC Platform
                            </Button>
                        </Link>
                    </>
                )}

                {isRejected && (
                    <InfoBlock
                        tone="var(--destructive)"
                        icon={<AlertCircle className="h-4 w-4" />}
                        title="Registration rejected"
                        body="Please contact support for more information."
                    />
                )}
            </div>
        </AuthLayout>
    );
}

function InfoBlock({
    tone,
    icon,
    title,
    body,
}: {
    tone: string;
    icon: React.ReactNode;
    title: string;
    body: React.ReactNode;
}) {
    return (
        <div
            className="rounded-2xl p-4"
            style={{
                background: `color-mix(in srgb, ${tone} 6%, transparent)`,
                border: `1px solid color-mix(in srgb, ${tone} 22%, transparent)`,
            }}
        >
            <div className="flex items-start gap-3">
                <span
                    className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full shrink-0"
                    style={{
                        background: `color-mix(in srgb, ${tone} 14%, transparent)`,
                        color: tone,
                    }}
                >
                    {icon}
                </span>
                <div className="text-sm">
                    <p style={{ color: 'var(--foreground)', fontWeight: 500 }}>{title}</p>
                    <div className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
                        {body}
                    </div>
                </div>
            </div>
        </div>
    );
}
