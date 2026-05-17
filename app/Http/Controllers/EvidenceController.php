<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\AuditLog;
use App\Models\ControlStatusHistory;
use App\Models\Evidence;
use App\Models\Framework;
use App\Services\AIService;
use App\Services\EvidenceFileExtractor;
use App\Services\GeminiVisionService;
use App\Services\RulesEngine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EvidenceController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $corpFilter = $user->resolveCorporationFilter($request->integer('corporation_id') ?: null);

        // Tenant scope: a piece of evidence belongs to the caller's tenant
        // when its parent assessment is in that tenant, OR (when there is no
        // assessment context) when its uploader is in that tenant. Evidence
        // has no corporation_id column today.
        //
        // For the `user` role we additionally narrow to evidence the caller
        // personally uploaded — operational writers only see their own rows.
        // super_admin can drill into a single tenant via ?corporation_id=.
        $applyTenantScope = function ($q) use ($user, $corpFilter) {
            $corpId = $user && $user->isSuperAdmin()
                ? $corpFilter
                : $user?->corporation_id;

            if ($corpId === null) {
                if ($user && ! $user->isSuperAdmin()) {
                    $q->whereRaw('1 = 0');
                }

                return $q;
            }

            $q->where(function ($outer) use ($corpId) {
                $outer->whereHas('assessmentItem.assessment', fn ($a) => $a->where('corporation_id', $corpId))
                    ->orWhere(function ($alt) use ($corpId) {
                        // Direct-attached evidence (no assessment item): fall
                        // back to uploader's corporation.
                        $alt->whereDoesntHave('assessmentItem')
                            ->whereHas('user', fn ($u) => $u->where('corporation_id', $corpId));
                    });
            });

            if ($user && $user->isUser()) {
                $q->where('user_id', $user->id);
            }

            return $q;
        };

        $query = $applyTenantScope(Evidence::with([
            'user',
            'assessmentItem.control',
            'assessmentItem.assessment.framework',
            'assessmentItem.assessment.user',
            'control.framework',
            'latestReputationCheck',
        ]))
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

        $statBase = fn () => $applyTenantScope(Evidence::query());

        $stats = [
            'total' => $statBase()->count(),
            'pending' => $statBase()->where('status', 'pending')->count(),
            'approved' => $statBase()->where('status', 'approved')->count(),
            'rejected' => $statBase()->where('status', 'rejected')->count(),
        ];

        // Assessment dropdown should only list assessments in the caller's
        // tenant (it was previously global).
        $assessmentsQuery = Assessment::where('status', 'completed')->orderBy('title');
        $effectiveCorpId = $user && $user->isSuperAdmin()
            ? $corpFilter
            : $user?->corporation_id;
        if ($effectiveCorpId !== null) {
            $assessmentsQuery->where('corporation_id', $effectiveCorpId);
        } elseif ($user && ! $user->isSuperAdmin()) {
            $assessmentsQuery->whereRaw('1 = 0');
        }

        return Inertia::render('evidence/index', [
            'evidence' => $query,
            'frameworks' => Framework::where('is_active', true)->get(['id', 'name', 'short_name']),
            'assessments' => $assessmentsQuery->get(['id', 'title']),
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'framework_id', 'assessment_id']),
        ]);
    }

    public function approve(Evidence $evidence)
    {
        $this->authorizeEvidenceAccess($evidence);

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
        $this->authorizeEvidenceAccess($evidence);

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

                // Status now lives on the per-tenant pivot. Resolve the
                // tenant from the evidence (corporation_id is set on Evidence)
                // and update only that tenant's row.
                $tenantId = $evidence->corporation_id ?? auth()->user()?->corporation_id;
                $currentStatus = $control->statusForCorporation($tenantId);

                if ($revertTo !== $currentStatus) {
                    if ($tenantId !== null) {
                        \App\Models\CorporationControlStatus::updateOrCreate(
                            ['corporation_id' => $tenantId, 'control_id' => $control->id],
                            ['current_status' => $revertTo]
                        );
                    } else {
                        $control->update(['current_status' => $revertTo]);
                    }

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
        $this->authorizeEvidenceAccess($evidence);

        $disk = config('filesystems.evidence_disk');

        // S3-style HeadObject can return 403 (not 404) for a missing object when
        // the access key lacks ListBucket — Flysystem then throws
        // UnableToCheckFileExistence. Swallow that and treat as not-found so the
        // request becomes a clean 404 instead of a 500.
        try {
            if (! Storage::disk($disk)->exists($evidence->file_path)) {
                abort(404, 'File not found.');
            }
        } catch (\League\Flysystem\UnableToCheckFileExistence $e) {
            Log::warning('Evidence download: existence check failed, treating as missing', [
                'evidence_id' => $evidence->id,
                'file_path' => $evidence->file_path,
                'error' => $e->getMessage(),
            ]);
            abort(404, 'File not found.');
        }

        return Storage::disk($disk)->download($evidence->file_path, $evidence->file_name);
    }

    public function destroy(Evidence $evidence)
    {
        $this->authorizeEvidenceAccess($evidence);

        Storage::disk(config('filesystems.evidence_disk'))->delete($evidence->file_path);

        $title = $evidence->title;
        $id = $evidence->id;
        $evidence->delete();

        AuditLog::record('deleted', 'Evidence', $id, "Evidence '{$title}' deleted");

        return back()->with('success', 'Evidence deleted.');
    }

    public function aiReview(Evidence $evidence)
    {
        $this->authorizeEvidenceAccess($evidence);

        Log::info('aiReview called', ['evidence_id' => $evidence->id]);

        $evidence->load([
            'user',
            'assessmentItem.control',
            'assessmentItem.assessment.framework',
            'control',
        ]);

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

        // ── Optional Gemini image preprocessing (advisory only, image-only) ──
        // For PNG/JPEG/WEBP, when enabled and configured, we ask Gemini to
        // extract OCR + visual summary + security observations. Claude still
        // gets the original base64 image AND now also Gemini's analysis.
        //
        // Any failure (missing key, 429, network, malformed JSON) returns an
        // `enabled: false` payload and we fall back to Claude-only review.
        $geminiAnalysis = null;
        $geminiCandidateMimes = ['image/png', 'image/jpeg', 'image/webp'];
        $isImage = in_array($extracted['content_type'], $geminiCandidateMimes, true);

        if ($isImage
            && config('services.gemini.image_preprocessing')
            && ! empty(config('services.gemini.key'))
        ) {
            try {
                $absolutePath = \App\Support\StorageHelper::tempLocalPath(
                    config('filesystems.evidence_disk'),
                    $evidence->file_path,
                );
                $vision = new GeminiVisionService;
                $candidate = $vision->analyzeImage($absolutePath, [
                    'evidence_id' => $evidence->id,
                    'mime_type' => $extracted['content_type'],
                    'control_id' => $control->control_id,
                ]);

                if (($candidate['enabled'] ?? false) === true) {
                    $geminiAnalysis = $candidate;
                }
            } catch (\Throwable $e) {
                // The service should not throw, but defensively swallow anyway
                // — Claude-only fallback is the documented contract.
                Log::warning('EvidenceController::aiReview: Gemini preprocessing threw, falling back to Claude-only', [
                    'evidence_id' => $evidence->id,
                    'error' => $e->getMessage(),
                ]);
                $geminiAnalysis = null;
            }
        }

        try {
            $ai = new AIService;
            $result = $ai->reviewEvidence(
                $evidenceData,
                $extracted['content'],
                $extracted['content_type'],
                $geminiAnalysis,
            );
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
     * Refuse the request unless the authenticated user can act on this
     * evidence record. Tenant boundary is the parent assessment's
     * corporation, falling back to the uploader's corporation when there
     * is no assessment context.
     */
    private function authorizeEvidenceAccess(Evidence $evidence): void
    {
        $user = Auth::user();
        if (! $user) {
            abort(403);
        }
        if ($user->isSuperAdmin()) {
            return;
        }

        $evidence->loadMissing(['assessmentItem.assessment', 'user']);
        $assessmentCorpId = $evidence->assessmentItem?->assessment?->corporation_id;

        if ($assessmentCorpId !== null) {
            if ((int) $assessmentCorpId !== (int) $user->corporation_id) {
                abort(403);
            }

            return;
        }

        // No parent assessment — fall back to uploader's corporation.
        $uploaderCorpId = $evidence->user?->corporation_id;
        if ($uploaderCorpId === null
            || (int) $uploaderCorpId !== (int) $user->corporation_id
        ) {
            abort(403);
        }
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
