<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Risk;
use App\Models\RiskTreatmentPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RiskTreatmentPlanController extends Controller
{
    /**
     * Abort 404 if the parent risk is not in the actor's tenant. 404 (not 403)
     * so cross-tenant ids are indistinguishable from non-existent.
     * Treatment plans inherit their tenant boundary from the parent Risk.
     */
    private function ensureCanAccess(Risk $risk): void
    {
        $user = Auth::user();
        if ($user->isSuperAdmin()) {
            return;
        }
        if (! $user->corporation_id || $risk->corporation_id !== $user->corporation_id) {
            abort(404);
        }
    }

    public function store(Request $request, Risk $risk)
    {
        $this->ensureCanAccess($risk);


        $validated = $request->validate([
            'strategy' => 'required|in:mitigate,accept,transfer,avoid',
            'description' => 'required|string',
            'owner' => 'required|string|max:255',
            'due_date' => 'nullable|date',
            'progress' => 'required|integer|min:0|max:100',
            'status' => 'required|in:not_started,in_progress,completed',
            'residual_likelihood' => 'nullable|integer|min:1|max:5',
            'residual_impact' => 'nullable|integer|min:1|max:5',
        ]);

        $plan = $risk->treatmentPlans()->create($validated);

        AuditLog::record(
            'created',
            'RiskTreatmentPlan',
            $plan->id,
            "Treatment plan added to risk '{$risk->title}' (strategy: {$plan->strategy})"
        );

        return back()->with('success', 'Treatment plan added.');
    }

    public function update(Request $request, Risk $risk, RiskTreatmentPlan $plan)
    {
        $this->ensureCanAccess($risk);
        abort_if($plan->risk_id !== $risk->id, 403);

        $validated = $request->validate([
            'strategy' => 'required|in:mitigate,accept,transfer,avoid',
            'description' => 'required|string',
            'owner' => 'required|string|max:255',
            'due_date' => 'nullable|date',
            'progress' => 'required|integer|min:0|max:100',
            'status' => 'required|in:not_started,in_progress,completed',
            'residual_likelihood' => 'nullable|integer|min:1|max:5',
            'residual_impact' => 'nullable|integer|min:1|max:5',
        ]);

        $wasCompleted = $plan->status === 'completed';
        $plan->update($validated);

        if (! $wasCompleted && $plan->status === 'completed') {
            AuditLog::record(
                'updated',
                'RiskTreatmentPlan',
                $plan->id,
                "Treatment plan for risk '{$risk->title}' marked as completed"
            );
        } else {
            AuditLog::record(
                'updated',
                'RiskTreatmentPlan',
                $plan->id,
                "Treatment plan updated for risk '{$risk->title}'"
            );
        }

        return back()->with('success', 'Treatment plan updated.');
    }

    public function destroy(Risk $risk, RiskTreatmentPlan $plan)
    {
        $this->ensureCanAccess($risk);
        abort_if($plan->risk_id !== $risk->id, 403);

        $plan->delete();

        AuditLog::record(
            'deleted',
            'RiskTreatmentPlan',
            $risk->id,
            "Treatment plan removed from risk '{$risk->title}'"
        );

        return back()->with('success', 'Treatment plan deleted.');
    }
}
