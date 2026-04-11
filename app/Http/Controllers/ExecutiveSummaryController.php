<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\AuditLog;
use App\Models\Control;
use App\Models\Evidence;
use App\Models\Framework;
use App\Models\Risk;
use App\Services\AIService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;

class ExecutiveSummaryController extends Controller
{
    public function generate()
    {
        // ── 1. Gather data ────────────────────────────────────────────────────

        // Overall self-assessed compliance (excludes not_applicable)
        $applicable    = Control::where('is_active', true)->where('current_status', '!=', 'not_applicable');
        $totalAppl     = (clone $applicable)->count();
        $compliantCnt  = (clone $applicable)->where('current_status', 'compliant')->count();
        $partialCnt    = (clone $applicable)->where('current_status', 'partially_compliant')->count();
        $selfAssessed  = $totalAppl > 0
            ? round((($compliantCnt + ($partialCnt * 0.5)) / $totalAppl) * 100, 1)
            : 0;

        // Evidence-weighted compliance (average across completed assessments)
        $evidenceWeighted = Assessment::where('status', 'completed')
            ->whereNotNull('evidence_weighted_score')
            ->avg('evidence_weighted_score');
        $evidenceWeighted = $evidenceWeighted !== null ? round($evidenceWeighted, 1) : null;

        // Controls breakdown (all active controls)
        $allControls   = Control::where('is_active', true)->get();
        $controlStats  = [
            'total'               => $allControls->count(),
            'compliant'           => $allControls->where('current_status', 'compliant')->count(),
            'partially_compliant' => $allControls->where('current_status', 'partially_compliant')->count(),
            'non_compliant'       => $allControls->where('current_status', 'non_compliant')->count(),
            'not_set'             => $allControls->filter(fn ($c) => is_null($c->current_status))->count(),
            'not_applicable'      => $allControls->where('current_status', 'not_applicable')->count(),
        ];

        // Risks
        $risks    = Risk::all();
        $riskStats = [
            'total'    => $risks->count(),
            'critical' => $risks->filter(fn ($r) => $r->risk_level === 'critical')->count(),
            'high'     => $risks->filter(fn ($r) => $r->risk_level === 'high')->count(),
            'medium'   => $risks->filter(fn ($r) => $r->risk_level === 'medium')->count(),
            'low'      => $risks->filter(fn ($r) => $r->risk_level === 'low')->count(),
            'open'     => $risks->whereIn('status', ['open', 'in_progress'])->count(),
            'closed'   => $risks->where('status', 'closed')->count(),
        ];

        // Top 5 highest-scoring risks (risk_level is an accessor, not a DB column)
        $topRisks = Risk::orderByRaw('likelihood * impact DESC')
            ->limit(5)
            ->get(['title', 'category', 'likelihood', 'impact', 'status'])
            ->map(fn ($r) => [
                'title'      => $r->title,
                'category'   => $r->category,
                'score'      => $r->likelihood * $r->impact,
                'risk_level' => $r->risk_level,  // computed via getRiskLevelAttribute()
                'status'     => $r->status,
            ])->toArray();

        // Evidence stats
        $evidenceStats = [
            'total'    => Evidence::count(),
            'approved' => Evidence::where('status', 'approved')->count(),
            'pending'  => Evidence::where('status', 'pending')->count(),
            'rejected' => Evidence::where('status', 'rejected')->count(),
        ];

        // Recent activity count (last 7 days)
        $recentActivityCount = AuditLog::where('created_at', '>=', now()->subDays(7))->count();

        // Assessments
        $assessmentStats = [
            'total'     => Assessment::count(),
            'completed' => Assessment::where('status', 'completed')->count(),
            'overdue'   => Assessment::where('status', '!=', 'completed')
                ->whereNotNull('due_date')
                ->where('due_date', '<', now())
                ->count(),
            'in_progress' => Assessment::where('status', 'in_progress')->count(),
        ];

        // Framework breakdown (latest completed assessment per framework)
        $frameworks        = Framework::with(['assessments' => fn ($q) =>
            $q->where('status', 'completed')->orderBy('created_at', 'desc')
        ])->where('is_active', true)->get();

        $frameworkBreakdown = $frameworks->map(fn ($fw) => [
            'name'              => $fw->short_name,
            'full_name'         => $fw->name,
            'compliance'        => $fw->assessments->first()?->compliance_percentage,
            'evidence_score'    => $fw->assessments->first()?->evidence_weighted_score,
            'assessments_count' => $fw->assessments->count(),
        ])->toArray();

        // Most non-compliant control categories (top 5)
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
            'report_date'             => now()->format('Y-m-d'),
            'overall_compliance'      => [
                'self_assessed_pct'     => $selfAssessed,
                'evidence_weighted_pct' => $evidenceWeighted,
            ],
            'controls'                => $controlStats,
            'risks'                   => $riskStats,
            'top_5_risks'             => $topRisks,
            'evidence'                => $evidenceStats,
            'assessments'             => $assessmentStats,
            'frameworks'              => $frameworkBreakdown,
            'non_compliant_categories'=> $nonCompliantCategories,
            'recent_activity_7d'      => $recentActivityCount,
        ];

        // ── 3. Generate AI narrative ──────────────────────────────────────────
        try {
            $ai     = new AIService();
            $result = $ai->generateExecutiveSummary($aiData);
        } catch (\Throwable $e) {
            Log::error('ExecutiveSummaryController: AI call failed', ['message' => $e->getMessage()]);
            $result = [
                'narrative'       => 'The AI narrative could not be generated. Please review the data tables for a manual assessment.',
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
            'narrative'              => $result['narrative'],
            'recommendations'        => $result['recommendations'],
            'selfAssessed'           => $selfAssessed,
            'evidenceWeighted'       => $evidenceWeighted,
            'controlStats'           => $controlStats,
            'riskStats'              => $riskStats,
            'topRisks'               => $topRisks,
            'evidenceStats'          => $evidenceStats,
            'assessmentStats'        => $assessmentStats,
            'frameworkBreakdown'     => $frameworkBreakdown,
            'nonCompliantCategories' => $nonCompliantCategories,
            'generatedAt'            => now()->format('Y-m-d H:i'),
        ]);

        $pdf->setPaper('A4', 'portrait');
        return $pdf->download('executive-summary-' . now()->format('Y-m-d') . '.pdf');
    }
}
