<?php

namespace App\Jobs\Scheduled;

use App\Models\AuditLog;
use App\Models\Notification;
use App\Models\Risk;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Carbon;

class CheckOverdueRisksJob implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        $overdue = Risk::whereNotNull('due_date')
            ->where('due_date', '<', Carbon::today())
            ->whereNotIn('status', ['closed', 'overdue'])
            ->get();

        foreach ($overdue as $risk) {
            $risk->update(['status' => 'overdue']);

            $url = "/risks/{$risk->id}";
            Notification::firstOrCreate(
                ['type' => 'overdue_risk', 'url' => $url, 'is_read' => false],
                ['user_id' => null, 'title' => 'Risk Treatment Overdue', 'message' => "Risk '{$risk->title}' treatment is overdue since {$risk->due_date->format('Y-m-d')}"]
            );

            AuditLog::create([
                'user_id'    => null,
                'user_name'  => 'System',
                'action'     => 'updated',
                'model_type' => 'Risk',
                'model_id'   => $risk->id,
                'description'=> "Scheduler: Risk #{$risk->id} marked as overdue",
                'ip_address' => null,
            ]);
        }
    }
}
