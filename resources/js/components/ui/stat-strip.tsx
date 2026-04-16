import { cn } from '@/lib/utils'

export interface Stat {
    label: string
    value: string | number
    tone?: 'neutral' | 'ok' | 'warn' | 'bad' | 'brass'
    hint?: string
}

const toneColor: Record<string, string> = {
    neutral: '#7ABFA8',
    ok:      '#B0E4CC',
    warn:    '#285A48',
    bad:     '#8B2635',
    brass:   '#408A71',
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
            style={{ border: '1px solid #285A48', gap: '1px', background: '#285A48' }}
        >
            {stats.map((s, i) => {
                const dot = toneColor[s.tone ?? 'neutral']
                return (
                    <div key={s.label} className="relative px-5 py-4" style={{ background: '#0D1F1C' }}>
                        {i === 0 && (
                            <div className="absolute left-0 top-3 bottom-3 w-px" style={{ background: '#408A71', opacity: 0.6 }} />
                        )}
                        <div className="flex items-center gap-1.5 mb-2">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />
                            <p className="font-display text-[9px] uppercase tracking-[0.2em]" style={{ color: '#7ABFA8' }}>
                                {s.label}
                            </p>
                        </div>
                        <p className="font-heading text-3xl font-normal tabular-nums leading-none" style={{ color: '#E0F5EC' }}>
                            {s.value}
                        </p>
                        {s.hint && (
                            <p className="mt-1.5 font-body text-xs italic" style={{ color: '#7ABFA8' }}>{s.hint}</p>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
