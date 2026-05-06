<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\AssessmentItem;
use App\Models\AuditLog;
use App\Models\Control;
use App\Models\Evidence;
use App\Services\AIService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AssessmentComparisonController extends Controller
{
    public function index()
    {
        $assessments = Auth::user()->organisationScope(Assessment::query())
            ->with('framework')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'title' => $a->title,
                'framework_id' => $a->framework_id,
                'framework' => $a->framework->short_name ?? '',
                'framework_name' => $a->framework->name ?? '',
                'status' => $a->status,
                'compliance_percentage' => $a->compliance_percentage,
                'created_at' => $a->created_at->format('Y-m-d'),
            ]);

        return Inertia::render('assessments/compare', [
            'assessments' => $assessments,
        ]);
    }

    public function compare(Request $request)
    {
        $request->validate([
            'assessment_a_id' => 'required|exists:assessments,id',
            'assessment_b_id' => 'required|exists:assessments,id',
        ]);

        abort_if(
            (int) $request->assessment_a_id === (int) $request->assessment_b_id,
            422,
            'Please select two different assessments.'
        );

        [$aData, $bData, $rows, $summary] = $this->buildComparison(
            (int) $request->assessment_a_id,
            (int) $request->assessment_b_id
        );

        return Inertia::render('assessments/compare-result', [
            'assessmentA' => $aData,
            'assessmentB' => $bData,
            'rows' => $rows,
            'summary' => $summary,
        ]);
    }

    public function exportPdf(Request $request)
    {
        $request->validate([
            'assessment_a_id' => 'required|exists:assessments,id',
            'assessment_b_id' => 'required|exists:assessments,id',
        ]);

        [$aData, $bData, $rows, $summary] = $this->buildComparison(
            (int) $request->assessment_a_id,
            (int) $request->assessment_b_id
        );

        AuditLog::record(
            'exported',
            'Report',
            0,
            "Assessment Comparison PDF exported: \"{$aData['title']}\" vs \"{$bData['title']}\""
        );

        $pdf = Pdf::loadView('reports.assessment-comparison', [
            'assessmentA' => $aData,
            'assessmentB' => $bData,
            'rows' => $rows,
            'summary' => $summary,
            'generatedAt' => now()->format('Y-m-d H:i'),
        ]);

        $pdf->setPaper('A4', 'landscape');

        return $pdf->download('assessment-comparison-'.now()->format('Y-m-d').'.pdf');
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function buildComparison(int $aId, int $bId): array
    {
        // Tenant-scope: a user in tenant A cannot fetch tenant B's assessments
        // by passing their ids — cross-tenant id resolves to 404.
        $scope = fn () => Auth::user()->organisationScope(Assessment::query());

        $assessmentA = $scope()->with('framework')->findOrFail($aId);
        $assessmentB = $scope()->with('framework')->findOrFail($bId);

        // Keyed by control_id (FK integer)
        $itemsA = AssessmentItem::where('assessment_id', $aId)
            ->get(['control_id', 'compliance_status'])
            ->keyBy('control_id');

        $itemsB = AssessmentItem::where('assessment_id', $bId)
            ->get(['control_id', 'compliance_status'])
            ->keyBy('control_id');

        $allControlIds = $itemsA->keys()
            ->merge($itemsB->keys())
            ->unique()
            ->values();

        $controls = Control::with('framework')
            ->whereIn('id', $allControlIds)
            ->get()
            ->keyBy('id');

        $evidenceA = $this->getBestVerdicts($allControlIds->toArray(), $assessmentA->created_at);
        $evidenceB = $this->getBestVerdicts($allControlIds->toArray(), $assessmentB->created_at);

        // Higher = better compliance
        $statusOrder = [
            'compliant' => 4,
            'partially_compliant' => 3,
            'non_compliant' => 2,
            'not_applicable' => 1,
            'not_assessed' => 0,
        ];

        $rows = [];
        foreach ($allControlIds as $controlId) {
            $control = $controls->get($controlId);
            if (! $control) {
                continue;
            }

            $itemA = $itemsA->get($controlId);
            $itemB = $itemsB->get($controlId);
            $statusA = $itemA ? $itemA->compliance_status : 'not_assessed';
            $statusB = $itemB ? $itemB->compliance_status : 'not_assessed';
            $changed = $statusA !== $statusB;

            if (! $itemA && $itemB) {
                $direction = 'new';
            } elseif ($itemA && ! $itemB) {
                $direction = 'removed';
            } elseif (! $changed) {
                $direction = 'unchanged';
            } else {
                $orderA = $statusOrder[$statusA] ?? 0;
                $orderB = $statusOrder[$statusB] ?? 0;
                $direction = $orderB > $orderA ? 'improved' : 'regressed';
            }

            $rows[] = [
                'control_id' => $controlId,
                'control_code' => $control->control_id,
                'control_name' => $control->title,
                'framework' => $control->framework->short_name ?? '',
                'status_a' => $statusA,
                'status_b' => $statusB,
                'changed' => $changed,
                'direction' => $direction,
                'evidence_verdict_a' => $evidenceA[$controlId] ?? null,
                'evidence_verdict_b' => $evidenceB[$controlId] ?? null,
            ];
        }

        $rowCol = collect($rows);
        $totalControls = $rowCol->count();
        $changedCount = $rowCol->where('changed', true)->count();
        $improvedCount = $rowCol->where('direction', 'improved')->count();
        $regressedCount = $rowCol->where('direction', 'regressed')->count();

        $scoreA = (float) $assessmentA->compliance_percentage;
        $scoreB = (float) $assessmentB->compliance_percentage;
        $evQualityA = $this->calcEvidenceQuality($evidenceA, $totalControls);
        $evQualityB = $this->calcEvidenceQuality($evidenceB, $totalControls);

        $summary = [
            'compliance_score_a' => $scoreA,
            'compliance_score_b' => $scoreB,
            'compliance_delta' => round($scoreB - $scoreA, 1),
            'total_controls' => $totalControls,
            'changed_count' => $changedCount,
            'improved_count' => $improvedCount,
            'regressed_count' => $regressedCount,
            'evidence_quality_a' => $evQualityA,
            'evidence_quality_b' => $evQualityB,
            'evidence_quality_delta' => $evQualityB - $evQualityA,
        ];

        $aData = [
            'id' => $assessmentA->id,
            'title' => $assessmentA->title,
            'date' => $assessmentA->created_at->format('Y-m-d'),
            'framework' => $assessmentA->framework->short_name ?? '',
            'compliance_percentage' => $scoreA,
        ];

        $bData = [
            'id' => $assessmentB->id,
            'title' => $assessmentB->title,
            'date' => $assessmentB->created_at->format('Y-m-d'),
            'framework' => $assessmentB->framework->short_name ?? '',
            'compliance_percentage' => $scoreB,
        ];

        return [$aData, $bData, $rows, $summary];
    }

    /**
     * For each control ID, find the best (highest-ranked) ai_verdict from evidence
     * uploaded on or before the given cutoff date.
     */
    private function getBestVerdicts(array $controlIds, $cutoff): array
    {
        if (empty($controlIds)) {
            return [];
        }

        // Keys match AIService::VERDICT_* constants — the canonical DB-stored format.
        $rank = [
            AIService::VERDICT_ADEQUATE => 3,
            AIService::VERDICT_PARTIAL => 2,
            AIService::VERDICT_INSUFFICIENT => 1,
        ];

        $evidences = Evidence::whereIn('control_id', $controlIds)
            ->whereNotNull('ai_verdict')
            ->where('created_at', '<=', $cutoff)
            ->get(['control_id', 'ai_verdict']);

        $best = [];
        foreach ($evidences as $ev) {
            $cid = $ev->control_id;
            $thisRank = $rank[$ev->ai_verdict] ?? 0;
            $bestRank = isset($best[$cid]) ? ($rank[$best[$cid]] ?? 0) : -1;
            if ($thisRank > $bestRank) {
                $best[$cid] = $ev->ai_verdict;
            }
        }

        return $best;
    }

    /**
     * Percentage of total controls that have an "Adequate" evidence verdict.
     */
    private function calcEvidenceQuality(array $verdicts, int $total): int
    {
        if ($total === 0) {
            return 0;
        }
        $adequate = collect($verdicts)->filter(fn ($v) => $v === AIService::VERDICT_ADEQUATE)->count();

        return (int) round($adequate / $total * 100);
    }
}
