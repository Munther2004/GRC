<?php

namespace App\Console\Commands;

use App\Jobs\Scheduled\CheckExpiredEvidenceJob;
use App\Jobs\Scheduled\CheckExpiringEvidenceJob;
use App\Jobs\Scheduled\CheckOverdueAssessmentsJob;
use App\Jobs\Scheduled\CheckOverdueRisksJob;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class RunSchedulerNow extends Command
{
    protected $signature = 'scheduler:run-now';

    protected $description = 'Manually trigger all nightly scheduled jobs immediately';

    public function handle(): void
    {
        $this->info('Running nightly scheduled jobs...');

        $this->runJob('CheckExpiredEvidenceJob', new CheckExpiredEvidenceJob);
        $this->runJob('CheckExpiringEvidenceJob', new CheckExpiringEvidenceJob);
        $this->runJob('CheckOverdueRisksJob', new CheckOverdueRisksJob);
        $this->runJob('CheckOverdueAssessmentsJob', new CheckOverdueAssessmentsJob);

        Cache::put('scheduler_last_run', now()->toDateTimeString());

        $this->info('All jobs completed. Last run timestamp updated.');
    }

    private function runJob(string $name, object $job): void
    {
        $this->line("  → Running {$name}...");
        $job->handle();
        $this->line('    ✓ Done');
    }
}
