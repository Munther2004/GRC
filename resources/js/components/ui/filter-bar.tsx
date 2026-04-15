import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FilterBarProps {
    children: ReactNode
    className?: string
}

/** A flat, borderless filter row — replaces the Card-wrapped filter sections */
export function FilterBar({ children, className }: FilterBarProps) {
    return (
        <div className={cn(
            'flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-4 py-3',
            className,
        )}>
            {children}
        </div>
    )
}
