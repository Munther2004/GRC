<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\AssessmentItem;
use App\Models\Framework;
use App\Models\Risk;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;

class ReportController extends Controller
{
    private function gatherReportData(): array
    {
        // Compliance per framework
        $frameworks = Framework::with(['assessments' => function ($q) {
            $q->where('status', 'completed')->orderBy('created_at', 'desc');
        }])->where('is_active', true)->get();

        $complianceByFramework = $frameworks->map(function ($framework) {
            $latest = $framework->assessments->first();
            $all    = $framework->assessments;
            return [
                'id'                => $framework->id,
                'name'              => $framework->name,
                'short_name'        => $framework->short_name,
                'latest_score'      => $latest?->compliance_percentage ?? null,
                'assessments_count' => $all->count(),
                'trend'             => $all->take(5)->pluck('compliance_percentage')->reverse()->values(),
            ];
        });

        $overallCompliance = round(
            $complianceByFramework->whereNotNull('latest_score')->avg('latest_score') ?? 0, 1
        );

        // Risk summary
        $risks = Risk::all();
        $riskByLevel = [
            'critical' => $risks->filter(fn($r) => $r->likelihood * $r->impact >= 20)->count(),
            'high'     => $risks->filter(fn($r) => ($s = $r->likelihood * $r->impact) >= 13 && $s <= 19)->count(),
            'medium'   => $risks->filter(fn($r) => ($s = $r->likelihood * $r->impact) >= 7  && $s <= 12)->count(),
            'low'      => $risks->filter(fn($r) => $r->likelihood * $r->impact <= 6)->count(),
        ];

        $riskByCategory = $risks->groupBy('category')->map(fn($g) => $g->count())->sortDesc();

        $riskByStatus = [
            'open'         => $risks->where('status', 'open')->count(),
            'in_progress'  => $risks->where('status', 'in_progress')->count(),
            'under_review' => $risks->where('status', 'under_review')->count(),
            'closed'       => $risks->where('status', 'closed')->count(),
        ];

        // Assessment history
        $assessmentHistory = Assessment::with(['framework', 'user'])
            ->where('status', 'completed')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($a) => [
                'id'                    => $a->id,
                'title'                 => $a->title,
                'framework'             => $a->framework->short_name,
                'compliance_percentage' => $a->compliance_percentage,
                'period'                => $a->period,
                'completed_at'          => $a->updated_at->format('Y-m-d'),
                'user'                  => $a->user->name,
            ]);

        // Monthly trend (last 6 months)
        $monthlyTrend = Assessment::where('status', 'completed')
            ->where('created_at', '>=', now()->subMonths(6))
            ->get()
            ->groupBy(fn($a) => $a->created_at->format('M Y'))
            ->map(fn($g) => round($g->avg('compliance_percentage'), 1))
            ->map(fn($score, $month) => ['month' => $month, 'score' => $score])
            ->values();

        return compact(
            'frameworks', 'complianceByFramework', 'overallCompliance',
            'risks', 'riskByLevel', 'riskByCategory', 'riskByStatus',
            'assessmentHistory', 'monthlyTrend'
        );
    }

    public function index()
    {
        $data = $this->gatherReportData();

        return Inertia::render('reports/index', [
            'overallCompliance'     => $data['overallCompliance'],
            'complianceByFramework' => $data['complianceByFramework'],
            'riskByLevel'           => $data['riskByLevel'],
            'riskByCategory'        => $data['riskByCategory'],
            'riskByStatus'          => $data['riskByStatus'],
            'assessmentHistory'     => $data['assessmentHistory'],
            'monthlyTrend'          => $data['monthlyTrend'],
            'stats' => [
                'total_risks'       => $data['risks']->count(),
                'open_risks'        => $data['risks']->where('status', 'open')->count(),
                'total_assessments' => Assessment::where('status', 'completed')->count(),
                'total_frameworks'  => $data['frameworks']->count(),
            ],
        ]);
    }

    public function exportPdf()
    {
        $data = $this->gatherReportData();

        $pdf = Pdf::loadView('reports.pdf', [
            'overallCompliance'     => $data['overallCompliance'],
            'complianceByFramework' => $data['complianceByFramework'],
            'riskByLevel'           => $data['riskByLevel'],
            'assessmentHistory'     => $data['assessmentHistory'],
            'generatedAt'           => now()->format('Y-m-d H:i'),
        ]);

        $pdf->setPaper('A4', 'portrait');
        return $pdf->download('grc-report-' . now()->format('Y-m-d') . '.pdf');
    }
}
