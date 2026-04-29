import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FilterBarProps {
    children: ReactNode
    className?: string
}

export function FilterBar({ children, className }: FilterBarProps) {
    return (
        <div
            className={cn('flex flex-wrap items-center gap-2.5 rounded-2xl px-4 py-3', className)}
            style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: '0 10px 30px -16px color-mix(in srgb, var(--foreground) 14%, transparent)',
            }}
        >
            {children}
        </div>
    )
}
