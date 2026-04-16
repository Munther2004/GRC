import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FilterBarProps {
    children: ReactNode
    className?: string
}

/** Aged oak filter row — replaces Card-wrapped filter sections */
export function FilterBar({ children, className }: FilterBarProps) {
    return (
        <div
            className={cn('flex flex-wrap items-center gap-2 rounded px-4 py-3', className)}
            style={{ background: '#251E19', border: '1px solid #4A3F35' }}
        >
            {children}
        </div>
    )
}
