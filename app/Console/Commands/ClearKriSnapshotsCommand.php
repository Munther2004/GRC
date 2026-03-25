<?php

namespace App\Console\Commands;

use App\Models\KriSnapshot;
use Illuminate\Console\Command;

class ClearKriSnapshotsCommand extends Command
{
    protected $signature   = 'kri:clear {--date= : Delete only the snapshot for this date (YYYY-MM-DD)}';
    protected $description = 'Delete KRI snapshot records from the database';

    public function handle(): int
    {
        $date = $this->option('date');

        if ($date && !\DateTime::createFromFormat('Y-m-d', $date)) {
            $this->error('Invalid date format. Use YYYY-MM-DD (e.g. --date=2026-03-19)');
            return self::FAILURE;
        }

        $query = KriSnapshot::query();

        if ($date) {
            $query->where('snapshot_date', $date);
        }

        $deleted = $query->delete();

        if ($date) {
            $this->info("Deleted {$deleted} snapshot(s) for {$date}.");
        } else {
            $this->info("Deleted {$deleted} snapshot(s) from kri_snapshots.");
        }

        return self::SUCCESS;
    }
}
