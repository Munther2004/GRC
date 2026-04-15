import { useState, useEffect, useCallback } from 'react'
import { usePage } from '@inertiajs/react'
import { route } from '@/lib/routes'
import { 
    AlertTriangle, BarChart3, Bell, ClipboardList, FileCheck, GitCompare, 
    LayoutDashboard, LayoutGrid, ScrollText, Shield, Sliders, Sparkles, Users,
    Search, CommandIcon, ChevronRight, Zap, Settings, User, LogOut
} from 'lucide-react'

interface CommandItem {
    id: string
    label: string
    description?: string
    icon: any
    action: () => void
    category: string
    keywords?: string[]
}

export function CommandPalette() {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const { auth } = usePage().props as any
    
    const commands: CommandItem[] = [
        // Navigation
        { id: 'nav-dash', label: 'Dashboard', icon: LayoutDashboard, category: 'Navigation', action: () => window.location.href = route('dashboard'), keywords: ['home', 'overview'] },
        { id: 'nav-risks', label: 'Risk Register', icon: AlertTriangle, category: 'Navigation', action: () => window.location.href = route('risks.index') },
        { id: 'nav-assess', label: 'Assessments', icon: ClipboardList, category: 'Navigation', action: () => window.location.href = route('assessments.index') },
        { id: 'nav-evidence', label: 'Evidence', icon: FileCheck, category: 'Navigation', action: () => window.location.href = route('evidence.index') },
        { id: 'nav-gap', label: 'Gap Analysis', icon: FileCheck, category: 'Navigation', action: () => window.location.href = route('gap-analysis.index') },
        { id: 'nav-cross', label: 'Crosswalk', icon: GitCompare, category: 'Navigation', action: () => window.location.href = route('crosswalk.index') },
        { id: 'nav-controls', label: 'Controls Hub', icon: LayoutGrid, category: 'Navigation', action: () => window.location.href = route('controls.hub') },
        { id: 'nav-reports', label: 'Reports', icon: BarChart3, category: 'Navigation', action: () => window.location.href = route('reports.index') },
        { id: 'nav-ai', label: 'AI Assistant', icon: Sparkles, category: 'Navigation', action: () => window.location.href = route('chatbot.index') },
        
        // Actions
        { id: 'act-new-risk', label: 'New Risk', icon: AlertTriangle, category: 'Actions', action: () => window.location.href = route('risks.create') },
        { id: 'act-new-assess', label: 'New Assessment', icon: ClipboardList, category: 'Actions', action: () => window.location.href = route('assessments.create') },
        
        // Settings & User
        { id: 'set-profile', label: 'Profile Settings', icon: User, category: 'Settings', action: () => window.location.href = '/settings/profile' },
        { id: 'set-pass', label: 'Change Password', icon: Shield, category: 'Settings', action: () => window.location.href = '/settings/password' },
        { id: 'set-appear', label: 'Appearance', icon: Zap, category: 'Settings', action: () => window.location.href = '/settings/appearance' },
        
        // Admin
        ...(auth?.user?.role === 'admin' ? [
            { id: 'adm-users', label: 'Manage Users', icon: Users, category: 'Admin', action: () => window.location.href = route('admin.users.index') },
            { id: 'adm-frameworks', label: 'Frameworks', icon: Shield, category: 'Admin', action: () => window.location.href = route('admin.frameworks.index') },
            { id: 'adm-controls', label: 'Controls Library', icon: Settings, category: 'Admin', action: () => window.location.href = route('admin.controls.index') },
        ] : []),
    ]
    
    const filtered = commands.filter(cmd => 
        cmd.label.toLowerCase().includes(search.toLowerCase()) ||
        cmd.description?.toLowerCase().includes(search.toLowerCase()) ||
        cmd.keywords?.some(k => k.includes(search.toLowerCase()))
    )
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+K or Ctrl+K to open
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setOpen(!open)
                setSearch('')
                setSelectedIndex(0)
            }
            
            if (!open) return
            
            switch (e.key) {
                case 'Escape':
                    setOpen(false)
                    break
                case 'ArrowDown':
                    e.preventDefault()
                    setSelectedIndex(i => (i + 1) % filtered.length)
                    break
                case 'ArrowUp':
                    e.preventDefault()
                    setSelectedIndex(i => (i - 1 + filtered.length) % filtered.length)
                    break
                case 'Enter':
                    e.preventDefault()
                    if (filtered[selectedIndex]) {
                        filtered[selectedIndex].action()
                        setOpen(false)
                    }
                    break
            }
        }
        
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [open, search, selectedIndex, filtered])
    
    if (!open) return null
    
    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] pointer-events-none">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
                onClick={() => setOpen(false)}
            />
            
            {/* Command Palette */}
            <div className="relative w-full max-w-[600px] mx-4 pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="bg-background border border-border rounded-lg shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                        <CommandIcon className="w-4 h-4 text-muted-foreground" />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search commands..."
                            value={search}
                            onChange={e => {
                                setSearch(e.target.value)
                                setSelectedIndex(0)
                            }}
                            className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground"
                        />
                        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded border border-border bg-muted text-xs text-muted-foreground">
                            <span>ESC</span>
                        </kbd>
                    </div>
                    
                    {/* Results */}
                    <div className="max-h-[300px] overflow-y-auto">
                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Search className="w-8 h-8 mb-2 opacity-50" />
                                <p className="text-sm">No commands found</p>
                            </div>
                        ) : (
                            <div className="p-2 space-y-1">
                                {filtered.map((cmd, idx) => (
                                    <button
                                        key={cmd.id}
                                        onClick={() => {
                                            cmd.action()
                                            setOpen(false)
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                                            idx === selectedIndex
                                                ? 'bg-accent text-accent-foreground'
                                                : 'text-foreground/80 hover:bg-accent/50'
                                        }`}
                                    >
                                        <cmd.icon className="w-4 h-4 flex-shrink-0" />
                                        <div className="flex-1 text-left">
                                            <div className="font-medium">{cmd.label}</div>
                                            {cmd.description && <div className="text-xs text-muted-foreground">{cmd.description}</div>}
                                        </div>
                                        <ChevronRight className="w-4 h-4 opacity-50" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Footer */}
                    {filtered.length > 0 && (
                        <div className="border-t border-border px-4 py-2 bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
                            <span>↑↓ Navigate • ↵ Select</span>
                            <span>{selectedIndex + 1} of {filtered.length}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
