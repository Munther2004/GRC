<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NIST80053ControlsSeeder extends Seeder
{
    public function run(): void
    {
        $framework = DB::table('frameworks')->where('short_name', 'NIST800-53')->first();
        if (!$framework) {
            $this->command->error('NIST800-53 framework not found. Run FrameworkSeeder first.');
            return;
        }

        DB::table('controls')->where('framework_id', $framework->id)->delete();

        $controls = [

            // ─── AC: ACCESS CONTROL ──────────────────────────────────────────────
            ['control_id'=>'AC-1',  'category'=>'Access Control',
             'title'=>'Access Control Policy and Procedures',
             'description'=>'Develop, document, and disseminate an access control policy and procedures to facilitate the implementation of the access control controls.',
             'implementation_guidance'=>'Create a formal access control policy approved by senior management. Define procedures covering account management, least privilege, and access reviews. Review and update annually.'],

            ['control_id'=>'AC-2',  'category'=>'Access Control',
             'title'=>'Account Management',
             'description'=>'Manage system accounts including establishing, activating, modifying, reviewing, disabling, and removing accounts.',
             'implementation_guidance'=>'Implement a formal account lifecycle process. Review all accounts quarterly. Disable accounts within 24 hours of departure. Document account types and their justifications.'],

            ['control_id'=>'AC-3',  'category'=>'Access Control',
             'title'=>'Access Enforcement',
             'description'=>'Enforce approved authorisations for logical access to the system in accordance with applicable access control policies.',
             'implementation_guidance'=>'Implement role-based or attribute-based access control. Use access control lists and permissions enforced at the OS, database, and application layer. Validate controls through periodic access reviews.'],

            ['control_id'=>'AC-4',  'category'=>'Access Control',
             'title'=>'Information Flow Enforcement',
             'description'=>'Enforce approved authorisations for controlling the flow of information within the system and between connected systems.',
             'implementation_guidance'=>'Define and enforce information flow policies using firewalls, data diodes, and application-level gateways. Prevent unauthorised cross-domain data flows. Document allowed information flows in a data flow diagram.'],

            ['control_id'=>'AC-5',  'category'=>'Access Control',
             'title'=>'Separation of Duties',
             'description'=>'Separate duties of individuals as necessary to prevent malevolent activity; document separation of duties.',
             'implementation_guidance'=>'Identify critical functions requiring separation. Implement system controls preventing one user from completing a sensitive transaction alone. Periodically audit role assignments for conflicts.'],

            ['control_id'=>'AC-6',  'category'=>'Access Control',
             'title'=>'Least Privilege',
             'description'=>'Employ the principle of least privilege, allowing only authorised accesses for users which are necessary to accomplish assigned tasks.',
             'implementation_guidance'=>'Assign minimum permissions required for each role. Use separate accounts for administrative and standard tasks. Review and right-size permissions during periodic access reviews.'],

            ['control_id'=>'AC-7',  'category'=>'Access Control',
             'title'=>'Unsuccessful Logon Attempts',
             'description'=>'Enforce a limit on consecutive invalid access attempts and automatically lock the account after the limit is exceeded.',
             'implementation_guidance'=>'Configure systems to lock accounts after 5–10 failed attempts. Implement CAPTCHA or delays after repeated failures. Alert on brute-force patterns. Require manual unlock or timed automatic reset.'],

            ['control_id'=>'AC-8',  'category'=>'Access Control',
             'title'=>'System Use Notification',
             'description'=>'Display a system use notification message before granting access, informing users of monitoring and consent to use.',
             'implementation_guidance'=>'Display a warning banner at login stating the system is for authorised use only and that activity is monitored. Require user acknowledgement before proceeding. Include legal and privacy notice text.'],

            ['control_id'=>'AC-11', 'category'=>'Access Control',
             'title'=>'Device Lock',
             'description'=>'Prevent further access after a period of inactivity by initiating a session lock.',
             'implementation_guidance'=>'Configure workstations and mobile devices to lock after 15 minutes of inactivity. Require authentication to resume. Apply to both local and remote sessions.'],

            ['control_id'=>'AC-14', 'category'=>'Access Control',
             'title'=>'Permitted Actions Without Identification or Authentication',
             'description'=>'Identify and document user actions that can be performed without identification or authentication.',
             'implementation_guidance'=>'Minimise unauthenticated access to the absolute minimum. Document any permitted unauthenticated functions and justify them. Review and re-evaluate at least annually.'],

            ['control_id'=>'AC-17', 'category'=>'Access Control',
             'title'=>'Remote Access',
             'description'=>'Establish and document usage restrictions, configuration requirements, and implementation guidance for remote access.',
             'implementation_guidance'=>'Require VPN with MFA for all remote access. Log and monitor all remote sessions. Define acceptable use requirements for remote workers. Review remote access logs weekly.'],

            ['control_id'=>'AC-18', 'category'=>'Access Control',
             'title'=>'Wireless Access',
             'description'=>'Establish configuration requirements, connection requirements, and implementation guidance for wireless access.',
             'implementation_guidance'=>'Use WPA3 or WPA2-Enterprise for wireless networks. Segregate wireless networks from sensitive internal networks. Disable SSID broadcasting on secure networks. Monitor for rogue access points.'],

            ['control_id'=>'AC-19', 'category'=>'Access Control',
             'title'=>'Access Control for Mobile Devices',
             'description'=>'Establish configuration requirements, connection requirements, and implementation guidance for mobile devices.',
             'implementation_guidance'=>'Enrol all company mobile devices in MDM. Enforce device encryption, PIN, and remote wipe capability. Restrict installation of unapproved applications. Define BYOD policies with clear security requirements.'],

            ['control_id'=>'AC-20', 'category'=>'Access Control',
             'title'=>'Use of External Systems',
             'description'=>'Establish terms and conditions for authorised individuals using external systems to access the system.',
             'implementation_guidance'=>'Define policies for use of external systems (personal devices, public cloud). Require MFA when accessing corporate systems from external devices. Restrict sensitive data processing on non-managed devices.'],

            // ─── AT: AWARENESS AND TRAINING ─────────────────────────────────────
            ['control_id'=>'AT-1',  'category'=>'Awareness and Training',
             'title'=>'Awareness and Training Policy and Procedures',
             'description'=>'Develop, document, and disseminate a security awareness and training policy and associated procedures.',
             'implementation_guidance'=>'Create a security awareness and training policy. Define training requirements by role. Review and update the policy annually. Obtain management approval.'],

            ['control_id'=>'AT-2',  'category'=>'Awareness and Training',
             'title'=>'Literacy Training and Awareness',
             'description'=>'Provide basic security awareness training to system users as part of initial training for new users and when required by system changes.',
             'implementation_guidance'=>'Deliver security awareness training at onboarding and at least annually. Cover phishing, password hygiene, and data handling. Track completion rates. Include simulated phishing exercises.'],

            ['control_id'=>'AT-3',  'category'=>'Awareness and Training',
             'title'=>'Role-Based Training',
             'description'=>'Provide role-based security training to personnel with assigned security roles and responsibilities.',
             'implementation_guidance'=>'Identify roles with elevated security responsibilities. Deliver tailored training for administrators, developers, and incident responders. Document training completion and re-train when role requirements change.'],

            ['control_id'=>'AT-4',  'category'=>'Awareness and Training',
             'title'=>'Training Records',
             'description'=>'Document and monitor security and privacy training activities.',
             'implementation_guidance'=>'Maintain training completion records for all personnel. Retain records for the duration of employment plus three years. Provide training reports to management quarterly.'],

            // ─── AU: AUDIT AND ACCOUNTABILITY ────────────────────────────────────
            ['control_id'=>'AU-1',  'category'=>'Audit and Accountability',
             'title'=>'Audit and Accountability Policy and Procedures',
             'description'=>'Develop, document, and disseminate an audit and accountability policy and associated procedures.',
             'implementation_guidance'=>'Define what events must be audited, retention periods, and responsibilities for log review. Obtain management approval. Review annually.'],

            ['control_id'=>'AU-2',  'category'=>'Audit and Accountability',
             'title'=>'Event Logging',
             'description'=>'Identify the types of events that the system is capable of logging in support of the audit function.',
             'implementation_guidance'=>'Define a comprehensive list of auditable events including authentication, privilege use, account changes, and data access. Enable logging on all in-scope systems. Review the event list annually.'],

            ['control_id'=>'AU-3',  'category'=>'Audit and Accountability',
             'title'=>'Content of Audit Records',
             'description'=>'Ensure that audit records contain sufficient information to establish what events occurred, the source, and the outcome.',
             'implementation_guidance'=>'Ensure logs include: timestamp, user identity, source IP, event type, resource accessed, and outcome. Validate log completeness periodically. Standardise log formats using common schemas (e.g., CEF, JSON).'],

            ['control_id'=>'AU-4',  'category'=>'Audit and Accountability',
             'title'=>'Audit Log Storage Capacity',
             'description'=>'Allocate audit log storage capacity to accommodate audit log retention requirements.',
             'implementation_guidance'=>'Calculate expected log volume and plan storage accordingly. Implement automated alerts when storage thresholds are reached. Archive logs to cold storage before deletion. Never overwrite logs without archiving.'],

            ['control_id'=>'AU-5',  'category'=>'Audit and Accountability',
             'title'=>'Response to Audit Logging Process Failures',
             'description'=>'Alert personnel and take actions in the event of audit logging process failures.',
             'implementation_guidance'=>'Configure alerts for logging failures, including stopped log services or storage exhaustion. Define a response procedure. Ensure critical systems continue to function safely even when logging fails.'],

            ['control_id'=>'AU-6',  'category'=>'Audit and Accountability',
             'title'=>'Audit Record Review, Analysis, and Reporting',
             'description'=>'Review and analyse system audit records for indications of inappropriate or unusual activity and report findings.',
             'implementation_guidance'=>'Conduct regular log reviews using SIEM rules. Investigate and document anomalous events. Report security-significant findings to management. Automate detection of common attack patterns.'],

            ['control_id'=>'AU-7',  'category'=>'Audit and Accountability',
             'title'=>'Audit Record Reduction and Report Generation',
             'description'=>'Provide an audit record reduction and report generation capability that does not alter the original content or time ordering of audit records.',
             'implementation_guidance'=>'Use a SIEM to aggregate, filter, and report on log data. Ensure original logs are preserved and protected. Provide pre-built reports for common compliance and security use cases.'],

            ['control_id'=>'AU-8',  'category'=>'Audit and Accountability',
             'title'=>'Time Stamps',
             'description'=>'Use internal system clocks to generate time stamps for audit records and ensure that time stamps are mapped to UTC or offsets from UTC.',
             'implementation_guidance'=>'Synchronise all system clocks using NTP. Use UTC timestamps in all log records. Validate timestamp accuracy during audits. Alert on significant clock drift.'],

            ['control_id'=>'AU-9',  'category'=>'Audit and Accountability',
             'title'=>'Protection of Audit Information',
             'description'=>'Protect audit information and audit tools from unauthorised access, modification, and deletion.',
             'implementation_guidance'=>'Restrict write access to log files to authorised log services only. Store logs in a dedicated, access-controlled SIEM. Implement integrity monitoring on log files. Use separate credentials for log management.'],

            ['control_id'=>'AU-11', 'category'=>'Audit and Accountability',
             'title'=>'Audit Record Retention',
             'description'=>'Retain audit records for a defined period to provide support for after-the-fact investigations of security incidents.',
             'implementation_guidance'=>'Define retention periods based on regulatory requirements (typically 12 months hot, 24 months archived). Implement automated archiving. Ensure retained logs remain readable and searchable throughout the retention period.'],

            ['control_id'=>'AU-12', 'category'=>'Audit and Accountability',
             'title'=>'Audit Record Generation',
             'description'=>'Provide audit record generation capability for the list of events and generate audit records for those events.',
             'implementation_guidance'=>'Enable audit record generation on all systems in scope. Validate that all defined auditable events are being captured. Review and confirm audit coverage after system changes.'],

            // ─── CA: ASSESSMENT, AUTHORISATION, AND MONITORING ──────────────────
            ['control_id'=>'CA-1',  'category'=>'Assessment, Authorisation, and Monitoring',
             'title'=>'Policy and Procedures',
             'description'=>'Develop, document, and disseminate an assessment, authorisation, and monitoring policy and procedures.',
             'implementation_guidance'=>'Define an authorisation policy covering system approval, periodic assessments, and continuous monitoring. Assign responsibilities. Review and update annually.'],

            ['control_id'=>'CA-2',  'category'=>'Assessment, Authorisation, and Monitoring',
             'title'=>'Control Assessments',
             'description'=>'Select the appropriate assessor or assessment team and assess the controls in the system and its environment of operation.',
             'implementation_guidance'=>'Conduct annual control assessments using qualified assessors. Document assessment scope, methodology, findings, and recommendations. Track remediation of findings to closure.'],

            ['control_id'=>'CA-3',  'category'=>'Assessment, Authorisation, and Monitoring',
             'title'=>'Information Exchange',
             'description'=>'Approve and manage the exchange of information between the system and other systems using connection agreements.',
             'implementation_guidance'=>'Document all system interconnections with ISAs or MOUs. Review interconnection agreements annually. Authorise all new connections before they are established.'],

            ['control_id'=>'CA-5',  'category'=>'Assessment, Authorisation, and Monitoring',
             'title'=>'Plan of Action and Milestones',
             'description'=>'Develop a plan of action and milestones for the system to document planned remediation actions for weaknesses or deficiencies noted during assessments.',
             'implementation_guidance'=>'Maintain a POA&M for all identified control weaknesses. Assign owners and due dates. Review POA&M status monthly. Escalate overdue items to management.'],

            ['control_id'=>'CA-6',  'category'=>'Assessment, Authorisation, and Monitoring',
             'title'=>'Authorisation',
             'description'=>'Assign a senior official as the authorising official, ensure the official authorises the system for operation, and update the authorisation as required.',
             'implementation_guidance'=>'Designate an authorising official for each system. Conduct formal authorisation reviews before initial operation and every three years. Document the authorisation decision and conditions.'],

            ['control_id'=>'CA-7',  'category'=>'Assessment, Authorisation, and Monitoring',
             'title'=>'Continuous Monitoring',
             'description'=>'Develop a continuous monitoring strategy and implement continuous monitoring programme.',
             'implementation_guidance'=>'Define a continuous monitoring strategy covering vulnerability scanning, log review, and configuration checks. Automate monitoring where possible. Report monitoring results to authorising officials regularly.'],

            // ─── CM: CONFIGURATION MANAGEMENT ───────────────────────────────────
            ['control_id'=>'CM-1',  'category'=>'Configuration Management',
             'title'=>'Configuration Management Policy and Procedures',
             'description'=>'Develop, document, and disseminate a configuration management policy and associated procedures.',
             'implementation_guidance'=>'Define configuration management policies covering baseline definition, change control, and configuration audits. Assign CM ownership. Review and update annually.'],

            ['control_id'=>'CM-2',  'category'=>'Configuration Management',
             'title'=>'Baseline Configuration',
             'description'=>'Develop, document, and maintain a current baseline configuration of the system.',
             'implementation_guidance'=>'Define and document security baseline configurations for all system components. Store baselines in a controlled configuration management system. Update baselines when changes are approved and implemented.'],

            ['control_id'=>'CM-3',  'category'=>'Configuration Management',
             'title'=>'Configuration Change Control',
             'description'=>'Determine types of changes that are configuration-controlled; review proposed configuration-controlled changes with security impact analysis.',
             'implementation_guidance'=>'Implement a formal change control board. Require security impact analysis for all significant changes. Document all changes and obtain approvals before implementation. Test changes in a non-production environment first.'],

            ['control_id'=>'CM-4',  'category'=>'Configuration Management',
             'title'=>'Impact Analyses',
             'description'=>'Analyse changes to the system to determine potential security and privacy impacts prior to change implementation.',
             'implementation_guidance'=>'Conduct security impact analysis for all configuration changes. Involve security team in change review. Document analysis outcomes and include in change request records.'],

            ['control_id'=>'CM-5',  'category'=>'Configuration Management',
             'title'=>'Access Restrictions for Change',
             'description'=>'Define, document, approve, and enforce physical and logical access restrictions associated with changes to the system.',
             'implementation_guidance'=>'Restrict ability to make configuration changes to authorised change implementers. Use separate production credentials. Implement multi-party approval for high-risk changes.'],

            ['control_id'=>'CM-6',  'category'=>'Configuration Management',
             'title'=>'Configuration Settings',
             'description'=>'Establish and document configuration settings for technology products employed within the system that reflect the most restrictive mode.',
             'implementation_guidance'=>'Apply CIS Benchmarks or DISA STIGs as configuration baselines. Automate compliance checks using configuration management tools. Detect and remediate configuration drift promptly.'],

            ['control_id'=>'CM-7',  'category'=>'Configuration Management',
             'title'=>'Least Functionality',
             'description'=>'Configure the system to provide only essential capabilities, prohibiting or restricting the use of functions, ports, protocols, and services.',
             'implementation_guidance'=>'Disable all unused services, ports, and protocols. Remove unnecessary software. Document and justify all enabled services. Review and revalidate necessity at least annually.'],

            ['control_id'=>'CM-8',  'category'=>'Configuration Management',
             'title'=>'System Component Inventory',
             'description'=>'Develop and document an inventory of system components and review and update the inventory.',
             'implementation_guidance'=>'Maintain an up-to-date inventory of all hardware and software components. Include version information, location, owner, and security status. Automate discovery where possible. Review inventory monthly.'],

            ['control_id'=>'CM-10', 'category'=>'Configuration Management',
             'title'=>'Software Usage Restrictions',
             'description'=>'Use software and associated documentation in accordance with contract agreements and copyright laws.',
             'implementation_guidance'=>'Conduct periodic software licence audits. Remove unlicensed software promptly. Maintain a register of approved software. Restrict ability to install unapproved software.'],

            ['control_id'=>'CM-11', 'category'=>'Configuration Management',
             'title'=>'User-Installed Software',
             'description'=>'Establish policies governing the installation of software by users and enforce those policies.',
             'implementation_guidance'=>'Define and communicate an acceptable software installation policy. Use technical controls (application whitelisting, admin rights removal) to enforce the policy. Monitor for policy violations.'],

            // ─── CP: CONTINGENCY PLANNING ────────────────────────────────────────
            ['control_id'=>'CP-1',  'category'=>'Contingency Planning',
             'title'=>'Contingency Planning Policy and Procedures',
             'description'=>'Develop, document, and disseminate a contingency planning policy and associated procedures.',
             'implementation_guidance'=>'Define contingency planning policy covering BIA, BCP, and DRP. Assign ownership. Review and update annually. Obtain executive approval.'],

            ['control_id'=>'CP-2',  'category'=>'Contingency Planning',
             'title'=>'Contingency Plan',
             'description'=>'Develop a contingency plan for the system; distribute copies to key personnel; coordinate plan development with entities conducting related activities.',
             'implementation_guidance'=>'Develop a comprehensive contingency plan addressing all critical system scenarios. Define RTOs and RPOs. Review and update the plan annually or after significant changes. Train all staff with contingency roles.'],

            ['control_id'=>'CP-3',  'category'=>'Contingency Planning',
             'title'=>'Contingency Training',
             'description'=>'Provide contingency training to system users consistent with assigned roles and responsibilities.',
             'implementation_guidance'=>'Train staff with contingency roles at least annually. Cover activation procedures, escalation paths, and recovery tasks. Document training completion.'],

            ['control_id'=>'CP-4',  'category'=>'Contingency Planning',
             'title'=>'Contingency Plan Testing',
             'description'=>'Test the contingency plan to determine plan effectiveness and organisational readiness.',
             'implementation_guidance'=>'Conduct contingency plan exercises at least annually (tabletop, functional, or full-scale tests). Document test results and update the plan based on findings. Track improvement actions to completion.'],

            ['control_id'=>'CP-6',  'category'=>'Contingency Planning',
             'title'=>'Alternate Storage Site',
             'description'=>'Establish an alternate storage site for backup storage with appropriate security safeguards.',
             'implementation_guidance'=>'Store backup copies at a geographically separate location. Apply the same security controls to the alternate site as the primary. Test restoration from alternate site backups at least annually.'],

            ['control_id'=>'CP-7',  'category'=>'Contingency Planning',
             'title'=>'Alternate Processing Site',
             'description'=>'Establish an alternate processing site with necessary agreements and safeguards.',
             'implementation_guidance'=>'Identify and contract an alternate processing site capable of supporting critical operations. Ensure the site is adequately equipped and has necessary agreements in place. Test failover to the alternate site annually.'],

            ['control_id'=>'CP-9',  'category'=>'Contingency Planning',
             'title'=>'System Backup',
             'description'=>'Conduct backups of user-level and system-level information and store backup information in a separate facility.',
             'implementation_guidance'=>'Define backup schedules meeting RPO requirements. Test restore procedures at least quarterly. Store backups encrypted at a separate location. Maintain backup logs and review them regularly.'],

            ['control_id'=>'CP-10', 'category'=>'Contingency Planning',
             'title'=>'System Recovery and Reconstitution',
             'description'=>'Provide for the recovery and reconstitution of the system to a known state after a disruption.',
             'implementation_guidance'=>'Define recovery procedures for all critical systems. Test recovery to a known-good state as part of contingency exercises. Document recovery steps and validate their effectiveness.'],

            // ─── IA: IDENTIFICATION AND AUTHENTICATION ───────────────────────────
            ['control_id'=>'IA-1',  'category'=>'Identification and Authentication',
             'title'=>'Identification and Authentication Policy and Procedures',
             'description'=>'Develop, document, and disseminate an identification and authentication policy and procedures.',
             'implementation_guidance'=>'Define an IA policy covering unique user IDs, authentication strength requirements, and credential management. Review and update annually.'],

            ['control_id'=>'IA-2',  'category'=>'Identification and Authentication',
             'title'=>'Identification and Authentication (Organisational Users)',
             'description'=>'Uniquely identify and authenticate organisational users and associate that unique identification with processes acting on behalf of those users.',
             'implementation_guidance'=>'Assign unique user IDs to all personnel. Prohibit shared accounts. Implement MFA for all access to high-impact systems. Regularly review active accounts and deactivate unused ones.'],

            ['control_id'=>'IA-3',  'category'=>'Identification and Authentication',
             'title'=>'Device Identification and Authentication',
             'description'=>'Uniquely identify and authenticate devices before establishing connections.',
             'implementation_guidance'=>'Implement device certificates or 802.1X for network access control. Maintain a register of authorised devices. Block unauthenticated devices from connecting to internal networks.'],

            ['control_id'=>'IA-4',  'category'=>'Identification and Authentication',
             'title'=>'Identifier Management',
             'description'=>'Manage system identifiers by receiving authorisation from appropriate personnel, selecting identifiers, assigning them to users and devices.',
             'implementation_guidance'=>'Follow a formal identifier provisioning process. Ensure identifiers are unique and not reused within a defined period. Disable identifiers after a period of inactivity. Document identifier assignment records.'],

            ['control_id'=>'IA-5',  'category'=>'Identification and Authentication',
             'title'=>'Authenticator Management',
             'description'=>'Manage system authenticators by verifying identity, establishing initial authenticator content, setting minimum authenticator requirements, and distributing them securely.',
             'implementation_guidance'=>'Enforce minimum password length and complexity. Implement password expiration and history policies. Use secure channels for initial credential distribution. Store passwords using strong cryptographic hashes.'],

            ['control_id'=>'IA-6',  'category'=>'Identification and Authentication',
             'title'=>'Authentication Feedback',
             'description'=>'Obscure feedback of authentication information during the authentication process.',
             'implementation_guidance'=>'Mask passwords during entry in login forms. Display generic error messages for failed login attempts (do not reveal whether username or password was incorrect). Apply to all user interfaces and APIs.'],

            ['control_id'=>'IA-7',  'category'=>'Identification and Authentication',
             'title'=>'Cryptographic Module Authentication',
             'description'=>'Implement mechanisms for authentication to a cryptographic module that meet the requirements of applicable laws, directives, and standards.',
             'implementation_guidance'=>'Use FIPS 140-2/140-3 validated cryptographic modules where required. Ensure cryptographic modules are properly authenticated before use. Document cryptographic module inventory and validation status.'],

            ['control_id'=>'IA-8',  'category'=>'Identification and Authentication',
             'title'=>'Identification and Authentication (Non-Organisational Users)',
             'description'=>'Uniquely identify and authenticate non-organisational users or processes acting on behalf of non-organisational users.',
             'implementation_guidance'=>'Apply authentication requirements to external users, partners, and automated systems. Use federated identity or guest account processes. Enforce the same MFA standards as for internal users.'],

            // ─── IR: INCIDENT RESPONSE ───────────────────────────────────────────
            ['control_id'=>'IR-1',  'category'=>'Incident Response',
             'title'=>'Incident Response Policy and Procedures',
             'description'=>'Develop, document, and disseminate an incident response policy and procedures.',
             'implementation_guidance'=>'Define an incident response policy and procedures covering detection, reporting, analysis, containment, eradication, and recovery. Review and update annually.'],

            ['control_id'=>'IR-2',  'category'=>'Incident Response',
             'title'=>'Incident Response Training',
             'description'=>'Provide incident response training to system users consistent with assigned roles and responsibilities.',
             'implementation_guidance'=>'Train all incident response team members at least annually. Conduct tabletop exercises and simulations. Include incident handling procedures in onboarding for security-relevant roles.'],

            ['control_id'=>'IR-3',  'category'=>'Incident Response',
             'title'=>'Incident Response Testing',
             'description'=>'Test the incident response capability using defined tests to determine effectiveness.',
             'implementation_guidance'=>'Conduct incident response exercises at least annually. Test communication, escalation, and technical response capabilities. Document findings and update the IRP based on lessons learned.'],

            ['control_id'=>'IR-4',  'category'=>'Incident Response',
             'title'=>'Incident Handling',
             'description'=>'Implement an incident handling capability including preparation, detection and analysis, containment, eradication, and recovery.',
             'implementation_guidance'=>'Follow a structured incident handling process. Maintain an incident log. Contain incidents promptly to limit damage. Conduct root cause analysis and implement corrective actions.'],

            ['control_id'=>'IR-5',  'category'=>'Incident Response',
             'title'=>'Incident Monitoring',
             'description'=>'Track and document system security incidents.',
             'implementation_guidance'=>'Record all security incidents in a tracking system. Categorise incidents by severity and type. Report significant incidents to management and regulators within required timeframes.'],

            ['control_id'=>'IR-6',  'category'=>'Incident Response',
             'title'=>'Incident Reporting',
             'description'=>'Require personnel to report suspected security incidents and report incident information to the appropriate authorities.',
             'implementation_guidance'=>'Establish clear reporting channels and requirements. Train all staff on when and how to report incidents. Define reporting timelines to regulators and affected parties. Document all reports made.'],

            ['control_id'=>'IR-7',  'category'=>'Incident Response',
             'title'=>'Incident Response Assistance',
             'description'=>'Provide an incident response support resource that offers advice and assistance to users.',
             'implementation_guidance'=>'Designate an internal or external incident response team available to support users. Provide contact information prominently. Establish procedures for engaging external incident response resources.'],

            ['control_id'=>'IR-8',  'category'=>'Incident Response',
             'title'=>'Incident Response Plan',
             'description'=>'Develop an incident response plan that provides guidance for implementing the incident response capability.',
             'implementation_guidance'=>'Maintain a documented IRP addressing all incident categories. Assign roles and responsibilities. Review and update the plan annually or after significant incidents.'],

            // ─── MA: MAINTENANCE ─────────────────────────────────────────────────
            ['control_id'=>'MA-1',  'category'=>'Maintenance',
             'title'=>'Maintenance Policy and Procedures',
             'description'=>'Develop, document, and disseminate a system maintenance policy and procedures.',
             'implementation_guidance'=>'Define maintenance policies covering scheduled and emergency maintenance, authorised maintenance personnel, and maintenance record-keeping. Review and update annually.'],

            ['control_id'=>'MA-2',  'category'=>'Maintenance',
             'title'=>'Controlled Maintenance',
             'description'=>'Schedule, document, and review records of maintenance and repairs on system components.',
             'implementation_guidance'=>'Maintain records of all maintenance activities including date, technician, actions taken, and components involved. Require authorisation for maintenance involving sensitive systems. Review maintenance records regularly.'],

            ['control_id'=>'MA-3',  'category'=>'Maintenance',
             'title'=>'Maintenance Tools',
             'description'=>'Approve, control, and monitor maintenance tools used on the system.',
             'implementation_guidance'=>'Maintain an approved list of maintenance tools. Scan maintenance tools for malware before use. Log use of maintenance tools in security-sensitive environments.'],

            ['control_id'=>'MA-4',  'category'=>'Maintenance',
             'title'=>'Nonlocal Maintenance',
             'description'=>'Approve, monitor, and control nonlocal maintenance and diagnostic sessions.',
             'implementation_guidance'=>'Require MFA for remote maintenance sessions. Record and monitor all remote maintenance activity. Terminate sessions upon completion. Use encrypted channels for all remote maintenance.'],

            ['control_id'=>'MA-5',  'category'=>'Maintenance',
             'title'=>'Maintenance Personnel',
             'description'=>'Establish a process for maintenance personnel authorisation and maintain a list of authorised maintenance organisations or personnel.',
             'implementation_guidance'=>'Verify identity and authorisation of maintenance personnel before granting access. Escort unauthorised maintenance personnel at all times. Conduct background checks on personnel with regular access to sensitive systems.'],

            // ─── MP: MEDIA PROTECTION ────────────────────────────────────────────
            ['control_id'=>'MP-1',  'category'=>'Media Protection',
             'title'=>'Media Protection Policy and Procedures',
             'description'=>'Develop, document, and disseminate a media protection policy and associated procedures.',
             'implementation_guidance'=>'Define policies for media handling, transport, and disposal aligned with data classification. Assign ownership and review annually.'],

            ['control_id'=>'MP-2',  'category'=>'Media Protection',
             'title'=>'Media Access',
             'description'=>'Restrict access to digital and non-digital media to authorised individuals.',
             'implementation_guidance'=>'Control access to media containing sensitive data. Lock physical media in secure storage. Implement DLP to prevent unauthorised copying to removable media.'],

            ['control_id'=>'MP-3',  'category'=>'Media Protection',
             'title'=>'Media Marking',
             'description'=>'Mark system media indicating distribution limitations and handling requirements.',
             'implementation_guidance'=>'Apply labels to all removable media indicating classification and handling requirements. Train staff on media labelling standards. Include labelling requirements in the media protection policy.'],

            ['control_id'=>'MP-4',  'category'=>'Media Protection',
             'title'=>'Media Storage',
             'description'=>'Physically control and securely store digital and non-digital media within controlled areas.',
             'implementation_guidance'=>'Store sensitive media in locked, access-controlled locations. Maintain a media inventory. Restrict access to media storage areas. Monitor access with physical access logs.'],

            ['control_id'=>'MP-5',  'category'=>'Media Protection',
             'title'=>'Media Transport',
             'description'=>'Protect system media during transport and control media containing information outside of controlled areas.',
             'implementation_guidance'=>'Encrypt all sensitive data on media before transport. Use tamper-evident packaging for physical media. Document and track media in transit. Use tracked and insured couriers for physical media shipment.'],

            ['control_id'=>'MP-6',  'category'=>'Media Protection',
             'title'=>'Media Sanitisation',
             'description'=>'Sanitise system media prior to disposal, release out of organisational control, or reuse.',
             'implementation_guidance'=>'Apply DoD or NIST 800-88 sanitisation methods based on data sensitivity. Obtain and retain certificates of destruction. Verify sanitisation was effective before re-issuing media.'],

            // ─── PE: PHYSICAL AND ENVIRONMENTAL PROTECTION ──────────────────────
            ['control_id'=>'PE-1',  'category'=>'Physical and Environmental Protection',
             'title'=>'Physical and Environmental Protection Policy and Procedures',
             'description'=>'Develop, document, and disseminate a physical and environmental protection policy and procedures.',
             'implementation_guidance'=>'Define physical security policies covering facility access, visitor management, and environmental controls. Review and update annually.'],

            ['control_id'=>'PE-2',  'category'=>'Physical and Environmental Protection',
             'title'=>'Physical Access Authorisations',
             'description'=>'Develop, approve, and maintain a list of individuals with authorised access to the facility and designated areas.',
             'implementation_guidance'=>'Maintain an up-to-date access list for all secure areas. Review and reauthorise access quarterly. Remove access promptly when no longer needed. Use role-based physical access controls.'],

            ['control_id'=>'PE-3',  'category'=>'Physical and Environmental Protection',
             'title'=>'Physical Access Control',
             'description'=>'Enforce physical access authorisations at entry and exit points to the facility and designated areas.',
             'implementation_guidance'=>'Implement card access, PIN, or biometric controls at secure entry points. Maintain access logs. Investigate and document all physical security incidents. Conduct regular physical access audits.'],

            ['control_id'=>'PE-6',  'category'=>'Physical and Environmental Protection',
             'title'=>'Monitoring Physical Access',
             'description'=>'Monitor physical access to the facility and activate alarms and security personnel for unusual activity.',
             'implementation_guidance'=>'Install CCTV covering all entry points and sensitive areas. Implement intrusion detection alarms. Review CCTV footage following security events. Retain footage for a minimum of 30 days.'],

            ['control_id'=>'PE-8',  'category'=>'Physical and Environmental Protection',
             'title'=>'Visitor Access Records',
             'description'=>'Maintain visitor access records to the facility and review records.',
             'implementation_guidance'=>'Require all visitors to sign in with ID verification. Issue visitor badges. Record visitor purpose, host, and time of visit. Retain visitor logs for at least one year. Escort visitors in sensitive areas.'],

            ['control_id'=>'PE-12', 'category'=>'Physical and Environmental Protection',
             'title'=>'Emergency Lighting',
             'description'=>'Employ and maintain automatic emergency lighting that activates in the event of a power outage.',
             'implementation_guidance'=>'Install emergency lighting in all occupied areas and along evacuation routes. Test emergency lighting at least semi-annually. Maintain test records and repair any deficiencies promptly.'],

            ['control_id'=>'PE-13', 'category'=>'Physical and Environmental Protection',
             'title'=>'Fire Protection',
             'description'=>'Employ and maintain fire detection and suppression systems.',
             'implementation_guidance'=>'Install and maintain fire detection (smoke/heat detectors) and suppression systems. Conduct annual fire drills. Inspect and service fire suppression equipment according to manufacturer schedules.'],

            // ─── PL: PLANNING ────────────────────────────────────────────────────
            ['control_id'=>'PL-1',  'category'=>'Planning',
             'title'=>'Planning Policy and Procedures',
             'description'=>'Develop, document, and disseminate a security and privacy planning policy and procedures.',
             'implementation_guidance'=>'Define planning policies and procedures. Assign responsibilities for security planning activities. Review and update annually.'],

            ['control_id'=>'PL-2',  'category'=>'Planning',
             'title'=>'System Security and Privacy Plans',
             'description'=>'Develop security and privacy plans for the system that describe the security and privacy controls in place or planned.',
             'implementation_guidance'=>'Develop and maintain an SSP for each in-scope system. Include control descriptions, implementation status, and responsible parties. Review and update the SSP annually and before major changes.'],

            ['control_id'=>'PL-4',  'category'=>'Planning',
             'title'=>'Rules of Behaviour',
             'description'=>'Establish rules describing responsibilities and expected behaviour with respect to system usage and document acknowledgement.',
             'implementation_guidance'=>'Define and publish rules of behaviour covering acceptable use, data handling, and reporting requirements. Require all users to acknowledge the rules at onboarding and annually thereafter.'],

            // ─── PS: PERSONNEL SECURITY ──────────────────────────────────────────
            ['control_id'=>'PS-1',  'category'=>'Personnel Security',
             'title'=>'Personnel Security Policy and Procedures',
             'description'=>'Develop, document, and disseminate a personnel security policy and procedures.',
             'implementation_guidance'=>'Define personnel security policies covering screening, onboarding, termination, and personnel transfers. Review and update annually.'],

            ['control_id'=>'PS-2',  'category'=>'Personnel Security',
             'title'=>'Position Risk Designation',
             'description'=>'Assign a risk designation to all organisational positions and establish screening criteria for those positions.',
             'implementation_guidance'=>'Classify all positions by risk level based on access to sensitive systems and data. Define screening requirements by risk level. Review position risk designations annually and when roles change significantly.'],

            ['control_id'=>'PS-3',  'category'=>'Personnel Security',
             'title'=>'Personnel Screening',
             'description'=>'Screen individuals prior to authorising access to the system and rescreening according to defined conditions.',
             'implementation_guidance'=>'Conduct background checks (criminal, employment, education) before granting access. Re-screen personnel in high-risk positions periodically. Document screening results and retain records appropriately.'],

            ['control_id'=>'PS-4',  'category'=>'Personnel Security',
             'title'=>'Personnel Termination',
             'description'=>'Upon termination, disable system access within a defined time period and retrieve security-related property.',
             'implementation_guidance'=>'Disable all system access within 24 hours of termination. Retrieve organisation-issued assets (devices, badges, tokens). Conduct exit interviews covering security obligations. Archive account data per retention policy.'],

            ['control_id'=>'PS-5',  'category'=>'Personnel Security',
             'title'=>'Personnel Transfer',
             'description'=>'Review access authorisations for individuals who are transferred and initiate appropriate actions.',
             'implementation_guidance'=>'Review and adjust access rights within five days of personnel transfers. Remove access to former role systems. Document role changes and access modifications. Notify affected system owners of transfers.'],

            ['control_id'=>'PS-6',  'category'=>'Personnel Security',
             'title'=>'Access Agreements',
             'description'=>'Develop and document access agreements for individuals requiring access to the system and review and update agreements.',
             'implementation_guidance'=>'Require all personnel to sign access agreements including acceptable use, confidentiality, and security obligations. Review and re-sign agreements annually. Retain signed agreements throughout employment.'],

            ['control_id'=>'PS-7',  'category'=>'Personnel Security',
             'title'=>'External Personnel Security',
             'description'=>'Establish personnel security requirements including security roles and responsibilities for external service providers.',
             'implementation_guidance'=>'Include security requirements in contracts with external providers. Verify that external providers perform screening equivalent to organisational standards. Monitor compliance with personnel security requirements throughout the contract.'],

            ['control_id'=>'PS-8',  'category'=>'Personnel Security',
             'title'=>'Personnel Sanctions',
             'description'=>'Employ a formal sanctions process for personnel failing to comply with established information security policies.',
             'implementation_guidance'=>'Define a formal disciplinary process for security policy violations. Ensure consistency in applying sanctions. Document all sanctions decisions. Communicate the sanctions process to all personnel.'],

            // ─── PT: PII PROCESSING AND TRANSPARENCY ────────────────────────────
            ['control_id'=>'PT-1',  'category'=>'PII Processing and Transparency',
             'title'=>'Privacy Policy and Procedures',
             'description'=>'Develop, document, and disseminate a privacy policy and procedures.',
             'implementation_guidance'=>'Develop a privacy policy covering data collection, use, retention, and disposal. Publish the policy and make it accessible to data subjects. Review and update annually.'],

            ['control_id'=>'PT-2',  'category'=>'PII Processing and Transparency',
             'title'=>'Authority to Process PII',
             'description'=>'Determine and document the legal authority that permits the collection, use, maintenance, and sharing of PII.',
             'implementation_guidance'=>'Document the legal basis for each PII processing activity (consent, contract, legal obligation). Maintain a record of processing activities. Review legal basis for processing whenever use of PII changes.'],

            ['control_id'=>'PT-3',  'category'=>'PII Processing and Transparency',
             'title'=>'Personally Identifiable Information Processing Purposes',
             'description'=>'Identify and document the purpose for processing PII and only process PII for identified purposes.',
             'implementation_guidance'=>'Define and document the specific purpose for which each type of PII is collected. Implement controls preventing use of PII beyond stated purposes. Conduct privacy impact assessments for new PII processing activities.'],

            // ─── RA: RISK ASSESSMENT ─────────────────────────────────────────────
            ['control_id'=>'RA-1',  'category'=>'Risk Assessment',
             'title'=>'Risk Assessment Policy and Procedures',
             'description'=>'Develop, document, and disseminate a risk assessment policy and associated procedures.',
             'implementation_guidance'=>'Define a risk assessment policy covering scope, methodology, frequency, and responsibilities. Align with organisational risk appetite. Review and update annually.'],

            ['control_id'=>'RA-2',  'category'=>'Risk Assessment',
             'title'=>'Security Categorisation',
             'description'=>'Categorise the system and information it processes, stores, or transmits, and document the security categorisation results.',
             'implementation_guidance'=>'Apply FIPS 199 or organisational categorisation criteria to classify systems by confidentiality, integrity, and availability impact. Document categorisation rationale. Review categorisation when system scope changes significantly.'],

            ['control_id'=>'RA-3',  'category'=>'Risk Assessment',
             'title'=>'Risk Assessment',
             'description'=>'Conduct a risk assessment that identifies threats, vulnerabilities, likelihood, and impact to operations, assets, and personnel.',
             'implementation_guidance'=>'Conduct comprehensive risk assessments at least annually and after significant changes. Identify all threats and vulnerabilities. Score risks using a consistent methodology (likelihood × impact). Document findings and update risk register.'],

            ['control_id'=>'RA-5',  'category'=>'Risk Assessment',
             'title'=>'Vulnerability Monitoring and Scanning',
             'description'=>'Monitor and scan for vulnerabilities in the system and hosted applications at defined frequencies.',
             'implementation_guidance'=>'Conduct authenticated vulnerability scans on all systems at least monthly. Prioritise remediation by severity (critical/high within 72 hours, medium within 30 days). Document scan results and track remediation.'],

            ['control_id'=>'RA-7',  'category'=>'Risk Assessment',
             'title'=>'Risk Response',
             'description'=>'Respond to findings from security assessments, monitoring, and audits to address identified risks.',
             'implementation_guidance'=>'Define a risk response process for each risk category. Implement treatment plans within defined timeframes. Track risk treatment progress and report status to management. Verify effectiveness of treatment actions.'],

            // ─── SA: SYSTEM AND SERVICES ACQUISITION ────────────────────────────
            ['control_id'=>'SA-1',  'category'=>'System and Services Acquisition',
             'title'=>'Acquisition Policy and Procedures',
             'description'=>'Develop, document, and disseminate a system and services acquisition policy and procedures.',
             'implementation_guidance'=>'Define acquisition policies integrating security requirements into procurement processes. Review and update annually.'],

            ['control_id'=>'SA-3',  'category'=>'System and Services Acquisition',
             'title'=>'System Development Life Cycle',
             'description'=>'Manage the system using a system development life cycle with security and privacy considerations.',
             'implementation_guidance'=>'Incorporate security requirements into SDLC phases. Assign security roles to SDLC activities. Conduct security reviews at phase gates. Document security decisions throughout the lifecycle.'],

            ['control_id'=>'SA-4',  'category'=>'System and Services Acquisition',
             'title'=>'Acquisition Process',
             'description'=>'Include security and privacy requirements in acquisition contracts for systems, components, or services.',
             'implementation_guidance'=>'Define security requirements for all acquisitions. Include security requirements in RFPs and contracts. Evaluate vendor security capabilities as part of the selection process.'],

            ['control_id'=>'SA-8',  'category'=>'System and Services Acquisition',
             'title'=>'Security and Privacy Engineering Principles',
             'description'=>'Apply security and privacy engineering principles in the specification, design, development, implementation, and modification of the system.',
             'implementation_guidance'=>'Apply defence-in-depth, least privilege, fail-safe defaults, and economy of mechanism principles. Document engineering principles. Review architecture designs against principles before approval.'],

            ['control_id'=>'SA-9',  'category'=>'System and Services Acquisition',
             'title'=>'External System Services',
             'description'=>'Require external service providers to comply with organisational security and privacy requirements.',
             'implementation_guidance'=>'Include security requirements in contracts with external service providers. Conduct periodic security reviews of external services. Maintain visibility of service provider security posture through regular reporting.'],

            ['control_id'=>'SA-11', 'category'=>'System and Services Acquisition',
             'title'=>'Developer Testing and Evaluation',
             'description'=>'Require system developers to create and implement a security and privacy assessment plan.',
             'implementation_guidance'=>'Require developers to document and execute security testing plans. Review test plans and results. Verify coverage of security requirements in test cases. Track and remediate defects found during testing.'],

            // ─── SC: SYSTEM AND COMMUNICATIONS PROTECTION ───────────────────────
            ['control_id'=>'SC-1',  'category'=>'System and Communications Protection',
             'title'=>'System and Communications Protection Policy and Procedures',
             'description'=>'Develop, document, and disseminate a system and communications protection policy and procedures.',
             'implementation_guidance'=>'Define policies for network security, cryptography, and communications protection. Review and update annually.'],

            ['control_id'=>'SC-2',  'category'=>'System and Communications Protection',
             'title'=>'Separation of System and User Functionality',
             'description'=>'Separate user functionality from system management functionality.',
             'implementation_guidance'=>'Implement separate interfaces for administrative and user functions. Prevent standard users from accessing system management capabilities. Apply principle of least privilege to administrative interfaces.'],

            ['control_id'=>'SC-4',  'category'=>'System and Communications Protection',
             'title'=>'Information in Shared System Resources',
             'description'=>'Prevent unauthorised and unintended information transfer via shared system resources.',
             'implementation_guidance'=>'Implement controls to prevent information leakage through shared memory, caches, or storage. Clear sensitive data from shared resources after use. Apply memory scrubbing where supported by the OS.'],

            ['control_id'=>'SC-5',  'category'=>'System and Communications Protection',
             'title'=>'Denial of Service Protection',
             'description'=>'Protect against or limit the effects of denial-of-service attacks.',
             'implementation_guidance'=>'Implement rate limiting, traffic filtering, and load balancing. Use a DDoS protection service for internet-facing systems. Define and test procedures for responding to DoS conditions.'],

            ['control_id'=>'SC-7',  'category'=>'System and Communications Protection',
             'title'=>'Boundary Protection',
             'description'=>'Monitor and control communications at external boundaries and key internal boundaries.',
             'implementation_guidance'=>'Deploy firewalls and IDS/IPS at network boundaries. Limit connection points to external networks. Monitor all boundary traffic. Apply default-deny rules at boundaries.'],

            ['control_id'=>'SC-8',  'category'=>'System and Communications Protection',
             'title'=>'Transmission Confidentiality and Integrity',
             'description'=>'Implement cryptographic mechanisms to prevent unauthorised disclosure or modification of information during transmission.',
             'implementation_guidance'=>'Enforce TLS 1.2 or higher for all data in transit. Disable older protocols (SSL, TLS 1.0/1.1). Implement HSTS for web applications. Use mutual TLS for API-to-API communications.'],

            ['control_id'=>'SC-10', 'category'=>'System and Communications Protection',
             'title'=>'Network Disconnect',
             'description'=>'Terminate network connections associated with communications sessions after a defined period of inactivity.',
             'implementation_guidance'=>'Configure session timeouts for all network connections. Define timeouts based on sensitivity (e.g., 15 minutes for administrative sessions). Alert when idle sessions are detected and disconnected.'],

            ['control_id'=>'SC-12', 'category'=>'System and Communications Protection',
             'title'=>'Cryptographic Key Establishment and Management',
             'description'=>'Establish and manage cryptographic keys for required cryptography employed within the system.',
             'implementation_guidance'=>'Implement a key management policy and procedures. Use HSMs for key storage where feasible. Define key lifecycle procedures including generation, distribution, rotation, and destruction.'],

            ['control_id'=>'SC-13', 'category'=>'System and Communications Protection',
             'title'=>'Cryptographic Protection',
             'description'=>'Determine the cryptographic uses and implement required cryptographic controls.',
             'implementation_guidance'=>'Use only approved encryption algorithms and key lengths. Apply encryption to data at rest and in transit based on sensitivity. Review cryptographic standards annually for continued suitability.'],

            ['control_id'=>'SC-15', 'category'=>'System and Communications Protection',
             'title'=>'Collaborative Computing Devices and Applications',
             'description'=>'Prohibit remote activation of collaborative computing devices and applications without authorisation.',
             'implementation_guidance'=>'Require explicit user confirmation before enabling cameras, microphones, or screen sharing. Apply physical covers to cameras in sensitive areas. Disable collaborative computing features when not needed.'],

            ['control_id'=>'SC-17', 'category'=>'System and Communications Protection',
             'title'=>'Public Key Infrastructure Certificates',
             'description'=>'Issue public key certificates under an approved certificate policy or obtain certificates from an approved service provider.',
             'implementation_guidance'=>'Manage TLS and code signing certificates through a centralised certificate inventory. Monitor certificate expiry dates and renew before expiration. Use only certificates from trusted CAs. Implement OCSP or CRL checking.'],

            ['control_id'=>'SC-18', 'category'=>'System and Communications Protection',
             'title'=>'Mobile Code',
             'description'=>'Define acceptable mobile code and mobile code technologies and authorise the use of mobile code.',
             'implementation_guidance'=>'Define acceptable mobile code standards (e.g., JavaScript from approved CDNs). Implement Content Security Policy (CSP) headers. Scan mobile code for malicious content before execution.'],

            ['control_id'=>'SC-20', 'category'=>'System and Communications Protection',
             'title'=>'Secure Name/Address Resolution Service',
             'description'=>'Provide additional data origin authentication and integrity verification artefacts along with the authoritative name resolution data.',
             'implementation_guidance'=>'Implement DNSSEC for all DNS zones. Use DNS over HTTPS (DoH) or DNS over TLS (DoT) for resolver queries. Monitor DNS queries for signs of tunnelling or exfiltration.'],

            ['control_id'=>'SC-28', 'category'=>'System and Communications Protection',
             'title'=>'Protection of Information at Rest',
             'description'=>'Protect the confidentiality and integrity of information at rest.',
             'implementation_guidance'=>'Encrypt all sensitive data at rest using AES-256 or equivalent. Apply encryption to databases, file systems, and backups. Manage encryption keys securely, separately from encrypted data.'],

            // ─── SI: SYSTEM AND INFORMATION INTEGRITY ────────────────────────────
            ['control_id'=>'SI-1',  'category'=>'System and Information Integrity',
             'title'=>'System and Information Integrity Policy and Procedures',
             'description'=>'Develop, document, and disseminate a system and information integrity policy and procedures.',
             'implementation_guidance'=>'Define integrity policies covering malware protection, patching, and monitoring. Review and update annually.'],

            ['control_id'=>'SI-2',  'category'=>'System and Information Integrity',
             'title'=>'Flaw Remediation',
             'description'=>'Identify, report, and correct information system flaws; install security-relevant software updates within defined time periods.',
             'implementation_guidance'=>'Implement a patch management programme. Define and enforce patching SLAs by severity. Test patches in non-production before deployment. Track outstanding patches and report to management.'],

            ['control_id'=>'SI-3',  'category'=>'System and Information Integrity',
             'title'=>'Malicious Code Protection',
             'description'=>'Implement malicious code protection mechanisms at entry and exit points and at workstations, servers, and mobile computing devices.',
             'implementation_guidance'=>'Deploy endpoint protection with real-time scanning and automatic updates. Scan all file uploads and email attachments. Configure anti-malware to block, quarantine, and alert on detections.'],

            ['control_id'=>'SI-4',  'category'=>'System and Information Integrity',
             'title'=>'System Monitoring',
             'description'=>'Monitor the system to detect attacks and indicators of potential attacks and unauthorised local, network, and remote connections.',
             'implementation_guidance'=>'Deploy SIEM and IDS/IPS. Define detection rules for common attack patterns. Investigate and document all security alerts. Tune monitoring rules regularly to reduce false positives.'],

            ['control_id'=>'SI-5',  'category'=>'System and Information Integrity',
             'title'=>'Security Alerts, Advisories, and Directives',
             'description'=>'Receive security alerts and advisories from external organisations and disseminate to relevant personnel.',
             'implementation_guidance'=>'Subscribe to threat intelligence and vendor advisory feeds. Assign responsibility for reviewing advisories and assessing applicability. Act on relevant advisories within defined timeframes.'],

            ['control_id'=>'SI-7',  'category'=>'System and Information Integrity',
             'title'=>'Software, Firmware, and Information Integrity',
             'description'=>'Employ integrity verification tools to detect unauthorised changes to software, firmware, and information.',
             'implementation_guidance'=>'Implement file integrity monitoring (FIM) on critical system files. Alert on unexpected changes. Review and baseline FIM results after authorised changes. Include firmware in integrity monitoring where feasible.'],

            ['control_id'=>'SI-10', 'category'=>'System and Information Integrity',
             'title'=>'Information Input Validation',
             'description'=>'Check the validity of user inputs to the system for accuracy, completeness, and correctness.',
             'implementation_guidance'=>'Implement server-side input validation for all user inputs. Use whitelisting validation approaches. Apply parameterised queries to prevent SQL injection. Log and alert on validation failures.'],

            ['control_id'=>'SI-11', 'category'=>'System and Information Integrity',
             'title'=>'Error Handling',
             'description'=>'Generate error messages that provide information needed for corrective actions without revealing sensitive information.',
             'implementation_guidance'=>'Return generic error messages to users for unexpected errors. Log detailed error information server-side only. Review error handling code for information disclosure vulnerabilities. Test error handling as part of security testing.'],

            ['control_id'=>'SI-12', 'category'=>'System and Information Integrity',
             'title'=>'Information Management and Retention',
             'description'=>'Manage and retain information within the system and information output from the system in accordance with applicable laws, directives, and policies.',
             'implementation_guidance'=>'Define retention schedules for all information types. Implement automated retention and deletion controls where possible. Document retention decisions and ensure compliance with applicable regulations.'],

            // ─── SR: SUPPLY CHAIN RISK MANAGEMENT ───────────────────────────────
            ['control_id'=>'SR-1',  'category'=>'Supply Chain Risk Management',
             'title'=>'Supply Chain Risk Management Policy and Procedures',
             'description'=>'Develop, document, and disseminate a supply chain risk management policy and procedures.',
             'implementation_guidance'=>'Define supply chain risk management policies and procedures. Identify critical suppliers and components. Review and update annually.'],

            ['control_id'=>'SR-2',  'category'=>'Supply Chain Risk Management',
             'title'=>'Supply Chain Risk Assessment',
             'description'=>'Identify and assess supply chain risks associated with the development, acquisition, maintenance, and disposal of systems.',
             'implementation_guidance'=>'Conduct supply chain risk assessments for critical components. Evaluate supplier security practices. Maintain a list of critical suppliers and assess their risks annually.'],

            ['control_id'=>'SR-3',  'category'=>'Supply Chain Risk Management',
             'title'=>'Supply Chain Controls and Plans',
             'description'=>'Implement supply chain controls to address identified risks and develop plans to address supply chain risks.',
             'implementation_guidance'=>'Define contractual security requirements for suppliers. Require suppliers to notify of security incidents. Conduct periodic supplier audits or request third-party audit reports.'],

            ['control_id'=>'SR-5',  'category'=>'Supply Chain Risk Management',
             'title'=>'Acquisition Strategies, Tools, and Methods',
             'description'=>'Employ acquisition strategies, contract tools, and procurement methods to protect against supply chain risks.',
             'implementation_guidance'=>'Use approved vendor lists for critical component procurement. Include supply chain security requirements in procurement contracts. Verify authenticity of hardware and software before deployment.'],

            ['control_id'=>'SR-8',  'category'=>'Supply Chain Risk Management',
             'title'=>'Notification Agreements',
             'description'=>'Establish agreements and procedures with entities involved in the supply chain for notifying organisations of events affecting the security of systems.',
             'implementation_guidance'=>'Include incident notification requirements in supplier agreements. Define notification timeframes (e.g., within 72 hours of discovery). Test notification procedures as part of supply chain exercises.'],
        ];

        $rows = array_map(function ($c) use ($framework) {
            return array_merge($c, [
                'framework_id' => $framework->id,
                'is_active'    => true,
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);
        }, $controls);

        foreach (array_chunk($rows, 20) as $chunk) {
            DB::table('controls')->insert($chunk);
        }

        $this->command->info('NIST SP 800-53 Rev 5 — ' . count($rows) . ' controls seeded successfully.');
    }
}