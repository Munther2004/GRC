<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            FrameworkSeeder::class,
            ISO27001ControlsSeeder::class,
            NIST80053ControlsSeeder::class,
            OWASPASVSControlsSeeder::class,
            CISBenchmarksControlsSeeder::class,
        ]);
    }
}
