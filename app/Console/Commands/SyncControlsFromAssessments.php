<?php

namespace App\Console\Commands;

use App\Models\Assessment;
use App\Models\AssessmentItem;
use App\Models\Control;
use App\Models\ControlStatusHistory;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncControlsFromAssessments extends Command
{
    protected $signature   = 'controls:sync-from-assessments';
    protected $description = 'Retroactively sync the most recent assessment response per control to controls.current_status';

    public function handle(): int
    {
        $this->info('Syncing control statuses from completed assessments...');

        // For each control, get the most recent assessment item from a completed assessment.
        // We use a subquery to find the latest assessment per control.
        $latestItems = AssessmentItem::query()
            ->join('assessments', 'assessment_items.assessment_id', '=', 'assessments.id')
            ->where('assessments.status', 'completed')
            ->orderBy('assessments.updated_at', 'desc')
            ->select('assessment_items.*', 'assessments.id as assessment_db_id', 'assessments.updated_at as assessment_updated_at')
            ->get()
            ->groupBy('control_id')
            ->map(fn ($group) => $group->first()); // first = most recent (ordered desc above)

        if ($latestItems->isEmpty()) {
            $this->warn('No completed assessments found. Nothing to sync.');
            return self::SUCCESS;
        }

        $updated  = 0;
        $skipped  = 0;
        $controls = Control::whereIn('id', $latestItems->keys())->get()->keyBy('id');

        foreach ($latestItems as $controlId => $item) {
            $control = $controls->get($controlId);
            if (!$control) {
                $skipped++;
                continue;
            }

            $newStatus    = $item->compliance_status;
            $assessmentId = $item->assessment_db_id;
            $oldStatus    = $control->current_status;

            // Idempotency: skip if history for this assessment already exists for this control
            $alreadySynced = ControlStatusHistory::where('control_id', $control->id)
                ->where('notes', "Synced from assessment #{$assessmentId}")
                ->exists();

            if ($alreadySynced) {
                $skipped++;
                continue;
            }

            $updates = ['current_status' => $newStatus];
            if (in_array($newStatus, ['compliant', 'partially_compliant'])) {
                $updates['last_remediated_at'] = now();
            }
            $control->update($updates);

            ControlStatusHistory::create([
                'control_id' => $control->id,
                'user_id'    => null,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'notes'      => "Synced from assessment #{$assessmentId}",
            ]);

            $updated++;
        }

        $this->table(
            ['Result', 'Count'],
            [
                ['Controls updated', $updated],
                ['Controls skipped (already synced or not found)', $skipped],
                ['Total controls processed', $latestItems->count()],
            ]
        );

        $this->info("Done. {$updated} control(s) updated.");

        return self::SUCCESS;
    }
}
