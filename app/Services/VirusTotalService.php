<?php

namespace App\Services;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class VirusTotalService
{
    private const API_BASE = 'https://www.virustotal.com/api/v3';

    public function isEnabled(): bool
    {
        return (bool) config('services.virustotal.enabled');
    }

    public function hashFile(string $absolutePath): string
    {
        if (! is_file($absolutePath)) {
            throw new RuntimeException("VirusTotalService: file not found at path [{$absolutePath}]");
        }

        $hash = @hash_file('sha256', $absolutePath);

        if ($hash === false) {
            throw new RuntimeException("VirusTotalService: failed to hash file [{$absolutePath}]");
        }

        return $hash;
    }

    /**
     * Look up an existing VirusTotal report by SHA-256.
     *
     * @return array<string, mixed>|null data.attributes block, or null when VT has no record (404).
     */
    public function getFileReportByHash(string $sha256): ?array
    {
        $apiKey = $this->requireApiKey();

        try {
            $response = Http::timeout($this->timeout())
                ->when(
                    app()->environment('local', 'testing'),
                    fn ($http) => $http->withoutVerifying(),
                )
                ->withHeaders(['x-apikey' => $apiKey])
                ->get(self::API_BASE."/files/{$sha256}");
        } catch (\Throwable $e) {
            Log::error('VirusTotalService: HTTP exception on file report lookup', [
                'sha256' => $sha256,
                'error' => $e->getMessage(),
            ]);

            throw new RuntimeException('VirusTotal lookup failed: '.$e->getMessage(), 0, $e);
        }

        if ($response->status() === 404) {
            return null;
        }

        if ($response->status() === 200) {
            $json = $response->json();

            return is_array($json['data']['attributes'] ?? null) ? $json['data']['attributes'] : null;
        }

        Log::error('VirusTotalService: unexpected status on file report lookup', [
            'sha256' => $sha256,
            'status' => $response->status(),
            'body_preview' => substr((string) $response->body(), 0, 300),
        ]);

        throw new RuntimeException("VirusTotal returned HTTP {$response->status()} for hash {$sha256}");
    }

    /**
     * Submit a file to VirusTotal for analysis. Returns the analysis id.
     *
     * Gated by config('services.virustotal.upload_files') — refuses when off.
     */
    public function uploadFile(string $absolutePath): string
    {
        if (! (bool) config('services.virustotal.upload_files')) {
            throw new RuntimeException('VirusTotalService: file uploads are disabled by config.');
        }

        if (! is_file($absolutePath)) {
            throw new RuntimeException("VirusTotalService: file not found at path [{$absolutePath}]");
        }

        $apiKey = $this->requireApiKey();

        try {
            $contents = @file_get_contents($absolutePath);
            if ($contents === false) {
                throw new RuntimeException("VirusTotalService: unable to read file [{$absolutePath}]");
            }

            $response = Http::timeout($this->timeout())
                ->when(
                    app()->environment('local', 'testing'),
                    fn ($http) => $http->withoutVerifying(),
                )
                ->withHeaders(['x-apikey' => $apiKey])
                ->attach('file', $contents, basename($absolutePath))
                ->post(self::API_BASE.'/files');
        } catch (\Throwable $e) {
            Log::error('VirusTotalService: HTTP exception on file upload', [
                'path' => $absolutePath,
                'error' => $e->getMessage(),
            ]);

            throw new RuntimeException('VirusTotal upload failed: '.$e->getMessage(), 0, $e);
        }

        if ($response->failed()) {
            Log::error('VirusTotalService: file upload returned non-success', [
                'path' => $absolutePath,
                'status' => $response->status(),
                'body_preview' => substr((string) $response->body(), 0, 300),
            ]);

            throw new RuntimeException("VirusTotal upload returned HTTP {$response->status()}");
        }

        $analysisId = $response->json('data.id');

        if (! is_string($analysisId) || $analysisId === '') {
            Log::error('VirusTotalService: upload response missing data.id', [
                'path' => $absolutePath,
                'body_preview' => substr((string) $response->body(), 0, 300),
            ]);

            throw new RuntimeException('VirusTotal upload succeeded but response had no analysis id.');
        }

        return $analysisId;
    }

