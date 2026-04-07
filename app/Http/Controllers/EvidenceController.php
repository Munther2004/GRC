<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Evidence;
use App\Models\Framework;
use App\Models\Assessment;
use App\Services\AIService;
use App\Services\EvidenceFileExtractor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EvidenceController extends Controller
{
    public function index(Request $request)
    {
        $query = Evidence::with([
            'user',
            'assessmentItem.control',
            'assessmentItem.assessment.framework',
            'assessmentItem.assessment.user',
        ])
        ->when($request->search, fn($q) =>
            $q->where('title', 'like', "%{$request->search}%")
              ->orWhere('file_name', 'like', "%{$request->search}%")
        )
        ->when($request->status, fn($q) =>
            $q->where('status', $request->status)
        )
        ->when($request->framework_id, fn($q) =>
            $q->whereHas('assessmentItem.assessment', fn($q2) =>
                $q2->where('framework_id', $request->framework_id)
            )
        )
        ->when($request->assessment_id, fn($q) =>
            $q->whereHas('assessmentItem', fn($q2) =>
                $q2->where('assessment_id', $request->assessment_id)
            )
        )
        ->orderBy('created_at', 'desc')
        ->paginate(20)
        ->withQueryString();

        $stats = [
            'total'    => Evidence::count(),
            'pending'  => Evidence::where('status', 'pending')->count(),
            'approved' => Evidence::where('status', 'approved')->count(),
            'rejected' => Evidence::where('status', 'rejected')->count(),
        ];

        return Inertia::render('evidence/index', [
            'evidence'    => $query,
            'frameworks'  => Framework::where('is_active', true)->get(['id', 'name', 'short_name']),
            'assessments' => Assessment::where('status', 'completed')->orderBy('title')->get(['id', 'title']),
            'stats'       => $stats,
            'filters'     => $request->only(['search', 'status', 'framework_id', 'assessment_id']),
        ]);
    }

    public function approve(Evidence $evidence)
    {
        $evidence->update(['status' => 'approved']);

        AuditLog::record(
            'updated',
            'Evidence',
            $evidence->id,
            "Evidence '{$evidence->title}' approved"
        );

        return back()->with('success', 'Evidence approved.');
    }

    public function reject(Evidence $evidence)
    {
        $evidence->update(['status' => 'rejected']);

        AuditLog::record(
            'updated',
            'Evidence',
            $evidence->id,
            "Evidence '{$evidence->title}' rejected"
        );

        return back()->with('success', 'Evidence rejected.');
    }

    public function download(Evidence $evidence)
    {
        if (!Storage::disk('public')->exists($evidence->file_path)) {
            abort(404, 'File not found.');
        }

        return Storage::disk('public')->download($evidence->file_path, $evidence->file_name);
    }

    public function destroy(Evidence $evidence)
    {
        Storage::disk('public')->delete($evidence->file_path);

        $title = $evidence->title;
        $id    = $evidence->id;
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

        // Prefer direct control link; fall back to assessment item's control
        $control    = $evidence->control ?? $evidence->assessmentItem?->control;
        $assessment = $evidence->assessmentItem?->assessment;
        $framework  = $assessment?->framework;

        // Log the loaded evidence record so we can debug file path issues
        Log::info('aiReview: evidence record loaded', [
            'evidence_id' => $evidence->id,
            'file_name'   => $evidence->file_name,
            'file_type'   => $evidence->file_type,
            'file_path'   => $evidence->file_path,
            'has_control' => $control !== null,
        ]);

        // Extract file content
        $extractor = new EvidenceFileExtractor();
        $extracted = $extractor->extract(
            $evidence->file_path ?? '',
            $evidence->file_type ?? 'application/octet-stream'
        );

        Log::info('aiReview: file extraction result', [
            'content_type' => $extracted['content_type'],
            'content_len'  => strlen($extracted['content']),
        ]);

        $evidenceData = [
            'control_title'       => $control?->title          ?? 'N/A',
            'control_description' => $control?->description    ?? 'N/A',
            'framework'           => $framework?->name         ?? 'N/A',
            'evidence_title'      => $evidence->title,
            'evidence_description'=> $evidence->description    ?? '',
            'file_name'           => $evidence->file_name,
            'file_type'           => $evidence->file_type,
            'upload_date'         => $evidence->created_at->toDateString(),
            'expiry_date'         => $evidence->expiry_date?->toDateString() ?? 'No expiry',
            'uploaded_by'         => $evidence->user?->name    ?? 'Unknown',
        ];

        try {
            $ai     = new AIService();
            $result = $ai->reviewEvidence($evidenceData, $extracted['content'], $extracted['content_type']);
        } catch (\Throwable $e) {
            Log::error('EvidenceController::aiReview failed', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'AI review failed. Please try again.'], 500);
        }

        $evidence->update([
            'ai_verdict'        => $result['verdict'],
            'ai_confidence'     => $result['confidence'],
            'ai_strengths'      => $result['strengths'],
            'ai_gaps'           => $result['gaps'],
            'ai_recommendation' => $result['recommendation'],
            'ai_reviewed_at'    => now(),
        ]);

        AuditLog::record(
            'ai_reviewed',
            'Evidence',
            $evidence->id,
            "AI reviewed evidence '{$evidence->title}' — verdict: {$result['verdict']}"
        );

        return response()->json($result);
    }
}