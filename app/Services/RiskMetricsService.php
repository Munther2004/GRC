<?php

namespace App\Services;

use App\Models\Assessment;
use App\Models\Control;
use App\Models\Evidence;
use App\Models\Risk;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class RiskMetricsService
{
    public function __construct(private ?User $user = null) {}

    private function scopedRisks(): Builder
    {
        $q = Risk::query();
        return $this->user ? $this->user->organisationScope($q) : $q;
    }

    private function scopedAssessments(): Builder
    {
        $q = Assessment::query();
        return $this->user ? $this->user->organisationScope($q) : $q;
    }

    /**
     * Evidence has no corporation_id today, so scope through the uploader
     * (evidence.user_id → users.corporation_id). Mirrors EvidenceController.
     */
    private function scopedEvidence(): Builder
    {
        $q = Evidence::query();
        if (! $this->user) {
            return $q;
        }
        if ($this->user->isSuperAdmin()) {
            return $q;
        }
        if (! $this->user->corporation_id) {
            return $q->whereRaw('1 = 0');
        }
        $corpId = $this->user->corporation_id;
        return $q->whereHas('user', fn ($qq) => $qq->where('corporation_id', $corpId));
    }

    /**
     * Calculate the overall risk exposure index based on control compliance
     * and risk scores across the portfolio.
     */
    public function calculateRiskExposure(): array
    {
        $totalControls = Control::whereNotNull('current_status')
            ->where('current_status', '!=', 'not_applicable')
            ->count();

        $nonCompliant = Control::where('current_status', 'non_compliant')->count();
        $partialCompliant = Control::where('current_status', 'partially_compliant')->count();

        $riskExposure = $totalControls > 0
            ? round((($nonCompliant * 1.0 + $partialCompliant * 0.5) / $totalControls) * 100, 1)
            : 0;

        $avgRiskScore = round((float) ($this->scopedRisks()->avg(DB::raw('likelihood * impact')) ?? 0), 1);
        $totalRisks = $this->scopedRisks()->count();
        $criticalRisks = $this->scopedRisks()->where('likelihood', '>=', 4)->where('impact', '>=', 4)->count();

        return [
            'risk_exposure' => $riskExposure,
            'avg_risk_score' => $avgRiskScore,
            'total_risks' => $totalRisks,
            'critical_risks' => $criticalRisks,
        ];
    }

    /**
     * Calculate a blended Compliance Health Score (0–100) and letter grade.
     *
     * Weights:
     *   40 pts — evidence-weighted compliance (or self-assessed if none available)
     *   20 pts — critical risk penalty  (−5 per critical risk, floor 0)
     *   20 pts — evidence approval rate
     *   10 pts — overdue items penalty  (−2 per overdue assessment/risk, floor 0)
     *   10 pts — open risk penalty      (−0.5 per open risk, floor 0)
     */
    public function calculateHealthScore(): array
    {
        // Component 1 — compliance (40 pts)
        $evidenceWeighted = $this->scopedAssessments()
            ->where('status', 'completed')
            ->whereNotNull('evidence_weighted_score')
            ->avg('evidence_weighted_score');

        if ($evidenceWeighted !== null) {
            $compliancePts = ($evidenceWeighted / 100) * 40;
        } else {
            // Fall back to self-assessed (controls are shared platform data)
            $applicable = Control::where('is_active', true)->where('current_status', '!=', 'not_applicable');
            $total = (clone $applicable)->count();
            $compliant = (clone $applicable)->where('current_status', 'compliant')->count();
            $partial = (clone $applicable)->where('current_status', 'partially_compliant')->count();
            $selfAssessed = $total > 0 ? (($compliant + ($partial * 0.5)) / $total) * 100 : 0;
            $compliancePts = ($selfAssessed / 100) * 40;
        }

        // Component 2 — critical risks (20 pts)
        $criticalRisks = $this->scopedRisks()->whereRaw('likelihood * impact >= 15')->count();
        $criticalPts = max(0, 20 - ($criticalRisks * 5));

        // Component 3 — evidence approval rate (20 pts)
        $totalEvidence = $this->scopedEvidence()->count();
        $approvedEvidence = $this->scopedEvidence()->where('status', 'approved')->count();
        $approvalRate = $totalEvidence > 0 ? ($approvedEvidence / $totalEvidence) * 100 : 100;
        $evidencePts = ($approvalRate / 100) * 20;

        // Component 4 — overdue items (10 pts)
        $overdueAssessments = $this->scopedAssessments()
            ->where('status', '!=', 'completed')
            ->whereNotNull('due_date')
            ->where('due_date', '<', now())
            ->count();
        $overdueRisks = $this->scopedRisks()
            ->where('due_date', '<', now())
            ->whereNotIn('status', ['closed'])
            ->count();
        $overdueItems = $overdueAssessments + $overdueRisks;
        $overduePts = max(0, 10 - ($overdueItems * 2));

        // Component 5 — open risks (10 pts)
        $openRisks = $this->scopedRisks()->whereIn('status', ['open', 'in_progress'])->count();
        $openRisksPts = max(0, 10 - ($openRisks * 0.5));

        $healthScore = round(
            $compliancePts + $criticalPts + $evidencePts + $overduePts + $openRisksPts, 1
        );

        $grade = match (true) {
            $healthScore >= 90 => 'A',
            $healthScore >= 75 => 'B',
            $healthScore >= 60 => 'C',
            $healthScore >= 40 => 'D',
            default => 'F',
        };

        return [
            'health_score' => $healthScore,
            'grade' => $grade,
            'components' => [
                'compliance' => round($compliancePts, 1),
                'critical_risks' => round($criticalPts, 1),
                'evidence_quality' => round($evidencePts, 1),
                'overdue_items' => round($overduePts, 1),
                'open_risks' => round($openRisksPts, 1),
            ],
            'raw' => [
                'critical_risks' => $criticalRisks,
                'open_risks' => $openRisks,
                'overdue_items' => $overdueItems,
                'approval_rate' => round($approvalRate, 1),
                'compliance_basis' => $evidenceWeighted !== null ? 'evidence' : 'self_assessed',
            ],
        ];
    }
}
