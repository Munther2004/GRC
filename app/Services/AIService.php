<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    public function callClaude(string $prompt): string
    {
        try {
            $response = Http::withHeaders([
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
