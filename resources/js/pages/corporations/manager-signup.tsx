import { Head, useForm } from '@inertiajs/react';
import { route } from '@/lib/routes';
import AuthLayout from '@/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Lock, Mail, User } from 'lucide-react';

interface Corporation {
    id: number;
    name: string;
    email: string;
}

interface Props {
    corporation: Corporation;
}

export default function ManagerSignup({ corporation }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('corporations.manager-register', corporation.id));
    };

    return (
        <AuthLayout
            title="Create Your Account"
            description={`Set up your manager account for ${corporation.name}`}
        >
            <Head title="Create Manager Account" />

            <div className="space-y-6">
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            Corporation Approved!
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 text-sm text-green-800 dark:text-green-200">
                            <p className="font-medium mb-1">
                                🎉 Welcome to GRC Platform
                            </p>
                            <p>
                                <strong>{corporation.name}</strong> has been approved! 
                                Now create your manager account to get started.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 text-sm">
                            <div className="flex gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                                <div className="flex-shrink-0">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-slate-100">
                                        As Manager
                                    </p>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        You'll manage compliance, controls, and team members
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                                <div className="flex-shrink-0">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-slate-100">
                                        Secure Access
                                    </p>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Your account is unique and protected with encryption
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Create Your Manager Account
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="Your full name"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    placeholder="your@email.com"
                                    className={errors.email ? 'border-red-500' : ''}
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    placeholder="••••••••"
                                    className={errors.password ? 'border-red-500' : ''}
                                />
                                {errors.password && (
                                    <p className="text-xs text-red-500">
                                        {errors.password}
                                    </p>
                                )}
                                <p className="text-xs text-slate-500">
                                    At least 8 characters
                                </p>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="password_confirmation">
                                    Confirm Password *
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="••••••••"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full"
                            >
                                {processing
                                    ? 'Creating Account...'
                                    : 'Create Account & Sign In'}
                            </Button>
                        </form>

                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                By creating an account, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 text-sm text-blue-800 dark:text-blue-200">
                    <div className="flex gap-3">
                        <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium mb-1">Next Steps</p>
                            <p>
                                After signing in, you can invite team members from your organization to join and start managing compliance controls.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
