<?php

// Finding #5: production code must not call Http::withoutVerifying() outside
// a local/testing environment guard. We grep the source rather than trying
// to mock TLS — the rule is a structural one.

test('finding 5: every Http::withoutVerifying call is guarded by environment()', function () {
    $serviceFiles = [
        base_path('app/Services/AIService.php'),
        base_path('app/Services/GeminiVisionService.php'),
        base_path('app/Services/VirusTotalService.php'),
    ];

    foreach ($serviceFiles as $file) {
        expect(file_exists($file))->toBeTrue("Missing source file: {$file}");
        $contents = file_get_contents($file);

        if (! str_contains($contents, 'withoutVerifying')) {
            continue; // file doesn't disable TLS, fine
        }

        // Every withoutVerifying call must appear inside an environment()
        // closure. We assert the surrounding pattern is present.
        $lines = explode("\n", $contents);
        foreach ($lines as $idx => $line) {
            if (! str_contains($line, 'withoutVerifying')) {
                continue;
            }
            // Look at a wider window — Http::when(env, fn ... withoutVerifying())
            // patterns can put the env check ~5 lines above the call.
            $start = max(0, $idx - 8);
            $window = implode("\n", array_slice($lines, $start, ($idx - $start) + 4));
            $hasGuard = str_contains($window, "environment('local', 'testing')")
                || str_contains($window, 'environment("local", "testing")');
            expect($hasGuard)->toBeTrue(
                "withoutVerifying() in {$file} line ".($idx + 1).' is not env-guarded'
            );
        }
    }
});

test('finding 5: GeminiVisionService no longer embeds API key in URL', function () {
    $contents = file_get_contents(base_path('app/Services/GeminiVisionService.php'));
    expect($contents)->not->toContain('?key=');
    expect($contents)->toContain('x-goog-api-key');
});
