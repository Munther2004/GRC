<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\AuditLog;
use App\Models\Framework;
use App\Models\KriSnapshot;
use App\Models\Risk;
use App\Models\RiskAppetite;
use App\Models\User;
use App\Services\GrcMetricsService;
use App\Services\RiskMetricsService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $user = Auth::user();
        $corpFilter = $user->resolveCorporationFilter($request->integer('corporation_id') ?: null);
        $frameworkFilter = $request->integer('framework_id') ?: null;
        if ($frameworkFilter !== null && ! Framework::where('id', $frameworkFilter)->exists()) {
            $frameworkFilter = null;
        }

        $applyRiskFw = function ($q) use ($frameworkFilter) {
            if ($frameworkFilter !== null) {
                $q->whereExists(function ($sub) use ($frameworkFilter) {
                    $sub->select(DB::raw(1))
                        ->from('controls')
                        ->whereColumn('controls.id', 'risks.source_control_id')
                        ->where('controls.framework_id', $frameworkFilter);
                });
            }

            return $q;
        };

        $scopedRisks = fn () => $applyRiskFw(
            $user->visibilityScope(Risk::query(), 'user_id', $corpFilter)
        );
        $scopedAssessments = function () use ($user, $corpFilter, $frameworkFilter) {
            $q = $user->visibilityScope(Assessment::query(), 'user_id', $corpFilter);
            if ($frameworkFilter !== null) {
                $q->where('assessments.framework_id', $frameworkFilter);
            }

            return $q;
        };

        $grc = new GrcMetricsService($user, $corpFilter, $frameworkFilter);
        $riskStats = $grc->riskCounts();
        $complianceData = $grc->complianceSummary();
        $evidenceStats = $grc->evidenceCounts();
        $assessmentSummary = $grc->assessmentSummary();

        $stats = [
            'total_risks' => $riskStats['total'],
            'critical_risks' => $riskStats['critical'],
            'high_risks' => $riskStats['high'],
            'medium_risks' => $riskStats['medium'],
            'low_risks' => $riskStats['low'],
            'open_risks' => $riskStats['open'],
            'compliance_score' => (int) $complianceData['overall_pct'],
            'total_assessments' => $assessmentSummary['total'],
            'evidence_files' => $evidenceStats['total'],
            'pending_evidence' => $evidenceStats['pending'],
        ];

        $recentRisks = $scopedRisks()->latest()->limit(10)->get()->map(fn ($r) => [
            'id' => $r->id,
            'title' => $r->title,
            'category' => $r->category,
            'owner' => $r->owner,
            'impact' => $r->impact,
            'likelihood' => $r->likelihood,
            'risk_level' => $r->risk_level,
            'risk_score' => $r->risk_score,
            'status' => $r->status,
        ]);

        // Audit log has no corporation_id of its own — scope through the
        // actor's tenant by joining on user_id. super_admin sees the full feed.
        $effectiveCorpId = $user->isSuperAdmin() ? $corpFilter : $user->corporation_id;
        $tenantUserIds = $effectiveCorpId === null
            ? null
            : User::where('corporation_id', $effectiveCorpId)->pluck('id');
        // For the operational `user` role, narrow further to the caller's own
        // user_id so they see only their own audit-log entries.
        if ($user->isUser()) {
            $tenantUserIds = collect([$user->id]);
        }

        $recentActivityQuery = AuditLog::query();
        if ($tenantUserIds !== null) {
            $recentActivityQuery->whereIn('user_id', $tenantUserIds);
        }
        $recentActivity = $recentActivityQuery->latest()->limit(5)->get()->map(fn ($l) => [
            'id' => $l->id,
            'description' => $l->description,
            'user_name' => $l->user_name,
            'action' => $l->action,
            'created_at' => $l->created_at->diffForHumans(),
        ]);

        // Risk trend — group by month. SQL functions for month extraction
        // differ across drivers (MySQL: MONTH(); SQLite: strftime). Compute a
        // numeric month in SQL, then build the human-readable "Jan/Feb/…"
        // label in PHP so the query stays portable between MySQL (prod) and
        // SQLite (tests).
        $monthExpr = DB::connection()->getDriverName() === 'sqlite'
            ? "CAST(strftime('%m', created_at) AS INTEGER)"
            : 'MONTH(created_at)';

        $t = Risk::levelThresholds();
        $trendData = $scopedRisks()->selectRaw("{$monthExpr} as month_num,
        SUM(CASE WHEN likelihood * impact >= {$t['critical']} THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN likelihood * impact >= {$t['high']}     AND likelihood * impact < {$t['critical']} THEN 1 ELSE 0 END) as high,
        SUM(CASE WHEN likelihood * impact >= {$t['medium']}   AND likelihood * impact < {$t['high']}     THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN likelihood * impact <  {$t['medium']} THEN 1 ELSE 0 END) as low")
            ->groupByRaw($monthExpr)
            ->orderByRaw($monthExpr)
            ->get()
            ->map(function ($row) {
                $row->month = CarbonImmutable::create(null, (int) $row->month_num, 1)->format('M');
                unset($row->month_num);

                return $row;
            });

        // Slim risk load — only columns needed for heatmap and appetite classification
        $risks = $scopedRisks()->select(['id', 'title', 'likelihood', 'impact', 'status'])->get();

        $heatmap = $risks->map(fn ($r) => [
            'id' => $r->id,
            'title' => $r->title,
            'likelihood' => $r->likelihood,
            'impact' => $r->impact,
            'score' => $r->likelihood * $r->impact,
            'status' => $r->status,
        ])->toArray();

        // Appetite band counts — scoped per corporation. super_admin (no
        // single corp) sees no appetite-band breakdown.
        $appetite = RiskAppetite::getActiveForUser($user);
        $appetiteCounts = null;
        if ($appetite) {
            $escalated = 0;
            $review = 0;
            $acceptable = 0;
            foreach ($risks as $r) {
                $band = $appetite->classifyRisk($r)['band'];
                if ($band === 'escalated') {
                    $escalated++;
                } elseif ($band === 'review') {
                    $review++;
                } else {
                    $acceptable++;
                }
            }
            $appetiteCounts = [
                'name' => $appetite->name,
                'escalated' => $escalated,
                'review' => $review,
                'acceptable' => $acceptable,
                'labels' => [
                    'escalated' => $appetite->escalated_label,
                    'review' => $appetite->review_label,
                    'acceptable' => $appetite->acceptable_label,
                ],
            ];
        }

        $metricsService = new RiskMetricsService($user, $corpFilter, $frameworkFilter);
        $riskMetrics = $metricsService->calculateRiskExposure();
        $healthScore = $metricsService->calculateHealthScore();

        $kpis = [
            'risk_exposure' => $riskMetrics['risk_exposure'],
            'avg_risk_score' => $riskMetrics['avg_risk_score'],
            'evidence_approval_rate' => $evidenceStats['approval_rate'],
            'open_risks_by_level' => $grc->openRisksByLevel(),
            'assessments_due_soon' => $scopedAssessments()->where('status', '!=', 'completed')
                ->whereNotNull('due_date')
                ->where('due_date', '<=', now()->addDays(7))
                ->where('due_date', '>=', now())
                ->count(),
            'pending_evidence' => $evidenceStats['pending'],
            'compliance_this_week' => round(
                $scopedAssessments()->where('status', 'completed')
                    ->where('updated_at', '>=', now()->subWeek())
                    ->avg('compliance_percentage') ?? 0, 1
            ),
            'compliance_last_week' => round(
                $scopedAssessments()->where('status', 'completed')
                    ->whereBetween('updated_at', [now()->subWeeks(2), now()->subWeek()])
                    ->avg('compliance_percentage') ?? 0, 1
            ),
            // Average evidence-weighted score across completed assessments (null when none reviewed yet)
            'evidence_weighted_compliance' => $assessmentSummary['evidence_weighted_avg'],
        ];

        $ruleAdjustmentsQuery = AuditLog::where(function ($q) {
            $q->where('description', 'like', 'Rule 1:%')
                ->orWhere('description', 'like', 'Rule 2:%');
        })->where('created_at', '>=', now()->subDays(30));
        if ($tenantUserIds !== null) {
            $ruleAdjustmentsQuery->whereIn('user_id', $tenantUserIds);
        }
        $ruleAdjustments = $ruleAdjustmentsQuery->count();

        // KRI snapshots are stored per-tenant (`corporation_id` column).
        // super_admin sees the platform-wide latest snapshots without scoping;
        // tenant users get only their corporation's series.
        $kriSnapshotQuery = KriSnapshot::query();
        if (! $user->isSuperAdmin()) {
            $kriSnapshotQuery->where('corporation_id', $user->corporation_id);
        } elseif ($corpFilter !== null) {
            $kriSnapshotQuery->where('corporation_id', $corpFilter);
        }
        $kriSnapshots = $kriSnapshotQuery->latest('snapshot_date')
            ->limit(12)
            ->get()
            ->sortBy('snapshot_date')
            ->values()
            ->map(fn ($s) => [
                'snapshot_date' => $s->snapshot_date->toDateString(),
                'compliance_percentage' => $s->compliance_percentage,
                'open_risks_critical' => $s->open_risks_critical,
                'open_risks_high' => $s->open_risks_high,
                'open_risks_medium' => $s->open_risks_medium,
                'open_risks_low' => $s->open_risks_low,
                'overdue_risks' => $s->overdue_risks,
                'overdue_assessments' => $s->overdue_assessments,
                'evidence_approval_rate' => $s->evidence_approval_rate,
                'ai_generated_risks' => $s->ai_generated_risks,
                'total_risks' => $s->total_risks,
                'total_controls' => $s->total_controls,
                'compliant_controls' => $s->compliant_controls,
            ]);

        $frameworks = Framework::where('is_active', true)
            ->orderBy('short_name')
            ->get(['id', 'short_name', 'name'])
            ->map(fn ($fw) => [
                'id' => $fw->id,
                'short_name' => $fw->short_name,
                'name' => $fw->name,
            ])
            ->values();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentRisks' => $recentRisks,
            'recentActivity' => $recentActivity,
            'trendData' => $trendData,
            'heatmap' => $heatmap,
            'kpis' => $kpis,
            'ruleAdjustments' => $ruleAdjustments,
            'lastSchedulerRun' => Cache::get('scheduler_last_run'),
            'kriSnapshots' => $kriSnapshots,
            'healthScore' => $healthScore,
            'appetiteCounts' => $appetiteCounts,
            'frameworkFilter' => [
                'selected' => $frameworkFilter,
                'options' => $frameworks,
            ],
        ]);
    }
}
