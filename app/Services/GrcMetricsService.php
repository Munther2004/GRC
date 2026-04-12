<?php

namespace App\Services;

use App\Models\Framework;
use App\Models\Risk;
use Illuminate\Support\Facades\DB;

/**
 * Provides lightweight, SQL-aggregate metrics used across Dashboard,
 * ExecutiveDashboard, ExecutiveSummary, and Report controllers.
 *
 * All public methods issue exactly ONE database query each, replacing
 * the prior pattern of loading entire tables into PHP collections and
 * then filtering/counting in memory.
 */
class GrcMetricsService
{
    /**
     * Compliance breakdown from the controls table.
     * Uses model thresholds: compliant = 1.0, partially_compliant = 0.5.
     *
     * @return array{overall_pct: float, compliant: int, partial: int,
     *               non_compliant: int, not_applicable: int, total_applicable: int}
     */
    public function complianceSummary(): array
    {
        $row = DB::table('controls')
            ->where('is_active', true)
            ->selectRaw("
                COUNT(*)                                                                               AS total_active,
                COUNT(CASE WHEN current_status NOT IN ('not_applicable') AND current_status IS NOT NULL THEN 1 END) AS applicable,
                COUNT(CASE WHEN current_status = 'compliant'            THEN 1 END) AS compliant,
                COUNT(CASE WHEN current_status = 'partially_compliant'  THEN 1 END) AS partial,
                COUNT(CASE WHEN current_status = 'non_compliant'        THEN 1 END) AS non_compliant,
                COUNT(CASE WHEN current_status = 'not_applicable'       THEN 1 END) AS not_applicable,
                COUNT(CASE WHEN current_status IS NULL                  THEN 1 END) AS not_set
            ")
            ->first();

        $applicable = (int) ($row->applicable ?? 0);
        $compliant  = (int) ($row->compliant  ?? 0);
        $partial    = (int) ($row->partial    ?? 0);

        return [
            'overall_pct'      => $applicable > 0
                ? round((($compliant + ($partial * 0.5)) / $applicable) * 100, 1)
                : 0.0,
            'compliant'        => $compliant,
            'partial'          => $partial,
            'non_compliant'    => (int) ($row->non_compliant  ?? 0),
            'not_applicable'   => (int) ($row->not_applicable ?? 0),
            'not_set'          => (int) ($row->not_set        ?? 0),
            'total_active'     => (int) ($row->total_active   ?? 0),
            'total_applicable' => $applicable,
        ];
    }

    /**
     * Risk counts broken down by level using Risk::levelThresholds() as the canonical source.
     *
     * @return array{total: int, critical: int, high: int, medium: int, low: int,
     *               open: int, closed: int, avg_score: float}
     */
    public function riskCounts(): array
    {
        $t = Risk::levelThresholds(); // ['critical' => 15, 'high' => 10, 'medium' => 5]

        $row = DB::table('risks')
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
            'total'     => (int)   ($row->total       ?? 0),
            'critical'  => (int)   ($row->critical    ?? 0),
            'high'      => (int)   ($row->high        ?? 0),
            'medium'    => (int)   ($row->medium      ?? 0),
            'low'       => (int)   ($row->low         ?? 0),
            'open'      => (int)   ($row->open_count  ?? 0),
            'closed'    => (int)   ($row->closed_count ?? 0),
            'avg_score' => (float) ($row->avg_score   ?? 0),
        ];
    }

    /**
     * Evidence counts by status — all four in one query.
     *
     * @return array{total: int, approved: int, pending: int, rejected: int,
     *               approval_rate: float}
     */
    public function evidenceCounts(): array
    {
        $row = DB::table('evidence')
            ->selectRaw("
                COUNT(*)                                             AS total,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
                SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END) AS pending,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected
            ")
            ->first();

        $total    = (int) ($row->total    ?? 0);
        $approved = (int) ($row->approved ?? 0);

        return [
            'total'         => $total,
            'approved'      => $approved,
            'pending'       => (int) ($row->pending  ?? 0),
            'rejected'      => (int) ($row->rejected ?? 0),
            'approval_rate' => $total > 0 ? round(($approved / $total) * 100, 1) : 0.0,
        ];
    }

