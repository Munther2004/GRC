<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Control;
use App\Models\ControlStatusHistory;
use App\Models\Evidence;
use App\Models\Framework;
use App\Services\RulesEngine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ControlHubController extends Controller
{
    public function index(Request $request)
    {
        $query = Control::with([
            'framework',
            'risks',
            'statusHistory' => fn ($q) => $q->with('user')->limit(1),
            'assessmentItems.evidence',
            'directEvidence',
        ])
            ->where('is_active', true)
        // Hide controls with no status, no risks, and no evidence
            ->where(function ($q) {
                $q->whereNotNull('current_status')
                    ->orWhereHas('risks')
                    ->orWhereHas('assessmentItems', fn ($aq) => $aq->whereHas('evidence'));
            })
            ->when($request->search, fn ($q) => $q->where('title', 'like', "%{$request->search}%")
                ->orWhere('control_id', 'like', "%{$request->search}%")
                ->orWhere('description', 'like', "%{$request->search}%")
            )
            ->when($request->status && $request->status !== 'all', function ($q) use ($request) {
                if ($request->status === 'not_set') {
                    $q->whereNull('current_status');
                } else {
                    $q->where('current_status', $request->status);
                }
            })
            ->when($request->framework && $request->framework !== 'all', fn ($q) => $q->where('framework_id', $request->framework)
            )
            ->orderBy('framework_id')
            ->orderBy('control_id')
            ->paginate(20)
            ->withQueryString();

        $query->through(fn ($control) => $this->mapControl($control));

        $frameworks = Framework::where('is_active', true)
            ->orderBy('short_name')
            ->get(['id', 'short_name', 'name']);

        // Summary stats (unfiltered)
        $allActive = Control::where('is_active', true);
        $total = (clone $allActive)->count();
        $compliant = (clone $allActive)->where('current_status', 'compliant')->count();
        $partiallyCompliant = (clone $allActive)->where('current_status', 'partially_compliant')->count();
        $nonCompliant = (clone $allActive)->where('current_status', 'non_compliant')->count();
        $notApplicable = (clone $allActive)->where('current_status', 'not_applicable')->count();
        $notSet = $total - $compliant - $partiallyCompliant - $nonCompliant - $notApplicable;
        // Partial counts as 0.5 toward compliance
        $compliancePct = $total > 0 ? round((($compliant + ($partiallyCompliant * 0.5)) / $total) * 100) : 0;

        return Inertia::render('controls/hub', [
            'controls' => $query,
            'frameworks' => $frameworks,
            'filters' => $request->only(['search', 'status', 'framework']),
            'stats' => compact('total', 'compliant', 'partiallyCompliant', 'nonCompliant', 'notApplicable', 'notSet', 'compliancePct'),
        ]);
    }

    public function updateStatus(Request $request, Control $control)
    {
        $validated = $request->validate([
            'new_status' => 'required|in:compliant,partially_compliant,non_compliant,not_applicable',
            'notes' => 'nullable|string|max:2000',
            'evidence_id' => 'nullable|exists:evidence,id',
            'file' => 'nullable|file|max:10240|mimes:pdf,doc,docx,xls,xlsx,png,jpg,jpeg,txt',
            'evidence_title' => 'nullable|string|max:255',
            'evidence_description' => 'nullable|string',
        ]);

        $oldStatus = $control->current_status;

        $control->update([
            'current_status' => $validated['new_status'],
            'last_remediated_at' => now(),
            'remediation_notes' => $validated['notes'] ?? $control->remediation_notes,
        ]);

        // Handle optional evidence file upload
        $evidenceId = $validated['evidence_id'] ?? null;
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store("evidence/control-{$control->id}", 'public');
            $uploadedEvidence = Evidence::create([
                'user_id' => Auth::id(),
                'control_id' => $control->id,
                'title' => $request->input('evidence_title') ?: $file->getClientOriginalName(),
                'description' => $request->input('evidence_description'),
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getMimeType(),
                'status' => 'pending',
            ]);
            $evidenceId = $uploadedEvidence->id;

            AuditLog::record(
                'uploaded',
                'Evidence',
                $control->id,
                "Evidence '{$uploadedEvidence->title}' uploaded for control '{$control->control_id}' via Controls Hub"
            );
        }

        $history = ControlStatusHistory::create([
            'control_id' => $control->id,
            'user_id' => Auth::id(),
            'old_status' => $oldStatus,
            'new_status' => $validated['new_status'],
            'notes' => $validated['notes'] ?? null,
            'evidence_id' => $evidenceId,
        ]);

        // Fire rules engine — partially_compliant is middle ground; no rule triggered
        $engine = new RulesEngine;
        $control->load('risks');

        if ($validated['new_status'] === 'non_compliant') {
            $engine->applyRule1ForControl($control);
        } elseif ($validated['new_status'] === 'compliant') {
            $engine->applyRule2ForControl($control, $oldStatus ?? '');
        }

        AuditLog::record(
            'updated',
            'Control',
            $control->id,
            "Controls Hub: '{$control->control_id}' status changed from ".
            ($oldStatus ?? 'not set')." to {$validated['new_status']}".
            ($validated['notes'] ? " — {$validated['notes']}" : '')
        );

        return response()->json([
            'success' => true,
            'current_status' => $control->current_status,
            'last_remediated_at' => $control->last_remediated_at->toDateTimeString(),
            'evidence_uploaded' => isset($uploadedEvidence) ? [
                'id' => $uploadedEvidence->id,
                'title' => $uploadedEvidence->title,
                'file_name' => $uploadedEvidence->file_name,
            ] : null,
            'history_entry' => [
                'id' => $history->id,
                'old_status' => $history->old_status,
                'new_status' => $history->new_status,
                'notes' => $history->notes,
                'user_name' => Auth::user()->name,
                'created_at' => $history->created_at->toDateTimeString(),
            ],
        ]);
    }

    public function history(Control $control)
    {
        $entries = ControlStatusHistory::with('user')
            ->where('control_id', $control->id)
            ->latest()
            ->get()
            ->map(fn ($h) => [
                'id' => $h->id,
                'old_status' => $h->old_status,
                'new_status' => $h->new_status,
                'notes' => $h->notes,
                'user_name' => $h->user?->name ?? 'System',
                'created_at' => $h->created_at->toDateTimeString(),
            ]);

        return response()->json($entries);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private function mapControl(Control $control): array
    {
        $evidenceStatus = $this->getEvidenceStatus($control);

        $linkedEvidence = $control->assessmentItems
            ->flatMap->evidence
            ->concat($control->directEvidence ?? collect())
            ->unique('id')
            ->map(fn ($e) => [
                'id' => $e->id,
                'title' => $e->title,
                'file_name' => $e->file_name,
                'status' => $e->status,
                'is_expired' => $e->is_expired,
                'expires_soon' => $e->expires_soon,
                'expiry_date' => $e->expiry_date?->toDateString(),
            ])
            ->values();

        $latestHistory = $control->statusHistory->first();

        return [
            'id' => $control->id,
            'control_id' => $control->control_id,
            'title' => $control->title,
            'description' => $control->description,
            'category' => $control->category,
            'current_status' => $control->current_status,
            'last_remediated_at' => $control->last_remediated_at?->toDateTimeString(),
            'remediation_notes' => $control->remediation_notes,
            'framework' => [
                'id' => $control->framework->id,
                'short_name' => $control->framework->short_name,
            ],
            'risks_count' => $control->risks->count(),
            'highest_risk_level' => $this->highestRiskLevel($control->risks),
            'evidence_status' => $evidenceStatus,
            'linked_evidence' => $linkedEvidence,
            'latest_history' => $latestHistory ? [
                'user_name' => $latestHistory->user?->name ?? 'System',
                'created_at' => $latestHistory->created_at->toDateTimeString(),
                'new_status' => $latestHistory->new_status,
            ] : null,
        ];
    }

    private function getEvidenceStatus(Control $control): string
    {
        $evidence = $control->assessmentItems->flatMap->evidence
            ->concat($control->directEvidence ?? collect())
            ->unique('id');

        if ($evidence->isEmpty()) {
            return 'none';
        }

        $hasApprovedValid = $evidence->contains(fn ($e) => ! $e->is_expired && $e->status === 'approved');
        $hasExpiringSoon = $evidence->contains(fn ($e) => $e->expires_soon && ! $e->is_expired);
        $hasExpired = $evidence->contains(fn ($e) => $e->is_expired);

        if ($hasApprovedValid && $hasExpiringSoon) {
            return 'expiring';
        }
        if ($hasApprovedValid) {
            return 'valid';
        }
        if ($hasExpired) {
            return 'expired';
        }

        return 'none';
    }

    private function highestRiskLevel($risks): ?string
    {
        if ($risks->isEmpty()) {
            return null;
        }

        foreach (['critical', 'high', 'medium', 'low'] as $level) {
            if ($risks->contains(fn ($r) => $r->risk_level === $level)) {
                return $level;
            }
        }

        return 'low';
    }
}
