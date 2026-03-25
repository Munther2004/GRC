<?php

namespace App\Jobs\Scheduled;

use App\Models\KriSnapshot;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class TakeKriSnapshotJob implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        $snapshot = KriSnapshot::takeSnapshot();

        Log::info('KRI snapshot taken', [
            'snapshot_date' => $snapshot->snapshot_date->toDateString(),
            'compliance_percentage' => $snapshot->compliance_percentage,
            'total_risks' => $snapshot->total_risks,
        ]);
    }
}