    /**
     * Fetch an analysis record by id and return its data.attributes block.
     *
     * @return array<string, mixed>
     */
    public function getAnalysis(string $analysisId): array
    {
        $apiKey = $this->requireApiKey();

        try {
            $response = Http::timeout($this->timeout())
                ->when(
                    app()->environment('local', 'testing'),
                    fn ($http) => $http->withoutVerifying(),
                )
                ->withHeaders(['x-apikey' => $apiKey])
                ->get(self::API_BASE."/analyses/{$analysisId}");
        } catch (\Throwable $e) {
            Log::error('VirusTotalService: HTTP exception on analysis lookup', [
                'analysis_id' => $analysisId,
                'error' => $e->getMessage(),
            ]);

            throw new RuntimeException('VirusTotal analysis lookup failed: '.$e->getMessage(), 0, $e);
        }

        if ($response->failed()) {
            Log::error('VirusTotalService: analysis lookup returned non-success', [
                'analysis_id' => $analysisId,
                'status' => $response->status(),
                'body_preview' => substr((string) $response->body(), 0, 300),
            ]);

            throw new RuntimeException("VirusTotal returned HTTP {$response->status()} for analysis {$analysisId}");
        }

        $attributes = $response->json('data.attributes');

        return is_array($attributes) ? $attributes : [];
    }

    /**
     * Reduce a VT attributes block to the shape stored on FileReputationCheck.
     *
     * Accepts either a /files/{hash} attributes block or an /analyses/{id}
     * attributes block — both expose `last_analysis_stats` (or `stats`) and
     * `last_analysis_date` (or `date`).
     *
     * @param  array<string, mixed>  $vtAttributes
     * @return array{
     *     status: string,
     *     malicious_count: int,
     *     suspicious_count: int,
     *     undetected_count: int,
     *     harmless_count: int,
     *     timeout_count: int,
     *     last_analysis_date: \Illuminate\Support\Carbon|null,
     *     raw_summary: array<string, mixed>,
     * }
     */
    public function summarize(array $vtAttributes): array
    {
        $stats = $vtAttributes['last_analysis_stats'] ?? $vtAttributes['stats'] ?? [];
        $stats = is_array($stats) ? $stats : [];

        $malicious = (int) ($stats['malicious'] ?? 0);
        $suspicious = (int) ($stats['suspicious'] ?? 0);
        $undetected = (int) ($stats['undetected'] ?? 0);
        $harmless = (int) ($stats['harmless'] ?? 0);
        $timeout = (int) ($stats['timeout'] ?? 0);

        $status = match (true) {
            $malicious > 0 => 'malicious',
            $suspicious > 0 => 'suspicious',
            default => 'clean',
        };

        $rawDate = $vtAttributes['last_analysis_date'] ?? $vtAttributes['date'] ?? null;
        $lastAnalysisDate = is_numeric($rawDate)
            ? Carbon::createFromTimestamp((int) $rawDate)
            : null;

        return [
            'status' => $status,
            'malicious_count' => $malicious,
            'suspicious_count' => $suspicious,
            'undetected_count' => $undetected,
            'harmless_count' => $harmless,
            'timeout_count' => $timeout,
            'last_analysis_date' => $lastAnalysisDate,
            'raw_summary' => $vtAttributes,
        ];
    }

    private function requireApiKey(): string
    {
        $key = (string) config('services.virustotal.key');

        if ($key === '') {
            throw new RuntimeException('VirusTotalService: VIRUSTOTAL_API_KEY is not configured.');
        }

        return $key;
    }

    private function timeout(): int
    {
        return (int) config('services.virustotal.timeout', 15);
    }
}
