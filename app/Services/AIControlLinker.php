<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Control;
use App\Models\Framework;
use App\Models\Risk;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AIControlLinker
{
    public function __construct(private AIService $ai = new AIService()) {}

    public function linkControlsToRisk(Risk $risk): void
    {
        try {
            // Find framework_ids that have been used in any assessment
            $activeFrameworkIds = DB::table('assessments')
                ->distinct()
                ->pluck('framework_id');

            if ($activeFrameworkIds->isEmpty()) {
                // Fall back to all active frameworks if no assessments yet
                $activeFrameworkIds = Framework::where('is_active', true)->pluck('id');
            }

            // Load controls only from those frameworks (max 200)
            $controls = Control::whereIn('framework_id', $activeFrameworkIds)
                ->where('is_active', true)
                ->with('framework')
                ->limit(200)
                ->get();

            if ($controls->isEmpty()) {
                return;
            }

            // Build controls list string
            $controlsList = $controls->map(fn($c) =>
                "{$c->id} | {$c->control_id} | {$c->title} | {$c->framework->short_name} | {$c->category}"
            )->implode("\n");

            $prompt = <<<PROMPT
You are a GRC expert. Given this risk, identify the most relevant security controls from the list below.

Risk Title: {$risk->title}
Risk Description: {$risk->description}
Risk Category: {$risk->category}

Controls list (format: ID | Code | Title | Framework | Category):
{$controlsList}

Return ONLY a valid JSON array, no explanation, no markdown, like this:
[
  {"control_id": 5, "reason": "This control directly addresses account lockout which mitigates unauthorized access"},
  {"control_id": 12, "reason": "MFA enforcement reduces risk of credential compromise"}
]

Return maximum 8 most relevant controls only. If none are relevant return empty array [].
PROMPT;

            $responseText = $this->ai->callClaude($prompt);

            if (empty($responseText)) {
                return;
            }

            $cleaned = preg_replace('/^```json\s*/i', '', trim($responseText));
            $cleaned = preg_replace('/```$/', '', trim($cleaned));
            $data = json_decode(trim($cleaned), true);

            if (!is_array($suggestions)) {
                Log::warning('AIControlLinker: invalid JSON response', ['response' => $responseText]);
                return;
            }

            $linked = 0;

            foreach ($suggestions as $suggestion) {
                $controlId = $suggestion['control_id'] ?? null;
                $reason    = $suggestion['reason'] ?? null;

                if (!$controlId) continue;

                // Skip if already linked
                $exists = DB::table('control_risk')
                    ->where('risk_id', $risk->id)
                    ->where('control_id', $controlId)
                    ->exists();

                if ($exists) continue;

                // Verify control exists
                if (!$controls->contains('id', $controlId)) continue;

                DB::table('control_risk')->insert([
                    'control_id'  => $controlId,
                    'risk_id'     => $risk->id,
                    'auto_linked' => true,
                    'link_type'   => 'ai',
                    'link_reason' => $reason,
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]);

                $linked++;
            }

            if ($linked > 0) {
                AuditLog::record(
                    'created',
                    'Risk',
                    $risk->id,
                    "AI linked {$linked} controls to risk #{$risk->id}"
                );
            }
        } catch (\Throwable $e) {
            Log::error('AIControlLinker exception', ['message' => $e->getMessage(), 'risk_id' => $risk->id]);
        }
    }
}
