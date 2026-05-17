<?php

namespace App\Console\Commands;

use App\Services\ControlDomainMapper;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class BackfillControlDomain extends Command
{
    protected $signature = 'controls:backfill-domain {--force : Recompute domain even when already set}';

    protected $description = 'Map each control to a canonical cross-framework domain (idempotent).';

    public function handle(): int
    {
        $query = DB::table('controls')
            ->join('frameworks', 'controls.framework_id', '=', 'frameworks.id')
            ->select('controls.id', 'controls.control_id', 'controls.category', 'controls.domain', 'frameworks.short_name');

        if (! $this->option('force')) {
            $query->whereNull('controls.domain');
        }

        $rows = $query->get();

        if ($rows->isEmpty()) {
            $this->info('No controls need domain backfill.');

            return self::SUCCESS;
        }

        $updated = 0;
        foreach ($rows as $row) {
            $domain = ControlDomainMapper::for(
                (string) $row->short_name,
                (string) $row->control_id,
                (string) $row->category,
            );
            if ($domain === $row->domain) {
                continue;
            }
            DB::table('controls')->where('id', $row->id)->update(['domain' => $domain]);
            $updated++;
        }

        $this->info("Domain backfilled on {$updated} control(s).");

        return self::SUCCESS;
    }
}
