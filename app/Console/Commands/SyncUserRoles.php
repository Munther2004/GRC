<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class SyncUserRoles extends Command
{
    protected $signature = 'users:sync-roles';

    protected $description = 'Sync users.role column values into Spatie permissions for users whose roles do not already match';

    public function handle(): void
    {
        $synced = 0;
        $skipped = 0;

        User::chunk(100, function ($users) use (&$synced, &$skipped) {
            foreach ($users as $user) {
                if ($user->hasRole($user->role)) {
                    $skipped++;
                    continue;
                }

                try {
                    $user->syncRoles([$user->role]);
                    $synced++;
                } catch (\Throwable $e) {
                    $skipped++;
                }
            }
        });

        $this->info("Done. {$synced} user(s) synced, {$skipped} skipped.");
    }
}
