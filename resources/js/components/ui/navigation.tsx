import { Link } from "@inertiajs/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-foreground rounded-sm flex items-center justify-center">
            <span className="text-background font-bold text-sm">S</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">Sentinel</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Platform
          </Link>
          <Link href="#solutions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Solutions
          </Link>
          <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="#resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Resources
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">Log in</Link>
          </Button>
          <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90" asChild>
            <Link href="/admin">Get Started</Link>
          </Button>
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {isOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-6 py-4 space-y-3">
            <Link href="#features" className="block text-sm text-muted-foreground hover:text-foreground">
              Platform
            </Link>
            <Link href="#solutions" className="block text-sm text-muted-foreground hover:text-foreground">
              Solutions
            </Link>
            <Link href="#pricing" className="block text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="#resources" className="block text-sm text-muted-foreground hover:text-foreground">
              Resources
            </Link>
            <div className="pt-3 flex flex-col gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin">Log in</Link>
              </Button>
              <Button size="sm" className="bg-foreground text-background" asChild>
                <Link href="/admin">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
