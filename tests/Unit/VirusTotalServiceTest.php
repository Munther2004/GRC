<?php

use App\Services\VirusTotalService;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

uses(Tests\TestCase::class);

beforeEach(function () {
    Config::set('services.virustotal.key', 'test-api-key');
    Config::set('services.virustotal.enabled', true);
    Config::set('services.virustotal.upload_files', false);
    Config::set('services.virustotal.timeout', 5);
});

it('returns the configured enabled flag', function () {
    Config::set('services.virustotal.enabled', false);
    expect((new VirusTotalService)->isEnabled())->toBeFalse();

    Config::set('services.virustotal.enabled', true);
    expect((new VirusTotalService)->isEnabled())->toBeTrue();
});

it('hashes a file with sha256', function () {
    $tmp = tempnam(sys_get_temp_dir(), 'vt_');
    file_put_contents($tmp, 'hello world');

    try {
        $hash = (new VirusTotalService)->hashFile($tmp);
        expect($hash)->toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9');
    } finally {
        @unlink($tmp);
    }
});

it('throws when hashing a missing file', function () {
    (new VirusTotalService)->hashFile('/path/that/does/not/exist.bin');
})->throws(RuntimeException::class);

it('parses a 200 file report into the attributes block', function () {
    $attributes = [
        'last_analysis_stats' => [
            'malicious' => 0,
            'suspicious' => 0,
            'undetected' => 60,
            'harmless' => 5,
            'timeout' => 0,
        ],
        'last_analysis_date' => 1714000000,
    ];

    Http::fake([
        'www.virustotal.com/api/v3/files/*' => Http::response([
            'data' => ['attributes' => $attributes],
        ], 200),
    ]);

    $result = (new VirusTotalService)->getFileReportByHash(str_repeat('a', 64));

    expect($result)->toBe($attributes);
});

it('returns null when VirusTotal does not have the file (404)', function () {
    Http::fake([
        'www.virustotal.com/api/v3/files/*' => Http::response([], 404),
    ]);

    $result = (new VirusTotalService)->getFileReportByHash(str_repeat('b', 64));

    expect($result)->toBeNull();
});

it('throws on unexpected HTTP status from the file report endpoint', function () {
    Http::fake([
        'www.virustotal.com/api/v3/files/*' => Http::response([], 503),
    ]);

    (new VirusTotalService)->getFileReportByHash(str_repeat('c', 64));
})->throws(RuntimeException::class);

it('summarize maps malicious counts to malicious status', function () {
    $summary = (new VirusTotalService)->summarize([
        'last_analysis_stats' => [
            'malicious' => 3,
            'suspicious' => 1,
            'undetected' => 50,
            'harmless' => 2,
            'timeout' => 0,
        ],
        'last_analysis_date' => 1714000000,
    ]);

    expect($summary['status'])->toBe('malicious')
        ->and($summary['malicious_count'])->toBe(3)
        ->and($summary['suspicious_count'])->toBe(1)
        ->and($summary['undetected_count'])->toBe(50)
        ->and($summary['harmless_count'])->toBe(2)
        ->and($summary['last_analysis_date'])->not->toBeNull();
});

it('summarize maps suspicious-only stats to suspicious status', function () {
    $summary = (new VirusTotalService)->summarize([
        'last_analysis_stats' => [
            'malicious' => 0,
            'suspicious' => 2,
            'undetected' => 60,
            'harmless' => 0,
            'timeout' => 0,
        ],
    ]);

    expect($summary['status'])->toBe('suspicious')
        ->and($summary['last_analysis_date'])->toBeNull();
});

it('summarize maps a clean scan to clean status', function () {
    $summary = (new VirusTotalService)->summarize([
        'last_analysis_stats' => [
            'malicious' => 0,
            'suspicious' => 0,
            'undetected' => 70,
            'harmless' => 5,
            'timeout' => 0,
        ],
    ]);

    expect($summary['status'])->toBe('clean');
});

it('summarize accepts the analyses-endpoint shape (stats + date)', function () {
    $summary = (new VirusTotalService)->summarize([
        'stats' => ['suspicious' => 1],
        'date' => 1714000000,
    ]);

    expect($summary['status'])->toBe('suspicious')
        ->and($summary['suspicious_count'])->toBe(1)
        ->and($summary['last_analysis_date'])->not->toBeNull();
});

it('uploadFile throws when uploads are disabled', function () {
    Config::set('services.virustotal.upload_files', false);

    $tmp = tempnam(sys_get_temp_dir(), 'vt_');
    file_put_contents($tmp, 'payload');

    try {
        (new VirusTotalService)->uploadFile($tmp);
    } finally {
        @unlink($tmp);
    }
})->throws(RuntimeException::class, 'file uploads are disabled');
