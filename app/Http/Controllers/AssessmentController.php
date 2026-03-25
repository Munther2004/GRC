<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateAIRisksJob;
use App\Models\Assessment;
use App\Models\AssessmentItem;
use App\Models\AuditLog;
use App\Models\Control;
use App\Models\ControlStatusHistory;
use App\Models\Evidence;
use App\Models\Framework;
use App\Models\Notification;
use App\Models\Risk;
use App\Services\RulesEngine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AssessmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Assessment::with(['user', 'framework'])
            ->when($request->search, fn($q) =>
                $q->where('title', 'like', "%{$request->search}%")
            )
            ->when($request->status, fn($q) =>
                $q->where('status', $request->status)
            )
            ->when($request->framework_id, fn($q) =>
                $q->where('framework_id', $request->framework_id)
            )
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total'      => Assessment::count(),
            'in_progress'=> Assessment::where('status', 'in_progress')->count(),
            'completed'  => Assessment::where('status', 'completed')->count(),
            'avg_compliance' => round(Assessment::where('status', 'completed')->avg('compliance_percentage') ?? 0),
        ];

        return Inertia::render('assessments/index', [
            'assessments' => $query,
            'frameworks'  => Framework::where('is_active', true)->get(['id', 'name', 'short_name']),
            'stats'       => $stats,
            'filters'     => $request->only(['search', 'status', 'framework_id']),
        ]);
    }

    public function create()
    {
        return Inertia::render('assessments/create', [
            'frameworks' => Framework::where('is_active', true)->get(['id', 'name', 'short_name', 'description']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'framework_id' => 'required|exists:frameworks,id',
            'scope'        => 'required|string',
            'period'       => 'required|string|max:255',
            'due_date'     => 'nullable|date',
            'description'  => 'nullable|string',
        ]);

        $assessment = Assessment::create([
            ...$validated,
            'user_id'               => Auth::id(),
            'status'                => 'draft',
            'compliance_percentage' => 0,
        ]);

        // Pre-create assessment items, pre-filling from Controls Hub current_status if set
        $controls = Control::where('framework_id', $validated['framework_id'])
            ->where('is_active', true)
            ->get();

        $prefilledCount = 0;

        foreach ($controls as $control) {
            $prefilledStatus = match ($control->current_status) {
                'compliant'           => 'compliant',
                'partially_compliant' => 'partially_compliant',
                'non_compliant'       => 'non_compliant',
                'not_applicable'      => 'not_applicable',
                default               => 'not_applicable',
            };

            if ($control->current_status !== null) {
                $prefilledCount++;
            }

            AssessmentItem::create([
                'assessment_id'     => $assessment->id,
                'control_id'        => $control->id,
                'compliance_status' => $prefilledStatus,
                'comments'          => null,
            ]);
        }

        AuditLog::record(
            'created',
            'Assessment',
            $assessment->id,
            "Assessment '{$assessment->title}' created for framework {$assessment->framework->short_name}"
        );

        return redirect()->route('assessments.questionnaire', $assessment)
            ->with('success', 'Assessment created. Complete the questionnaire below.');
    }

    public function show(Assessment $assessment)
    {
        $assessment->load(['user', 'framework']);

        $items = AssessmentItem::with(['control', 'evidence'])
            ->where('assessment_id', $assessment->id)
            ->get();

        $breakdown = [
            'compliant'           => $items->where('compliance_status', 'compliant')->count(),
            'partially_compliant' => $items->where('compliance_status', 'partially_compliant')->count(),
            'non_compliant'       => $items->where('compliance_status', 'non_compliant')->count(),
            'not_applicable'      => $items->where('compliance_status', 'not_applicable')->count(),
        ];

        $byCategory = $items->groupBy('control.category')->map(function ($group) {
            return [
                'total'      => $group->count(),
                'compliant'  => $group->where('compliance_status', 'compliant')->count(),
                'percentage' => $group->count() > 0
                    ? round($group->where('compliance_status', 'compliant')->count() / $group->count() * 100)
                    : 0,
            ];
        });

        return Inertia::render('assessments/show', [
            'assessment' => $assessment,
            'breakdown'  => $breakdown,
            'byCategory' => $byCategory,
            'items'      => $items,
        ]);
    }

    public function questionnaire(Assessment $assessment, Request $request)
    {
        $assessment->load('framework');

        $page     = max(1, (int) $request->get('page', 1));
        $perPage  = 20;

        $totalItems = AssessmentItem::where('assessment_id', $assessment->id)->count();
        $totalPages = max(1, (int) ceil($totalItems / $perPage));
        $page       = min($page, $totalPages);

        $items = AssessmentItem::with(['control', 'evidence'])
            ->where('assessment_id', $assessment->id)
            ->join('controls', 'assessment_items.control_id', '=', 'controls.id')
            ->orderBy('controls.control_id')
            ->select('assessment_items.*')
            ->offset(($page - 1) * $perPage)
            ->limit($perPage)
            ->get();

        $answered = AssessmentItem::where('assessment_id', $assessment->id)
            ->where('compliance_status', '!=', 'not_applicable')
            ->count();

        $prefilledCount = Control::where('framework_id', $assessment->framework_id)
            ->whereNotNull('current_status')
            ->count();

        return Inertia::render('assessments/questionnaire', [
            'assessment'     => $assessment,
            'items'          => $items,
            'pagination'     => [
                'current_page' => $page,
                'total_pages'  => $totalPages,
                'total_items'  => $totalItems,
                'per_page'     => $perPage,
            ],
            'progress'       => [
                'answered' => $answered,
                'total'    => $totalItems,
                'percent'  => $totalItems > 0 ? round($answered / $totalItems * 100) : 0,
            ],
            'prefilledCount' => $prefilledCount,
        ]);
    }

    public function saveAnswers(Request $request, Assessment $assessment)
    {
        $validated = $request->validate([
            'answers'                          => 'required|array',
            'answers.*.id'                     => 'required|exists:assessment_items,id',
            'answers.*.compliance_status'      => 'required|in:compliant,partially_compliant,non_compliant,not_applicable',
            'answers.*.comments'               => 'nullable|string',
        ]);

        foreach ($validated['answers'] as $answer) {
            AssessmentItem::where('id', $answer['id'])
                ->where('assessment_id', $assessment->id)
                ->update([
                    'compliance_status' => $answer['compliance_status'],
                    'comments'          => $answer['comments'] ?? null,
                ]);
        }

        // Update assessment status to in_progress
        if ($assessment->status === 'draft') {
            $assessment->update(['status' => 'in_progress']);
        }

        $assessment->recalculateCompliance();

        return back()->with('success', 'Answers saved successfully.');
    }

    public function autoFill(Assessment $assessment)
    {
        $statuses = ['compliant', 'compliant', 'compliant', 'partially_compliant', 'partially_compliant', 'non_compliant', 'not_applicable'];
        $comments = [
            'compliant'            => ['Control fully implemented and verified.', 'Evidence reviewed and approved.', 'Process documented and operational.'],
            'partially_compliant'  => ['Partially implemented, gaps identified.', 'In progress — remediation planned Q3.', 'Some evidence available, documentation incomplete.'],
            'non_compliant'        => ['Not yet implemented.', 'Control missing — remediation required.', 'No evidence of implementation found.'],
            'not_applicable'       => [],
        ];

        $assessment->items()->each(function ($item) use ($statuses, $comments) {
            $status = $statuses[array_rand($statuses)];
            $pool   = $comments[$status];
            $item->update([
                'compliance_status' => $status,
                'comments'          => count($pool) ? $pool[array_rand($pool)] : null,
            ]);
        });

        $assessment->recalculateCompliance();
        $assessment->update(['status' => 'completed']);

        AuditLog::record(
            'submitted',
            'Assessment',
            $assessment->id,
            "[QA AUTO-FILL] Assessment '{$assessment->title}' auto-filled and submitted with {$assessment->compliance_percentage}% compliance"
        );

        $rulesEngine = new RulesEngine();
        $rulesEngine->applyRule1($assessment);
        $rulesEngine->applyRule2($assessment);

        $this->syncControlStatuses($assessment);

        try {
            Log::info('Dispatching GenerateAIRisksJob (autoFill)', ['assessment_id' => $assessment->id]);
            GenerateAIRisksJob::dispatch($assessment);
            Log::info('GenerateAIRisksJob dispatched successfully (autoFill)', ['assessment_id' => $assessment->id]);
        } catch (\Throwable $e) {
            Log::error('Failed to dispatch GenerateAIRisksJob (autoFill)', [
                'assessment_id' => $assessment->id,
                'error'         => $e->getMessage(),
                'trace'         => $e->getTraceAsString(),
            ]);
        }

        return redirect()->route('assessments.show', $assessment)
            ->with('success', '[QA] Assessment auto-filled and submitted successfully.');
    }

    public function submit(Assessment $assessment)
    {
        $assessment->recalculateCompliance();
        $assessment->update(['status' => 'completed']);

        AuditLog::record(
            'submitted',
            'Assessment',
            $assessment->id,
            "Assessment '{$assessment->title}' submitted with {$assessment->compliance_percentage}% compliance"
        );

        $rulesEngine = new RulesEngine();
        $rulesEngine->applyRule1($assessment);
        $rulesEngine->applyRule2($assessment);

        $this->syncControlStatuses($assessment);

        try {
            Log::info('Dispatching GenerateAIRisksJob', ['assessment_id' => $assessment->id]);
            GenerateAIRisksJob::dispatch($assessment);
            Log::info('GenerateAIRisksJob dispatched successfully', ['assessment_id' => $assessment->id]);
        } catch (\Throwable $e) {
            Log::error('Failed to dispatch GenerateAIRisksJob', [
                'assessment_id' => $assessment->id,
                'error'         => $e->getMessage(),
                'trace'         => $e->getTraceAsString(),
            ]);
        }

        return redirect()->route('assessments.show', $assessment)
            ->with('success', 'Assessment submitted successfully.');
    }

    public function uploadEvidence(Request $request, Assessment $assessment, AssessmentItem $item)
    {
        $request->validate([
            'file'        => 'required|file|max:10240|mimes:pdf,doc,docx,xls,xlsx,png,jpg,jpeg,txt',
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'expiry_date' => 'nullable|date|after:today',
        ]);

        $file     = $request->file('file');
        $path     = $file->store("evidence/assessment-{$assessment->id}", 'public');

        Evidence::create([
            'user_id'            => Auth::id(),
            'assessment_item_id' => $item->id,
            'title'              => $request->title,
            'description'        => $request->description,
            'file_path'          => $path,
            'file_name'          => $file->getClientOriginalName(),
            'file_type'          => $file->getMimeType(),
            'status'             => 'pending',
            'expiry_date'        => $request->expiry_date,
        ]);

        AuditLog::record(
            'uploaded',
            'Evidence',
            $item->id,
            "Evidence '{$request->title}' uploaded for control in assessment '{$assessment->title}'"
        );

        return back()->with('success', 'Evidence uploaded successfully.');
    }

    public function exportPdf(Assessment $assessment)
    {
        $assessment->load(['user', 'framework']);

        $items = AssessmentItem::with('control')
            ->where('assessment_id', $assessment->id)
            ->join('controls', 'assessment_items.control_id', '=', 'controls.id')
            ->orderBy('controls.control_id')
            ->select('assessment_items.*')
            ->get();

        $breakdown = [
            'compliant'           => $items->where('compliance_status', 'compliant')->count(),
            'partially_compliant' => $items->where('compliance_status', 'partially_compliant')->count(),
            'non_compliant'       => $items->where('compliance_status', 'non_compliant')->count(),
            'not_applicable'      => $items->where('compliance_status', 'not_applicable')->count(),
        ];

        $byCategory = $items->groupBy('control.category')->map(fn($g) => [
            'total'      => $g->count(),
            'compliant'  => $g->where('compliance_status', 'compliant')->count(),
            'percentage' => $g->count() > 0
                ? round($g->where('compliance_status', 'compliant')->count() / $g->count() * 100)
                : 0,
        ]);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('assessments.pdf', [
            'assessment'  => $assessment,
            'items'       => $items,
            'breakdown'   => $breakdown,
            'byCategory'  => $byCategory,
            'generatedAt' => now()->format('Y-m-d H:i'),
        ]);

        $pdf->setPaper('A4', 'portrait');
        $slug = str($assessment->title)->slug()->limit(40);
        return $pdf->download("assessment-{$slug}-" . now()->format('Y-m-d') . '.pdf');
    }

    /**
     * Sync every assessment item's compliance_status back to the controls table.
     * Idempotent: skips creating a history record if one for this assessment already exists.
     */
    private function syncControlStatuses(Assessment $assessment): void
    {
        $items = AssessmentItem::with('control')
            ->where('assessment_id', $assessment->id)
            ->get();

        foreach ($items as $item) {
            $control = $item->control;
            if (!$control) continue;

            $newStatus = $item->compliance_status;
            $oldStatus = $control->current_status;

            $updates = ['current_status' => $newStatus];
            if (in_array($newStatus, ['compliant', 'partially_compliant'])) {
                $updates['last_remediated_at'] = now();
            }
            $control->update($updates);

            // Idempotency: only create history if not already synced from this assessment
            $alreadySynced = ControlStatusHistory::where('control_id', $control->id)
                ->where('notes', "Synced from assessment #{$assessment->id}")
                ->exists();

            if (!$alreadySynced) {
                ControlStatusHistory::create([
                    'control_id' => $control->id,
                    'user_id'    => null,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                    'notes'      => "Synced from assessment #{$assessment->id}",
                ]);
            }
        }
    }

    public function destroy(Assessment $assessment)
    {
        $title = $assessment->title;
        $id    = $assessment->id;

        // Get all control IDs from this assessment's items
        $controlIds = AssessmentItem::where('assessment_id', $assessment->id)
            ->pluck('control_id');

        // Find all AI risks linked to those controls OR to this assessment directly
        $riskIds = Risk::where('auto_generated', 1)
            ->where(function ($q) use ($controlIds, $assessment) {
                $q->whereIn('source_control_id', $controlIds)
                  ->orWhere('assessment_id', $assessment->id);
            })
            ->pluck('id');

        if ($riskIds->isNotEmpty()) {
            Notification::whereIn('url', $riskIds->map(fn ($rid) => '/risks/' . $rid)->toArray())->delete();
            DB::table('control_risk')->whereIn('risk_id', $riskIds)->delete();
            Risk::whereIn('id', $riskIds)->delete();
        }

        // Delete assessment items
        AssessmentItem::where('assessment_id', $assessment->id)->delete();

        $assessment->delete();

        AuditLog::record('deleted', 'Assessment', $id, "Assessment '{$title}' deleted");

        return redirect()->route('assessments.index')
            ->with('success', 'Assessment deleted.');
    }
}
