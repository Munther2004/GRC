<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create the admin role
        $adminRole = Role::firstOrCreate(['name' => 'admin']);

        // Find the admin@grc.com user or create it
        $superAdmin = User::firstOrCreate(
            ['email' => 'admin@grc.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('Admin@12345'), // Change this default password in production
                'role' => 'admin',
            ]
        );

        // Assign admin role to the user
        $superAdmin->assignRole($adminRole);

        $this->command->info("Super Admin user (admin@grc.com) set up with all permissions!");
    }
}

