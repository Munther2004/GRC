<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            SuperAdminSeeder::class,
            CorporationSeeder::class,
            UserSeeder::class,
            FrameworkSeeder::class,
            ISO27001ControlsSeeder::class,
            NIST80053ControlsSeeder::class,
            OWASPASVSControlsSeeder::class,
            CISBenchmarksControlsSeeder::class,
        ]);

        Artisan::call('controls:backfill-domain');
    }
}
