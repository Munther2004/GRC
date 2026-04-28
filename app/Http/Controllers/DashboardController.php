<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\AuditLog;
use App\Models\KriSnapshot;
use App\Models\Risk;
use App\Models\RiskAppetite;
use App\Services\GrcMetricsService;
use App\Services\RiskMetricsService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $scopedRisks = fn () => $user->organisationScope(Risk::query());
        $scopedAssessments = fn () => $user->organisationScope(Assessment::query());

        $grc = new GrcMetricsService($user);
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

        $recentRisks = $scopedRisks()->latest()->limit(5)->get()->map(fn ($r) => [
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

        $recentActivity = AuditLog::latest()->limit(8)->get()->map(fn ($l) => [
            'id' => $l->id,
            'description' => $l->description,
            'user_name' => $l->user_name,
            'action' => $l->action,
            'created_at' => $l->created_at->diffForHumans(),
        ]);

        // Risk trend - group by month, using canonical thresholds
        $t = Risk::levelThresholds();
        $trendData = Risk::selectRaw("DATE_FORMAT(created_at, '%b') as month,
        SUM(CASE WHEN likelihood * impact >= {$t['critical']} THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN likelihood * impact >= {$t['high']}     AND likelihood * impact < {$t['critical']} THEN 1 ELSE 0 END) as high,
        SUM(CASE WHEN likelihood * impact >= {$t['medium']}   AND likelihood * impact < {$t['high']}     THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN likelihood * impact <  {$t['medium']} THEN 1 ELSE 0 END) as low")
            ->groupByRaw('DATE_FORMAT(created_at, "%b"), MONTH(created_at)')
            ->orderByRaw('MONTH(created_at)')
            ->get();

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

        $metricsService = new RiskMetricsService;
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

        $ruleAdjustments = AuditLog::where(function ($q) {
            $q->where('description', 'like', 'Rule 1:%')
                ->orWhere('description', 'like', 'Rule 2:%');
        })->where('created_at', '>=', now()->subDays(30))->count();

        $kriSnapshots = KriSnapshot::latest('snapshot_date')
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
        ]);
    }
}
