import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
    title: string
    description?: string
    children?: ReactNode
    className?: string
    /** Optional Roman numeral — e.g. "I", "II", "III" */
    volume?: string
}

export function PageHeader({ title, description, children, className, volume }: PageHeaderProps) {
    return (
        <div className={cn('space-y-1 pb-5', className)}>
            {volume && (
                <p className="font-display text-[10px] font-medium uppercase tracking-[0.12em] text-primary">
                    Volume {volume}
                </p>
            )}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="font-heading text-2xl font-semibold leading-tight tracking-tight text-foreground">
                        {title}
                    </h1>
                    {description && (
                        <p className="font-body text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                {children && (
                    <div className="flex items-center gap-2 shrink-0">{children}</div>
                )}
            </div>
            {/* Ornate gradient rule */}
            <div
                className="mt-3 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-70"
            />
        </div>
    )
}
