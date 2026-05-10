<?php

namespace Database\Seeders;

use App\Models\Corporation;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Seed one admin (corporate manager) and two users (employees) per
     * demo corporation, plus an unscoped auditor demo account.
     *
     * The admin account is also wired back to the Corporation as its
     * `manager_user_id`. All accounts use the dev password 'password'.
     */
    public function run(): void
    {
        // Make sure the canonical roles exist before assigning them.
        foreach (User::VALID_ROLES as $roleName) {
            Role::firstOrCreate(['name' => $roleName]);
        }

        foreach ($this->demoCorporations() as $slug => $payload) {
            $corp = Corporation::where('email', $payload['email'])->first();
            if (! $corp) {
                continue;
            }

            $admin = User::firstOrCreate(
                ['email' => "admin@{$slug}.example.com"],
                [
                    'name' => $payload['admin_name'],
                    'password' => Hash::make('password'),
                    'role' => User::ROLE_ADMIN,
                    'corporation_id' => $corp->id,
                    'is_corporation_manager' => true,
                ]
            );
            $admin->update([
                'role' => User::ROLE_ADMIN,
                'corporation_id' => $corp->id,
                'is_corporation_manager' => true,
            ]);
            $admin->syncRoles([User::ROLE_ADMIN]);

            if ($corp->manager_user_id !== $admin->id) {
                $corp->update(['manager_user_id' => $admin->id]);
            }

            for ($i = 1; $i <= 2; $i++) {
                $employee = User::firstOrCreate(
                    ['email' => "user{$i}@{$slug}.example.com"],
                    [
                        'name' => "{$payload['admin_name']} Employee {$i}",
                        'password' => Hash::make('password'),
                        'role' => User::ROLE_USER,
                        'corporation_id' => $corp->id,
                        'is_corporation_manager' => false,
                    ]
                );
                $employee->update([
                    'role' => User::ROLE_USER,
                    'corporation_id' => $corp->id,
                    'is_corporation_manager' => false,
                ]);
                $employee->syncRoles([User::ROLE_USER]);
            }
        }

        // Stand-alone auditor demo account, not tied to any tenant. Attach to
        // a corporation manually after seeding if you need to test reviews.
        $auditor = User::firstOrCreate(
            ['email' => 'auditor@grc.com'],
            [
                'name' => 'Auditor User',
                'password' => Hash::make('password'),
                'role' => User::ROLE_AUDITOR,
            ]
        );
        $auditor->syncRoles([User::ROLE_AUDITOR]);

        $this->command->info('Seeded admin + 2 users per demo corporation, plus auditor@grc.com.');
    }

    /**
     * @return array<string, array<string, string>>
     */
    private function demoCorporations(): array
    {
        return [
            'acme' => [
                'email' => 'contact@acme.example.com',
                'admin_name' => 'Acme Manager',
            ],
            'globex' => [
                'email' => 'contact@globex.example.com',
                'admin_name' => 'Globex Manager',
            ],
        ];
    }
}
