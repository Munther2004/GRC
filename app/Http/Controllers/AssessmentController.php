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
use App\Services\AIService;
use App\Services\EvidenceScoringService;
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
        $user = Auth::user();
        $scoped = fn () => $user->organisationScope(Assessment::query());

        $query = $scoped()
            ->with(['user', 'framework'])
            ->withCount('items')
            ->when($request->search, fn ($q) => $q->where('title', 'like', "%{$request->search}%")
            )
            ->when($request->status, fn ($q) => $q->where('status', $request->status)
            )
            ->when($request->framework_id, fn ($q) => $q->where('framework_id', $request->framework_id)
            )
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total' => $scoped()->count(),
            'in_progress' => $scoped()->where('status', 'in_progress')->count(),
            'completed' => $scoped()->where('status', 'completed')->count(),
            'avg_compliance' => round($scoped()->where('status', 'completed')->avg('compliance_percentage') ?? 0),
        ];

        return Inertia::render('assessments/index', [
            'assessments' => $query,
            'frameworks' => Framework::where('is_active', true)->get(['id', 'name', 'short_name']),
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'framework_id']),
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
            'title' => 'required|string|max:255',
            'framework_id' => 'required|exists:frameworks,id',
            'scope' => 'required|string',
            'period' => 'required|string|max:255',
            'due_date' => 'nullable|date',
            'description' => 'nullable|string',
        ]);

        $assessment = Assessment::create([
            ...$validated,
            'user_id' => Auth::id(),
            'corporation_id' => Auth::user()->corporation_id,
            'status' => 'draft',
            'compliance_percentage' => 0,
        ]);

        // Pre-create assessment items, pre-filling from Controls Hub current_status if set
        $controls = Control::where('framework_id', $validated['framework_id'])
            ->where('is_active', true)
            ->get();

        $prefilledCount = 0;

        foreach ($controls as $control) {
            $prefilledStatus = match ($control->current_status) {
                'compliant' => 'compliant',
                'partially_compliant' => 'partially_compliant',
                'non_compliant' => 'non_compliant',
                'not_applicable' => 'not_applicable',
                default => 'not_applicable',
            };

            if ($control->current_status !== null) {
                $prefilledCount++;
            }

            AssessmentItem::create([
                'assessment_id' => $assessment->id,
                'control_id' => $control->id,
                'compliance_status' => $prefilledStatus,
                'comments' => null,
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
            'compliant' => $items->where('compliance_status', 'compliant')->count(),
            'partially_compliant' => $items->where('compliance_status', 'partially_compliant')->count(),
            'non_compliant' => $items->where('compliance_status', 'non_compliant')->count(),
            'not_applicable' => $items->where('compliance_status', 'not_applicable')->count(),
        ];

        $byCategory = $items->groupBy('control.category')->map(function ($group) {
            return [
                'total' => $group->count(),
                'compliant' => $group->where('compliance_status', 'compliant')->count(),
                'percentage' => $group->count() > 0
                    ? round($group->where('compliance_status', 'compliant')->count() / $group->count() * 100)
                    : 0,
            ];
        });

        $evidenceScore = (new EvidenceScoringService)->calculateEvidenceWeightedScore($assessment);

        return Inertia::render('assessments/show', [
            'assessment' => $assessment,
            'breakdown' => $breakdown,
            'byCategory' => $byCategory,
            'items' => $items,
            'evidenceScore' => $evidenceScore,
        ]);
    }

    public function questionnaire(Assessment $assessment, Request $request)
    {
        $assessment->load('framework');

        $page = max(1, (int) $request->get('page', 1));
        $perPage = 20;

        $totalItems = AssessmentItem::where('assessment_id', $assessment->id)->count();
        $totalPages = max(1, (int) ceil($totalItems / $perPage));
        $page = min($page, $totalPages);

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
            'assessment' => $assessment,
            'items' => $items,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => $totalPages,
                'total_items' => $totalItems,
                'per_page' => $perPage,
            ],
            'progress' => [
                'answered' => $answered,
                'total' => $totalItems,
                'percent' => $totalItems > 0 ? round($answered / $totalItems * 100) : 0,
            ],
            'prefilledCount' => $prefilledCount,
        ]);
    }

    public function saveAnswers(Request $request, Assessment $assessment)
    {
        $validated = $request->validate([
            'answers' => 'required|array',
            'answers.*.id' => 'required|exists:assessment_items,id',
            'answers.*.compliance_status' => 'required|in:compliant,partially_compliant,non_compliant,not_applicable',
            'answers.*.comments' => 'nullable|string',
        ]);

        foreach ($validated['answers'] as $answer) {
            AssessmentItem::where('id', $answer['id'])
                ->where('assessment_id', $assessment->id)
                ->update([
                    'compliance_status' => $answer['compliance_status'],
                    'comments' => $answer['comments'] ?? null,
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
        // QA-only utility: must never run in production. 404 (not 403) so the
        // route appears non-existent to attackers.
        abort_if(app()->environment('production'), 404);

        // Tenant ownership: a user in tenant A cannot auto-fill tenant B's assessment.
        $user = Auth::user();
        if (! $user->isSuperAdmin()) {
            if (! $user->corporation_id || $assessment->corporation_id !== $user->corporation_id) {
                abort(404);
            }
        }

        $statuses = ['compliant', 'compliant', 'compliant', 'partially_compliant', 'partially_compliant', 'non_compliant', 'not_applicable'];
        $comments = [
            'compliant' => ['Control fully implemented and verified.', 'Evidence reviewed and approved.', 'Process documented and operational.'],
            'partially_compliant' => ['Partially implemented, gaps identified.', 'In progress — remediation planned Q3.', 'Some evidence available, documentation incomplete.'],
            'non_compliant' => ['Not yet implemented.', 'Control missing — remediation required.', 'No evidence of implementation found.'],
            'not_applicable' => [],
        ];

        $assessment->items()->each(function ($item) use ($statuses, $comments) {
            $status = $statuses[array_rand($statuses)];
            $pool = $comments[$status];
            $item->update([
                'compliance_status' => $status,
                'comments' => count($pool) ? $pool[array_rand($pool)] : null,
            ]);
        });

        $assessment->recalculateCompliance();
        $assessment->recalculateEvidenceWeightedScore();
        $assessment->update(['status' => 'completed']);

        AuditLog::record(
            'submitted',
            'Assessment',
            $assessment->id,
            "[QA AUTO-FILL] Assessment '{$assessment->title}' auto-filled and submitted with {$assessment->compliance_percentage}% compliance"
        );

        $rulesEngine = new RulesEngine;
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
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }

        return redirect()->route('assessments.show', $assessment)
            ->with('success', '[QA] Assessment auto-filled and submitted successfully.');
    }

    public function submit(Assessment $assessment)
    {
        $assessment->recalculateCompliance();
        $assessment->recalculateEvidenceWeightedScore();
        $assessment->update(['status' => 'completed']);

        AuditLog::record(
            'submitted',
            'Assessment',
            $assessment->id,
            "Assessment '{$assessment->title}' submitted with {$assessment->compliance_percentage}% compliance"
        );

        $rulesEngine = new RulesEngine;
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
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }

        return redirect()->route('assessments.show', $assessment)
            ->with('success', 'Assessment submitted successfully.');
    }

    public function uploadEvidence(Request $request, Assessment $assessment, AssessmentItem $item)
    {
        // Tenant ownership: only allow uploading to assessments the user can see.
        $user = Auth::user();
        if (! $user->isSuperAdmin()) {
            if (! $user->corporation_id || $assessment->corporation_id !== $user->corporation_id) {
                abort(404);
            }
        }

        // Parent/child consistency: the item must belong to this assessment.
        // 404 (not 403) so cross-assessment IDs are indistinguishable from missing.
        if ($item->assessment_id !== $assessment->id) {
            abort(404);
        }

        $request->validate([
            'file' => 'required|file|max:10240|mimes:pdf,doc,docx,xls,xlsx,png,jpg,jpeg,txt',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'expiry_date' => 'nullable|date|after:today',
        ]);

        $file = $request->file('file');
        $path = $file->store("evidence/assessment-{$assessment->id}", 'public');

        Evidence::create([
            'user_id' => Auth::id(),
            'assessment_item_id' => $item->id,
            'control_id' => $item->control_id,
            'title' => $request->title,
            'description' => $request->description,
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $file->getMimeType(),
            'status' => 'pending',
            'expiry_date' => $request->expiry_date,
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
            'compliant' => $items->where('compliance_status', 'compliant')->count(),
            'partially_compliant' => $items->where('compliance_status', 'partially_compliant')->count(),
            'non_compliant' => $items->where('compliance_status', 'non_compliant')->count(),
            'not_applicable' => $items->where('compliance_status', 'not_applicable')->count(),
        ];

        $byCategory = $items->groupBy('control.category')->map(fn ($g) => [
            'total' => $g->count(),
            'compliant' => $g->where('compliance_status', 'compliant')->count(),
            'percentage' => $g->count() > 0
                ? round($g->where('compliance_status', 'compliant')->count() / $g->count() * 100)
                : 0,
        ]);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('assessments.pdf', [
            'assessment' => $assessment,
            'items' => $items,
            'breakdown' => $breakdown,
            'byCategory' => $byCategory,
            'generatedAt' => now()->format('Y-m-d H:i'),
        ]);

        $pdf->setPaper('A4', 'portrait');
        $slug = str($assessment->title)->slug()->limit(40);

        return $pdf->download("assessment-{$slug}-".now()->format('Y-m-d').'.pdf');
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

        // Fetch in one query which controls already have a history entry for this assessment
        $alreadySyncedControlIds = ControlStatusHistory::where('notes', "Synced from assessment #{$assessment->id}")
            ->pluck('control_id')
            ->flip()
            ->all();

        $now = now();

        foreach ($items as $item) {
            $control = $item->control;
            if (! $control) {
                continue;
            }

            $newStatus = $item->compliance_status;
            $oldStatus = $control->current_status;

            $updates = ['current_status' => $newStatus];
            if (in_array($newStatus, ['compliant', 'partially_compliant'])) {
                $updates['last_remediated_at'] = $now;
            }
            $control->update($updates);

            // Idempotency: skip history record if already created for this assessment
            if (! isset($alreadySyncedControlIds[$control->id])) {
                ControlStatusHistory::create([
                    'control_id' => $control->id,
                    'user_id' => null,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                    'notes' => "Synced from assessment #{$assessment->id}",
                ]);
            }
        }
    }

    public function explainControl(Request $request)
    {
        $validated = $request->validate([
            'control_id' => 'required|exists:controls,id',
        ]);

        $control = Control::with('framework')->findOrFail($validated['control_id']);

        $aiService = new AIService;
        $jsonString = $aiService->explainControl([
            'code' => $control->control_id,
            'name' => $control->title,
            'description' => $control->description ?? '',
            'framework' => $control->framework?->name ?? '',
            'domain' => $control->category ?? '',
        ]);

        $explanation = json_decode($jsonString, true);

        return response()->json([
            'success' => true,
            'explanation' => $explanation,
        ]);
    }

    public function destroy(Request $request, Assessment $assessment)
    {
        $title = $assessment->title;
        $id = $assessment->id;
        $frameworkId = $assessment->framework_id;

        // 1. Flag the assessment so any in-flight queue job aborts before
        //    creating risks (race condition: AI job started before deletion).
        $assessment->update(['status' => 'deleting']);

        // 2. Cancel any pending queue jobs that target this assessment.
        //    The serialized payload contains the assessment id under "id"
        //    (see ShouldQueue + SerializesModels). A LIKE-match on the id
        //    plus the assessments class name keeps this safe across job types.
        try {
            DB::table('jobs')
                ->where('payload', 'like', '%App\\\\Jobs\\\\GenerateAIRisksJob%')
                ->where('payload', 'like', '%"id":'.$id.',%')
                ->delete();
        } catch (\Throwable $e) {
            Log::warning('Failed to purge pending jobs for deleted assessment', [
                'assessment_id' => $id,
                'error' => $e->getMessage(),
            ]);
        }

        // 3. Delete AI-generated risks linked to this assessment + their
        //    control_risk pivot rows.
        $risks = Risk::where('assessment_id', $id)
            ->where('auto_generated', true)
            ->get();

        $riskIds = $risks->pluck('id')->all();
        $riskCount = count($riskIds);

        if ($riskIds) {
            DB::table('control_risk')->whereIn('risk_id', $riskIds)->delete();
            Risk::whereIn('id', $riskIds)->delete();
        }

        // 4. Delete evidence linked to this assessment (via assessment items).
        $itemIds = AssessmentItem::where('assessment_id', $id)->pluck('id');
        $evidenceRecords = Evidence::whereIn('assessment_item_id', $itemIds)->get();

        $evidenceCount = 0;
        foreach ($evidenceRecords as $ev) {
            if ($ev->file_path) {
                Storage::disk('public')->delete($ev->file_path);
            }
            $ev->delete();
            $evidenceCount++;
        }

        Log::info("Deleted {$evidenceCount} evidence records linked to assessment #{$id}");

        // 5. Re-sync or reset control statuses depending on whether the
        //    framework still has another assessment to source truth from.
        $latestRemaining = Assessment::where('framework_id', $frameworkId)
            ->where('id', '!=', $id)
            ->where('status', '!=', 'deleting')
            ->orderBy('created_at', 'desc')
            ->first();

        $resyncedFromId = null;
        $missingRiskFlagged = false;

        if ($latestRemaining) {
            $remainingItems = AssessmentItem::with('control')
                ->where('assessment_id', $latestRemaining->id)
                ->get();

            $now = now();

            foreach ($remainingItems as $item) {
                $control = $item->control;
                if (! $control) {
                    continue;
                }

                $newStatus = match ($item->compliance_status) {
                    'compliant', 'partially_compliant', 'non_compliant', 'not_applicable' => $item->compliance_status,
                    default => null,
                };

                if ($newStatus === null) {
                    continue;
                }

                $oldStatus = $control->current_status;

                $updates = ['current_status' => $newStatus];
                if (in_array($newStatus, ['compliant', 'partially_compliant'], true)) {
                    $updates['last_remediated_at'] = $now;
                }
                $control->update($updates);

                ControlStatusHistory::create([
                    'control_id' => $control->id,
                    'user_id' => null,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                    'notes' => "Status re-synced from assessment #{$latestRemaining->id} after assessment #{$id} was deleted",
                ]);

                if ($newStatus === 'non_compliant' && ! $missingRiskFlagged) {
                    $hasRisk = Risk::where('source_control_id', $control->id)
                        ->where('assessment_id', $latestRemaining->id)
                        ->exists();
                    if (! $hasRisk) {
                        $missingRiskFlagged = true;
                    }
                }
            }

            $resyncedFromId = $latestRemaining->id;

            if ($missingRiskFlagged && Auth::id()) {
                Notification::create([
                    'user_id' => Auth::id(),
                    'type' => 'critical_risk',
                    'title' => 'Review risk records',
                    'message' => "Risk records may need to be reviewed after assessment #{$id} deletion",
                    'url' => '/risks',
                    'is_read' => false,
                ]);
            }
        } else {
            // No remaining assessment for this framework — reset every
            // control linked to the framework to null.
            $controls = Control::where('framework_id', $frameworkId)->get();

            foreach ($controls as $control) {
                $oldStatus = $control->current_status;

                $control->update([
                    'current_status' => null,
                    'last_remediated_at' => null,
                ]);

                ControlStatusHistory::create([
                    'control_id' => $control->id,
                    'user_id' => null,
                    'old_status' => $oldStatus,
                    'new_status' => 'not_set',
                    'notes' => 'Status reset — last assessment for this framework was deleted',
                ]);
            }
        }

        // 6. Delete notifications linked to this assessment by URL.
        Notification::where('url', "/assessments/{$id}")
            ->orWhere('url', 'like', "/assessments/{$id}/%")
            ->delete();

        // 7. Delete assessment items and the assessment record itself.
        AssessmentItem::where('assessment_id', $id)->delete();
        $assessment->delete();

        // 8. Safety net: any AI-generated risks created between flagging
        //    'deleting' and the job seeing the flag.
        Risk::where('assessment_id', $id)->where('auto_generated', true)->delete();

        $auditNote = $resyncedFromId
            ? "Assessment '{$title}' deleted — controls re-synced from assessment #{$resyncedFromId}, {$riskCount} risk".
                ($riskCount !== 1 ? 's' : '').' removed'
            : "Assessment '{$title}' deleted — control statuses reset, {$riskCount} risk".
                ($riskCount !== 1 ? 's' : '').' removed';

        AuditLog::record('deleted', 'Assessment', $id, $auditNote);

        $message = $resyncedFromId
            ? 'Assessment deleted. Controls re-synced from your most recent assessment.'
            : 'Assessment deleted. Control statuses have been reset.';

        return redirect()->route('assessments.index')->with('success', $message);
    }
}
