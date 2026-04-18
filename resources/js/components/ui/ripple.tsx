import { useRef, useCallback } from 'react'

interface RippleProps {
    color?: string
    duration?: number
}

interface RipplePosition {
    x: number
    y: number
    id: number
}

/**
 * Hook for adding ripple effects to clickable elements
 * Creates expanding circle animation on click
 */
export function useRipple({ color = 'rgba(255, 255, 255, 0.5)', duration = 600 }: RippleProps = {}) {
    const containerRef = useRef<HTMLDivElement>(null)
    const idRef = useRef(0)

    const createRipple = useCallback((event: React.MouseEvent<HTMLElement>) => {
        const container = containerRef.current
        if (!container) return

        const rect = container.getBoundingClientRect()
        const size = Math.max(rect.width, rect.height)
        const x = event.clientX - rect.left - size / 2
        const y = event.clientY - rect.top - size / 2

        const ripple = document.createElement('span')
        ripple.style.position = 'absolute'
        ripple.style.left = x + 'px'
        ripple.style.top = y + 'px'
        ripple.style.width = size + 'px'
        ripple.style.height = size + 'px'
        ripple.style.borderRadius = '50%'
        ripple.style.backgroundColor = color
        ripple.style.pointerEvents = 'none'
        ripple.style.animation = `ripple ${duration}ms ease-out`
        ripple.style.opacity = '1'

        container.appendChild(ripple)

        setTimeout(() => {
            ripple.remove()
        }, duration)
    }, [color, duration])

    return { containerRef, createRipple }
}

/**
 * Ripple button component with built-in ripple effect
 */
export function RippleButton({
    children,
    onClick,
    className = '',
    ...props
}: React.ComponentProps<'button'> & { onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void }) {
    const { containerRef, createRipple } = useRipple()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        createRipple(e)
        onClick?.(e)
    }

    return (
        <button
            ref={containerRef as any}
            onClick={handleClick}
            className={`relative overflow-hidden ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}
