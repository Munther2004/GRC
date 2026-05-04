<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Optional image-preprocessing layer for the evidence-review pipeline.
 *
 * Gemini is asked for OCR text, a visual summary, and security-relevant
 * observations. The result is fed to Claude as advisory context — Claude
 * remains the final compliance reviewer.
 *
 * Failures (missing key, network error, 429, malformed JSON) never throw;
 * the caller treats a non-`enabled` return as a Claude-only fallback.
 */
class GeminiVisionService
{
    /** Hard cap so we never hold an HTTP request open longer than this. */
    private const TIMEOUT_SECONDS = 15;

    /** Image MIME types Gemini accepts in this integration. */
    private const SUPPORTED_MIME_TYPES = [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/webp',
    ];

    private const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

    /**
     * Analyze an image and return a structured advisory payload for Claude.
     *
     * Success shape:
     *   [
     *       'enabled' => true,
     *       'provider' => 'gemini',
     *       'model' => 'gemini-2.0-flash',
     *       'visual_summary' => '...',
     *       'visible_text' => '...',
     *       'security_observations' => ['...'],
     *       'document_or_screenshot_type' => 'policy screenshot|dashboard screenshot|photo|unknown',
     *       'limitations' => '...',
     *       'confidence' => 'high|medium|low',
     *       'error' => null,
     *   ]
     *
     * Failure shape:
     *   ['enabled' => false, 'provider' => 'gemini', 'error' => '...']
     *
     * @param  array{evidence_id?: int|string, mime_type?: string, control_id?: string|null}  $metadata
     */
    public function analyzeImage(string $absolutePath, array $metadata = []): array
    {
        $evidenceId = $metadata['evidence_id'] ?? null;
        $mimeHint = strtolower(trim($metadata['mime_type'] ?? ''));

        // Feature flag — respect the disabled-by-default contract.
        if (! config('services.gemini.image_preprocessing')) {
            return $this->failure('preprocessing_disabled', $evidenceId, 'Gemini image preprocessing flag is off');
        }

        $apiKey = config('services.gemini.key');
        if (empty($apiKey)) {
            return $this->failure('missing_api_key', $evidenceId, 'GEMINI_API_KEY not configured');
        }

        if (! is_string($absolutePath) || $absolutePath === '' || ! file_exists($absolutePath)) {
            return $this->failure('file_missing', $evidenceId, 'Image file not found at path');
        }

        // Resolve mime type — accept caller hint, else infer from extension.
        $mime = $this->resolveMime($absolutePath, $mimeHint);
        if (! in_array($mime, self::SUPPORTED_MIME_TYPES, true)) {
            return $this->failure('unsupported_mime', $evidenceId, "Unsupported image MIME: {$mime}");
        }
        // Gemini expects 'image/jpeg' even when extension is .jpg
        $apiMime = $mime === 'image/jpg' ? 'image/jpeg' : $mime;

        // Read & encode — wrap in try/catch so any I/O issue falls back gracefully.
        try {
            $bytes = @file_get_contents($absolutePath);
            if ($bytes === false) {
                return $this->failure('read_failed', $evidenceId, 'file_get_contents returned false');
            }
            $base64 = base64_encode($bytes);
        } catch (\Throwable $e) {
            return $this->failure('read_exception', $evidenceId, $e->getMessage());
        }

        $model = config('services.gemini.model') ?: 'gemini-2.0-flash';

        Log::info('GeminiVisionService: preprocessing started', [
            'evidence_id' => $evidenceId,
            'mime' => $apiMime,
            'model' => $model,
        ]);

        try {
            $response = Http::timeout(self::TIMEOUT_SECONDS)
                ->withoutVerifying() // matches Laragon dev TLS handling used elsewhere
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post(
                    self::API_BASE."/{$model}:generateContent?key={$apiKey}",
                    $this->buildRequestBody($apiMime, $base64),
                );
        } catch (\Throwable $e) {
            Log::warning('GeminiVisionService: HTTP exception, falling back to Claude-only', [
                'evidence_id' => $evidenceId,
                'error' => $e->getMessage(),
            ]);

            return $this->failure('http_exception', $evidenceId, $e->getMessage());
        }

        if ($response->status() === 429) {
            Log::warning('GeminiVisionService: rate limited (429), falling back to Claude-only', [
                'evidence_id' => $evidenceId,
            ]);

            return $this->failure('rate_limited', $evidenceId, 'Gemini returned 429 — Claude-only fallback used');
        }

        if ($response->failed()) {
            Log::warning('GeminiVisionService: API call failed, falling back to Claude-only', [
                'evidence_id' => $evidenceId,
                'status' => $response->status(),
                'body_preview' => substr((string) $response->body(), 0, 300),
            ]);

            return $this->failure('api_failure', $evidenceId, "HTTP {$response->status()}");
        }

        $rawText = $this->extractCandidateText($response->json() ?? []);
        if ($rawText === null) {
            return $this->failure('no_candidate_text', $evidenceId, 'Gemini returned no parseable candidate text');
        }

        $parsed = $this->parseJsonResponse($rawText);
        if ($parsed === null) {
            Log::warning('GeminiVisionService: JSON parse failed', [
                'evidence_id' => $evidenceId,
                'preview' => substr($rawText, 0, 200),
            ]);

            return $this->failure('invalid_json', $evidenceId, 'Could not parse Gemini JSON response');
        }

        $result = $this->normalizeResult($parsed, $model);

        Log::info('GeminiVisionService: preprocessing succeeded', [
            'evidence_id' => $evidenceId,
            'gemini_confidence' => $result['confidence'],
            'document_type' => $result['document_or_screenshot_type'],
        ]);

        return $result;
    }

