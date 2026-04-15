<?php

namespace App\Http\Controllers;

use App\Models\AssessmentItem;
use App\Models\AuditLog;
use App\Models\Control;
use App\Models\Framework;
use App\Services\AIService;
use App\Services\GrcMetricsService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class GapAnalysisController extends Controller
{
    public function index(Request $request)
    {
        $frameworks = Framework::where('is_active', true)->get(['id', 'name', 'short_name']);

        $query = AssessmentItem::with(['control', 'assessment.framework', 'assessment.user'])
            ->whereIn('compliance_status', ['non_compliant', 'partially_compliant'])
            ->whereHas('assessment', fn ($q) => $q->where('status', 'completed'))
            ->when($request->framework_id, fn ($q) => $q->whereHas('assessment', fn ($q2) => $q2->where('framework_id', $request->framework_id)
            )
            )
            ->when($request->status, fn ($q) => $q->where('compliance_status', $request->status)
            )
            ->when($request->category, fn ($q) => $q->whereHas('control', fn ($q2) => $q2->where('category', $request->category)
            )
            )
            ->when($request->search, fn ($q) => $q->whereHas('control', fn ($q2) => $q2->where('title', 'like', "%{$request->search}%")
                ->orWhere('control_id', 'like', "%{$request->search}%")
            )
            )
            ->orderBy('compliance_status')
            ->paginate(25)
            ->withQueryString();

        $categories = AssessmentItem::whereIn('compliance_status', ['non_compliant', 'partially_compliant'])
            ->whereHas('assessment', fn ($q) => $q->where('status', 'completed'))
            ->join('controls', 'assessment_items.control_id', '=', 'controls.id')
            ->distinct()
            ->pluck('controls.category')
            ->sort()
            ->values();

        // Single grouped query replaces N×2 per-framework AssessmentItem::count() calls
        $byFrameworkRaw = DB::table('assessment_items')
            ->join('assessments', 'assessment_items.assessment_id', '=', 'assessments.id')
            ->where('assessments.status', 'completed')
            ->whereIn('assessment_items.compliance_status', ['non_compliant', 'partially_compliant'])
            ->selectRaw("
                assessments.framework_id,
                SUM(CASE WHEN assessment_items.compliance_status = 'non_compliant'       THEN 1 ELSE 0 END) AS non_compliant,
                SUM(CASE WHEN assessment_items.compliance_status = 'partially_compliant' THEN 1 ELSE 0 END) AS partially_compliant
            ")
            ->groupBy('assessments.framework_id')
            ->get()
            ->keyBy('framework_id');

        $stats = [
            'non_compliant' => AssessmentItem::where('compliance_status', 'non_compliant')
                ->whereHas('assessment', fn ($q) => $q->where('status', 'completed'))->count(),
            'partially_compliant' => AssessmentItem::where('compliance_status', 'partially_compliant')
                ->whereHas('assessment', fn ($q) => $q->where('status', 'completed'))->count(),
            'by_framework' => $frameworks->map(fn ($f) => [
                'name' => $f->short_name,
                'non_compliant' => (int) ($byFrameworkRaw[$f->id]->non_compliant ?? 0),
                'partially_compliant' => (int) ($byFrameworkRaw[$f->id]->partially_compliant ?? 0),
            ]),
        ];

        return Inertia::render('gap-analysis/index', [
            'items' => $query,
            'frameworks' => $frameworks,
            'categories' => $categories,
            'stats' => $stats,
            'filters' => $request->only(['search', 'framework_id', 'status', 'category']),
        ]);
    }

    public function generateReport(Request $request)
    {
        // ── Gather gap data ──────────────────────────────────────────────────
        // withCount('evidence') avoids N+1 evidence()->count() inside the map
        $gapItems = AssessmentItem::with(['control.framework', 'assessment.framework'])
            ->withCount('evidence')
            ->whereIn('compliance_status', ['non_compliant', 'partially_compliant'])
            ->whereHas('assessment', fn ($q) => $q->where('status', 'completed'))
            ->when($request->framework_id, fn ($q) => $q->whereHas('assessment', fn ($q2) => $q2->where('framework_id', $request->framework_id)
            )
            )
            ->get();

        $gapData = $gapItems->map(fn ($item) => [
            'control_id' => $item->control->control_id,
            'title' => $item->control->title,
            'category' => $item->control->category,
            'framework' => $item->assessment->framework->short_name,
            'compliance_status' => $item->compliance_status,
            'notes' => $item->notes,
            'evidence_count' => $item->evidence_count,
        ])->toArray();

        // Summary stats — one aggregate query replaces Control::get() + Risk::all()
        $grc = new GrcMetricsService;
        $cs = $grc->complianceSummary();
        $compliancePct = $cs['overall_pct'];

        $rc = $grc->riskCounts();

        $aiData = [
            'report_date' => now()->format('Y-m-d'),
            'overall_compliance' => $compliancePct,
            'gap_items' => $gapData,
            'gap_summary' => [
                'non_compliant' => $gapItems->where('compliance_status', 'non_compliant')->count(),
                'partially_compliant' => $gapItems->where('compliance_status', 'partially_compliant')->count(),
                'total_gaps' => $gapItems->count(),
            ],
            'risk_summary' => [
                'total' => $rc['total'],
                'critical' => $rc['critical'],
                'high' => $rc['high'],
                'open' => $rc['open'],
            ],
            'categories' => $gapItems->groupBy(fn ($i) => $i->control->category ?? 'Uncategorised')
                ->map(fn ($g) => [
                    'non_compliant' => $g->where('compliance_status', 'non_compliant')->count(),
                    'partially_compliant' => $g->where('compliance_status', 'partially_compliant')->count(),
                ])->toArray(),
        ];

        // ── Call Claude ──────────────────────────────────────────────────────
        try {
            $ai = new AIService;
            $result = $ai->generateGapAnalysis($aiData);
        } catch (\Throwable $e) {
            Log::error('GapAnalysisController: AI call failed', ['message' => $e->getMessage()]);
            $result = [
                'executive_summary' => 'The AI narrative could not be generated. The gap data below reflects the current compliance posture.',
                'critical_gaps' => [],
                'category_analysis' => [],
                'action_list' => [],
                'positive_highlights' => [],
                'overall_risk_rating' => 'Unknown',
            ];
        }

        AuditLog::record('exported', 'Report', 0, 'AI Gap Analysis PDF generated');

        // ── Render PDF ───────────────────────────────────────────────────────
        $pdf = Pdf::loadView('reports.gap-analysis', [
            'result' => $result,
            'gapData' => $gapData,
            'gapSummary' => $aiData['gap_summary'],
            'compliancePct' => $compliancePct,
            'generatedAt' => now()->format('Y-m-d H:i'),
        ]);

        $pdf->setPaper('A4', 'portrait');

        return $pdf->download('gap-analysis-'.now()->format('Y-m-d').'.pdf');
    }
}
