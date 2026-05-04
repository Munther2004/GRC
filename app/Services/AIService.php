<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    // ── Model constants ────────────────────────────────────────────────────────
    // Single source of truth for every model reference in this service.
    // Rationale for each choice:
    //   MODEL_DEFAULT    — complex reasoning tasks (risk scoring, evidence review, chatbot)
    //   MODEL_ANALYTICAL — long-form structured reports (executive summaries, gap analysis,
    //                      control explanations) where prose quality matters most
    private const MODEL_DEFAULT = 'claude-opus-4-5';

    private const MODEL_ANALYTICAL = 'claude-sonnet-4-20250514';

    // ── API constants ──────────────────────────────────────────────────────────
    private const API_URL = 'https://api.anthropic.com/v1/messages';

    private const API_VERSION = '2023-06-01';

    // ── Canonical verdict values ───────────────────────────────────────────────
    // All AI methods that return an evidence verdict MUST use exactly these strings.
    // Consumers (EvidenceScoringService, AssessmentComparisonController, frontend)
    // must match these values exactly — do not lowercase or underscore them.
    public const VERDICT_ADEQUATE = 'Adequate';

    public const VERDICT_PARTIAL = 'Partially Adequate';

    public const VERDICT_INSUFFICIENT = 'Insufficient';

    public const VERDICTS = [
        self::VERDICT_ADEQUATE,
        self::VERDICT_PARTIAL,
        self::VERDICT_INSUFFICIENT,
    ];

    // ── Private HTTP transport ─────────────────────────────────────────────────

    /**
     * Single raw Anthropic API call. Every public AI method routes through here.
     *
     * @param  array  $messages  Array of {role, content} turns.
     *                           Content may be a plain string or an array of
     *                           content blocks (multimodal: image, document, text).
     * @param  string  $model  Use one of the MODEL_* class constants.
     * @param  int  $maxTokens  Max completion tokens.
     * @param  string|null  $system  Optional system prompt.
     * @return string Raw response text with markdown fences already stripped.
     *                Returns '' on any API or network failure (callers handle that).
     *
     * TODO(perf): Move long-running callers (reviewEvidence, generateGapAnalysis,
     *             generateExecutiveSummary) to queued Laravel jobs so HTTP requests
     *             are not held open during AI inference. See finding #3.
     */
    private function callClaudeApi(
        array $messages,
        string $model = self::MODEL_DEFAULT,
        int $maxTokens = 1024,
        ?string $system = null,
    ): string {
        try {
            $body = [
                'model' => $model,
                'max_tokens' => $maxTokens,
                'messages' => $messages,
            ];

            if ($system !== null) {
                $body['system'] = $system;
            }

            $response = Http::withoutVerifying()
                ->withHeaders([
                    'x-api-key' => config('services.anthropic.key'),
                    'anthropic-version' => self::API_VERSION,
                    'Content-Type' => 'application/json',
                ])->post(self::API_URL, $body);

            if ($response->failed()) {
                Log::error('AIService: API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'model' => $model,
                ]);

                return '';
            }

            return $this->stripFences($response->json()['content'][0]['text'] ?? '');

        } catch (\Throwable $e) {
            Log::error('AIService: API exception', [
                'message' => $e->getMessage(),
                'model' => $model,
            ]);

            return '';
        }
    }

    // ── Public API ─────────────────────────────────────────────────────────────

    public function validateRiskScores(string $title, string $description, int $likelihood, int $impact): array
    {
        try {
            Log::info('validateRiskScores called', [
                'title' => $title,
                'likelihood' => $likelihood,
                'impact' => $impact,
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
                    'error' => true,
                    'valid' => false,
                    'recommended_likelihood' => $likelihood,
                    'recommended_impact' => $impact,
                    'reasoning' => 'AI validation unavailable. Please check your API configuration.',
                    'confidence' => 'low',
                ];
            }

            $parsed = json_decode($raw, true);

            Log::info('Parsed result', ['parsed' => $parsed]);

            if (! is_array($parsed)) {
                return [
                    'error' => true,
                    'valid' => false,
                    'recommended_likelihood' => $likelihood,
                    'recommended_impact' => $impact,
                    'reasoning' => 'Could not parse AI response.',
                    'confidence' => 'low',
                ];
            }

            return [
                'valid' => (bool) ($parsed['valid'] ?? true),
                'recommended_likelihood' => max(1, min(5, (int) ($parsed['recommended_likelihood'] ?? $likelihood))),
                'recommended_impact' => max(1, min(5, (int) ($parsed['recommended_impact'] ?? $impact))),
                'reasoning' => (string) ($parsed['reasoning'] ?? ''),
                'confidence' => in_array($parsed['confidence'] ?? '', ['high', 'medium', 'low'])
                                                ? $parsed['confidence'] : 'medium',
            ];
        } catch (\Throwable $e) {
            Log::error('validateRiskScores exception', [
                'message' => $e->getMessage(),
                'class' => get_class($e),
            ]);

            return [
                'error' => true,
                'valid' => false,
                'recommended_likelihood' => $likelihood,
                'recommended_impact' => $impact,
                'reasoning' => 'An unexpected error occurred during validation.',
                'confidence' => 'low',
            ];
        }
    }

    /**
     * Compliance chatbot — sends a user message with full conversation history and a live GRC
     * context snapshot to Claude, returning a plain-English markdown response.
     *
     * @param  array<int, array{role: 'user'|'assistant', content: string}>  $history
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
                $role = $turn['role'] ?? '';
                $content = $turn['content'] ?? '';
                if (in_array($role, ['user', 'assistant'], true) && $content !== '') {
                    $messages[] = ['role' => $role, 'content' => (string) $content];
                }
            }
            $messages[] = ['role' => 'user', 'content' => $userMessage];

            $reply = $this->callClaudeApi(
                messages: $messages,
                model: self::MODEL_DEFAULT,
                maxTokens: 2048,
                system: $systemPrompt,
            );

            if (empty($reply)) {
                Log::error('AIService::complianceChatbot: empty response');
            }

            return $reply;

        } catch (\Throwable $e) {
            Log::error('AIService::complianceChatbot exception', ['message' => $e->getMessage()]);

            return '';
        }
    }

    /**
     * Review compliance evidence with full file content.
     *
     * @param  array  $evidenceData  Metadata keys: control_title, control_description, framework,
     *                               evidence_title, evidence_description, file_name, file_type,
     *                               upload_date, expiry_date, uploaded_by
     * @param  string  $fileContent  Plain text, or base64-encoded bytes for images/PDFs.
     * @param  string  $contentType  'text' | 'image/png' | 'image/jpeg' | 'image/webp' |
     *                               'image/gif' | 'application/pdf' | 'unsupported'
     * @param  array|null  $geminiAnalysis  Optional advisory output from GeminiVisionService.
     *                                      Only the success shape (`enabled === true`) should be
     *                                      passed in; null means Claude-only review. The Gemini
     *                                      block is injected into the prompt as advisory context;
     *                                      Claude remains the final reviewer.
     * @return array{verdict: string, confidence: string, strengths: string, gaps: string, recommendation: string, is_relevant: bool}
     */
    public function reviewEvidence(
        array $evidenceData,
        string $fileContent,
        string $contentType,
        ?array $geminiAnalysis = null,
    ): array {
        $default = [
            'verdict' => self::VERDICT_INSUFFICIENT,
            'confidence' => 'Low',
            'strengths' => '',
            'gaps' => 'AI review could not be completed.',
            'recommendation' => 'Please retry the AI review.',
            'is_relevant' => true,
        ];

        try {
            $systemPrompt = <<<'PROMPT'
You are a GRC audit expert. Your task is to assess whether a piece of evidence adequately proves that a specific compliance control is implemented and operating effectively.

You will receive the control ID, title, and description (the exact requirement that must be proven), the framework reference, evidence metadata, and the actual file content.

For image evidence you MAY also receive an advisory "Gemini Vision Preprocessing" block containing OCR text, a visual summary, and security observations. Treat that block as an aid, not as ground truth — cross-reference it against what you can see directly in the image, and remain skeptical. A screenshot of the GRC application itself usually does NOT prove a real underlying policy or control exists unless the screenshot contains actual policy text, configuration values, signatures, or other concrete control evidence.

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
                'Control ID: '.($evidenceData['control_id'] ?? 'N/A'),
                'Control Title: '.($evidenceData['control_title'] ?? 'N/A'),
                'Control Description: '.($evidenceData['control_description'] ?? 'N/A'),
                'Framework: '.($evidenceData['framework'] ?? 'N/A'),
                'Evidence Title: '.($evidenceData['evidence_title'] ?? 'N/A'),
                'Evidence Description: '.($evidenceData['evidence_description'] ?? ''),
                'File Name: '.($evidenceData['file_name'] ?? 'N/A'),
                'File Type: '.($evidenceData['file_type'] ?? 'N/A'),
                'Upload Date: '.($evidenceData['upload_date'] ?? 'N/A'),
                'Expiry Date: '.($evidenceData['expiry_date'] ?? 'No expiry'),
                'Uploaded By: '.($evidenceData['uploaded_by'] ?? 'Unknown'),
            ]);

            // Build optional Gemini advisory block — only when we received a
            // valid `enabled === true` payload from GeminiVisionService.
            $geminiBlock = $this->buildGeminiAdvisoryBlock($geminiAnalysis);

            // Build message content — multimodal for images/PDFs, plain text otherwise
            if (str_starts_with($contentType, 'image/')) {
                $userContent = [
                    ['type' => 'image', 'source' => [
                        'type' => 'base64',
                        'media_type' => $contentType,
                        'data' => $fileContent,
                    ]],
                    ['type' => 'text', 'text' => $meta.$geminiBlock."\n\nThe image above is the uploaded evidence file. Assess it thoroughly."],
                ];
            } elseif ($contentType === 'application/pdf') {
                $userContent = [
                    ['type' => 'document', 'source' => [
                        'type' => 'base64',
                        'media_type' => 'application/pdf',
                        'data' => $fileContent,
                    ]],
                    ['type' => 'text', 'text' => $meta."\n\nThe PDF above is the uploaded evidence file. Assess it thoroughly."],
                ];
            } elseif ($contentType === 'unsupported') {
                $userContent = $meta."\n\nNote: ".$fileContent."\n\nPlease assess based on the metadata above.";
            } else {
                $userContent = $meta."\n\n--- FILE CONTENT ---\n".$fileContent;
            }

            $text = $this->callClaudeApi(
                messages: [['role' => 'user', 'content' => $userContent]],
                model: self::MODEL_DEFAULT,
                maxTokens: 1024,
                system: $systemPrompt,
            );

            if (empty($text)) {
                Log::error('AIService::reviewEvidence: empty response');

                return $default;
            }

            $parsed = json_decode($text, true);

            if (! is_array($parsed)) {
                Log::warning('AIService::reviewEvidence: invalid JSON', ['response' => $text]);

                return $default;
            }

            return [
                'verdict' => in_array($parsed['verdict'] ?? '', self::VERDICTS, true)
                    ? $parsed['verdict'] : self::VERDICT_INSUFFICIENT,
                'confidence' => in_array($parsed['confidence'] ?? '', ['High', 'Medium', 'Low'], true)
                    ? $parsed['confidence'] : 'Medium',
                'strengths' => (string) ($parsed['strengths'] ?? ''),
                'gaps' => (string) ($parsed['gaps'] ?? ''),
                'recommendation' => (string) ($parsed['recommendation'] ?? ''),
                'is_relevant' => isset($parsed['is_relevant']) ? (bool) $parsed['is_relevant'] : true,
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
     * @param  array  $data  Pre-gathered GRC metrics (compliance, risks, evidence, frameworks…)
     * @return array{narrative: string, recommendations: string[]}
     */
    public function generateExecutiveSummary(array $data): array
    {
        $default = [
            'narrative' => 'The AI executive summary could not be generated at this time. Please review the data tables below for a manual assessment of the current security posture.',
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
            $userPrompt = "Generate a professional executive summary based on the following GRC system data:\n\n{$contextJson}";

            $text = $this->callClaudeApi(
                messages: [['role' => 'user', 'content' => $userPrompt]],
                model: self::MODEL_ANALYTICAL,
                maxTokens: 2048,
                system: $systemPrompt,
            );

            if (empty($text)) {
                Log::error('AIService::generateExecutiveSummary: empty response');

                return $default;
            }

            $parsed = json_decode($text, true);

            if (! is_array($parsed) || empty($parsed['narrative'])) {
                Log::warning('AIService::generateExecutiveSummary: invalid JSON', ['raw' => $text]);

                return $default;
            }

            return [
                'narrative' => (string) ($parsed['narrative'] ?? $default['narrative']),
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
            .json_encode($data, JSON_UNESCAPED_UNICODE);

        try {
            $text = $this->callClaudeApi(
                messages: [['role' => 'user', 'content' => $userPrompt]],
                model: self::MODEL_ANALYTICAL,
                maxTokens: 3000,
                system: $systemPrompt,
            );

            if (empty($text)) {
                throw new \RuntimeException('AI returned empty response for gap analysis');
            }

            $parsed = json_decode($text, true);
            if (! is_array($parsed)) {
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
     * @return string Raw JSON string with explanation fields
     */
    public function explainControl(array $controlData): string
    {
        $default = json_encode([
            'plain_english' => 'This control requires your organization to implement appropriate measures as defined by the framework.',
            'what_it_requires' => [
                'Review the control description and understand its scope',
                'Implement appropriate policies and procedures',
                'Assign ownership and accountability for the control',
                'Maintain documented evidence of compliance',
            ],
            'evidence_examples' => [
                'Policy document signed by management',
                'Procedure documentation',
                'Audit or review records',
                'System configuration screenshots',
            ],
            'compliant_looks_like' => 'A compliant organization has documented policies, implemented procedures, and maintains evidence that the control is operating effectively.',
            'non_compliant_risks' => 'Failure to implement this control may expose the organization to compliance violations and security risks.',
        ]);

        try {
            $code = $controlData['code'] ?? '';
            $name = $controlData['name'] ?? '';
            $description = $controlData['description'] ?? '';
            $framework = $controlData['framework'] ?? '';
            $domain = $controlData['domain'] ?? '';

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

            $text = $this->callClaudeApi(
                messages: [['role' => 'user', 'content' => $prompt]],
                model: self::MODEL_ANALYTICAL,
                maxTokens: 1024,
            );

            if (empty($text)) {
                Log::error('AIService::explainControl: empty response');

                return $default;
            }

            $parsed = json_decode($text, true);
            if (! is_array($parsed)) {
                Log::warning('AIService::explainControl: invalid JSON', ['raw' => $text]);

                return $default;
            }

            return json_encode($parsed);

        } catch (\Throwable $e) {
            Log::error('AIService::explainControl exception', ['message' => $e->getMessage()]);

            return $default;
        }
    }

    /**
     * Analyze a security configuration file or screenshot.
     *
     * For text-based config files (.json, .yaml, .ini, .conf, ...) Claude
     * receives the raw content as a plain text user message — existing
     * behaviour, unchanged.
     *
     * For image screenshots (image/png, image/jpeg, image/webp) Claude
     * receives a multimodal user message: the image as a vision content block
     * plus an instruction text block. When `$geminiAnalysis` is provided
     * (`enabled === true`), an advisory section is injected so Claude can
     * cross-reference Gemini's OCR/observations — but Claude remains the
     * final reviewer and is told explicitly to be skeptical of screenshots.
     *
     * Output JSON shape is identical for both code paths so the existing
     * frontend, DB columns, and findings persistence stay compatible.
     *
     * @param  string  $contentType  'text' for config files, or 'image/png'|'image/jpeg'|'image/webp' for screenshots.
     * @param  array|null  $geminiAnalysis  GeminiVisionService success-shape payload, or null.
     */
    public function analyzeSecurityConfig(
        string $content,
        string $fileType,
        string $fileName,
        array $frameworkControls,
        string $contentType = 'text',
        ?array $geminiAnalysis = null,
    ): array {
        try {
            $frameworkControlsJson = json_encode($frameworkControls, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            $isImage = str_starts_with($contentType, 'image/');

            // Screenshot-specific skepticism rules — only added when the
            // upload is actually an image. Text-config behaviour is unchanged.
            $screenshotGuidance = $isImage ? <<<'IMG'

Analysis guidelines for screenshots/images of configuration panels:
- A screenshot of a configuration panel does not prove this setting is currently active, was not changed after the screenshot, or applies to all relevant systems.
- Screenshots are point-in-time evidence only. Flag this limitation in your analysis (raise it in the summary or in an info-severity finding when relevant).
- Extracted text from OCR may contain errors. Cross-reference visible settings carefully against what you can see in the image.
- Treat the Gemini Vision Preprocessing block (if present) as advisory only — it can mis-OCR digits, mask glyphs, or invent text. Verify against the actual image when in doubt.
- Prefer the visible image as ground truth over the OCR text when they disagree.

IMG : '';

            $systemPrompt = <<<PROMPT
You are a senior information security auditor performing a configuration security review.

File name: {$fileName}
Detected file type: {$fileType}
Active framework controls: {$frameworkControlsJson}

Analyze the provided file content for security issues, misconfigurations, and compliance concerns.

Analysis guidelines based on file type:
- CSV/XLSX user lists: Check for shared accounts, generic naming (admin, test, user1), missing expiry dates, excessive admin accounts, inactive accounts, blank emails, backdoor accounts
- Password/security policies: Check against ISO 27001 A.9.4.3 and NIST SP 800-63B — minimum length (should be 12+), complexity, rotation period, MFA, lockout policy, password history, dictionary words
- Config files (INI/YAML/JSON/CONF/TXT): Check for hardcoded credentials/API keys/secrets, debug mode enabled, insecure protocols, binding to 0.0.0.0, SSL verification disabled, expose_php On, open CORS, FTP enabled, display_errors On
{$screenshotGuidance}
Respond ONLY with a valid JSON object, no markdown fences, no preamble:
{
  "summary": "Executive summary in 2-3 sentences",
  "compliance_score": 0-100,
  "file_type_detected": "csv_user_list" or "password_policy" or "config_file" or "generic",
  "findings": [
    {
      "finding_number": 1,
      "severity": "critical" or "high" or "medium" or "low" or "info",
      "title": "Short title",
      "description": "Detailed description",
      "affected_item": "Specific line or row affected",
      "recommendation": "How to fix this",
      "control_reference": "ISO 27001 or NIST control ID or null",
      "compliance_impact": "How this affects compliance"
    }
  ]
}
PROMPT;

            // Build the user message — multimodal for images, plain text for configs.
            $geminiBlock = $this->buildGeminiAdvisoryBlock($geminiAnalysis);

            if ($isImage) {
                $userContent = [
                    ['type' => 'image', 'source' => [
                        'type' => 'base64',
                        'media_type' => $contentType,
                        'data' => $content,
                    ]],
                    ['type' => 'text', 'text' =>
                        "The image above is the uploaded screenshot — analyze it as a security configuration screenshot.".$geminiBlock,
                    ],
                ];
            } else {
                $userContent = "Please analyze the following file content:\n\n{$content}";
            }

            $text = $this->callClaudeApi(
                messages: [['role' => 'user', 'content' => $userContent]],
                model: self::MODEL_ANALYTICAL,
                maxTokens: 4096,
                system: $systemPrompt,
            );

            if (empty($text)) {
                return ['error' => true, 'message' => 'API request failed'];
            }

            $parsed = json_decode($text, true);

            if (! is_array($parsed)) {
                return ['error' => true, 'message' => 'Could not parse AI response'];
            }

            return $parsed;

        } catch (\Throwable $e) {
            return ['error' => true, 'message' => 'API request failed: '.$e->getMessage()];
        }
    }

    /**
     * Simple single-turn Claude call. Public for callers that need a raw AI completion
     * without building a full messages array (e.g. validateRiskScores).
     *
     * Uses MODEL_DEFAULT and strips markdown fences from the response.
     */
    public function callClaude(string $prompt): string
    {
        return $this->callClaudeApi(
            messages: [['role' => 'user', 'content' => $prompt]],
            model: self::MODEL_DEFAULT,
            maxTokens: 1024,
        );
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    /**
     * Render the optional Gemini Vision Preprocessing advisory block for the
     * evidence-review prompt. Returns an empty string when no usable analysis
     * was provided so the existing Claude-only behaviour is unchanged.
     *
     * Claude is told explicitly that this block is advisory and may be wrong —
     * the prompt instructs it to cross-reference rather than blindly trust.
     */
    private function buildGeminiAdvisoryBlock(?array $analysis): string
    {
        if (! is_array($analysis) || ($analysis['enabled'] ?? false) !== true) {
            return '';
        }

        $observations = $analysis['security_observations'] ?? [];
        if (! is_array($observations)) {
            $observations = [];
        }
        $observationsText = empty($observations)
            ? '(none)'
            : '- '.implode("\n- ", array_map('strval', $observations));

        $visualSummary = trim((string) ($analysis['visual_summary'] ?? ''));
        $visibleText = trim((string) ($analysis['visible_text'] ?? ''));
        $docType = trim((string) ($analysis['document_or_screenshot_type'] ?? 'unknown'));
        $confidence = trim((string) ($analysis['confidence'] ?? 'medium'));
        $limitations = trim((string) ($analysis['limitations'] ?? ''));

        return "\n\n--- Gemini Vision Preprocessing (advisory only, not ground truth) ---\n"
            ."Visual Summary: ".($visualSummary !== '' ? $visualSummary : '(none)')."\n"
            ."Extracted Text (OCR): ".($visibleText !== '' ? $visibleText : '(none)')."\n"
            ."Security Observations:\n".$observationsText."\n"
            ."Document Type: ".$docType."\n"
            ."Confidence: ".$confidence."\n"
            ."Limitations: ".($limitations !== '' ? $limitations : '(none)')."\n"
            ."--- End Gemini Preprocessing ---";
    }

    /**
     * Strip markdown code fences that models sometimes emit despite instructions.
     * Handles ```json ... ```, ``` ... ```, and bare closing fences.
     */
    private function stripFences(string $text): string
    {
        $text = preg_replace('/^```json\s*/i', '', trim($text));
        $text = preg_replace('/^```\s*/i', '', trim($text));
        $text = preg_replace('/```$/m', '', trim($text));

        return trim($text);
    }
}
