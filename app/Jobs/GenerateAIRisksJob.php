<?php

namespace App\Jobs;

use App\Models\Assessment;
use App\Services\AIRiskGenerator;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class GenerateAIRisksJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public Assessment $assessment) {}

    public function handle(): void
    {
        // Re-fetch from DB — the assessment may have been deleted since dispatch
        $assessment = Assessment::find($this->assessment->id);
        if (! $assessment) {
            Log::warning('GenerateAIRisksJob: assessment no longer exists, skipping', [
                'assessment_id' => $this->assessment->id,
            ]);

            return;
        }

        (new AIRiskGenerator)->generateRisksFromAssessment($assessment);
    }
}
