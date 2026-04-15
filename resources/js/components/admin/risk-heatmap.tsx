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

function getCellStyle(
    score: number,
    count: number,
): { bg: string; ring: string; label: string } {
    if (score >= 20)
        return {
            bg: 'bg-red-500/90',
            ring: 'ring-red-400/40',
            label: 'Critical',
        };
    if (score >= 15)
        return {
            bg: 'bg-red-500/70',
            ring: 'ring-red-400/30',
            label: 'Critical',
        };
    if (score >= 10)
        return {
            bg: 'bg-orange-500/60',
            ring: 'ring-orange-400/30',
            label: 'High',
        };
    if (score >= 5)
        return {
            bg: 'bg-amber-500/40',
            ring: 'ring-amber-400/20',
            label: 'Medium',
        };
    return {
        bg: 'bg-emerald-500/25',
        ring: 'ring-emerald-400/20',
        label: 'Low',
    };
}

export function RiskHeatmap({ risks }: Props) {
    const [highlighted, setHighlighted] = useState<number[] | null>(null);
    const [hovered, setHovered] = useState<{ l: number; i: number } | null>(
        null,
    );

    const grid: HeatmapRisk[][][] = Array.from({ length: 5 }, () =>
        Array.from({ length: 5 }, () => []),
    );

    risks.forEach((risk) => {
        const l = Math.max(1, Math.min(5, risk.likelihood)) - 1;
        const i = Math.max(1, Math.min(5, risk.impact)) - 1;
        grid[l][i].push(risk);
    });

    const handleCellClick = (cellRisks: HeatmapRisk[]) => {
        if (cellRisks.length === 0) return;
        const ids = cellRisks.map((r) => r.id);
        setHighlighted((prev) =>
            prev &&
            prev.length === ids.length &&
            prev.every((v, i) => v === ids[i])
                ? null
                : ids,
        );
    };

    const likelihoodRows = [5, 4, 3, 2, 1];
    const totalPlotted = risks.length;
    const criticalCount = risks.filter((r) => r.score >= 15).length;

    return (
        <Card className="animate-in overflow-hidden duration-500 slide-in-from-bottom-4">
            <CardHeader className="flex-row items-start justify-between gap-4 pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-sm font-medium tracking-tight">
                        Risk Heat Map
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        <span className="font-mono text-foreground/80 tabular-nums">
                            {totalPlotted}
                        </span>{' '}
                        plotted
                        <span className="mx-1.5 text-muted-foreground/30">
                            ·
                        </span>
                        <span className="font-mono text-red-400/90 tabular-nums">
                            {criticalCount}
                        </span>{' '}
                        critical
                    </p>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-muted-foreground/60 uppercase">
                    L × I
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4">
                    {/* Y axis label */}
                    <div className="flex w-4 flex-col items-center justify-center">
                        <span className="-rotate-90 font-mono text-[10px] tracking-widest whitespace-nowrap text-muted-foreground/50 uppercase">
                            Likelihood
                        </span>
                    </div>

                    <div className="flex-1">
                        {/* Grid */}
                        <div className="space-y-1.5">
                            {likelihoodRows.map((likelihood, rowIdx) => (
                                <div
                                    key={likelihood}
                                    className="flex animate-in items-center gap-2 slide-in-from-left"
                                    style={{
                                        animationDelay: `${rowIdx * 50}ms`,
                                    }}
                                >
                                    <span className="w-3 text-right font-mono text-[10px] text-muted-foreground/50 tabular-nums">
                                        {likelihood}
                                    </span>
                                    <div className="grid flex-1 grid-cols-5 gap-1.5">
                                        {[1, 2, 3, 4, 5].map(
                                            (impact, colIdx) => {
                                                const cellRisks =
                                                    grid[likelihood - 1][
                                                        impact - 1
                                                    ];
                                                const score =
                                                    likelihood * impact;
                                                const style = getCellStyle(
                                                    score,
                                                    cellRisks.length,
                                                );
                                                const isHighlighted =
                                                    highlighted &&
                                                    cellRisks.some((r) =>
                                                        highlighted.includes(
                                                            r.id,
                                                        ),
                                                    );
                                                const isEmpty =
                                                    cellRisks.length === 0;
                                                const isHovered =
                                                    hovered?.l === likelihood &&
                                                    hovered?.i === impact;

                                                return (
                                                    <button
                                                        key={impact}
                                                        type="button"
                                                        onClick={() =>
                                                            handleCellClick(
                                                                cellRisks,
                                                            )
                                                        }
                                                        onMouseEnter={() =>
                                                            setHovered({
                                                                l: likelihood,
                                                                i: impact,
                                                            })
                                                        }
                                                        onMouseLeave={() =>
                                                            setHovered(null)
                                                        }
                                                        className={`relative aspect-square cursor-pointer rounded-md transition-all duration-200 ${style.bg} ${isEmpty ? 'cursor-default opacity-20' : 'cursor-pointer hover:scale-[1.06] hover:shadow-lg hover:shadow-black/40'} ${isHighlighted ? `ring-2 ring-offset-2 ring-offset-background ${style.ring} scale-[1.04]` : ''} animate-in zoom-in-95`}
                                                        style={{
                                                            animationDelay: `${rowIdx * 50 + colIdx * 30}ms`,
                                                            animationFillMode:
                                                                'both',
                                                        }}
                                                        disabled={isEmpty}
                                                        title={
                                                            isEmpty
                                                                ? 'No risks'
                                                                : `${cellRisks.length} risk${cellRisks.length > 1 ? 's' : ''}`
                                                        }
                                                    >
                                                        {!isEmpty && (
                                                            <span className="absolute inset-0 flex items-center justify-center font-mono text-xs font-semibold text-white tabular-nums">
                                                                {
                                                                    cellRisks.length
                                                                }
                                                            </span>
                                                        )}

                                                        {/* Floating tooltip */}
                                                        {isHovered &&
                                                            !isEmpty && (
                                                                <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-[220px] -translate-x-1/2">
                                                                    <div className="rounded-md border border-border bg-popover/95 p-2.5 text-left shadow-xl backdrop-blur-xl">
                                                                        <div className="mb-1.5 flex items-center justify-between gap-3 border-b border-border/60 pb-1.5">
                                                                            <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                                                                                L
                                                                                {
                                                                                    likelihood
                                                                                }{' '}
                                                                                ·
                                                                                I
                                                                                {
                                                                                    impact
                                                                                }
                                                                            </span>
                                                                            <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
                                                                                {
                                                                                    score
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                        {cellRisks
                                                                            .slice(
                                                                                0,
                                                                                4,
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    r,
                                                                                ) => (
                                                                                    <p
                                                                                        key={
                                                                                            r.id
                                                                                        }
                                                                                        className="truncate py-0.5 text-[11px] leading-tight text-foreground/80"
                                                                                    >
                                                                                        {
                                                                                            r.title
                                                                                        }
                                                                                    </p>
                                                                                ),
                                                                            )}
                                                                        {cellRisks.length >
                                                                            4 && (
                                                                            <p className="mt-1 text-[10px] text-muted-foreground">
                                                                                +
                                                                                {cellRisks.length -
                                                                                    4}{' '}
                                                                                more
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                    </button>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* X axis */}
                            <div className="flex items-center gap-2 pt-1">
                                <div className="w-3" />
                                <div className="grid flex-1 grid-cols-5 gap-1.5">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <span
                                            key={i}
                                            className="text-center font-mono text-[10px] text-muted-foreground/50 tabular-nums"
                                        >
                                            {i}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <p className="pt-1 text-center font-mono text-[10px] tracking-widest text-muted-foreground/50 uppercase">
                                Impact
                            </p>
                        </div>

                        {/* Legend */}
                        <div className="mt-5 border-t border-border pt-4">
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                                    Low
                                </span>
                                <div className="h-1.5 flex-1 rounded-full bg-gradient-to-r from-emerald-500/25 via-amber-500/50 to-red-500/90" />
                                <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                                    Critical
                                </span>
                            </div>
                        </div>

                        {/* Selected risks */}
                        {highlighted && highlighted.length > 0 && (
                            <div className="mt-4 animate-in rounded-md border border-border bg-muted/30 p-3 slide-in-from-bottom-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                                        Selected · {highlighted.length}
                                    </span>
                                    <button
                                        onClick={() => setHighlighted(null)}
                                        className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase transition-colors hover:text-foreground"
                                    >
                                        Clear
                                    </button>
                                </div>
                                <ul className="space-y-1">
                                    {risks
                                        .filter((r) =>
                                            highlighted.includes(r.id),
                                        )
                                        .map((r) => (
                                            <li
                                                key={r.id}
                                                className="flex items-center justify-between gap-3 text-xs"
                                            >
                                                <span className="truncate text-foreground/85">
                                                    {r.title}
                                                </span>
                                                <span className="shrink-0 font-mono text-muted-foreground tabular-nums">
                                                    {r.score}
                                                </span>
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
