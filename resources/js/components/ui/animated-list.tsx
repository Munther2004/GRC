import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedListProps {
    children: ReactNode
    staggerDelay?: number
    className?: string
}

interface AnimatedListItemProps {
    children: ReactNode
    delay?: number
    className?: string
}

/**
 * Animated list that staggers child items with fade-in animations
 */
export function AnimatedList({ children, staggerDelay = 50, className }: AnimatedListProps) {
    return (
        <div className={cn('space-y-2', className)}>
            {Array.isArray(children)
                ? children.map((child, i) =>
                      child ? (
                          <div
                              key={i}
                              className="animate-in fade-in slide-in-from-left"
                              style={{ animationDelay: `${i * staggerDelay}ms` }}
                          >
                              {child}
                          </div>
                      ) : null
                  )
                : children}
        </div>
    )
}

/**
 * List item with optional delay animation
 */
export function AnimatedListItem({ children, delay = 0, className }: AnimatedListItemProps) {
    return (
        <div
            className={cn(
                'animate-in fade-in slide-in-from-left',
                className
            )}
            style={{ animationDelay: `${delay}ms` }}
        >
            {children}
        </div>
    )
}

/**
 * Animated badge list for status/tags
 */
export function AnimatedBadgeList({ items, className }: { items: ReactNode[]; className?: string }) {
    return (
        <div className={cn('flex flex-wrap gap-2', className)}>
            {items.map((item, i) => (
                <div
                    key={i}
                    className="animate-in zoom-in-95"
                    style={{ animationDelay: `${i * 30}ms` }}
                >
                    {item}
                </div>
            ))}
        </div>
    )
}

/**
 * Grid of animated items
 */
export function AnimatedGrid({ children, columns = 3, className }: { children: ReactNode[]; columns?: number; className?: string }) {
    const colClass = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
    }[Math.min(columns, 4) as 1 | 2 | 3 | 4] || 'grid-cols-3'

    return (
        <div className={cn(`grid ${colClass} gap-4`, className)}>
            {children.map((child, i) => (
                <div
                    key={i}
                    className="animate-in slide-in-from-bottom-4 zoom-in-95"
                    style={{ animationDelay: `${i * 50}ms` }}
                >
                    {child}
                </div>
            ))}
        </div>
    )
}
