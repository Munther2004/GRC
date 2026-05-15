<?php

namespace App\Services;

use App\Models\Assessment;
use App\Models\Control;
use App\Models\Evidence;
use App\Models\Risk;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RiskMetricsService
{
    public function __construct(
        private ?User $user = null,
        private ?int $corporationFilter = null,
        private ?int $frameworkFilter = null,
    ) {}

    /**
     * Effective corporation_id used by all internal aggregates:
     *   - non-super_admin → user's own corporation_id
     *   - super_admin     → optional drill-down corporation_id (or null = all)
     */
    private function effectiveCorporationId(): ?int
    {
        if (! $this->user) {
            return null;
        }
        if ($this->user->isSuperAdmin()) {
            return $this->corporationFilter;
        }

        return $this->user->corporation_id;
    }

    private function scopeRisks()
    {
        $q = Risk::query();
        $corpId = $this->effectiveCorporationId();
        if ($corpId !== null) {
            $q->where('risks.corporation_id', $corpId);
        } elseif ($this->user && ! $this->user->isSuperAdmin()) {
            $q->whereRaw('1 = 0');
        }
        if ($this->frameworkFilter !== null) {
            $fwId = $this->frameworkFilter;
            $q->whereExists(function ($sub) use ($fwId) {
                $sub->select(DB::raw(1))
                    ->from('controls')
                    ->whereColumn('controls.id', 'risks.source_control_id')
                    ->where('controls.framework_id', $fwId);
            });
        }

        return $q;
    }

    private function scopeAssessments()
    {
        $q = Assessment::query();
        $corpId = $this->effectiveCorporationId();
        if ($corpId !== null) {
            $q->where('assessments.corporation_id', $corpId);
        } elseif ($this->user && ! $this->user->isSuperAdmin()) {
            $q->whereRaw('1 = 0');
        }
        if ($this->frameworkFilter !== null) {
            $q->where('assessments.framework_id', $this->frameworkFilter);
        }

        return $q;
    }

    private function scopeEvidence()
    {
        // Evidence has no corporation_id column. Scope through the
        // uploading user's corporation when the actor is tenant-bound.
        $q = Evidence::query();
        $corpId = $this->effectiveCorporationId();
        if ($corpId === null) {
            // super_admin without a drill-down filter sees all evidence.
            if ($this->user && ! $this->user->isSuperAdmin()) {
                $q->whereRaw('1 = 0');
            }

            return $q;
        }

        return $q->whereExists(function ($sub) use ($corpId) {
            $sub->select(DB::raw(1))
                ->from('users')
                ->whereColumn('users.id', 'evidence.user_id')
                ->where('users.corporation_id', $corpId);
        });
    }

    /**
     * Aggregate control statuses, resolving each row's effective status from
     * the per-tenant pivot when the user is tenant-scoped, otherwise reading
     * the legacy global controls.current_status.
     *
     * @param  array<string,string>  $expressions  alias => raw SQL using {status} placeholder
     */
    private function controlStatusAggregate(array $expressions, bool $onlyActive = false): object
    {
        $tenantId = $this->effectiveCorporationId();

        $statusExpr = $tenantId !== null
            ? 'COALESCE(ccs.current_status, controls.current_status)'
            : 'controls.current_status';

        $query = DB::table('controls');
        if ($onlyActive) {
            $query->where('controls.is_active', true);
        }
        if ($tenantId !== null) {
            $query->leftJoin('corporation_control_statuses as ccs', function ($join) use ($tenantId) {
                $join->on('ccs.control_id', '=', 'controls.id')
                    ->where('ccs.corporation_id', '=', $tenantId);
            });
        }

        $select = [];
        foreach ($expressions as $alias => $expr) {
            $clause = str_replace('{status}', $statusExpr, $expr);
            $select[] = "COUNT(CASE WHEN {$clause} THEN 1 END) AS {$alias}";
        }

        return $query->selectRaw(implode(', ', $select))->first();
    }

    /**
     * Calculate the overall risk exposure index based on control compliance
     * and risk scores across the portfolio.
     */
    public function calculateRiskExposure(): array
    {
        $row = $this->controlStatusAggregate([
            'applicable' => "{status} IS NOT NULL AND {status} != 'not_applicable'",
            'non_compliant' => "{status} = 'non_compliant'",
            'partial' => "{status} = 'partially_compliant'",
        ]);

        $totalControls = (int) ($row->applicable ?? 0);
        $nonCompliant = (int) ($row->non_compliant ?? 0);
        $partialCompliant = (int) ($row->partial ?? 0);

        $riskExposure = $totalControls > 0
            ? round((($nonCompliant * 1.0 + $partialCompliant * 0.5) / $totalControls) * 100, 1)
            : 0;

        $avgRiskScore = round($this->scopeRisks()->avg(DB::raw('likelihood * impact')) ?? 0, 1);
        $totalRisks = $this->scopeRisks()->count();
        $criticalRisks = $this->scopeRisks()->where('likelihood', '>=', 4)->where('impact', '>=', 4)->count();

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
        $evidenceWeighted = $this->scopeAssessments()
            ->where('status', 'completed')
            ->whereNotNull('evidence_weighted_score')
            ->avg('evidence_weighted_score');

        if ($evidenceWeighted !== null) {
            $compliancePts = ($evidenceWeighted / 100) * 40;
        } else {
            // Fall back to self-assessed (per-tenant via the status pivot)
            $row = $this->controlStatusAggregate([
                'applicable' => "{status} IS NOT NULL AND {status} != 'not_applicable'",
                'compliant' => "{status} = 'compliant'",
                'partial' => "{status} = 'partially_compliant'",
            ], onlyActive: true);
            $total = (int) ($row->applicable ?? 0);
            $compliant = (int) ($row->compliant ?? 0);
            $partial = (int) ($row->partial ?? 0);
            // A brand-new tenant has no completed assessments AND no
            // self-assessed controls. Score them as fully compliant (40/40)
            // so the dashboard reads 100 by default; the score only drops
            // as real evaluation introduces gaps.
            $selfAssessed = $total > 0 ? (($compliant + ($partial * 0.5)) / $total) * 100 : 100;
            $compliancePts = ($selfAssessed / 100) * 40;
        }

        // Component 2 — critical risks (20 pts)
        $criticalRisks = $this->scopeRisks()->whereRaw('likelihood * impact >= 15')->count();
        $criticalPts = max(0, 20 - ($criticalRisks * 5));

        // Component 3 — evidence approval rate (20 pts)
        $totalEvidence = $this->scopeEvidence()->count();
        $approvedEvidence = $this->scopeEvidence()->where('status', 'approved')->count();
        $approvalRate = $totalEvidence > 0 ? ($approvedEvidence / $totalEvidence) * 100 : 100;
        $evidencePts = ($approvalRate / 100) * 20;

        // Component 4 — overdue items (10 pts)
        $overdueAssessments = $this->scopeAssessments()
            ->where('status', '!=', 'completed')
            ->whereNotNull('due_date')
            ->where('due_date', '<', now())
            ->count();
        $overdueRisks = $this->scopeRisks()
            ->where('due_date', '<', now())
            ->whereNotIn('status', ['closed'])
            ->count();
        $overdueItems = $overdueAssessments + $overdueRisks;
        $overduePts = max(0, 10 - ($overdueItems * 2));

        // Component 5 — open risks (10 pts)
        $openRisks = $this->scopeRisks()->whereIn('status', ['open', 'in_progress'])->count();
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
