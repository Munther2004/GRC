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
    fullscreen?: boolean;
};

// Classic risk heatmap data palette — kept as hex because recharts/CSS gradients
// composed across cells need stable values; the surrounding chrome (chips,
// dividers, legend ramps) reads from the semantic --severity-* tokens.
function getCellColors(score: number): { bg: string; text: string } {
    if (score >= 20) return { bg: '#e5484d', text: '#ffffff' }; // critical
    if (score >= 15) return { bg: '#ec5e5e', text: '#ffffff' }; // high
    if (score >= 10) return { bg: '#f76b15', text: '#ffffff' }; // high-medium
    if (score >= 6)  return { bg: '#f5b929', text: '#1a1a1a' }; // medium
    if (score >= 3)  return { bg: '#a3d977', text: '#1a3009' }; // low
    return             { bg: '#46bd5f', text: '#ffffff' };      // minimal
}

// Empty cells use a neutral hairline so populated cells own the visual hierarchy.
const EMPTY_CELL_BG = 'color-mix(in srgb, var(--border) 55%, transparent)';

export function RiskHeatmap({ risks, fullscreen = false }: Props) {
    const [highlighted, setHighlighted] = useState<number[] | null>(null);
    const [hovered, setHovered] = useState<{ l: number; i: number } | null>(null);

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
            prev && prev.length === ids.length && prev.every((v, i) => v === ids[i]) ? null : ids,
        );
    };

    const likelihoodRows = [5, 4, 3, 2, 1];
    const totalPlotted = risks.length;
    const criticalCount = risks.filter((r) => r.score >= 15).length;

    if (fullscreen) {
        return (
            <div className="h-screen w-screen overflow-hidden bg-background p-6 flex flex-col">
                <div className="mb-4 flex flex-row items-start justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="font-heading text-4xl font-normal text-foreground">
                            Risk Heat Map
                        </h1>
                        <p className="font-body text-sm text-muted-foreground">
                            <span className="font-heading not-italic text-foreground">
                                {totalPlotted}
                            </span>{' '}
                            plotted
                            <span className="mx-1.5 opacity-40">·</span>
                            <span className="font-heading not-italic text-destructive">
                                {criticalCount}
                            </span>{' '}
                            critical
                        </p>
                    </div>
                    <div className="font-display text-xs tracking-wider uppercase text-muted-foreground opacity-60">
                        L × I
                    </div>
                </div>
                <div className="flex-1 overflow-auto">
                    <div className="flex gap-6 h-full p-4">
                        {/* Y axis label */}
                        <div className="flex w-6 flex-col items-center justify-center">
                            <span className="-rotate-90 font-display text-xs tracking-widest whitespace-nowrap uppercase text-muted-foreground opacity-50">
                                Likelihood
                            </span>
                        </div>

                        <div className="flex-1 flex flex-col">
                            <div className="space-y-3">
                                {likelihoodRows.map((likelihood, rowIdx) => (
                                    <div
                                        key={likelihood}
                                        className="flex items-center gap-4"
                                        style={{ animationDelay: `${rowIdx * 50}ms` }}
                                    >
                                        <span className="w-4 text-right font-display text-sm tabular-nums text-muted-foreground opacity-50">
                                            {likelihood}
                                        </span>
                                        <div className="grid flex-1 grid-cols-5 gap-3">
                                            {[1, 2, 3, 4, 5].map((impact) => {
                                                const cellRisks = grid[likelihood - 1][impact - 1];
                                                const score = likelihood * impact;
                                                const colors = getCellColors(score);
                                                const isHighlighted = highlighted && cellRisks.some((r) => highlighted.includes(r.id));
                                                const isEmpty = cellRisks.length === 0;
                                                const isHovered = hovered?.l === likelihood && hovered?.i === impact;

                                                return (
                                                    <button
                                                        key={impact}
                                                        type="button"
                                                        onClick={() => handleCellClick(cellRisks)}
                                                        onMouseEnter={() => setHovered({ l: likelihood, i: impact })}
                                                        onMouseLeave={() => setHovered(null)}
                                                        disabled={isEmpty}
                                                        title={isEmpty ? 'No risks' : `${cellRisks.length} risk${cellRisks.length > 1 ? 's' : ''}`}
                                                        className="relative aspect-square rounded-2xl transition-all duration-200 min-w-24"
                                                        style={{
                                                            background: isEmpty ? EMPTY_CELL_BG : colors.bg,
                                                            cursor: isEmpty ? 'default' : 'pointer',
                                                            outline: isHighlighted ? '2px solid var(--primary)' : 'none',
                                                            transform: isHovered && !isEmpty ? 'scale(1.08)' : 'scale(1)',
                                                            boxShadow: isHovered && !isEmpty ? '0 8px 24px rgba(0,0,0,0.22)' : 'none',
                                                        }}
                                                    >
                                                        {!isEmpty && (
                                                            <span
                                                                className="absolute inset-0 flex items-center justify-center font-display text-xl tabular-nums"
                                                                style={{ color: colors.text }}
                                                            >
                                                                {cellRisks.length}
                                                            </span>
                                                        )}

                                                        {isHovered && !isEmpty && (
                                                            <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-4 w-max max-w-80 -translate-x-1/2">
                                                                <div
                                                                    className="rounded p-4 text-left"
                                                                    style={{
                                                                        background: 'var(--popover)',
                                                                        border: '1px solid var(--border)',
                                                                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                                                                    }}
                                                                >
                                                                    <div
                                                                        className="mb-2 flex items-center justify-between gap-3 pb-2"
                                                                        style={{ borderBottom: '1px solid color-mix(in srgb, var(--border) 60%, transparent)' }}
                                                                    >
                                                                        <span className="font-display text-xs tracking-wider uppercase text-muted-foreground">
                                                                            L{likelihood} · I{impact}
                                                                        </span>
                                                                        <span className="font-heading text-base text-primary">
                                                                            {score}
                                                                        </span>
                                                                    </div>
                                                                    {cellRisks.slice(0, 5).map((r) => (
                                                                        <p key={r.id} className="font-body truncate py-1 text-sm leading-tight text-foreground">
                                                                            {r.title}
                                                                        </p>
                                                                    ))}
                                                                    {cellRisks.length > 5 && (
                                                                        <p className="font-body mt-2 text-xs italic text-muted-foreground">
                                                                            +{cellRisks.length - 5} more
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
                                <div className="flex items-center gap-4 pt-2">
                                    <div className="w-4" />
                                    <div className="grid flex-1 grid-cols-5 gap-3">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <span
                                                key={i}
                                                className="text-center font-display text-sm tabular-nums text-muted-foreground opacity-50"
                                            >
                                                {i}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <p className="pt-2 text-center font-display text-xs tracking-widest uppercase text-muted-foreground opacity-50">
                                    Impact
                                </p>
                            </div>

                            {/* Legend */}
                            <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.22em' }}>Low</span>
                                    <div
                                        className="h-2 flex-1 rounded-full"
                                        style={{ background: 'linear-gradient(to right, #46bd5f 0%, #a3d977 25%, #f5b929 50%, #f76b15 75%, #e5484d 100%)' }}
                                    />
                                    <span className="text-xs uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.22em' }}>Critical</span>
                                </div>
                            </div>

                            {/* Selected risks */}
                            {highlighted && highlighted.length > 0 && (
                                <div
                                    className="mt-6 rounded p-4"
                                    style={{
                                        background: 'color-mix(in srgb, var(--primary) 5%, transparent)',
                                        border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
                                    }}
                                >
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="font-display text-xs tracking-wider uppercase text-muted-foreground">
                                            Selected · {highlighted.length}
                                        </span>
                                        <button
                                            onClick={() => setHighlighted(null)}
                                            className="font-display text-xs tracking-wider uppercase text-muted-foreground transition-colors hover:text-primary"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    <ul className="space-y-2 max-h-48 overflow-y-auto">
                                        {risks.filter((r) => highlighted.includes(r.id)).map((r) => (
                                            <li key={r.id} className="flex items-center justify-between gap-3">
                                                <span className="font-body truncate text-sm text-foreground">{r.title}</span>
                                                <span className="font-heading shrink-0 text-base tabular-nums text-primary">{r.score}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader className="flex-row items-start justify-between gap-4 pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-base" style={{ fontWeight: 500 }}>
                        Risk heatmap
                    </CardTitle>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                            {totalPlotted}
                        </span>{' '}
                        plotted
                        <span className="mx-1.5 opacity-40">·</span>
                        <span style={{ color: 'var(--destructive)', fontWeight: 500 }}>
                            {criticalCount}
                        </span>{' '}
                        critical
                    </p>
                </div>
                <div className="text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.28em' }}>
                    L × I
                </div>
            </CardHeader>
            <CardContent>
                <div className="mx-auto flex max-w-[560px] gap-4">
                    {/* Y axis label */}
                    <div className="flex w-4 flex-col items-center justify-center">
                        <span className="-rotate-90 font-display text-[9px] tracking-widest whitespace-nowrap uppercase text-muted-foreground opacity-50">
                            Likelihood
                        </span>
                    </div>

                    <div className="flex-1">
                        <div className="space-y-1.5">
                            {likelihoodRows.map((likelihood, rowIdx) => (
                                <div
                                    key={likelihood}
                                    className="flex items-center gap-2"
                                    style={{ animationDelay: `${rowIdx * 50}ms` }}
                                >
                                    <span className="w-3 text-right font-display text-[10px] tabular-nums text-muted-foreground opacity-50">
                                        {likelihood}
                                    </span>
                                    <div className="grid flex-1 grid-cols-5 gap-1">
                                        {[1, 2, 3, 4, 5].map((impact) => {
                                            const cellRisks = grid[likelihood - 1][impact - 1];
                                            const score = likelihood * impact;
                                            const colors = getCellColors(score);
                                            const isHighlighted = highlighted && cellRisks.some((r) => highlighted.includes(r.id));
                                            const isEmpty = cellRisks.length === 0;
                                            const isHovered = hovered?.l === likelihood && hovered?.i === impact;

                                            return (
                                                <button
                                                    key={impact}
                                                    type="button"
                                                    onClick={() => handleCellClick(cellRisks)}
                                                    onMouseEnter={() => setHovered({ l: likelihood, i: impact })}
                                                    onMouseLeave={() => setHovered(null)}
                                                    disabled={isEmpty}
                                                    title={isEmpty ? 'No risks' : `${cellRisks.length} risk${cellRisks.length > 1 ? 's' : ''}`}
                                                    className="relative aspect-square rounded-xl transition-all duration-200"
                                                    style={{
                                                        background: isEmpty ? EMPTY_CELL_BG : colors.bg,
                                                        cursor: isEmpty ? 'default' : 'pointer',
                                                        outline: isHighlighted ? '1px solid var(--primary)' : 'none',
                                                        transform: isHovered && !isEmpty ? 'scale(1.06)' : 'scale(1)',
                                                        boxShadow: isHovered && !isEmpty ? '0 4px 12px rgba(0,0,0,0.18)' : 'none',
                                                    }}
                                                >
                                                    {!isEmpty && (
                                                        <span
                                                            className="absolute inset-0 flex items-center justify-center font-display text-xs tabular-nums"
                                                            style={{ color: colors.text }}
                                                        >
                                                            {cellRisks.length}
                                                        </span>
                                                    )}

                                                    {isHovered && !isEmpty && (
                                                        <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-55 -translate-x-1/2">
                                                            <div
                                                                className="rounded p-2.5 text-left"
                                                                style={{
                                                                    background: 'var(--popover)',
                                                                    border: '1px solid var(--border)',
                                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                                                                }}
                                                            >
                                                                <div
                                                                    className="mb-1.5 flex items-center justify-between gap-3 pb-1.5"
                                                                    style={{ borderBottom: '1px solid color-mix(in srgb, var(--border) 60%, transparent)' }}
                                                                >
                                                                    <span className="font-display text-[9px] tracking-wider uppercase text-muted-foreground">
                                                                        L{likelihood} · I{impact}
                                                                    </span>
                                                                    <span className="font-heading text-sm text-primary">
                                                                        {score}
                                                                    </span>
                                                                </div>
                                                                {cellRisks.slice(0, 4).map((r) => (
                                                                    <p key={r.id} className="font-body truncate py-0.5 text-[11px] leading-tight text-foreground">
                                                                        {r.title}
                                                                    </p>
                                                                ))}
                                                                {cellRisks.length > 4 && (
                                                                    <p className="font-body mt-1 text-[10px] italic text-muted-foreground">
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
                                <div className="grid flex-1 grid-cols-5 gap-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <span
                                            key={i}
                                            className="text-center font-display text-[10px] tabular-nums text-muted-foreground opacity-50"
                                        >
                                            {i}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <p className="pt-1 text-center font-display text-[9px] tracking-widest uppercase text-muted-foreground opacity-50">
                                Impact
                            </p>
                        </div>

                        {/* Legend */}
                        <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.22em' }}>Low</span>
                                <div
                                    className="h-1.5 flex-1 rounded-full"
                                    style={{ background: 'linear-gradient(to right, #46bd5f 0%, #a3d977 25%, #f5b929 50%, #f76b15 75%, #e5484d 100%)' }}
                                />
                                <span className="text-[10px] uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.22em' }}>Critical</span>
                            </div>
                        </div>

                        {/* Selected risks */}
                        {highlighted && highlighted.length > 0 && (
                            <div
                                className="mt-4 rounded p-3"
                                style={{
                                    background: 'color-mix(in srgb, var(--primary) 5%, transparent)',
                                    border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
                                }}
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="font-display text-[9px] tracking-wider uppercase text-muted-foreground">
                                        Selected · {highlighted.length}
                                    </span>
                                    <button
                                        onClick={() => setHighlighted(null)}
                                        className="font-display text-[9px] tracking-wider uppercase text-muted-foreground transition-colors hover:text-primary"
                                    >
                                        Clear
                                    </button>
                                </div>
                                <ul className="space-y-1">
                                    {risks.filter((r) => highlighted.includes(r.id)).map((r) => (
                                        <li key={r.id} className="flex items-center justify-between gap-3">
                                            <span className="font-body truncate text-xs text-foreground">{r.title}</span>
                                            <span className="font-heading shrink-0 text-sm tabular-nums text-primary">{r.score}</span>
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
