<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    public function validateRiskScores(string $title, string $description, int $likelihood, int $impact): array
    {
        try {
            Log::info('validateRiskScores called', [
                'title'      => $title,
                'likelihood' => $likelihood,
                'impact'     => $impact,
            ]);

            $prompt = <<<PROMPT
You are an ISO/IEC 27005 risk assessment expert. Evaluate whether the given likelihood and impact scores are appropriate for the described risk.

Risk Title: {$title}
Risk Description: {$description}
Current Likelihood (1–5): {$likelihood}
Current Impact (1–5): {$impact}

Scale definitions:
Likelihood: 1=Rare, 2=Unlikely, 3=Possible, 4=Likely, 5=Almost Certain
Impact: 1=Negligible, 2=Minor, 3=Moderate, 4=Major, 5=Catastrophic

Assess whether the current scores are appropriate given the risk description. If you recommend different values, explain why. Return ONLY valid JSON (no markdown) in this exact format:
{
  "valid": true,
  "recommended_likelihood": 3,
  "recommended_impact": 4,
  "reasoning": "concise explanation of your assessment",
  "confidence": "high"
}

valid must be true if the current scores are appropriate, false if you recommend changes.
recommended_likelihood and recommended_impact must be integers 1–5 (use the current values if valid is true).
confidence must be one of: high, medium, low.
PROMPT;

            $raw = $this->callClaude($prompt);

            Log::info('Claude raw response', ['response' => $raw]);

            if (empty($raw)) {
                return [
                    'error'                  => true,
                    'valid'                  => false,
                    'recommended_likelihood' => $likelihood,
                    'recommended_impact'     => $impact,
                    'reasoning'              => 'AI validation unavailable. Please check your API configuration.',
                    'confidence'             => 'low',
                ];
            }

            $parsed = json_decode($raw, true);

            Log::info('Parsed result', ['parsed' => $parsed]);

            if (!is_array($parsed)) {
                return [
                    'error'                  => true,
                    'valid'                  => false,
                    'recommended_likelihood' => $likelihood,
                    'recommended_impact'     => $impact,
                    'reasoning'              => 'Could not parse AI response.',
                    'confidence'             => 'low',
                ];
            }

            return [
                'valid'                  => (bool)   ($parsed['valid']                  ?? true),
                'recommended_likelihood' => max(1, min(5, (int) ($parsed['recommended_likelihood'] ?? $likelihood))),
                'recommended_impact'     => max(1, min(5, (int) ($parsed['recommended_impact']     ?? $impact))),
                'reasoning'              => (string)  ($parsed['reasoning']              ?? ''),
                'confidence'             => in_array($parsed['confidence'] ?? '', ['high', 'medium', 'low'])
                                                ? $parsed['confidence'] : 'medium',
            ];
        } catch (\Throwable $e) {
            Log::error('validateRiskScores exception', [
                'message' => $e->getMessage(),
                'class'   => get_class($e),
            ]);
            return [
                'error'                  => true,
                'valid'                  => false,
                'recommended_likelihood' => $likelihood,
                'recommended_impact'     => $impact,
                'reasoning'              => 'An unexpected error occurred during validation.',
                'confidence'             => 'low',
            ];
        }
    }

    /**
     * Compliance chatbot — sends a user message with full conversation history and a live GRC
     * context snapshot to Claude, returning a plain-English markdown response.
     *
     * @param  array<int, array{role: 'user'|'assistant', content: string}> $history
     */
    public function complianceChatbot(string $userMessage, array $context, array $history = []): string
    {
        try {
            $contextJson = json_encode($context, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

            $systemPrompt = <<<PROMPT
You are an AI compliance assistant for a GRC (Governance, Risk, and Compliance) Management System.
You have access to the following real-time data about the organization:

{$contextJson}

Answer the user's questions based on this data. Be concise, professional, and specific — reference actual numbers and control names from the data. If something is not in the data, say so clearly.
Format responses with bullet points or numbered lists where appropriate.
Never make up data that is not in the context provided.
PROMPT;

            $messages = [];
            foreach ($history as $turn) {
                $role    = $turn['role']    ?? '';
                $content = $turn['content'] ?? '';
                if (in_array($role, ['user', 'assistant'], true) && $content !== '') {
                    $messages[] = ['role' => $role, 'content' => (string) $content];
                }
            }
            $messages[] = ['role' => 'user', 'content' => $userMessage];

            $response = Http::withoutVerifying()
                ->withHeaders([
                    'x-api-key'         => config('services.anthropic.key'),
                    'anthropic-version' => '2023-06-01',
                    'Content-Type'      => 'application/json',
                ])->post('https://api.anthropic.com/v1/messages', [
                    'model'      => 'claude-opus-4-5',
                    'max_tokens' => 2048,
                    'system'     => $systemPrompt,
                    'messages'   => $messages,
                ]);

            if ($response->failed()) {
                Log::error('ComplianceChatbot API error', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return '';
            }

            $data = $response->json();
            return trim($data['content'][0]['text'] ?? '');

        } catch (\Throwable $e) {
            Log::error('ComplianceChatbot exception', ['message' => $e->getMessage()]);
            return '';
        }
    }

    /**
     * Review compliance evidence with full file content.
     *
     * @param  array  $evidenceData  Metadata keys: control_title, control_description, framework,
     *                               evidence_title, evidence_description, file_name, file_type,
     *                               upload_date, expiry_date, uploaded_by
     * @param  string $fileContent   Plain text, or base64-encoded bytes for images/PDFs.
     * @param  string $contentType   'text' | 'image/png' | 'image/jpeg' | 'image/webp' |
     *                               'image/gif' | 'application/pdf' | 'unsupported'
     * @return array{verdict: string, confidence: string, strengths: string, gaps: string, recommendation: string}
     */
    public function reviewEvidence(array $evidenceData, string $fileContent, string $contentType): array
    {
        $default = [
            'verdict'        => 'Insufficient',
            'confidence'     => 'Low',
            'strengths'      => '',
            'gaps'           => 'AI review could not be completed.',
            'recommendation' => 'Please retry the AI review.',
        ];

        try {
            $systemPrompt = <<<'PROMPT'
You are a GRC audit expert reviewing evidence for compliance controls.
You will be given:
- The control title and description this evidence is meant to support
- The framework reference (ISO 27001, NIST etc.)
- The evidence metadata (title, description, type, upload date, expiry date)
- The actual file content

Based on all of this, assess whether the evidence adequately proves the control is implemented.

Return ONLY a JSON object with exactly these five fields: verdict, confidence, strengths, gaps, recommendation.
- verdict must be exactly one of: Adequate, Partially Adequate, Insufficient
- confidence must be exactly one of: High, Medium, Low
- strengths should describe what the evidence does well — if nothing is good, return an empty string ""
- gaps should describe what is missing or inadequate — if nothing is missing, return an empty string ""
- recommendation should give actionable advice to improve the evidence — if no improvement needed, return an empty string ""
- Never return null for any field — always return a string, even if empty
- Even for very short, vague, or clearly inadequate evidence (a single sentence, "hi there", or a blank file), still return a valid JSON with all five fields and a proper verdict
- Do not include any explanation, markdown fences, or text outside the JSON object
PROMPT;

            $meta = implode("\n", [
                'Control Title: '       . ($evidenceData['control_title']        ?? 'N/A'),
                'Control Description: ' . ($evidenceData['control_description']   ?? 'N/A'),
                'Framework: '          . ($evidenceData['framework']              ?? 'N/A'),
                'Evidence Title: '      . ($evidenceData['evidence_title']        ?? 'N/A'),
                'Evidence Description: '. ($evidenceData['evidence_description']  ?? ''),
                'File Name: '           . ($evidenceData['file_name']             ?? 'N/A'),
                'File Type: '           . ($evidenceData['file_type']             ?? 'N/A'),
                'Upload Date: '         . ($evidenceData['upload_date']           ?? 'N/A'),
                'Expiry Date: '         . ($evidenceData['expiry_date']           ?? 'No expiry'),
                'Uploaded By: '         . ($evidenceData['uploaded_by']           ?? 'Unknown'),
            ]);

            // Build message content — multimodal for images/PDFs, plain text otherwise
            if (str_starts_with($contentType, 'image/')) {
                $userContent = [
                    ['type' => 'image', 'source' => [
                        'type'       => 'base64',
                        'media_type' => $contentType,
                        'data'       => $fileContent,
                    ]],
                    ['type' => 'text', 'text' => $meta . "\n\nThe image above is the uploaded evidence file. Assess it thoroughly."],
                ];
            } elseif ($contentType === 'application/pdf') {
                $userContent = [
                    ['type' => 'document', 'source' => [
                        'type'       => 'base64',
                        'media_type' => 'application/pdf',
                        'data'       => $fileContent,
                    ]],
                    ['type' => 'text', 'text' => $meta . "\n\nThe PDF above is the uploaded evidence file. Assess it thoroughly."],
                ];
            } elseif ($contentType === 'unsupported') {
                $userContent = $meta . "\n\nNote: " . $fileContent . "\n\nPlease assess based on the metadata above.";
            } else {
                $userContent = $meta . "\n\n--- FILE CONTENT ---\n" . $fileContent;
            }

            $response = Http::withoutVerifying()
                ->withHeaders([
                    'x-api-key'         => config('services.anthropic.key'),
                    'anthropic-version' => '2023-06-01',
                    'Content-Type'      => 'application/json',
                ])->post('https://api.anthropic.com/v1/messages', [
                    'model'      => 'claude-opus-4-5',
                    'max_tokens' => 1024,
                    'system'     => $systemPrompt,
                    'messages'   => [
                        ['role' => 'user', 'content' => $userContent],
                    ],
                ]);

            if ($response->failed()) {
                Log::error('AIService::reviewEvidence API error', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return $default;
            }

            $data = $response->json();
            $text = $data['content'][0]['text'] ?? '';

            // Strip markdown fences (same pattern used throughout this service)
            $text = preg_replace('/^```json\s*/i', '', trim($text));
            $text = preg_replace('/^```\s*/i',     '', trim($text));
            $text = preg_replace('/```$/m',        '', trim($text));
            $text = trim($text);

            $parsed = json_decode($text, true);

            if (!is_array($parsed)) {
                Log::warning('AIService::reviewEvidence: invalid JSON', ['response' => $text]);
                return $default;
            }

            return [
                'verdict'        => in_array($parsed['verdict'] ?? '', ['Adequate', 'Partially Adequate', 'Insufficient'], true)
                    ? $parsed['verdict'] : 'Insufficient',
                'confidence'     => in_array($parsed['confidence'] ?? '', ['High', 'Medium', 'Low'], true)
                    ? $parsed['confidence'] : 'Medium',
                'strengths'      => (string) ($parsed['strengths']      ?? ''),
                'gaps'           => (string) ($parsed['gaps']           ?? ''),
                'recommendation' => (string) ($parsed['recommendation'] ?? ''),
            ];

        } catch (\Throwable $e) {
            Log::error('AIService::reviewEvidence exception', ['message' => $e->getMessage()]);
            return $default;
        }
    }

    public function callClaude(string $prompt): string
    {
        try {
            $response = Http::withoutVerifying()
            ->withHeaders([
                'x-api-key'         => config('services.anthropic.key'),
                'anthropic-version' => '2023-06-01',
                'Content-Type'      => 'application/json',
            ])->post('https://api.anthropic.com/v1/messages', [
                'model'      => 'claude-opus-4-5',
                'max_tokens' => 1024,
                'messages'   => [
                    ['role' => 'user', 'content' => $prompt],
                ],
            ]);

            if ($response->failed()) {
                Log::error('Claude API error', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return '';
            }

            $data = $response->json();

            $text = $data['content'][0]['text'] ?? '';
            $text = preg_replace('/^```json\s*/i', '', trim($text));
            $text = preg_replace('/^```\s*/i', '', trim($text));
            $text = preg_replace('/```$/m', '', trim($text));
            return trim($text);
        } catch (\Throwable $e) {
            Log::error('Claude API exception', ['message' => $e->getMessage()]);
            return '';
        }
    }
}
