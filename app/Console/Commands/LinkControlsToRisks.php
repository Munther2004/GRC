<?php

namespace App\Console\Commands;

use App\Services\RiskControlLinker;
use Illuminate\Console\Command;

class LinkControlsToRisks extends Command
{
    protected $signature = 'risks:link-controls';

    protected $description = 'Auto-link controls to risks based on category matching';

    public function handle()
    {
        $this->info('Linking controls to risks...');
        $count = (new RiskControlLinker)->linkAll();
        $this->info("Done. {$count} new links created.");
    }
}
