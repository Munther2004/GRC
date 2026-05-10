<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\AuditLog;
use App\Models\KriSnapshot;
use App\Models\Risk;
use App\Services\GrcMetricsService;
use App\Services\RiskMetricsService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ExecutiveDashboardController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        return Inertia::render('executive-dashboard', $this->buildData($request));
    }

    public function export(\Illuminate\Http\Request $request)
    {
        $data = $this->buildData($request);

        AuditLog::record('exported', 'Report', 0, 'Executive Dashboard PDF exported');

        $pdf = Pdf::loadView('reports.executive-dashboard', array_merge($data, [
            'generatedAt' => now()->format('Y-m-d H:i'),
        ]));

        $pdf->setPaper('A4', 'portrait');

        return $pdf->download('executive-dashboard-'.now()->format('Y-m-d').'.pdf');
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private function buildData(\Illuminate\Http\Request $request): array
    {
        $user = Auth::user();
        $corpFilter = $user->resolveCorporationFilter($request->integer('corporation_id') ?: null);
        $metrics = new RiskMetricsService($user, $corpFilter);
        $grc = new GrcMetricsService($user, $corpFilter);

        // 1. Health Score
        $healthScore = $metrics->calculateHealthScore();

        // 2. Compliance Summary (one SQL aggregate query)
        $cs = $grc->complianceSummary();
        $complianceSummary = [
            'overall_pct' => $cs['overall_pct'],
            'compliant' => $cs['compliant'],
            'partial' => $cs['partial'],
            'non_compliant' => $cs['non_compliant'],
            'not_applicable' => $cs['not_applicable'],
            'total_controls' => $cs['total_applicable'],
        ];

        // 3. Risk Summary (one SQL aggregate query + top-5 targeted query)
        $rc = $grc->riskCounts();

        $topRisks = $user->visibilityScope(Risk::query(), 'user_id', $corpFilter)
            ->with('treatmentPlans')
            ->orderByRaw('likelihood * impact DESC')
            ->limit(5)
            ->get()
            ->map(fn ($r) => [
                'title' => $r->title,
                'likelihood' => $r->likelihood,
                'impact' => $r->impact,
                'score' => $r->risk_score,
                'level' => $r->risk_level,
                'status' => $r->status,
                'has_treatment' => $r->treatmentPlans->isNotEmpty(),
            ]);

        $riskSummary = [
            'total_open' => $rc['open'],
            'critical' => $rc['critical'],
            'high' => $rc['high'],
            'medium' => $rc['medium'],
            'low' => $rc['low'],
            'avg_score' => $rc['avg_score'],
            'top_risks' => $topRisks,
        ];

        // 4. Evidence Summary (one SQL aggregate query + service for expiry counts)
        $ev = $grc->evidenceCounts();
        $expiry = $grc->evidenceExpiry();
        $evidenceSummary = [
            'total' => $ev['total'],
            'approved' => $ev['approved'],
            'pending' => $ev['pending'],
            'rejected' => $ev['rejected'],
            'expiring_soon' => $expiry['expiring_soon'],
            'expired' => $expiry['expired'],
        ];

        // 5. Assessment Summary (aggregate counts from service + latest record for display)
        $agg = $grc->assessmentSummary();
        $latestAssessment = $user->visibilityScope(Assessment::query(), 'user_id', $corpFilter)
            ->with('framework')->latest()->first();
        $assessmentSummary = [
            'total' => $agg['total'],
            'completed' => $agg['completed'],
            'in_progress' => $agg['in_progress'],
            'overdue' => $agg['overdue'],
            'latest_title' => $latestAssessment?->title,
            'latest_date' => $latestAssessment?->created_at?->format('Y-m-d'),
            'latest_score' => $latestAssessment?->compliance_percentage,
            'latest_framework' => $latestAssessment?->framework?->short_name,
        ];

        // 6. Compliance Trend (last 6 KRI snapshots) — scoped per tenant
        $trendQuery = KriSnapshot::query();
        if (! $user->isSuperAdmin()) {
            $trendQuery->where('corporation_id', $user->corporation_id);
        } elseif ($corpFilter !== null) {
            $trendQuery->where('corporation_id', $corpFilter);
        }
        $trend = $trendQuery->latest('snapshot_date')
            ->limit(6)
            ->get()
            ->sortBy('snapshot_date')
            ->values()
            ->map(fn ($s) => [
                'date' => $s->snapshot_date->format('M d'),
                'compliance_score' => round((float) $s->compliance_percentage, 1),
                'critical_risks' => $s->open_risks_critical,
            ]);

        // 7. Framework Breakdown (control-based compliance via SQL aggregate)
        $frameworkBreakdown = $grc->frameworkCompliance();

        return [
            'healthScore' => $healthScore,
            'complianceSummary' => $complianceSummary,
            'riskSummary' => $riskSummary,
            'evidenceSummary' => $evidenceSummary,
            'assessmentSummary' => $assessmentSummary,
            'trend' => $trend,
            'frameworkBreakdown' => $frameworkBreakdown,
            'generatedAt' => now()->format('Y-m-d H:i'),
        ];
    }
}
