<?php

namespace App\Services;

use App\Models\Framework;
use App\Models\Risk;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class GrcMetricsService
{
    public function __construct(private ?User $user = null, private ?int $corporationFilter = null) {}

    /**
     * Effective corporation_id used by every aggregate query.
     *   - non-super_admin → caller's own corporation_id
     *   - super_admin     → optional drill-down corporation_id (or null = all)
     *   - no user         → null (all rows)
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

    private function scopedRisks(): Builder
    {
        $q = Risk::query();
        $corpId = $this->effectiveCorporationId();
        if ($corpId !== null) {
            $q->where('risks.corporation_id', $corpId);
        } elseif ($this->user && ! $this->user->isSuperAdmin()) {
            $q->whereRaw('1 = 0');
        }

        return $q;
    }

    private function scopedAssessments(): Builder
    {
        $q = \App\Models\Assessment::query();
        $corpId = $this->effectiveCorporationId();
        if ($corpId !== null) {
            $q->where('assessments.corporation_id', $corpId);
        } elseif ($this->user && ! $this->user->isSuperAdmin()) {
            $q->whereRaw('1 = 0');
        }

        return $q;
    }

    public function complianceSummary(): array
    {
        $tenantId = $this->effectiveCorporationId();

        $statusExpr = $tenantId !== null
            ? 'COALESCE(ccs.current_status, controls.current_status)'
            : 'controls.current_status';

        $query = DB::table('controls')
            ->where('controls.is_active', true);

        if ($tenantId !== null) {
            $query->leftJoin('corporation_control_statuses as ccs', function ($join) use ($tenantId) {
                $join->on('ccs.control_id', '=', 'controls.id')
                    ->where('ccs.corporation_id', '=', $tenantId);
            });
        }

        $row = $query->selectRaw("
                COUNT(*)                                                                                               AS total_active,
                COUNT(CASE WHEN {$statusExpr} NOT IN ('not_applicable') AND {$statusExpr} IS NOT NULL THEN 1 END)      AS applicable,
                COUNT(CASE WHEN {$statusExpr} = 'compliant'            THEN 1 END)                                     AS compliant,
                COUNT(CASE WHEN {$statusExpr} = 'partially_compliant'  THEN 1 END)                                     AS partial,
                COUNT(CASE WHEN {$statusExpr} = 'non_compliant'        THEN 1 END)                                     AS non_compliant,
                COUNT(CASE WHEN {$statusExpr} = 'not_applicable'       THEN 1 END)                                     AS not_applicable,
                COUNT(CASE WHEN {$statusExpr} IS NULL                  THEN 1 END)                                     AS not_set
            ")
            ->first();

        $applicable = (int) ($row->applicable ?? 0);
        $compliant = (int) ($row->compliant ?? 0);
        $partial = (int) ($row->partial ?? 0);

        return [
            'overall_pct' => $applicable > 0
                ? round((($compliant + ($partial * 0.5)) / $applicable) * 100, 1)
                : 0.0,
            'compliant' => $compliant,
            'partial' => $partial,
            'non_compliant' => (int) ($row->non_compliant ?? 0),
            'not_applicable' => (int) ($row->not_applicable ?? 0),
            'not_set' => (int) ($row->not_set ?? 0),
            'total_active' => (int) ($row->total_active ?? 0),
            'total_applicable' => $applicable,
        ];
    }

    public function riskCounts(): array
    {
        $t = Risk::levelThresholds();

        $row = $this->scopedRisks()
            ->selectRaw("
                COUNT(*) AS total,
                SUM(CASE WHEN likelihood * impact >= {$t['critical']}                                    THEN 1 ELSE 0 END) AS critical,
                SUM(CASE WHEN likelihood * impact >= {$t['high']}     AND likelihood * impact < {$t['critical']} THEN 1 ELSE 0 END) AS high,
                SUM(CASE WHEN likelihood * impact >= {$t['medium']}   AND likelihood * impact < {$t['high']}     THEN 1 ELSE 0 END) AS medium,
                SUM(CASE WHEN likelihood * impact <  {$t['medium']}                                    THEN 1 ELSE 0 END) AS low,
                SUM(CASE WHEN status IN ('open','in_progress')                                         THEN 1 ELSE 0 END) AS open_count,
                SUM(CASE WHEN status = 'closed'                                                        THEN 1 ELSE 0 END) AS closed_count,
                ROUND(AVG(likelihood * impact), 1) AS avg_score
            ")
            ->first();

        return [
            'total' => (int) ($row->total ?? 0),
            'critical' => (int) ($row->critical ?? 0),
            'high' => (int) ($row->high ?? 0),
            'medium' => (int) ($row->medium ?? 0),
            'low' => (int) ($row->low ?? 0),
            'open' => (int) ($row->open_count ?? 0),
            'closed' => (int) ($row->closed_count ?? 0),
            'avg_score' => (float) ($row->avg_score ?? 0),
        ];
    }

    public function evidenceCounts(): array
    {
        $query = DB::table('evidence');
        $this->applyEvidenceTenantScope($query);

        $row = $query
            ->selectRaw("
                COUNT(*)                                             AS total,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
                SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END) AS pending,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected
            ")
            ->first();

        $total = (int) ($row->total ?? 0);
        $approved = (int) ($row->approved ?? 0);

        return [
            'total' => $total,
            'approved' => $approved,
            'pending' => (int) ($row->pending ?? 0),
            'rejected' => (int) ($row->rejected ?? 0),
            'approval_rate' => $total > 0 ? round(($approved / $total) * 100, 1) : 0.0,
        ];
    }

    public function assessmentSummary(): array
    {
        $row = $this->scopedAssessments()
            ->selectRaw("
                COUNT(*) AS total,
                SUM(CASE WHEN status = 'completed'   THEN 1 ELSE 0 END) AS completed,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress,
                SUM(CASE WHEN status != 'completed'
                              AND due_date IS NOT NULL
                              AND due_date < NOW()   THEN 1 ELSE 0 END) AS overdue
            ")
            ->first();

        $ewAvg = $this->scopedAssessments()
            ->where('status', 'completed')
            ->whereNotNull('evidence_weighted_score')
            ->avg('evidence_weighted_score');

        return [
            'total' => (int) ($row->total ?? 0),
            'completed' => (int) ($row->completed ?? 0),
            'in_progress' => (int) ($row->in_progress ?? 0),
            'overdue' => (int) ($row->overdue ?? 0),
            'evidence_weighted_avg' => $ewAvg !== null ? round((float) $ewAvg, 1) : null,
        ];
    }

    public function evidenceExpiry(int $soonDays = 14): array
    {
        $now = now();

        $expiringSoon = DB::table('evidence')
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '>=', $now)
            ->where('expiry_date', '<=', $now->copy()->addDays($soonDays));
        $this->applyEvidenceTenantScope($expiringSoon);

        $expired = DB::table('evidence')
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '<', $now);
        $this->applyEvidenceTenantScope($expired);

        return [
            'expiring_soon' => $expiringSoon->count(),
            'expired' => $expired->count(),
        ];
    }

    /**
     * Restrict an `evidence` table query to rows visible to $this->user.
     *
     * Evidence has no `corporation_id`. Tenant ownership is derived from the
     * parent assessment_item -> assessment.corporation_id, with a fall-back to
     * the uploader's corporation_id for direct-attached evidence.
     *
     * For the `user` role we additionally constrain to rows the caller
     * personally uploaded.
     */
    private function applyEvidenceTenantScope(\Illuminate\Database\Query\Builder $query): void
    {
        $user = $this->user;
        $corpId = $this->effectiveCorporationId();

        // super_admin without a drill-down filter sees all evidence.
        if ($corpId === null) {
            if ($user && ! $user->isSuperAdmin()) {
                $query->whereRaw('1 = 0');
            }

            return;
        }

        $query->where(function ($outer) use ($corpId) {
            $outer->whereExists(function ($sub) use ($corpId) {
                $sub->select(DB::raw(1))
                    ->from('assessment_items as ai')
                    ->join('assessments as a', 'ai.assessment_id', '=', 'a.id')
                    ->whereColumn('ai.id', 'evidence.assessment_item_id')
                    ->where('a.corporation_id', $corpId);
            })->orWhere(function ($alt) use ($corpId) {
                $alt->whereNull('evidence.assessment_item_id')
                    ->whereExists(function ($sub) use ($corpId) {
                        $sub->select(DB::raw(1))
                            ->from('users as u')
                            ->whereColumn('u.id', 'evidence.user_id')
                            ->where('u.corporation_id', $corpId);
                    });
            });
        });

        if ($user->isUser()) {
            $query->where('evidence.user_id', $user->id);
        }
    }

    public function openRisksByLevel(): array
    {
        $t = Risk::levelThresholds();
        $row = $this->scopedRisks()
            ->where('status', 'open')
            ->selectRaw("
                SUM(CASE WHEN likelihood * impact >= {$t['critical']}                                              THEN 1 ELSE 0 END) AS critical,
                SUM(CASE WHEN likelihood * impact >= {$t['high']}     AND likelihood * impact < {$t['critical']}   THEN 1 ELSE 0 END) AS high,
                SUM(CASE WHEN likelihood * impact >= {$t['medium']}   AND likelihood * impact < {$t['high']}       THEN 1 ELSE 0 END) AS medium,
                SUM(CASE WHEN likelihood * impact <  {$t['medium']}                                               THEN 1 ELSE 0 END) AS low
            ")
            ->first();

        return [
            'critical' => (int) ($row->critical ?? 0),
            'high' => (int) ($row->high ?? 0),
            'medium' => (int) ($row->medium ?? 0),
            'low' => (int) ($row->low ?? 0),
        ];
    }

    public function frameworkCompliance(): \Illuminate\Support\Collection
    {
        $tenantId = $this->effectiveCorporationId();

        $statusExpr = $tenantId !== null
            ? 'COALESCE(ccs.current_status, controls.current_status)'
            : 'controls.current_status';

        $query = DB::table('controls')
            ->join('frameworks', 'frameworks.id', '=', 'controls.framework_id')
            ->where('controls.is_active', true)
            ->where('frameworks.is_active', true);

        if ($tenantId !== null) {
            $query->leftJoin('corporation_control_statuses as ccs', function ($join) use ($tenantId) {
                $join->on('ccs.control_id', '=', 'controls.id')
                    ->where('ccs.corporation_id', '=', $tenantId);
            });
        }

        return $query->selectRaw("
                frameworks.id,
                frameworks.short_name                                                               AS name,
                frameworks.name                                                                     AS full_name,
                COUNT(*)                                                                            AS total_controls,
                SUM(CASE WHEN {$statusExpr} = 'compliant'           THEN 1 ELSE 0 END)              AS compliant,
                SUM(CASE WHEN {$statusExpr} = 'partially_compliant' THEN 1 ELSE 0 END)              AS partial,
                SUM(CASE WHEN {$statusExpr} = 'non_compliant'       THEN 1 ELSE 0 END)              AS non_compliant,
                SUM(CASE WHEN {$statusExpr} NOT IN ('not_applicable')
                              AND {$statusExpr} IS NOT NULL          THEN 1 ELSE 0 END)             AS applicable
            ")
            ->groupBy('frameworks.id', 'frameworks.short_name', 'frameworks.name')
            ->orderBy('frameworks.short_name')
            ->get()
            ->filter(fn ($row) => (int) $row->total_controls > 0)
            ->map(function ($row) {
                $applicable = (int) $row->applicable;
                $compliant = (int) $row->compliant;
                $partial = (int) $row->partial;
                $pct = $applicable > 0
                    ? round((($compliant + ($partial * 0.5)) / $applicable) * 100, 1)
                    : 0.0;

                return [
                    'name' => $row->name,
                    'full_name' => $row->full_name,
                    'total_controls' => (int) $row->total_controls,
                    'compliant' => $compliant,
                    'partial' => $partial,
                    'non_compliant' => (int) $row->non_compliant,
                    'compliance_pct' => $pct,
                ];
            })
            ->values();
    }

    public function frameworkAssessmentScores(): \Illuminate\Support\Collection
    {
        $corpId = $this->effectiveCorporationId();
        $user = $this->user;

        return Framework::where('is_active', true)
            ->with(['assessments' => function ($q) use ($user, $corpId) {
                $q->where('status', 'completed')->orderBy('created_at', 'desc');
                if ($corpId !== null) {
                    $q->where('assessments.corporation_id', $corpId);
                } elseif ($user && ! $user->isSuperAdmin()) {
                    $q->whereRaw('1 = 0');
                }
            }])
            ->get()
            ->map(fn ($fw) => [
                'id' => $fw->id,
                'name' => $fw->short_name,
                'full_name' => $fw->name,
                'latest_score' => $fw->assessments->first()?->compliance_percentage,
                'evidence_score' => $fw->assessments->first()?->evidence_weighted_score,
                'assessments_count' => $fw->assessments->count(),
                'trend' => $fw->assessments->take(5)->pluck('compliance_percentage')->reverse()->values(),
            ]);
    }
}
