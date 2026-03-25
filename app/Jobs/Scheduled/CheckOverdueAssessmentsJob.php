<?php

namespace App\Jobs\Scheduled;

use App\Models\Assessment;
use App\Models\AuditLog;
use App\Models\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Carbon;

class CheckOverdueAssessmentsJob implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        $overdue = Assessment::whereNotNull('due_date')
            ->where('due_date', '<', Carbon::today())
            ->whereNotIn('status', ['completed', 'overdue'])
            ->get();

        foreach ($overdue as $assessment) {
            $assessment->update(['status' => 'overdue']);

            $url = "/assessments/{$assessment->id}";
            Notification::firstOrCreate(
                ['type' => 'overdue_assessment', 'url' => $url, 'is_read' => false],
                ['user_id' => null, 'title' => 'Assessment Overdue', 'message' => "Assessment '{$assessment->title}' is overdue since {$assessment->due_date->format('Y-m-d')}"]
            );

            AuditLog::create([
                'user_id' => null,
                'user_name' => 'System',
                'action' => 'updated',
                'model_type' => 'Assessment',
                'model_id' => $assessment->id,
                'description' => "Scheduler: Assessment #{$assessment->id} marked as overdue",
                'ip_address' => null,
            ]);
        }
    }
}
