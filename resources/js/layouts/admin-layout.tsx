import { AdminHeader } from "@/components/admin/header"
import { AdminSidebar } from "@/components/admin/sidebar"
import { CommandPalette } from "@/components/ui/command-palette"
import { usePage } from "@inertiajs/react"
import type { SharedProps } from "@/types"
import { useEffect, useRef, useState } from "react"
import { CheckCircle, XCircle, X } from "lucide-react"

function FlashToast() {
    const { flash } = usePage<SharedProps>().props
    const text      = (flash?.success ?? flash?.error ?? null) as string | null
    const isSuccess = !!flash?.success

    const [visible, setVisible] = useState(!!text)
    const prevTextRef = useRef<string | null>(text)

    // Derive visibility from props synchronously — avoids setState-in-effect anti-pattern
    if (text !== prevTextRef.current) {
        prevTextRef.current = text
        setVisible(!!text)
    }

    useEffect(() => {
        if (!visible) return
        const t = setTimeout(() => setVisible(false), 4000)
        return () => clearTimeout(t)
    }, [visible])

    if (!visible || !text) return null

    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 rounded-lg border bg-popover px-4 py-3 text-sm max-w-sm backdrop-blur-xl
            ${isSuccess ? 'border-emerald-500/20' : 'border-red-500/20'}`}
            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.5)' }}>
            {isSuccess
                ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                : <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
            }
            <span className="flex-1 text-foreground">{text}</span>
            <button onClick={() => setVisible(false)} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background dark">
      <CommandPalette />
      <AdminSidebar />
      <div className="lg:pl-60">
        <AdminHeader />
        <main className="px-6 py-8 max-w-[1400px] mx-auto">
          {children}
        </main>
      </div>
      <FlashToast />
    </div>
  )
}
