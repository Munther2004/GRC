import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

export function ScrollFocusMode() {
    const focusedElementRef = useRef<HTMLElement | null>(null)
    
    useEffect(() => {
        const handleScroll = () => {
            // Find all elements with data-focus-scroll attribute
            const focusableElements = document.querySelectorAll('[data-focus-scroll]')
            
            focusableElements.forEach((el: Element) => {
                const rect = el.getBoundingClientRect()
                const triggerTop = window.innerHeight * 0.2
                const triggerBottom = window.innerHeight * 0.8
                
                // Element is in view and centered
                const isInFocus = rect.top > triggerTop && rect.top < triggerBottom
                
                if (isInFocus && focusedElementRef.current !== el) {
                    focusedElementRef.current = el as HTMLElement
                    // Hide siblings
                    const parent = el.parentElement
                    if (parent) {
                        for (let i = 0; i < parent.children.length; i++) {
                            const child = parent.children[i] as HTMLElement
                            if (child !== el) {
                                child.style.opacity = '0'
                                child.style.pointerEvents = 'none'
                                child.style.transition = 'all 0.3s ease'
                            }
                        }
                    }
                } else if (!isInFocus && focusedElementRef.current === el) {
                    focusedElementRef.current = null
                    // Restore siblings
                    const parent = el.parentElement
                    if (parent) {
                        for (let i = 0; i < parent.children.length; i++) {
                            const child = parent.children[i] as HTMLElement
                            if (child !== el) {
                                child.style.opacity = '1'
                                child.style.pointerEvents = 'auto'
                            }
                        }
                    }
                }
            })
        }
        
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    
    return null
}

export function FocusScrollWrapper({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div 
            data-focus-scroll 
            className={`transition-all duration-300 ${className}`}
        >
            {children}
        </div>
    )
}
