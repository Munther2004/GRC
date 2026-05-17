<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class EvidenceFileExtractor
{
    /** ~4 000 tokens worth of text (1 token ≈ 4 chars) */
    private const TEXT_LIMIT = 15_000;

    /**
     * Extract file content in the format required by Claude.
     *
     * Returns an array with:
     *   content_type — 'text' | 'image/png' | 'image/jpeg' | 'image/webp' |
     *                   'image/gif' | 'application/pdf' | 'unsupported'
     *   content      — base64-encoded string for binary types, plain text for text/unsupported
     *
     * @return array{content_type: string, content: string}
     */
    public function extract(string $filePath, string $mimeType): array
    {
        $disk = config('filesystems.evidence_disk');
        $existsStorage = ! empty($filePath) && Storage::disk($disk)->exists($filePath);

        Log::info('EvidenceFileExtractor: path check', [
            'file_path' => $filePath,
            'disk' => $disk,
            'exists_storage' => $existsStorage,
            'mime_type' => $mimeType,
        ]);

        if (empty($filePath) || ! $existsStorage) {
            Log::warning('EvidenceFileExtractor: file not found on disk', [
                'file_path' => $filePath,
                'disk' => $disk,
            ]);

            return [
                'content_type' => 'unsupported',
                'content' => 'File not found on disk (path: '.$filePath.'). Assessment based on metadata only.',
            ];
        }

        $mime = strtolower(trim($mimeType));

        // ── Images → base64 for Claude vision ────────────────────────────────
        $imageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
        if (in_array($mime, $imageTypes, true)) {
            $normalized = $mime === 'image/jpg' ? 'image/jpeg' : $mime;

            return [
                'content_type' => $normalized,
                'content' => base64_encode(Storage::disk(config('filesystems.evidence_disk'))->get($filePath)),
            ];
        }

        // ── PDF → base64 for Claude document API ─────────────────────────────
        if ($mime === 'application/pdf') {
            return [
                'content_type' => 'application/pdf',
                'content' => base64_encode(Storage::disk(config('filesystems.evidence_disk'))->get($filePath)),
            ];
        }

        // ── DOCX ─────────────────────────────────────────────────────────────
        $docxTypes = [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
        ];
        if (in_array($mime, $docxTypes, true)) {
            return ['content_type' => 'text', 'content' => $this->extractDocx($filePath)];
        }

        // ── XLSX / XLS ────────────────────────────────────────────────────────
        $xlsTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
        ];
        if (in_array($mime, $xlsTypes, true)) {
            return ['content_type' => 'text', 'content' => $this->extractXlsx($filePath)];
        }

        // ── Plain text / CSV ─────────────────────────────────────────────────
        if (str_starts_with($mime, 'text/') ||
            in_array($mime, ['application/csv', 'text/comma-separated-values'], true)) {
            $text = Storage::disk(config('filesystems.evidence_disk'))->get($filePath) ?? '';

            return ['content_type' => 'text', 'content' => $this->truncate($text)];
        }

        // ── Unsupported ───────────────────────────────────────────────────────
        return [
            'content_type' => 'unsupported',
            'content' => "File type '{$mimeType}' cannot be extracted automatically. Assessment based on metadata only.",
        ];
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function extractDocx(string $filePath): string
    {
        if (! class_exists(\PhpOffice\PhpWord\IOFactory::class)) {
            return '(DOCX extraction unavailable — run: composer require phpoffice/phpword)';
        }

        try {
            $tmp = tempnam(sys_get_temp_dir(), 'grc_docx_');
            file_put_contents($tmp, Storage::disk(config('filesystems.evidence_disk'))->get($filePath));
            $phpWord = \PhpOffice\PhpWord\IOFactory::load($tmp);
            $text = '';

            foreach ($phpWord->getSections() as $section) {
                foreach ($section->getElements() as $element) {
                    $text .= $this->extractWordElement($element);
                }
            }

            @unlink($tmp);

            return $this->truncate(trim($text) ?: '(No readable text found in document)');
        } catch (\Throwable $e) {
            Log::warning('EvidenceFileExtractor: DOCX extraction failed', ['error' => $e->getMessage()]);

            return "(DOCX text extraction failed: {$e->getMessage()})";
        }
    }

    private function extractWordElement(mixed $element): string
    {
        $text = '';
        if (method_exists($element, 'getText')) {
            $text .= $element->getText()."\n";
        }
        if (method_exists($element, 'getElements')) {
            foreach ($element->getElements() as $child) {
                $text .= $this->extractWordElement($child);
            }
        }

        return $text;
    }

    private function extractXlsx(string $filePath): string
    {
        if (! class_exists(\PhpOffice\PhpSpreadsheet\IOFactory::class)) {
            return '(XLSX extraction unavailable — run: composer require phpoffice/phpspreadsheet)';
        }

        try {
            $tmp = tempnam(sys_get_temp_dir(), 'grc_xlsx_');
            file_put_contents($tmp, Storage::disk(config('filesystems.evidence_disk'))->get($filePath));
            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($tmp);
            $lines = [];

            foreach ($spreadsheet->getAllSheets() as $sheet) {
                $lines[] = '=== Sheet: '.$sheet->getTitle().' ===';
                foreach ($sheet->getRowIterator() as $row) {
                    $cells = [];
                    $ci = $row->getCellIterator();
                    $ci->setIterateOnlyExistingCells(true);
                    foreach ($ci as $cell) {
                        $val = $cell->getFormattedValue();
                        if ((string) $val !== '') {
                            $cells[] = $val;
                        }
                    }
                    if (! empty($cells)) {
                        $lines[] = implode("\t", $cells);
                    }
                }
            }

            @unlink($tmp);
            $result = implode("\n", $lines);

            return $this->truncate($result ?: '(No data found in spreadsheet)');
        } catch (\Throwable $e) {
            Log::warning('EvidenceFileExtractor: XLSX extraction failed', ['error' => $e->getMessage()]);

            return "(XLSX text extraction failed: {$e->getMessage()})";
        }
    }

    private function truncate(string $text): string
    {
        if (strlen($text) <= self::TEXT_LIMIT) {
            return $text;
        }

        return substr($text, 0, self::TEXT_LIMIT)
            ."\n\n[Content truncated at ".number_format(self::TEXT_LIMIT).' characters to fit context window]';
    }
}
