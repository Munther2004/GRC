<?php

namespace App\Http\Controllers;

use App\Actions\ApproveControlStatusRequest;
use App\Models\AuditLog;
use App\Models\Control;
use App\Models\ControlStatusRequest;
use App\Models\Evidence;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ControlStatusRequestController extends Controller
{
    // ── Approval Queue page (admin/auditor) ──────────────────────────────────

    public function index()
    {
        $user = Auth::user();

        // Phase 3 added control_status_requests.corporation_id, so we can
        // use the canonical organisationScope primitive instead of joining
        // through the requester. Same effect, simpler index plan.
        $base = $user->organisationScope(ControlStatusRequest::query())
            ->with(['control.framework', 'requester', 'evidence'])
            ->where('status', 'pending');

        $requests = $base
            ->latest()
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'control_id' => $r->control->control_id,
                'control_title' => $r->control->title,
                'framework' => $r->control->framework->short_name,
                'requested_by' => $r->requester->name,
                'current_status' => $r->current_status,
                'requested_status' => $r->requested_status,
                'justification' => $r->justification,
                'created_at' => $r->created_at->toDateTimeString(),
                'evidence' => $r->evidence ? [
                    'id' => $r->evidence->id,
                    'title' => $r->evidence->title,
                    'description' => $r->evidence->description,
                    'file_name' => $r->evidence->file_name,
                    'file_type' => $r->evidence->file_type ?? 'application/octet-stream',
                    // file_path used to leak storage paths to all reviewers.
                    // The UI calls evidence.download by id, so the path is
                    // never needed in the prop. Keep a safe boolean for
                    // "is there a file on disk" if/when a UI needs it.
                    'has_file' => ! empty($r->evidence->file_path),
                    'status' => $r->evidence->status,
                    'expiry_date' => $r->evidence->expiry_date,
                    'is_expired' => (bool) $r->evidence->is_expired,
                    'expires_soon' => (bool) $r->evidence->expires_soon,
                    'created_at' => $r->evidence->created_at->toDateTimeString(),
                    'ai_verdict' => $r->evidence->ai_verdict,
                    'ai_confidence' => $r->evidence->ai_confidence,
                    'ai_strengths' => $r->evidence->ai_strengths,
                    'ai_gaps' => $r->evidence->ai_gaps,
                    'ai_recommendation' => $r->evidence->ai_recommendation,
                    'ai_is_relevant' => $r->evidence->ai_is_relevant,
                    'ai_reviewed_at' => $r->evidence->ai_reviewed_at?->toDateTimeString(),
                    'ai_review' => null,
                    'user' => null,
                    'control' => null,
                    'assessment_item' => null,
                ] : null,
            ]);

        return Inertia::render('controls/approval-queue', [
            'requests' => $requests,
        ]);
    }

    // ── Submit a status change request (admin/user) ──────────────────────────

    public function store(Request $request, Control $control)
    {
        $request->validate([
            'new_status' => 'required|in:compliant,partially_compliant,non_compliant,not_applicable,not_set',
            'justification' => 'nullable|string|max:2000',
            'file' => 'nullable|file|max:10240|mimes:pdf,doc,docx,xls,xlsx,png,jpg,jpeg,txt',
            'evidence_title' => 'nullable|string|max:255',
            'evidence_description' => 'nullable|string',
        ]);

        $tenantId = Auth::user()?->corporation_id;

        // Block duplicate pending requests — scoped to the requester's tenant so
        // one corp can't observe another corp's pending request via this check.
        $dupQuery = ControlStatusRequest::where('control_id', $control->id)
            ->where('status', 'pending');
        if ($tenantId !== null) {
            $dupQuery->where('corporation_id', $tenantId);
        } else {
            $dupQuery->whereNull('corporation_id');
        }
        if ($dupQuery->exists()) {
            return response()->json([
                'error' => 'This control already has a pending status update request.',
            ], 422);
        }
        $statusRequest = ControlStatusRequest::create([
            'control_id' => $control->id,
            'requested_by' => Auth::id(),
            // Tenant-stamp at creation. Reviewers' tenant scope checks
            // depend on this field being populated.
            'corporation_id' => $tenantId,
            'requested_status' => $request->input('new_status'),
            // Snapshot the requester's tenant-scoped view of the control's
            // current status, not the global field.
            'current_status' => $control->statusForCorporation($tenantId),
            'justification' => $request->input('justification'),
            'status' => 'pending',
        ]);

        // Upload evidence and link it to this status request
        $uploadedEvidence = null;
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store("evidence/control-{$control->id}", config('filesystems.evidence_disk'));
            $uploadSha256 = @hash_file('sha256', $file->getRealPath()) ?: null;
            $uploadedEvidence = Evidence::create([
                'user_id' => Auth::id(),
                'control_id' => $control->id,
                'control_status_request_id' => $statusRequest->id,
                'title' => $request->input('evidence_title') ?: $file->getClientOriginalName(),
                'description' => $request->input('evidence_description'),
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getMimeType(),
                'upload_sha256' => $uploadSha256,
                'status' => 'pending',
            ]);

            AuditLog::record(
                'uploaded',
                'Evidence',
                $uploadedEvidence->id,
                "Evidence '{$uploadedEvidence->title}' uploaded for control '{$control->control_id}' with status change request #{$statusRequest->id}"
            );
        }

        // Notify reviewers — super_admin (platform-wide) plus admin/auditor
        // who share the requester's corporation.
        $requester = Auth::user();
        $reviewers = User::query()
            ->where(function ($q) use ($requester) {
                $q->where('role', User::ROLE_SUPER_ADMIN)
                    ->orWhere(function ($qq) use ($requester) {
                        $qq->whereIn('role', [User::ROLE_ADMIN, User::ROLE_AUDITOR]);
                        if ($requester->corporation_id) {
                            $qq->where('corporation_id', $requester->corporation_id);
                        } else {
                            // Requester has no corporation: only super_admins should hear about it.
                            $qq->whereRaw('1 = 0');
                        }
                    });
            })
            ->get();
        foreach ($reviewers as $reviewer) {
            Notification::create([
                'user_id' => $reviewer->id,
                'type' => 'status_request_pending',
                'title' => 'Control Status Update Requested',
                'message' => Auth::user()->name." requested to change '{$control->control_id}' to ".
                             $this->formatStatus($request->input('new_status')),
                'url' => '/controls/approvals',
                'is_read' => false,
            ]);
        }

        AuditLog::record(
            'created',
            'ControlStatusRequest',
            $statusRequest->id,
            "Status update request submitted for '{$control->control_id}' → ".
            $this->formatStatus($request->input('new_status')).
            ($request->input('justification') ? " — {$request->input('justification')}" : '')
        );

        return response()->json([
            'success' => true,
            'pending_request' => [
                'id' => $statusRequest->id,
                'requested_status' => $statusRequest->requested_status,
                'requested_by' => Auth::user()->name,
                'created_at' => $statusRequest->created_at->toDateTimeString(),
            ],
            'evidence_uploaded' => $uploadedEvidence ? [
                'id' => $uploadedEvidence->id,
                'title' => $uploadedEvidence->title,
                'file_name' => $uploadedEvidence->file_name,
            ] : null,
        ]);
    }

    // ── Approve a request (admin/auditor) ────────────────────────────────────

    public function approve(Request $request, ControlStatusRequest $statusRequest)
    {
        $this->authorizeStatusRequestAccess($statusRequest);

        $request->validate(['notes' => 'nullable|string|max:2000']);

        if ($statusRequest->status !== 'pending') {
            return response()->json(['error' => 'This request is no longer pending.'], 422);
        }

        (new ApproveControlStatusRequest)->execute($statusRequest, $request->notes ?? '');

        $control = $statusRequest->control;

        if ($statusRequest->evidence) {
            $statusRequest->evidence->update(['status' => 'approved']);
        }

        $statusRequest->update([
            'status' => 'approved',
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
            'notes' => $request->notes,
        ]);

        Notification::create([
            'user_id' => $statusRequest->requested_by,
            'type' => 'status_request_approved',
            'title' => 'Status Update Approved',
            'message' => "Your request to change '{$control->control_id}' to ".
                         $this->formatStatus($statusRequest->requested_status).
                         ' was approved by '.Auth::user()->name.
                         ($request->notes ? ". Note: {$request->notes}" : '.'),
            'url' => '/controls/hub',
            'is_read' => false,
        ]);

        AuditLog::record(
            'approved',
            'ControlStatusRequest',
            $statusRequest->id,
            "'{$control->control_id}' status change to ".
            $this->formatStatus($statusRequest->requested_status).
            ' approved by '.Auth::user()->name
        );

        return response()->json(['success' => true]);
    }

    // ── Reject a request (admin/auditor) ─────────────────────────────────────

    public function reject(Request $request, ControlStatusRequest $statusRequest)
    {
        $this->authorizeStatusRequestAccess($statusRequest);

        $request->validate(['notes' => 'nullable|string|max:2000']);

        if ($statusRequest->status !== 'pending') {
            return response()->json(['error' => 'This request is no longer pending.'], 422);
        }

        $control = $statusRequest->control;

        // Reject linked evidence (if any)
        if ($statusRequest->evidence) {
            $statusRequest->evidence->update(['status' => 'rejected']);
        }

        $statusRequest->update([
            'status' => 'rejected',
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
            'notes' => $request->notes,
        ]);

        // Notify the requester
        Notification::create([
            'user_id' => $statusRequest->requested_by,
            'type' => 'status_request_rejected',
            'title' => 'Status Update Rejected',
            'message' => "Your request to change '{$control->control_id}' to ".
                         $this->formatStatus($statusRequest->requested_status).
                         ' was rejected by '.Auth::user()->name.
                         ($request->notes ? ". Reason: {$request->notes}" : '.'),
            'url' => '/controls/hub',
            'is_read' => false,
        ]);

        $evidenceNote = $statusRequest->evidence ? ' — evidence rejected' : '';
        AuditLog::record(
            'rejected',
            'ControlStatusRequest',
            $statusRequest->id,
            "'{$control->control_id}' status change to ".
            $this->formatStatus($statusRequest->requested_status).
            ' rejected by '.Auth::user()->name.
            ($request->notes ? " — {$request->notes}" : '').
            $evidenceNote
        );

        return response()->json(['success' => true]);
    }

    // ── Review evidence (admin/auditor) ──────────────────────────────────────

    public function reviewEvidence(Request $request, ControlStatusRequest $statusRequest)
    {
        $this->authorizeStatusRequestAccess($statusRequest);

        $request->validate([
            'decision' => 'required|in:accept,reject',
            'notes' => 'nullable|string|max:2000',
        ]);

        if ($statusRequest->status !== 'pending') {
            return response()->json(['error' => 'This request is no longer pending.'], 422);
        }

        if (! $statusRequest->evidence) {
            return response()->json(['error' => 'This request has no attached evidence.'], 422);
        }

        $control = $statusRequest->control;

        if ($request->decision === 'accept') {
            // Accept evidence → approve the status change via shared domain logic
            (new ApproveControlStatusRequest)->execute($statusRequest, $request->notes ?? '');

            $statusRequest->evidence->update(['status' => 'approved']);

            $statusRequest->update([
                'status' => 'approved',
                'reviewed_by' => Auth::id(),
                'reviewed_at' => now(),
                'notes' => $request->notes,
            ]);

            Notification::create([
                'user_id' => $statusRequest->requested_by,
                'type' => 'status_request_approved',
                'title' => 'Status Update Approved',
                'message' => "Your request to change '{$control->control_id}' to ".
                             $this->formatStatus($statusRequest->requested_status).
                             ' was approved by '.Auth::user()->name.
                             ' — evidence accepted'.
                             ($request->notes ? ". Note: {$request->notes}" : '.'),
                'url' => '/controls/hub',
                'is_read' => false,
            ]);

            AuditLog::record(
                'approved',
                'ControlStatusRequest',
                $statusRequest->id,
                "'{$control->control_id}' status change to ".
                $this->formatStatus($statusRequest->requested_status).
                ' approved by '.Auth::user()->name.' — evidence accepted'
            );
        } else {
            // Reject evidence → reject the request, do NOT change control status
            $statusRequest->evidence->update(['status' => 'rejected']);

            $statusRequest->update([
                'status' => 'rejected',
                'reviewed_by' => Auth::id(),
                'reviewed_at' => now(),
                'notes' => $request->notes,
            ]);

            Notification::create([
                'user_id' => $statusRequest->requested_by,
                'type' => 'status_request_rejected',
                'title' => 'Status Update Rejected',
                'message' => "Your request to change '{$control->control_id}' to ".
                             $this->formatStatus($statusRequest->requested_status).
                             ' was rejected by '.Auth::user()->name.
                             ' — evidence rejected'.
                             ($request->notes ? ". Reason: {$request->notes}" : '.'),
                'url' => '/controls/hub',
                'is_read' => false,
            ]);

            AuditLog::record(
                'rejected',
                'ControlStatusRequest',
                $statusRequest->id,
                'Status request rejected — evidence rejected by '.Auth::user()->name.
                " for '{$control->control_id}'".
                ($request->notes ? " — {$request->notes}" : '')
            );
        }

        return response()->json(['success' => true]);
    }

    // ── Helper ───────────────────────────────────────────────────────────────

    /**
     * Refuse the request unless the authenticated reviewer is in the
     * status request's tenant. super_admin always passes. Backed by
     * control_status_requests.corporation_id (Phase 3 migration), with a
     * fallback to the requester's corporation for legacy rows.
     */
    private function authorizeStatusRequestAccess(ControlStatusRequest $statusRequest): void
    {
        $user = Auth::user();
        if (! $user) {
            abort(403);
        }
        if ($user->isSuperAdmin()) {
            return;
        }

        $reqCorpId = $statusRequest->corporation_id
            ?? $statusRequest->requester?->corporation_id;

        if ($reqCorpId === null
            || (int) $reqCorpId !== (int) $user->corporation_id
        ) {
            abort(403);
        }
    }

    private function formatStatus(string $status): string
    {
        return match ($status) {
            'compliant' => 'Compliant',
            'partially_compliant' => 'Partially Compliant',
            'non_compliant' => 'Non-Compliant',
            'not_applicable' => 'Not Applicable',
            'not_set' => 'Not Set',
            default => $status,
        };
    }
}
