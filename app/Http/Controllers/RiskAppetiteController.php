<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Corporation;
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
    public function index(Request $request)
    {
        $user = $request->user();

        // For super_admin, allow ?corporation_id= to scope; otherwise use the
        // corp the admin belongs to.
        $corporationId = $this->resolveCorporationId($request);

        $appetites = $corporationId
            ? RiskAppetite::where('corporation_id', $corporationId)
                ->orderByDesc('is_active')
                ->orderBy('name')
                ->get()
            : collect();

        $active = $corporationId
            ? RiskAppetite::getActiveForCorporation($corporationId)
            : null;

        return Inertia::render('risk-appetite/index', [
            'appetites' => $appetites,
            'active_appetite' => $active,
            'context' => [
                'is_super_admin' => $user->isSuperAdmin(),
                'corporation_id' => $corporationId,
                'corporation_name' => $corporationId
                    ? Corporation::where('id', $corporationId)->value('name')
                    : null,
                'corporations' => $user->isSuperAdmin()
                    ? Corporation::orderBy('name')->get(['id', 'name'])
                    : [],
                'needs_corporation_selection' => $user->isSuperAdmin() && ! $corporationId,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $corporationId = $this->resolveCorporationId($request);

        if (! $corporationId) {
            return back()->withErrors(['appetite' => 'Select a corporation before creating a risk appetite.']);
        }

        $validated = $this->validateAppetite($request);

        $appetite = RiskAppetite::create(array_merge($validated, [
            'corporation_id' => $corporationId,
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
        $this->ensureCanManage($request->user(), $appetite);

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

    public function activate(Request $request, RiskAppetite $appetite)
    {
        $this->ensureCanManage($request->user(), $appetite);

        // Capture risks already escalated under the *previous* corp-scoped appetite.
        $previousActive = RiskAppetite::getActiveForCorporation($appetite->corporation_id);
        $previouslyEscalated = [];

        $corpRisks = Risk::where('corporation_id', $appetite->corporation_id)->get();

        if ($previousActive) {
            $previouslyEscalated = $corpRisks
                ->filter(fn ($r) => $previousActive->classifyRisk($r)['band'] === 'escalated')
                ->pluck('id')
                ->toArray();
        }

        // Deactivate all in-corp, activate chosen
        DB::transaction(function () use ($appetite) {
            RiskAppetite::where('corporation_id', $appetite->corporation_id)
                ->where('id', '!=', $appetite->id)
                ->update(['is_active' => false]);
            $appetite->update(['is_active' => true]);
        });

        if ($appetite->notify_on_escalation && ! empty($appetite->escalation_notification_roles)) {
            $nowEscalated = $corpRisks->filter(fn ($r) => $appetite->classifyRisk($r)['band'] === 'escalated');
            $newlyEscalated = $nowEscalated->filter(fn ($r) => ! in_array($r->id, $previouslyEscalated));

            if ($newlyEscalated->isNotEmpty()) {
                $notifyUsers = User::whereIn('role', $appetite->escalation_notification_roles)
                    ->where('corporation_id', $appetite->corporation_id)
                    ->get();

                foreach ($newlyEscalated as $risk) {
                    foreach ($notifyUsers as $u) {
                        Notification::create([
                            'user_id' => $u->id,
                            'type' => 'risk_escalated',
                            'title' => 'Risk Escalated',
                            'message' => "Risk '{$risk->title}' (score {$risk->risk_score}) is now in the "
                                       ."'{$appetite->escalated_label}' band under '{$appetite->name}'.",
                            'url' => '/risks/'.$risk->id,
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

    public function destroy(Request $request, RiskAppetite $appetite)
    {
        $this->ensureCanManage($request->user(), $appetite);

        if ($appetite->is_active) {
            return back()->withErrors(['appetite' => 'Cannot delete the active risk appetite configuration.']);
        }

        $name = $appetite->name;
        $id = $appetite->id;
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

    private function resolveCorporationId(Request $request): ?int
    {
        $user = $request->user();

        if ($user->isSuperAdmin()) {
            $cid = (int) ($request->query('corporation_id') ?? $request->input('corporation_id') ?? 0);

            return $cid > 0 ? $cid : null;
        }

        return $user->corporation_id;
    }

    private function ensureCanManage(User $user, RiskAppetite $appetite): void
    {
        if ($user->isSuperAdmin()) {
            return;
        }

        if (! $user->isAdmin() || $appetite->corporation_id !== $user->corporation_id) {
            abort(403);
        }
    }

    private function validateAppetite(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'acceptable_max_score' => 'required|integer|min:1|max:24',
            'review_max_score' => 'required|integer|min:2|max:25|gt:acceptable_max_score',
            'escalated_min_score' => 'required|integer|min:2|max:25',
            'acceptable_label' => 'required|string|max:100',
            'review_label' => 'required|string|max:100',
            'escalated_label' => 'required|string|max:100',
            'acceptable_color' => 'required|string|max:50',
            'review_color' => 'required|string|max:50',
            'escalated_color' => 'required|string|max:50',
            'notify_on_escalation' => 'boolean',
            'escalation_notification_roles' => 'nullable|array',
            'escalation_notification_roles.*' => 'in:super_admin,admin,auditor,user',
            'notes' => 'nullable|string',
        ]);
    }
}
