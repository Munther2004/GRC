<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\AuditLog;
use App\Models\ControlStatusHistory;
use App\Models\Evidence;
use App\Models\Framework;
use App\Services\AIService;
use App\Services\EvidenceFileExtractor;
use App\Services\RulesEngine;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EvidenceController extends Controller
{
    /**
     * Tenant-scope an Evidence query by the uploader's corporation.
     *
     *  - super_admin → unscoped.
     *  - corp users → only evidence whose uploader shares their corporation_id.
     *  - users with no corporation_id → no rows.
     *
     * Evidence has no `corporation_id` column today, so we route through the
     * uploader (`evidence.user_id` → `users.corporation_id`).
     */
    private function tenantScope(Builder $query): Builder
    {
        $user = Auth::user();

        if ($user->isSuperAdmin()) {
            return $query;
        }

        if (! $user->corporation_id) {
            return $query->whereRaw('1 = 0');
        }

        $corpId = $user->corporation_id;

        return $query->whereHas('user', fn ($q) => $q->where('corporation_id', $corpId));
    }

    /**
     * Abort 404 if the current user cannot access the evidence record.
     * 404 (not 403) so cross-tenant IDs are indistinguishable from non-existent.
     */
    private function ensureCanAccess(Evidence $evidence): void
    {
        $user = Auth::user();

        if ($user->isSuperAdmin()) {
            return;
        }

        $uploaderCorpId = $evidence->user?->corporation_id;

        if (! $user->corporation_id || $uploaderCorpId !== $user->corporation_id) {
            abort(404);
        }
    }

    public function index(Request $request)
    {
        $base = $this->tenantScope(Evidence::query());

        $query = (clone $base)->with([
            'user',
            'assessmentItem.control',
            'assessmentItem.assessment.framework',
            'assessmentItem.assessment.user',
            'control.framework',
        ])
            ->when($request->search, fn ($q) => $q->where('title', 'like', "%{$request->search}%")
                ->orWhere('file_name', 'like', "%{$request->search}%")
            )
            ->when($request->status, fn ($q) => $q->where('status', $request->status)
            )
            ->when($request->framework_id, fn ($q) => $q->whereHas('assessmentItem.assessment', fn ($q2) => $q2->where('framework_id', $request->framework_id)
            )
            )
            ->when($request->assessment_id, fn ($q) => $q->whereHas('assessmentItem', fn ($q2) => $q2->where('assessment_id', $request->assessment_id)
            )
            )
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        // Stats: keep tenant-scoped to match the listing.
        $stats = [
            'total' => $this->tenantScope(Evidence::query())->count(),
            'pending' => $this->tenantScope(Evidence::query())->where('status', 'pending')->count(),
            'approved' => $this->tenantScope(Evidence::query())->where('status', 'approved')->count(),
            'rejected' => $this->tenantScope(Evidence::query())->where('status', 'rejected')->count(),
        ];

        // Assessment filter list: only assessments visible to the current tenant.
        $assessments = Auth::user()->organisationScope(Assessment::query())
            ->where('status', 'completed')
            ->orderBy('title')
            ->get(['id', 'title']);

        return Inertia::render('evidence/index', [
            'evidence' => $query,
            'frameworks' => Framework::where('is_active', true)->get(['id', 'name', 'short_name']),
            'assessments' => $assessments,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'framework_id', 'assessment_id']),
        ]);
    }

    public function approve(Evidence $evidence)
    {
        $evidence->loadMissing('user');
        $this->ensureCanAccess($evidence);

        $evidence->update(['status' => 'approved']);

        AuditLog::record(
            'updated',
            'Evidence',
            $evidence->id,
            "Evidence '{$evidence->title}' approved"
        );

        $this->recalculateLinkedAssessmentScore($evidence);

        return back()->with('success', 'Evidence approved.');
    }

    public function reject(Evidence $evidence)
    {
        $evidence->loadMissing('user');
        $this->ensureCanAccess($evidence);

        $evidence->update(['status' => 'rejected']);

        AuditLog::record(
            'updated',
            'Evidence',
            $evidence->id,
            "Evidence '{$evidence->title}' rejected"
        );

        // ── Control status revert logic ──────────────────────────────────────
        $revertedTo = null;
        $controlReverted = false;

        $evidence->loadMissing(['control', 'assessmentItem.control']);
        $control = $evidence->control ?? $evidence->assessmentItem?->control;

        if ($control) {
            // Check whether any other non-rejected, adequately-reviewed evidence
            // still supports this control (direct or via assessment item).
            $hasSupportingEvidence = Evidence::where('id', '!=', $evidence->id)
                ->where('status', '!=', 'rejected')
                ->whereIn('ai_verdict', ['Adequate', 'Partially Adequate'])
                ->where(function ($q) use ($control) {
                    $q->where('control_id', $control->id)
                        ->orWhereHas('assessmentItem', fn ($q2) => $q2->where('control_id', $control->id)
                        );
                })
                ->exists();

            if (! $hasSupportingEvidence) {
                // Find what the control status was just before this evidence was uploaded.
                $historyBefore = ControlStatusHistory::where('control_id', $control->id)
                    ->where('created_at', '<', $evidence->created_at)
                    ->orderBy('created_at', 'desc')
                    ->first();

                // null means "Not Set"
                $revertTo = $historyBefore?->new_status === 'not_set'
                    ? null
                    : $historyBefore?->new_status;
                $currentStatus = $control->current_status;

                if ($revertTo !== $currentStatus) {
                    $control->update(['current_status' => $revertTo]);

                    ControlStatusHistory::create([
                        'control_id' => $control->id,
                        'user_id' => auth()->id(),
                        'old_status' => $currentStatus,
                        'new_status' => $revertTo ?? 'not_set',
                        'notes' => "Status reverted — evidence #{$evidence->id} rejected as irrelevant",
                        'evidence_id' => $evidence->id,
                    ]);

                    // Trigger Rules Engine based on the direction of the status change.
                    $rules = new RulesEngine;
                    if ($revertTo === 'non_compliant') {
                        // Control is now non-compliant → raise linked risk likelihoods
                        $control->load('risks');
                        $rules->applyRule1ForControl($control);
                    } elseif ($currentStatus === 'non_compliant') {
                        // Was non-compliant, now moving to compliant/unset → lower likelihoods
                        $control->load('risks');
                        $rules->applyRule2ForControl($control, 'non_compliant');
                    }

                    AuditLog::record(
                        'updated',
                        'Evidence',
                        $evidence->id,
                        "Evidence #{$evidence->id} rejected for control {$control->control_id} — control status reverted to ".($revertTo ?? 'Not Set')
                    );

                    $revertedTo = $revertTo;
                    $controlReverted = true;
                }
            }
        }
        // ────────────────────────────────────────────────────────────────────

        $this->recalculateLinkedAssessmentScore($evidence);

        if (request()->wantsJson()) {
            return response()->json([
                'success' => true,
                'reverted_to' => $revertedTo,
                'control_reverted' => $controlReverted,
            ]);
        }

        return back()->with('success', 'Evidence rejected.');
    }

    public function download(Evidence $evidence)
    {
        $evidence->loadMissing('user');
        $this->ensureCanAccess($evidence);

        if (! Storage::disk('public')->exists($evidence->file_path)) {
            abort(404, 'File not found.');
        }

        return Storage::disk('public')->download($evidence->file_path, $evidence->file_name);
    }

    public function destroy(Evidence $evidence)
    {
        $evidence->loadMissing('user');
        $this->ensureCanAccess($evidence);

        Storage::disk('public')->delete($evidence->file_path);

        $title = $evidence->title;
        $id = $evidence->id;
        $evidence->delete();

        AuditLog::record('deleted', 'Evidence', $id, "Evidence '{$title}' deleted");

        return back()->with('success', 'Evidence deleted.');
    }

    public function aiReview(Evidence $evidence)
    {
        Log::info('aiReview called', ['evidence_id' => $evidence->id]);

        $evidence->load([
            'user',
            'assessmentItem.control',
            'assessmentItem.assessment.framework',
            'control',
        ]);

        $this->ensureCanAccess($evidence);

        // Prefer direct control link; fall back to assessment item's control
        $control = $evidence->control ?? $evidence->assessmentItem?->control;
        $assessment = $evidence->assessmentItem?->assessment;
        $framework = $assessment?->framework;

        // Log the loaded evidence record so we can debug file path issues
        Log::info('aiReview: evidence record loaded', [
            'evidence_id' => $evidence->id,
            'file_name' => $evidence->file_name,
            'file_type' => $evidence->file_type,
            'file_path' => $evidence->file_path,
            'has_control' => $control !== null,
        ]);

        // Require a linked control — without it Claude cannot assess against the right requirements
        if (! $control) {
            return response()->json([
                'warning' => 'This evidence is not linked to any control. Please link it to a control before running AI Review for an accurate assessment.',
            ]);
        }

        // Extract file content
        $extractor = new EvidenceFileExtractor;
        $extracted = $extractor->extract(
            $evidence->file_path ?? '',
            $evidence->file_type ?? 'application/octet-stream'
        );

        Log::info('aiReview: file extraction result', [
            'content_type' => $extracted['content_type'],
            'content_len' => strlen($extracted['content']),
        ]);

        $evidenceData = [
            'control_id' => $control->control_id,
            'control_title' => $control->title,
            'control_description' => $control->description ?? 'N/A',
            'framework' => $framework?->name ?? 'N/A',
            'evidence_title' => $evidence->title,
            'evidence_description' => $evidence->description ?? '',
            'file_name' => $evidence->file_name,
            'file_type' => $evidence->file_type,
            'upload_date' => $evidence->created_at->toDateString(),
            'expiry_date' => $evidence->expiry_date?->toDateString() ?? 'No expiry',
            'uploaded_by' => $evidence->user?->name ?? 'Unknown',
        ];

        try {
            $ai = new AIService;
            $result = $ai->reviewEvidence($evidenceData, $extracted['content'], $extracted['content_type']);
        } catch (\Throwable $e) {
            Log::error('EvidenceController::aiReview failed', ['message' => $e->getMessage()]);

            return response()->json(['error' => 'AI review failed. Please try again.'], 500);
        }

        $evidence->update([
            'ai_verdict' => $result['verdict'],
            'ai_confidence' => $result['confidence'],
            'ai_strengths' => $result['strengths'],
            'ai_gaps' => $result['gaps'],
            'ai_recommendation' => $result['recommendation'],
            'ai_is_relevant' => $result['is_relevant'],
            'ai_reviewed_at' => now(),
        ]);

        AuditLog::record(
            'ai_reviewed',
            'Evidence',
            $evidence->id,
            "AI reviewed evidence '{$evidence->title}' — verdict: {$result['verdict']}"
        );

        // Refresh the model so getBestVerdict sees the new ai_verdict
        $evidence->refresh();
        $this->recalculateLinkedAssessmentScore($evidence);

        return response()->json($result);
    }

    /**
     * If the evidence is linked to an assessment item, recalculate the parent
     * assessment's evidence-weighted score so the stored value stays in sync.
     */
    private function recalculateLinkedAssessmentScore(Evidence $evidence): void
    {
        $evidence->loadMissing('assessmentItem.assessment');
        $assessment = $evidence->assessmentItem?->assessment;

        if ($assessment) {
            $assessment->recalculateEvidenceWeightedScore();
        }
    }
}
