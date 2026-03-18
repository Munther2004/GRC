<?php

use App\Jobs\Scheduled\CheckExpiredEvidenceJob;
use App\Jobs\Scheduled\CheckExpiringEvidenceJob;
use App\Jobs\Scheduled\CheckOverdueAssessmentsJob;
use App\Jobs\Scheduled\CheckOverdueRisksJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::job(new CheckExpiredEvidenceJob)->dailyAt('02:00');
Schedule::job(new CheckExpiringEvidenceJob)->dailyAt('02:00');
Schedule::job(new CheckOverdueRisksJob)->dailyAt('02:00');
Schedule::job(new CheckOverdueAssessmentsJob)->dailyAt('02:00');
Schedule::call(fn () => Cache::put('scheduler_last_run', now()->toDateTimeString()))->dailyAt('02:00');
