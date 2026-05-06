import { router } from '@inertiajs/react';
import { Loader2, ScanSearch } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { route } from '@/lib/routes';
import type { FileReputationCheck } from '@/types';

interface Props {
    evidenceId: number;
    hasFile: boolean;
    existingCheck: FileReputationCheck | null;
    /** Optional override of the route name; lets the same component be reused
     *  for SecurityAudit reputation checks without duplicating logic. */
    routeName?: string;
    /** Override the param name. Defaults to 'evidence' to match the route. */
    routeParamName?: string;
    className?: string;
}

export function CheckReputationButton({
    evidenceId,
    hasFile,
    existingCheck,
    routeName = 'admin.evidence.reputation-check',
    routeParamName = 'evidence',
    className,
}: Props) {
    const [submitting, setSubmitting] = useState(false);

    const isPending = existingCheck?.status === 'pending';
    const disabled = !hasFile || submitting || isPending;
    const label = existingCheck ? 'Re-check' : 'Check Reputation';

    const onClick = () => {
        if (disabled) return;
        setSubmitting(true);
        router.post(
            route(routeName, { [routeParamName]: evidenceId }),
            {},
            {
                preserveScroll: true,
                onFinish: () => setSubmitting(false),
            },
        );
    };

    const button = (
        <Button
            type="button"
            variant="outline"
            size="sm"
            className={`h-8 gap-1.5 px-2.5 text-xs ${className ?? ''}`}
            disabled={disabled}
            onClick={onClick}
            aria-label={label}
        >
            {submitting || isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
                <ScanSearch className="h-3.5 w-3.5" />
            )}
            {label}
        </Button>
    );

    if (!hasFile) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span tabIndex={0} className="inline-flex">
                            {button}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        No file is attached to this evidence.
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return button;
}
