<?php

namespace App\Http\Controllers;

use App\Models\Control;
use App\Models\ControlStatusHistory;
use App\Models\Framework;
use App\Services\GrcMetricsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ControlHubController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $tenantId = $user->isSuperAdmin() ? null : $user->corporation_id;

        // Resolve effective control status from the per-tenant pivot when the
        // viewer is tenant-scoped, otherwise read the legacy global field.
        $statusExpr = $tenantId !== null
            ? 'COALESCE(ccs.current_status, controls.current_status)'
            : 'controls.current_status';

        $query = Control::with([
            'framework',
            'risks',
            'statusHistory' => fn ($q) => $q->with('user')->limit(1),
            'assessmentItems.evidence',
            'directEvidence',
            'statusRequests' => fn ($q) => $q->where('status', 'pending')->with('requester')->limit(1),
            'corporationStatuses' => fn ($q) => $tenantId !== null
                ? $q->where('corporation_id', $tenantId)
                : $q,
        ])
            ->select('controls.*')
            ->where('controls.is_active', true);

        if ($tenantId !== null) {
            $query->leftJoin('corporation_control_statuses as ccs', function ($join) use ($tenantId) {
                $join->on('ccs.control_id', '=', 'controls.id')
                    ->where('ccs.corporation_id', '=', $tenantId);
            });
        }

        // Hide controls with no status, no risks, and no evidence
        $query->where(function ($q) use ($statusExpr) {
            $q->whereRaw("{$statusExpr} IS NOT NULL")
                ->orWhereHas('risks')
                ->orWhereHas('assessmentItems', fn ($aq) => $aq->whereHas('evidence'));
        })
            ->when($request->search, fn ($q) => $q->where(function ($qq) use ($request) {
                $qq->where('controls.title', 'like', "%{$request->search}%")
                    ->orWhere('controls.control_id', 'like', "%{$request->search}%")
                    ->orWhere('controls.description', 'like', "%{$request->search}%");
            }))
            ->when($request->status && $request->status !== 'all', function ($q) use ($request, $statusExpr) {
                if ($request->status === 'not_set') {
                    $q->whereRaw("{$statusExpr} IS NULL");
                } else {
                    $q->whereRaw("{$statusExpr} = ?", [$request->status]);
                }
            })
            ->when($request->framework && $request->framework !== 'all', fn ($q) => $q->where('controls.framework_id', $request->framework)
            )
            ->orderBy('controls.framework_id')
            ->orderBy('controls.control_id');

        $page = $query->paginate(20)->withQueryString();
        $page->through(fn ($control) => $this->mapControl($control, $tenantId));

        $frameworks = Framework::where('is_active', true)
            ->orderBy('short_name')
            ->get(['id', 'short_name', 'name']);

        // Summary stats (unfiltered) — service resolves the per-tenant pivot
        $cs = (new GrcMetricsService($user))->complianceSummary();
        $total = $cs['total_active'];
        $compliant = $cs['compliant'];
        $partiallyCompliant = $cs['partial'];
        $nonCompliant = $cs['non_compliant'];
        $notApplicable = $cs['not_applicable'];
        $notSet = $cs['not_set'];
        $compliancePct = (int) $cs['overall_pct'];

        return Inertia::render('controls/hub', [
            'controls' => $page,
            'frameworks' => $frameworks,
            'filters' => $request->only(['search', 'status', 'framework']),
            'stats' => compact('total', 'compliant', 'partiallyCompliant', 'nonCompliant', 'notApplicable', 'notSet', 'compliancePct'),
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

    private function mapControl(Control $control, ?int $tenantId = null): array
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
                'ai_verdict' => $e->ai_verdict,
            ])
            ->values();

        $hasWeakEvidence = $linkedEvidence->contains(fn ($e) => $e['ai_verdict'] === 'Insufficient');

        $latestHistory = $control->statusHistory->first();
        $pendingRequest = $control->statusRequests->first();

        $tenantStatus = $control->corporationStatuses->first();
        $effectiveStatus = $tenantId !== null
            ? ($tenantStatus?->current_status ?? $control->current_status)
            : $control->current_status;
        $effectiveLastRemediated = $tenantId !== null
            ? ($tenantStatus?->last_remediated_at ?? $control->last_remediated_at)
            : $control->last_remediated_at;
        $effectiveRemediationNotes = $tenantId !== null
            ? ($tenantStatus?->remediation_notes ?? $control->remediation_notes)
            : $control->remediation_notes;

        return [
            'id' => $control->id,
            'control_id' => $control->control_id,
            'title' => $control->title,
            'description' => $control->description,
            'category' => $control->category,
            'current_status' => $effectiveStatus,
            'last_remediated_at' => $effectiveLastRemediated?->toDateTimeString(),
            'remediation_notes' => $effectiveRemediationNotes,
            'framework' => [
                'id' => $control->framework->id,
                'short_name' => $control->framework->short_name,
            ],
            'risks_count' => $control->risks->count(),
            'highest_risk_level' => $this->highestRiskLevel($control->risks),
            'evidence_status' => $evidenceStatus,
            'has_weak_evidence' => $hasWeakEvidence,
            'linked_evidence' => $linkedEvidence,
            'latest_history' => $latestHistory ? [
                'user_name' => $latestHistory->user?->name ?? 'System',
                'created_at' => $latestHistory->created_at->toDateTimeString(),
                'new_status' => $latestHistory->new_status,
            ] : null,
            'pending_request' => $pendingRequest ? [
                'id' => $pendingRequest->id,
                'requested_status' => $pendingRequest->requested_status,
                'requested_by' => $pendingRequest->requester->name,
                'created_at' => $pendingRequest->created_at->toDateTimeString(),
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
