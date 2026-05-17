<?php

namespace App\Console\Commands;

use App\Models\Evidence;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class RemapEvidenceToBucket extends Command
{
    protected $signature = 'evidence:remap-to-bucket
                            {--prefix=BrightLink_Evidence : Source folder inside the bucket containing the originals}
                            {--apply : Actually update file_path. Without this flag the command only reports.}';

    protected $description = 'Re-point Evidence rows whose stored file is missing at originals uploaded to a bucket folder by matching on file_name.';

    public function handle(): int
    {
        $disk = config('filesystems.evidence_disk');
        $fs = Storage::disk($disk);
        $prefix = rtrim($this->option('prefix'), '/');
        $apply = (bool) $this->option('apply');

        $this->line("Disk: <fg=cyan>{$disk}</>");
        $this->line("Source prefix: <fg=cyan>{$prefix}/</>");
        $this->line($apply ? '<fg=yellow>APPLY mode — changes will be written.</>' : '<fg=green>DRY-RUN — no changes will be written. Re-run with --apply to commit.</>');
        $this->newLine();

        $okCount = 0;
        $remapCount = 0;
        $missingCount = 0;
        $missing = [];

        Evidence::query()->orderBy('id')->chunkById(200, function ($chunk) use ($fs, $prefix, $apply, &$okCount, &$remapCount, &$missingCount, &$missing) {
            foreach ($chunk as $ev) {
                if (empty($ev->file_path) || empty($ev->file_name)) {
                    continue;
                }

                if ($this->safeExists($fs, $ev->file_path)) {
                    $okCount++;
                    continue;
                }

                $candidate = $prefix.'/'.basename($ev->file_name);

                if ($this->safeExists($fs, $candidate)) {
                    $this->line(sprintf(
                        '  #%-5d %s  ->  %s',
                        $ev->id,
                        $ev->file_path,
                        $candidate,
                    ));

                    if ($apply) {
                        $ev->forceFill(['file_path' => $candidate])->saveQuietly();
                    }
                    $remapCount++;

                    continue;
                }

                $missingCount++;
                $missing[] = "  #{$ev->id}  {$ev->file_name}  (was: {$ev->file_path})";
            }
        });

        $this->newLine();
        $this->line('<fg=green>Already OK:</> '.$okCount);
        $this->line('<fg=cyan>Remapped:</>   '.$remapCount.($apply ? '' : ' <fg=yellow>(would be remapped)</>'));
        $this->line('<fg=red>Unmatched:</>  '.$missingCount);

        if ($missingCount > 0) {
            $this->newLine();
            $this->line('<fg=red>Unmatched rows (no file in bucket and no source in '.$prefix.'/):</>');
            foreach (array_slice($missing, 0, 50) as $line) {
                $this->line($line);
            }
            if (count($missing) > 50) {
                $this->line('  ... and '.(count($missing) - 50).' more.');
            }
        }

        return self::SUCCESS;
    }

    private function safeExists($fs, string $path): bool
    {
        try {
            return $fs->exists($path);
        } catch (\Throwable) {
            return false;
        }
    }
}
