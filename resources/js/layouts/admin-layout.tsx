import { AdminHeader } from "@/components/admin/header"
import { AdminSidebar } from "@/components/admin/sidebar"
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
        <div className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg text-sm max-w-sm
            ${isSuccess
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
            {isSuccess
                ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                : <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600" />
            }
            <span className="flex-1">{text}</span>
            <button onClick={() => setVisible(false)} className="flex-shrink-0 opacity-60 hover:opacity-100">
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
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader />
        <main className="p-6">
          {children}
        </main>
      </div>
      <FlashToast />
    </div>
  )
}
