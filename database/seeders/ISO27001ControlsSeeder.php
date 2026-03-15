<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ISO27001ControlsSeeder extends Seeder
{
    public function run(): void
    {
        $framework = DB::table('frameworks')->where('short_name', 'ISO27001')->first();
        if (!$framework) {
            $this->command->error('ISO27001 framework not found. Run FrameworkSeeder first.');
            return;
        }

        DB::table('controls')->where('framework_id', $framework->id)->delete();

        $controls = [

            // ─── THEME A.5: ORGANISATIONAL CONTROLS (37 controls) ───────────────

            ['control_id' => 'A.5.1',  'title' => 'Policies for information security',
             'category' => 'Organisational Controls',
             'description' => 'Information security policy and topic-specific policies shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel and relevant interested parties, and reviewed at planned intervals or if significant changes occur.',
             'implementation_guidance' => 'Establish a top-level information security policy approved by senior management. Define supporting topic-specific policies (e.g., access control, cryptography, BYOD). Communicate policies to all staff and review annually or after significant incidents.'],

            ['control_id' => 'A.5.2',  'title' => 'Information security roles and responsibilities',
             'category' => 'Organisational Controls',
             'description' => "Information security roles and responsibilities shall be defined and allocated according to the organisation's needs.",
             'implementation_guidance' => 'Define and document roles responsible for information security. Assign an Information Security Officer or equivalent. Ensure accountability for all information assets and security functions is clearly stated in job descriptions.'],

            ['control_id' => 'A.5.3',  'title' => 'Segregation of duties',
             'category' => 'Organisational Controls',
             'description' => 'Conflicting duties and conflicting areas of responsibility shall be segregated.',
             'implementation_guidance' => 'Identify duties that could create conflicts of interest or opportunities for fraud. Implement compensating controls where full segregation is not possible. Document and review role assignments regularly.'],

            ['control_id' => 'A.5.4',  'title' => 'Management responsibilities',
             'category' => 'Organisational Controls',
             'description' => 'Management shall require all personnel to apply information security in accordance with the established information security policy, topic-specific policies and procedures of the organisation.',
             'implementation_guidance' => 'Ensure managers actively enforce security policies within their teams. Include security responsibilities in performance objectives. Managers should lead by example and escalate non-compliance promptly.'],

            ['control_id' => 'A.5.5',  'title' => 'Contact with authorities',
             'category' => 'Organisational Controls',
             'description' => 'The organisation shall establish and maintain contact with relevant authorities.',
             'implementation_guidance' => 'Identify relevant regulatory and law enforcement authorities. Designate a point of contact. Maintain records of contacts and define when and how to engage authorities during incidents.'],

            ['control_id' => 'A.5.6',  'title' => 'Contact with special interest groups',
             'category' => 'Organisational Controls',
             'description' => 'The organisation shall establish and maintain contact with special interest groups or other specialist security forums and professional associations.',
             'implementation_guidance' => 'Join industry security groups, ISACs, or professional bodies. Use these contacts to stay updated on emerging threats and best practices. Document memberships and participation.'],

            ['control_id' => 'A.5.7',  'title' => 'Threat intelligence',
             'category' => 'Organisational Controls',
             'description' => 'Information relating to information security threats shall be collected and analysed to produce threat intelligence.',
             'implementation_guidance' => 'Subscribe to threat intelligence feeds relevant to your sector. Analyse threat data to inform risk assessments. Share relevant intelligence with internal stakeholders and act on findings.'],

            ['control_id' => 'A.5.8',  'title' => 'Information security in project management',
             'category' => 'Organisational Controls',
             'description' => 'Information security shall be integrated into project management.',
             'implementation_guidance' => 'Include information security requirements in project initiation templates. Appoint a security reviewer for all significant projects. Conduct security reviews at key project milestones.'],

            ['control_id' => 'A.5.9',  'title' => 'Inventory of information and other associated assets',
             'category' => 'Organisational Controls',
             'description' => 'An inventory of information and other associated assets, including owners, shall be developed and maintained.',
             'implementation_guidance' => 'Create and maintain an asset register covering information, software, hardware, and services. Assign an owner to each asset. Review and update the inventory at least annually.'],

            ['control_id' => 'A.5.10', 'title' => 'Acceptable use of information and other associated assets',
             'category' => 'Organisational Controls',
             'description' => 'Rules for the acceptable use and procedures for handling information and other associated assets shall be identified, documented and implemented.',
             'implementation_guidance' => 'Define acceptable use policies for email, internet, and devices. Communicate policies to all users at onboarding and periodically. Include consequences for non-compliance.'],

            ['control_id' => 'A.5.11', 'title' => 'Return of assets',
             'category' => 'Organisational Controls',
             'description' => 'Personnel and other interested parties shall return all the organisation\'s assets in their possession upon change or termination of their employment, contract or agreement.',
             'implementation_guidance' => 'Implement an offboarding checklist requiring return of all physical and logical assets. Revoke access and retrieve devices, badges, and credentials upon departure. Document the return process.'],

            ['control_id' => 'A.5.12', 'title' => 'Classification of information',
             'category' => 'Organisational Controls',
             'description' => 'Information shall be classified according to the information security needs of the organisation based on confidentiality, integrity, availability and relevant interested party requirements.',
             'implementation_guidance' => 'Define a classification scheme (e.g., Public, Internal, Confidential, Restricted). Train staff on correct classification of documents. Apply classification labels to all information assets.'],

            ['control_id' => 'A.5.13', 'title' => 'Labelling of information',
             'category' => 'Organisational Controls',
             'description' => 'An appropriate set of procedures for information labelling shall be developed and implemented in accordance with the information classification scheme adopted by the organisation.',
             'implementation_guidance' => 'Apply visual labels to documents and digital assets based on their classification. Use consistent naming conventions and metadata tagging. Automate labelling where possible using DLP tools.'],

            ['control_id' => 'A.5.14', 'title' => 'Information transfer',
             'category' => 'Organisational Controls',
             'description' => 'Information transfer rules, procedures, or agreements shall be in place for all types of transfer facilities within the organisation and between the organisation and other parties.',
             'implementation_guidance' => 'Define transfer policies covering email, USB, cloud storage, and physical media. Require encryption for sensitive data transfers. Establish NDAs and data transfer agreements with third parties.'],

            ['control_id' => 'A.5.15', 'title' => 'Access control',
             'category' => 'Organisational Controls',
             'description' => 'Rules to control physical and logical access to information and other associated assets shall be established and implemented based on business and information security requirements.',
             'implementation_guidance' => 'Implement role-based access control. Apply the principle of least privilege. Review access rights quarterly and immediately upon role changes or termination.'],

            ['control_id' => 'A.5.16', 'title' => 'Identity management',
             'category' => 'Organisational Controls',
             'description' => 'The full life cycle of identities shall be managed.',
             'implementation_guidance' => 'Manage user identities from provisioning to deprovisioning. Use unique identifiers for each user. Implement identity governance processes including periodic access reviews.'],

            ['control_id' => 'A.5.17', 'title' => 'Authentication information',
             'category' => 'Organisational Controls',
             'description' => 'Allocation and management of authentication information shall be controlled by a management process, including advising personnel on appropriate handling of authentication information.',
             'implementation_guidance' => 'Enforce strong password policies. Use multi-factor authentication for privileged and remote access. Prohibit sharing of credentials. Store passwords using strong one-way hashing algorithms.'],

            ['control_id' => 'A.5.18', 'title' => 'Access rights',
             'category' => 'Organisational Controls',
             'description' => 'Access rights to information and other associated assets shall be provisioned, reviewed, modified and removed in accordance with the organisation\'s topic-specific policy on and rules for access control.',
             'implementation_guidance' => 'Implement a formal access request and approval process. Conduct periodic access reviews at least every six months. Immediately revoke access when no longer needed.'],

            ['control_id' => 'A.5.19', 'title' => 'Information security in supplier relationships',
             'category' => 'Organisational Controls',
             'description' => 'Processes and procedures shall be defined and implemented to manage the information security risks associated with the use of supplier\'s products or services.',
             'implementation_guidance' => 'Conduct security due diligence before engaging suppliers. Include security requirements in supplier contracts. Monitor supplier compliance throughout the relationship.'],

            ['control_id' => 'A.5.20', 'title' => 'Addressing information security within supplier agreements',
             'category' => 'Organisational Controls',
             'description' => 'Relevant information security requirements shall be established and agreed with each supplier based on the type of supplier relationship.',
             'implementation_guidance' => 'Include information security clauses in all supplier contracts. Define breach notification requirements, audit rights, and data handling obligations. Use standard security addendums for common supplier types.'],

            ['control_id' => 'A.5.21', 'title' => 'Managing information security in the ICT supply chain',
             'category' => 'Organisational Controls',
             'description' => 'Processes and procedures shall be defined and implemented to manage the information security risks associated with the ICT products and services supply chain.',
             'implementation_guidance' => 'Assess security risks in ICT hardware and software supply chains. Verify integrity of software components. Monitor for supply chain compromise notifications from vendors.'],

            ['control_id' => 'A.5.22', 'title' => 'Monitoring, review and change management of supplier services',
             'category' => 'Organisational Controls',
             'description' => 'The organisation shall regularly monitor, review, evaluate and manage change in supplier information security practices and service delivery.',
             'implementation_guidance' => 'Schedule regular supplier security reviews. Require suppliers to report security incidents promptly. Assess impact of supplier changes on your security posture.'],

            ['control_id' => 'A.5.23', 'title' => 'Information security for use of cloud services',
             'category' => 'Organisational Controls',
             'description' => 'Processes for acquisition, use, management and exit from cloud services shall be established in accordance with the organisation\'s information security requirements.',
             'implementation_guidance' => 'Define a cloud security policy. Assess cloud providers against security requirements before adoption. Ensure data portability and clear exit procedures. Review shared responsibility matrices.'],

            ['control_id' => 'A.5.24', 'title' => 'Information security incident management planning and preparation',
             'category' => 'Organisational Controls',
             'description' => 'The organisation shall plan and prepare for managing information security incidents by defining, establishing and communicating information security incident management processes, roles and responsibilities.',
             'implementation_guidance' => 'Develop and document an incident response plan. Define roles for incident response team members. Conduct tabletop exercises at least annually. Establish an incident reporting hotline or channel.'],

            ['control_id' => 'A.5.25', 'title' => 'Assessment and decision on information security events',
             'category' => 'Organisational Controls',
             'description' => 'The organisation shall assess information security events and decide if they are to be categorised as information security incidents.',
             'implementation_guidance' => 'Define criteria for classifying events as incidents. Implement a triage process for reported events. Train staff on how to report and escalate security events.'],

            ['control_id' => 'A.5.26', 'title' => 'Response to information security incidents',
             'category' => 'Organisational Controls',
             'description' => 'Information security incidents shall be responded to in accordance with the documented procedures.',
             'implementation_guidance' => 'Follow documented incident response procedures including containment, eradication, and recovery. Coordinate with relevant stakeholders and authorities. Document all response actions taken.'],

            ['control_id' => 'A.5.27', 'title' => 'Learning from information security incidents',
             'category' => 'Organisational Controls',
             'description' => 'Knowledge gained from information security incidents shall be used to strengthen and improve the information security controls.',
             'implementation_guidance' => 'Conduct post-incident reviews for all significant incidents. Identify root causes and implement corrective actions. Update risk assessments and controls based on lessons learned.'],

            ['control_id' => 'A.5.28', 'title' => 'Collection of evidence',
             'category' => 'Organisational Controls',
             'description' => 'The organisation shall establish and implement procedures for the identification, collection, acquisition and preservation of evidence related to information security events.',
             'implementation_guidance' => 'Define evidence collection procedures following forensic best practices. Ensure chain of custody for digital evidence. Train incident responders in evidence handling and preservation.'],

            ['control_id' => 'A.5.29', 'title' => 'Information security during disruption',
             'category' => 'Organisational Controls',
             'description' => 'The organisation shall plan how to maintain information security at an appropriate level during disruption.',
             'implementation_guidance' => 'Include information security requirements in business continuity plans. Ensure security controls remain operational during disruptions. Test security capabilities as part of BCP exercises.'],

            ['control_id' => 'A.5.30', 'title' => 'ICT readiness for business continuity',
             'category' => 'Organisational Controls',
             'description' => 'ICT readiness shall be planned, implemented, maintained and tested based on business continuity objectives and ICT continuity requirements.',
             'implementation_guidance' => 'Define RTO and RPO for critical ICT systems. Implement redundancy, backup, and failover mechanisms. Test ICT recovery procedures at least annually.'],

            ['control_id' => 'A.5.31', 'title' => 'Legal, statutory, regulatory and contractual requirements',
             'category' => 'Organisational Controls',
             'description' => 'Legal, statutory, regulatory and contractual requirements relevant to information security and the organisation\'s approach to meet these requirements shall be identified, documented and kept up to date.',
             'implementation_guidance' => 'Maintain a register of applicable legal and regulatory requirements. Assign ownership for monitoring compliance with each requirement. Review the register whenever laws or regulations change.'],

            ['control_id' => 'A.5.32', 'title' => 'Intellectual property rights',
             'category' => 'Organisational Controls',
             'description' => 'The organisation shall implement appropriate procedures to protect intellectual property rights.',
             'implementation_guidance' => 'Define policies for use of licensed software and copyrighted material. Conduct periodic software licence audits. Train staff on intellectual property obligations.'],

            ['control_id' => 'A.5.33', 'title' => 'Protection of records',
             'category' => 'Organisational Controls',
             'description' => 'Records shall be protected from loss, destruction, falsification, unauthorised access and unauthorised release.',
             'implementation_guidance' => 'Classify records by retention period and sensitivity. Implement controls to prevent tampering and unauthorised deletion. Ensure backups of critical records are tested regularly.'],

            ['control_id' => 'A.5.34', 'title' => 'Privacy and protection of personal information',
             'category' => 'Organisational Controls',
             'description' => 'The organisation shall identify and meet the requirements regarding the preservation of privacy and protection of personal information as required by applicable legislation and regulations where relevant.',
             'implementation_guidance' => 'Conduct a privacy impact assessment for systems handling personal data. Implement data minimisation, purpose limitation, and consent management. Appoint a data protection officer where required.'],

            ['control_id' => 'A.5.35', 'title' => 'Independent review of information security',
             'category' => 'Organisational Controls',
             'description' => 'The organisation\'s approach to managing information security and its implementation shall be reviewed independently at planned intervals or when significant changes occur.',
             'implementation_guidance' => 'Schedule annual independent audits of the ISMS. Use external auditors or internal audit teams with appropriate independence. Address findings from reviews promptly with documented corrective actions.'],

            ['control_id' => 'A.5.36', 'title' => 'Compliance with policies, rules and standards for information security',
             'category' => 'Organisational Controls',
             'description' => 'Compliance with the organisation\'s information security policy, topic-specific policies, rules and standards shall be regularly reviewed.',
             'implementation_guidance' => 'Establish a compliance monitoring programme. Conduct periodic compliance checks against security policies. Report compliance status to management and track remediation of gaps.'],

            ['control_id' => 'A.5.37', 'title' => 'Documented operating procedures',
             'category' => 'Organisational Controls',
             'description' => 'Operating procedures for information processing facilities shall be documented and made available to personnel who need them.',
             'implementation_guidance' => 'Maintain up-to-date operational procedures for all critical processes. Store procedures in a controlled document management system. Review and update procedures following incidents or significant changes.'],

            // ─── THEME A.6: PEOPLE CONTROLS (8 controls) ────────────────────────

            ['control_id' => 'A.6.1',  'title' => 'Screening',
             'category' => 'People Controls',
             'description' => 'Background verification checks on all candidates to become personnel shall be carried out prior to joining the organisation and on an ongoing basis, taking into consideration applicable laws, regulations and ethics.',
             'implementation_guidance' => 'Define background check requirements by role sensitivity. Check employment history, criminal records, and qualifications. Repeat checks for personnel in high-trust roles periodically.'],

            ['control_id' => 'A.6.2',  'title' => 'Terms and conditions of employment',
             'category' => 'People Controls',
             'description' => 'The employment contractual agreements shall state the personnel\'s and the organisation\'s responsibilities for information security.',
             'implementation_guidance' => 'Include information security responsibilities, confidentiality obligations, and acceptable use requirements in employment contracts. Ensure all staff sign the agreement before starting work.'],

            ['control_id' => 'A.6.3',  'title' => 'Information security awareness, education and training',
             'category' => 'People Controls',
             'description' => 'Personnel of the organisation and relevant interested parties shall receive appropriate information security awareness, education and training and regular updates of the organisation\'s information security policy.',
             'implementation_guidance' => 'Deliver security awareness training at onboarding and annually. Provide role-specific training for IT staff and privileged users. Track completion and test comprehension. Update content when new threats emerge.'],

            ['control_id' => 'A.6.4',  'title' => 'Disciplinary process',
             'category' => 'People Controls',
             'description' => 'A disciplinary process shall be formalised and communicated to take actions against personnel and other relevant interested parties who have committed an information security policy violation.',
             'implementation_guidance' => 'Define a tiered disciplinary process for security policy violations. Include security breaches in HR disciplinary frameworks. Ensure process is fair, documented, and consistently applied.'],

            ['control_id' => 'A.6.5',  'title' => 'Responsibilities after termination or change of employment',
             'category' => 'People Controls',
             'description' => 'Information security responsibilities and duties that remain valid after termination or change of employment shall be defined, enforced and communicated to relevant personnel and other interested parties.',
             'implementation_guidance' => 'Include post-employment obligations in contracts (e.g., non-disclosure). Brief departing staff on continuing obligations. Enforce NDAs and monitor for data exfiltration during notice periods.'],

            ['control_id' => 'A.6.6',  'title' => 'Confidentiality or non-disclosure agreements',
             'category' => 'People Controls',
             'description' => 'Confidentiality or non-disclosure agreements reflecting the organisation\'s needs for the protection of information shall be identified, documented, regularly reviewed and signed by personnel and other relevant interested parties.',
             'implementation_guidance' => 'Use standardised NDA templates reviewed by legal counsel. Require all staff and contractors to sign NDAs at onboarding. Review NDA adequacy annually and update as required.'],

            ['control_id' => 'A.6.7',  'title' => 'Remote working',
             'category' => 'People Controls',
             'description' => 'Security measures shall be implemented when personnel are working remotely to protect information accessed, processed or stored outside the organisation\'s premises.',
             'implementation_guidance' => 'Define a remote working security policy. Require VPN usage for accessing internal systems remotely. Ensure remote devices meet minimum security standards (encryption, EDR, patching). Train staff on home network risks.'],

            ['control_id' => 'A.6.8',  'title' => 'Information security event reporting',
             'category' => 'People Controls',
             'description' => 'The organisation shall provide a mechanism for personnel to report observed or suspected information security events through appropriate channels in a timely manner.',
             'implementation_guidance' => 'Provide a simple, accessible reporting channel (e.g., email alias, help desk ticket). Train all staff to recognise and report suspicious activity. Acknowledge reports promptly and provide feedback to reporters.'],

            // ─── THEME A.7: PHYSICAL CONTROLS (14 controls) ─────────────────────

            ['control_id' => 'A.7.1',  'title' => 'Physical security perimeters',
             'category' => 'Physical Controls',
             'description' => 'Security perimeters shall be defined and used to protect areas that contain information and other associated assets.',
             'implementation_guidance' => 'Define physical security zones (e.g., public, restricted, secure). Install access controls at perimeter boundaries. Clearly mark restricted areas and brief all personnel on access rules.'],

            ['control_id' => 'A.7.2',  'title' => 'Physical entry',
             'category' => 'Physical Controls',
             'description' => 'Secure areas shall be protected by appropriate entry controls and access points to ensure that only authorised personnel are allowed access.',
             'implementation_guidance' => 'Use keycards, PIN codes, or biometrics to control access to secure areas. Maintain visitor logs. Escort visitors in sensitive areas at all times. Review access logs regularly.'],

            ['control_id' => 'A.7.3',  'title' => 'Securing offices, rooms and facilities',
             'category' => 'Physical Controls',
             'description' => 'Physical security for offices, rooms and facilities shall be designed and implemented.',
             'implementation_guidance' => 'Lock server rooms, data centres, and archive rooms at all times. Use locked cabinets for sensitive documents and equipment. Implement clean desk policies in open-plan offices.'],

            ['control_id' => 'A.7.4',  'title' => 'Physical security monitoring',
             'category' => 'Physical Controls',
             'description' => 'Premises shall be continuously monitored for unauthorised physical access.',
             'implementation_guidance' => 'Install CCTV cameras in key areas. Set up intrusion detection alarms. Review CCTV footage following security incidents. Ensure monitoring covers after-hours periods.'],

            ['control_id' => 'A.7.5',  'title' => 'Protecting against physical and environmental threats',
             'category' => 'Physical Controls',
             'description' => 'Protection against physical and environmental threats, such as natural disasters, malicious attack or accidents, shall be designed and implemented.',
             'implementation_guidance' => 'Assess environmental threats (flood, fire, power outage) for key facilities. Install fire suppression, UPS, and water leak detection in data centres. Position critical equipment away from windows and external walls.'],

            ['control_id' => 'A.7.6',  'title' => 'Working in secure areas',
             'category' => 'Physical Controls',
             'description' => 'Security measures for working in secure areas shall be designed and implemented.',
             'implementation_guidance' => 'Restrict use of mobile devices and cameras in secure areas. Limit the number of personnel with access. Conduct periodic checks to ensure compliance with secure area rules.'],

            ['control_id' => 'A.7.7',  'title' => 'Clear desk and clear screen',
             'category' => 'Physical Controls',
             'description' => 'Clear desk rules for papers and removable storage media and clear screen rules for information processing facilities shall be defined and appropriately enforced.',
             'implementation_guidance' => 'Enforce a clear desk policy requiring sensitive documents to be locked away at end of day. Configure workstations to auto-lock after a period of inactivity. Conduct periodic clean desk audits.'],

            ['control_id' => 'A.7.8',  'title' => 'Equipment siting and protection',
             'category' => 'Physical Controls',
             'description' => 'Equipment shall be sited securely and protected.',
             'implementation_guidance' => 'Position servers and critical equipment in locked, access-controlled rooms. Protect equipment from power fluctuations using UPS and surge protectors. Avoid placing equipment in areas accessible to the public.'],

            ['control_id' => 'A.7.9',  'title' => 'Security of assets off-premises',
             'category' => 'Physical Controls',
             'description' => 'Off-site assets shall be protected.',
             'implementation_guidance' => 'Enforce encryption on all portable devices. Define procedures for reporting lost or stolen devices. Require VPN when accessing company data from outside premises. Conduct inventory checks of off-site assets periodically.'],

            ['control_id' => 'A.7.10', 'title' => 'Storage media',
             'category' => 'Physical Controls',
             'description' => 'Storage media shall be managed through its life cycle of acquisition, use, transportation and disposal in accordance with the organisation\'s classification scheme and handling requirements.',
             'implementation_guidance' => 'Maintain an inventory of removable media. Encrypt all removable storage containing sensitive data. Implement a secure disposal procedure (degaussing, shredding, certified destruction) for end-of-life media.'],

            ['control_id' => 'A.7.11', 'title' => 'Supporting utilities',
             'category' => 'Physical Controls',
             'description' => 'Information processing facilities shall be protected from power failures and other disruptions caused by failures in supporting utilities.',
             'implementation_guidance' => 'Install UPS and generators for critical systems. Test utility resilience during business continuity exercises. Monitor power, cooling, and connectivity systems with automated alerts.'],

            ['control_id' => 'A.7.12', 'title' => 'Cabling security',
             'category' => 'Physical Controls',
             'description' => 'Cables carrying power or data or supporting information services shall be protected from interception, interference or damage.',
             'implementation_guidance' => 'Route network and power cables through protected conduits. Label all cables clearly. Conduct periodic inspections for physical tampering or damage to cable infrastructure.'],

            ['control_id' => 'A.7.13', 'title' => 'Equipment maintenance',
             'category' => 'Physical Controls',
             'description' => 'Equipment shall be maintained correctly to ensure availability, integrity and confidentiality of information.',
             'implementation_guidance' => 'Follow manufacturer maintenance schedules. Use authorised personnel for maintenance. Ensure sensitive data is removed before maintenance if equipment leaves a secure area. Document all maintenance activities.'],

            ['control_id' => 'A.7.14', 'title' => 'Secure disposal or re-use of equipment',
             'category' => 'Physical Controls',
             'description' => 'Items of equipment containing storage media shall be verified to ensure that any sensitive data and licensed software has been removed or securely overwritten prior to disposal or re-use.',
             'implementation_guidance' => 'Use certified data destruction tools (DoD 5220.22-M, NIST 800-88) before disposal or re-use. Maintain records of equipment disposal. Use certified asset disposal vendors and obtain destruction certificates.'],

            // ─── THEME A.8: TECHNOLOGICAL CONTROLS (34 controls) ────────────────

            ['control_id' => 'A.8.1',  'title' => 'User end point devices',
             'category' => 'Technological Controls',
             'description' => 'Information stored on, processed by or accessible via user end point devices shall be protected.',
             'implementation_guidance' => 'Deploy endpoint protection (antivirus/EDR) on all devices. Enforce disk encryption on laptops. Implement MDM for mobile devices. Ensure timely patching of endpoint operating systems and applications.'],

            ['control_id' => 'A.8.2',  'title' => 'Privileged access rights',
             'category' => 'Technological Controls',
             'description' => 'The allocation and use of privileged access rights shall be restricted and managed.',
             'implementation_guidance' => 'Implement a PAM (Privileged Access Management) solution. Grant elevated privileges only when needed (JIT access). Audit all privileged account usage. Require MFA for all privileged access.'],

            ['control_id' => 'A.8.3',  'title' => 'Information access restriction',
             'category' => 'Technological Controls',
             'description' => 'Access to information and other associated assets shall be restricted in accordance with the established topic-specific policy on access control.',
             'implementation_guidance' => 'Apply least-privilege access controls. Restrict access to sensitive data based on need-to-know. Use data classification labels to drive access control decisions. Review permissions regularly.'],

            ['control_id' => 'A.8.4',  'title' => 'Access to source code',
             'category' => 'Technological Controls',
             'description' => 'Read and write access to source code, development tools and software libraries shall be appropriately managed.',
             'implementation_guidance' => 'Restrict source code repository access to authorised developers. Use role-based access in version control systems (e.g., Git). Audit access logs for repositories containing sensitive code.'],

            ['control_id' => 'A.8.5',  'title' => 'Secure authentication',
             'category' => 'Technological Controls',
             'description' => 'Secure authentication technologies and procedures shall be implemented based on information access restrictions and the topic-specific policy on access control.',
             'implementation_guidance' => 'Implement MFA for all user accounts, especially administrative and remote access. Enforce strong password policies. Use single sign-on (SSO) where feasible. Disable default and shared accounts.'],

            ['control_id' => 'A.8.6',  'title' => 'Capacity management',
             'category' => 'Technological Controls',
             'description' => 'The use of resources shall be monitored and adjusted in line with current and expected capacity requirements.',
             'implementation_guidance' => 'Monitor resource utilisation (CPU, memory, storage, bandwidth). Set capacity thresholds with alerts. Plan capacity upgrades proactively based on growth trends and business forecasts.'],

            ['control_id' => 'A.8.7',  'title' => 'Protection against malware',
             'category' => 'Technological Controls',
             'description' => 'Protection against malware shall be implemented and supported by appropriate user awareness.',
             'implementation_guidance' => 'Deploy anti-malware solutions on all endpoints and servers. Keep malware signatures updated automatically. Conduct regular scans. Train users to recognise phishing and social engineering attacks.'],

            ['control_id' => 'A.8.8',  'title' => 'Management of technical vulnerabilities',
             'category' => 'Technological Controls',
             'description' => 'Information about technical vulnerabilities of information systems in use shall be obtained in a timely fashion, the organisation\'s exposure to such vulnerabilities shall be evaluated and appropriate measures shall be taken.',
             'implementation_guidance' => 'Implement a vulnerability management programme. Subscribe to vulnerability feeds for used products. Define patching timelines by severity (e.g., critical within 24h). Track remediation to closure.'],

            ['control_id' => 'A.8.9',  'title' => 'Configuration management',
             'category' => 'Technological Controls',
             'description' => 'Configurations, including security configurations, of hardware, software, services and networks shall be established, documented, implemented, monitored and reviewed.',
             'implementation_guidance' => 'Define security baseline configurations for all systems. Use configuration management tools to enforce and detect drift. Document all configuration changes through change management. Review baselines at least annually.'],

            ['control_id' => 'A.8.10', 'title' => 'Information deletion',
             'category' => 'Technological Controls',
             'description' => 'Information stored in information systems, devices or in any other storage media shall be deleted when no longer required.',
             'implementation_guidance' => 'Define data retention periods by data type. Implement automated deletion policies where possible. Use secure deletion methods for sensitive data. Document deletion activities for audit purposes.'],

            ['control_id' => 'A.8.11', 'title' => 'Data masking',
             'category' => 'Technological Controls',
             'description' => 'Data masking shall be used in accordance with the organisation\'s topic-specific policy on access control and other related topic-specific policies, and business requirements, taking applicable legislation into consideration.',
             'implementation_guidance' => 'Apply data masking in non-production environments containing copies of production data. Use tokenisation or pseudonymisation for sensitive fields. Ensure test and development environments do not expose real customer data.'],

            ['control_id' => 'A.8.12', 'title' => 'Data leakage prevention',
             'category' => 'Technological Controls',
             'description' => 'Data leakage prevention measures shall be applied to systems, networks and any other devices that process, store or transmit sensitive information.',
             'implementation_guidance' => 'Deploy DLP tools to monitor and block unauthorised data transfers. Apply DLP policies to email, cloud storage, and removable media. Review DLP alerts and tune policies regularly to reduce false positives.'],

            ['control_id' => 'A.8.13', 'title' => 'Information backup',
             'category' => 'Technological Controls',
             'description' => 'Backup copies of information, software and systems shall be maintained and regularly tested in accordance with the agreed topic-specific policy on backup.',
             'implementation_guidance' => 'Follow the 3-2-1 backup rule (3 copies, 2 media types, 1 offsite). Define RPO and RTO for all critical systems. Test restore procedures at least quarterly. Store backups in secure, access-controlled locations.'],

            ['control_id' => 'A.8.14', 'title' => 'Redundancy of information processing facilities',
             'category' => 'Technological Controls',
             'description' => 'Information processing facilities shall be implemented with redundancy sufficient to meet availability requirements.',
             'implementation_guidance' => 'Implement high-availability architectures for critical systems. Use load balancing and failover clustering. Conduct regular availability tests including simulated failure scenarios.'],

            ['control_id' => 'A.8.15', 'title' => 'Logging',
             'category' => 'Technological Controls',
             'description' => 'Logs that record activities, exceptions, faults and other relevant events shall be produced, stored, protected and analysed.',
             'implementation_guidance' => 'Enable comprehensive logging on all systems (authentication, admin actions, errors). Forward logs to a centralised SIEM. Protect log integrity with write-once storage or digital signatures. Retain logs per regulatory requirements.'],

            ['control_id' => 'A.8.16', 'title' => 'Monitoring activities',
             'category' => 'Technological Controls',
             'description' => 'Networks, systems and applications shall be monitored for anomalous behaviour and appropriate actions taken to evaluate potential information security incidents.',
             'implementation_guidance' => 'Implement continuous monitoring using SIEM/SOC capabilities. Define alerting thresholds for suspicious behaviour. Investigate and document all significant alerts. Review monitoring rules periodically.'],

            ['control_id' => 'A.8.17', 'title' => 'Clock synchronisation',
             'category' => 'Technological Controls',
             'description' => 'The clocks of information processing systems used by the organisation shall be synchronised to approved time sources.',
             'implementation_guidance' => 'Configure all systems to synchronise with authoritative NTP servers. Use a hierarchical NTP configuration. Monitor for clock drift and alert on significant deviations. Accurate timestamps are critical for log correlation.'],

            ['control_id' => 'A.8.18', 'title' => 'Use of privileged utility programs',
             'category' => 'Technological Controls',
             'description' => 'The use of utility programs that might be capable of overriding system and application controls shall be restricted and tightly controlled.',
             'implementation_guidance' => 'Restrict installation and use of system utilities. Require approval for use of privileged tools. Log all use of utility programs. Remove or disable unnecessary utilities from production systems.'],

            ['control_id' => 'A.8.19', 'title' => 'Installation of software on operational systems',
             'category' => 'Technological Controls',
             'description' => 'Procedures and measures shall be implemented to securely manage software installation on operational systems.',
             'implementation_guidance' => 'Use application whitelisting on production servers. Require change management approval for software installations. Restrict users from installing unapproved software. Maintain a software inventory and review regularly.'],

            ['control_id' => 'A.8.20', 'title' => 'Networks security',
             'category' => 'Technological Controls',
             'description' => 'Networks and network devices shall be secured, managed and controlled to protect information in systems and applications.',
             'implementation_guidance' => 'Segment networks using VLANs and firewalls. Restrict traffic between segments using firewall rules. Monitor network traffic for anomalies. Disable unused network services and ports.'],

            ['control_id' => 'A.8.21', 'title' => 'Security of network services',
             'category' => 'Technological Controls',
             'description' => 'Security mechanisms, service levels and service requirements of network services shall be identified, implemented and monitored.',
             'implementation_guidance' => 'Define security requirements for all network services. Include security requirements in service provider agreements. Monitor network service performance and security events. Review service security at least annually.'],

            ['control_id' => 'A.8.22', 'title' => 'Segregation of networks',
             'category' => 'Technological Controls',
             'description' => 'Groups of information services, users and information systems shall be segregated in the organisation\'s networks.',
             'implementation_guidance' => 'Implement network segmentation isolating sensitive systems (e.g., PCI, HR) from general networks. Use DMZ for internet-facing services. Enforce firewall rules between segments. Document network topology and review changes.'],

            ['control_id' => 'A.8.23', 'title' => 'Web filtering',
             'category' => 'Technological Controls',
             'description' => 'Access to external websites shall be managed to reduce exposure to malicious content.',
             'implementation_guidance' => 'Deploy a web proxy or DNS filtering solution. Block known malicious and inappropriate categories. Review and update filtering policies regularly. Log and alert on attempts to access blocked sites.'],

            ['control_id' => 'A.8.24', 'title' => 'Use of cryptography',
             'category' => 'Technological Controls',
             'description' => 'Rules for the effective use of cryptography, including cryptographic key management, shall be defined and implemented.',
             'implementation_guidance' => 'Define a cryptography policy specifying approved algorithms (e.g., AES-256, RSA-2048, TLS 1.2+). Implement key management procedures covering generation, storage, rotation, and revocation. Prohibit use of deprecated algorithms (MD5, SHA-1, DES).'],

            ['control_id' => 'A.8.25', 'title' => 'Secure development life cycle',
             'category' => 'Technological Controls',
             'description' => 'Rules for the secure development of software and systems shall be established and applied.',
             'implementation_guidance' => 'Integrate security into each phase of the SDLC (design, development, testing, deployment). Conduct security design reviews for new applications. Perform code reviews and static analysis as part of the build process.'],

            ['control_id' => 'A.8.26', 'title' => 'Application security requirements',
             'category' => 'Technological Controls',
             'description' => 'Information security requirements shall be identified, specified and approved when developing or acquiring applications.',
             'implementation_guidance' => 'Define security requirements for all applications before development or procurement begins. Use threat modelling to identify application-level risks. Include security acceptance criteria in testing plans.'],

            ['control_id' => 'A.8.27', 'title' => 'Secure system architecture and engineering principles',
             'category' => 'Technological Controls',
             'description' => 'Principles for engineering secure systems shall be established, documented, maintained and applied to any information system development activities.',
             'implementation_guidance' => 'Adopt security-by-design principles such as defence-in-depth, least privilege, and fail-secure defaults. Document architecture security principles. Review architecture of new systems against these principles before deployment.'],

            ['control_id' => 'A.8.28', 'title' => 'Secure coding',
             'category' => 'Technological Controls',
             'description' => 'Secure coding principles shall be applied to software development.',
             'implementation_guidance' => 'Train developers on secure coding standards (e.g., OWASP Top 10, SANS CWE). Use SAST tools in the CI/CD pipeline. Define and enforce a secure coding standard relevant to languages used.'],

            ['control_id' => 'A.8.29', 'title' => 'Security testing in development and acceptance',
             'category' => 'Technological Controls',
             'description' => 'Security testing processes shall be defined and implemented in the development life cycle.',
             'implementation_guidance' => 'Conduct SAST and DAST testing as part of the release pipeline. Perform penetration testing for significant new applications or major changes. Document test results and remediate findings before production deployment.'],

            ['control_id' => 'A.8.30', 'title' => 'Outsourced development',
             'category' => 'Technological Controls',
             'description' => 'The organisation shall direct, monitor and review the activities related to outsourced system development.',
             'implementation_guidance' => 'Include security requirements in outsourced development contracts. Review code quality and security of externally developed code. Conduct security testing on deliverables before acceptance.'],

            ['control_id' => 'A.8.31', 'title' => 'Separation of development, test and production environments',
             'category' => 'Technological Controls',
             'description' => 'Development, testing and production environments shall be separated and secured.',
             'implementation_guidance' => 'Maintain separate environments for development, testing, and production. Prohibit the use of production data in test environments without masking. Restrict access to production environments to authorised operations staff only.'],

            ['control_id' => 'A.8.32', 'title' => 'Change management',
             'category' => 'Technological Controls',
             'description' => 'Changes to information processing facilities and information systems shall be subject to change management procedures.',
             'implementation_guidance' => 'Implement a formal change management process including request, assessment, approval, implementation, and review. Assess security impact of changes before approval. Maintain a change log and conduct post-implementation reviews.'],

            ['control_id' => 'A.8.33', 'title' => 'Test information',
             'category' => 'Technological Controls',
             'description' => 'Test information shall be appropriately selected, protected and managed.',
             'implementation_guidance' => 'Avoid using real personal or sensitive data in test environments. Where production data must be used, apply data masking first. Control access to test data and delete it securely when no longer needed.'],

            ['control_id' => 'A.8.34', 'title' => 'Protection of information systems during audit testing',
             'category' => 'Technological Controls',
             'description' => 'Audit tests and other assurance activities involving assessment of operational systems shall be planned and agreed between the tester and appropriate management.',
             'implementation_guidance' => 'Plan audit activities to minimise disruption to production systems. Use read-only access where possible during audits. Schedule intensive audit tests during off-peak hours. Document scope and obtain formal approval before testing begins.'],
        ];

        $rows = array_map(function ($control) use ($framework) {
            return array_merge($control, [
                'framework_id'  => $framework->id,
                'is_active'     => true,
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);
        }, $controls);

        // Insert in chunks to avoid query size limits
        foreach (array_chunk($rows, 20) as $chunk) {
            DB::table('controls')->insert($chunk);
        }

        $this->command->info('ISO 27001:2022 — ' . count($rows) . ' controls seeded successfully.');
    }
}