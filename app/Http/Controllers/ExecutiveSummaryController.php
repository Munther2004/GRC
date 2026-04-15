<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Control;
use App\Services\AIService;
use App\Services\GrcMetricsService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;

class ExecutiveSummaryController extends Controller
{
    public function generate()
    {
        // ── 1. Gather data ────────────────────────────────────────────────────

        $grc = new GrcMetricsService;

        // Compliance (one SQL aggregate query)
        $cs = $grc->complianceSummary();
        $selfAssessed = $cs['overall_pct'];

        // Assessment counts + evidence-weighted compliance (service aggregate queries)
        $agg = $grc->assessmentSummary();
        $evidenceWeighted = $agg['evidence_weighted_avg'];

        // Controls breakdown (from compliance summary — no full table load)
        $controlStats = [
            'total' => $cs['total_active'],
            'compliant' => $cs['compliant'],
            'partially_compliant' => $cs['partial'],
            'non_compliant' => $cs['non_compliant'],
            'not_set' => $cs['not_set'],
            'not_applicable' => $cs['not_applicable'],
        ];

        // Risk counts (one SQL aggregate query)
        $rc = $grc->riskCounts();
        $riskStats = [
            'total' => $rc['total'],
            'critical' => $rc['critical'],
            'high' => $rc['high'],
            'medium' => $rc['medium'],
            'low' => $rc['low'],
            'open' => $rc['open'],
            'closed' => $rc['closed'],
        ];

        // Top 5 highest-scoring risks (risk_level is an accessor, not a DB column)
        $topRisks = \App\Models\Risk::orderByRaw('likelihood * impact DESC')
            ->limit(5)
            ->get(['title', 'category', 'likelihood', 'impact', 'status'])
            ->map(fn ($r) => [
                'title' => $r->title,
                'category' => $r->category,
                'score' => $r->likelihood * $r->impact,
                'risk_level' => $r->risk_level,
                'status' => $r->status,
            ])->toArray();

        // Evidence stats (one SQL aggregate query)
        $ev = $grc->evidenceCounts();
        $evidenceStats = [
            'total' => $ev['total'],
            'approved' => $ev['approved'],
            'pending' => $ev['pending'],
            'rejected' => $ev['rejected'],
        ];

        // Recent activity count (last 7 days)
        $recentActivityCount = AuditLog::where('created_at', '>=', now()->subDays(7))->count();

        // Assessments (from aggregate query computed above)
        $assessmentStats = [
            'total' => $agg['total'],
            'completed' => $agg['completed'],
            'overdue' => $agg['overdue'],
            'in_progress' => $agg['in_progress'],
        ];

        // Framework breakdown (latest completed assessment per framework)
        $frameworkBreakdown = $grc->frameworkAssessmentScores()
            ->map(fn ($fw) => [
                'name' => $fw['name'],
                'full_name' => $fw['full_name'],
                'compliance' => $fw['latest_score'],
                'evidence_score' => $fw['evidence_score'],
                'assessments_count' => $fw['assessments_count'],
            ])->toArray();

        // Most non-compliant control categories (top 5) — targeted query, no full load
        $nonCompliantCategories = Control::where('current_status', 'non_compliant')
            ->where('is_active', true)
            ->whereNotNull('category')
            ->get()
            ->groupBy('category')
            ->map(fn ($g) => $g->count())
            ->sortDesc()
            ->take(5)
            ->toArray();

        // ── 2. Build AI context ───────────────────────────────────────────────
        $aiData = [
            'report_date' => now()->format('Y-m-d'),
            'overall_compliance' => [
                'self_assessed_pct' => $selfAssessed,
                'evidence_weighted_pct' => $evidenceWeighted,
            ],
            'controls' => $controlStats,
            'risks' => $riskStats,
            'top_5_risks' => $topRisks,
            'evidence' => $evidenceStats,
            'assessments' => $assessmentStats,
            'frameworks' => $frameworkBreakdown,
            'non_compliant_categories' => $nonCompliantCategories,
            'recent_activity_7d' => $recentActivityCount,
        ];

        // ── 3. Generate AI narrative ──────────────────────────────────────────
        try {
            $ai = new AIService;
            $result = $ai->generateExecutiveSummary($aiData);
        } catch (\Throwable $e) {
            Log::error('ExecutiveSummaryController: AI call failed', ['message' => $e->getMessage()]);
            $result = [
                'narrative' => 'The AI narrative could not be generated. Please review the data tables for a manual assessment.',
                'recommendations' => [
                    'Review all critical and high-severity open risks immediately.',
                    'Resolve all pending evidence items awaiting review.',
                    'Complete any overdue compliance assessments.',
                ],
            ];
        }

        AuditLog::record('exported', 'Report', 0, 'AI Executive Summary PDF generated');

        // ── 4. Render PDF ─────────────────────────────────────────────────────
        $pdf = Pdf::loadView('reports.executive-summary', [
            'narrative' => $result['narrative'],
            'recommendations' => $result['recommendations'],
            'selfAssessed' => $selfAssessed,
            'evidenceWeighted' => $evidenceWeighted,
            'controlStats' => $controlStats,
            'riskStats' => $riskStats,
            'topRisks' => $topRisks,
            'evidenceStats' => $evidenceStats,
            'assessmentStats' => $assessmentStats,
            'frameworkBreakdown' => $frameworkBreakdown,
            'nonCompliantCategories' => $nonCompliantCategories,
            'generatedAt' => now()->format('Y-m-d H:i'),
        ]);

        $pdf->setPaper('A4', 'portrait');

        return $pdf->download('executive-summary-'.now()->format('Y-m-d').'.pdf');
    }
}
