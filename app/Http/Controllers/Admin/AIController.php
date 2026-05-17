<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Assessment;
use App\Models\AssessmentItem;
use App\Models\Control;
use App\Models\Framework;
use App\Models\Risk;
use App\Services\AIRiskGenerator;
use App\Services\AIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AIController extends Controller
{
    public function suggestThreats(Request $request)
    {
        $request->validate([
            'title' => 'required|string|min:1',
            'description' => 'required|string|min:1',
            'category' => 'nullable|string',
        ]);

        $title = $request->input('title');
        $description = $request->input('description');
        $category = $request->input('category', 'General');

        $prompt = <<<PROMPT
You are a GRC threat analyst. Suggest realistic threat scenarios for this risk.

Risk Title: {$title}
Risk Description: {$description}
Category: {$category}

Return ONLY valid JSON array, no explanation, no markdown:
[
  {
    "threat": "short threat title",
    "explanation": "1-2 sentences explaining this threat scenario",
    "likelihood": 3,
    "impact": 4,
    "suggested_treatment": "mitigate"
  }
]

Return exactly 4 threat scenarios. Likelihood and impact must be integers 1-5. suggested_treatment must be one of: mitigate, accept, transfer, avoid.
PROMPT;

        $ai = new AIService;
        $responseText = $ai->callClaude($prompt);

        if (empty($responseText)) {
            return response()->json(['error' => 'AI service unavailable'], 503);
        }

        $suggestions = json_decode($responseText, true);

        if (! is_array($suggestions)) {
            Log::warning('AIController: invalid JSON response', ['response' => $responseText]);

            return response()->json(['error' => 'Invalid AI response'], 500);
        }

        // Sanitize each suggestion
        $suggestions = array_map(function ($s) {
            return [
                'threat' => $s['threat'] ?? '',
                'explanation' => $s['explanation'] ?? '',
                'likelihood' => max(1, min(5, (int) ($s['likelihood'] ?? 3))),
                'impact' => max(1, min(5, (int) ($s['impact'] ?? 3))),
                'suggested_treatment' => in_array($s['suggested_treatment'] ?? '', ['mitigate', 'accept', 'transfer', 'avoid'])
                    ? $s['suggested_treatment']
                    : 'mitigate',
            ];
        }, array_slice($suggestions, 0, 4));

        return response()->json($suggestions);
    }

    public function suggestControls(Request $request)
    {
        $request->validate([
            'title' => 'required|string|min:1',
            'description' => 'required|string|min:1',
            'category' => 'nullable|string',
        ]);

        $title = $request->input('title');
        $description = $request->input('description');
        $category = $request->input('category', 'General');

        $activeFrameworkIds = DB::table('assessments')->distinct()->pluck('framework_id');
        if ($activeFrameworkIds->isEmpty()) {
            $activeFrameworkIds = Framework::where('is_active', true)->pluck('id');
        }

        $controls = Control::whereIn('framework_id', $activeFrameworkIds)
            ->where('is_active', true)
            ->with('framework')
            ->limit(200)
            ->get();

        if ($controls->isEmpty()) {
            return response()->json([]);
        }

        $controlsList = $controls->map(
            fn ($c) => "{$c->id} | {$c->control_id} | {$c->title} | {$c->framework->short_name} | {$c->category}"
        )->implode("\n");

        $prompt = <<<PROMPT
You are a GRC expert. Given this risk, identify the most relevant security controls from the list below.

Risk Title: {$title}
Risk Description: {$description}
Risk Category: {$category}

Controls list (format: ID | Code | Title | Framework | Category):
{$controlsList}

Return ONLY a valid JSON array, no explanation, no markdown, like this:
[
  {"control_id": 5, "reason": "This control directly addresses account lockout which mitigates unauthorized access"}
]

Return maximum 8 most relevant controls only. If none are relevant return empty array [].
PROMPT;

        $ai = new AIService;
        $responseText = $ai->callClaude($prompt);

        if (empty($responseText)) {
            return response()->json(['error' => 'AI service unavailable'], 503);
        }

        $raw = json_decode(trim($responseText), true);
        if (! is_array($raw)) {
            Log::warning('AIController::suggestControls: invalid JSON', ['response' => $responseText]);

            return response()->json(['error' => 'Invalid AI response'], 500);
        }

        $byId = $controls->keyBy('id');
        $suggestions = [];
        foreach (array_slice($raw, 0, 8) as $s) {
            $id = (int) ($s['control_id'] ?? 0);
            $ctrl = $byId->get($id);
            if (! $ctrl) {
                continue;
            }
            $suggestions[] = [
                'control_id' => $ctrl->id,
                'control_code' => $ctrl->control_id,
                'title' => $ctrl->title,
                'framework' => $ctrl->framework->short_name,
                'category' => $ctrl->category,
                'reason' => is_string($s['reason'] ?? null) ? $s['reason'] : '',
            ];
        }

        return response()->json($suggestions);
    }

    public function remediateGap(Request $request)
    {
        $request->validate([
            'control_id' => 'required',
            'control_code' => 'required|string',
            'control_title' => 'required|string',
            'control_description' => 'required|string',
            'control_category' => 'nullable|string',
            'framework' => 'nullable|string',
            'compliance_status' => 'required|string',
        ]);

        $code = $request->control_code;
        $title = $request->control_title;
        $description = $request->control_description;
        $framework = $request->input('framework', 'N/A');
        $category = $request->input('control_category', 'General');
        $status = $request->compliance_status;

        $prompt = <<<PROMPT
You are a GRC compliance expert. A security control has been assessed as non-compliant or partially compliant. Provide a practical remediation plan.

Control Code: {$code}
Control Title: {$title}
Control Description: {$description}
Framework: {$framework}
Category: {$category}
Compliance Status: {$status}

Return ONLY valid JSON, no explanation, no markdown:
{
  "summary": "one sentence explaining the core gap",
  "priority": "High",
  "estimated_effort": "2-3 weeks",
  "remediation_steps": [
    {
      "step": 1,
      "action": "short action title",
      "detail": "detailed explanation of what to do",
      "evidence_needed": "what evidence to upload to prove compliance"
    }
  ],
  "quick_wins": ["immediate action 1", "immediate action 2"],
  "resources_needed": ["resource 1", "resource 2"]
}

Priority must be one of: Critical, High, Medium, Low.
Estimated effort should be realistic. Provide 3-5 remediation steps. Provide 2-3 quick wins.
PROMPT;

        try {
            $ai = new AIService;
            $responseText = $ai->callClaude($prompt);

            if (empty($responseText)) {
                return response()->json(['error' => 'AI service unavailable'], 503);
            }

            $plan = json_decode($responseText, true);

            if (! is_array($plan)) {
                Log::warning('AIController::remediateGap: invalid JSON', ['response' => $responseText]);

                return response()->json(['error' => 'Invalid AI response format'], 500);
            }

            return response()->json($plan);
        } catch (\Exception $e) {
            Log::error('AIController::remediateGap error', ['message' => $e->getMessage()]);

            return response()->json(['error' => 'Failed to generate remediation plan'], 500);
        }
    }

    public function saveRemediation(Request $request)
    {
        $request->validate([
            'control_id' => 'required|integer',
            'plan_text' => 'required|string',
        ]);

        $user = Auth::user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Controls are global reference data, so any authenticated user
        // can resolve a control by id. The tenant scope is applied to the
        // risk and the assessment context that backs it.
        $control = Control::find($request->control_id);
        if (! $control) {
            return response()->json(['error' => 'Control not found'], 404);
        }

        // Match an existing AI-generated risk for this control that the
        // caller is allowed to see. visibilityScope adds the per-user
        // owner filter for the `user` role so a regular user only
        // mutates their own AI risks, never another user's in the same
        // corporation.
        $risk = $user->visibilityScope(Risk::query(), 'user_id')
            ->where('auto_generated', 1)
            ->where('source_control_id', $control->id)
            ->first();

        if (! $risk) {
            // No risk yet — fall back to generating one from a completed
            // assessment the caller can see. Assessment visibility uses
            // the same rule (admin/auditor: corp-wide, user: own only).
            $item = AssessmentItem::where('control_id', $control->id)
                ->whereIn('compliance_status', ['non_compliant', 'partially_compliant'])
                ->whereHas('assessment', function ($q) use ($user) {
                    $q->where('status', 'completed');
                    $user->visibilityScope($q, 'user_id');
                })
                ->with('assessment')
                ->latest()
                ->first();

            if (! $item) {
                return response()->json(['error' => 'Could not find assessment context to generate a risk'], 422);
            }

            (new AIRiskGenerator)->generateRiskForControl($control, $item->assessment, $item->compliance_status);

            $risk = $user->visibilityScope(Risk::query(), 'user_id')
                ->where('auto_generated', 1)
                ->where('source_control_id', $control->id)
                ->first();

            if (! $risk) {
                return response()->json(['error' => 'Failed to auto-generate risk for this control'], 500);
            }
        }

        $existing = $risk->treatment_plan ?? '';
        $separator = $existing ? "\n\n---\n\n" : '';
        $risk->treatment_plan = $existing.$separator.$request->plan_text;
        $risk->save();

        return response()->json(['success' => true, 'risk_id' => $risk->id, 'risk_title' => $risk->title]);
    }

    public function generateAssessmentSummary(Request $request, $assessmentId)
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Visibility scope: refuse to summarize an assessment the caller
        // cannot see. admin/auditor see their corp; a `user` can only
        // summarize assessments they personally created.
        $assessment = $user->visibilityScope(
            Assessment::with(['framework', 'items.control']),
            'user_id',
        )->whereKey($assessmentId)->first();

        if (! $assessment) {
            abort(404);
        }

        $items = $assessment->items;
        $total = $items->count();
        $compliant = $items->where('compliance_status', 'compliant')->count();
        $partial = $items->where('compliance_status', 'partially_compliant')->count();
        $nonCompliant = $items->where('compliance_status', 'non_compliant')->count();
        $na = $items->where('compliance_status', 'not_applicable')->count();

        // Top 5 non-compliant controls — non_compliant first, then partially_compliant
        $topGaps = $items
            ->whereIn('compliance_status', ['non_compliant', 'partially_compliant'])
            ->sortByDesc(fn ($i) => $i->compliance_status === 'non_compliant' ? 1 : 0)
            ->take(5);

        $controlsList = $topGaps->map(fn ($i) => "- [{$i->control->control_id}] {$i->control->title} (".ucfirst(str_replace('_', ' ', $i->compliance_status)).')'
        )->implode("\n");

        if (empty(trim($controlsList))) {
            $controlsList = '- No non-compliant controls identified';
        }

        // AI-generated risks linked to this assessment
        $risks = Risk::where('auto_generated', 1)
            ->where('assessment_id', $assessment->id)
            ->get();

        $risksList = $risks->isEmpty()
            ? '- No AI-identified risks for this assessment'
            : $risks->map(fn ($r) => "- {$r->title} (Likelihood: {$r->likelihood}, Impact: {$r->impact}, Score: ".($r->likelihood * $r->impact).')'
            )->implode("\n");

        $frameworkName = $assessment->framework->name;
        $pct = $assessment->compliance_percentage;
        $title = $assessment->title;
        $period = $assessment->period;
        $scope = $assessment->scope;

        $prompt = <<<PROMPT
You are a senior GRC consultant writing an executive summary for a compliance assessment report.

Assessment Details:
- Title: {$title}
- Framework: {$frameworkName}
- Period: {$period}
- Scope: {$scope}
- Compliance Score: {$pct}%
- Total Controls Assessed: {$total}
- Compliant: {$compliant}
- Partially Compliant: {$partial}
- Non-Compliant: {$nonCompliant}
- Not Applicable: {$na}

Top Non-Compliant Controls:
{$controlsList}

AI-Identified Risks from this Assessment:
{$risksList}

Write a professional executive summary suitable for senior management. Return ONLY valid JSON, no markdown:
{
  "overall_status": "At Risk",
  "executive_summary": "3-4 paragraph professional summary",
  "compliance_rating": "Poor",
  "key_findings": [
    {"finding": "short finding title", "detail": "one sentence explanation", "severity": "High"}
  ],
  "immediate_priorities": ["priority 1", "priority 2", "priority 3"],
  "positive_observations": ["what is going well 1", "what is going well 2"],
  "recommended_next_steps": ["step 1", "step 2", "step 3"]
}

overall_status must be one of: Strong, Adequate, Needs Improvement, At Risk, Critical.
compliance_rating must be one of: Excellent, Good, Fair, Poor, Critical.
Provide exactly 3-5 key findings, 3 immediate priorities, 2-3 positive observations, 3 recommended next steps.
PROMPT;

        try {
            $ai = new AIService;
            $responseText = $ai->callClaude($prompt);

            if (empty($responseText)) {
                return response()->json(['error' => 'AI service unavailable'], 503);
            }

            $summary = json_decode(trim($responseText), true);

            if (! is_array($summary)) {
                Log::warning('AIController::generateAssessmentSummary: invalid JSON', ['response' => $responseText]);

                return response()->json(['error' => 'Invalid AI response format'], 500);
            }

            return response()->json($summary);
        } catch (\Exception $e) {
            Log::error('AIController::generateAssessmentSummary error', ['message' => $e->getMessage()]);

            return response()->json(['error' => 'Failed to generate assessment summary'], 500);
        }
    }
}