    // ── Internals ──────────────────────────────────────────────────────────────

    private function buildRequestBody(string $mime, string $base64): array
    {
        $instruction = <<<'PROMPT'
You are a vision preprocessor for a GRC (Governance, Risk, Compliance) evidence-review system.

Your job is to extract objective, observable information from an image so that a downstream compliance auditor (Claude) can reason about it.

You are NOT the final reviewer. Do not judge whether the image proves a control. Only describe what the image shows.

Return ONLY a single JSON object — no markdown fences, no preamble, no trailing text — with exactly these keys:
{
  "visual_summary": "1-3 sentence neutral description of what the image depicts",
  "visible_text": "All readable text in the image, OCR-style. If no text, return an empty string.",
  "security_observations": ["short observation 1", "short observation 2"],
  "document_or_screenshot_type": "policy screenshot | dashboard screenshot | photo | diagram | terminal output | unknown",
  "limitations": "Anything you could not read, was blurry, cropped, or ambiguous. Empty string if none.",
  "confidence": "high | medium | low"
}

Rules:
- security_observations should call out things like exposed credentials, configuration values, account names, MFA settings, password rules, dates, signatures, or other compliance-relevant items.
- Do NOT invent or hallucinate text that isn't visible.
- Do NOT include opinions about whether evidence is sufficient.
- Keep visible_text faithful — preserve numbers and identifiers verbatim.
PROMPT;

        return [
            'contents' => [[
                'role' => 'user',
                'parts' => [
                    ['text' => $instruction],
                    ['inline_data' => [
                        'mime_type' => $mime,
                        'data' => $base64,
                    ]],
                ],
            ]],
            'generationConfig' => [
                'temperature' => 0.1,
                'maxOutputTokens' => 1024,
                'responseMimeType' => 'application/json',
            ],
        ];
    }

    /**
     * Pull the first text candidate out of the Gemini response envelope.
     * Returns null if the shape is unexpected.
     */
    private function extractCandidateText(array $json): ?string
    {
        $parts = $json['candidates'][0]['content']['parts'] ?? null;
        if (! is_array($parts)) {
            return null;
        }
        foreach ($parts as $part) {
            if (is_array($part) && isset($part['text']) && is_string($part['text']) && $part['text'] !== '') {
                return $part['text'];
            }
        }

        return null;
    }

    /**
     * Strip optional markdown fences and decode JSON. Returns null on failure.
     */
    private function parseJsonResponse(string $raw): ?array
    {
        $text = trim($raw);
        $text = preg_replace('/^```json\s*/i', '', $text) ?? $text;
        $text = preg_replace('/^```\s*/i', '', $text) ?? $text;
        $text = preg_replace('/```$/m', '', $text) ?? $text;
        $text = trim($text);

        $decoded = json_decode($text, true);

        return is_array($decoded) ? $decoded : null;
    }

    /**
     * Coerce parsed JSON into the success shape, with sane defaults for any
     * missing key so the downstream prompt never crashes.
     */
    private function normalizeResult(array $parsed, string $model): array
    {
        $confidence = strtolower((string) ($parsed['confidence'] ?? ''));
        $confidence = in_array($confidence, ['high', 'medium', 'low'], true) ? $confidence : 'medium';

        $observations = $parsed['security_observations'] ?? [];
        if (! is_array($observations)) {
            $observations = [];
        }
        $observations = array_values(array_filter(
            array_map(fn ($v) => is_string($v) ? trim($v) : '', $observations),
            fn ($v) => $v !== '',
        ));

        return [
            'enabled' => true,
            'provider' => 'gemini',
            'model' => $model,
            'visual_summary' => (string) ($parsed['visual_summary'] ?? ''),
            'visible_text' => (string) ($parsed['visible_text'] ?? ''),
            'security_observations' => $observations,
            'document_or_screenshot_type' => (string) ($parsed['document_or_screenshot_type'] ?? 'unknown'),
            'limitations' => (string) ($parsed['limitations'] ?? ''),
            'confidence' => $confidence,
            'error' => null,
        ];
    }

    private function resolveMime(string $absolutePath, string $hint): string
    {
        if ($hint !== '') {
            return $hint;
        }
        $ext = strtolower(pathinfo($absolutePath, PATHINFO_EXTENSION));
        return match ($ext) {
            'png' => 'image/png',
            'jpg', 'jpeg' => 'image/jpeg',
            'webp' => 'image/webp',
            default => 'application/octet-stream',
        };
    }

    /**
     * Build a structured failure payload and emit a single warning log.
     */
    private function failure(string $reason, int|string|null $evidenceId, string $message): array
    {
        Log::info('GeminiVisionService: preprocessing skipped or failed', [
            'evidence_id' => $evidenceId,
            'reason' => $reason,
            'message' => $message,
        ]);

        return [
            'enabled' => false,
            'provider' => 'gemini',
            'error' => $reason.': '.$message,
        ];
    }
}
