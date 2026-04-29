import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
    title: string
    description?: string
    children?: ReactNode
    className?: string
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
    return (
        <div className={cn('pb-6', className)}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-2">
                    <h1
                        className="text-3xl tracking-[-0.02em] sm:text-4xl"
                        style={{ color: 'var(--foreground)', fontWeight: 500, lineHeight: 1.1 }}
                    >
                        {title}
                    </h1>
                    {description && (
                        <p className="max-w-2xl text-sm" style={{ color: 'var(--muted-foreground)' }}>
                            {description}
                        </p>
                    )}
                </div>
                {children && (
                    <div className="flex flex-wrap items-center gap-2 shrink-0">{children}</div>
                )}
            </div>
            <div
                className="mt-5 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, var(--border) 30%, var(--border) 70%, transparent)' }}
            />
        </div>
    )
}
