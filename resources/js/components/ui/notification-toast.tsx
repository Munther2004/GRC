import { ReactNode, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, InfoIcon, AlertTriangle, XIcon } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
    id: string
    type: ToastType
    title: string
    message?: string
    duration?: number
}

interface NotificationToastProps {
    toast: Toast
    onDismiss: (id: string) => void
}

const toastConfig: Record<ToastType, { icon: any; bgColor: string; borderColor: string; textColor: string; accentColor: string }> = {
    success: {
        icon: CheckCircle,
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30',
        textColor: 'text-emerald-300',
        accentColor: 'bg-emerald-500/30',
    },
    error: {
        icon: AlertCircle,
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        textColor: 'text-red-300',
        accentColor: 'bg-red-500/30',
    },
    warning: {
        icon: AlertTriangle,
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
        textColor: 'text-amber-300',
        accentColor: 'bg-amber-500/30',
    },
    info: {
        icon: InfoIcon,
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/30',
        textColor: 'text-primary',
        accentColor: 'bg-primary/30',
    },
}

export function NotificationToast({ toast, onDismiss }: NotificationToastProps) {
    const [isVisible, setIsVisible] = useState(true)
    const config = toastConfig[toast.type]
    const Icon = config.icon

    useEffect(() => {
        if (!toast.duration || toast.duration <= 0) return

        const timer = setTimeout(() => {
            setIsVisible(false)
            setTimeout(() => onDismiss(toast.id), 300)
        }, toast.duration)

        return () => clearTimeout(timer)
    }, [toast.duration, toast.id, onDismiss])

    if (!isVisible) {
        return null
    }

    return (
        <div
            className={`fixed bottom-6 right-6 max-w-sm pointer-events-auto animate-in slide-in-from-right-4 duration-300 flex items-start gap-3 rounded-lg border ${config.borderColor} ${config.bgColor} px-4 py-3 backdrop-blur-xl shadow-lg transition-all`}
        >
            <Icon className={`w-5 h-5 shrink-0 ${config.textColor} mt-0.5`} />
            <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{toast.title}</p>
                {toast.message && (
                    <p className="text-xs text-muted-foreground mt-1">{toast.message}</p>
                )}
            </div>
            <button
                onClick={() => {
                    setIsVisible(false)
                    setTimeout(() => onDismiss(toast.id), 300)
                }}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
                <XIcon className="w-4 h-4" />
            </button>
        </div>
    )
}

export function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
    return (
        <div className="pointer-events-none fixed inset-0">
            <div className="fixed bottom-6 right-6 flex flex-col gap-3 pointer-events-auto">
                {toasts.map((toast, idx) => (
                    <div
                        key={toast.id}
                        style={{
                            animation: `slideIn 0.3s ease-out ${idx * 50}ms forwards`,
                        }}
                    >
                        <NotificationToast toast={toast} onDismiss={onDismiss} />
                    </div>
                ))}
            </div>
        </div>
    )
}

// Hook for managing toasts
export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = (message: Omit<Toast, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random()}`
        const toast: Toast = { ...message, id, duration: message.duration ?? 4000 }
        setToasts(prev => [...prev, toast])
        return id
    }

    const dismissToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }

    const success = (title: string, message?: string) => addToast({ type: 'success', title, message })
    const error = (title: string, message?: string) => addToast({ type: 'error', title, message })
    const info = (title: string, message?: string) => addToast({ type: 'info', title, message })
    const warning = (title: string, message?: string) => addToast({ type: 'warning', title, message })

    return { toasts, addToast, dismissToast, success, error, info, warning }
}
