<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Control;
use App\Models\ControlStatusHistory;
use App\Models\ControlStatusRequest;
use App\Models\Evidence;
use App\Models\Notification;
use App\Models\Risk;
use App\Models\User;
use App\Services\RulesEngine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ControlStatusRequestController extends Controller
{
    // ── Approval Queue page (admin/auditor) ──────────────────────────────────

    public function index()
    {
        $requests = ControlStatusRequest::with(['control.framework', 'requester', 'evidence'])
            ->where('status', 'pending')
            ->latest()
            ->get()
            ->map(fn ($r) => [
                'id'               => $r->id,
                'control_id'       => $r->control->control_id,
                'control_title'    => $r->control->title,
                'framework'        => $r->control->framework->short_name,
                'requested_by'     => $r->requester->name,
                'current_status'   => $r->current_status,
                'requested_status' => $r->requested_status,
                'justification'    => $r->justification,
                'created_at'       => $r->created_at->toDateTimeString(),
                'evidence'         => $r->evidence ? [
                    'id'               => $r->evidence->id,
                    'title'            => $r->evidence->title,
                    'description'      => $r->evidence->description,
                    'file_name'        => $r->evidence->file_name,
                    'file_type'        => $r->evidence->file_type ?? 'application/octet-stream',
                    'file_path'        => $r->evidence->file_path,
                    'status'           => $r->evidence->status,
                    'expiry_date'      => $r->evidence->expiry_date,
                    'is_expired'       => (bool) $r->evidence->is_expired,
                    'expires_soon'     => (bool) $r->evidence->expires_soon,
                    'created_at'       => $r->evidence->created_at->toDateTimeString(),
                    'ai_verdict'       => $r->evidence->ai_verdict,
                    'ai_confidence'    => $r->evidence->ai_confidence,
                    'ai_strengths'     => $r->evidence->ai_strengths,
                    'ai_gaps'          => $r->evidence->ai_gaps,
                    'ai_recommendation'=> $r->evidence->ai_recommendation,
                    'ai_is_relevant'   => $r->evidence->ai_is_relevant,
                    'ai_reviewed_at'   => $r->evidence->ai_reviewed_at?->toDateTimeString(),
                    'ai_review'        => null,
                    'user'             => null,
                    'control'          => null,
                    'assessment_item'  => null,
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
            'new_status'           => 'required|in:compliant,partially_compliant,non_compliant,not_applicable,not_set',
            'justification'        => 'nullable|string|max:2000',
            'file'                 => 'nullable|file|max:10240|mimes:pdf,doc,docx,xls,xlsx,png,jpg,jpeg,txt',
            'evidence_title'       => 'nullable|string|max:255',
            'evidence_description' => 'nullable|string',
        ]);

        // Block duplicate pending requests
        if (ControlStatusRequest::where('control_id', $control->id)->where('status', 'pending')->exists()) {
            return response()->json([
                'error' => 'This control already has a pending status update request.',
            ], 422);
        }

        $statusRequest = ControlStatusRequest::create([
            'control_id'       => $control->id,
            'requested_by'     => Auth::id(),
            'requested_status' => $request->input('new_status'),
            'current_status'   => $control->current_status,
            'justification'    => $request->input('justification'),
            'status'           => 'pending',
        ]);

        // Upload evidence and link it to this status request
        $uploadedEvidence = null;
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store("evidence/control-{$control->id}", 'public');
            $uploadedEvidence = Evidence::create([
                'user_id'                    => Auth::id(),
                'control_id'                 => $control->id,
                'control_status_request_id'  => $statusRequest->id,
                'title'                      => $request->input('evidence_title') ?: $file->getClientOriginalName(),
                'description'                => $request->input('evidence_description'),
                'file_path'                  => $path,
                'file_name'                  => $file->getClientOriginalName(),
                'file_type'                  => $file->getMimeType(),
                'status'                     => 'pending',
            ]);

            AuditLog::record(
                'uploaded',
                'Evidence',
                $uploadedEvidence->id,
                "Evidence '{$uploadedEvidence->title}' uploaded for control '{$control->control_id}' with status change request #{$statusRequest->id}"
            );
        }

        // Notify all admins and auditors
        $reviewers = User::whereIn('role', ['admin', 'auditor'])->get();
        foreach ($reviewers as $reviewer) {
            Notification::create([
                'user_id' => $reviewer->id,
                'type'    => 'status_request_pending',
                'title'   => 'Control Status Update Requested',
                'message' => Auth::user()->name . " requested to change '{$control->control_id}' to " .
                             $this->formatStatus($request->input('new_status')),
                'url'     => '/controls/approvals',
                'is_read' => false,
            ]);
        }

        AuditLog::record(
            'created',
            'ControlStatusRequest',
            $statusRequest->id,
            "Status update request submitted for '{$control->control_id}' → " .
            $this->formatStatus($request->input('new_status')) .
            ($request->input('justification') ? " — {$request->input('justification')}" : '')
        );

        return response()->json([
            'success'          => true,
            'pending_request'  => [
                'id'               => $statusRequest->id,
                'requested_status' => $statusRequest->requested_status,
                'requested_by'     => Auth::user()->name,
                'created_at'       => $statusRequest->created_at->toDateTimeString(),
            ],
            'evidence_uploaded' => $uploadedEvidence ? [
                'id'        => $uploadedEvidence->id,
                'title'     => $uploadedEvidence->title,
                'file_name' => $uploadedEvidence->file_name,
            ] : null,
        ]);
    }

    // ── Approve a request (admin/auditor) ────────────────────────────────────

    public function approve(Request $request, ControlStatusRequest $statusRequest)
    {
        $request->validate(['notes' => 'nullable|string|max:2000']);

        if ($statusRequest->status !== 'pending') {
            return response()->json(['error' => 'This request is no longer pending.'], 422);
        }

        $control   = $statusRequest->control;
        $oldStatus = $control->current_status;
        $newStatus = $statusRequest->requested_status === 'not_set'
            ? null
            : $statusRequest->requested_status;

        $control->update([
            'current_status'     => $newStatus,
            'last_remediated_at' => now(),
            'remediation_notes'  => $statusRequest->justification ?? $control->remediation_notes,
        ]);

        ControlStatusHistory::create([
            'control_id' => $control->id,
            'user_id'    => Auth::id(),
            'old_status' => $oldStatus,
            'new_status' => $newStatus ?? 'not_set',
            'notes'      => trim(implode(' — ', array_filter([
                $statusRequest->justification,
                $request->notes ? "Reviewer: {$request->notes}" : null,
            ]))),
        ]);

        // Fire rules engine
        $engine = new RulesEngine();
        $control->load('risks');

        if ($newStatus === 'non_compliant') {
            $engine->applyRule1ForControl($control);
        } elseif ($newStatus === 'compliant') {
            $engine->applyRule2ForControl($control, $oldStatus ?? '');

            // Delete AI-generated risks linked to this control
            $aiRisks = $control->risks()->where('auto_generated', true)->get();
            $removedCount = $aiRisks->count();
            foreach ($aiRisks as $risk) {
                $risk->controls()->detach();
                $risk->delete();
            }
            if ($removedCount > 0) {
                AuditLog::record(
                    'deleted', 'Control', $control->id,
                    "Control '{$control->control_id}' marked Compliant — {$removedCount} AI-generated risk" .
                    ($removedCount !== 1 ? 's' : '') . " removed"
                );
            }
        }

        // Approve linked evidence (if any)
        if ($statusRequest->evidence) {
            $statusRequest->evidence->update(['status' => 'approved']);
        }

        $statusRequest->update([
            'status'      => 'approved',
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
            'notes'       => $request->notes,
        ]);

        // Notify the requester
        Notification::create([
            'user_id' => $statusRequest->requested_by,
            'type'    => 'status_request_approved',
            'title'   => 'Status Update Approved',
            'message' => "Your request to change '{$control->control_id}' to " .
                         $this->formatStatus($statusRequest->requested_status) .
                         " was approved by " . Auth::user()->name .
                         ($request->notes ? ". Note: {$request->notes}" : '.'),
            'url'     => '/controls/hub',
            'is_read' => false,
        ]);

        AuditLog::record(
            'approved',
            'ControlStatusRequest',
            $statusRequest->id,
            "'{$control->control_id}' status change to " .
            $this->formatStatus($statusRequest->requested_status) .
            " approved by " . Auth::user()->name
        );

        return response()->json(['success' => true]);
    }

    // ── Reject a request (admin/auditor) ─────────────────────────────────────

    public function reject(Request $request, ControlStatusRequest $statusRequest)
    {
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
            'status'      => 'rejected',
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
            'notes'       => $request->notes,
        ]);

        // Notify the requester
        Notification::create([
            'user_id' => $statusRequest->requested_by,
            'type'    => 'status_request_rejected',
            'title'   => 'Status Update Rejected',
            'message' => "Your request to change '{$control->control_id}' to " .
                         $this->formatStatus($statusRequest->requested_status) .
                         " was rejected by " . Auth::user()->name .
                         ($request->notes ? ". Reason: {$request->notes}" : '.'),
            'url'     => '/controls/hub',
            'is_read' => false,
        ]);

        $evidenceNote = $statusRequest->evidence ? ' — evidence rejected' : '';
        AuditLog::record(
            'rejected',
            'ControlStatusRequest',
            $statusRequest->id,
            "'{$control->control_id}' status change to " .
            $this->formatStatus($statusRequest->requested_status) .
            " rejected by " . Auth::user()->name .
            ($request->notes ? " — {$request->notes}" : '') .
            $evidenceNote
        );

        return response()->json(['success' => true]);
    }

    // ── Review evidence (admin/auditor) ──────────────────────────────────────

    public function reviewEvidence(Request $request, ControlStatusRequest $statusRequest)
    {
        $request->validate([
            'decision' => 'required|in:accept,reject',
            'notes'    => 'nullable|string|max:2000',
        ]);

        if ($statusRequest->status !== 'pending') {
            return response()->json(['error' => 'This request is no longer pending.'], 422);
        }

        if (! $statusRequest->evidence) {
            return response()->json(['error' => 'This request has no attached evidence.'], 422);
        }

        $control = $statusRequest->control;

        if ($request->decision === 'accept') {
            // Accept evidence → approve the status change
            $oldStatus = $control->current_status;
            $newStatus = $statusRequest->requested_status === 'not_set'
                ? null
                : $statusRequest->requested_status;

            $control->update([
                'current_status'     => $newStatus,
                'last_remediated_at' => now(),
                'remediation_notes'  => $statusRequest->justification ?? $control->remediation_notes,
            ]);

            ControlStatusHistory::create([
                'control_id' => $control->id,
                'user_id'    => Auth::id(),
                'old_status' => $oldStatus,
                'new_status' => $newStatus ?? 'not_set',
                'notes'      => trim(implode(' — ', array_filter([
                    $statusRequest->justification,
                    $request->notes ? "Reviewer: {$request->notes}" : null,
                ]))),
            ]);

            // Fire rules engine
            $engine = new RulesEngine();
            $control->load('risks');

            if ($newStatus === 'non_compliant') {
                $engine->applyRule1ForControl($control);
            } elseif ($newStatus === 'compliant') {
                $engine->applyRule2ForControl($control, $oldStatus ?? '');

                $aiRisks      = $control->risks()->where('auto_generated', true)->get();
                $removedCount = $aiRisks->count();
                foreach ($aiRisks as $risk) {
                    $risk->controls()->detach();
                    $risk->delete();
                }
                if ($removedCount > 0) {
                    AuditLog::record(
                        'deleted', 'Control', $control->id,
                        "Control '{$control->control_id}' marked Compliant — {$removedCount} AI-generated risk" .
                        ($removedCount !== 1 ? 's' : '') . " removed"
                    );
                }
            }

            $statusRequest->evidence->update(['status' => 'approved']);

            $statusRequest->update([
                'status'      => 'approved',
                'reviewed_by' => Auth::id(),
                'reviewed_at' => now(),
                'notes'       => $request->notes,
            ]);

            Notification::create([
                'user_id' => $statusRequest->requested_by,
                'type'    => 'status_request_approved',
                'title'   => 'Status Update Approved',
                'message' => "Your request to change '{$control->control_id}' to " .
                             $this->formatStatus($statusRequest->requested_status) .
                             " was approved by " . Auth::user()->name .
                             " — evidence accepted" .
                             ($request->notes ? ". Note: {$request->notes}" : '.'),
                'url'     => '/controls/hub',
                'is_read' => false,
            ]);

            AuditLog::record(
                'approved',
                'ControlStatusRequest',
                $statusRequest->id,
                "'{$control->control_id}' status change to " .
                $this->formatStatus($statusRequest->requested_status) .
                " approved by " . Auth::user()->name . " — evidence accepted"
            );
        } else {
            // Reject evidence → reject the request, do NOT change control status
            $statusRequest->evidence->update(['status' => 'rejected']);

            $statusRequest->update([
                'status'      => 'rejected',
                'reviewed_by' => Auth::id(),
                'reviewed_at' => now(),
                'notes'       => $request->notes,
            ]);

            Notification::create([
                'user_id' => $statusRequest->requested_by,
                'type'    => 'status_request_rejected',
                'title'   => 'Status Update Rejected',
                'message' => "Your request to change '{$control->control_id}' to " .
                             $this->formatStatus($statusRequest->requested_status) .
                             " was rejected by " . Auth::user()->name .
                             " — evidence rejected" .
                             ($request->notes ? ". Reason: {$request->notes}" : '.'),
                'url'     => '/controls/hub',
                'is_read' => false,
            ]);

            AuditLog::record(
                'rejected',
                'ControlStatusRequest',
                $statusRequest->id,
                "Status request rejected — evidence rejected by " . Auth::user()->name .
                " for '{$control->control_id}'" .
                ($request->notes ? " — {$request->notes}" : '')
            );
        }

        return response()->json(['success' => true]);
    }

    // ── Helper ───────────────────────────────────────────────────────────────

    private function formatStatus(string $status): string
    {
        return match ($status) {
            'compliant'           => 'Compliant',
            'partially_compliant' => 'Partially Compliant',
            'non_compliant'       => 'Non-Compliant',
            'not_applicable'      => 'Not Applicable',
            'not_set'             => 'Not Set',
            default               => $status,
        };
    }
}
