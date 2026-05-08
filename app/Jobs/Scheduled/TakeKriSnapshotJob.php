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
        $count = KriSnapshot::takeSnapshots();

        Log::info('KRI snapshots taken', [
            'date' => now()->toDateString(),
            'corporations' => $count,
        ]);
    }
}
