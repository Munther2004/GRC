<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class SuperAdminSeeder extends Seeder
{
    /**
     * Seed the platform owner.
     *
     * The platform owner has:
     *   - users.role = 'super_admin'
     *   - Spatie role 'super_admin'
     *   - corporation_id = NULL  (not tied to any tenant)
     *   - is_corporation_manager = false
     */
    public function run(): void
    {
        $superAdminRole = Role::firstOrCreate(['name' => User::ROLE_SUPER_ADMIN]);

        $superAdmin = User::firstOrCreate(
            ['email' => 'admin@grc.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('Admin@12345'),
                'role' => User::ROLE_SUPER_ADMIN,
                'corporation_id' => null,
                'is_corporation_manager' => false,
            ]
        );

        // If the row already existed under an earlier role, normalise it.
        if ($superAdmin->role !== User::ROLE_SUPER_ADMIN || $superAdmin->corporation_id !== null) {
            $superAdmin->update([
                'role' => User::ROLE_SUPER_ADMIN,
                'corporation_id' => null,
                'is_corporation_manager' => false,
            ]);
        }

        $superAdmin->syncRoles([$superAdminRole]);

        $this->command->info('Super Admin user (admin@grc.com) seeded with super_admin role.');
    }
}
