<?php

namespace App\Console\Commands;

use App\Models\Assessment;
use App\Models\AssessmentItem;
use App\Models\Control;
use App\Models\ControlStatusHistory;
use App\Models\CorporationControlStatus;
use Illuminate\Console\Command;

class SyncControlsFromAssessments extends Command
{
    protected $signature = 'controls:sync-from-assessments';

    protected $description = 'Retroactively sync the most recent assessment response per control to controls.current_status';

    public function handle(): int
    {
        $this->info('Syncing per-corporation control statuses from completed assessments...');

        // Pull (control_id, corporation_id) -> latest completed-assessment item.
        // Status is now per-tenant, so the grouping key is composite.
        $latestItems = AssessmentItem::query()
            ->join('assessments', 'assessment_items.assessment_id', '=', 'assessments.id')
            ->where('assessments.status', 'completed')
            ->orderBy('assessments.updated_at', 'desc')
            ->select(
                'assessment_items.*',
                'assessments.id as assessment_db_id',
                'assessments.corporation_id as assessment_corp_id',
                'assessments.updated_at as assessment_updated_at',
            )
            ->get()
            ->groupBy(fn ($i) => $i->control_id.':'.($i->assessment_corp_id ?? 'null'))
            ->map(fn ($group) => $group->first());

        if ($latestItems->isEmpty()) {
            $this->warn('No completed assessments found. Nothing to sync.');

            return self::SUCCESS;
        }

        $updated = 0;
        $skipped = 0;
        $controlIds = $latestItems->pluck('control_id')->unique();
        $controls = Control::whereIn('id', $controlIds)->get()->keyBy('id');

        foreach ($latestItems as $item) {
            $control = $controls->get($item->control_id);
            if (! $control) {
                $skipped++;

                continue;
            }

            $newStatus = $item->compliance_status;
            $assessmentId = $item->assessment_db_id;
            $tenantId = $item->assessment_corp_id;
            $oldStatus = $control->statusForCorporation($tenantId);

            $alreadySynced = ControlStatusHistory::where('control_id', $control->id)
                ->where('notes', "Synced from assessment #{$assessmentId}")
                ->exists();

            if ($alreadySynced) {
                $skipped++;

                continue;
            }

            if ($tenantId !== null) {
                CorporationControlStatus::updateOrCreate(
                    ['corporation_id' => $tenantId, 'control_id' => $control->id],
                    [
                        'current_status' => $newStatus,
                        'last_remediated_at' => in_array($newStatus, ['compliant', 'partially_compliant'])
                            ? now()
                            : null,
                    ]
                );
            } else {
                // Legacy: assessment with no tenant — keep updating the global
                // controls row so super_admin-only platform data still moves.
                $updates = ['current_status' => $newStatus];
                if (in_array($newStatus, ['compliant', 'partially_compliant'])) {
                    $updates['last_remediated_at'] = now();
                }
                $control->update($updates);
            }

            ControlStatusHistory::create([
                'control_id' => $control->id,
                'user_id' => null,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'notes' => "Synced from assessment #{$assessmentId}",
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
