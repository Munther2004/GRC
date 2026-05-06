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
        $assessmentId = $this->assessment->id;

        // Re-fetch from DB — the assessment may have been deleted or marked
        // for deletion since dispatch. Either case must short-circuit before
        // we touch the AI service or create any risks.
        $assessment = Assessment::find($assessmentId);

        if (! $assessment || $assessment->status === 'deleting') {
            Log::info("AI Risk Generator skipped — assessment {$assessmentId} is being deleted or no longer exists.");

            return;
        }

        (new AIRiskGenerator)->generateRisksFromAssessment($assessment);
    }
}
