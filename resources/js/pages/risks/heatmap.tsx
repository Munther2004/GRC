import { Head } from '@inertiajs/react';
import { RiskHeatmap } from '@/components/admin/risk-heatmap';

type HeatmapRisk = {
    id: number;
    title: string;
    likelihood: number;
    impact: number;
    score: number;
    status: string;
};

interface Props {
    heatmap: HeatmapRisk[];
}

export default function HeatmapPage({ heatmap }: Props) {
    return (
        <>
            <Head title="Risk Heatmap" />
            <RiskHeatmap risks={heatmap} fullscreen={true} />
        </>
    );
}
