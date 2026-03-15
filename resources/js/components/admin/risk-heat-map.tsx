import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// ISO/IEC 27005 likelihood × impact matrix
const impactLevels = ["Catastrophic", "Major", "Moderate", "Minor", "Negligible"]
const likelihoodLevels = ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"]

type Risk = {
    likelihood: number // 1-5
    impact: number     // 1-5
}

type Props = {
    risks?: Risk[]
}

function buildHeatMapData(risks: Risk[]): number[][] {
    // Initialize 5x5 grid with zeros [impact][likelihood]
    const grid = Array.from({ length: 5 }, () => Array(5).fill(0))

    risks.forEach(risk => {
        // likelihood and impact are 1-5 from DB
        // impact: 5=Catastrophic(index 0) ... 1=Negligible(index 4)
        // likelihood: 1=Rare(index 0) ... 5=Almost Certain(index 4)
        const impactIndex = 5 - risk.impact       // flip so high impact is at top
        const likelihoodIndex = risk.likelihood - 1
        if (impactIndex >= 0 && impactIndex < 5 && likelihoodIndex >= 0 && likelihoodIndex < 5) {
            grid[impactIndex][likelihoodIndex]++
        }
    })

    return grid
}

function getRiskColor(impactIndex: number, likelihoodIndex: number): string {
    // ISO/IEC 27005 risk scoring: higher impact + higher likelihood = more critical
    const score = (4 - impactIndex) + likelihoodIndex
    if (score >= 6) return "bg-red-500"
    if (score >= 4) return "bg-amber-500"
    if (score >= 2) return "bg-yellow-500"
    return "bg-green-500"
}

function getRiskOpacity(count: number): number {
    if (count === 0) return 0.15
    if (count <= 2) return 0.5
    if (count <= 5) return 0.7
    if (count <= 10) return 0.85
    return 1
}

export function RiskHeatMap({ risks = [] }: Props) {
    const riskData = buildHeatMapData(risks)
    const totalRisks = risks.length

    return (
        <Card className="bg-card border-border">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium">Risk Heat Map</CardTitle>
                    <span className="text-xs text-muted-foreground">
                        {totalRisks} {totalRisks === 1 ? 'risk' : 'risks'} plotted
                    </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Based on ISO/IEC 27005 likelihood × impact matrix
                </p>
            </CardHeader>
            <CardContent>
                {totalRisks === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-sm text-muted-foreground">No risks recorded yet</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                            Add risks to the register to populate the heat map
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex gap-4">
                            {/* Y-axis label */}
                            <div className="flex flex-col justify-center">
                                <span className="text-xs text-muted-foreground -rotate-90 whitespace-nowrap origin-center translate-y-12">
                                    Impact Level
                                </span>
                            </div>

                            <div className="flex-1 space-y-2">
                                {/* Grid */}
                                <div className="grid gap-1">
                                    {impactLevels.map((impact, impactIndex) => (
                                        <div key={impact} className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground w-20 text-right truncate">
                                                {impact}
                                            </span>
                                            <div className="flex-1 grid grid-cols-5 gap-1">
                                                {likelihoodLevels.map((likelihood, likelihoodIndex) => {
                                                    const count = riskData[impactIndex][likelihoodIndex]
                                                    const colorClass = getRiskColor(impactIndex, likelihoodIndex)
                                                    const opacity = getRiskOpacity(count)
                                                    return (
                                                        <div
                                                            key={likelihoodIndex}
                                                            className={`aspect-square rounded-md ${colorClass} flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-ring transition-all`}
                                                            style={{ opacity }}
                                                            title={`${impact} impact, ${likelihood} likelihood: ${count} risk${count !== 1 ? 's' : ''}`}
                                                        >
                                                            <span className="text-xs font-medium text-white drop-shadow-sm">
                                                                {count > 0 ? count : ""}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* X-axis labels */}
                                <div className="flex items-center gap-2 pt-2">
                                    <div className="w-20" />
                                    <div className="flex-1 grid grid-cols-5 gap-1">
                                        {likelihoodLevels.map((level) => (
                                            <span key={level} className="text-xs text-muted-foreground text-center truncate">
                                                {level}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground text-center pt-1">Likelihood</div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border">
                            {[
                                { color: "bg-red-500",    label: "Critical" },
                                { color: "bg-amber-500",  label: "High" },
                                { color: "bg-yellow-500", label: "Medium" },
                                { color: "bg-green-500",  label: "Low" },
                            ].map(({ color, label }) => (
                                <div key={label} className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded ${color}`} />
                                    <span className="text-xs text-muted-foreground">{label}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}