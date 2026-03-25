<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CISBenchmarksControlsSeeder extends Seeder
{
    public function run(): void
    {
        $framework = DB::table('frameworks')->where('short_name', 'CIS')->first();
        if (! $framework) {
            $this->command->error('CIS-CSC framework not found. Run FrameworkSeeder first.');

            return;
        }

        DB::table('controls')->where('framework_id', $framework->id)->delete();

        $controls = [

            // ─── CIS CONTROL 1: INVENTORY AND CONTROL OF ENTERPRISE ASSETS ──────
            ['control_id' => 'CIS-1.1', 'category' => 'Inventory and Control of Enterprise Assets',
                'title' => 'Establish and Maintain Detailed Enterprise Asset Inventory',
                'description' => 'Establish and maintain an accurate, detailed, and up-to-date inventory of all enterprise assets with the potential to store or process data. This inventory shall capture hardware assets (end-user devices, network devices, non-computing/IoT devices, and servers) whether connected to the infrastructure physically, virtually, remotely, and those within cloud environments.',
                'implementation_guidance' => 'Deploy automated asset discovery tools. Scan for assets at least weekly. Document each asset with owner, location, classification, and connectivity. Review and reconcile inventory monthly.'],

            ['control_id' => 'CIS-1.2', 'category' => 'Inventory and Control of Enterprise Assets',
                'title' => 'Address Unauthorized Assets',
                'description' => 'Ensure that a process exists to address unauthorized assets on a weekly basis. The enterprise may choose to remove the asset from the network, deny the asset from connecting remotely to the network, or quarantine the asset.',
                'implementation_guidance' => 'Implement network access control (NAC) to detect and quarantine unauthorised assets. Define and enforce a process for responding to unknown assets. Alert security teams when new unrecognised assets connect.'],

            ['control_id' => 'CIS-1.3', 'category' => 'Inventory and Control of Enterprise Assets',
                'title' => 'Utilize an Active Discovery Tool',
                'description' => 'Utilize an active discovery tool to identify assets connected to the enterprise\'s network. Configure the active discovery tool to execute daily, or more frequently.',
                'implementation_guidance' => 'Deploy network scanning tools (e.g., Nmap, Qualys, Tenable). Schedule daily active scans. Integrate scan results with the asset inventory. Review new discoveries promptly.'],

            ['control_id' => 'CIS-1.4', 'category' => 'Inventory and Control of Enterprise Assets',
                'title' => 'Use Dynamic Host Configuration Protocol (DHCP) Logging',
                'description' => 'Use DHCP logging on all DHCP servers or Internet Protocol (IP) address management tools to update the enterprise\'s asset inventory.',
                'implementation_guidance' => 'Enable DHCP logging on all DHCP servers. Forward DHCP logs to SIEM. Use DHCP data to correlate with asset inventory and identify undocumented devices.'],

            ['control_id' => 'CIS-1.5', 'category' => 'Inventory and Control of Enterprise Assets',
                'title' => 'Use a Passive Asset Discovery Tool',
                'description' => 'Use a passive discovery tool to identify assets connected to the enterprise\'s network. Review and use scans to update the enterprise\'s asset inventory at least weekly.',
                'implementation_guidance' => 'Deploy passive network monitoring tools to capture traffic-based asset discovery. Use this to supplement active scanning results. Update asset inventory with passively discovered assets weekly.'],

            // ─── CIS CONTROL 2: INVENTORY AND CONTROL OF SOFTWARE ASSETS ────────
            ['control_id' => 'CIS-2.1', 'category' => 'Inventory and Control of Software Assets',
                'title' => 'Establish and Maintain a Software Inventory',
                'description' => 'Establish and maintain a detailed inventory of all licensed software installed on enterprise assets. The software inventory must document the title, publisher, initial install/use date, and business purpose for each entry.',
                'implementation_guidance' => 'Use software inventory tools or endpoint management platforms to collect installed software. Review and update the inventory monthly. Assign business owners to all software titles.'],

            ['control_id' => 'CIS-2.2', 'category' => 'Inventory and Control of Software Assets',
                'title' => 'Ensure Authorized Software is Currently Supported',
                'description' => 'Ensure that only currently supported software is designated as authorized in the software inventory for enterprise assets. If software is unsupported yet necessary for mission requirements, document an exception detailing mitigating controls.',
                'implementation_guidance' => 'Identify end-of-life software in the inventory. Plan and execute upgrades or replacements. Document exceptions with compensating controls and risk acceptance. Review unsupported software status quarterly.'],

            ['control_id' => 'CIS-2.3', 'category' => 'Inventory and Control of Software Assets',
                'title' => 'Address Unauthorized Software',
                'description' => 'Ensure that unauthorized software is either removed from use on enterprise assets or receives a documented exception. Review monthly, or more frequently.',
                'implementation_guidance' => 'Define an approved software list. Block or remove unapproved software using endpoint management tools. Investigate and document the presence of unapproved software. Alert on installation of unlisted software.'],

            ['control_id' => 'CIS-2.4', 'category' => 'Inventory and Control of Software Assets',
                'title' => 'Utilize Automated Software Inventory Tools',
                'description' => 'Utilize software inventory tools throughout the enterprise to automate the documentation of all software on business assets.',
                'implementation_guidance' => 'Deploy endpoint management or SCCM/Intune solutions to automate software discovery. Schedule automated collection at least daily. Reconcile automated inventory with the approved software list.'],

            ['control_id' => 'CIS-2.5', 'category' => 'Inventory and Control of Software Assets',
                'title' => 'Allowlist Authorized Software',
                'description' => 'Use technical controls, such as application allowlisting, to ensure that only authorized software can execute or be accessed. Reassess bi-annually, or more frequently.',
                'implementation_guidance' => 'Implement application whitelisting using tools such as AppLocker or Windows Defender Application Control. Define and maintain the allowlist. Test and update the list with each software change. Review effectiveness semi-annually.'],

            ['control_id' => 'CIS-2.6', 'category' => 'Inventory and Control of Software Assets',
                'title' => 'Allowlist Authorized Libraries',
                'description' => 'Use technical controls to ensure that only authorized software libraries are loaded into a system process. Libraries include DLLs, add-ins, or Java packages.',
                'implementation_guidance' => 'Apply library allowlisting controls for critical processes. Monitor for loading of unauthorised libraries. Use code signing to authenticate libraries.'],

            // ─── CIS CONTROL 3: DATA PROTECTION ──────────────────────────────────
            ['control_id' => 'CIS-3.1', 'category' => 'Data Protection',
                'title' => 'Establish and Maintain a Data Management Process',
                'description' => 'Establish and maintain a data management process. In the process, address data sensitivity, data owner, handling of data, data retention limits, and disposal requirements.',
                'implementation_guidance' => 'Define a data management policy covering classification, ownership, retention, and disposal. Assign data owners. Review and update the policy annually.'],

            ['control_id' => 'CIS-3.2', 'category' => 'Data Protection',
                'title' => 'Establish and Maintain a Data Inventory',
                'description' => 'Establish and maintain a data inventory based on the enterprise\'s data management process. Inventory sensitive data, at a minimum. Review and update inventory annually.',
                'implementation_guidance' => 'Create and maintain a data inventory mapping data types to systems, owners, and classification levels. Use data discovery tools to identify sensitive data repositories. Update inventory when new data processing activities begin.'],

            ['control_id' => 'CIS-3.3', 'category' => 'Data Protection',
                'title' => 'Configure Data Access Control Lists',
                'description' => 'Configure data access control lists based on a user\'s need to know. Apply data access control lists, also known as access permissions, to local and remote file systems, databases, and applications.',
                'implementation_guidance' => 'Apply least-privilege access controls to all data stores. Review ACLs quarterly. Remove access when no longer required. Document the business justification for each access grant.'],

            ['control_id' => 'CIS-3.4', 'category' => 'Data Protection',
                'title' => 'Enforce Data Retention',
                'description' => 'Retain data according to the enterprise\'s data management process. Data retention must include both minimum and maximum timelines.',
                'implementation_guidance' => 'Implement automated data retention policies. Define minimum and maximum retention periods by data category. Securely delete data that has exceeded its maximum retention period. Document retention decisions.'],

            ['control_id' => 'CIS-3.5', 'category' => 'Data Protection',
                'title' => 'Securely Dispose of Data',
                'description' => 'Securely dispose of data as outlined in the enterprise\'s data management process. Ensure the disposal process and method are commensurate with the data sensitivity.',
                'implementation_guidance' => 'Use certified data destruction methods aligned with data sensitivity. Apply DoD 5220.22-M or NIST 800-88 standards. Obtain destruction certificates for high-sensitivity data. Log all data disposal activities.'],

            ['control_id' => 'CIS-3.6', 'category' => 'Data Protection',
                'title' => 'Encrypt Data on End-User Devices',
                'description' => 'Encrypt data on end-user devices containing sensitive data. Example implementations can include Windows BitLocker, Apple FileVault, Linux dm-crypt.',
                'implementation_guidance' => 'Enable full-disk encryption on all laptops and mobile devices. Use BitLocker, FileVault, or equivalent. Store recovery keys securely in a management system. Verify encryption status through endpoint management.'],

            ['control_id' => 'CIS-3.7', 'category' => 'Data Protection',
                'title' => 'Establish and Maintain a Data Classification Scheme',
                'description' => 'Establish, document, and publish a data classification scheme. The classification scheme should define at least two classification levels and describe the criteria to meet each level.',
                'implementation_guidance' => 'Define at least three classification levels (e.g., Public, Internal, Confidential). Document classification criteria. Train all staff on the classification scheme. Apply labels to all data assets.'],

            ['control_id' => 'CIS-3.8', 'category' => 'Data Protection',
                'title' => 'Document Data Flows',
                'description' => 'Document data flows. Data flow documentation includes service provider data flows. Review and update documentation annually, or when significant enterprise changes occur.',
                'implementation_guidance' => 'Create and maintain data flow diagrams for all critical processes. Include third-party data transfers. Review data flows annually and when new services are onboarded.'],

            ['control_id' => 'CIS-3.9', 'category' => 'Data Protection',
                'title' => 'Encrypt Data on Removable Media',
                'description' => 'Encrypt data on removable media.',
                'implementation_guidance' => 'Enforce encryption on all removable media containing sensitive data. Use BitLocker To Go or equivalent. Implement DLP policies to require encryption for removable media.'],

            ['control_id' => 'CIS-3.10', 'category' => 'Data Protection',
                'title' => 'Encrypt Sensitive Data in Transit',
                'description' => 'Encrypt sensitive data in transit. Example implementations can include Transport Layer Security (TLS) and Open Secure Shell (OpenSSH).',
                'implementation_guidance' => 'Enforce TLS 1.2+ for all data in transit. Disable unencrypted protocols for sensitive data transfer. Implement TLS inspection for monitoring without sacrificing encryption.'],

            ['control_id' => 'CIS-3.11', 'category' => 'Data Protection',
                'title' => 'Encrypt Sensitive Data At Rest',
                'description' => 'Encrypt sensitive data at rest on servers, applications, and databases containing sensitive data.',
                'implementation_guidance' => 'Implement database encryption for sensitive fields or whole database encryption. Apply file system encryption for data stores. Manage encryption keys using a key management system.'],

            // ─── CIS CONTROL 4: SECURE CONFIGURATION ────────────────────────────
            ['control_id' => 'CIS-4.1', 'category' => 'Secure Configuration of Enterprise Assets and Software',
                'title' => 'Establish and Maintain a Secure Configuration Process',
                'description' => 'Establish and maintain a secure configuration process for enterprise assets and software. Review and update documentation annually, or when significant enterprise changes occur.',
                'implementation_guidance' => 'Define security configuration baselines for all asset types. Use CIS Benchmarks as the baseline source. Document the configuration process and assign ownership.'],

            ['control_id' => 'CIS-4.2', 'category' => 'Secure Configuration of Enterprise Assets and Software',
                'title' => 'Establish and Maintain a Secure Configuration Process for Network Infrastructure',
                'description' => 'Establish and maintain a secure configuration process for network devices. Review and update documentation annually.',
                'implementation_guidance' => 'Apply security baselines to all network devices (firewalls, switches, routers). Disable default credentials. Remove unnecessary services. Review network device configurations quarterly.'],

            ['control_id' => 'CIS-4.3', 'category' => 'Secure Configuration of Enterprise Assets and Software',
                'title' => 'Configure Automatic Session Locking on Enterprise Assets',
                'description' => 'Configure automatic session locking on enterprise assets after a defined period of inactivity.',
                'implementation_guidance' => 'Configure all workstations and servers to lock after 15 minutes of inactivity. Enforce via Group Policy or MDM. Require password to unlock. Apply to both physical and remote sessions.'],

            ['control_id' => 'CIS-4.4', 'category' => 'Secure Configuration of Enterprise Assets and Software',
                'title' => 'Implement and Manage a Firewall on Servers',
                'description' => 'Implement and manage a firewall on servers, where supported. Example implementations include a virtual firewall, operating system firewall, or a third-party firewall agent.',
                'implementation_guidance' => 'Enable host-based firewalls on all servers. Configure default-deny rules. Allow only required traffic. Manage firewall rules through centralised configuration management.'],

            ['control_id' => 'CIS-4.5', 'category' => 'Secure Configuration of Enterprise Assets and Software',
                'title' => 'Implement and Manage a Firewall on End-User Devices',
                'description' => 'Implement and manage a host-based firewall or port-filtering tool on end-user devices, with a default-deny rule that drops all traffic except those services and ports that are explicitly allowed.',
                'implementation_guidance' => 'Enable Windows Defender Firewall or equivalent on all end-user devices. Manage rules centrally. Block all inbound connections by default. Review firewall rules quarterly.'],

            ['control_id' => 'CIS-4.6', 'category' => 'Secure Configuration of Enterprise Assets and Software',
                'title' => 'Securely Manage Enterprise Assets and Software',
                'description' => 'Securely manage enterprise assets and software. Example implementations include managing configuration through version-controlled infrastructure-as-code and accessing administrative interfaces over secure network protocols.',
                'implementation_guidance' => 'Use infrastructure-as-code for configuration management. Access administrative interfaces via encrypted channels only. Implement change control for configuration changes.'],

            ['control_id' => 'CIS-4.7', 'category' => 'Secure Configuration of Enterprise Assets and Software',
                'title' => 'Manage Default Accounts on Enterprise Assets and Software',
                'description' => 'Manage default accounts on enterprise assets and software, such as root, administrator, and other pre-configured vendor accounts. Example implementations can include disabling default accounts or making them unusable.',
                'implementation_guidance' => 'Disable or rename all default accounts. Change all default passwords immediately after deployment. Document all retained default accounts with justification. Audit for default accounts monthly.'],

            ['control_id' => 'CIS-4.8', 'category' => 'Secure Configuration of Enterprise Assets and Software',
                'title' => 'Uninstall or Disable Unnecessary Services on Enterprise Assets and Software',
                'description' => 'Uninstall or disable unnecessary services on enterprise assets and software, such as an unused file sharing service, web application module, or service function.',
                'implementation_guidance' => 'Review and disable all unnecessary services and features. Document justified services. Re-validate necessity during periodic configuration reviews. Apply principle of least functionality.'],

            // ─── CIS CONTROL 5: ACCOUNT MANAGEMENT ───────────────────────────────
            ['control_id' => 'CIS-5.1', 'category' => 'Account Management',
                'title' => 'Establish and Maintain an Inventory of Accounts',
                'description' => 'Establish and maintain an inventory of all accounts managed in the enterprise. The inventory must include both user and administrator accounts. The inventory, at a minimum, should contain the person\'s name, username, start/stop dates, and department.',
                'implementation_guidance' => 'Maintain an account inventory in an identity management system. Include user, service, and shared accounts. Review and reconcile the inventory monthly.'],

            ['control_id' => 'CIS-5.2', 'category' => 'Account Management',
                'title' => 'Use Unique Passwords',
                'description' => 'Use unique passwords for all enterprise assets. Best practice implementation includes, at minimum, an 8-character password for accounts using MFA and a 14-character password for accounts not using MFA.',
                'implementation_guidance' => 'Enforce minimum password length of 14 characters for accounts without MFA. Prohibit password reuse. Implement a password manager for users. Check passwords against breach databases.'],

            ['control_id' => 'CIS-5.3', 'category' => 'Account Management',
                'title' => 'Disable Dormant Accounts',
                'description' => 'Delete or disable any dormant accounts after a period of 45 days of inactivity, where supported.',
                'implementation_guidance' => 'Run automated reports of account last-login dates. Disable accounts inactive for more than 45 days. Alert account owners before disabling. Delete accounts no longer associated with active personnel.'],

            ['control_id' => 'CIS-5.4', 'category' => 'Account Management',
                'title' => 'Restrict Administrator Privileges to Dedicated Administrator Accounts',
                'description' => 'Restrict administrator privileges to dedicated administrator accounts on enterprise assets. Conduct general computing activities, such as internet browsing, email, and productivity suite use, from the user\'s primary, non-privileged account.',
                'implementation_guidance' => 'Implement separate admin accounts for all privileged activities. Prohibit use of admin accounts for email and browsing. Enforce through technical controls where possible. Audit admin account usage regularly.'],

            ['control_id' => 'CIS-5.5', 'category' => 'Account Management',
                'title' => 'Establish and Maintain an Inventory of Service Accounts',
                'description' => 'Establish and maintain an inventory of service accounts. The inventory, at a minimum, must contain department owner, review date, and purpose. Perform service account reviews to validate that all active accounts are authorized, on a recurring schedule at a minimum quarterly, or more frequently.',
                'implementation_guidance' => 'Create and maintain a service account inventory with business owner, purpose, and permissions. Review service accounts quarterly. Rotate service account credentials regularly. Disable unused service accounts promptly.'],

            ['control_id' => 'CIS-5.6', 'category' => 'Account Management',
                'title' => 'Centralize Account Management',
                'description' => 'Centralize account management through a directory or identity service.',
                'implementation_guidance' => 'Implement a centralised identity provider (Active Directory, Azure AD, LDAP). Manage all accounts through the central directory. Integrate applications with the centralised IdP for authentication.'],

            // ─── CIS CONTROL 6: ACCESS CONTROL MANAGEMENT ────────────────────────
            ['control_id' => 'CIS-6.1', 'category' => 'Access Control Management',
                'title' => 'Establish an Access Granting Process',
                'description' => 'Establish and follow a process, preferably automated, for granting access to enterprise assets upon new hire, rights grant, or role change of a user.',
                'implementation_guidance' => 'Define a formal access request and approval workflow. Use an ITSM or IAM system to manage requests. Require manager and data owner approval. Document all access grants with justification.'],

            ['control_id' => 'CIS-6.2', 'category' => 'Access Control Management',
                'title' => 'Establish an Access Revoking Process',
                'description' => 'Establish and follow a process, preferably automated, for revoking access to enterprise assets, through disabling accounts immediately upon termination, rights revocation, or role change of a user.',
                'implementation_guidance' => 'Automate access revocation upon HR system termination notifications. Revoke all access within 24 hours of termination. Remove from all groups and systems. Document the revocation process and maintain audit records.'],

            ['control_id' => 'CIS-6.3', 'category' => 'Access Control Management',
                'title' => 'Require MFA for Externally-Exposed Applications',
                'description' => 'Require all externally-exposed enterprise or third-party applications to enforce MFA, where supported. Enforcing MFA through a directory service or SSO provider is a satisfactory implementation.',
                'implementation_guidance' => 'Enable MFA on all externally accessible applications. Use authenticator apps or hardware tokens. Implement SSO with MFA enforcement centrally. Monitor and alert on MFA bypass attempts.'],

            ['control_id' => 'CIS-6.4', 'category' => 'Access Control Management',
                'title' => 'Require MFA for Remote Network Access',
                'description' => 'Require MFA for remote network access.',
                'implementation_guidance' => 'Require MFA for all VPN and remote desktop connections. Use certificate-based or TOTP MFA. Block remote access without MFA. Monitor remote access sessions.'],

            ['control_id' => 'CIS-6.5', 'category' => 'Access Control Management',
                'title' => 'Require MFA for Administrative Access',
                'description' => 'Require MFA for all administrative access accounts, where supported, on all enterprise assets.',
                'implementation_guidance' => 'Enforce MFA for all privileged accounts. Use hardware tokens for highest-privilege accounts. Monitor and alert on MFA bypass for admin accounts. Audit admin MFA compliance regularly.'],

            ['control_id' => 'CIS-6.6', 'category' => 'Access Control Management',
                'title' => 'Establish and Maintain an Inventory of Authentication and Authorization Systems',
                'description' => 'Establish and maintain an inventory of the enterprise\'s authentication and authorization systems, including those hosted on-site or at a remote service provider.',
                'implementation_guidance' => 'Document all authentication systems including IdPs, SSO, and MFA solutions. Include on-premises and cloud systems. Review and update the inventory semi-annually.'],

            ['control_id' => 'CIS-6.7', 'category' => 'Access Control Management',
                'title' => 'Centralize Access Control',
                'description' => 'Centralize access control for all enterprise assets through a directory service or SSO provider, where supported.',
                'implementation_guidance' => 'Implement SSO for all applications. Manage authorisation centrally through the IdP or access management platform. Reduce reliance on local accounts and decentralised access control.'],

            ['control_id' => 'CIS-6.8', 'category' => 'Access Control Management',
                'title' => 'Define and Maintain Role-Based Access Control',
                'description' => 'Define and maintain role-based access control (RBAC), through determining and documenting the access rights necessary for each role within the enterprise to successfully carry out its assigned duties.',
                'implementation_guidance' => 'Define roles aligned to job functions. Document permissions for each role. Implement RBAC in all systems. Perform annual role review and right-sizing exercise.'],

            // ─── CIS CONTROL 7: CONTINUOUS VULNERABILITY MANAGEMENT ──────────────
            ['control_id' => 'CIS-7.1', 'category' => 'Continuous Vulnerability Management',
                'title' => 'Establish and Maintain a Vulnerability Management Process',
                'description' => 'Establish and maintain a documented vulnerability management process for enterprise assets. Review and update documentation annually, or when significant enterprise changes occur that could impact this safeguard.',
                'implementation_guidance' => 'Define vulnerability identification, scoring, prioritisation, and remediation processes. Assign ownership. Define SLAs for remediation by severity. Review the process annually.'],

            ['control_id' => 'CIS-7.2', 'category' => 'Continuous Vulnerability Management',
                'title' => 'Establish and Maintain a Remediation Process',
                'description' => 'Establish and maintain a risk-based remediation strategy documented in a remediation process, with monthly, or more frequent, reviews.',
                'implementation_guidance' => 'Prioritise remediation using CVSS scores and asset criticality. Track remediation progress in a vulnerability management tool. Review outstanding vulnerabilities monthly with asset owners.'],

            ['control_id' => 'CIS-7.3', 'category' => 'Continuous Vulnerability Management',
                'title' => 'Perform Automated Operating System Patch Management',
                'description' => 'Perform operating system updates on enterprise assets through automated patch management on a monthly, or more frequent, basis.',
                'implementation_guidance' => 'Deploy automated patch management for all operating systems. Test patches in a non-production environment before widespread deployment. Track patch deployment status and enforce compliance.'],

            ['control_id' => 'CIS-7.4', 'category' => 'Continuous Vulnerability Management',
                'title' => 'Perform Automated Application Patch Management',
                'description' => 'Perform application updates on enterprise assets through automated patch management on a monthly, or more frequent, basis.',
                'implementation_guidance' => 'Include third-party applications in the patch management programme. Automate updates for browsers, office suites, and common applications. Track application patch compliance.'],

            ['control_id' => 'CIS-7.5', 'category' => 'Continuous Vulnerability Management',
                'title' => 'Perform Automated Vulnerability Scans of Internal Enterprise Assets',
                'description' => 'Perform automated vulnerability scans of internal enterprise assets on a quarterly, or more frequent, basis.',
                'implementation_guidance' => 'Conduct authenticated vulnerability scans of all internal assets quarterly. Use credentialed scanning for thorough coverage. Review and prioritise findings. Track remediation in vulnerability management tool.'],

            ['control_id' => 'CIS-7.6', 'category' => 'Continuous Vulnerability Management',
                'title' => 'Perform Automated Vulnerability Scans of Externally-Exposed Enterprise Assets',
                'description' => 'Perform automated vulnerability scans of externally exposed enterprise assets using a SCAP-compliant vulnerability scanning tool.',
                'implementation_guidance' => 'Scan all externally-exposed assets weekly or more frequently. Include web applications in scope. Immediately action critical vulnerabilities on external assets. Consider a continuous scanning approach.'],

            // ─── CIS CONTROL 8: AUDIT LOG MANAGEMENT ─────────────────────────────
            ['control_id' => 'CIS-8.1', 'category' => 'Audit Log Management',
                'title' => 'Establish and Maintain an Audit Log Management Process',
                'description' => 'Establish and maintain an audit log management process that defines the enterprise\'s logging requirements.',
                'implementation_guidance' => 'Define logging requirements covering what to log, retention periods, and who is responsible for review. Obtain management approval. Review and update the process annually.'],

            ['control_id' => 'CIS-8.2', 'category' => 'Audit Log Management',
                'title' => 'Collect Audit Logs',
                'description' => 'Collect audit logs. Ensure that logging has been enabled across enterprise assets.',
                'implementation_guidance' => 'Enable logging on all enterprise assets (servers, network devices, endpoints, applications). Forward logs to a centralised SIEM. Validate logging completeness regularly.'],

            ['control_id' => 'CIS-8.3', 'category' => 'Audit Log Management',
                'title' => 'Ensure Adequate Audit Log Storage',
                'description' => 'Ensure that logging destinations maintain adequate storage to comply with the enterprise\'s audit log management process.',
                'implementation_guidance' => 'Calculate log storage requirements based on volume and retention period. Implement automated alerts for storage thresholds. Archive logs before deletion. Test log storage capacity regularly.'],

            ['control_id' => 'CIS-8.4', 'category' => 'Audit Log Management',
                'title' => 'Standardize Time Synchronization',
                'description' => 'Standardize time synchronization. Configure at least two synchronized time sources across enterprise assets, where supported.',
                'implementation_guidance' => 'Configure all assets to use at least two NTP sources. Use a hierarchical NTP configuration. Monitor for clock drift. Standardise on UTC timestamps in all log records.'],

            ['control_id' => 'CIS-8.5', 'category' => 'Audit Log Management',
                'title' => 'Collect Detailed Audit Logs',
                'description' => 'Configure detailed audit logging for enterprise assets containing sensitive data. Include event source, date, username, timestamp, source addresses, destination addresses, and other useful elements that could assist in a forensic investigation.',
                'implementation_guidance' => 'Define required fields for audit log entries. Configure systems to capture all required fields. Validate log completeness using periodic log review. Ensure logs capture sufficient context for forensic investigation.'],

            ['control_id' => 'CIS-8.6', 'category' => 'Audit Log Management',
                'title' => 'Collect DNS Query Audit Logs',
                'description' => 'Collect DNS query audit logs on enterprise assets, where appropriate and supported.',
                'implementation_guidance' => 'Enable DNS query logging on DNS resolvers. Forward DNS logs to SIEM. Use DNS logs to detect C2 communications and data exfiltration. Retain DNS logs for at least 90 days.'],

            ['control_id' => 'CIS-8.7', 'category' => 'Audit Log Management',
                'title' => 'Collect URL Request Audit Logs',
                'description' => 'Collect URL request audit logs for enterprise assets, where appropriate and supported.',
                'implementation_guidance' => 'Log all web proxy requests. Include full URL, user identity, and response code. Forward logs to SIEM. Use URL logs to detect malware communications and policy violations.'],

            ['control_id' => 'CIS-8.8', 'category' => 'Audit Log Management',
                'title' => 'Collect Command-Line Audit Logs',
                'description' => 'Collect command-line audit logs.',
                'implementation_guidance' => 'Enable command-line logging (PowerShell script block logging, bash history) on all systems. Forward command logs to SIEM. Use command logs to detect malicious activity and insider threats.'],

            // ─── CIS CONTROL 9: EMAIL AND WEB BROWSER PROTECTIONS ─────────────────
            ['control_id' => 'CIS-9.1', 'category' => 'Email and Web Browser Protections',
                'title' => 'Ensure Use of Only Fully Supported Browsers and Email Clients',
                'description' => 'Ensure only fully supported browsers and email clients are allowed to execute in the enterprise, only using the latest version of browsers and email clients provided through the vendor.',
                'implementation_guidance' => 'Maintain an approved browser and email client list. Block outdated versions. Automate updates for approved clients. Remove unsupported browser versions promptly.'],

            ['control_id' => 'CIS-9.2', 'category' => 'Email and Web Browser Protections',
                'title' => 'Use DNS Filtering Services',
                'description' => 'Use DNS filtering services on all enterprise assets to block access to known malicious domains.',
                'implementation_guidance' => 'Deploy DNS filtering (e.g., Cisco Umbrella, Cloudflare Gateway). Block known malicious categories. Review and update block lists regularly. Log DNS filtering actions.'],

            ['control_id' => 'CIS-9.3', 'category' => 'Email and Web Browser Protections',
                'title' => 'Maintain and Enforce Network-Based URL Filters',
                'description' => 'Enforce and update network-based URL filters to limit an enterprise asset from connecting to potentially malicious or unapproved websites.',
                'implementation_guidance' => 'Deploy a web proxy with URL categorisation. Define and enforce URL filtering policies. Review filtering effectiveness regularly. Allow exceptions through an approval process.'],

            ['control_id' => 'CIS-9.4', 'category' => 'Email and Web Browser Protections',
                'title' => 'Restrict Unnecessary or Unauthorized Browser and Email Client Extensions',
                'description' => 'Restrict, either through uninstalling or disabling, any unauthorized or unnecessary browser or email client plugins, extensions, and add-on applications.',
                'implementation_guidance' => 'Define an approved list of browser extensions. Block installation of unlisted extensions via policy. Remove unauthorised extensions through endpoint management. Review the approved list quarterly.'],

            // ─── CIS CONTROL 10: MALWARE DEFENSES ────────────────────────────────
            ['control_id' => 'CIS-10.1', 'category' => 'Malware Defenses',
                'title' => 'Deploy and Maintain Anti-Malware Software',
                'description' => 'Deploy and maintain anti-malware software on all enterprise assets.',
                'implementation_guidance' => 'Deploy EDR or antivirus on all endpoints and servers. Configure real-time protection. Ensure automatic signature updates. Monitor deployment coverage and alert on gaps.'],

            ['control_id' => 'CIS-10.2', 'category' => 'Malware Defenses',
                'title' => 'Configure Automatic Anti-Malware Signature Updates',
                'description' => 'Configure automatic updates for anti-malware signature files on all enterprise assets.',
                'implementation_guidance' => 'Configure endpoints to update signatures at least daily. Monitor update status centrally. Alert on outdated signatures. Ensure update mechanisms work behind proxies and firewalls.'],

            ['control_id' => 'CIS-10.3', 'category' => 'Malware Defenses',
                'title' => 'Disable Autorun and Autoplay for Removable Media',
                'description' => 'Disable autorun and autoplay auto-execute functionality for removable media.',
                'implementation_guidance' => 'Configure Group Policy to disable AutoRun on all systems. Restrict removable media via endpoint policy. Test that AutoRun is effectively disabled after configuration.'],

            ['control_id' => 'CIS-10.5', 'category' => 'Malware Defenses',
                'title' => 'Enable Anti-Exploitation Features',
                'description' => 'Enable anti-exploitation features on enterprise assets and software, where possible, such as Microsoft\'s Enhanced Mitigation Experience Toolkit (EMET) or Windows Defender Exploit Guard.',
                'implementation_guidance' => 'Enable Windows Defender Exploit Guard or equivalent on all endpoints. Configure DEP, ASLR, and CFG. Monitor for exploit attempts. Review anti-exploitation configurations quarterly.'],

            // ─── CIS CONTROL 11: DATA RECOVERY ────────────────────────────────────
            ['control_id' => 'CIS-11.1', 'category' => 'Data Recovery',
                'title' => 'Establish and Maintain a Data Recovery Process',
                'description' => 'Establish and maintain a data recovery process. In the process, address the scope of data recovery activities, recovery prioritization, and the security of backup data.',
                'implementation_guidance' => 'Define data recovery procedures for all critical data. Prioritise recovery based on business criticality. Document the recovery process and test it at least annually.'],

            ['control_id' => 'CIS-11.2', 'category' => 'Data Recovery',
                'title' => 'Perform Automated Backups',
                'description' => 'Perform automated backups of in-scope enterprise assets. Run backups weekly, or more frequently, based on the sensitivity of the data.',
                'implementation_guidance' => 'Automate backups for all critical systems. Back up daily for sensitive data and systems. Monitor backup completion and alert on failures. Use backup monitoring dashboards.'],

            ['control_id' => 'CIS-11.3', 'category' => 'Data Recovery',
                'title' => 'Protect Recovery Data',
                'description' => 'Protect recovery data with equivalent controls as the original data. Reference encryption or data separation, based on requirements.',
                'implementation_guidance' => 'Encrypt backup data with equivalent strength to production. Store backup encryption keys separately. Restrict access to backup repositories. Test restoration of encrypted backups regularly.'],

            ['control_id' => 'CIS-11.4', 'category' => 'Data Recovery',
                'title' => 'Establish and Maintain an Isolated Instance of Recovery Data',
                'description' => 'Establish and maintain an isolated instance of recovery data. Example implementations include version controlling backup destinations through offline, cloud, or off-site systems or services.',
                'implementation_guidance' => 'Maintain at least one offline or geographically separate backup copy. Protect backups from ransomware by isolating them from production networks. Test restoration from isolated backup copies quarterly.'],

            ['control_id' => 'CIS-11.5', 'category' => 'Data Recovery',
                'title' => 'Test Data Recovery',
                'description' => 'Test backup recovery quarterly, or more frequently, for a sampling of in-scope enterprise assets.',
                'implementation_guidance' => 'Conduct quarterly restore tests for a sample of critical systems. Document test results. Track and remediate any issues discovered. Escalate failures to management.'],

            // ─── CIS CONTROL 12: NETWORK INFRASTRUCTURE MANAGEMENT ───────────────
            ['control_id' => 'CIS-12.1', 'category' => 'Network Infrastructure Management',
                'title' => 'Ensure Network Infrastructure is Up-to-Date',
                'description' => 'Ensure network infrastructure is kept up-to-date. Example implementations include running the latest stable release of patches and updates on routers, firewalls, switches and other network infrastructure.',
                'implementation_guidance' => 'Apply patches to network devices promptly upon release. Track device firmware versions. Schedule maintenance windows for network patching. Test patches in lab environment before production deployment.'],

            ['control_id' => 'CIS-12.2', 'category' => 'Network Infrastructure Management',
                'title' => 'Establish and Maintain a Secure Network Architecture',
                'description' => 'Establish and maintain a secure network architecture. A secure network architecture must address segmentation, least privilege, and availability, at a minimum.',
                'implementation_guidance' => 'Implement network segmentation with firewalls and VLANs. Apply default-deny between segments. Document the network architecture. Review architecture annually and after significant changes.'],

            ['control_id' => 'CIS-12.3', 'category' => 'Network Infrastructure Management',
                'title' => 'Securely Manage Network Infrastructure',
                'description' => 'Securely manage network infrastructure. Example implementations include version-controlled infrastructure as code, and the use of secure network protocols, such as SSH and HTTPS.',
                'implementation_guidance' => 'Manage network devices through encrypted protocols only (SSH, HTTPS). Disable Telnet and HTTP management. Use out-of-band management networks for critical infrastructure. Implement network device configuration management.'],

            ['control_id' => 'CIS-12.4', 'category' => 'Network Infrastructure Management',
                'title' => 'Establish and Maintain Architecture Diagram(s)',
                'description' => 'Establish and maintain architecture diagram(s) and/or other network system documentation.',
                'implementation_guidance' => 'Create and maintain up-to-date network architecture diagrams. Include all zones, segments, and trust boundaries. Review and update diagrams after any significant network changes.'],

            // ─── CIS CONTROL 13: NETWORK MONITORING AND DEFENSE ──────────────────
            ['control_id' => 'CIS-13.1', 'category' => 'Network Monitoring and Defense',
                'title' => 'Centralize Security Event Alerting',
                'description' => 'Centralize security event alerting across enterprise assets for log correlation and analysis. Best practice implementation requires the use of a SIEM.',
                'implementation_guidance' => 'Deploy and configure a SIEM to aggregate logs from all sources. Define correlation rules and alerting thresholds. Assign alert triage responsibilities. Review and tune SIEM rules regularly.'],

            ['control_id' => 'CIS-13.2', 'category' => 'Network Monitoring and Defense',
                'title' => 'Deploy a Host-Based Intrusion Detection Solution',
                'description' => 'Deploy a host-based intrusion detection solution on enterprise assets, where appropriate and/or supported.',
                'implementation_guidance' => 'Deploy HIDS or EDR with behavioural detection on servers and endpoints. Configure alerts for suspicious behaviour. Integrate HIDS alerts with the SIEM. Review detection coverage regularly.'],

            ['control_id' => 'CIS-13.3', 'category' => 'Network Monitoring and Defense',
                'title' => 'Deploy a Network Intrusion Detection Solution',
                'description' => 'Deploy a network intrusion detection solution on enterprise assets, where appropriate.',
                'implementation_guidance' => 'Deploy IDS/IPS at network boundaries and key internal segments. Define detection rules aligned with threat intelligence. Review and update signatures regularly. Integrate IDS alerts with the SIEM.'],

            ['control_id' => 'CIS-13.4', 'category' => 'Network Monitoring and Defense',
                'title' => 'Perform Traffic Filtering Between Network Segments',
                'description' => 'Perform traffic filtering between network segments, where appropriate.',
                'implementation_guidance' => 'Implement firewall rules between all network segments. Apply default-deny at segment boundaries. Review and validate firewall rules quarterly. Log and alert on denied traffic.'],

            ['control_id' => 'CIS-13.5', 'category' => 'Network Monitoring and Defense',
                'title' => 'Manage Access Control for Remote Assets',
                'description' => 'Manage access control for assets remotely connecting to enterprise resources. Determine amount of access to enterprise resources based on up-to-date inventory, configuration of endpoint security, and enterprise infrastructure authorization.',
                'implementation_guidance' => 'Implement network access control (NAC) for remote connections. Verify device health before granting access. Quarantine non-compliant devices. Log and monitor all remote access sessions.'],

            // ─── CIS CONTROL 14: SECURITY AWARENESS TRAINING ─────────────────────
            ['control_id' => 'CIS-14.1', 'category' => 'Security Awareness and Skills Training',
                'title' => 'Establish and Maintain a Security Awareness Program',
                'description' => 'Establish and maintain a security awareness program to influence behavior among the workforce to be security conscious and properly skilled to reduce cybersecurity risks to the enterprise.',
                'implementation_guidance' => 'Define a security awareness programme with objectives, audience, and delivery methods. Obtain senior management endorsement. Review and update programme content annually.'],

            ['control_id' => 'CIS-14.2', 'category' => 'Security Awareness and Skills Training',
                'title' => 'Train Workforce Members to Recognize Social Engineering Attacks',
                'description' => 'Train workforce members to recognize social engineering attacks, such as phishing, pre-texting, and tailgating.',
                'implementation_guidance' => 'Include social engineering awareness in annual security training. Conduct simulated phishing campaigns. Measure click rates and provide immediate training feedback. Track improvement over time.'],

            ['control_id' => 'CIS-14.3', 'category' => 'Security Awareness and Skills Training',
                'title' => 'Train Workforce Members on Authentication Best Practices',
                'description' => 'Train workforce members on authentication best practices. Example topics include MFA, password composition, and credential management.',
                'implementation_guidance' => 'Deliver training covering password hygiene, MFA usage, and phishing resistance. Include in annual security awareness training and onboarding. Test comprehension through assessments.'],

            ['control_id' => 'CIS-14.5', 'category' => 'Security Awareness and Skills Training',
                'title' => 'Train Workforce on Causes of Unintentional Data Exposure',
                'description' => 'Train workforce members to be aware of causes for unintentional data exposure.',
                'implementation_guidance' => 'Include data handling and classification in security awareness training. Cover risks of email misdirection, improper disposal, and cloud storage misuse. Provide practical examples and case studies.'],

            // ─── CIS CONTROL 15: SERVICE PROVIDER MANAGEMENT ─────────────────────
            ['control_id' => 'CIS-15.1', 'category' => 'Service Provider Management',
                'title' => 'Establish and Maintain an Inventory of Service Providers',
                'description' => 'Establish and maintain an inventory of service providers. The inventory is to list all known service providers including classification and contact information.',
                'implementation_guidance' => 'Maintain a register of all service providers with contact, services provided, and risk classification. Review and update the inventory annually. Include cloud and SaaS providers.'],

            ['control_id' => 'CIS-15.2', 'category' => 'Service Provider Management',
                'title' => 'Establish and Maintain a Service Provider Management Policy',
                'description' => 'Establish and maintain a service provider management policy.',
                'implementation_guidance' => 'Define a third-party risk management policy covering due diligence, contract requirements, and ongoing monitoring. Obtain management approval. Review and update annually.'],

            ['control_id' => 'CIS-15.3', 'category' => 'Service Provider Management',
                'title' => 'Classify Service Providers',
                'description' => 'Classify service providers. Classification consideration may include one or more characteristics such as data sensitivity, data volume, availability requirements, applicable regulations, inherent risk, and mitigated risk.',
                'implementation_guidance' => 'Classify service providers by risk tier based on data sensitivity and access level. Apply more rigorous controls to higher-risk providers. Document classification rationale. Review classifications annually.'],

            // ─── CIS CONTROL 16: APPLICATION SOFTWARE SECURITY ───────────────────
            ['control_id' => 'CIS-16.1', 'category' => 'Application Software Security',
                'title' => 'Establish and Maintain a Secure Application Development Process',
                'description' => 'Establish and maintain a secure application development process. In the process, address such items as design, development, deployment, and maintenance of in-house developed and third-party administered software.',
                'implementation_guidance' => 'Implement a Secure SDLC. Include security requirements, design review, code review, and security testing at each phase. Document the process and train developers.'],

            ['control_id' => 'CIS-16.2', 'category' => 'Application Software Security',
                'title' => 'Establish and Maintain a Process to Accept and Address Software Vulnerabilities',
                'description' => 'Establish and maintain a process to accept and address reports of software vulnerabilities, including providing a means for external entities to report.',
                'implementation_guidance' => 'Implement a vulnerability disclosure policy. Provide a security contact for external reports. Define SLAs for reviewing and addressing reported vulnerabilities. Acknowledge all valid reports.'],

            ['control_id' => 'CIS-16.3', 'category' => 'Application Software Security',
                'title' => 'Perform Root Cause Analysis on Security Vulnerabilities',
                'description' => 'Perform root cause analysis on security vulnerabilities. When reviewing vulnerabilities, root cause analysis is the task of evaluating underlying issues that create vulnerabilities in code and allows development teams to move beyond just fixing individual vulnerabilities to fixing the class of vulnerability.',
                'implementation_guidance' => 'Conduct root cause analysis for significant vulnerabilities. Identify systemic issues in development processes. Implement corrective actions to prevent recurrence. Share lessons learned with development teams.'],

            ['control_id' => 'CIS-16.4', 'category' => 'Application Software Security',
                'title' => 'Establish and Manage an Inventory of Third-Party Software Components',
                'description' => 'Establish and manage an inventory of third-party software components utilized in development, often referred to as a "bill of materials," as well as components in production.',
                'implementation_guidance' => 'Generate a software bill of materials (SBOM) for all applications. Track third-party library versions and known vulnerabilities. Update dependencies promptly when vulnerabilities are published.'],

            // ─── CIS CONTROL 17: INCIDENT RESPONSE MANAGEMENT ────────────────────
            ['control_id' => 'CIS-17.1', 'category' => 'Incident Response Management',
                'title' => 'Designate Personnel to Manage Incident Handling',
                'description' => 'Designate one key person, and at least one backup, who will manage the enterprise\'s incident handling process.',
                'implementation_guidance' => 'Designate an Incident Response Manager and at least one backup. Define roles and responsibilities. Ensure designated personnel are trained and available. Review designations annually.'],

            ['control_id' => 'CIS-17.2', 'category' => 'Incident Response Management',
                'title' => 'Establish and Maintain Contact Information for Reporting Security Incidents',
                'description' => 'Establish and maintain contact information for parties that need to be informed of security incidents.',
                'implementation_guidance' => 'Maintain a contact list including internal teams, regulators, and law enforcement. Update the list when contacts change. Test contact information during exercises. Include escalation paths.'],

            ['control_id' => 'CIS-17.3', 'category' => 'Incident Response Management',
                'title' => 'Establish and Maintain an Enterprise Process for Reporting Incidents',
                'description' => 'Establish and maintain an enterprise process for the workforce to report security incidents. The process includes reporting timeframe, personnel to report to, mechanism for reporting, and the minimum information to be reported.',
                'implementation_guidance' => 'Define and publish the incident reporting process. Provide an easy-to-use reporting channel. Train all staff on reporting requirements. Acknowledge all incident reports promptly.'],

            ['control_id' => 'CIS-17.4', 'category' => 'Incident Response Management',
                'title' => 'Establish and Maintain an Incident Response Process',
                'description' => 'Establish and maintain an incident response process that addresses roles and responsibilities, compliance requirements, and a communication plan.',
                'implementation_guidance' => 'Develop a comprehensive IRP. Cover all phases: preparation, detection, containment, eradication, recovery, and lessons learned. Define escalation paths. Review and update annually.'],

            ['control_id' => 'CIS-17.5', 'category' => 'Incident Response Management',
                'title' => 'Assign Key Roles and Responsibilities',
                'description' => 'Assign key roles and responsibilities for incident response, including staff from legal, IT, information security, facilities, public relations, human resources, incident responders, and analysts.',
                'implementation_guidance' => 'Define all incident response roles. Assign named individuals to each role. Ensure backups are designated. Train all role holders on their responsibilities.'],

            ['control_id' => 'CIS-17.6', 'category' => 'Incident Response Management',
                'title' => 'Define Mechanisms for Communicating During Incident Response',
                'description' => 'Determine which primary and secondary mechanisms will be used to communicate and report during a security incident.',
                'implementation_guidance' => 'Define out-of-band communication channels for use during incidents. Establish backup communication methods in case primary channels are compromised. Test communication mechanisms during exercises.'],

            ['control_id' => 'CIS-17.7', 'category' => 'Incident Response Management',
                'title' => 'Conduct Routine Incident Response Exercises',
                'description' => 'Plan and conduct routine incident response exercises and scenarios for the workforce involved in the incident response to maintain awareness and comfort in responding to real-world threats.',
                'implementation_guidance' => 'Conduct tabletop exercises at least annually. Test technical response capabilities. Include management stakeholders in exercises. Document findings and update the IRP based on results.'],

            // ─── CIS CONTROL 18: PENETRATION TESTING ──────────────────────────────
            ['control_id' => 'CIS-18.1', 'category' => 'Penetration Testing',
                'title' => 'Establish and Maintain a Penetration Testing Program',
                'description' => 'Establish and maintain a penetration testing program appropriate to the size, complexity, and maturity of the enterprise.',
                'implementation_guidance' => 'Define a penetration testing programme with scope, frequency, and methodology. Include internal and external testing. Document the programme and obtain management approval.'],

            ['control_id' => 'CIS-18.2', 'category' => 'Penetration Testing',
                'title' => 'Perform Periodic External Penetration Tests',
                'description' => 'Perform periodic external penetration tests based on program requirements, no less than annually.',
                'implementation_guidance' => 'Conduct external penetration tests at least annually. Use qualified internal or external testers. Define clear scope and rules of engagement. Document findings and track remediation to closure.'],

            ['control_id' => 'CIS-18.3', 'category' => 'Penetration Testing',
                'title' => 'Remediate Penetration Test Findings',
                'description' => 'Remediate penetration test findings based on the enterprise\'s policy for remediation scope and prioritization.',
                'implementation_guidance' => 'Assign ownership to all penetration test findings. Define remediation timelines by severity. Track remediation progress. Conduct validation testing to confirm findings are resolved.'],

            ['control_id' => 'CIS-18.5', 'category' => 'Penetration Testing',
                'title' => 'Perform Periodic Internal Penetration Tests',
                'description' => 'Perform periodic internal penetration tests based on program requirements, no less than annually.',
                'implementation_guidance' => 'Conduct internal penetration tests at least annually. Test from an assumed-breach perspective. Include lateral movement and privilege escalation scenarios. Document and remediate all findings.'],
        ];

        $rows = array_map(function ($c) use ($framework) {
            return array_merge($c, [
                'framework_id' => $framework->id,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }, $controls);

        foreach (array_chunk($rows, 20) as $chunk) {
            DB::table('controls')->insert($chunk);
        }

        $this->command->info('CIS Controls v8 — '.count($rows).' controls seeded successfully.');
    }
}
