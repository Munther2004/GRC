<?php

namespace App\Jobs;

use App\Models\Control;
use App\Models\Framework;
use App\Models\Notification;
use App\Models\SecurityAudit;
use App\Models\SecurityAuditFinding;
use App\Services\AIService;
use App\Services\EvidenceFileExtractor;
use App\Services\GeminiVisionService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AnalyzeSecurityConfigJob implements ShouldQueue
{
    use Queueable;

    public int $timeout = 300;

    public int $tries = 1;

    public function __construct(public int $auditId) {}

    public function handle(AIService $ai, EvidenceFileExtractor $extractor, GeminiVisionService $vision): void
    {
        $audit = SecurityAudit::find($this->auditId);
        if (! $audit) {
            Log::warning('AnalyzeSecurityConfigJob: audit no longer exists', ['id' => $this->auditId]);

            return;
        }

        $audit->update(['status' => 'analyzing']);

        try {
            // Extract content using the right strategy for the file type
            $extracted = $this->readContent($audit, $extractor);

            // Optional Gemini Vision preprocessing — image uploads only.
            // Three gates must pass: extracted content is an image, the
            // GEMINI_IMAGE_PREPROCESSING flag is on, and the API key is set.
            // Any failure (missing key, 429, network, malformed JSON) returns
            // null and Claude reviews the image on its own.
            $geminiAnalysis = $this->preprocessWithGeminiIfImage($audit, $extracted, $vision);

            $frameworks = Framework::where('is_active', true)
                ->get(['id', 'short_name', 'name'])
                ->map(fn ($f) => ['short_name' => $f->short_name, 'name' => $f->name])
                ->all();

            $result = $ai->analyzeSecurityConfig(
                content: $extracted['content'],
                fileType: $audit->file_type,
                fileName: $audit->file_name,
                frameworkControls: $frameworks,
                contentType: $extracted['content_type'],
                geminiAnalysis: $geminiAnalysis,
            );

            if (! empty($result['error'])) {
                throw new \RuntimeException($result['message'] ?? 'AI analysis failed');
            }

            $findings = $result['findings'] ?? [];
            $counts = $this->countSeverities($findings);

            $audit->update([
                'status' => 'completed',
                'findings' => $findings,
                'summary' => $result['summary'] ?? '',
                'compliance_score' => $result['compliance_score'] ?? null,
                'frameworks_checked' => $result['frameworks_checked'] ?? [],
                'controls_referenced' => $result['controls_referenced'] ?? [],
                'total_findings' => count($findings),
                'critical_count' => $counts['critical'],
                'high_count' => $counts['high'],
                'medium_count' => $counts['medium'],
                'low_count' => $counts['low'],
                'info_count' => $counts['info'],
                'analyzed_at' => now(),
            ]);

            $this->persistFindings($audit, $findings);
            $this->notifyCompletion($audit, $counts);
        } catch (\Throwable $e) {
            Log::error('AnalyzeSecurityConfigJob: failed', [
                'audit_id' => $audit->id,
                'error' => $e->getMessage(),
            ]);

            $audit->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            Notification::create([
                'user_id' => $audit->user_id,
                'type' => 'security_audit_failed',
                'title' => 'Security Audit Failed',
                'message' => "Analysis of {$audit->file_name} could not be completed: {$e->getMessage()}",
                'url' => "/security-audits/{$audit->id}",
                'is_read' => false,
            ]);
        }
    }

    /**
     * For PNG/JPEG/WEBP screenshots only, run the Gemini Vision preprocessing
     * layer. Returns the success-shape array when Gemini ran, null otherwise.
     *
     * Logging mirrors the Evidence-review pipeline so dashboards/alerts can
     * track Security-Audit Gemini usage independently.
     *
     * @param  array{content_type:string, content:string}  $extracted
     */
    private function preprocessWithGeminiIfImage(
        SecurityAudit $audit,
        array $extracted,
        GeminiVisionService $vision,
    ): ?array {
        $candidateMimes = ['image/png', 'image/jpeg', 'image/webp'];
        $isImage = in_array($extracted['content_type'], $candidateMimes, true);
        if (! $isImage) {
            return null;
        }

        if (! config('services.gemini.image_preprocessing') || empty(config('services.gemini.key'))) {
            // Flag off or key missing — Claude-only path. Don't even spin up
            // the service; just note it once for traceability.
            Log::info('Security Audit: Gemini preprocessing skipped (disabled or unconfigured)', [
                'audit_id' => $audit->id,
                'file_type' => $extracted['content_type'],
            ]);

            return null;
        }

        Log::info('Security Audit: Gemini preprocessing started', [
            'audit_id' => $audit->id,
            'file_type' => $extracted['content_type'],
        ]);

        try {
            $absolutePath = \App\Support\StorageHelper::tempLocalPath(
                config('filesystems.evidence_disk'),
                $audit->file_path,
            );
            $candidate = $vision->analyzeImage($absolutePath, [
                'evidence_id' => $audit->id, // reused as a generic source-id for the log line
                'mime_type' => $extracted['content_type'],
                'control_id' => null,
            ]);
        } catch (\Throwable $e) {
            // GeminiVisionService is documented as never throwing, but defend
            // anyway — Claude-only fallback is always the safe path.
            Log::warning('Security Audit: Gemini preprocessing failed — Claude-only fallback', [
                'audit_id' => $audit->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }

        if (($candidate['enabled'] ?? false) !== true) {
            Log::warning('Security Audit: Gemini preprocessing failed — Claude-only fallback', [
                'audit_id' => $audit->id,
                'reason' => $candidate['error'] ?? 'unknown',
            ]);

            return null;
        }

        Log::info('Security Audit: Gemini preprocessing succeeded', [
            'audit_id' => $audit->id,
            'gemini_confidence' => $candidate['confidence'] ?? null,
            'document_type' => $candidate['document_or_screenshot_type'] ?? null,
        ]);

        return $candidate;
    }

    /**
     * @return array{content_type:string, content:string}
     */
    private function readContent(SecurityAudit $audit, EvidenceFileExtractor $extractor): array
    {
        $mime = strtolower($audit->file_type);
        $textLikeExtensions = ['json', 'yaml', 'yml', 'ini', 'conf', 'config', 'cfg', 'env', 'toml', 'xml'];
        $extension = strtolower(pathinfo($audit->file_name, PATHINFO_EXTENSION));

        // For structured config formats Claude reads as text — bypass extractor's mime gating
        if (in_array($extension, $textLikeExtensions, true)) {
            $raw = Storage::disk(config('filesystems.evidence_disk'))->get($audit->file_path) ?? '';

            return [
                'content_type' => 'text',
                'content' => $this->truncate($raw),
            ];
        }

        return $extractor->extract($audit->file_path, $mime);
    }

    private function truncate(string $text, int $limit = 30000): string
    {
        if (strlen($text) <= $limit) {
            return $text;
        }

        return substr($text, 0, $limit)."\n\n[Content truncated at {$limit} characters]";
    }

    private function countSeverities(array $findings): array
    {
        $counts = ['critical' => 0, 'high' => 0, 'medium' => 0, 'low' => 0, 'info' => 0];
        foreach ($findings as $f) {
            $sev = $f['severity'] ?? 'info';
            if (isset($counts[$sev])) {
                $counts[$sev]++;
            }
        }

        return $counts;
    }

    private function persistFindings(SecurityAudit $audit, array $findings): void
    {
        foreach ($findings as $i => $f) {
            $controlId = null;
            $ref = trim($f['control_reference'] ?? '');
            if ($ref !== '') {
                $controlId = Control::where('control_id', 'LIKE', $ref)
                    ->orWhere('control_id', 'LIKE', $ref.'%')
                    ->value('id');
            }

            SecurityAuditFinding::create([
                'security_audit_id' => $audit->id,
                'finding_number' => $i + 1,
                'severity' => $f['severity'],
                'title' => $f['title'],
                'description' => $f['description'],
                'affected_item' => $f['affected_item'] ?: null,
                'recommendation' => $f['recommendation'],
                'control_reference' => $ref ?: null,
                'control_id' => $controlId,
                'compliance_impact' => $f['compliance_impact'] ?: null,
            ]);
        }
    }

    private function notifyCompletion(SecurityAudit $audit, array $counts): void
    {
        $critical = $counts['critical'];
        $high = $counts['high'];

        $title = $critical > 0 || $high > 0
            ? 'Security Audit Found Critical Issues'
            : 'Security Audit Complete';

        $message = "Analysis of {$audit->file_name} found {$audit->total_findings} findings"
            .($critical > 0 ? " ({$critical} critical, {$high} high)" : '.');

        Notification::create([
            'user_id' => $audit->user_id,
            'type' => 'security_audit_complete',
            'title' => $title,
            'message' => $message,
            'url' => "/security-audits/{$audit->id}",
            'is_read' => false,
        ]);
    }
}
