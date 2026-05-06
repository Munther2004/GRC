import {
    Loader2,
    ShieldAlert,
    ShieldCheck,
    ShieldQuestion,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { FileReputationCheck } from '@/types';

interface Props {
    reputationCheck: FileReputationCheck | null;
    /** Render a faint "Not checked" hint when no record exists. Default: false. */
    showWhenMissing?: boolean;
    className?: string;
}

const ICON_CLASS = 'h-3.5 w-3.5';

export function FileReputationBadge({
    reputationCheck,
    showWhenMissing = false,
    className,
}: Props) {
    if (!reputationCheck) {
        if (!showWhenMissing) return null;
        return (
            <span className="text-xs text-muted-foreground italic">
                Not checked
            </span>
        );
    }

    const detections =
        reputationCheck.malicious_count + reputationCheck.suspicious_count;

    switch (reputationCheck.status) {
        case 'malicious':
            return (
                <Badge
                    variant="outline"
                    className={`gap-1 border-red-300 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400 ${className ?? ''}`}
                >
                    <ShieldAlert className={ICON_CLASS} />
                    Malicious ({reputationCheck.malicious_count}{' '}
                    {reputationCheck.malicious_count === 1
                        ? 'detection'
                        : 'detections'}
                    )
                </Badge>
            );

        case 'suspicious':
            return (
                <Badge
                    variant="outline"
                    className={`gap-1 border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400 ${className ?? ''}`}
                >
                    <ShieldAlert className={ICON_CLASS} />
                    Suspicious ({detections}{' '}
                    {detections === 1 ? 'detection' : 'detections'})
                </Badge>
            );

        case 'clean':
            return (
                <Badge
                    variant="outline"
                    className={`gap-1 border-green-300 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400 ${className ?? ''}`}
                >
                    <ShieldCheck className={ICON_CLASS} />
                    No Detections
                </Badge>
            );

        case 'pending':
            return (
                <Badge
                    variant="outline"
                    className={`gap-1 border-border bg-muted text-muted-foreground ${className ?? ''}`}
                >
                    <Loader2 className={`${ICON_CLASS} animate-spin`} />
                    Checking…
                </Badge>
            );

        case 'not_found':
            return (
                <Badge
                    variant="outline"
                    className={`gap-1 border-border bg-muted text-muted-foreground ${className ?? ''}`}
                >
                    <ShieldQuestion className={ICON_CLASS} />
                    Not in VirusTotal
                </Badge>
            );

        case 'error':
            return (
                <Badge
                    variant="outline"
                    className={`gap-1 border-border bg-muted text-muted-foreground ${className ?? ''}`}
                >
                    Check Unavailable
                </Badge>
            );

        case 'unknown':
        default:
            return (
                <Badge
                    variant="outline"
                    className={`gap-1 border-border bg-muted text-muted-foreground ${className ?? ''}`}
                >
                    <ShieldQuestion className={ICON_CLASS} />
                    Unknown
                </Badge>
            );
    }
}
