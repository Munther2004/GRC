<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OWASPASVSControlsSeeder extends Seeder
{
    public function run(): void
    {
        $framework = DB::table('frameworks')->where('short_name', 'OWASP-ASVS')->first();
        if (!$framework) {
            $this->command->error('OWASP-ASVS framework not found. Run FrameworkSeeder first.');
            return;
        }

        DB::table('controls')->where('framework_id', $framework->id)->delete();

        $controls = [

            // ─── V1: ARCHITECTURE, DESIGN AND THREAT MODELLING ──────────────────
            ['control_id'=>'V1.1.1',  'category'=>'Architecture, Design and Threat Modelling',
             'title'=>'Secure Software Development Lifecycle',
             'description'=>'Verify the use of a secure software development lifecycle that addresses security in all stages of development.',
             'implementation_guidance'=>'Adopt an SSDLC framework. Integrate security reviews at each phase. Assign security champions to development teams. Document security decisions throughout the lifecycle.'],

            ['control_id'=>'V1.1.2',  'category'=>'Architecture, Design and Threat Modelling',
             'title'=>'Threat Modelling',
             'description'=>'Verify that threat modelling is performed for every design change or sprint planning to identify threats, countermeasures and risk.',
             'implementation_guidance'=>'Conduct threat modelling using STRIDE or PASTA methodology. Document identified threats and mitigations. Update threat models when application design changes. Involve developers and security engineers.'],

            ['control_id'=>'V1.1.3',  'category'=>'Architecture, Design and Threat Modelling',
             'title'=>'Security User Stories',
             'description'=>'Verify that all user stories and features contain functional security constraints, such as "as a user, I should be able to view and edit my profile".',
             'implementation_guidance'=>'Include security acceptance criteria in user stories. Define negative test cases for security-relevant stories. Review security requirements at sprint planning.'],

            ['control_id'=>'V1.1.4',  'category'=>'Architecture, Design and Threat Modelling',
             'title'=>'Trust Boundaries Documentation',
             'description'=>'Verify documentation and justification of all trust boundaries, components, and significant data flows in the application.',
             'implementation_guidance'=>'Create and maintain data flow diagrams. Clearly mark trust boundaries and privilege transitions. Review DFDs during threat modelling sessions.'],

            ['control_id'=>'V1.1.5',  'category'=>'Architecture, Design and Threat Modelling',
             'title'=>'High-Level Architecture Definition',
             'description'=>'Verify definition and security analysis of the application\'s high-level architecture and all connected remote services.',
             'implementation_guidance'=>'Document application architecture including all components, APIs, and third-party integrations. Conduct security analysis of architectural decisions. Review architecture before deployment.'],

            ['control_id'=>'V1.1.6',  'category'=>'Architecture, Design and Threat Modelling',
             'title'=>'No Proprietary Security Controls',
             'description'=>'Verify implementation of centralised, simple, vetted, secure, and reusable security controls to avoid duplicate, missing, ineffective, or insecure controls.',
             'implementation_guidance'=>'Use proven security libraries and frameworks. Centralise security functions such as authentication and logging. Avoid implementing custom cryptography. Review security controls for consistency.'],

            ['control_id'=>'V1.2.1',  'category'=>'Architecture, Design and Threat Modelling',
             'title'=>'Unique Credential Architecture',
             'description'=>'Verify the use of unique or special low-privilege operating system accounts for all application components, services, and servers.',
             'implementation_guidance'=>'Run each service under a dedicated service account with minimum required permissions. Avoid running services as root or local system. Document all service accounts and their permissions.'],

            ['control_id'=>'V1.2.2',  'category'=>'Architecture, Design and Threat Modelling',
             'title'=>'Communication Security Between Components',
             'description'=>'Verify that communications between application components, including APIs, middleware, and data layers, are authenticated.',
             'implementation_guidance'=>'Authenticate all inter-service communications using mutual TLS or API keys. Avoid unauthenticated internal calls. Use service mesh or API gateway to enforce authentication between components.'],

            ['control_id'=>'V1.2.3',  'category'=>'Architecture, Design and Threat Modelling',
             'title'=>'Single Verified Authentication Mechanism',
             'description'=>'Verify that the application uses a single vetted authentication mechanism that is known to be secure, can be extended to support strong authentication.',
             'implementation_guidance'=>'Centralise authentication logic in a single service or library. Avoid multiple different authentication implementations. Use well-tested authentication frameworks.'],

            ['control_id'=>'V1.4.1',  'category'=>'Architecture, Design and Threat Modelling',
             'title'=>'Access Control Architecture',
             'description'=>'Verify that trusted enforcement points such as access control gateways, servers, and serverless functions enforce access controls.',
             'implementation_guidance'=>'Implement access control at the server side, not just the client. Use a centralised authorisation service. Apply access control checks consistently across all endpoints.'],

            ['control_id'=>'V1.4.2',  'category'=>'Architecture, Design and Threat Modelling',
             'title'=>'Context-Based Access Control',
             'description'=>'Verify that sensitive data and APIs are protected against insecure direct object reference attacks that target creation, reading, updating, and deletion of records.',
             'implementation_guidance'=>'Validate that users can only access records they are authorised to. Implement object-level authorisation checks. Test all CRUD endpoints for IDOR vulnerabilities.'],

            ['control_id'=>'V1.5.1',  'category'=>'Architecture, Design and Threat Modelling',
             'title'=>'Input and Output Architecture',
             'description'=>'Verify that input and output requirements clearly define how to handle and process data based on type, content, and applicable laws, regulations, and other policy compliance.',
             'implementation_guidance'=>'Document all input and output data types and their handling requirements. Apply input validation and output encoding consistently. Consider regulatory requirements when processing personal data.'],

            ['control_id'=>'V1.6.1',  'category'=>'Architecture, Design and Threat Modelling',
             'title'=>'Cryptographic Architecture',
             'description'=>'Verify there is an explicit policy for management of cryptographic keys and that a cryptographic key lifecycle follows a key management standard.',
             'implementation_guidance'=>'Define a cryptographic policy specifying algorithms, key lengths, and lifecycle procedures. Use a key management system. Document key custodians and approval processes for key operations.'],

            ['control_id'=>'V1.7.1',  'category'=>'Architecture, Design and Threat Modelling',
             'title'=>'Consistent Log Format',
             'description'=>'Verify that a common logging format and approach is used across the system.',
             'implementation_guidance'=>'Define a logging standard specifying required fields (timestamp, user, action, outcome). Implement centralised log aggregation. Use structured log formats (JSON) to facilitate parsing and analysis.'],

            // ─── V2: AUTHENTICATION ──────────────────────────────────────────────
            ['control_id'=>'V2.1.1',  'category'=>'Authentication',
             'title'=>'Password Length',
             'description'=>'Verify that user set passwords are at least 12 characters in length (after combining spaces).',
             'implementation_guidance'=>'Configure minimum password length of at least 12 characters. Display clear guidance to users about password requirements. Implement server-side length validation.'],

            ['control_id'=>'V2.1.2',  'category'=>'Authentication',
             'title'=>'Password Length Maximum',
             'description'=>'Verify that passwords of at least 64 characters are permitted, and that passwords of more than 128 characters are denied.',
             'implementation_guidance'=>'Allow passwords up to 64 characters minimum. Do not truncate passwords before hashing. Enforce a reasonable maximum to prevent denial of service through extremely long inputs.'],

            ['control_id'=>'V2.1.3',  'category'=>'Authentication',
             'title'=>'Password Truncation',
             'description'=>'Verify that password truncation is not performed. However, consecutive multiple spaces may be coalesced.',
             'implementation_guidance'=>'Store and process the full password without truncation. Ensure the hashing function receives the complete password. Test password handling with long passwords.'],

            ['control_id'=>'V2.1.4',  'category'=>'Authentication',
             'title'=>'Unicode Character Support',
             'description'=>'Verify that any printable Unicode character, including language neutral characters such as spaces and emojis are permitted in passwords.',
             'implementation_guidance'=>'Accept all Unicode characters in passwords. Normalise Unicode input before hashing. Test password handling with special characters, spaces, and emoji.'],

            ['control_id'=>'V2.1.5',  'category'=>'Authentication',
             'title'=>'Password Change Functionality',
             'description'=>'Verify users can change their password.',
             'implementation_guidance'=>'Provide a secure password change function. Require entry of current password before change. Immediately invalidate old sessions upon password change.'],

            ['control_id'=>'V2.1.6',  'category'=>'Authentication',
             'title'=>'Password Change Resistance',
             'description'=>'Verify that password change functionality requires the user\'s current and new password.',
             'implementation_guidance'=>'Require current password for all password changes. Enforce new password minimum strength requirements. Log and alert on password changes.'],

            ['control_id'=>'V2.1.7',  'category'=>'Authentication',
             'title'=>'Breached Password Check',
             'description'=>'Verify that passwords submitted during account registration, login, and password change are checked against a set of breached passwords.',
             'implementation_guidance'=>'Integrate with Have I Been Pwned API or maintain a local breached password list. Block registration and password changes using known-breached passwords. Notify users to change passwords found in breach databases.'],

            ['control_id'=>'V2.1.8',  'category'=>'Authentication',
             'title'=>'Password Strength Meter',
             'description'=>'Verify that a password strength meter is provided to help users set a stronger password.',
             'implementation_guidance'=>'Implement a client-side password strength indicator. Guide users toward stronger passwords. Consider using zxcvbn or similar library for realistic strength estimation.'],

            ['control_id'=>'V2.1.9',  'category'=>'Authentication',
             'title'=>'No Password Composition Rules',
             'description'=>'Verify that there are no password composition rules limiting the type of characters permitted.',
             'implementation_guidance'=>'Remove arbitrary character type restrictions (e.g., must contain uppercase). Focus on length and breach-checking instead. Allow all printable characters.'],

            ['control_id'=>'V2.1.10', 'category'=>'Authentication',
             'title'=>'No Periodic Password Rotation',
             'description'=>'Verify that there are no periodic credential rotation or password history requirements.',
             'implementation_guidance'=>'Eliminate mandatory periodic password changes. Only force password reset upon evidence of compromise. Rely on breach detection and MFA instead of rotation policies.'],

            ['control_id'=>'V2.2.1',  'category'=>'Authentication',
             'title'=>'Anti-Automation Controls',
             'description'=>'Verify that anti-automation controls are effective at mitigating breached credential testing, brute force, and account lockout attacks.',
             'implementation_guidance'=>'Implement rate limiting on login endpoints. Use CAPTCHA or proof-of-work challenges after repeated failures. Implement account lockout with notification to the account owner.'],

            ['control_id'=>'V2.2.2',  'category'=>'Authentication',
             'title'=>'Weak Authentication Not Available',
             'description'=>'Verify that the use of weak authenticators (such as SMS and email) can be substituted for stronger authenticators when available.',
             'implementation_guidance'=>'Provide TOTP or hardware token options. Allow and encourage users to upgrade from SMS-based MFA to app-based or hardware authenticators.'],

            ['control_id'=>'V2.2.3',  'category'=>'Authentication',
             'title'=>'Secure Notification on Credential Changes',
             'description'=>'Verify that secure notifications are sent to users after updates to authentication details such as credential resets, email changes, or enabling MFA.',
             'implementation_guidance'=>'Send notification emails to the old address on email changes. Notify users of password resets and MFA changes immediately. Include guidance on what to do if the change was not authorised.'],

            ['control_id'=>'V2.3.1',  'category'=>'Authentication',
             'title'=>'Initial Password Strength',
             'description'=>'Verify that system generated initial passwords or activation codes are at least 6 characters long, may contain letters and numbers, and expire after a short period of time.',
             'implementation_guidance'=>'Generate cryptographically random initial passwords of at least 12 characters. Require immediate change on first login. Set short expiry (24 hours) on activation links and temporary passwords.'],

            ['control_id'=>'V2.4.1',  'category'=>'Authentication',
             'title'=>'Password Hashing',
             'description'=>'Verify that passwords are stored using an approved adaptive and salted hashing algorithm with a work factor sufficient to prevent brute force attacks.',
             'implementation_guidance'=>'Use bcrypt, scrypt, Argon2id, or PBKDF2 for password storage. Configure appropriate work factors (bcrypt cost ≥ 10). Never store passwords in plaintext, reversible encryption, or unsalted hashes.'],

            ['control_id'=>'V2.5.1',  'category'=>'Authentication',
             'title'=>'Initial Credential Recovery',
             'description'=>'Verify that a system generated activation or recovery secret is not sent in clear text to the user.',
             'implementation_guidance'=>'Send password reset links via HTTPS only. Use single-use, time-limited tokens. Never send passwords in emails. Invalidate tokens after use.'],

            ['control_id'=>'V2.5.2',  'category'=>'Authentication',
             'title'=>'No Password Hints',
             'description'=>'Verify that password hints or knowledge-based authentication (KBA) are not present.',
             'implementation_guidance'=>'Remove password hints from login and registration forms. Do not implement knowledge-based security questions. Use out-of-band verification for account recovery instead.'],

            ['control_id'=>'V2.5.3',  'category'=>'Authentication',
             'title'=>'No Default Credentials',
             'description'=>'Verify that password credential recovery does not reveal the current password in any way.',
             'implementation_guidance'=>'Never include the current password in recovery emails. Only send password reset links. Force a new password selection; do not auto-generate and send a new password.'],

            ['control_id'=>'V2.6.1',  'category'=>'Authentication',
             'title'=>'OTP Lookup Secret Security',
             'description'=>'Verify that lookup secrets can only be used once.',
             'implementation_guidance'=>'Mark lookup codes as used immediately upon validation. Prevent replay attacks by enforcing single-use. Store hashed versions of lookup secrets.'],

            ['control_id'=>'V2.7.1',  'category'=>'Authentication',
             'title'=>'OTP Out-of-Band Verifier Security',
             'description'=>'Verify that clear text out of band (NIST "restricted") authenticators are not offered by default and that stronger alternatives are offered first.',
             'implementation_guidance'=>'Default to authenticator app or hardware token options. Offer SMS only as a fallback. Warn users of the reduced security of SMS-based authentication.'],

            ['control_id'=>'V2.8.1',  'category'=>'Authentication',
             'title'=>'Time-based OTP',
             'description'=>'Verify that time-based OTPs have a defined lifetime before expiring.',
             'implementation_guidance'=>'Use TOTP with 30-second windows. Implement a maximum of 1-2 time-step tolerance. Reject OTPs outside the acceptable time window.'],

            ['control_id'=>'V2.9.1',  'category'=>'Authentication',
             'title'=>'Cryptographic Authenticator Security',
             'description'=>'Verify that cryptographic keys used in verification are stored securely and protected against disclosure such as using a TPM or HSM.',
             'implementation_guidance'=>'Store cryptographic keys in hardware-backed secure storage (TPM, HSM, or secure enclave). Restrict access to keys. Implement key rotation procedures.'],

            ['control_id'=>'V2.10.1', 'category'=>'Authentication',
             'title'=>'Service Authentication Credentials',
             'description'=>'Verify that integration secrets do not rely on unchanging credentials such as passwords, API keys, or shared accounts with privileged access.',
             'implementation_guidance'=>'Use short-lived tokens or certificates for service authentication. Implement secrets rotation. Store secrets in a secrets management system (e.g., HashiCorp Vault). Never hardcode credentials.'],

            // ─── V3: SESSION MANAGEMENT ──────────────────────────────────────────
            ['control_id'=>'V3.1.1',  'category'=>'Session Management',
             'title'=>'No Exposed Session Tokens in URLs',
             'description'=>'Verify the application never reveals session tokens in URL parameters.',
             'implementation_guidance'=>'Use cookies for session token storage. Never include session IDs in URLs or query strings. Ensure logging does not capture session tokens from URLs.'],

            ['control_id'=>'V3.2.1',  'category'=>'Session Management',
             'title'=>'New Session Token on Authentication',
             'description'=>'Verify the application generates a new session token on user authentication.',
             'implementation_guidance'=>'Regenerate session ID after successful authentication. Invalidate and replace the pre-login session token. Test for session fixation vulnerabilities.'],

            ['control_id'=>'V3.2.2',  'category'=>'Session Management',
             'title'=>'Session Token Randomness',
             'description'=>'Verify that session tokens possess at least 64 bits of entropy.',
             'implementation_guidance'=>'Use cryptographically secure random number generators for session tokens. Ensure token entropy is at least 128 bits. Avoid predictable token generation algorithms.'],

            ['control_id'=>'V3.2.3',  'category'=>'Session Management',
             'title'=>'Secure Cookie Attributes',
             'description'=>'Verify the application only stores session tokens in the browser using secure methods.',
             'implementation_guidance'=>'Set Secure, HttpOnly, and SameSite attributes on all session cookies. Use __Host- prefix for additional cookie security. Do not store sensitive data in localStorage or sessionStorage.'],

            ['control_id'=>'V3.3.1',  'category'=>'Session Management',
             'title'=>'Logout Terminates Session',
             'description'=>'Verify that logout invalidates the session token so the back button or a downstream relying party does not resume an authenticated session.',
             'implementation_guidance'=>'Invalidate session tokens server-side on logout. Clear session cookies. Implement logout across all tabs and devices where possible. Test that session is truly terminated after logout.'],

            ['control_id'=>'V3.3.2',  'category'=>'Session Management',
             'title'=>'Session Timeout',
             'description'=>'Verify that sessions expire after a period of inactivity.',
             'implementation_guidance'=>'Configure session inactivity timeout (15-30 minutes for sensitive applications). Implement absolute session timeout. Notify users before session expiry with option to extend.'],

            ['control_id'=>'V3.4.1',  'category'=>'Session Management',
             'title'=>'Cookie-Based Session Token Security',
             'description'=>'Verify that cookie-based session tokens have the SameSite attribute to limit exposure to cross-site request forgery attacks.',
             'implementation_guidance'=>'Set SameSite=Strict or SameSite=Lax on all session cookies. Test CSRF protection in all state-changing requests. Use SameSite alongside CSRF tokens for defence in depth.'],

            ['control_id'=>'V3.5.1',  'category'=>'Session Management',
             'title'=>'Token-Based Session Security',
             'description'=>'Verify that OAuth and refresh tokens are invalidated on logout and token refresh.',
             'implementation_guidance'=>'Invalidate refresh tokens on logout. Implement token revocation endpoints. Maintain a token blacklist or use short-lived tokens to reduce revocation complexity.'],

            ['control_id'=>'V3.6.1',  'category'=>'Session Management',
             'title'=>'Federated Re-Authentication',
             'description'=>'Verify that relying parties specify the maximum authentication time to CSPs and that CSPs re-authenticate the user when the maximum time is exceeded.',
             'implementation_guidance'=>'Configure max_age or prompt=login in OIDC flows. Validate that re-authentication occurs when session age exceeds policy limits. Test federated session handling thoroughly.'],

            // ─── V4: ACCESS CONTROL ──────────────────────────────────────────────
            ['control_id'=>'V4.1.1',  'category'=>'Access Control',
             'title'=>'Least Privilege Principle',
             'description'=>'Verify that the principle of least privilege exists: users should only be able to access functions, data files, URLs, controllers, services, and other resources for which they have been authorised.',
             'implementation_guidance'=>'Implement RBAC or ABAC. Grant minimum permissions required for each role. Review and right-size permissions regularly. Test for privilege escalation vulnerabilities.'],

            ['control_id'=>'V4.1.2',  'category'=>'Access Control',
             'title'=>'Deny by Default',
             'description'=>'Verify that access controls fail securely including when an exception occurs.',
             'implementation_guidance'=>'Implement deny-by-default access control. Ensure exceptions do not grant access. Test error paths for access control failures. Review all error handling code for access control bypass risks.'],

            ['control_id'=>'V4.1.3',  'category'=>'Access Control',
             'title'=>'Single Access Control Mechanism',
             'description'=>'Verify that a single and well-vetted access control mechanism is used for accessing protected data and resources.',
             'implementation_guidance'=>'Centralise access control logic. Avoid duplicating authorisation checks across multiple locations. Use a shared authorisation service or middleware.'],

            ['control_id'=>'V4.2.1',  'category'=>'Access Control',
             'title'=>'IDOR Protection',
             'description'=>'Verify that sensitive data and APIs are protected against insecure direct object reference attacks targeting creation, reading, updating, and deletion of records.',
             'implementation_guidance'=>'Implement object-level authorisation checks for all CRUD operations. Use indirect references (e.g., GUIDs) rather than sequential integers. Test all endpoints for IDOR vulnerabilities systematically.'],

            ['control_id'=>'V4.2.2',  'category'=>'Access Control',
             'title'=>'Directory Traversal Prevention',
             'description'=>'Verify that the application or framework enforces a strong anti-CSRF mechanism to protect authenticated functionality.',
             'implementation_guidance'=>'Implement CSRF tokens in all state-changing forms and AJAX requests. Use SameSite cookies as an additional layer. Validate CSRF tokens server-side on every state-changing request.'],

            ['control_id'=>'V4.3.1',  'category'=>'Access Control',
             'title'=>'Administrative Interface Security',
             'description'=>'Verify administrative interfaces use appropriate multi-factor authentication to prevent unauthorised use.',
             'implementation_guidance'=>'Require MFA for all access to administrative interfaces. Restrict admin access to trusted IP ranges where feasible. Implement additional logging and alerting for admin actions.'],

            // ─── V5: VALIDATION, SANITISATION, AND ENCODING ─────────────────────
            ['control_id'=>'V5.1.1',  'category'=>'Validation, Sanitisation and Encoding',
             'title'=>'HTTP Parameter Pollution Prevention',
             'description'=>'Verify that the application has defences against HTTP parameter pollution attacks.',
             'implementation_guidance'=>'Define expected parameters for each request. Reject or log requests with unexpected or duplicate parameters. Use a framework that handles parameter parsing securely.'],

            ['control_id'=>'V5.1.2',  'category'=>'Validation, Sanitisation and Encoding',
             'title'=>'Framework-Level Input Validation',
             'description'=>'Verify that frameworks protect against mass parameter assignment attacks.',
             'implementation_guidance'=>'Use allowlists to specify which parameters are accepted for each operation. Implement strong typing. Protect against mass assignment by explicitly defining accepted fields.'],

            ['control_id'=>'V5.1.3',  'category'=>'Validation, Sanitisation and Encoding',
             'title'=>'Positive Input Validation',
             'description'=>'Verify that all input (HTML form fields, REST requests, URL parameters, HTTP headers, cookies, batch files, RSS feeds, etc.) is validated using positive (allowlist) validation.',
             'implementation_guidance'=>'Apply allowlist validation for all inputs. Define expected formats, lengths, and character sets. Reject inputs that do not match the expected pattern rather than sanitising malicious input.'],

            ['control_id'=>'V5.2.1',  'category'=>'Validation, Sanitisation and Encoding',
             'title'=>'Sanitise HTML Output',
             'description'=>'Verify that all untrusted HTML input from WYSIWYG editors or similar is properly sanitised with an HTML sanitiser library.',
             'implementation_guidance'=>'Use a trusted HTML sanitisation library (e.g., DOMPurify). Apply sanitisation to all user-supplied HTML content before storage or rendering. Test sanitisation with XSS payloads.'],

            ['control_id'=>'V5.3.1',  'category'=>'Validation, Sanitisation and Encoding',
             'title'=>'Output Encoding',
             'description'=>'Verify that output encoding is relevant for the interpreter and context required. For example, use encoders specifically for HTML values, HTML attributes, JavaScript, URL parameters, HTTP headers, SMTP, and others as the context requires.',
             'implementation_guidance'=>'Apply context-sensitive output encoding. Use the templating engine\'s auto-escaping features. Never trust raw user input in dynamic content. Test for XSS vulnerabilities in all output contexts.'],

            ['control_id'=>'V5.3.4',  'category'=>'Validation, Sanitisation and Encoding',
             'title'=>'SQL Injection Prevention',
             'description'=>'Verify that data selection or database queries (e.g., SQL, HQL, ORM, NoSQL) use parameterised queries, ORMs, entity frameworks or are otherwise protected from SQL injection attacks.',
             'implementation_guidance'=>'Use parameterised queries or prepared statements for all database queries. Use ORM frameworks correctly. Never concatenate user input into SQL strings. Test all database-interacting endpoints with SQLi payloads.'],

            ['control_id'=>'V5.3.5',  'category'=>'Validation, Sanitisation and Encoding',
             'title'=>'Injection Prevention',
             'description'=>'Verify that where parameterised or safer mechanisms are not present, context-specific output encoding is used to protect against injection attacks, such as SQL escaping.',
             'implementation_guidance'=>'Apply context-specific escaping for all injection contexts (SQL, LDAP, OS command, XML). Use vetted escaping libraries. Prefer structural approaches (parameterisation) over escaping where possible.'],

            ['control_id'=>'V5.3.8',  'category'=>'Validation, Sanitisation and Encoding',
             'title'=>'OS Command Injection Prevention',
             'description'=>'Verify that the application protects against OS command injection and that operating system calls use parameterised OS queries or use contextual command line output encoding.',
             'implementation_guidance'=>'Avoid OS command execution from user-supplied input. If necessary, use allowlists to validate input and parameterised calls. Never pass untrusted data to shell commands.'],

            ['control_id'=>'V5.4.1',  'category'=>'Validation, Sanitisation and Encoding',
             'title'=>'Memory-Safe Functions',
             'description'=>'Verify that the application uses a memory-safe string, safer memory copy and pointer arithmetic to detect or prevent stack, buffer, or heap overflows.',
             'implementation_guidance'=>'Use memory-safe programming languages or safe string handling libraries. Enable compiler protections (ASLR, stack canaries). Conduct fuzz testing on input parsing routines.'],

            // ─── V6: STORED CRYPTOGRAPHY ─────────────────────────────────────────
            ['control_id'=>'V6.1.1',  'category'=>'Stored Cryptography',
             'title'=>'Data Classification',
             'description'=>'Verify that regulated private data is stored encrypted while at rest, such as Personally Identifiable Information (PII), sensitive personal information, or data assessed likely to be subject to EU GDPR.',
             'implementation_guidance'=>'Identify and classify all sensitive data. Apply encryption at rest using AES-256 for regulated data. Manage encryption keys separately from encrypted data.'],

            ['control_id'=>'V6.2.1',  'category'=>'Stored Cryptography',
             'title'=>'Approved Cryptographic Algorithms',
             'description'=>'Verify that all cryptographic modules fail securely, and errors are handled in a way that does not enable Padding Oracle attacks.',
             'implementation_guidance'=>'Use authenticated encryption (AES-GCM, ChaCha20-Poly1305). Handle cryptographic errors securely without revealing padding or timing information. Test for padding oracle vulnerabilities.'],

            ['control_id'=>'V6.2.2',  'category'=>'Stored Cryptography',
             'title'=>'Cryptographic Algorithm Standards',
             'description'=>'Verify that industry proven or government approved cryptographic algorithms, modes, and libraries are used, instead of custom coded cryptography.',
             'implementation_guidance'=>'Use only NIST-approved or widely vetted algorithms (AES, RSA, ECDH, SHA-256+). Never implement custom cryptographic algorithms. Regularly review algorithm choices against current guidance.'],

            ['control_id'=>'V6.2.3',  'category'=>'Stored Cryptography',
             'title'=>'Encryption Initialization',
             'description'=>'Verify that encryption initialisation vector, cipher configuration, and block modes are configured securely using the latest advice.',
             'implementation_guidance'=>'Use random, unpredictable IVs of the correct length for each encryption operation. Use GCM mode for authenticated encryption. Never reuse IVs with the same key.'],

            ['control_id'=>'V6.2.5',  'category'=>'Stored Cryptography',
             'title'=>'Secure Random Number Generation',
             'description'=>'Verify that known insecure block modes (i.e. ECB, etc.), padding modes, insecure ciphers (such as Triple DES, Blowfish, etc.) are not used.',
             'implementation_guidance'=>'Use cryptographically secure pseudo-random number generators (CSPRNG). Avoid ECB mode for block ciphers. Prohibit deprecated algorithms (3DES, RC4, Blowfish).'],

            ['control_id'=>'V6.3.1',  'category'=>'Stored Cryptography',
             'title'=>'Random Value Generation',
             'description'=>'Verify that all random numbers, random file names, random GUIDs, and random strings are generated using the cryptographic module\'s approved cryptographically secure random number generator.',
             'implementation_guidance'=>'Use OS-provided CSPRNG (e.g., /dev/urandom, CryptGenRandom). Use language-level secure random functions (e.g., secrets module in Python). Never use Math.random() or equivalent for security-sensitive values.'],

            // ─── V7: ERROR HANDLING AND LOGGING ──────────────────────────────────
            ['control_id'=>'V7.1.1',  'category'=>'Error Handling and Logging',
             'title'=>'No Credentials in Logs',
             'description'=>'Verify that the application does not log credentials or payment details. Session tokens should only be stored in logs in an irreversible, hashed form.',
             'implementation_guidance'=>'Implement log sanitisation to strip credentials, tokens, and payment details. Define a list of sensitive fields that must never be logged. Review log output regularly for accidental sensitive data disclosure.'],

            ['control_id'=>'V7.1.2',  'category'=>'Error Handling and Logging',
             'title'=>'No PII in Logs',
             'description'=>'Verify that the application does not log other sensitive data as defined under local privacy laws or relevant security policy.',
             'implementation_guidance'=>'Define which personal data fields are prohibited from logging. Apply log masking or redaction. Conduct periodic log reviews for PII leakage.'],

            ['control_id'=>'V7.2.1',  'category'=>'Error Handling and Logging',
             'title'=>'Logging Sufficient for Investigation',
             'description'=>'Verify that all authentication decisions can be logged, without storing sensitive session tokens or passwords. This should include requests with relevant metadata needed for security investigations.',
             'implementation_guidance'=>'Log authentication attempts (success and failure) with user ID, timestamp, source IP, and outcome. Ensure logs are sufficient to reconstruct the sequence of events in an incident.'],

            ['control_id'=>'V7.2.2',  'category'=>'Error Handling and Logging',
             'title'=>'Audit Log Events',
             'description'=>'Verify that all access control decisions can be logged and all failed decisions are logged. This should include requests with relevant metadata needed for security investigations.',
             'implementation_guidance'=>'Log all authorisation decisions including denials. Include sufficient context in log entries. Forward logs to a centralised SIEM with tamper protection.'],

            ['control_id'=>'V7.3.1',  'category'=>'Error Handling and Logging',
             'title'=>'Log Injection Prevention',
             'description'=>'Verify that the application appropriately encodes user-supplied data to prevent log injection.',
             'implementation_guidance'=>'Sanitise user input before including in log entries. Escape or remove newlines and special characters. Use structured logging formats to prevent injection.'],

            ['control_id'=>'V7.4.1',  'category'=>'Error Handling and Logging',
             'title'=>'Generic Error Messages',
             'description'=>'Verify that a generic message is shown when an unexpected or security sensitive error occurs, potentially with a unique ID which support personnel can use to investigate.',
             'implementation_guidance'=>'Display generic error messages to users. Log detailed error information server-side with a correlation ID. Allow users to report errors using the correlation ID without exposing sensitive details.'],

            // ─── V8: DATA PROTECTION ─────────────────────────────────────────────
            ['control_id'=>'V8.1.1',  'category'=>'Data Protection',
             'title'=>'Sensitive Data Not Cached',
             'description'=>'Verify that the application protects sensitive data from being cached in server components such as load balancers and application caches.',
             'implementation_guidance'=>'Set Cache-Control: no-store headers on responses containing sensitive data. Avoid caching authenticated responses at the proxy or CDN layer. Test caching behaviour in staging environments.'],

            ['control_id'=>'V8.2.1',  'category'=>'Data Protection',
             'title'=>'Anti-Caching Headers',
             'description'=>'Verify that all cached or temporary copies of sensitive data stored on the server are protected from unauthorised access or purged/invalidated after the authorised user accesses the sensitive data.',
             'implementation_guidance'=>'Implement cache invalidation on logout and session expiry. Apply no-cache headers for sensitive pages. Verify that server-side caches are access-controlled.'],

            ['control_id'=>'V8.3.1',  'category'=>'Data Protection',
             'title'=>'Sensitive Data Transmission Protection',
             'description'=>'Verify that sensitive data is sent to the server in the HTTP message body or headers, and that query string parameters from any HTTP verb do not contain sensitive data.',
             'implementation_guidance'=>'Never include sensitive data (passwords, tokens, PII) in URL query strings. Send sensitive data in POST request bodies or headers. Ensure server-side logging does not capture query parameters from sensitive operations.'],

            ['control_id'=>'V8.3.4',  'category'=>'Data Protection',
             'title'=>'Minimum Data Exposure',
             'description'=>'Verify that all sensitive data created and processed by the application has been identified, and ensure that a policy exists on how to deal with sensitive data.',
             'implementation_guidance'=>'Conduct a data inventory identifying all sensitive data processed by the application. Define handling requirements for each data type. Apply principle of data minimisation — collect only what is needed.'],

            // ─── V9: COMMUNICATION ───────────────────────────────────────────────
            ['control_id'=>'V9.1.1',  'category'=>'Communication Security',
             'title'=>'TLS Required for All Communications',
             'description'=>'Verify that TLS is used for all client connectivity, and does not fall back to insecure or unencrypted communications.',
             'implementation_guidance'=>'Enforce HTTPS for all application endpoints. Implement HSTS with a long max-age. Redirect all HTTP requests to HTTPS. Disable TLS 1.0 and 1.1.'],

            ['control_id'=>'V9.1.2',  'category'=>'Communication Security',
             'title'=>'Up-to-Date TLS Configuration',
             'description'=>'Verify using up-to-date TLS testing tools that only strong cipher suites are enabled, with the strongest cipher suites set as preferred.',
             'implementation_guidance'=>'Configure TLS 1.2 or higher. Use strong cipher suites (ECDHE with AES-GCM). Disable RC4, 3DES, and NULL ciphers. Test TLS configuration using SSL Labs or similar tools.'],

            ['control_id'=>'V9.1.3',  'category'=>'Communication Security',
             'title'=>'Old TLS Versions Disabled',
             'description'=>'Verify that old versions of SSL and TLS protocols, algorithms, ciphers, and configuration are disabled.',
             'implementation_guidance'=>'Disable SSLv2, SSLv3, TLS 1.0, and TLS 1.1. Remove support for weak cipher suites. Review and update TLS configuration at least annually. Monitor for new vulnerabilities in current TLS versions.'],

            ['control_id'=>'V9.2.1',  'category'=>'Communication Security',
             'title'=>'Certificate Validation',
             'description'=>'Verify that connections to and from the server use trusted TLS certificates. Where internally generated or self-signed certificates are used, the server must be configured to only trust specific internal CAs.',
             'implementation_guidance'=>'Use certificates from trusted public CAs for production. Implement certificate pinning for high-security communications. Validate certificate chain fully. Alert on certificate expiry at least 30 days in advance.'],

            // ─── V10: MALICIOUS CODE ─────────────────────────────────────────────
            ['control_id'=>'V10.1.1', 'category'=>'Malicious Code',
             'title'=>'Code Integrity Controls',
             'description'=>'Verify that a code analysis tool is in use that can detect potentially malicious code, such as time functions, unsafe file operations and network connections.',
             'implementation_guidance'=>'Integrate SAST tools in the CI/CD pipeline. Review SAST findings before merging code. Include detection rules for dangerous function usage.'],

            ['control_id'=>'V10.2.1', 'category'=>'Malicious Code',
             'title'=>'Malicious Code Search',
             'description'=>'Verify that the application source code and third party libraries do not contain back doors, Easter eggs, or logic bombs.',
             'implementation_guidance'=>'Conduct code reviews with security focus. Use software composition analysis (SCA) tools to identify known vulnerabilities in dependencies. Review third-party library code for unusual network connections or file operations.'],

            ['control_id'=>'V10.3.1', 'category'=>'Malicious Code',
             'title'=>'Application Integrity Verification',
             'description'=>'Verify that if the application has a client or server auto-update feature, updates should be obtained over secure channels and digitally signed.',
             'implementation_guidance'=>'Sign all application updates using code signing certificates. Verify signatures before applying updates. Deliver updates over HTTPS. Implement rollback capability for failed updates.'],

            // ─── V11: BUSINESS LOGIC ─────────────────────────────────────────────
            ['control_id'=>'V11.1.1', 'category'=>'Business Logic',
             'title'=>'Business Logic Flows',
             'description'=>'Verify that the application will only process business logic flows for the same user in sequential step order and without skipping steps.',
             'implementation_guidance'=>'Enforce sequential workflow steps server-side. Validate state transitions. Test for workflow bypass vulnerabilities. Log and alert on unexpected step transitions.'],

            ['control_id'=>'V11.1.2', 'category'=>'Business Logic',
             'title'=>'Business Logic Limits',
             'description'=>'Verify that the application has business limits and correctly enforces customised business limits and logic requirements.',
             'implementation_guidance'=>'Define and enforce business limits (e.g., transaction limits, rate limits). Validate limits server-side. Alert on attempts to exceed limits. Review limits regularly against business requirements.'],

            ['control_id'=>'V11.1.4', 'category'=>'Business Logic',
             'title'=>'Business Logic Anti-Automation',
             'description'=>'Verify that the application has sufficient anti-automation controls to detect and protect against data exfiltration, excessive business logic requests, excessive file uploads or denial of service attacks.',
             'implementation_guidance'=>'Implement rate limiting on all business logic endpoints. Use CAPTCHA for high-value operations. Monitor for unusual usage patterns. Alert on activity exceeding defined thresholds.'],

            // ─── V12: FILE AND RESOURCE ──────────────────────────────────────────
            ['control_id'=>'V12.1.1', 'category'=>'File and Resource',
             'title'=>'File Upload Size Limits',
             'description'=>'Verify that the application will not accept large files that could fill up storage or cause a denial of service.',
             'implementation_guidance'=>'Enforce file size limits at the application and web server level. Return informative error messages for oversized files. Monitor storage usage and alert when nearing capacity.'],

            ['control_id'=>'V12.2.1', 'category'=>'File and Resource',
             'title'=>'File Validation',
             'description'=>'Verify that files obtained from untrusted sources are validated to be of expected type based on the file\'s content.',
             'implementation_guidance'=>'Validate file type by content (magic bytes), not just extension. Use server-side validation. Reject files with mismatched content types and extensions.'],

            ['control_id'=>'V12.3.1', 'category'=>'File and Resource',
             'title'=>'File Execution Prevention',
             'description'=>'Verify that user-submitted filename metadata is not used directly by system or framework filesystems and that a URL API is used to protect against path traversal.',
             'implementation_guidance'=>'Sanitise file names before storage. Use randomly generated file names. Validate file paths against a whitelist. Store uploaded files outside the web root.'],

            ['control_id'=>'V12.4.1', 'category'=>'File and Resource',
             'title'=>'Secure File Storage',
             'description'=>'Verify that files obtained from untrusted sources are stored outside the web root, with limited permissions.',
             'implementation_guidance'=>'Store uploaded files in a dedicated directory outside the web root. Apply restrictive file permissions. Serve files through the application, not directly. Scan uploaded files for malware.'],

            ['control_id'=>'V12.5.1', 'category'=>'File and Resource',
             'title'=>'Prevent Remote File Inclusion',
             'description'=>'Verify that the web tier is configured to serve only files with specific file extensions to prevent unintentional information and source code leakage.',
             'implementation_guidance'=>'Configure the web server to only serve files with allowed extensions. Block access to configuration files, source code, and hidden files. Test for path traversal and file inclusion vulnerabilities.'],

            // ─── V13: API AND WEB SERVICE ─────────────────────────────────────────
            ['control_id'=>'V13.1.1', 'category'=>'API and Web Service',
             'title'=>'API Security Best Practices',
             'description'=>'Verify that all application components use the same encodings and parsers to avoid parsing attacks that exploit different URI or file parsing behaviour.',
             'implementation_guidance'=>'Standardise encoding and parsing across all application components. Use consistent URL parsing libraries. Test for inconsistencies that could be exploited.'],

            ['control_id'=>'V13.1.2', 'category'=>'API and Web Service',
             'title'=>'Access Control Lists for APIs',
             'description'=>'Verify that access to administration and management functions is limited to authorised administrators.',
             'implementation_guidance'=>'Restrict management API endpoints to admin roles. Apply IP allowlisting for management interfaces where feasible. Implement separate authentication for management functions.'],

            ['control_id'=>'V13.2.1', 'category'=>'API and Web Service',
             'title'=>'RESTful Verbs',
             'description'=>'Verify that enabled RESTful HTTP methods are a valid choice for the user or action, such that normal users cannot use DELETE or PUT on protected API endpoints.',
             'implementation_guidance'=>'Enforce HTTP verb restrictions per endpoint. Return 405 Method Not Allowed for disallowed verbs. Test all endpoints with all HTTP methods to detect unexpected behaviour.'],

            ['control_id'=>'V13.2.2', 'category'=>'API and Web Service',
             'title'=>'JSON Schema Validation',
             'description'=>'Verify that JSON schema validation is in place and verified before accepting input.',
             'implementation_guidance'=>'Define and enforce JSON schemas for all API request bodies. Return descriptive validation errors on schema violations. Use a maintained JSON schema validation library.'],

            ['control_id'=>'V13.3.1', 'category'=>'API and Web Service',
             'title'=>'XML Input Validation',
             'description'=>'Verify that XML parsing is not vulnerable to XML eXternal Entity (XXE) attacks.',
             'implementation_guidance'=>'Disable external entity processing in XML parsers. Use safe XML parser configurations. Test all XML inputs for XXE vulnerabilities.'],

            ['control_id'=>'V13.4.1', 'category'=>'API and Web Service',
             'title'=>'GraphQL Introspection',
             'description'=>'Verify that query allowlists or a combination of depth limiting and amount limiting should be used to prevent GraphQL or data layer expression denial of service (DoS).',
             'implementation_guidance'=>'Implement depth and complexity limits for GraphQL queries. Disable introspection in production. Use persisted queries where appropriate.'],

            // ─── V14: CONFIGURATION ──────────────────────────────────────────────
            ['control_id'=>'V14.1.1', 'category'=>'Configuration',
             'title'=>'Separate Build and Deployment Environments',
             'description'=>'Verify that build and deployment processes are performed in a secure manner to prevent the introduction of vulnerabilities.',
             'implementation_guidance'=>'Use separate environments for development, testing, and production. Automate deployments through CI/CD pipelines with security gates. Audit deployment processes regularly.'],

            ['control_id'=>'V14.1.2', 'category'=>'Configuration',
             'title'=>'Compiler Security Flags',
             'description'=>'Verify that compiler flags are configured to enable all available buffer overflow protections and warnings.',
             'implementation_guidance'=>'Enable stack canaries, ASLR, and NX bit protections. Use compiler flags such as -fstack-protector-all and -D_FORTIFY_SOURCE. Verify binary protections in build pipeline.'],

            ['control_id'=>'V14.2.1', 'category'=>'Configuration',
             'title'=>'Up-to-Date Components',
             'description'=>'Verify that all components are up to date, preferably using a dependency checker during build or compile time.',
             'implementation_guidance'=>'Integrate SCA tools (OWASP Dependency Check, Snyk) into CI/CD. Define policies for updating components with known vulnerabilities. Track dependency versions and subscribe to vulnerability advisories.'],

            ['control_id'=>'V14.2.2', 'category'=>'Configuration',
             'title'=>'No Unnecessary Features',
             'description'=>'Verify that all unneeded features, documentation, sample applications, and configurations are removed.',
             'implementation_guidance'=>'Remove default sample applications, readme files, and test accounts before production. Disable or remove all unused features and endpoints. Verify configuration hardening against a baseline checklist.'],

            ['control_id'=>'V14.3.1', 'category'=>'Configuration',
             'title'=>'Server Error Disclosure Prevention',
             'description'=>'Verify that web or application server and application framework error messages are configured to deliver user actionable, customised responses to eliminate any unintended security disclosures.',
             'implementation_guidance'=>'Configure custom error pages for all HTTP error codes. Suppress stack traces and debug information in production. Test all error conditions to verify no sensitive information is disclosed.'],

            ['control_id'=>'V14.4.1', 'category'=>'Configuration',
             'title'=>'HTTP Security Headers',
             'description'=>'Verify that every HTTP response contains a Content-Type header, and that the specified Content-Type matches the actual content of the response.',
             'implementation_guidance'=>'Set Content-Type headers on all responses. Implement X-Content-Type-Options: nosniff. Add X-Frame-Options, X-XSS-Protection, and Content-Security-Policy headers.'],

            ['control_id'=>'V14.4.2', 'category'=>'Configuration',
             'title'=>'Content-Type Header',
             'description'=>'Verify that all API responses contain Content-Disposition: attachment; filename="api.json" (or other appropriate filename for the content type).',
             'implementation_guidance'=>'Set appropriate Content-Disposition headers on API responses. Ensure file downloads always have content-disposition set. Prevent MIME type sniffing attacks.'],

            ['control_id'=>'V14.4.5', 'category'=>'Configuration',
             'title'=>'HSTS Header',
             'description'=>'Verify that a Strict-Transport-Security header is included on all responses and for all subdomains.',
             'implementation_guidance'=>'Set Strict-Transport-Security with max-age of at least 1 year. Include includeSubDomains directive. Consider preloading the domain in browser HSTS preload lists.'],

            ['control_id'=>'V14.4.6', 'category'=>'Configuration',
             'title'=>'Referrer-Policy Header',
             'description'=>'Verify that a suitable Referrer-Policy header is included to avoid exposing sensitive information in the URL to untrusted parties.',
             'implementation_guidance'=>'Set Referrer-Policy: no-referrer or strict-origin-when-cross-origin. Test that referrer information is not leaked in cross-origin requests containing sensitive parameters.'],

            ['control_id'=>'V14.5.1', 'category'=>'Configuration',
             'title'=>'CORS Header Validation',
             'description'=>'Verify that the HTTP request origin header is validated against a defined list of allowed origins.',
             'implementation_guidance'=>'Implement a strict CORS allowlist. Never use wildcard (*) origins for authenticated endpoints. Validate the Origin header on the server side.'],
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

        $this->command->info('OWASP ASVS 4.0.3 — ' . count($rows) . ' controls seeded successfully.');
    }
}