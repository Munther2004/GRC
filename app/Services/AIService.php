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
            'is_relevant'    => true,
        ];

        try {
            $systemPrompt = <<<'PROMPT'
You are a GRC audit expert. Your task is to assess whether a piece of evidence adequately proves that a specific compliance control is implemented and operating effectively.

You will receive the control ID, title, and description (the exact requirement that must be proven), the framework reference, evidence metadata, and the actual file content.

Focus your entire assessment on whether this specific evidence proves the stated control is implemented. Evidence that is generic, vague, off-topic, or too brief to demonstrate control implementation should receive a lower verdict.

Return ONLY a JSON object with exactly these six fields: verdict, confidence, strengths, gaps, recommendation, is_relevant.
- verdict must be exactly one of: Adequate, Partially Adequate, Insufficient
- confidence must be exactly one of: High, Medium, Low
- strengths should describe what the evidence does well to prove this specific control — if nothing supports it, return an empty string ""
- gaps should describe what is missing to prove this control is implemented — if nothing is missing, return an empty string ""
- recommendation should give actionable advice to improve this evidence for this specific control — if no improvement needed, return an empty string ""
- is_relevant must be a boolean: true if the evidence is at least somewhat related to the stated control (even if weak or incomplete), false ONLY when the evidence has nothing to do with this control (e.g. an access control policy uploaded against a backup procedure control)
- Never return null for any field — always return a string or boolean, never null
- Even for very short, vague, or clearly inadequate evidence (a single sentence, "hi there", or a blank file), still return a valid JSON with all six fields and a proper verdict
- Do not include any explanation, markdown fences, or text outside the JSON object
PROMPT;

            $meta = implode("\n", [
                'Control ID: '          . ($evidenceData['control_id']            ?? 'N/A'),
                'Control Title: '       . ($evidenceData['control_title']         ?? 'N/A'),
                'Control Description: ' . ($evidenceData['control_description']   ?? 'N/A'),
                'Framework: '           . ($evidenceData['framework']             ?? 'N/A'),
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
                'is_relevant'    => isset($parsed['is_relevant']) ? (bool) $parsed['is_relevant'] : true,
            ];

        } catch (\Throwable $e) {
            Log::error('AIService::reviewEvidence exception', ['message' => $e->getMessage()]);
            return $default;
        }
    }

    /**
     * Generate an AI-written executive summary narrative + prioritised recommendations
     * from a structured GRC data snapshot.
     *
     * @param  array $data  Pre-gathered GRC metrics (compliance, risks, evidence, frameworks…)
     * @return array{narrative: string, recommendations: string[]}
     */
    public function generateExecutiveSummary(array $data): array
    {
        $default = [
            'narrative'       => 'The AI executive summary could not be generated at this time. Please review the data tables below for a manual assessment of the current security posture.',
            'recommendations' => [
                'Review all critical and high-severity risks immediately.',
                'Ensure all pending evidence items are reviewed and approved.',
                'Complete any overdue compliance assessments.',
            ],
        ];

        try {
            $systemPrompt = <<<'PROMPT'
You are a senior information security consultant preparing a formal executive summary for C-level stakeholders.

Return ONLY a valid JSON object with exactly two fields — no markdown fences, no extra text:
{
  "narrative": "<3–4 flowing paragraphs of professional executive summary text>",
  "recommendations": ["<action 1>", "<action 2>", "<action 3>", "<action 4>", "<action 5>"]
}

Rules for "narrative":
- Use formal business language suitable for a CISO or board presentation.
- Do NOT use bullet points or numbered lists inside the narrative — flowing paragraphs only.
- Be specific: cite the exact numbers provided in the data (risk counts, compliance %, evidence stats).
- Highlight the most critical issues clearly, but remain professional and measured — not alarmist.
- End the narrative with a forward-looking statement about priorities.

Rules for "recommendations":
- Provide exactly 3–5 items, ordered by urgency.
- Each item must be a single concise action sentence (max 20 words).
- Ground each recommendation in the actual data provided.
PROMPT;

            $contextJson = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            $userPrompt  = "Generate a professional executive summary based on the following GRC system data:\n\n{$contextJson}";

            $response = Http::withoutVerifying()
                ->withHeaders([
                    'x-api-key'         => config('services.anthropic.key'),
                    'anthropic-version' => '2023-06-01',
                    'Content-Type'      => 'application/json',
                ])->post('https://api.anthropic.com/v1/messages', [
                    'model'      => 'claude-sonnet-4-20250514',
                    'max_tokens' => 2048,
                    'system'     => $systemPrompt,
                    'messages'   => [
                        ['role' => 'user', 'content' => $userPrompt],
                    ],
                ]);

            if ($response->failed()) {
                Log::error('AIService::generateExecutiveSummary API error', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return $default;
            }

            $text = $response->json()['content'][0]['text'] ?? '';

            // Strip markdown fences if model wraps despite instructions
            $text = preg_replace('/^```json\s*/i', '', trim($text));
            $text = preg_replace('/^```\s*/i',     '', trim($text));
            $text = preg_replace('/```$/m',        '', trim($text));
            $text = trim($text);

            $parsed = json_decode($text, true);

            if (!is_array($parsed) || empty($parsed['narrative'])) {
                Log::warning('AIService::generateExecutiveSummary: invalid JSON', ['raw' => $text]);
                return $default;
            }

            return [
                'narrative'       => (string) ($parsed['narrative'] ?? $default['narrative']),
                'recommendations' => is_array($parsed['recommendations'] ?? null)
                    ? array_values(array_filter($parsed['recommendations'], 'is_string'))
                    : $default['recommendations'],
            ];

        } catch (\Throwable $e) {
            Log::error('AIService::generateExecutiveSummary exception', ['message' => $e->getMessage()]);
            return $default;
        }
    }

    public function generateGapAnalysis(array $data): array
    {
        $systemPrompt = <<<'SYS'
You are a senior information security auditor generating a professional gap analysis report.
You must return ONLY valid JSON (no markdown fences, no preamble) in exactly this structure:
{
  "executive_summary": "2–3 paragraph summary of the overall compliance posture",
  "critical_gaps": [
    {"control_id": "A.8.2", "framework": "ISO27001", "title": "...", "finding": "...", "recommendation": "..."}
  ],
  "category_analysis": [
    {"category": "Access Control", "gap_count": 3, "partial_count": 2, "summary": "..."}
  ],
  "action_list": [
    {"priority": "High", "action": "...", "control_ids": ["A.8.2", "AC-3"], "owner": "..."}
  ],
  "positive_highlights": ["..."],
  "overall_risk_rating": "High"
}
overall_risk_rating must be one of: Critical, High, Medium, Low.
Be specific. Cite control IDs. Keep findings concise but actionable.
SYS;

        $userPrompt = 'Generate a professional compliance gap analysis report based on this GRC system data: '
            . json_encode($data, JSON_UNESCAPED_UNICODE);

        try {
            $response = Http::withoutVerifying()
                ->withHeaders([
                    'x-api-key'         => config('services.anthropic.key'),
                    'anthropic-version' => '2023-06-01',
                    'Content-Type'      => 'application/json',
                ])->post('https://api.anthropic.com/v1/messages', [
                    'model'      => 'claude-sonnet-4-20250514',
                    'max_tokens' => 3000,
                    'system'     => $systemPrompt,
                    'messages'   => [
                        ['role' => 'user', 'content' => $userPrompt],
                    ],
                ]);

            if ($response->failed()) {
                Log::error('AIService::generateGapAnalysis API error', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                throw new \RuntimeException('Claude API returned HTTP ' . $response->status());
            }

            $text = $response->json()['content'][0]['text'] ?? '';
            $text = preg_replace('/^```json\s*/i', '', trim($text));
            $text = preg_replace('/^```\s*/i',     '', trim($text));
            $text = preg_replace('/```$/m',         '', trim($text));
            $text = trim($text);

            $parsed = json_decode($text, true);
            if (!is_array($parsed)) {
                Log::warning('AIService::generateGapAnalysis: invalid JSON', ['raw' => $text]);
                throw new \RuntimeException('AI returned invalid JSON');
            }

            return $parsed;
        } catch (\Throwable $e) {
            Log::error('AIService::generateGapAnalysis exception', ['message' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Explain a compliance control in plain language for use during an assessment.
     *
     * @param  array  $controlData  Keys: code, name, description, framework, domain
     * @return string  Raw JSON string with explanation fields
     */
    public function explainControl(array $controlData): string
    {
        $default = json_encode([
            'plain_english'        => 'This control requires your organization to implement appropriate measures as defined by the framework.',
            'what_it_requires'     => [
                'Review the control description and understand its scope',
                'Implement appropriate policies and procedures',
                'Assign ownership and accountability for the control',
                'Maintain documented evidence of compliance',
            ],
            'evidence_examples'    => [
                'Policy document signed by management',
                'Procedure documentation',
                'Audit or review records',
                'System configuration screenshots',
            ],
            'compliant_looks_like' => 'A compliant organization has documented policies, implemented procedures, and maintains evidence that the control is operating effectively.',
            'non_compliant_risks'  => 'Failure to implement this control may expose the organization to compliance violations and security risks.',
        ]);

        try {
            $code        = $controlData['code']        ?? '';
            $name        = $controlData['name']        ?? '';
            $description = $controlData['description'] ?? '';
            $framework   = $controlData['framework']   ?? '';
            $domain      = $controlData['domain']      ?? '';

            $prompt = <<<PROMPT
You are a GRC expert helping an organization understand their compliance controls during a self-assessment.

Control: [{$code}] {$name}
Framework: {$framework}
Domain: {$domain}
Description: {$description}

Provide a practical explanation in this exact JSON format:
{
  "plain_english": "2-3 sentence explanation of what this control means in simple terms, avoiding jargon",
  "what_it_requires": [
    "Specific thing the organization must have or do",
    "Another specific requirement",
    "Add 3-5 bullet points total"
  ],
  "evidence_examples": [
    "Example of evidence that would prove compliance",
    "Another evidence example",
    "Add 3-5 examples total"
  ],
  "compliant_looks_like": "1-2 sentences describing what a fully compliant implementation looks like in practice",
  "non_compliant_risks": "1 sentence on the main risk if this control is not implemented"
}

Be specific and practical. Write as if explaining to an IT manager, not a security expert. Return only valid JSON, no markdown, no extra text.
PROMPT;

            $response = Http::withoutVerifying()
                ->withHeaders([
                    'x-api-key'         => config('services.anthropic.key'),
                    'anthropic-version' => '2023-06-01',
                    'Content-Type'      => 'application/json',
                ])->post('https://api.anthropic.com/v1/messages', [
                    'model'      => 'claude-sonnet-4-20250514',
                    'max_tokens' => 1024,
                    'messages'   => [
                        ['role' => 'user', 'content' => $prompt],
                    ],
                ]);

            if ($response->failed()) {
                Log::error('AIService::explainControl API error', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return $default;
            }

            $text = $response->json()['content'][0]['text'] ?? '';
            $text = preg_replace('/^```json\s*/i', '', trim($text));
            $text = preg_replace('/^```\s*/i',     '', trim($text));
            $text = preg_replace('/```$/m',        '', trim($text));
            $text = trim($text);

            $parsed = json_decode($text, true);
            if (!is_array($parsed)) {
                Log::warning('AIService::explainControl: invalid JSON', ['raw' => $text]);
                return $default;
            }

            return json_encode($parsed);

        } catch (\Throwable $e) {
            Log::error('AIService::explainControl exception', ['message' => $e->getMessage()]);
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
