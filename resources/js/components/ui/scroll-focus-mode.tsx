import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

export function ScrollFocusMode() {
    const [isFocused, setIsFocused] = useState(false)
    const [focusElement, setFocusElement] = useState<HTMLElement | null>(null)
    
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
                
                if (isInFocus && !isFocused) {
                    setIsFocused(true)
                    setFocusElement(el as HTMLElement)
                    // Hide siblings
                    const parent = el.parentElement
                    if (parent) {
                        Array.from(parent.children).forEach((child: Element) => {
                            if (child !== el) {
                                (child as HTMLElement).style.opacity = '0'
                                (child as HTMLElement).style.pointerEvents = 'none'
                                (child as HTMLElement).style.transition = 'all 0.3s ease'
                            }
                        })
                    }
                } else if (!isInFocus && isFocused && focusElement === el) {
                    setIsFocused(false)
                    // Restore siblings
                    const parent = el.parentElement
                    if (parent) {
                        Array.from(parent.children).forEach((child: Element) => {
                            if (child !== el) {
                                (child as HTMLElement).style.opacity = '1'
                                (child as HTMLElement).style.pointerEvents = 'auto'
                            }
                        })
                    }
                }
            })
        }
        
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [isFocused, focusElement])
    
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
