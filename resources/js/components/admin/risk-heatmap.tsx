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

function getCellColor(score: number): string {
    if (score >= 15) return 'bg-red-600';
    if (score >= 10) return 'bg-orange-500';
    if (score >= 5)  return 'bg-yellow-500';
    return 'bg-green-600';
}

function getCellLabel(score: number): string {
    if (score >= 15) return 'Critical';
    if (score >= 10) return 'High';
    if (score >= 5)  return 'Medium';
    return 'Low';
}

export function RiskHeatmap({ risks }: Props) {
    const [highlighted, setHighlighted] = useState<number[] | null>(null);

    // Build 5x5 grid indexed as [likelihood 1-5][impact 1-5]
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

    // Render rows from likelihood 5 (top) down to 1 (bottom)
    const likelihoodRows = [5, 4, 3, 2, 1];

    return (
        <Card className="bg-card border-border">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">Risk Heat Map</CardTitle>
                <p className="text-xs text-muted-foreground">
                    Likelihood × Impact — {risks.length} risk{risks.length !== 1 ? 's' : ''} plotted
                </p>
            </CardHeader>
            <CardContent>
                <div className="flex gap-3">
                    {/* Y-axis label */}
                    <div className="flex items-center justify-center w-5">
                        <span className="text-xs text-muted-foreground -rotate-90 whitespace-nowrap">
                            ↑ Likelihood
                        </span>
                    </div>

                    <div className="flex-1 space-y-1">
                        {/* Y-axis values + grid rows */}
                        {likelihoodRows.map(likelihood => (
                            <div key={likelihood} className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground w-4 text-center flex-shrink-0">{likelihood}</span>
                                <div className="flex-1 grid grid-cols-5 gap-1">
                                    {[1, 2, 3, 4, 5].map(impact => {
                                        const cellRisks = grid[likelihood - 1][impact - 1];
                                        const score = likelihood * impact;
                                        const colorClass = getCellColor(score);
                                        const isHighlighted = highlighted && cellRisks.some(r => highlighted.includes(r.id));

                                        return (
                                            <div
                                                key={impact}
                                                className={`
                                                    aspect-square rounded flex items-center justify-center
                                                    cursor-pointer transition-all relative group
                                                    ${colorClass}
                                                    ${cellRisks.length === 0 ? 'opacity-20' : 'opacity-80 hover:opacity-100'}
                                                    ${isHighlighted ? 'ring-2 ring-white opacity-100 scale-105' : ''}
                                                `}
                                                onClick={() => handleCellClick(cellRisks)}
                                                title={`L${likelihood}×I${impact} = ${score} (${getCellLabel(score)})${cellRisks.length > 0 ? '\n' + cellRisks.map(r => r.title).join('\n') : ''}`}
                                            >
                                                {cellRisks.length > 0 && (
                                                    <span className="text-xs font-bold text-white drop-shadow">
                                                        {cellRisks.length}
                                                    </span>
                                                )}

                                                {/* Tooltip */}
                                                {cellRisks.length > 0 && (
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 hidden group-hover:block w-max max-w-[200px]">
                                                        <div className="bg-gray-900 text-white text-xs rounded p-2 shadow-lg">
                                                            <p className="font-semibold mb-1">Score {score} — {getCellLabel(score)}</p>
                                                            {cellRisks.map(r => (
                                                                <p key={r.id} className="truncate">• {r.title}</p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* X-axis values */}
                        <div className="flex items-center gap-1 pt-1">
                            <div className="w-4" />
                            <div className="flex-1 grid grid-cols-5 gap-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <span key={i} className="text-xs text-muted-foreground text-center">{i}</span>
                                ))}
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">Impact →</p>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border flex-wrap">
                    {[
                        { color: 'bg-green-600',  label: 'Low (1–4)' },
                        { color: 'bg-yellow-500', label: 'Medium (5–9)' },
                        { color: 'bg-orange-500', label: 'High (10–14)' },
                        { color: 'bg-red-600',    label: 'Critical (15–25)' },
                    ].map(({ color, label }) => (
                        <div key={label} className="flex items-center gap-1.5">
                            <div className={`w-3 h-3 rounded ${color}`} />
                            <span className="text-xs text-muted-foreground">{label}</span>
                        </div>
                    ))}
                </div>

                {/* Highlighted risk list */}
                {highlighted && highlighted.length > 0 && (
                    <div className="mt-3 p-2 bg-muted rounded text-xs">
                        <p className="font-semibold mb-1">Selected risks:</p>
                        {risks.filter(r => highlighted.includes(r.id)).map(r => (
                            <p key={r.id} className="text-muted-foreground truncate">
                                • {r.title} <span className="opacity-60">(score: {r.score})</span>
                            </p>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
