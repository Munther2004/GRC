import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'

/**
 * Page transition effects that trigger on navigation
 * Adds smooth fade and slide animations between pages
 */
export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
    const [isTransitioning, setIsTransitioning] = useState(false)

    useEffect(() => {
        const handleStart = () => {
            setIsTransitioning(true)
        }

        const handleFinish = () => {
            setIsTransitioning(false)
        }

        // Inertia event listeners
        router.on('start', handleStart)
        router.on('finish', handleFinish)

        return () => {
            router.off('start', handleStart)
            router.off('finish', handleFinish)
        }
    }, [])

    return (
        <div
            className={`transition-opacity duration-300 ${ isTransitioning ? 'opacity-50' : 'opacity-100' }`}
        >
            <div className="animate-in fade-in duration-500">
                {children}
            </div>
        </div>
    )
}
