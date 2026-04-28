<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Demo accounts. These belong to no corporation by default; an integrator
     * can attach them to a tenant once one exists.
     */
    public function run(): void
    {
        $auditor = User::firstOrCreate(
            ['email' => 'auditor@grc.com'],
            [
                'name' => 'Auditor User',
                'password' => Hash::make('password'),
                'role' => User::ROLE_AUDITOR,
            ]
        );
        $auditor->syncRoles([User::ROLE_AUDITOR]);

        $regular = User::firstOrCreate(
            ['email' => 'user@grc.com'],
            [
                'name' => 'Regular User',
                'password' => Hash::make('password'),
                'role' => User::ROLE_USER,
            ]
        );
        $regular->syncRoles([User::ROLE_USER]);
    }
}
