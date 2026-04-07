<?php

namespace App\Console\Commands;

use App\Models\KriSnapshot;
use Illuminate\Console\Command;

class TakeKriSnapshotCommand extends Command
{
    protected $signature   = 'kri:snapshot {--date= : Snapshot date in YYYY-MM-DD format (defaults to today)}';
    protected $description = 'Take a KRI metrics snapshot and save it to the database';

    public function handle(): int
    {
        $date = $this->option('date');

        if ($date && !\DateTime::createFromFormat('Y-m-d', $date)) {
            $this->error('Invalid date format. Use YYYY-MM-DD (e.g. --date=2026-03-18)');
            return self::FAILURE;
        }

        $this->info('Taking KRI snapshot' . ($date ? " for {$date}" : ' for today') . '...');

        $snapshot = KriSnapshot::takeSnapshot($date);

        $this->table(
            ['Metric', 'Value'],
            [
                ['Snapshot Date',          $snapshot->snapshot_date->toDateString()],
                ['Compliance %',           $snapshot->compliance_percentage . '%'],
                ['Open Critical Risks',    $snapshot->open_risks_critical],
                ['Open High Risks',        $snapshot->open_risks_high],
                ['Open Medium Risks',      $snapshot->open_risks_medium],
                ['Open Low Risks',         $snapshot->open_risks_low],
                ['Overdue Risks',          $snapshot->overdue_risks],
                ['Overdue Assessments',    $snapshot->overdue_assessments],
                ['Evidence Approval Rate', $snapshot->evidence_approval_rate . '%'],
                ['AI-Generated Risks',     $snapshot->ai_generated_risks],
                ['Total Risks',            $snapshot->total_risks],
                ['Total Controls',         $snapshot->total_controls],
                ['Compliant Controls',     $snapshot->compliant_controls],
            ]
        );

        $this->info('Snapshot saved successfully.');

        return self::SUCCESS;
    }
}
