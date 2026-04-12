<?php

namespace App\Http\Controllers;

use App\Models\Control;
use App\Models\Framework;
use App\Services\GrcMetricsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ControlHubController extends Controller
{
    public function index(Request $request)
    {
        $query = Control::with([
            'framework',
            'risks',
            'statusHistory'  => fn ($q) => $q->with('user')->limit(1),
            'assessmentItems.evidence',
            'directEvidence',
            'statusRequests' => fn ($q) => $q->where('status', 'pending')->with('requester')->limit(1),
        ])
        ->where('is_active', true)
        // Hide controls with no status, no risks, and no evidence
        ->where(function ($q) {
            $q->whereNotNull('current_status')
              ->orWhereHas('risks')
              ->orWhereHas('assessmentItems', fn ($aq) => $aq->whereHas('evidence'));
        })
        ->when($request->search, fn ($q) =>
            $q->where('title', 'like', "%{$request->search}%")
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
        ->when($request->framework && $request->framework !== 'all', fn ($q) =>
            $q->where('framework_id', $request->framework)
        )
        ->orderBy('framework_id')
        ->orderBy('control_id')
        ->paginate(20)
        ->withQueryString();

        $query->through(fn ($control) => $this->mapControl($control));

        $frameworks = Framework::where('is_active', true)
            ->orderBy('short_name')
            ->get(['id', 'short_name', 'name']);

        // Summary stats (unfiltered) — one SQL aggregate query via service
        $cs = (new GrcMetricsService())->complianceSummary();
        $total              = $cs['total_active'];
        $compliant          = $cs['compliant'];
        $partiallyCompliant = $cs['partial'];
        $nonCompliant       = $cs['non_compliant'];
        $notApplicable      = $cs['not_applicable'];
        $notSet             = $cs['not_set'];
        $compliancePct      = (int) $cs['overall_pct'];

        return Inertia::render('controls/hub', [
            'controls'  => $query,
            'frameworks'=> $frameworks,
            'filters'   => $request->only(['search', 'status', 'framework']),
            'stats'     => compact('total', 'compliant', 'partiallyCompliant', 'nonCompliant', 'notApplicable', 'notSet', 'compliancePct'),
        ]);
    }

    public function history(Control $control)
    {
        $entries = ControlStatusHistory::with('user')
            ->where('control_id', $control->id)
            ->latest()
            ->get()
            ->map(fn ($h) => [
                'id'         => $h->id,
                'old_status' => $h->old_status,
                'new_status' => $h->new_status,
                'notes'      => $h->notes,
                'user_name'  => $h->user?->name ?? 'System',
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
                'id'          => $e->id,
                'title'       => $e->title,
                'file_name'   => $e->file_name,
                'status'      => $e->status,
                'is_expired'  => $e->is_expired,
                'expires_soon'=> $e->expires_soon,
                'expiry_date' => $e->expiry_date?->toDateString(),
                'ai_verdict'  => $e->ai_verdict,
            ])
            ->values();

        $hasWeakEvidence = $linkedEvidence->contains(fn ($e) => $e['ai_verdict'] === 'Insufficient');

        $latestHistory  = $control->statusHistory->first();
        $pendingRequest = $control->statusRequests->first();

        return [
            'id'                  => $control->id,
            'control_id'          => $control->control_id,
            'title'               => $control->title,
            'description'         => $control->description,
            'category'            => $control->category,
            'current_status'      => $control->current_status,
            'last_remediated_at'  => $control->last_remediated_at?->toDateTimeString(),
            'remediation_notes'   => $control->remediation_notes,
            'framework'           => [
                'id'         => $control->framework->id,
                'short_name' => $control->framework->short_name,
            ],
            'risks_count'         => $control->risks->count(),
            'highest_risk_level'  => $this->highestRiskLevel($control->risks),
            'evidence_status'     => $evidenceStatus,
            'has_weak_evidence'   => $hasWeakEvidence,
            'linked_evidence'     => $linkedEvidence,
            'latest_history'  => $latestHistory ? [
                'user_name'  => $latestHistory->user?->name ?? 'System',
                'created_at' => $latestHistory->created_at->toDateTimeString(),
                'new_status' => $latestHistory->new_status,
            ] : null,
            'pending_request' => $pendingRequest ? [
                'id'               => $pendingRequest->id,
                'requested_status' => $pendingRequest->requested_status,
                'requested_by'     => $pendingRequest->requester->name,
                'created_at'       => $pendingRequest->created_at->toDateTimeString(),
            ] : null,
        ];
    }

    private function getEvidenceStatus(Control $control): string
    {
        $evidence = $control->assessmentItems->flatMap->evidence
            ->concat($control->directEvidence ?? collect())
            ->unique('id');

        if ($evidence->isEmpty()) return 'none';

        $hasApprovedValid   = $evidence->contains(fn ($e) => !$e->is_expired && $e->status === 'approved');
        $hasExpiringSoon    = $evidence->contains(fn ($e) => $e->expires_soon && !$e->is_expired);
        $hasExpired         = $evidence->contains(fn ($e) => $e->is_expired);

        if ($hasApprovedValid && $hasExpiringSoon) return 'expiring';
        if ($hasApprovedValid) return 'valid';
        if ($hasExpired) return 'expired';

        return 'none';
    }

    private function highestRiskLevel($risks): ?string
    {
        if ($risks->isEmpty()) return null;

        foreach (['critical', 'high', 'medium', 'low'] as $level) {
            if ($risks->contains(fn ($r) => $r->risk_level === $level)) return $level;
        }

        return 'low';
    }
}
