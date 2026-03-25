<?php

namespace App\Console\Commands;

use App\Models\Assessment;
use App\Models\Control;
use App\Models\Risk;
use App\Services\AIRiskGenerator;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class BackfillAIRisks extends Command
{
    protected $signature = 'risks:backfill-ai';

    protected $description = 'Generate AI risks for non-compliant controls that do not yet have one';

    public function handle(): void
    {
        // Get distinct control_ids from assessment_items where non_compliant, with an assessment_id
        $items = DB::table('assessment_items')
            ->where('compliance_status', 'non_compliant')
            ->select('control_id', 'assessment_id')
            ->get()
            ->unique('control_id');

        // Filter out controls that already have an AI-generated risk
        $existingControlIds = Risk::where('auto_generated', 1)
            ->whereNotNull('source_control_id')
            ->pluck('source_control_id')
            ->flip();

        $pending = $items->reject(fn ($item) => isset($existingControlIds[$item->control_id]));

        if ($pending->isEmpty()) {
            $this->info('No controls require backfill. All non-compliant controls already have AI risks.');

            return;
        }

        $generator = new AIRiskGenerator;
        $count = 0;

        foreach ($pending as $item) {
            $control = Control::with('framework')->find($item->control_id);

            if (! $control) {
                $this->warn("Control {$item->control_id} not found, skipping.");

                continue;
            }

            $assessment = Assessment::find($item->assessment_id);

            if (! $assessment) {
                $this->warn("Assessment {$item->assessment_id} not found for control {$item->control_id}, skipping.");

                continue;
            }

            $this->info("Generating risk for control {$control->id}: {$control->title}...");

            $generator->generateRiskForControl($control, $assessment, 'non_compliant');
            $count++;

            sleep(1);
        }

        $this->info("Done. {$count} AI risks generated.");
    }
}
