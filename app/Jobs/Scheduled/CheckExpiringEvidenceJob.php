<?php

namespace App\Jobs\Scheduled;

use App\Models\AuditLog;
use App\Models\Evidence;
use App\Models\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Carbon;

class CheckExpiringEvidenceJob implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        Evidence::whereNotNull('expiry_date')
            ->where('expiry_date', '>=', Carbon::today())
            ->where('expiry_date', '<=', Carbon::today()->addDays(14))
            ->whereIn('status', ['pending', 'approved'])
            ->with(['assessmentItem.assessment', 'user'])
            ->chunkById(100, function ($chunk) {
                foreach ($chunk as $evidence) {
                    $corpId = $evidence->assessmentItem?->assessment?->corporation_id
                        ?? $evidence->user?->corporation_id;
                    $url = "/evidence-expiring-{$evidence->id}";
                    if ($corpId !== null) {
                        Notification::firstOrCreate(
                            ['type' => 'expiring_evidence', 'url' => $url, 'is_read' => false, 'corporation_id' => $corpId],
                            ['user_id' => null, 'title' => 'Evidence Expiring Soon', 'message' => "Evidence '{$evidence->file_name}' expires on {$evidence->expiry_date->format('Y-m-d')} — renewal required soon"]
                        );
                    }

                    AuditLog::create([
                        'user_id' => null,
                        'user_name' => 'System',
                        'action' => 'updated',
                        'model_type' => 'Evidence',
                        'model_id' => $evidence->id,
                        'description' => "Scheduler: Evidence #{$evidence->id} flagged as expiring soon",
                        'ip_address' => null,
                    ]);
                }
            });
    }
}
