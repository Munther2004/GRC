<?php

namespace App\Jobs;

use App\Models\Control;
use App\Models\Framework;
use App\Models\Notification;
use App\Models\SecurityAudit;
use App\Models\SecurityAuditFinding;
use App\Services\AIService;
use App\Services\EvidenceFileExtractor;
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

    public function handle(AIService $ai, EvidenceFileExtractor $extractor): void
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

            $frameworks = Framework::where('is_active', true)
                ->get(['id', 'short_name', 'name'])
                ->map(fn ($f) => ['short_name' => $f->short_name, 'name' => $f->name])
                ->all();

            $result = $ai->analyzeSecurityConfig(
                content: $extracted['content'],
                fileType: $audit->file_type,
                fileName: $audit->file_name,
                frameworkControls: $frameworks,
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
     * @return array{content_type:string, content:string}
     */
    private function readContent(SecurityAudit $audit, EvidenceFileExtractor $extractor): array
    {
        $mime = strtolower($audit->file_type);
        $textLikeExtensions = ['json', 'yaml', 'yml', 'ini', 'conf', 'config', 'cfg', 'env', 'toml', 'xml'];
        $extension = strtolower(pathinfo($audit->file_name, PATHINFO_EXTENSION));

        // For structured config formats Claude reads as text — bypass extractor's mime gating
        if (in_array($extension, $textLikeExtensions, true)) {
            $raw = Storage::disk('public')->get($audit->file_path) ?? '';

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
