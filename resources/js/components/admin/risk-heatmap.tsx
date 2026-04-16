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

function getCellColors(score: number): { bg: string; text: string } {
    if (score >= 20) return { bg: 'rgba(139,38,53,0.85)',  text: '#E0F5EC' };
    if (score >= 15) return { bg: 'rgba(139,38,53,0.6)',   text: '#E0F5EC' };
    if (score >= 10) return { bg: 'rgba(40,90,72,0.55)', text: '#E0F5EC' };
    if (score >= 5)  return { bg: 'rgba(64,138,113,0.35)', text: '#E0F5EC' };
    return             { bg: 'rgba(176,228,204,0.25)', text: '#7ABFA8' };
}

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
                        <h1 className="font-heading text-4xl font-normal" style={{ color: '#E0F5EC' }}>
                            Risk Heat Map
                        </h1>
                        <p className="font-body text-sm" style={{ color: '#7ABFA8' }}>
                            <span className="font-heading not-italic" style={{ color: '#E0F5EC' }}>
                                {totalPlotted}
                            </span>{' '}
                            plotted
                            <span className="mx-1.5" style={{ color: 'rgba(156,139,122,0.4)' }}>·</span>
                            <span className="font-heading not-italic" style={{ color: '#8B2635' }}>
                                {criticalCount}
                            </span>{' '}
                            critical
                        </p>
                    </div>
                    <div className="font-display text-xs tracking-wider uppercase" style={{ color: 'rgba(156,139,122,0.6)' }}>
                        L × I
                    </div>
                </div>
                <div className="flex-1 overflow-auto">
                    <div className="flex gap-6 h-full p-4">
                        {/* Y axis label */}
                        <div className="flex w-6 flex-col items-center justify-center">
                            <span
                                className="-rotate-90 font-display text-xs tracking-widest whitespace-nowrap uppercase"
                                style={{ color: 'rgba(156,139,122,0.5)' }}
                            >
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
                                        <span
                                            className="w-4 text-right font-display text-sm tabular-nums"
                                            style={{ color: 'rgba(156,139,122,0.5)' }}
                                        >
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
                                                        className="relative aspect-square rounded transition-all duration-200 min-w-24"
                                                        style={{
                                                            background: colors.bg,
                                                            opacity: isEmpty ? 0.2 : 1,
                                                            cursor: isEmpty ? 'default' : 'pointer',
                                                            outline: isHighlighted ? `2px solid #408A71` : 'none',
                                                            transform: isHovered && !isEmpty ? 'scale(1.08)' : 'scale(1)',
                                                            boxShadow: isHovered && !isEmpty ? '0 8px 24px rgba(0,0,0,0.5)' : 'none',
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
                                                                        background: '#0D1F1C',
                                                                        border: '1px solid #285A48',
                                                                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                                                                    }}
                                                                >
                                                                    <div
                                                                        className="mb-2 flex items-center justify-between gap-3 pb-2"
                                                                        style={{ borderBottom: '1px solid rgba(40,90,72,0.6)' }}
                                                                    >
                                                                        <span className="font-display text-xs tracking-wider uppercase" style={{ color: '#7ABFA8' }}>
                                                                            L{likelihood} · I{impact}
                                                                        </span>
                                                                        <span className="font-heading text-base" style={{ color: '#408A71' }}>
                                                                            {score}
                                                                        </span>
                                                                    </div>
                                                                    {cellRisks.slice(0, 5).map((r) => (
                                                                        <p key={r.id} className="font-body truncate py-1 text-sm leading-tight" style={{ color: '#E0F5EC' }}>
                                                                            {r.title}
                                                                        </p>
                                                                    ))}
                                                                    {cellRisks.length > 5 && (
                                                                        <p className="font-body mt-2 text-xs italic" style={{ color: '#7ABFA8' }}>
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
                                                className="text-center font-display text-sm tabular-nums"
                                                style={{ color: 'rgba(156,139,122,0.5)' }}
                                            >
                                                {i}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <p className="pt-2 text-center font-display text-xs tracking-widest uppercase" style={{ color: 'rgba(156,139,122,0.5)' }}>
                                    Impact
                                </p>
                            </div>

                            {/* Legend */}
                            <div className="mt-8 pt-6" style={{ borderTop: '1px solid #285A48' }}>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="font-display text-xs tracking-wider uppercase" style={{ color: '#7ABFA8' }}>Low</span>
                                    <div
                                        className="h-2 flex-1 rounded-full"
                                        style={{ background: 'linear-gradient(to right, rgba(176,228,204,0.3), rgba(64,138,113,0.5), rgba(40,90,72,0.6), rgba(139,38,53,0.85))' }}
                                    />
                                    <span className="font-display text-xs tracking-wider uppercase" style={{ color: '#7ABFA8' }}>Critical</span>
                                </div>
                            </div>

                            {/* Selected risks */}
                            {highlighted && highlighted.length > 0 && (
                                <div className="mt-6 rounded p-4" style={{ background: 'rgba(64,138,113,0.05)', border: '1px solid rgba(64,138,113,0.2)' }}>
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="font-display text-xs tracking-wider uppercase" style={{ color: '#7ABFA8' }}>
                                            Selected · {highlighted.length}
                                        </span>
                                        <button
                                            onClick={() => setHighlighted(null)}
                                            className="font-display text-xs tracking-wider uppercase transition-colors"
                                            style={{ color: '#7ABFA8' }}
                                            onMouseEnter={e => (e.currentTarget.style.color = '#408A71')}
                                            onMouseLeave={e => (e.currentTarget.style.color = '#7ABFA8')}
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    <ul className="space-y-2 max-h-48 overflow-y-auto">
                                        {risks.filter((r) => highlighted.includes(r.id)).map((r) => (
                                            <li key={r.id} className="flex items-center justify-between gap-3">
                                                <span className="font-body truncate text-sm" style={{ color: '#E0F5EC' }}>{r.title}</span>
                                                <span className="font-heading shrink-0 text-base tabular-nums" style={{ color: '#408A71' }}>{r.score}</span>
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
        <Card>
            <CardHeader className="flex-row items-start justify-between gap-4 pb-4">
                <div className="space-y-1">
                    <CardTitle className="font-heading text-lg font-normal">
                        Risk Heat Map
                    </CardTitle>
                    <p className="font-body text-[11px] italic" style={{ color: '#7ABFA8' }}>
                        <span className="font-heading not-italic" style={{ color: '#E0F5EC' }}>
                            {totalPlotted}
                        </span>{' '}
                        plotted
                        <span className="mx-1.5" style={{ color: 'rgba(156,139,122,0.4)' }}>·</span>
                        <span className="font-heading not-italic" style={{ color: '#8B2635' }}>
                            {criticalCount}
                        </span>{' '}
                        critical
                    </p>
                </div>
                <div className="font-display text-[10px] tracking-wider uppercase" style={{ color: 'rgba(156,139,122,0.6)' }}>
                    L × I
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4">
                    {/* Y axis label */}
                    <div className="flex w-4 flex-col items-center justify-center">
                        <span
                            className="-rotate-90 font-display text-[9px] tracking-widest whitespace-nowrap uppercase"
                            style={{ color: 'rgba(156,139,122,0.5)' }}
                        >
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
                                    <span
                                        className="w-3 text-right font-display text-[10px] tabular-nums"
                                        style={{ color: 'rgba(156,139,122,0.5)' }}
                                    >
                                        {likelihood}
                                    </span>
                                    <div className="grid flex-1 grid-cols-5 gap-1.5">
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
                                                    className="relative aspect-square rounded transition-all duration-200"
                                                    style={{
                                                        background: colors.bg,
                                                        opacity: isEmpty ? 0.2 : 1,
                                                        cursor: isEmpty ? 'default' : 'pointer',
                                                        outline: isHighlighted ? `1px solid #408A71` : 'none',
                                                        transform: isHovered && !isEmpty ? 'scale(1.06)' : 'scale(1)',
                                                        boxShadow: isHovered && !isEmpty ? '0 4px 12px rgba(0,0,0,0.4)' : 'none',
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
                                                                    background: '#0D1F1C',
                                                                    border: '1px solid #285A48',
                                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                                                                }}
                                                            >
                                                                <div
                                                                    className="mb-1.5 flex items-center justify-between gap-3 pb-1.5"
                                                                    style={{ borderBottom: '1px solid rgba(40,90,72,0.6)' }}
                                                                >
                                                                    <span className="font-display text-[9px] tracking-wider uppercase" style={{ color: '#7ABFA8' }}>
                                                                        L{likelihood} · I{impact}
                                                                    </span>
                                                                    <span className="font-heading text-sm" style={{ color: '#408A71' }}>
                                                                        {score}
                                                                    </span>
                                                                </div>
                                                                {cellRisks.slice(0, 4).map((r) => (
                                                                    <p key={r.id} className="font-body truncate py-0.5 text-[11px] leading-tight" style={{ color: '#E0F5EC' }}>
                                                                        {r.title}
                                                                    </p>
                                                                ))}
                                                                {cellRisks.length > 4 && (
                                                                    <p className="font-body mt-1 text-[10px] italic" style={{ color: '#7ABFA8' }}>
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
                                <div className="grid flex-1 grid-cols-5 gap-1.5">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <span
                                            key={i}
                                            className="text-center font-display text-[10px] tabular-nums"
                                            style={{ color: 'rgba(156,139,122,0.5)' }}
                                        >
                                            {i}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <p className="pt-1 text-center font-display text-[9px] tracking-widest uppercase" style={{ color: 'rgba(156,139,122,0.5)' }}>
                                Impact
                            </p>
                        </div>

                        {/* Legend */}
                        <div className="mt-5 pt-4" style={{ borderTop: '1px solid #285A48' }}>
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-display text-[9px] tracking-wider uppercase" style={{ color: '#7ABFA8' }}>Low</span>
                                <div
                                    className="h-1 flex-1 rounded-full"
                                    style={{ background: 'linear-gradient(to right, rgba(176,228,204,0.3), rgba(64,138,113,0.5), rgba(40,90,72,0.6), rgba(139,38,53,0.85))' }}
                                />
                                <span className="font-display text-[9px] tracking-wider uppercase" style={{ color: '#7ABFA8' }}>Critical</span>
                            </div>
                        </div>

                        {/* Selected risks */}
                        {highlighted && highlighted.length > 0 && (
                            <div className="mt-4 rounded p-3" style={{ background: 'rgba(64,138,113,0.05)', border: '1px solid rgba(64,138,113,0.2)' }}>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="font-display text-[9px] tracking-wider uppercase" style={{ color: '#7ABFA8' }}>
                                        Selected · {highlighted.length}
                                    </span>
                                    <button
                                        onClick={() => setHighlighted(null)}
                                        className="font-display text-[9px] tracking-wider uppercase transition-colors"
                                        style={{ color: '#7ABFA8' }}
                                        onMouseEnter={e => (e.currentTarget.style.color = '#408A71')}
                                        onMouseLeave={e => (e.currentTarget.style.color = '#7ABFA8')}
                                    >
                                        Clear
                                    </button>
                                </div>
                                <ul className="space-y-1">
                                    {risks.filter((r) => highlighted.includes(r.id)).map((r) => (
                                        <li key={r.id} className="flex items-center justify-between gap-3">
                                            <span className="font-body truncate text-xs" style={{ color: '#E0F5EC' }}>{r.title}</span>
                                            <span className="font-heading shrink-0 text-sm tabular-nums" style={{ color: '#408A71' }}>{r.score}</span>
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
