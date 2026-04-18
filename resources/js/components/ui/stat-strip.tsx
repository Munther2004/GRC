import { cn } from '@/lib/utils'

export interface Stat {
    label: string
    value: string | number
    tone?: 'neutral' | 'ok' | 'warn' | 'bad' | 'brass'
    hint?: string
}

const toneColor: Record<string, string> = {
    neutral: 'var(--muted-foreground)',
    ok:      'var(--success)',
    warn:    'var(--border)',
    bad:     'var(--destructive)',
    brass:   'var(--primary)',
}

export function StatStrip({ stats, className }: { stats: Stat[]; className?: string }) {
    const cols =
        stats.length === 2 ? 'grid-cols-2' :
        stats.length === 3 ? 'grid-cols-3' :
        stats.length === 4 ? 'grid-cols-2 md:grid-cols-4' :
        'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'

    return (
        <div
            className={cn('grid overflow-hidden rounded', cols, className)}
            style={{ border: '1px solid var(--border)', gap: '1px', background: 'var(--border)' }}
        >
            {stats.map((s, i) => {
                const dot = toneColor[s.tone ?? 'neutral']
                return (
                    <div key={s.label} className="relative px-5 py-4" style={{ background: 'var(--card)' }}>
                        {i === 0 && (
                            <div className="absolute left-0 top-3 bottom-3 w-px" style={{ background: 'var(--primary)', opacity: 0.6 }} />
                        )}
                        <div className="flex items-center gap-1.5 mb-2">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />
                            <p className="font-display text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                                {s.label}
                            </p>
                        </div>
                        <p className="font-heading text-3xl font-normal tabular-nums leading-none text-foreground">
                            {s.value}
                        </p>
                        {s.hint && (
                            <p className="mt-1.5 font-body text-xs italic text-muted-foreground">{s.hint}</p>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
