<?php

namespace App\Services;

use App\Models\Assessment;
use App\Models\AssessmentItem;
use App\Models\AuditLog;
use App\Models\Notification;
use App\Models\Risk;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AIRiskGenerator
{
    public function __construct(private AIService $ai = new AIService) {}

    public function generateRisksFromAssessment(Assessment $assessment): void
    {
        $items = AssessmentItem::where('assessment_id', $assessment->id)
            ->whereIn('compliance_status', ['non_compliant', 'partially_compliant'])
            ->with(['control.framework'])
            ->get();

        foreach ($items as $item) {
            if (! $item->control) {
                continue;
            }

            $control = $item->control;

            // Skip if a risk was already generated for this control in this assessment
            $exists = Risk::where('auto_generated', 1)
                ->where('source_control_id', $control->id)
                ->where('assessment_id', $assessment->id)
                ->exists();

            if ($exists) {
                continue;
            }

            $this->generateRiskForControl($control, $assessment, $item->compliance_status);
        }
    }

    public function generateRiskForControl($control, Assessment $assessment, string $complianceStatus): void
    {
        try {
            $frameworkName = $control->framework->name ?? $control->framework->short_name ?? 'Unknown';
            $statusLabel = $complianceStatus === 'non_compliant' ? 'Non-Compliant' : 'Partially Compliant';
            $severityContext = $complianceStatus === 'non_compliant'
                ? 'The control is fully non-compliant — no implementation exists.'
                : 'The control is partially compliant — some implementation exists but gaps remain.';

            $prompt = <<<PROMPT
You are a GRC risk analyst. A security control has been assessed as {$statusLabel}. Generate a professional risk record.

Control Code: {$control->control_id}
Control Title: {$control->title}
Control Description: {$control->description}
Framework: {$frameworkName}
Category: {$control->category}
Assessment Status: {$statusLabel}
Context: {$severityContext}

Return ONLY valid JSON, no explanation, no markdown:
{
  "title": "concise risk title max 10 words",
  "description": "2-3 sentence professional risk description explaining what could go wrong",
  "likelihood": 3,
  "impact": 4,
  "treatment": "mitigate",
  "mitigation_steps": "Step 1: ... Step 2: ... Step 3: ..."
}

Likelihood and impact must be integers 1-5. Treatment must be one of: mitigate, accept, transfer, avoid.
PROMPT;

            $responseText = $this->ai->callClaude($prompt);

            if (empty($responseText)) {
                return;
            }

            $cleaned = preg_replace('/^```json\s*/i', '', trim($responseText));
            $cleaned = preg_replace('/```$/', '', trim($cleaned));
            $data = json_decode(trim($cleaned), true);

            if (! is_array($data)) {
                Log::warning('AIRiskGenerator: invalid JSON response', ['response' => $responseText]);

                return;
            }

            if (empty($data['title']) || empty($data['description'])) {
                return;
            }

            $likelihood = max(1, min(5, (int) ($data['likelihood'] ?? 3)));
            $impact = max(1, min(5, (int) ($data['impact'] ?? 3)));
            $treatment = in_array($data['treatment'] ?? '', ['mitigate', 'accept', 'transfer', 'avoid'])
                ? $data['treatment']
                : 'mitigate';

            // Only reference the assessment if it still exists in the DB
            $assessmentId = Assessment::where('id', $assessment->id)->value('id');

            $risk = Risk::create([
                'user_id' => \App\Models\User::where('role', 'admin')->first()->id,
                'title' => substr($data['title'], 0, 255),
                'description' => $data['description'],
                'category' => $control->category ?? 'Information Security',
                'owner' => 'AI Generated',
                'likelihood' => $likelihood,
                'impact' => $impact,
                'status' => 'open',
                'treatment' => $treatment,
                'treatment_plan' => null,
                'mitigation_steps' => $data['mitigation_steps'] ?? null,
                'auto_generated' => 1,
                'source_control_id' => $control->id,
                'assessment_id' => $assessmentId,
            ]);

            DB::table('control_risk')->insert([
                'control_id' => $control->id,
                'risk_id' => $risk->id,
                'auto_linked' => true,
                'link_type' => 'ai',
                'link_reason' => "Auto-generated from {$statusLabel} control {$control->control_id} in assessment '{$assessment->title}'",
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $riskUrl = "/risks/{$risk->id}";
            Notification::firstOrCreate(
                ['type' => 'critical_risk', 'url' => $riskUrl, 'is_read' => false],
                ['title' => 'AI Generated New Risk', 'message' => "AI generated new risk: {$risk->title} from {$statusLabel} control {$control->control_id}"]
            );

            AuditLog::record(
                'created',
                'Risk',
                $risk->id,
                "AI Rule: Auto-created risk #{$risk->id} from {$statusLabel} control #{$control->id} in assessment #{$assessment->id}"
            );
        } catch (\Throwable $e) {
            Log::error('AIRiskGenerator exception', [
                'message' => $e->getMessage(),
                'control_id' => $control->id,
                'assessment_id' => $assessment->id,
            ]);
        }
    }
}
