<?php
namespace Database\Seeders;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create(['name' => 'System Admin', 'email' => 'admin@grc.com', 'password' => Hash::make('password'), 'role' => 'admin']);
        User::create(['name' => 'Auditor User', 'email' => 'auditor@grc.com', 'password' => Hash::make('password'), 'role' => 'auditor']);
        User::create(['name' => 'Regular User', 'email' => 'user@grc.com', 'password' => Hash::make('password'), 'role' => 'user']);
    }
}