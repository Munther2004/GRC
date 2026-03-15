import { AlertTriangle, Shield, TrendingDown, TrendingUp, FileCheck, ClipboardList } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type Stats = {
    total_risks: number
    critical_risks: number
    compliance_score: number
    open_risks: number
    total_assessments: number
    evidence_files: number
}

export function MetricsCards({ stats }: { stats: Stats }) {
    const metrics = [
        {
            title: "Total Risks",
            value: stats.total_risks.toString(),
            sub: `${stats.open_risks} open`,
            trend: "neutral",
            icon: AlertTriangle,
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
        },
        {
            title: "Critical Risks",
            value: stats.critical_risks.toString(),
            sub: "requiring immediate action",
            trend: "bad",
            icon: Shield,
            color: "text-red-500",
            bgColor: "bg-red-500/10",
        },
        {
            title: "Avg Compliance",
            value: stats.total_assessments > 0 ? `${Math.round(stats.compliance_score)}%` : "N/A",
            sub: stats.total_assessments > 0 ? "across all assessments" : "no assessments yet",
            trend: "good",
            icon: FileCheck,
            color: "text-green-500",
            bgColor: "bg-green-500/10",
        },
        {
            title: "Assessments",
            value: stats.total_assessments.toString(),
            sub: `${stats.evidence_files} evidence files`,
            trend: "good",
            icon: ClipboardList,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => (
                <Card key={metric.title} className="bg-card border-border">
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                    {metric.title}
                                </p>
                                <p className="text-2xl font-semibold">{metric.value}</p>
                                <div className="flex items-center gap-1 text-xs">
                                    {metric.trend === "good" && (
                                        <TrendingUp className="w-3 h-3 text-green-500" />
                                    )}
                                    {metric.trend === "bad" && (
                                        <TrendingDown className="w-3 h-3 text-red-500" />
                                    )}
                                    {metric.trend === "neutral" && (
                                        <TrendingUp className="w-3 h-3 text-amber-500" />
                                    )}
                                    <span className="text-muted-foreground">{metric.sub}</span>
                                </div>
                            </div>
                            <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                                <metric.icon className={`w-5 h-5 ${metric.color}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}