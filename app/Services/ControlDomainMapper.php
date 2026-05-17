<?php

namespace App\Services;

/**
 * Maps a framework-native control category (or ISO control_id) to one of the
 * canonical, cross-framework domains used by the Controls Library Domain
 * filter, AI risk linkers, and gap-analysis aggregations.
 *
 * Storing the human label (not a slug) matches the existing `controls.category`
 * convention so URL/query filtering stays uniform.
 */
class ControlDomainMapper
{
    public const ACCESS_CONTROL = 'Access Control & IAM';

    public const ASSET_MANAGEMENT = 'Asset & Configuration Management';

    public const CRYPTOGRAPHY = 'Cryptography & Data Protection';

    public const LOGGING_MONITORING = 'Logging, Monitoring & Audit';

    public const VULNERABILITY_MANAGEMENT = 'Vulnerability & Threat Management';

    public const INCIDENT_RESPONSE = 'Incident Response';

    public const NETWORK_SECURITY = 'Network & Communications Security';

    public const APPLICATION_SECURITY = 'Application & Secure Development';

    public const GOVERNANCE = 'Governance, Risk & Compliance';

    public const HUMAN_RESOURCES = 'Human Resources & Awareness';

    public const PHYSICAL_SECURITY = 'Physical & Environmental Security';

    public const SUPPLY_CHAIN = 'Supply Chain & Third-Party';

    public const BUSINESS_CONTINUITY = 'Business Continuity & Resilience';

    public const ALL = [
        self::ACCESS_CONTROL,
        self::ASSET_MANAGEMENT,
        self::CRYPTOGRAPHY,
        self::LOGGING_MONITORING,
        self::VULNERABILITY_MANAGEMENT,
        self::INCIDENT_RESPONSE,
        self::NETWORK_SECURITY,
        self::APPLICATION_SECURITY,
        self::GOVERNANCE,
        self::HUMAN_RESOURCES,
        self::PHYSICAL_SECURITY,
        self::SUPPLY_CHAIN,
        self::BUSINESS_CONTINUITY,
    ];

    public static function for(string $frameworkShortName, string $controlId, string $category): string
    {
        $short = strtoupper($frameworkShortName);

        return match (true) {
            str_contains($short, 'ISO27001') => self::forIso($controlId),
            str_contains($short, 'NIST') => self::forNist($category),
            str_contains($short, 'OWASP') || str_contains($short, 'ASVS') => self::forOwasp($category),
            str_contains($short, 'CIS') => self::forCis($category),
            default => self::GOVERNANCE,
        };
    }

    private static function forIso(string $controlId): string
    {
        // ISO27001:2022 control IDs are of the form A.<theme>.<n>.
        if (! preg_match('/^A\.(\d+)\.(\d+)$/', $controlId, $m)) {
            return self::GOVERNANCE;
        }
        $theme = (int) $m[1];
        $n = (int) $m[2];

        if ($theme === 6) {
            return self::HUMAN_RESOURCES;
        }
        if ($theme === 7) {
            return self::PHYSICAL_SECURITY;
        }
        if ($theme === 5) {
            return match (true) {
                $n >= 1 && $n <= 6 => self::GOVERNANCE,
                $n === 7 => self::VULNERABILITY_MANAGEMENT,
                $n === 8 => self::GOVERNANCE,
                $n >= 9 && $n <= 14 => self::ASSET_MANAGEMENT,
                $n >= 15 && $n <= 18 => self::ACCESS_CONTROL,
                $n >= 19 && $n <= 23 => self::SUPPLY_CHAIN,
                $n >= 24 && $n <= 28 => self::INCIDENT_RESPONSE,
                $n >= 29 && $n <= 30 => self::BUSINESS_CONTINUITY,
                $n >= 31 && $n <= 37 => self::GOVERNANCE,
                default => self::GOVERNANCE,
            };
        }
        if ($theme === 8) {
            return match (true) {
                $n === 1 => self::ASSET_MANAGEMENT,
                $n >= 2 && $n <= 5 => self::ACCESS_CONTROL,
                $n === 6 => self::ASSET_MANAGEMENT,
                $n === 7 || $n === 8 => self::VULNERABILITY_MANAGEMENT,
                $n === 9 => self::ASSET_MANAGEMENT,
                $n >= 10 && $n <= 12 => self::CRYPTOGRAPHY,
                $n === 13 || $n === 14 => self::BUSINESS_CONTINUITY,
                $n >= 15 && $n <= 17 => self::LOGGING_MONITORING,
                $n === 18 => self::ACCESS_CONTROL,
                $n === 19 => self::APPLICATION_SECURITY,
                $n >= 20 && $n <= 23 => self::NETWORK_SECURITY,
                $n === 24 => self::CRYPTOGRAPHY,
                $n >= 25 && $n <= 34 => self::APPLICATION_SECURITY,
                default => self::GOVERNANCE,
            };
        }

        return self::GOVERNANCE;
    }

