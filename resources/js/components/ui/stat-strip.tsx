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
        stats.length === 6 ? 'grid-cols-2 md:grid-cols-3' :
        'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'

    return (
        <div
            className={cn('grid overflow-hidden rounded-2xl', cols, className)}
            style={{
                border: '1px solid var(--border)',
                gap: '1px',
                background: 'var(--border)',
                boxShadow: '0 10px 30px -16px color-mix(in srgb, var(--foreground) 18%, transparent)',
            }}
        >
            {stats.map((s) => {
                const dot = toneColor[s.tone ?? 'neutral']
                return (
                    <div key={s.label} className="relative px-5 py-5" style={{ background: 'var(--card)' }}>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />
                            <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: 'var(--muted-foreground)' }}>
                                {s.label}
                            </p>
                        </div>
                        <p className="text-3xl tabular-nums leading-none" style={{ color: 'var(--foreground)', fontWeight: 500, letterSpacing: '-0.02em' }}>
                            {s.value}
                        </p>
                        {s.hint && (
                            <p className="mt-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.hint}</p>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
