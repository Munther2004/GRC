import { Head, router, useForm } from '@inertiajs/react';
import { Copy, Link2, Mail, RefreshCw, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { route } from '@/lib/routes';

interface CorporationLite {
    id: number;
    name: string;
}

interface Shareable {
    id: number;
    token: string;
    url: string;
    expires_at: string | null;
    use_count: number;
    created_at: string | null;
}

interface EmailInvite {
    id: number;
    email: string;
    status: 'active' | 'expired' | 'used' | 'revoked';
    expires_at: string | null;
    created_at: string | null;
    last_used_at: string | null;
    use_count: number;
    url: string;
}

interface Props {
    corporation: CorporationLite | null;
    shareable: Shareable | null;
    emailInvites: EmailInvite[];
    allCorporations: CorporationLite[];
    isSuperAdmin: boolean;
}

export default function InvitesIndex({ corporation, shareable, emailInvites, allCorporations, isSuperAdmin }: Props) {
    const confirm = useConfirm();
    const [copied, setCopied] = useState(false);

    const shareableForm = useForm({
        expires_in_minutes: '60',
        corporation_id: corporation?.id ?? '',
    });

    const emailForm = useForm({
        email: '',
        expires_in_days: '7',
        corporation_id: corporation?.id ?? '',
    });

    const switchCorp = (id: string) => {
        router.get(route('admin.invites.index'), { corporation_id: id }, { preserveState: false });
    };

    const generate = (e: React.FormEvent) => {
        e.preventDefault();
        shareableForm.post(route('admin.invites.shareable'), { preserveScroll: true });
    };

    const sendEmail = (e: React.FormEvent) => {
        e.preventDefault();
        emailForm.post(route('admin.invites.email'), {
            preserveScroll: true,
            onSuccess: () => emailForm.reset('email'),
        });
    };

    const copyLink = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const revoke = async (id: number) => {
        const ok = await confirm({
            title: 'Revoke this invite?',
            description: 'The link will stop working immediately.',
            confirmLabel: 'Revoke',
            tone: 'destructive',
        });
        if (ok) {
            router.delete(route('admin.invites.destroy', id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <Head title="Invite Employees" />

            <div className="mx-auto max-w-5xl space-y-6 p-6">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
                            Invite Employees
                        </h1>
                        <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                            {corporation
                                ? <>Invite employees to join <strong>{corporation.name}</strong>.</>
                                : 'Select a corporation to manage invites.'}
                        </p>
                    </div>
                    <div className="rounded-full p-2" style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)' }}>
                        <Users className="h-5 w-5" style={{ color: 'var(--primary)' }} />
                    </div>
                </header>

                {isSuperAdmin && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Corporation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select value={String(corporation?.id ?? '')} onValueChange={switchCorp}>
                                <SelectTrigger className="max-w-md">
                                    <SelectValue placeholder="Select a corporation…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allCorporations.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                )}

                {corporation && (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Link2 className="h-4 w-4" />
                                    Shareable invite link
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {shareable ? (
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <Input value={shareable.url} readOnly className="font-mono text-xs" />
                                            <Button type="button" variant="outline" onClick={() => copyLink(shareable.url)}>
                                                <Copy className="mr-1 h-4 w-4" />
                                                {copied ? 'Copied' : 'Copy'}
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                            <span>Uses: {shareable.use_count}</span>
                                            <span>•</span>
                                            <span>{shareable.expires_at ? `Expires ${new Date(shareable.expires_at).toLocaleString()}` : 'No expiry'}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                                        No active shareable link. Generate one below.
                                    </p>
                                )}

                                <form onSubmit={generate} className="flex flex-wrap items-end gap-3 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Expires in (minutes)</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={525600}
                                            value={shareableForm.data.expires_in_minutes}
                                            onChange={(e) => shareableForm.setData('expires_in_minutes', e.target.value)}
                                            placeholder="e.g. 60"
                                            className="w-44"
                                        />
                                    </div>
                                    <Button type="submit" disabled={shareableForm.processing}>
                                        <RefreshCw className="mr-1 h-4 w-4" />
                                        {shareable ? 'Regenerate link' : 'Generate link'}
                                    </Button>
                                    {shareableForm.errors.expires_in_minutes && (
                                        <p className="text-xs" style={{ color: 'var(--destructive)' }}>{shareableForm.errors.expires_in_minutes}</p>
                                    )}
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4" />
                                    Send email invite
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form onSubmit={sendEmail} className="grid gap-3 sm:grid-cols-[1fr_140px_auto] sm:items-end">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Employee email</Label>
                                        <Input
                                            type="email"
                                            value={emailForm.data.email}
                                            onChange={(e) => emailForm.setData('email', e.target.value)}
                                            placeholder="employee@company.com"
                                            required
                                            aria-invalid={!!emailForm.errors.email}
                                        />
                                        {emailForm.errors.email && (
                                            <p className="text-xs" style={{ color: 'var(--destructive)' }}>{emailForm.errors.email}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Expires (days)</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={90}
                                            value={emailForm.data.expires_in_days}
                                            onChange={(e) => emailForm.setData('expires_in_days', e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" disabled={emailForm.processing}>
                                        Send invite
                                    </Button>
                                </form>

                                {emailInvites.length > 0 && (
                                    <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                                        <table className="w-full text-sm">
                                            <thead style={{ background: 'var(--muted)' }}>
                                                <tr>
                                                    <th className="px-3 py-2 text-left font-medium">Email</th>
                                                    <th className="px-3 py-2 text-left font-medium">Status</th>
                                                    <th className="px-3 py-2 text-left font-medium">Sent</th>
                                                    <th className="px-3 py-2 text-left font-medium">Expires</th>
                                                    <th className="px-3 py-2"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {emailInvites.map((inv) => (
                                                    <tr key={inv.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                                                        <td className="px-3 py-2">{inv.email}</td>
                                                        <td className="px-3 py-2"><StatusBadge status={inv.status} /></td>
                                                        <td className="px-3 py-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                            {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : '-'}
                                                        </td>
                                                        <td className="px-3 py-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                            {inv.expires_at ? new Date(inv.expires_at).toLocaleDateString() : 'never'}
                                                        </td>
                                                        <td className="px-3 py-2 text-right">
                                                            <div className="flex justify-end gap-1">
                                                                {inv.status === 'active' && (
                                                                    <Button type="button" variant="ghost" size="sm" onClick={() => copyLink(inv.url)}>
                                                                        <Copy className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                )}
                                                                {inv.status === 'active' && (
                                                                    <Button type="button" variant="ghost" size="sm" onClick={() => revoke(inv.id)}>
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}

function StatusBadge({ status }: { status: EmailInvite['status'] }) {
    const map: Record<EmailInvite['status'], { label: string; tone: string }> = {
        active: { label: 'Active', tone: 'var(--primary)' },
        used: { label: 'Used', tone: 'var(--chart-2)' },
        expired: { label: 'Expired', tone: 'var(--muted-foreground)' },
        revoked: { label: 'Revoked', tone: 'var(--destructive)' },
    };
    const { label, tone } = map[status];
    return (
        <Badge
            variant="outline"
            style={{ color: tone, borderColor: `color-mix(in srgb, ${tone} 35%, transparent)` }}
        >
            {label}
        </Badge>
    );
}
