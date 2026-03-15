<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AIController extends Controller
{
    public function suggestThreats(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|min:1',
            'description' => 'required|string|min:1',
            'category'    => 'nullable|string',
        ]);

        $title       = $request->input('title');
        $description = $request->input('description');
        $category    = $request->input('category', 'General');

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

        $ai           = new AIService();
        $responseText = $ai->callClaude($prompt);

        if (empty($responseText)) {
            return response()->json(['error' => 'AI service unavailable'], 503);
        }

        $suggestions = json_decode($responseText, true);

        if (!is_array($suggestions)) {
            Log::warning('AIController: invalid JSON response', ['response' => $responseText]);
            return response()->json(['error' => 'Invalid AI response'], 500);
        }

        // Sanitize each suggestion
        $suggestions = array_map(function ($s) {
            return [
                'threat'              => $s['threat'] ?? '',
                'explanation'         => $s['explanation'] ?? '',
                'likelihood'          => max(1, min(5, (int) ($s['likelihood'] ?? 3))),
                'impact'              => max(1, min(5, (int) ($s['impact'] ?? 3))),
                'suggested_treatment' => in_array($s['suggested_treatment'] ?? '', ['mitigate', 'accept', 'transfer', 'avoid'])
                    ? $s['suggested_treatment']
                    : 'mitigate',
            ];
        }, array_slice($suggestions, 0, 4));

        return response()->json($suggestions);
    }
}
