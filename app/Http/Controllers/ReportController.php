<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\Risk;
use App\Services\GrcMetricsService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReportController extends Controller
{
    private function gatherReportData(?int $corpFilter = null): array
    {
        $user = Auth::user();
        $grc = new GrcMetricsService($user, $corpFilter);

        // Compliance per framework (assessment-based scores)
        $fwScores = $grc->frameworkAssessmentScores();

        $complianceByFramework = $fwScores->map(fn ($fw) => [
            'id' => $fw['id'],
            'name' => $fw['full_name'],
            'short_name' => $fw['name'],
            'latest_score' => $fw['latest_score'],
            'assessments_count' => $fw['assessments_count'],
            'trend' => $fw['trend'],
        ]);

        $overallCompliance = round(
            $complianceByFramework->whereNotNull('latest_score')->avg('latest_score') ?? 0, 1
        );

        // Risk summary — one aggregate query using canonical level thresholds
        $t = Risk::levelThresholds();
        $riskBase = $user->visibilityScope(Risk::query(), 'user_id', $corpFilter);
        $riskRow = $riskBase->selectRaw("
            COUNT(*)                                                                                      AS total,
            SUM(CASE WHEN likelihood * impact >= {$t['critical']}                             THEN 1 ELSE 0 END) AS critical,
            SUM(CASE WHEN likelihood * impact >= {$t['high']}   AND likelihood * impact < {$t['critical']} THEN 1 ELSE 0 END) AS high,
            SUM(CASE WHEN likelihood * impact >= {$t['medium']} AND likelihood * impact < {$t['high']}     THEN 1 ELSE 0 END) AS medium,
            SUM(CASE WHEN likelihood * impact <  {$t['medium']}                               THEN 1 ELSE 0 END) AS low,
            SUM(CASE WHEN status = 'open'                                                     THEN 1 ELSE 0 END) AS open,
            SUM(CASE WHEN status = 'in_progress'                                              THEN 1 ELSE 0 END) AS in_progress,
            SUM(CASE WHEN status = 'under_review'                                             THEN 1 ELSE 0 END) AS under_review,
            SUM(CASE WHEN status = 'closed'                                                   THEN 1 ELSE 0 END) AS closed
        ")->first();

        $riskByLevel = [
            'critical' => (int) ($riskRow->critical ?? 0),
            'high' => (int) ($riskRow->high ?? 0),
            'medium' => (int) ($riskRow->medium ?? 0),
            'low' => (int) ($riskRow->low ?? 0),
        ];

        $riskByStatus = [
            'open' => (int) ($riskRow->open ?? 0),
            'in_progress' => (int) ($riskRow->in_progress ?? 0),
            'under_review' => (int) ($riskRow->under_review ?? 0),
            'closed' => (int) ($riskRow->closed ?? 0),
        ];

        $riskTotals = [
            'total_risks' => (int) ($riskRow->total ?? 0),
            'open_risks' => (int) ($riskRow->open ?? 0),
        ];

        // Risk by category — single grouped query
        $riskByCategory = $user->visibilityScope(Risk::query(), 'user_id', $corpFilter)
            ->selectRaw('category, COUNT(*) as count')
            ->whereNotNull('category')
            ->groupBy('category')
            ->orderByDesc('count')
            ->pluck('count', 'category');

        // Assessment history
        $assessmentHistory = $user->visibilityScope(Assessment::query(), 'user_id', $corpFilter)
            ->with(['framework', 'user'])
            ->where('status', 'completed')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'title' => $a->title,
                'framework' => $a->framework->short_name,
                'compliance_percentage' => $a->compliance_percentage,
                'period' => $a->period,
                'completed_at' => $a->updated_at->format('Y-m-d'),
                'user' => $a->user->name,
            ]);

        // Monthly trend (last 6 months)
        $monthlyTrend = $user->visibilityScope(Assessment::query(), 'user_id', $corpFilter)
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subMonths(6))
            ->get()
            ->groupBy(fn ($a) => $a->created_at->format('M Y'))
            ->map(fn ($g) => round($g->avg('compliance_percentage'), 1))
            ->map(fn ($score, $month) => ['month' => $month, 'score' => $score])
            ->values();

        $totalFrameworks = $complianceByFramework->count();

        return compact(
            'complianceByFramework', 'overallCompliance', 'totalFrameworks',
            'riskByLevel', 'riskByCategory', 'riskByStatus', 'riskTotals',
            'assessmentHistory', 'monthlyTrend'
        );
    }

    public function index(\Illuminate\Http\Request $request)
    {
        $user = Auth::user();
        $corpFilter = $user->resolveCorporationFilter($request->integer('corporation_id') ?: null);
        $data = $this->gatherReportData($corpFilter);

        return Inertia::render('reports/index', [
            'overallCompliance' => $data['overallCompliance'],
            'complianceByFramework' => $data['complianceByFramework'],
            'riskByLevel' => $data['riskByLevel'],
            'riskByCategory' => $data['riskByCategory'],
            'riskByStatus' => $data['riskByStatus'],
            'assessmentHistory' => $data['assessmentHistory'],
            'monthlyTrend' => $data['monthlyTrend'],
            'stats' => [
                'total_risks' => $data['riskTotals']['total_risks'],
                'open_risks' => $data['riskTotals']['open_risks'],
                'total_assessments' => $user->visibilityScope(Assessment::query(), 'user_id', $corpFilter)
                    ->where('status', 'completed')->count(),
                'total_frameworks' => $data['totalFrameworks'],
            ],
        ]);
    }

    public function exportPdf(\Illuminate\Http\Request $request)
    {
        $user = Auth::user();
        $corpFilter = $user->resolveCorporationFilter($request->integer('corporation_id') ?: null);
        $data = $this->gatherReportData($corpFilter);

        $pdf = Pdf::loadView('reports.pdf', [
            'overallCompliance' => $data['overallCompliance'],
            'complianceByFramework' => $data['complianceByFramework'],
            'riskByLevel' => $data['riskByLevel'],
            'assessmentHistory' => $data['assessmentHistory'],
            'generatedAt' => now()->format('Y-m-d H:i'),
        ]);

        $pdf->setPaper('A4', 'portrait');

        return $pdf->download('grc-report-'.now()->format('Y-m-d').'.pdf');
    }
}
