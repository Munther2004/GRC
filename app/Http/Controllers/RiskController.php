<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Control;
use App\Models\Framework;
use App\Models\Notification;
use App\Models\Risk;
use App\Models\RiskAppetite;
use App\Services\AIControlLinker;
use App\Services\AIService;
use App\Services\RiskMetricsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RiskController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $baseQuery = fn () => $user->organisationScope(Risk::query()->with(['user', 'sourceControl.framework']));

        $paginator = $baseQuery()
            ->when($request->search, fn ($q) => $q->where('title', 'like', "%{$request->search}%")
                ->orWhere('description', 'like', "%{$request->search}%")
            )
            ->when($request->status, fn ($q) => $q->where('status', $request->status)
            )
            ->when($request->level, function ($q) use ($request) {
                $t = Risk::levelThresholds();
                match ($request->level) {
                    'critical' => $q->whereRaw("likelihood * impact >= {$t['critical']}"),
                    'high' => $q->whereRaw("likelihood * impact >= {$t['high']} AND likelihood * impact < {$t['critical']}"),
                    'medium' => $q->whereRaw("likelihood * impact >= {$t['medium']} AND likelihood * impact < {$t['high']}"),
                    'low' => $q->whereRaw("likelihood * impact < {$t['medium']}"),
                    default => null
                };
            })
            ->when($request->category, fn ($q) => $q->where('category', $request->category)
            )
            ->when($request->has_plan, fn ($q) => $q->whereNotNull('treatment_plan')->where('treatment_plan', '<>', '')
            )
            ->when($request->framework, fn ($q) => $q->whereHas('sourceControl.framework', fn ($fq) => $fq->where('short_name', $request->framework)
            )
            )
            ->orderByRaw('likelihood * impact DESC')
            ->paginate(15)
            ->withQueryString();

        $appetite = RiskAppetite::getActiveForUser($user);

        // Client filter: escalated_only — collect escalated IDs if appetite active
        if ($request->escalated_only && $appetite) {
            $allRisks = $user->organisationScope(Risk::query())->get();
            $escalatedIds = $allRisks
                ->filter(fn ($r) => $appetite->classifyRisk($r)['band'] === 'escalated')
                ->pluck('id')
                ->toArray();
            $paginator = $baseQuery()
                ->whereIn('id', $escalatedIds)
                ->orderByRaw('likelihood * impact DESC')
                ->paginate(15)
                ->withQueryString();
        }

        $paginator->through(fn ($risk) => array_merge($risk->toArray(), [
            'framework_name' => $risk->sourceControl?->framework?->short_name ?? null,
            'risk_score' => $risk->risk_score,
            'appetite_band' => $appetite?->classifyRisk($risk),
        ]));

        $tc = Risk::levelThresholds();
        $scopedRisks = $user->organisationScope(Risk::query());
        $stats = [
            'total' => (clone $scopedRisks)->count(),
            'open' => (clone $scopedRisks)->where('status', 'open')->count(),
            'critical' => (clone $scopedRisks)->whereRaw("likelihood * impact >= {$tc['critical']}")->count(),
            'overdue' => (clone $scopedRisks)->where('due_date', '<', now())
                ->whereNotIn('status', ['closed'])
                ->count(),
        ];

        $frameworks = Framework::where('is_active', true)
            ->orderBy('short_name')
            ->get(['id', 'short_name', 'name']);

        $riskExposure = (new RiskMetricsService)->calculateRiskExposure();

        return Inertia::render('risks/index', [
            'risks' => $paginator,
            'stats' => $stats,
            'riskExposure' => $riskExposure,
            'filters' => $request->only(['search', 'status', 'level', 'category', 'has_plan', 'framework', 'escalated_only']),
            'frameworks' => $frameworks,
            'appetite' => $appetite,
        ]);
    }

    public function create()
    {
        return Inertia::render('risks/create', [
            'categories' => $this->getCategories(),
            'statuses' => $this->getStatuses(),
            'treatments' => $this->getTreatments(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string',
            'owner' => 'required|string|max:255',
            'likelihood' => 'required|integer|min:1|max:5',
            'impact' => 'required|integer|min:1|max:5',
            'status' => 'required|in:open,in_progress,under_review,closed',
            'treatment' => 'required|in:accept,mitigate,transfer,avoid',
            'treatment_plan' => 'nullable|string',
            'due_date' => 'nullable|date',
            'ai_validated' => 'boolean',
        ]);

        $risk = Risk::create([
            ...$validated,
            'user_id' => Auth::id(),
            'corporation_id' => Auth::user()->corporation_id,
        ]);

        AuditLog::record(
            'created',
            'Risk',
            $risk->id,
            "Risk '{$risk->title}' created with score {$risk->risk_score} ({$risk->risk_level})"
        );

        (new AIControlLinker)->linkControlsToRisk($risk);

        return redirect()->route('risks.show', $risk)
            ->with('success', 'Risk created successfully.');
    }

    public function show(Risk $risk)
    {
        $risk->load(['user', 'sourceControl.framework', 'treatmentPlans']);

        $linkedControls = $risk->controls()
            ->with('framework')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'control_id' => $c->control_id,
                'title' => $c->title,
                'description' => $c->description,
                'implementation_guidance' => $c->implementation_guidance,
                'category' => $c->category,
                'auto_linked' => (bool) $c->pivot->auto_linked,
                'link_type' => $c->pivot->link_type ?? 'auto',
                'link_reason' => $c->pivot->link_reason,
                'framework' => $c->framework->short_name,
            ]);

        $allControls = Control::with('framework')
            ->orderBy('framework_id')
            ->orderBy('control_id')
            ->limit(500)
            ->get(['id', 'control_id', 'title', 'framework_id'])
            ->map(fn ($c) => [
                'id' => $c->id,
                'control_id' => $c->control_id,
                'title' => $c->title,
                'framework' => $c->framework->short_name,
            ]);

        $treatmentPlans = $risk->treatmentPlans->map(fn ($p) => [
            'id' => $p->id,
            'strategy' => $p->strategy,
            'description' => $p->description,
            'owner' => $p->owner,
            'due_date' => $p->due_date?->format('Y-m-d'),
            'progress' => $p->progress,
            'status' => $p->status,
            'residual_likelihood' => $p->residual_likelihood,
            'residual_impact' => $p->residual_impact,
            'residual_score' => $p->residual_score,
            'residual_level' => $p->residual_level,
        ])->toArray();

        return Inertia::render('risks/show', [
            'risk' => array_merge($risk->toArray(), [
                'risk_score' => $risk->risk_score,
                'risk_level' => $risk->risk_level,
                'source_control' => $risk->sourceControl ? [
                    'control_id' => $risk->sourceControl->control_id,
                    'title' => $risk->sourceControl->title,
                ] : null,
            ]),
            'linkedControls' => $linkedControls,
            'allControls' => $allControls,
            'treatmentPlans' => $treatmentPlans,
        ]);
    }

    public function edit(Risk $risk)
    {
        return Inertia::render('risks/edit', [
            'risk' => array_merge($risk->toArray(), [
                'risk_score' => $risk->risk_score,
                'risk_level' => $risk->risk_level,
            ]),
            'categories' => $this->getCategories(),
            'statuses' => $this->getStatuses(),
            'treatments' => $this->getTreatments(),
        ]);
    }

    public function update(Request $request, Risk $risk)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string',
            'owner' => 'required|string|max:255',
            'likelihood' => 'required|integer|min:1|max:5',
            'impact' => 'required|integer|min:1|max:5',
            'status' => 'required|in:open,in_progress,under_review,closed',
            'treatment' => 'required|in:accept,mitigate,transfer,avoid',
            'treatment_plan' => 'nullable|string',
            'due_date' => 'nullable|date',
            'ai_validated' => 'boolean',
        ]);

        $oldScore = $risk->risk_score;
        $risk->update($validated);

        AuditLog::record(
            'updated',
            'Risk',
            $risk->id,
            "Risk '{$risk->title}' updated. Score changed from {$oldScore} to {$risk->risk_score}"
        );

        (new AIControlLinker)->linkControlsToRisk($risk);

        return redirect()->route('risks.show', $risk)
            ->with('success', 'Risk updated successfully.');
    }

    public function destroy(Risk $risk)
    {
        $title = $risk->title;
        $id = $risk->id;

        Notification::where('url', '/risks/'.$risk->id)->delete();
        DB::table('control_risk')->where('risk_id', $risk->id)->delete();

        $risk->delete();

        AuditLog::record(
            'deleted',
            'Risk',
            $id,
            "Risk '{$title}' deleted"
        );

        return redirect()->route('risks.index')
            ->with('success', 'Risk deleted successfully.');
    }

    public function validateScores(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'likelihood' => 'required|integer|min:1|max:5',
            'impact' => 'required|integer|min:1|max:5',
        ]);

        try {
            $result = (new AIService)->validateRiskScores(
                $validated['title'],
                $validated['description'],
                $validated['likelihood'],
                $validated['impact']
            );
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('validateScores exception', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);

            return response()->json(['error' => 'Validation failed: '.$e->getMessage()], 500);
        }

        return response()->json($result);
    }

    public function linkControl(Request $request, Risk $risk)
    {
        $request->validate(['control_id' => 'required|exists:controls,id']);

        $risk->controls()->syncWithoutDetaching([
            $request->control_id => ['auto_linked' => false, 'link_type' => 'manual'],
        ]);

        AuditLog::record(
            'updated',
            'Risk',
            $risk->id,
            "Control {$request->control_id} manually linked to risk '{$risk->title}'"
        );

        return back()->with('success', 'Control linked successfully.');
    }

    public function unlinkControl(Request $request, Risk $risk)
    {
        $request->validate(['control_id' => 'required|exists:controls,id']);

        $risk->controls()->detach($request->control_id);

        AuditLog::record(
            'updated',
            'Risk',
            $risk->id,
            "Control {$request->control_id} unlinked from risk '{$risk->title}'"
        );

        return back()->with('success', 'Control unlinked.');
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private function getCategories(): array
    {
        return [
            'Information Security',
            'Operational',
            'Compliance',
            'Financial',
            'Strategic',
            'Technical',
            'Human Resources',
            'Third Party',
            'Physical',
            'Legal',
        ];
    }

    private function getStatuses(): array
    {
        return [
            ['value' => 'open',         'label' => 'Open'],
            ['value' => 'in_progress',  'label' => 'In Progress'],
            ['value' => 'under_review', 'label' => 'Under Review'],
            ['value' => 'closed',       'label' => 'Closed'],
        ];
    }

    private function getTreatments(): array
    {
        return [
            ['value' => 'mitigate', 'label' => 'Mitigate — Reduce the risk'],
            ['value' => 'accept',   'label' => 'Accept — Accept and monitor'],
            ['value' => 'transfer', 'label' => 'Transfer — Transfer to third party'],
            ['value' => 'avoid',    'label' => 'Avoid — Eliminate the activity'],
        ];
    }

    public function heatmap()
    {
        $risks = Auth::user()->organisationScope(Risk::query()->with(['user', 'sourceControl.framework']))
            ->orderByRaw('likelihood * impact DESC')
            ->get();

        $heatmap = $risks->map(fn ($r) => [
            'id' => $r->id,
            'title' => $r->title,
            'likelihood' => $r->likelihood,
            'impact' => $r->impact,
            'score' => $r->likelihood * $r->impact,
            'status' => $r->status,
        ]);

        return Inertia::render('risks/heatmap', [
            'heatmap' => $heatmap,
        ]);
    }
}
