<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Spatie\Permission\Models\Role;

class SyncUserRoles extends Command
{
    protected $signature = 'users:sync-roles';

    protected $description = 'Heal users.role and Spatie role assignments to the canonical RBAC taxonomy';

    /**
     * Canonical mapping for legacy users.role values.
     */
    private const ROLE_MAP = [
        'super_admin' => User::ROLE_SUPER_ADMIN,
        'admin' => User::ROLE_ADMIN,
        'auditor' => User::ROLE_AUDITOR,
        'user' => User::ROLE_USER,
        // Legacy
        'manager' => User::ROLE_ADMIN,
        'employee' => User::ROLE_USER,
        'corporate_manager' => User::ROLE_ADMIN,
    ];

    public function handle(): int
    {
        // Make sure all four canonical roles exist before we sync.
        foreach (User::VALID_ROLES as $name) {
            Role::firstOrCreate(['name' => $name]);
        }

        $synced = 0;
        $skipped = 0;
        $report = [];

        User::with('roles')->chunk(100, function ($users) use (&$synced, &$skipped, &$report) {
            foreach ($users as $user) {
                $original = $user->role;
                $canonical = $this->resolveCanonical($user);

                $stringChanged = $user->role !== $canonical;
                $needsRoleSync = ! $user->hasRole($canonical) || $user->roles->count() !== 1;

                if (! $stringChanged && ! $needsRoleSync) {
                    $skipped++;

                    continue;
                }

                try {
                    if ($stringChanged) {
                        $user->role = $canonical;
                        $user->save();
                    }

                    $user->syncRoles([$canonical]);
                    $synced++;

                    $report[] = sprintf(
                        '#%d %s: %s → %s',
                        $user->id,
                        $user->email,
                        $original ?: '(null)',
                        $canonical,
                    );
                } catch (\Throwable $e) {
                    $skipped++;
                    $this->warn("Failed to sync user #{$user->id} ({$user->email}): {$e->getMessage()}");
                }
            }
        });

        foreach ($report as $line) {
            $this->line($line);
        }

        $this->info("Done. {$synced} user(s) synced, {$skipped} unchanged or failed.");

        return self::SUCCESS;
    }

    private function resolveCanonical(User $user): string
    {
        // Platform owner override.
        if ($user->email === 'admin@grc.com' && $user->corporation_id === null) {
            return User::ROLE_SUPER_ADMIN;
        }

        $current = $user->role ? strtolower(trim($user->role)) : null;

        // Map known role strings.
        if ($current && isset(self::ROLE_MAP[$current])) {
            $mapped = self::ROLE_MAP[$current];
        } else {
            // Null or unknown: default to 'user'.
            $mapped = User::ROLE_USER;
        }

        // is_corporation_manager => admin, unless already super_admin.
        if ($user->is_corporation_manager && $mapped !== User::ROLE_SUPER_ADMIN) {
            $mapped = User::ROLE_ADMIN;
        }

        return $mapped;
    }
}
