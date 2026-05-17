import {
    Check,
    Copy,
    FileWarning,
    FingerprintIcon,
    ShieldAlert,
    ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { FileReputationBadge } from '@/components/admin/file-reputation-badge';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import type { FileIntegrityStatus, FileReputationCheck } from '@/types';

interface Props {
    reputationCheck: FileReputationCheck | null;
}

function formatDate(value: string | null): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
}

function truncateHash(hash: string): string {
    if (hash.length <= 20) return hash;
    return `${hash.slice(0, 10)}…${hash.slice(-6)}`;
}

export function FileReputationDetail({ reputationCheck }: Props) {
    if (!reputationCheck) return null;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="View reputation check details"
                >
                    <FileReputationBadge reputationCheck={reputationCheck} />
                </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-96">
                <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">
                            File Reputation
                        </p>
                        <span className="text-xs text-muted-foreground capitalize">
                            {reputationCheck.provider}
                        </span>
                    </div>

                    <IntegritySection
                        integrityStatus={reputationCheck.integrity_status}
                        uploadHash={reputationCheck.upload_sha256}
                        currentHash={reputationCheck.sha256}
                    />

                    <div className="grid grid-cols-2 gap-2">
                        <DetailStat
                            label="Malicious"
                            value={reputationCheck.malicious_count}
                            tone={
                                reputationCheck.malicious_count > 0
                                    ? 'red'
                                    : 'muted'
                            }
                        />
                        <DetailStat
                            label="Suspicious"
                            value={reputationCheck.suspicious_count}
                            tone={
                                reputationCheck.suspicious_count > 0
                                    ? 'amber'
                                    : 'muted'
                            }
                        />
                        <DetailStat
                            label="Undetected"
                            value={reputationCheck.undetected_count}
                            tone="muted"
                        />
                        <DetailStat
                            label="Harmless"
                            value={reputationCheck.harmless_count}
                            tone={
                                reputationCheck.harmless_count > 0
                                    ? 'green'
                                    : 'muted'
                            }
                        />
                    </div>

                    <div className="space-y-1 border-t border-border pt-2 text-[11px] text-muted-foreground">
                        <p>
                            Last analysis:{' '}
                            <span className="text-foreground">
                                {formatDate(reputationCheck.last_analysis_date)}
                            </span>
                        </p>
                        <p>
                            Checked:{' '}
                            <span className="text-foreground">
                                {formatDate(reputationCheck.checked_at)}
                            </span>
                        </p>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

function IntegrityHeader({ status }: { status: FileIntegrityStatus }) {
    if (status === 'verified') {
        return (
            <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="font-medium">File Integrity: Verified ✓</span>
            </span>
        );
    }
    if (status === 'tampered') {
        return (
            <span className="inline-flex items-center gap-1 text-red-700 dark:text-red-400">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span className="font-medium">File Integrity: Tampered ✗</span>
            </span>
        );
    }
    if (status === 'error') {
        return (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
                <FileWarning className="h-3.5 w-3.5" />
                <span className="font-medium">File Integrity: Unknown</span>
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 text-muted-foreground">
            <FingerprintIcon className="h-3.5 w-3.5" />
            <span className="font-medium">File Integrity: Unknown</span>
        </span>
    );
}

function IntegritySection({
    integrityStatus,
    uploadHash,
    currentHash,
}: {
    integrityStatus: FileIntegrityStatus;
    uploadHash: string | null;
    currentHash: string | null;
}) {
    const noHashes = !uploadHash && !currentHash;
    if (noHashes && !integrityStatus) return null;

    return (
        <div className="rounded border border-border bg-muted/40 p-2">
            <IntegrityHeader status={integrityStatus} />

            <div className="mt-2 space-y-2">
                <HashRow
                    label="Original (upload)"
                    hash={uploadHash}
                    fallback="No baseline hash recorded"
                />
                <HashRow
                    label="Current (on disk)"
                    hash={currentHash}
                    fallback="-"
                    highlightChange={
                        integrityStatus === 'tampered' &&
                        Boolean(uploadHash) &&
                        Boolean(currentHash)
                    }
                />
            </div>
        </div>
    );
}

function HashRow({
    label,
    hash,
    fallback,
    highlightChange = false,
}: {
    label: string;
    hash: string | null;
    fallback: string;
    highlightChange?: boolean;
}) {
    const [copied, setCopied] = useState(false);

    const onCopy = async () => {
        if (!hash) return;
        try {
            await navigator.clipboard.writeText(hash);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            // Clipboard not available — fail silently.
        }
    };

    return (
        <div>
            <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                {label}
            </p>
            {hash ? (
                <div className="flex items-center gap-1">
                    <code
                        className={`flex-1 truncate rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] ${
                            highlightChange
                                ? 'text-red-700 dark:text-red-400'
                                : ''
                        }`}
                        title={hash}
                    >
                        {truncateHash(hash)}
                    </code>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={onCopy}
                        title="Copy full hash"
                    >
                        {copied ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                            <Copy className="h-3.5 w-3.5" />
                        )}
                    </Button>
                </div>
            ) : (
                <p className="text-[11px] italic text-muted-foreground">
                    {fallback}
                </p>
            )}
        </div>
    );
}

function DetailStat({
    label,
    value,
    tone,
}: {
    label: string;
    value: number;
    tone: 'red' | 'amber' | 'green' | 'muted';
}) {
    const toneClass = {
        red: 'text-red-600 dark:text-red-400',
        amber: 'text-amber-600 dark:text-amber-400',
        green: 'text-green-600 dark:text-green-400',
        muted: 'text-foreground',
    }[tone];

    return (
        <div className="rounded border border-border bg-muted/50 px-2 py-1.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {label}
            </p>
            <p className={`text-sm font-semibold ${toneClass}`}>{value}</p>
        </div>
    );
}