    /**
     * Assessment counts — total, completed, in_progress, and overdue — in a single
     * aggregate query, plus the average evidence-weighted score for completed assessments.
     *
     * @return array{total: int, completed: int, in_progress: int, overdue: int,
     *               evidence_weighted_avg: float|null}
     */
    public function assessmentSummary(): array
    {
        $row = DB::table('assessments')
            ->selectRaw("
                COUNT(*) AS total,
                SUM(CASE WHEN status = 'completed'   THEN 1 ELSE 0 END) AS completed,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress,
                SUM(CASE WHEN status != 'completed'
                              AND due_date IS NOT NULL
                              AND due_date < NOW()   THEN 1 ELSE 0 END) AS overdue
            ")
            ->first();

        $ewAvg = DB::table('assessments')
            ->where('status', 'completed')
            ->whereNotNull('evidence_weighted_score')
            ->avg('evidence_weighted_score');

        return [
            'total'                 => (int) ($row->total       ?? 0),
            'completed'             => (int) ($row->completed   ?? 0),
            'in_progress'           => (int) ($row->in_progress ?? 0),
            'overdue'               => (int) ($row->overdue     ?? 0),
            'evidence_weighted_avg' => $ewAvg !== null ? round((float) $ewAvg, 1) : null,
        ];
    }

    /**
     * Evidence expiry counts in two targeted queries.
     *
     * @param  int $soonDays  Days ahead to consider "expiring soon" (default 14)
     * @return array{expiring_soon: int, expired: int}
     */
    public function evidenceExpiry(int $soonDays = 14): array
    {
        $now = now();
        return [
            'expiring_soon' => DB::table('evidence')
                ->whereNotNull('expiry_date')
                ->where('expiry_date', '>=', $now)
                ->where('expiry_date', '<=', $now->copy()->addDays($soonDays))
                ->count(),
            'expired' => DB::table('evidence')
                ->whereNotNull('expiry_date')
                ->where('expiry_date', '<', $now)
                ->count(),
        ];
    }

    /**
     * Open-risk counts split by severity level — one aggregate query, using
     * Risk::levelThresholds() as the canonical threshold source.
     *
     * @return array{critical: int, high: int, medium: int, low: int}
     */
    public function openRisksByLevel(): array
    {
        $t   = Risk::levelThresholds();
        $row = DB::table('risks')
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
            'high'     => (int) ($row->high     ?? 0),
            'medium'   => (int) ($row->medium   ?? 0),
            'low'      => (int) ($row->low      ?? 0),
        ];
    }

    /**
     * Per-framework compliance percentage derived from the controls table via a
     * single GROUP BY query — replaces Framework::with(['controls']) + PHP filtering.
     * Uses the same formula as complianceSummary(): compliant=1.0, partial=0.5.
     * Frameworks with no active controls are excluded.
     *
     * @return \Illuminate\Support\Collection<int, array{name: string, full_name: string,
     *     total_controls: int, compliant: int, partial: int,
     *     non_compliant: int, compliance_pct: float}>
     */
    public function frameworkCompliance(): \Illuminate\Support\Collection
    {
        return DB::table('controls')
            ->join('frameworks', 'frameworks.id', '=', 'controls.framework_id')
            ->where('controls.is_active', true)
            ->where('frameworks.is_active', true)
            ->selectRaw("
                frameworks.id,
                frameworks.short_name                                                               AS name,
                frameworks.name                                                                     AS full_name,
                COUNT(*)                                                                            AS total_controls,
                SUM(CASE WHEN controls.current_status = 'compliant'           THEN 1 ELSE 0 END)   AS compliant,
                SUM(CASE WHEN controls.current_status = 'partially_compliant' THEN 1 ELSE 0 END)   AS partial,
                SUM(CASE WHEN controls.current_status = 'non_compliant'       THEN 1 ELSE 0 END)   AS non_compliant,
                SUM(CASE WHEN controls.current_status NOT IN ('not_applicable')
                              AND controls.current_status IS NOT NULL          THEN 1 ELSE 0 END)   AS applicable
            ")
            ->groupBy('frameworks.id', 'frameworks.short_name', 'frameworks.name')
            ->orderBy('frameworks.short_name')
            ->get()
            ->filter(fn ($row) => (int) $row->total_controls > 0)
            ->map(function ($row) {
                $applicable = (int) $row->applicable;
                $compliant  = (int) $row->compliant;
                $partial    = (int) $row->partial;
                $pct        = $applicable > 0
                    ? round((($compliant + ($partial * 0.5)) / $applicable) * 100, 1)
                    : 0.0;
                return [
                    'name'           => $row->name,
                    'full_name'      => $row->full_name,
                    'total_controls' => (int) $row->total_controls,
                    'compliant'      => $compliant,
                    'partial'        => $partial,
                    'non_compliant'  => (int) $row->non_compliant,
                    'compliance_pct' => $pct,
                ];
            })
            ->values();
    }

    /**
     * Per-framework assessment scores — latest compliance %, evidence-weighted score,
     * and a 5-point trend — from the most recent completed assessment per framework.
     * Replaces Framework::with(['assessments']) + PHP map in multiple controllers.
     *
     * @return \Illuminate\Support\Collection<int, array{id: int, name: string, full_name: string,
     *     latest_score: float|null, evidence_score: float|null,
     *     assessments_count: int, trend: \Illuminate\Support\Collection}>
     */
    public function frameworkAssessmentScores(): \Illuminate\Support\Collection
    {
        return Framework::where('is_active', true)
            ->with(['assessments' => fn ($q) =>
                $q->where('status', 'completed')->orderBy('created_at', 'desc')
            ])
            ->get()
            ->map(fn ($fw) => [
                'id'                => $fw->id,
                'name'              => $fw->short_name,
                'full_name'         => $fw->name,
                'latest_score'      => $fw->assessments->first()?->compliance_percentage,
                'evidence_score'    => $fw->assessments->first()?->evidence_weighted_score,
                'assessments_count' => $fw->assessments->count(),
                'trend'             => $fw->assessments->take(5)->pluck('compliance_percentage')->reverse()->values(),
            ]);
    }
}