    private static function forNist(string $category): string
    {
        return match ($category) {
            'Access Control', 'Identification and Authentication' => self::ACCESS_CONTROL,
            'Audit and Accountability' => self::LOGGING_MONITORING,
            'Awareness and Training', 'Personnel Security' => self::HUMAN_RESOURCES,
            'Configuration Management', 'Maintenance' => self::ASSET_MANAGEMENT,
            'Contingency Planning' => self::BUSINESS_CONTINUITY,
            'Incident Response' => self::INCIDENT_RESPONSE,
            'Media Protection', 'PII Processing and Transparency' => self::CRYPTOGRAPHY,
            'Physical and Environmental Protection' => self::PHYSICAL_SECURITY,
            'Planning', 'Risk Assessment', 'Assessment, Authorisation, and Monitoring' => self::GOVERNANCE,
            'Supply Chain Risk Management' => self::SUPPLY_CHAIN,
            'System and Communications Protection' => self::NETWORK_SECURITY,
            'System and Information Integrity' => self::VULNERABILITY_MANAGEMENT,
            'System and Services Acquisition' => self::APPLICATION_SECURITY,
            default => self::GOVERNANCE,
        };
    }

    private static function forOwasp(string $category): string
    {
        return match ($category) {
            'Access Control', 'Authentication', 'Session Management' => self::ACCESS_CONTROL,
            'API and Web Service',
            'Architecture, Design and Threat Modelling',
            'Business Logic',
            'File and Resource',
            'Validation, Sanitisation and Encoding' => self::APPLICATION_SECURITY,
            'Communication Security' => self::NETWORK_SECURITY,
            'Configuration' => self::ASSET_MANAGEMENT,
            'Data Protection', 'Stored Cryptography' => self::CRYPTOGRAPHY,
            'Error Handling and Logging' => self::LOGGING_MONITORING,
            'Malicious Code' => self::VULNERABILITY_MANAGEMENT,
            default => self::APPLICATION_SECURITY,
        };
    }

    private static function forCis(string $category): string
    {
        return match ($category) {
            'Access Control Management', 'Account Management' => self::ACCESS_CONTROL,
            'Application Software Security' => self::APPLICATION_SECURITY,
            'Audit Log Management' => self::LOGGING_MONITORING,
            'Continuous Vulnerability Management',
            'Email and Web Browser Protections',
            'Malware Defenses',
            'Penetration Testing' => self::VULNERABILITY_MANAGEMENT,
            'Data Protection' => self::CRYPTOGRAPHY,
            'Data Recovery' => self::BUSINESS_CONTINUITY,
            'Incident Response Management' => self::INCIDENT_RESPONSE,
            'Inventory and Control of Enterprise Assets',
            'Inventory and Control of Software Assets',
            'Secure Configuration of Enterprise Assets and Software' => self::ASSET_MANAGEMENT,
            'Network Infrastructure Management',
            'Network Monitoring and Defense' => self::NETWORK_SECURITY,
            'Security Awareness and Skills Training' => self::HUMAN_RESOURCES,
            'Service Provider Management' => self::SUPPLY_CHAIN,
            default => self::GOVERNANCE,
        };
    }
}
