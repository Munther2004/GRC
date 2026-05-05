<?php

namespace App\Jobs;

use App\Models\Assessment;
use App\Models\AssessmentItem;
use App\Models\Risk;
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

        // Re-fetch from DB — the assessment may have been deleted or flagged
        // for deletion since dispatch.
        $assessment = Assessment::find($assessmentId);
        if (! $assessment || $assessment->status === 'deleting') {
            Log::info("AI Risk Generator skipped — assessment {$assessmentId} is being deleted or no longer exists.");

            return;
        }

        $generator = new AIRiskGenerator;

        $items = AssessmentItem::where('assessment_id', $assessment->id)
            ->whereIn('compliance_status', ['non_compliant', 'partially_compliant'])
            ->with(['control.framework'])
            ->get();

        foreach ($items as $item) {
            // Mid-run check: bail out if the assessment was flagged for
            // deletion while we were generating risks.
            $assessment->refresh();
            if ($assessment->status === 'deleting') {
                Log::info('AI Risk Generator aborted mid-run — assessment deleted.');

                return;
            }

            if (! $item->control) {
                continue;
            }

            $control = $item->control;

            $exists = Risk::where('auto_generated', 1)
                ->where('source_control_id', $control->id)
                ->where('assessment_id', $assessment->id)
                ->exists();

            if ($exists) {
                continue;
            }

            $generator->generateRiskForControl($control, $assessment, $item->compliance_status);
        }
    }
}
