<?php

namespace Database\Seeders;

use App\Models\Corporation;
use Illuminate\Database\Seeder;

class CorporationSeeder extends Seeder
{
    /**
     * Seed two approved demo corporations. The matching corporate-manager
     * (admin) and employee (user) accounts are created in UserSeeder, which
     * then back-fills `manager_user_id` so the corp has a registered manager.
     */
    public function run(): void
    {
        foreach ($this->corporations() as $data) {
            Corporation::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'industry' => $data['industry'],
                    'description' => $data['description'],
                    'website' => $data['website'],
                    'registration_code' => $data['registration_code'],
                    'last_code_generated_at' => now(),
                    'status' => 'approved',
                    'approved_at' => now(),
                    'credentials_sent' => true,
                ]
            );
        }

        $this->command->info('Seeded '.count($this->corporations()).' demo corporations.');
    }

    /**
     * @return array<int, array<string, string>>
     */
    public static function corporations(): array
    {
        return [
            [
                'name' => 'Acme Corporation',
                'email' => 'contact@acme.example.com',
                'industry' => 'Manufacturing',
                'description' => 'Demo manufacturing tenant.',
                'website' => 'https://acme.example.com',
                'registration_code' => 'ACME0000DEMO0001',
            ],
            [
                'name' => 'Globex Industries',
                'email' => 'contact@globex.example.com',
                'industry' => 'Energy',
                'description' => 'Demo energy tenant.',
                'website' => 'https://globex.example.com',
                'registration_code' => 'GLBX0000DEMO0002',
            ],
        ];
    }
}
