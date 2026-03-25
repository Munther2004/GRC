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
