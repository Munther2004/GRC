<?php

namespace App\Jobs;

use App\Models\FileReputationCheck;
use App\Services\VirusTotalService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class RunFileReputationCheck implements ShouldQueue
{
    use Queueable;
    use SerializesModels;

    public int $tries = 2;

    public int $backoff = 30;

    public function __construct(public FileReputationCheck $reputationCheck) {}

    public function handle(VirusTotalService $vt): void
    {
        $check = $this->reputationCheck->refresh();

        $absolutePath = Storage::disk('public')->path($check->file_path);

        // Resolve the baseline (upload-time) hash from the polymorphic parent.
        // Files uploaded before this feature won't have one — that maps to
        // integrity_status = 'unknown' rather than a tampering claim.
        $baselineHash = $this->resolveBaselineHash($check);

        if (! is_file($absolutePath)) {
            Log::warning('RunFileReputationCheck: file missing on disk', [
                'check_id' => $check->id,
                'file_path' => $check->file_path,
            ]);

            $check->update([
                'status' => 'error',
                'integrity_status' => 'error',
                'upload_sha256' => $baselineHash,
                'checked_at' => now(),
            ]);

            return;
        }

        try {
            $sha256 = $vt->hashFile($absolutePath);
            $integrityStatus = $this->compareIntegrity($baselineHash, $sha256);

            $check->update([
                'sha256' => $sha256,
                'upload_sha256' => $baselineHash,
                'integrity_status' => $integrityStatus,
            ]);

            $attributes = $vt->getFileReportByHash($sha256);

            if ($attributes === null) {
                // VirusTotal has no record for this hash. The upload+poll path
                // (services.virustotal.upload_files) is intentionally deferred —
                // mark not_found so the UI can prompt the reviewer.
                $check->update([
                    'status' => 'not_found',
                    'checked_at' => now(),
                ]);

                return;
            }

            $summary = $vt->summarize($attributes);

            $check->update([
                'status' => $summary['status'],
                'malicious_count' => $summary['malicious_count'],
                'suspicious_count' => $summary['suspicious_count'],
                'undetected_count' => $summary['undetected_count'],
                'harmless_count' => $summary['harmless_count'],
                'timeout_count' => $summary['timeout_count'],
                'last_analysis_date' => $summary['last_analysis_date'],
                'raw_summary_json' => $summary['raw_summary'],
                'checked_at' => now(),
            ]);
        } catch (Throwable $e) {
            Log::error('RunFileReputationCheck: lookup failed', [
                'check_id' => $check->id,
                'sha256' => $check->sha256,
                'error' => $e->getMessage(),
            ]);

            $check->update([
                'status' => 'error',
                'checked_at' => now(),
            ]);

            throw $e;
        }
    }

    public function failed(?Throwable $e): void
    {
        Log::error('RunFileReputationCheck: job failed permanently', [
            'check_id' => $this->reputationCheck->id,
            'error' => $e?->getMessage(),
        ]);

        FileReputationCheck::whereKey($this->reputationCheck->id)->update([
            'status' => 'error',
            'checked_at' => now(),
        ]);
    }

    /**
     * Pull the baseline hash off the morphed-to model (Evidence / SecurityAudit).
     * Returns null if the parent is missing or the column was never populated.
     */
    private function resolveBaselineHash(FileReputationCheck $check): ?string
    {
        $checkable = $check->checkable;

        if ($checkable === null) {
            return null;
        }

        $hash = $checkable->upload_sha256 ?? null;

        return is_string($hash) && $hash !== '' ? $hash : null;
    }

    private function compareIntegrity(?string $baseline, string $current): string
    {
        if ($baseline === null) {
            return 'unknown';
        }

        return hash_equals($baseline, $current) ? 'verified' : 'tampered';
    }
}
