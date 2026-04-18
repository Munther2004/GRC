<?php

namespace Database\Seeders;

use App\Models\Framework;
use Illuminate\Database\Seeder;

class FrameworkSeeder extends Seeder
{
    public function run(): void
    {
        Framework::create([
            'name' => 'ISO/IEC 27001:2022',
            'short_name' => 'ISO27001',
            'description' => 'Information Security Management System (ISMS) — defines requirements for establishing, implementing, maintaining and continually improving an ISMS.',
            'version' => '2022',
            'is_active' => true,
        ]);

        Framework::create([
            'name' => 'NIST SP 800-53',
            'short_name' => 'NIST800-53',
            'description' => 'Security and Privacy Controls for Information Systems and Organizations.',
            'version' => 'Rev 5',
            'is_active' => true,
        ]);

        Framework::create([
            'name' => 'OWASP ASVS',
            'short_name' => 'OWASP-ASVS',
            'description' => 'Application Security Verification Standard — defines security requirements for web applications across three levels.',
            'version' => '4.0.3',
            'is_active' => true,
        ]);

        Framework::create([
            'name' => 'CIS Benchmarks',
            'short_name' => 'CIS',
            'description' => 'Center for Internet Security Benchmarks — configuration and compliance baselines for securing IT systems.',
            'version' => 'v8',
            'is_active' => true,
        ]);
    }
}
