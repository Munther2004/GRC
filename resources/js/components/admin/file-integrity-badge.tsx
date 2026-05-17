import { FileWarning, FingerprintIcon, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { FileIntegrityStatus } from '@/types';

interface Props {
    integrityStatus: FileIntegrityStatus;
    className?: string;
}

const ICON_CLASS = 'h-3.5 w-3.5';

/**
 * Inline badge that signals whether the file on disk matches the upload-time
 * SHA-256. Intentionally separate from FileReputationBadge — reputation is
 * about safety (does the world think this file is malicious?), integrity is
 * about trust (has anyone modified it since we received it?).
 */
export function FileIntegrityBadge({ integrityStatus, className }: Props) {
    if (!integrityStatus) return null;

    switch (integrityStatus) {
        case 'verified':
            return (
                <Badge
                    variant="outline"
                    className={`gap-1 border-green-300 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400 ${className ?? ''}`}
                    title="The current file matches the SHA-256 recorded at upload"
                >
                    <FingerprintIcon className={ICON_CLASS} />
                    Integrity Verified
                </Badge>
            );

        case 'tampered':
            return (
                <Badge
                    variant="outline"
                    className={`gap-1 border-red-400 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400 ${className ?? ''}`}
                    title="The file on disk does not match the SHA-256 recorded at upload"
                >
                    <ShieldAlert className={ICON_CLASS} />
                    Integrity Tampered
                </Badge>
            );

        case 'error':
            return (
                <Badge
                    variant="outline"
                    className={`gap-1 border-border bg-muted text-muted-foreground ${className ?? ''}`}
                    title="Could not verify integrity (file missing or unreadable)"
                >
                    <FileWarning className={ICON_CLASS} />
                    Integrity Unknown
                </Badge>
            );

        case 'unknown':
        default:
            return (
                <Badge
                    variant="outline"
                    className={`gap-1 border-border bg-muted text-muted-foreground ${className ?? ''}`}
                    title="No baseline hash was recorded; file uploaded before integrity tracking was enabled"
                >
                    <FingerprintIcon className={ICON_CLASS} />
                    Integrity Unknown
                </Badge>
            );
    }
}
