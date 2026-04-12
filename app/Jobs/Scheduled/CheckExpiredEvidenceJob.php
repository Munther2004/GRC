<?php

namespace App\Jobs\Scheduled;

use App\Models\AuditLog;
use App\Models\Evidence;
use App\Models\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Carbon;

class CheckExpiredEvidenceJob implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        Evidence::whereNotNull('expiry_date')
            ->where('expiry_date', '<', Carbon::today())
            ->whereIn('status', ['pending', 'approved'])
            ->chunkById(100, function ($chunk) {
                foreach ($chunk as $evidence) {
                    $url = "/evidence-expired-{$evidence->id}";
                    Notification::firstOrCreate(
                        ['type' => 'expired_evidence', 'url' => $url, 'is_read' => false],
                        ['user_id' => null, 'title' => 'Evidence Expired', 'message' => "Evidence '{$evidence->file_name}' has expired and requires renewal"]
                    );

                    AuditLog::create([
                        'user_id'     => null,
                        'user_name'   => 'System',
                        'action'      => 'updated',
                        'model_type'  => 'Evidence',
                        'model_id'    => $evidence->id,
                        'description' => "Scheduler: Evidence #{$evidence->id} marked as expired",
                        'ip_address'  => null,
                    ]);
                }
            });
    }
}
