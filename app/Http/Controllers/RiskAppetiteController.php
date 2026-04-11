<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Notification;
use App\Models\Risk;
use App\Models\RiskAppetite;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RiskAppetiteController extends Controller
{
    public function index()
    {
        return Inertia::render('risk-appetite/index', [
            'appetites'       => RiskAppetite::orderByDesc('is_active')->orderBy('name')->get(),
            'active_appetite' => RiskAppetite::getActive(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateAppetite($request);

        $appetite = RiskAppetite::create(array_merge($validated, [
            'created_by' => Auth::id(),
        ]));

        AuditLog::record(
            'risk_appetite_created',
            'RiskAppetite',
            $appetite->id,
            "Risk appetite '{$appetite->name}' created"
        );

        return back()->with('success', "Risk appetite '{$appetite->name}' created.");
    }

    public function update(Request $request, RiskAppetite $appetite)
    {
        $validated = $this->validateAppetite($request);
        $appetite->update($validated);

        AuditLog::record(
            'risk_appetite_updated',
            'RiskAppetite',
            $appetite->id,
            "Risk appetite '{$appetite->name}' updated"
        );

        return back()->with('success', "Risk appetite '{$appetite->name}' updated.");
    }

    public function activate(RiskAppetite $appetite)
    {
        // Capture which risks were escalated before switching
        $previousActive      = RiskAppetite::getActive();
        $previouslyEscalated = [];

        if ($previousActive) {
            $previouslyEscalated = Risk::all()
                ->filter(fn ($r) => $previousActive->classifyRisk($r)['band'] === 'escalated')
                ->pluck('id')
                ->toArray();
        }

        // Deactivate all, activate chosen
        DB::transaction(function () use ($appetite) {
            RiskAppetite::where('id', '!=', $appetite->id)->update(['is_active' => false]);
            $appetite->update(['is_active' => true]);
        });

        // Notify for newly escalated risks
        if ($appetite->notify_on_escalation && !empty($appetite->escalation_notification_roles)) {
            $allRisks     = Risk::all();
            $nowEscalated = $allRisks->filter(fn ($r) => $appetite->classifyRisk($r)['band'] === 'escalated');
            $newlyEscalated = $nowEscalated->filter(fn ($r) => !in_array($r->id, $previouslyEscalated));

            if ($newlyEscalated->isNotEmpty()) {
                $notifyUsers = User::whereIn('role', $appetite->escalation_notification_roles)->get();

                foreach ($newlyEscalated as $risk) {
                    foreach ($notifyUsers as $user) {
                        Notification::create([
                            'user_id' => $user->id,
                            'type'    => 'risk_escalated',
                            'title'   => 'Risk Escalated',
                            'message' => "Risk '{$risk->title}' (score {$risk->risk_score}) is now in the "
                                       . "'{$appetite->escalated_label}' band under '{$appetite->name}'.",
                            'url'     => '/risks/' . $risk->id,
                            'is_read' => false,
                        ]);
                    }
                }
            }
        }

        AuditLog::record(
            'risk_appetite_activated',
            'RiskAppetite',
            $appetite->id,
            "Risk appetite '{$appetite->name}' activated"
        );

        return back()->with('success', "Risk appetite '{$appetite->name}' activated.");
    }

    public function destroy(RiskAppetite $appetite)
    {
        if ($appetite->is_active) {
            return back()->withErrors(['appetite' => 'Cannot delete the active risk appetite configuration.']);
        }

        $name = $appetite->name;
        $id   = $appetite->id;
        $appetite->delete();

        AuditLog::record(
            'risk_appetite_deleted',
            'RiskAppetite',
            $id,
            "Risk appetite '{$name}' deleted"
        );

        return back()->with('success', "Risk appetite '{$name}' deleted.");
    }

    // ─── Private ──────────────────────────────────────────────────────────────

    private function validateAppetite(Request $request): array
    {
        return $request->validate([
            'name'                            => 'required|string|max:255',
            'acceptable_max_score'            => 'required|integer|min:1|max:24',
            'review_max_score'                => 'required|integer|min:2|max:25|gt:acceptable_max_score',
            'escalated_min_score'             => 'required|integer|min:2|max:25',
            'acceptable_label'                => 'required|string|max:100',
            'review_label'                    => 'required|string|max:100',
            'escalated_label'                 => 'required|string|max:100',
            'acceptable_color'                => 'required|string|max:50',
            'review_color'                    => 'required|string|max:50',
            'escalated_color'                 => 'required|string|max:50',
            'notify_on_escalation'            => 'boolean',
            'escalation_notification_roles'   => 'nullable|array',
            'escalation_notification_roles.*' => 'in:admin,auditor,user',
            'notes'                           => 'nullable|string',
        ]);
    }
}
