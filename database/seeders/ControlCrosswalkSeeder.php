<?php

namespace Database\Seeders;

use App\Models\Control;
use App\Models\ControlCrosswalk;
use Illuminate\Database\Seeder;

class ControlCrosswalkSeeder extends Seeder
{
    /**
     * Maps known equivalent/partial/related control IDs across ISO 27001, NIST 800-53, OWASP-ASVS and CIS.
     * Each entry: [primary_control_id, mapped_control_id, mapping_type, notes]
     */
    private array $mappings = [
        // ── Access Control ──────────────────────────────────────────────────────
        ['A.5.15',  'AC-1',       'equivalent', 'Both govern access control policy and procedures.'],
        ['A.5.15',  'CIS-6.1',    'equivalent', 'Access control baseline matches ISO 27001 A.5.15.'],
        ['AC-1',    'CIS-6.1',    'equivalent', 'NIST AC-1 access control policy aligns with CIS Control 6.1.'],
        ['A.5.15',  'V2.1.1',     'partial',    'OWASP ASVS V2.1.1 addresses authentication requirements covered by ISO access control.'],
        ['A.8.2',   'AC-3',       'equivalent', 'Access enforcement/least privilege.'],
        ['A.8.2',   'CIS-6.2',    'equivalent', 'Privileged account management — both restrict unnecessary access.'],
        ['AC-3',    'CIS-6.2',    'equivalent', 'NIST AC-3 access enforcement aligns with CIS 6.2.'],
        ['A.8.2',   'V4.1.1',     'partial',    'OWASP V4.1.1 access control design requirements partially covered by ISO A.8.2.'],

        // ── Audit & Logging ─────────────────────────────────────────────────────
        ['A.8.15',  'AU-2',       'equivalent', 'Both define auditable events and log retention.'],
        ['A.8.15',  'CIS-8.1',    'equivalent', 'Audit log management aligns across ISO and CIS.'],
        ['AU-2',    'CIS-8.1',    'equivalent', 'NIST AU-2 audit events align with CIS 8.1.'],
        ['A.8.15',  'V7.1.1',     'partial',    'OWASP V7.1.1 log content requirements partially map to ISO A.8.15.'],
        ['AU-2',    'V7.1.1',     'partial',    'NIST audit event requirements partially map to OWASP logging verification.'],

        // ── Cryptography ────────────────────────────────────────────────────────
        ['A.8.24',  'SC-13',      'equivalent', 'Use of cryptography — both mandate approved cryptographic standards.'],
        ['A.8.24',  'CIS-3.11',   'partial',    'CIS 3.11 data encryption in transit partially addressed by ISO A.8.24.'],
        ['SC-13',   'CIS-3.11',   'partial',    'NIST SC-13 cryptographic protection partially maps to CIS 3.11.'],
        ['A.8.24',  'V6.1.1',     'equivalent', 'OWASP V6.1.1 cryptographic classification maps to ISO A.8.24.'],
        ['SC-13',   'V6.1.1',     'equivalent', 'NIST cryptography controls and OWASP ASVS V6.1.1 both mandate strong algorithms.'],

        // ── Configuration Management ─────────────────────────────────────────
        ['A.8.8',   'CM-6',       'equivalent', 'Configuration settings and baseline security.'],
        ['A.8.8',   'CIS-4.1',    'equivalent', 'Secure configuration baselines for enterprise assets.'],
        ['CM-6',    'CIS-4.1',    'equivalent', 'NIST CM-6 configuration settings align with CIS Safeguard 4.1.'],
        ['A.8.8',   'V14.2.1',    'partial',    'OWASP V14.2.1 dependency and build security partially maps to ISO A.8.8.'],

        // ── Vulnerability Management ─────────────────────────────────────────
        ['A.8.8',   'RA-5',       'related',    'ISO configuration management relates to NIST vulnerability scanning.'],
        ['RA-5',    'CIS-7.1',    'equivalent', 'NIST RA-5 vulnerability scanning aligns with CIS 7.1.'],
        ['A.8.8',   'CIS-7.1',    'related',    'ISO secure configuration and CIS vulnerability management are related.'],

        // ── Incident Management ─────────────────────────────────────────────
        ['A.5.24',  'IR-1',       'equivalent', 'Incident management policy and procedures.'],
        ['A.5.24',  'CIS-17.1',   'equivalent', 'Incident response program establishment.'],
        ['IR-1',    'CIS-17.1',   'equivalent', 'NIST IR-1 and CIS 17.1 both establish incident response policy.'],

        // ── Risk Assessment ─────────────────────────────────────────────────
        ['A.5.1',   'PM-9',       'partial',    'ISO information security policy partially addressed by NIST PM-9 risk management.'],
        ['A.8.1',   'RA-3',       'equivalent', 'Risk assessment requirements.'],
        ['A.8.1',   'CIS-18.1',   'partial',    'Penetration testing and risk assessment partially align.'],
        ['RA-3',    'CIS-18.1',   'partial',    'NIST RA-3 risk assessment relates to CIS 18.1 penetration testing.'],

        // ── Supplier / Third-party ───────────────────────────────────────────
        ['A.5.19',  'SR-3',       'equivalent', 'Third-party and supply chain risk both mandate supplier security requirements.'],
        ['A.5.19',  'CIS-15.1',   'equivalent', 'Service provider management aligns across ISO and CIS.'],
        ['SR-3',    'CIS-15.1',   'related',    'NIST supply chain risk relates to CIS third-party management.'],

        // ── Physical Security ────────────────────────────────────────────────
        ['A.7.1',   'PE-3',       'equivalent', 'Physical access control — both restrict physical entry to facilities.'],
        ['A.7.1',   'CIS-10.1',   'partial',    'CIS malware defense partially relates to ISO physical security.'],

        // ── Authentication ───────────────────────────────────────────────────
        ['A.8.5',   'IA-2',       'equivalent', 'Identification and authentication of users.'],
        ['A.8.5',   'V2.2.1',     'equivalent', 'OWASP V2.2.1 authentication security requirements map to ISO A.8.5.'],
        ['IA-2',    'V2.2.1',     'equivalent', 'NIST IA-2 authentication aligns with OWASP ASVS V2.2.1.'],
        ['A.8.5',   'CIS-5.2',    'equivalent', 'Privileged account management for authentication.'],
        ['IA-2',    'CIS-5.2',    'equivalent', 'NIST IA-2 and CIS 5.2 address privileged account authentication.'],

        // ── Network Security ─────────────────────────────────────────────────
        ['A.8.20',  'SC-7',       'equivalent', 'Network monitoring and boundary protection.'],
        ['A.8.20',  'CIS-13.1',   'equivalent', 'Network monitoring aligns between ISO and CIS.'],
        ['SC-7',    'CIS-13.1',   'equivalent', 'NIST SC-7 boundary protection aligns with CIS 13.1.'],
        ['A.8.20',  'V1.9.1',     'partial',    'OWASP V1.9.1 secure communications requirements partially covered by ISO A.8.20.'],
    ];

    public function run(): void
    {
        // Build a lookup: control_id_string => DB id
        $controls = Control::pluck('id', 'control_id');

        $inserted = 0;
        foreach ($this->mappings as [$primaryId, $mappedId, $type, $notes]) {
            if (! isset($controls[$primaryId]) || ! isset($controls[$mappedId])) {
                continue; // skip if either control doesn't exist in this install
            }

            ControlCrosswalk::firstOrCreate(
                [
                    'primary_control_id' => $controls[$primaryId],
                    'mapped_control_id' => $controls[$mappedId],
                ],
                [
                    'mapping_type' => $type,
                    'notes' => $notes,
                ]
            );
            $inserted++;
        }

        $this->command->info("Crosswalk seeder: {$inserted} mappings inserted.");
    }
}
