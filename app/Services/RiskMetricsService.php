<?php

namespace App\Services;

use App\Models\Control;
use App\Models\Risk;
use Illuminate\Support\Facades\DB;

class RiskMetricsService
{
    /**
     * Calculate the overall risk exposure index based on control compliance
     * and risk scores across the portfolio.
     */
    public function calculateRiskExposure(): array
    {
        $totalControls = Control::whereNotNull('current_status')
            ->where('current_status', '!=', 'not_applicable')
            ->count();

        $nonCompliant     = Control::where('current_status', 'non_compliant')->count();
        $partialCompliant = Control::where('current_status', 'partially_compliant')->count();

        $riskExposure = $totalControls > 0
            ? round((($nonCompliant * 1.0 + $partialCompliant * 0.5) / $totalControls) * 100, 1)
            : 0;

        $avgRiskScore  = round(Risk::avg(DB::raw('likelihood * impact')) ?? 0, 1);
        $totalRisks    = Risk::count();
        $criticalRisks = Risk::where('likelihood', '>=', 4)->where('impact', '>=', 4)->count();

        return [
            'risk_exposure'  => $riskExposure,
            'avg_risk_score' => $avgRiskScore,
            'total_risks'    => $totalRisks,
            'critical_risks' => $criticalRisks,
        ];
    }
}
