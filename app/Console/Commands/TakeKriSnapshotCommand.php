<?php

namespace App\Console\Commands;

use App\Models\KriSnapshot;
use Illuminate\Console\Command;

class TakeKriSnapshotCommand extends Command
{
    protected $signature = 'kri:snapshot {--date= : Snapshot date in YYYY-MM-DD format (defaults to today)}';

    protected $description = 'Take a KRI metrics snapshot and save it to the database';

    public function handle(): int
    {
        $date = $this->option('date');

        if ($date && ! \DateTime::createFromFormat('Y-m-d', $date)) {
            $this->error('Invalid date format. Use YYYY-MM-DD (e.g. --date=2026-03-18)');

            return self::FAILURE;
        }

        $this->info('Taking per-corporation KRI snapshots'.($date ? " for {$date}" : ' for today').'...');

        $count = KriSnapshot::takeSnapshots($date);

        $this->info("Saved {$count} corporation snapshot(s).");

        return self::SUCCESS;
    }
}
