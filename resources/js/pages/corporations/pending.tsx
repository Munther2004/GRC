import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, Clock, CheckCircle2, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { route } from '@/lib/routes';

interface Corporation {
    id: number;
    name: string;
    email: string;
    status: 'pending' | 'approved' | 'rejected';
    registration_code?: string;
}

interface Props {
    corporation: Corporation;
}

export default function CorporationPending({ corporation }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('corporations.verify-code', corporation.id));
    };

    const isPending = corporation.status === 'pending';
    const isApproved = corporation.status === 'approved';
    const isRejected = corporation.status === 'rejected';

    return (
        <AuthLayout
            title="Registration Status"
            description={`Check the status of your registration for ${corporation.name}`}
        >
            <Head title="Registration Status" />

            <div className="space-y-6">
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {isPending && (
                                <>
                                    <Clock className="h-5 w-5 text-yellow-500" />
                                    Pending Approval
                                </>
                            )}
                            {isApproved && (
                                <>
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    Approved!
                                </>
                            )}
                            {isRejected && (
                                <>
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                    Rejected
                                </>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="font-medium">{corporation.name}</p>
                            <p className="text-sm text-muted-foreground">
                                {corporation.email}
                            </p>
                        </div>

                        {isPending && (
                            <div className="space-y-4">
                                <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 p-4 text-sm text-yellow-800 dark:text-yellow-200">
                                    <div className="flex items-start gap-3">
                                        <Clock className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium mb-1">Awaiting Administrator Review</p>
                                            <p>Your registration is currently under review by our administrators.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 text-sm text-blue-800 dark:text-blue-200">
                                    <div className="flex items-start gap-3">
                                        <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium mb-1">Email Notification</p>
                                            <p>When your application is approved, we'll send a detailed email to <strong>{corporation.email}</strong> with your manager credentials and next steps.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-4 text-sm text-slate-700 dark:text-slate-300">
                                    <div className="flex items-start gap-3">
                                        <Shield className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium mb-1">What to Expect</p>
                                            <ul className="list-disc list-inside space-y-1 ml-1">
                                                <li>Unique registration code for your organization</li>
                                                <li>Manager account credentials</li>
                                                <li>Instructions to set up your first users</li>
                                                <li>Access to compliance controls and assessments</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900">
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">📧 Check Your Status</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        We'll send an email to <strong>{corporation.email}</strong> once approved. You can bookmark this page to return and check your status anytime.
                                    </p>
                                </div>
                            </div>
                        )}

                        {isApproved && (
                            <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 text-sm text-green-800 dark:text-green-200">
                                <p className="mb-3 font-medium">
                                    Congratulations! Your corporation has been
                                    approved.
                                </p>
                                <p>
                                    Your manager now has access to an exclusive
                                    registration code. Enter it below to create
                                    your account and proceed to user sign-up.
                                </p>
                            </div>
                        )}

                        {isRejected && (
                            <div className="rounded-lg bg-red-50 dark:bg-red-950 p-4 text-sm text-red-800 dark:text-red-200">
                                Your registration has been rejected. Please
                                contact support for more information.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {isApproved && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Enter Registration Code
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="code">
                                        Registration Code *
                                    </Label>
                                    <Input
                                        id="code"
                                        type="text"
                                        required
                                        autoFocus
                                        value={data.code}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>,
                                        ) =>
                                            setData('code', e.target.value)
                                        }
                                        placeholder="Enter your corporation code"
                                        className="font-mono text-lg tracking-widest"
                                    />
                                    {errors.code && (
                                        <p className="text-xs text-red-500">
                                            {errors.code}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full"
                                >
                                    {processing
                                        ? 'Verifying...'
                                        : 'Verify Code & Continue'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthLayout>
    );
}
