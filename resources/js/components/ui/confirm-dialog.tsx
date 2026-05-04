import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type ConfirmTone = 'default' | 'destructive'

type ConfirmOptions = {
    title: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    tone?: ConfirmTone
}

type ConfirmFn = (options: ConfirmOptions | string) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

type PendingState = {
    options: ConfirmOptions
    resolve: (value: boolean) => void
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [pending, setPending] = useState<PendingState | null>(null)

    const confirm = useCallback<ConfirmFn>((input) => {
        const options: ConfirmOptions =
            typeof input === 'string' ? { title: input } : input
        return new Promise<boolean>((resolve) => {
            setPending({ options, resolve })
        })
    }, [])

    const settle = (value: boolean) => {
        setPending((current) => {
            current?.resolve(value)
            return null
        })
    }

    const opts = pending?.options
    const isDestructive = opts?.tone === 'destructive'

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            <AlertDialog
                open={pending !== null}
                onOpenChange={(open) => {
                    if (!open) settle(false)
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{opts?.title}</AlertDialogTitle>
                        {opts?.description && (
                            <AlertDialogDescription>
                                {opts.description}
                            </AlertDialogDescription>
                        )}
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => settle(false)}>
                            {opts?.cancelLabel ?? 'Cancel'}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => settle(true)}
                            className={
                                isDestructive
                                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                    : ''
                            }
                        >
                            {opts?.confirmLabel ?? 'Confirm'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ConfirmContext.Provider>
    )
}

export function useConfirm(): ConfirmFn {
    const ctx = useContext(ConfirmContext)
    if (!ctx) {
        throw new Error('useConfirm must be used inside <ConfirmProvider>')
    }
    return ctx
}
