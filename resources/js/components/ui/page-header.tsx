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
                <p className="font-display text-[9px] uppercase tracking-[0.3em]" style={{ color: '#408A71' }}>
                    Volume {volume}
                </p>
            )}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="font-heading text-3xl font-normal leading-tight" style={{ color: '#E0F5EC' }}>
                        {title}
                    </h1>
                    {description && (
                        <p className="font-body italic text-base" style={{ color: '#7ABFA8' }}>
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
                className="mt-3"
                style={{
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, #285A48 15%, #408A71 50%, #285A48 85%, transparent)',
                    opacity: 0.7,
                }}
            />
        </div>
    )
}
