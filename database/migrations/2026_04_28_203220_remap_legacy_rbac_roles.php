<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * One-shot data normalisation that brings every existing user onto the
     * final RBAC taxonomy. Idempotent: rerunning is a no-op once converged.
     *
     * Canonical mapping:
     *   Spatie role  manager           -> admin
     *   Spatie role  employee          -> user
     *   Legacy users.role 'manager'    -> admin
     *   Legacy users.role 'employee'   -> user
     *   Legacy users.role 'corporate_manager' -> admin
     *   admin@grc.com (corporation_id NULL) -> super_admin
     *   is_corporation_manager = true  -> admin (unless already super_admin)
     */
    public function up(): void
    {
        DB::transaction(function () {
            // ── 1. Ensure the four canonical Spatie roles exist ──────────────
            $now = now();
            $ensureRole = function (string $name) use ($now): int {
                $existing = DB::table('roles')->where('name', $name)->where('guard_name', 'web')->value('id');
                if ($existing) {
                    return $existing;
                }

                return DB::table('roles')->insertGetId([
                    'name' => $name,
                    'guard_name' => 'web',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            };

            $superAdminId = $ensureRole('super_admin');
            $adminId = $ensureRole('admin');
            $auditorId = $ensureRole('auditor');
            $userId = $ensureRole('user');

            $userModel = User::class;

            // ── 2. Helper to remap one Spatie role -> another ────────────────
            // Collect IDs in PHP first to avoid MySQL error 1093 (cannot
            // self-reference the same table inside an UPDATE subquery).
            $remap = function (?int $fromId, int $toId) use ($userModel) {
                if (! $fromId || $fromId === $toId) {
                    return;
                }

                $alreadyHasTarget = DB::table('model_has_roles')
                    ->where('role_id', $toId)
                    ->where('model_type', $userModel)
                    ->pluck('model_id')
                    ->all();

                $needsRemap = DB::table('model_has_roles')
                    ->where('role_id', $fromId)
                    ->where('model_type', $userModel)
                    ->pluck('model_id')
                    ->all();

                $toUpgrade = array_values(array_diff($needsRemap, $alreadyHasTarget));

                if (! empty($toUpgrade)) {
                    DB::table('model_has_roles')
                        ->where('role_id', $fromId)
                        ->where('model_type', $userModel)
                        ->whereIn('model_id', $toUpgrade)
                        ->update(['role_id' => $toId]);
                }

                // Anything left at $fromId is a duplicate (target already held).
                DB::table('model_has_roles')
                    ->where('role_id', $fromId)
                    ->where('model_type', $userModel)
                    ->delete();
            };

            $managerId = DB::table('roles')->where('name', 'manager')->value('id');
            $employeeId = DB::table('roles')->where('name', 'employee')->value('id');

            $remap($managerId, $adminId);
            $remap($employeeId, $userId);

            // Drop the now-orphaned Role rows (nothing references them).
            DB::table('roles')->whereIn('name', ['manager', 'employee'])->delete();

            // ── 3. Promote platform owner ────────────────────────────────────
            $platformOwner = DB::table('users')
                ->where('email', 'admin@grc.com')
                ->whereNull('corporation_id')
                ->first(['id']);

            if ($platformOwner) {
                // Replace any existing admin assignment with super_admin
                DB::table('model_has_roles')
                    ->where('model_type', $userModel)
                    ->where('model_id', $platformOwner->id)
                    ->whereIn('role_id', [$adminId, $auditorId, $userId])
                    ->delete();

                $hasSuper = DB::table('model_has_roles')
                    ->where('model_type', $userModel)
                    ->where('model_id', $platformOwner->id)
                    ->where('role_id', $superAdminId)
                    ->exists();

                if (! $hasSuper) {
                    DB::table('model_has_roles')->insert([
                        'role_id' => $superAdminId,
                        'model_type' => $userModel,
                        'model_id' => $platformOwner->id,
                    ]);
                }

                DB::table('users')
                    ->where('id', $platformOwner->id)
                    ->update(['role' => 'super_admin']);
            }

            // ── 4. Heal corporation managers (is_corporation_manager flag) ───
            // Anyone flagged as a corporation manager who isn't a super_admin
            // becomes an organisation admin.
            $corpManagers = DB::table('users')
                ->where('is_corporation_manager', true)
                ->whereNotIn('id', function ($q) use ($superAdminId, $userModel) {
                    $q->select('model_id')
                        ->from('model_has_roles')
                        ->where('role_id', $superAdminId)
                        ->where('model_type', $userModel);
                })
                ->pluck('id');

            foreach ($corpManagers as $uid) {
                // Drop any 'user' assignment, add 'admin'
                DB::table('model_has_roles')
                    ->where('model_type', $userModel)
                    ->where('model_id', $uid)
                    ->where('role_id', $userId)
                    ->delete();

                $hasAdmin = DB::table('model_has_roles')
                    ->where('model_type', $userModel)
                    ->where('model_id', $uid)
                    ->where('role_id', $adminId)
                    ->exists();

                if (! $hasAdmin) {
                    DB::table('model_has_roles')->insert([
                        'role_id' => $adminId,
                        'model_type' => $userModel,
                        'model_id' => $uid,
                    ]);
                }

                DB::table('users')->where('id', $uid)->update(['role' => 'admin']);
            }

            // ── 5. Normalise legacy users.role string values ─────────────────
            DB::table('users')->where('role', 'manager')->update(['role' => 'admin']);
            DB::table('users')->where('role', 'employee')->update(['role' => 'user']);
            DB::table('users')->where('role', 'corporate_manager')->update(['role' => 'admin']);

            // ── 6. Heal users with no Spatie role + null/empty users.role ────
            // Default everyone else to 'user' on the legacy column...
            DB::table('users')
                ->where(function ($q) {
                    $q->whereNull('role')->orWhere('role', '');
                })
                ->update(['role' => 'user']);

            // ...and assign the matching Spatie role if they have none.
            $unrolled = DB::table('users')
                ->leftJoin('model_has_roles', function ($j) use ($userModel) {
                    $j->on('model_has_roles.model_id', '=', 'users.id')
                        ->where('model_has_roles.model_type', '=', $userModel);
                })
                ->whereNull('model_has_roles.role_id')
                ->select('users.id', 'users.role')
                ->get();

            $roleIdByName = [
                'super_admin' => $superAdminId,
                'admin' => $adminId,
                'auditor' => $auditorId,
                'user' => $userId,
            ];

            foreach ($unrolled as $u) {
                $targetId = $roleIdByName[$u->role] ?? $userId;
                DB::table('model_has_roles')->insert([
                    'role_id' => $targetId,
                    'model_type' => $userModel,
                    'model_id' => $u->id,
                ]);
            }

            // ── 7. Bust Spatie permission cache ──────────────────────────────
            app()['cache']->forget('spatie.permission.cache');
        });
    }

    /**
     * No down: re-introducing manager/employee would corrupt the new model.
     */
    public function down(): void
    {
        // intentional no-op
    }
};
