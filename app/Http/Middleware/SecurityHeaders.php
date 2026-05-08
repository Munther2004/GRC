<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Adds the standard browser-side hardening headers. CSP is intentionally
 * conservative: scripts/styles must be same-origin or carry an inline
 * nonce/hash, frames are denied, mixed-content is upgraded.
 *
 * Vite dev server requires `'unsafe-inline'` and `'unsafe-eval'` to load
 * the React refresh runtime, so the local development environment relaxes
 * the script/style sources. Production gets the strict policy.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        $headers = $response->headers;

        $headers->set('X-Content-Type-Options', 'nosniff');
        $headers->set('X-Frame-Options', 'DENY');
        $headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
        $headers->set('Cross-Origin-Opener-Policy', 'same-origin');

        if ($request->isSecure()) {
            $headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }

        $isLocal = app()->environment('local', 'testing');

        if ($isLocal) {
            // Local dev: Vite serves over multiple loopback hostnames/ports
            // (localhost, 127.0.0.1, [::1]) on a port that varies. The
            // bracketed IPv6 form is rejected by Chromium as a CSP source,
            // so the practical-and-still-useful policy is "any http(s)/ws(s)
            // origin." Frame-ancestors stays denied so clickjacking remains
            // blocked even on local. Production gets the strict policy.
            $csp = implode('; ', [
                "default-src 'self' http: https: ws: wss: data: blob:",
                "base-uri 'self'",
                "object-src 'none'",
                "frame-ancestors 'none'",
                "img-src 'self' data: blob: http: https:",
                "font-src 'self' data: http: https:",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' http: https:",
                "style-src 'self' 'unsafe-inline' http: https:",
                "connect-src 'self' http: https: ws: wss:",
                "form-action 'self'",
            ]);
        } else {
            $csp = implode('; ', [
                "default-src 'self'",
                "base-uri 'self'",
                "object-src 'none'",
                "frame-ancestors 'none'",
                "img-src 'self' data: blob:",
                "font-src 'self' data: https://fonts.gstatic.com",
                "script-src 'self'",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                "connect-src 'self'",
                "form-action 'self'",
                'upgrade-insecure-requests',
            ]);
        }

        $headers->set('Content-Security-Policy', $csp);

        return $response;
    }
}
