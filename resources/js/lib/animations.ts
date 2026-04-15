import { useEffect, useRef } from 'react'

export function useAnimateOnScroll() {
    const ref = useRef<HTMLDivElement>(null)
    
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in', 'fade-in', 'slide-in-from-bottom-4')
                    entry.target.classList.remove('opacity-0')
                    observer.unobserve(entry.target)
                }
            },
            { threshold: 0.1 }
        )
        
        if (ref.current) {
            observer.observe(ref.current)
        }
        
        return () => observer.disconnect()
    }, [])
    
    return ref
}

export const animationClasses = {
    fadeIn: 'animate-in fade-in duration-500',
    slideUp: 'animate-in slide-in-from-bottom-4 duration-500',
    slideDown: 'animate-in slide-in-from-top-4 duration-500',
    slideLeft: 'animate-in slide-in-from-right-4 duration-500',
    scaleIn: 'animate-in zoom-in-95 duration-500',
    pulse: 'animate-pulse',
    spin: 'animate-spin',
}
