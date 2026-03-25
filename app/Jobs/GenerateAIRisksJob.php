<?php

namespace App\Jobs;

use App\Models\Assessment;
use App\Services\AIRiskGenerator;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class GenerateAIRisksJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public Assessment $assessment) {}

    public function handle(): void
    {
        (new AIRiskGenerator)->generateRisksFromAssessment($this->assessment);
    }
}
