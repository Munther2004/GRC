import { cn } from '@/lib/utils'

export interface Stat {
    label: string
    value: string | number
    tone?: 'neutral' | 'ok' | 'warn' | 'bad'
    hint?: string
}

const dot: Record<string, string> = {
    neutral: 'bg-foreground/30',
    ok:      'bg-emerald-400',
    warn:    'bg-amber-400',
    bad:     'bg-red-400',
}

export function StatStrip({ stats, className }: { stats: Stat[]; className?: string }) {
    return (
        <div className={cn(
            'grid gap-px rounded-xl overflow-hidden border border-border bg-border',
            stats.length === 2 ? 'grid-cols-2' :
            stats.length === 3 ? 'grid-cols-3' :
            stats.length === 4 ? 'grid-cols-2 md:grid-cols-4' :
            'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
            className,
        )}>
            {stats.map(s => (
                <div key={s.label} className="bg-card px-5 py-4">
                    <div className="flex items-center gap-1.5 mb-2">
                        <span className={`w-1 h-1 rounded-full shrink-0 ${dot[s.tone ?? 'neutral']}`} />
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-tight">
                            {s.label}
                        </p>
                    </div>
                    <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground leading-none">
                        {s.value}
                    </p>
                    {s.hint && (
                        <p className="mt-1.5 text-[11px] text-muted-foreground/70">{s.hint}</p>
                    )}
                </div>
            ))}
        </div>
    )
}
