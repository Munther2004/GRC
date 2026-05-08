<?php

namespace App\Actions;

use App\Models\AuditLog;
use App\Models\ControlStatusHistory;
use App\Models\ControlStatusRequest;
use App\Models\CorporationControlStatus;
use App\Models\Notification;
use App\Models\RemediationTask;
use App\Services\RulesEngine;
use Illuminate\Support\Facades\Auth;

/**
 * Applies a control status approval: updates the control record, writes history,
 * fires the rules engine, removes stale AI-generated risks, and auto-closes open
 * remediation tasks when the control becomes compliant.
 *
 * Extracted from ControlStatusRequestController so both the direct approve() path
 * and the reviewEvidence(accept) path stay in sync automatically.
 */
class ApproveControlStatusRequest
{
    public function execute(ControlStatusRequest $statusRequest, string $reviewerNotes = ''): void
    {
        $control = $statusRequest->control;
        $newStatus = $statusRequest->requested_status === 'not_set'
            ? null
            : $statusRequest->requested_status;

        // Tenant guard for the side-effect mutations below. Without this,
        // approving one tenant's status request was deleting AI-risks and
        // auto-closing remediation tasks across every other tenant that
        // happened to reference the same global control.
        $tenantId = $statusRequest->corporation_id
            ?? $statusRequest->requester?->corporation_id;

        // Status now lives in the per-tenant pivot, not on the global control
        // row. Reads merge the tenant override with the legacy default.
        $oldStatus = $control->statusForCorporation($tenantId);

        if ($tenantId !== null) {
            CorporationControlStatus::updateOrCreate(
                ['corporation_id' => $tenantId, 'control_id' => $control->id],
                [
                    'current_status' => $newStatus,
                    'last_remediated_at' => now(),
                    'remediation_notes' => $statusRequest->justification
                        ?? $control->statusForCorporation($tenantId),
                ]
            );
        } else {
            // Legacy fallback: a status request with no corporation context
            // (super_admin acting outside any tenant) still updates the
            // global control row so seed-style platform changes still apply.
            $control->update([
                'current_status' => $newStatus,
                'last_remediated_at' => now(),
                'remediation_notes' => $statusRequest->justification ?? $control->remediation_notes,
            ]);
        }

        ControlStatusHistory::create([
            'control_id' => $control->id,
            'user_id' => Auth::id(),
            'old_status' => $oldStatus,
            'new_status' => $newStatus ?? 'not_set',
            'notes' => trim(implode(' — ', array_filter([
                $statusRequest->justification,
                $reviewerNotes ? "Reviewer: {$reviewerNotes}" : null,
            ]))),
        ]);

        $engine = new RulesEngine;
        $control->load('risks');

        if ($newStatus === 'non_compliant') {
            $engine->applyRule1ForControl($control);
        } elseif ($newStatus === 'compliant') {
            $engine->applyRule2ForControl($control, $oldStatus ?? '');

            // Remove AI-generated risks linked to this control — scoped to
            // the approver's tenant. Risks belonging to other tenants stay
            // intact even when the underlying control object is global.
            $aiRiskQuery = $control->risks()->where('auto_generated', true);
            if ($tenantId !== null) {
                $aiRiskQuery->where('risks.corporation_id', $tenantId);
            }
            $aiRisks = $aiRiskQuery->get();
            $removedCount = $aiRisks->count();
            foreach ($aiRisks as $risk) {
                $risk->controls()->detach();
                $risk->delete();
            }
            if ($removedCount > 0) {
                AuditLog::record(
                    'deleted', 'Control', $control->id,
                    "Control '{$control->control_id}' marked Compliant — {$removedCount} AI-generated risk".
                    ($removedCount !== 1 ? 's' : '').' removed'
                );
            }

            // Auto-close open / in-progress remediation tasks — scoped to
            // the approver's tenant.
            $taskQuery = RemediationTask::where('control_id', $control->id)
                ->whereIn('status', ['open', 'in_progress']);
            if ($tenantId !== null) {
                $taskQuery->where('corporation_id', $tenantId);
            }
            $openTasks = $taskQuery->get();

            foreach ($openTasks as $remTask) {
                $remTask->update([
                    'status' => 'completed',
                    'auto_closed' => true,
                    'closed_at' => now(),
                    'completion_notes' => "Auto-closed: control {$control->control_id} became compliant.",
                ]);

                AuditLog::record(
                    'remediation_task_auto_closed',
                    'RemediationTask',
                    $remTask->id,
                    "Remediation task '{$remTask->title}' auto-closed — control {$control->control_id} became compliant"
                );

                if ($remTask->created_by) {
                    Notification::create([
                        'user_id' => $remTask->created_by,
                        'type' => 'remediation_task_auto_closed',
                        'title' => 'Remediation Task Auto-Closed',
                        'message' => "Your remediation task \"{$remTask->title}\" was automatically closed because {$control->control_id} is now compliant.",
                        'url' => '/remediation-tasks',
                        'is_read' => false,
                    ]);
                }
            }
        }
    }
}
