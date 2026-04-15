import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type HeatmapRisk = {
    id: number;
    title: string;
    likelihood: number;
    impact: number;
    score: number;
    status: string;
};

type Props = {
    risks: HeatmapRisk[];
};

function getCellStyle(score: number, count: number): { bg: string; ring: string; label: string } {
    if (score >= 20) return { bg: 'bg-red-500/90',   ring: 'ring-red-400/40',    label: 'Critical' };
    if (score >= 15) return { bg: 'bg-red-500/70',   ring: 'ring-red-400/30',    label: 'Critical' };
    if (score >= 10) return { bg: 'bg-orange-500/60',ring: 'ring-orange-400/30', label: 'High'     };
    if (score >= 5)  return { bg: 'bg-amber-500/40', ring: 'ring-amber-400/20',  label: 'Medium'   };
    return                  { bg: 'bg-emerald-500/25', ring: 'ring-emerald-400/20', label: 'Low'    };
}

export function RiskHeatmap({ risks }: Props) {
    const [highlighted, setHighlighted] = useState<number[] | null>(null);
    const [hovered, setHovered] = useState<{ l: number; i: number } | null>(null);

    const grid: HeatmapRisk[][][] = Array.from({ length: 5 }, () =>
        Array.from({ length: 5 }, () => [])
    );

    risks.forEach(risk => {
        const l = Math.max(1, Math.min(5, risk.likelihood)) - 1;
        const i = Math.max(1, Math.min(5, risk.impact)) - 1;
        grid[l][i].push(risk);
    });

    const handleCellClick = (cellRisks: HeatmapRisk[]) => {
        if (cellRisks.length === 0) return;
        const ids = cellRisks.map(r => r.id);
        setHighlighted(prev =>
            prev && prev.length === ids.length && prev.every((v, i) => v === ids[i]) ? null : ids
        );
    };

    const likelihoodRows = [5, 4, 3, 2, 1];
    const totalPlotted = risks.length;
    const criticalCount = risks.filter(r => r.score >= 15).length;

    return (
        <Card className="overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="pb-4 flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                    <CardTitle className="text-sm font-medium tracking-tight">Risk Heat Map</CardTitle>
                    <p className="text-xs text-muted-foreground">
                        <span className="font-mono tabular-nums text-foreground/80">{totalPlotted}</span> plotted
                        <span className="mx-1.5 text-muted-foreground/30">·</span>
                        <span className="font-mono tabular-nums text-red-400/90">{criticalCount}</span> critical
                    </p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
                    L × I
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4">
                    {/* Y axis label */}
                    <div className="flex flex-col items-center justify-center w-4">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 -rotate-90 whitespace-nowrap">
                            Likelihood
                        </span>
                    </div>

                    <div className="flex-1">
                        {/* Grid */}
                        <div className="space-y-1.5">
                            {likelihoodRows.map((likelihood, rowIdx) => (
                                <div key={likelihood} className="flex items-center gap-2 animate-in slide-in-from-left" style={{ animationDelay: `${rowIdx * 50}ms` }}>
                                    <span className="text-[10px] font-mono tabular-nums text-muted-foreground/50 w-3 text-right">
                                        {likelihood}
                                    </span>
                                    <div className="flex-1 grid grid-cols-5 gap-1.5">
                                        {[1, 2, 3, 4, 5].map((impact, colIdx) => {
                                            const cellRisks = grid[likelihood - 1][impact - 1];
                                            const score = likelihood * impact;
                                            const style = getCellStyle(score, cellRisks.length);
                                            const isHighlighted = highlighted && cellRisks.some(r => highlighted.includes(r.id));
                                            const isEmpty = cellRisks.length === 0;
                                            const isHovered = hovered?.l === likelihood && hovered?.i === impact;

                                            return (
                                                <button
                                                    key={impact}
                                                    type="button"
                                                    onClick={() => handleCellClick(cellRisks)}
                                                    onMouseEnter={() => setHovered({ l: likelihood, i: impact })}
                                                    onMouseLeave={() => setHovered(null)}
                                                    className={`
                                                        relative aspect-square rounded-md transition-all duration-200 cursor-pointer
                                                        ${style.bg} ${isEmpty ? 'opacity-20 cursor-default' : 'cursor-pointer hover:scale-[1.06] hover:shadow-lg hover:shadow-black/40'}
                                                        ${isHighlighted ? `ring-2 ring-offset-2 ring-offset-background ${style.ring} scale-[1.04]` : ''}
                                                        animate-in zoom-in-95
                                                    `}
                                                    style={{ 
                                                        animationDelay: `${rowIdx * 50 + colIdx * 30}ms`,
                                                        animationFillMode: 'both'
                                                    }}
                                                    disabled={isEmpty}
                                                    title={isEmpty ? 'No risks' : `${cellRisks.length} risk${cellRisks.length > 1 ? 's' : ''}`}
                                                >
                                                    {!isEmpty && (
                                                        <span className="absolute inset-0 flex items-center justify-center font-mono text-xs font-semibold text-white tabular-nums">
                                                            {cellRisks.length}
                                                        </span>
                                                    )}

                                                    {/* Floating tooltip */}
                                                    {isHovered && !isEmpty && (
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 w-max max-w-[220px] pointer-events-none">
                                                            <div className="rounded-md border border-border bg-popover/95 backdrop-blur-xl p-2.5 text-left shadow-xl">
                                                                <div className="flex items-center justify-between gap-3 pb-1.5 mb-1.5 border-b border-border/60">
                                                                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                                                                        L{likelihood} · I{impact}
                                                                    </span>
                                                                    <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
                                                                        {score}
                                                                    </span>
                                                                </div>
                                                                {cellRisks.slice(0, 4).map(r => (
                                                                    <p key={r.id} className="text-[11px] text-foreground/80 truncate leading-tight py-0.5">
                                                                        {r.title}
                                                                    </p>
                                                                ))}
                                                                {cellRisks.length > 4 && (
                                                                    <p className="text-[10px] text-muted-foreground mt-1">
                                                                        +{cellRisks.length - 4} more
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* X axis */}
                            <div className="flex items-center gap-2 pt-1">
                                <div className="w-3" />
                                <div className="flex-1 grid grid-cols-5 gap-1.5">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <span key={i} className="text-[10px] font-mono tabular-nums text-muted-foreground/50 text-center">
                                            {i}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 text-center pt-1">
                                Impact
                            </p>
                        </div>

                        {/* Legend */}
                        <div className="mt-5 pt-4 border-t border-border">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Low</span>
                                <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-emerald-500/25 via-amber-500/50 to-red-500/90" />
                                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Critical</span>
                            </div>
                        </div>

                        {/* Selected risks */}
                        {highlighted && highlighted.length > 0 && (
                            <div className="mt-4 rounded-md border border-border bg-muted/30 p-3 animate-in slide-in-from-bottom-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                                        Selected · {highlighted.length}
                                    </span>
                                    <button
                                        onClick={() => setHighlighted(null)}
                                        className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Clear
                                    </button>
                                </div>
                                <ul className="space-y-1">
                                    {risks.filter(r => highlighted.includes(r.id)).map(r => (
                                        <li key={r.id} className="flex items-center justify-between gap-3 text-xs">
                                            <span className="text-foreground/85 truncate">{r.title}</span>
                                            <span className="font-mono tabular-nums text-muted-foreground shrink-0">{r.score}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
