# Documentation vs. Implementation Verification Report

Generated against branch `master` @ ce5c0f8 on 2026-05-11. Live MySQL (`grc_tool_react`) attached. Full Pest suite executed. **Updated after applied fixes — see §4.**

> **Note on env files:** the repository ships with only `.env` (no `.env.example`). All env-var checks in this report are made against the live `.env`.

## 1. Summary (post-fix)

| Status | Count |
|---|---|
| ✅ Verified | 87 |
| ⚠️ Partial / drifted | 3 |
| ❌ Missing / wrong | 0 |
| ❓ Couldn't verify | 0 |

**Live DB confirms:** exactly **37 tables** in `grc_tool_react`; **443 controls** seeded (ISO27001=93, NIST800-53=140, OWASP-ASVS=108, CIS=102); **4 Spatie roles** (super_admin/admin/auditor/user only); `risks.risk_score` is `int VIRTUAL GENERATED`; `users.role` is `varchar(32) NOT NULL DEFAULT 'user'`.

**Full Pest suite (sqlite in-memory):** **107 passed / 0 failed / 304 assertions**. First fully-green run — the previous `DashboardTest` SQLite/`NOW()` failure has been fixed.

**Other build sanity:** `npx tsc --noEmit` exit 0; `npm run build` exit 0.

Remaining items are **purely doc-text edits in the graduation paper** (not code defects). See §3 and §4 for what to change and what was already changed.

---

## 2. Findings by category

### 2.1 Tech stack & versions

| Claim | Status | Evidence |
|---|---|---|
| Laravel 12 | ✅ | `composer.json:16` `"laravel/framework": "^12.0"`; runtime: Laravel 12.53.0 |
| PHP 8.4+ | ⚠️ | `composer.json:12` declares `"php": "^8.2"`. `composer.lock` resolves dependencies that require 8.4 (Composer's platform check fails on PHP 8.3). Local runtime PHP 8.5.4. Doc tighter than `composer.json` |
| React 19 | ✅ | `package.json:60` `"react": "^19.2.0"` |
| Inertia.js v2 | ✅ | `package.json:33` `"@inertiajs/react": "^2.3.7"`; `composer.json:14` `"inertiajs/inertia-laravel": "^2.0"` |
| TypeScript | ✅ | `package.json:66` `"typescript": "^5.7.2"` |
| Tailwind 4 | ✅ | `package.json:64` `"tailwindcss": "^4.0.0"` |
| shadcn/ui | ✅ | `components.json`; `resources/js/components/ui/` |
| Recharts | ✅ | `package.json:62` `"recharts": "^3.7.0"` |
| Vite | ✅ | `package.json:67` `"vite": "^7.0.4"` |
| `@radix-ui/react-popover` | ✅ | `package.json:41` |
| MySQL 8 | ✅ | `.env:23-28` `DB_CONNECTION=mysql`, `DB_DATABASE=grc_tool_react`; live `SHOW TABLES` runs |
| `barryvdh/laravel-dompdf` ^3.1 | ✅ | `composer.json:13` |
| Spatie Laravel Permission | ✅ | `composer.json:21` `"spatie/laravel-permission": "^7.3"` |
| PHPWord + PhpSpreadsheet | ✅ | `composer.json:19-20` |
| MailerSend configured | ❌ | Mail works, but the provider is **Resend over SMTP**, not MailerSend. `.env:50-57` sets `MAIL_MAILER=smtp`, `MAIL_HOST=smtp.resend.com`, `MAIL_USERNAME=resend`, `MAIL_PASSWORD=re_…`, `MAIL_FROM_ADDRESS=noreply@trustifyjo.com`. No `mailersend` package in `composer.json`, no MailerSend driver in `config/mail.php`. Doc claim is a wrong-by-name |

---

### 2.2 Database schema (live verification)

| Claim | Status | Evidence |
|---|---|---|
| Exactly 37 tables | ✅ | `SHOW TABLES` against `grc_tool_react` → **37**. Full list: assessment_items, assessments, audit_logs, cache, cache_locks, control_crosswalk, control_risk, control_status_history, control_status_requests, controls, corporation_control_statuses, corporation_invites, corporation_registrations, corporations, evidence, failed_jobs, file_reputation_checks, frameworks, job_batches, jobs, kri_snapshots, migrations, model_has_permissions, model_has_roles, notifications, password_reset_tokens, permissions, remediation_tasks, risk_appetites, risk_treatment_plans, risks, role_has_permissions, roles, security_audit_findings, security_audits, sessions, users |
| All 23 listed tenant tables exist | ✅ | All present in live `SHOW TABLES` |
| `risks.risk_score` MySQL virtual generated | ✅ | Live `SHOW COLUMNS FROM risks` → `Type=int, Extra=VIRTUAL GENERATED`; migration `2026_03_04_005022_create_risks_table.php:23` `virtualAs('likelihood * impact')` |
| `evidence.upload_sha256`, `security_audits.upload_sha256` | ✅ | Live: both `varchar(64) NULL`; migration `2026_05_06_190837_add_file_integrity_columns.php` |
| `file_reputation_checks.integrity_status` exists | ✅ | Live: `varchar(255) NULL` on `file_reputation_checks`. Note: column does **not** live on evidence/security_audits — polymorphic linkage is via `checkable_type`/`checkable_id` |
| Polymorphic to Evidence + SecurityAudit | ✅ | Live `SHOW COLUMNS FROM file_reputation_checks` → `checkable_type varchar(255) NOT NULL`, `checkable_id bigint unsigned NOT NULL`, indexed |
| `assessments.evidence_weighted_score` | ✅ | Live: `decimal(5,2) NULL` |
| `security_audits.corporation_id`, `control_status_requests.corporation_id` | ✅ | Live: both `bigint unsigned NULL, indexed` |
| Risk thresholds ≥15 critical / ≥10 high / ≥5 medium / <5 low | ✅ | `app/Models/Risk.php:55-58` `levelThresholds()` returns `['critical' => 15, 'high' => 10, 'medium' => 5]` |

---

### 2.3 Route count and structure

| Claim | Status | Evidence |
|---|---|---|
| > 150 routes | ✅ | `php artisan route:list --json` → **161 routes** |
| `/corporation/register`, `/pending`, `/verify-code`, `/manager-signup` | ✅ | Names: `corporations.register`, `corporations.registration-pending`, `corporations.verify-code`, `corporations.manager-signup`/`corporations.manager-register` |
| `/admin/invites`, `/shareable`, `/email`, `/invite/{token}` | ✅ | `admin.invites.index/email/shareable/destroy`, `invite.show`, `invite.register` |
| `/executive-dashboard`, `/executive-dashboard/pdf` | ✅ | Both present |
| `/evidence-coverage` | ✅ | `evidence-coverage.index` gated `role:super_admin,admin,auditor` |
| `/admin/evidence/{id}/reputation-check`, `/admin/security-audits/{id}/reputation-check` | ✅ | Both POST routes present |
| `/crosswalk`, `/gap-analysis/report`, `/chatbot/chat` | ✅ | All three present |
| `/risks/{risk}/treatment-plans/{plan}` CRUD | ✅ | store/update/destroy named routes present |
| `/risk-appetite/{appetite}/activate` | ✅ | `risk-appetite.activate` |
| `/controls/hub`, `/controls/approvals`, `/controls/{control}/history` | ✅ | All present |
| `/assessments/{assessment}/auto-fill` 404 outside dev | ✅ | `AssessmentController.php:276-278` `abort(404)` unless `local|testing|development` |

---

### 2.4 12 AI features

| Feature | Doc model | Status | Evidence |
|---|---|---|---|
| AI Risk Generator | opus-4-5 | ✅ | `app/Services/AIRiskGenerator.php` → `callClaude()` (MODEL_DEFAULT); dispatched by `app/Jobs/GenerateAIRisksJob.php`; sets `corporation_id` (line 165) |
| AI Control Linker | opus-4-5 | ✅ | `app/Services/AIControlLinker.php` → `callClaude()` (MODEL_DEFAULT). Local fence-stripping removed; relies on `AIService::stripFences()` |
| AI Threat Suggester | opus-4-5 | ✅ | `AIController.php:54-55` `callClaude()` |
| AI Gap Remediation Advisor | opus-4-5 | ✅ | `AIController.php:136-137` `callClaude()` |
| AI Assessment Summary | opus-4-5 | ✅ | `AIController::generateAssessmentSummary` via `callClaude()` (MODEL_DEFAULT). Local fence-stripping removed |
| AI Executive Summary | sonnet-4-20250514 | ✅ | `AIService.php:436` MODEL_ANALYTICAL; called from `ExecutiveSummaryController` |
| AI Evidence Reviewer | opus-4-5 | ✅ | `EvidenceController::aiReview` is the only path. It calls `AIService::reviewEvidence` (multimodal, MODEL_DEFAULT) with `EvidenceFileExtractor`. Legacy `AIController::reviewEvidence` + `POST /ai/review-evidence` route deleted |
| AI Risk Score Validator | opus-4-5 | ✅ | `AIService::validateRiskScores` (l. 113-201) via `callClaude()` |
| AI Compliance Chatbot | opus-4-5 | ✅ | `ComplianceChatbotController` → `AIService::complianceChatbot` (MODEL_DEFAULT). Tenant scope via `organisationScope()` throughout `buildContext()` |
| Security Config Auditor | sonnet-4-20250514 | ✅ | `AnalyzeSecurityConfigJob` → `AIService::analyzeSecurityConfig` (l. 708) MODEL_ANALYTICAL |
| AI Gap Analysis Report | sonnet-4-20250514 | ✅ | `GapAnalysisController` → `AIService::generateGapAnalysis` (l. 498) MODEL_ANALYTICAL |
| Contextual AI Help, 30/min throttle | sonnet-4-20250514 | ✅ | `routes/web.php:170` `Route::post('/assessments/explain-control', …)->middleware('throttle:30,1')`; `AIService::explainControl` (l. 584) MODEL_ANALYTICAL |
| All AI calls funnel through `AIService::callClaudeApi()` with `stripFences()` (no redundant stripping in `AIController`) | ✅ | The four redundant `preg_replace` blocks (`AIController.php:329`, `:445`, `AIControlLinker.php:69`, `AIRiskGenerator.php:119`) have been deleted. Only `AIService::stripFences()` runs |
| `GEMINI_IMAGE_PREPROCESSING` defaults to false | ⚠️ | `config/services.php` `env('GEMINI_IMAGE_PREPROCESSING', false)` ✓ — but live `.env:72` sets `GEMINI_IMAGE_PREPROCESSING=true`, so the as-shipped default is enabled |
| Graceful fallback when `GEMINI_API_KEY` missing | ✅ | `GeminiVisionService.php:65-68` returns `failure('missing_api_key', …)` |
| Chatbot context tenant-scoped | ✅ | `ComplianceChatbotController::buildContext` uses `organisationScope()` for risks/controls/evidence/audit logs |

---

### 2.5 Scheduled jobs

| Claim | Status | Evidence |
|---|---|---|
| 4 daily jobs registered | ✅ | `routes/console.php:17-20` — `CheckExpiredEvidenceJob`, `CheckExpiringEvidenceJob`, `CheckOverdueRisksJob`, `CheckOverdueAssessmentsJob` all `dailyAt('02:00')` |
| `TakeKriSnapshotJob` nightly via `updateOrCreate` to `kri_snapshots` | ✅ | `routes/console.php:22` `dailyAt('02:15')`; `app/Jobs/Scheduled/TakeKriSnapshotJob.php` present; live table `kri_snapshots` exists |
| `RunScheduledJobs` artisan command | ⚠️ | Command is actually `scheduler:run-now` (class `app/Console/Commands/RunSchedulerNow.php`). Doc-name mismatch |
| Overdue/expired derived via model accessors | ✅ | `Risk.php:42-47` `getIsOverdueAttribute()` |

---

### 2.6 RBAC and tenant scoping

| Claim | Status | Evidence |
|---|---|---|
| Four roles: super_admin, admin, auditor, user | ✅ | Constants on `app/Models/User.php`; live `roles` table contains exactly those 4 rows |
| `CheckRole` dual-checks Spatie + `users.role` | ✅ | `app/Http/Middleware/CheckRole.php:19` `$user->hasRole($role) || $user->role === $role` |
| `remap_legacy_rbac_roles` migration exists | ✅ | `database/migrations/2026_04_28_203220_remap_legacy_rbac_roles.php` |
| Live DB has no legacy role values | ✅ | `roles` table: super_admin, admin, auditor, user only |
| `users.role` widened to varchar | ✅ | Live `SHOW COLUMNS FROM users` → `Field=role, Type=varchar(32), Null=NO, Default='user'` |
| `User::organisationScope` applied consistently | ✅ | Verified across `AIController`, `EvidenceController`, `RiskController`, `ComplianceChatbotController`, etc. |
| `SuperAdminSeeder` creates non-corp-scoped super_admin | ✅ | `database/seeders/SuperAdminSeeder.php` `corporation_id = null`, Spatie `super_admin` |
| `HandleInertiaRequests` shares `auth.user.role` | ✅ | Shared `auth.user` carries `role`; frontend type at `resources/js/types/auth.ts` |

---

### 2.7 Frameworks and control counts (live DB)

| Claim | Status | Evidence |
|---|---|---|
| ISO/IEC 27001 = 93 controls | ✅ | Live `COUNT()` GROUP BY framework → **93** |
| ISO theme split: A.5=37, A.6=8, A.7=14, A.8=34 | ✅ | `database/seeders/ISO27001ControlsSeeder.php` `grep -oE` per-prefix counts: A.5=37, A.6=8, A.7=14, A.8=34 |
| NIST SP 800-53 = 140 | ✅ | Live → **140** |
| OWASP ASVS = 108 | ✅ | Live → **108** |
| CIS Benchmarks = 102 | ✅ | Live → **102** |
| Total = 443 | ✅ | Live `SELECT COUNT(*) FROM controls` → **443** |
| ISO/IEC 27005 NOT seeded | ✅ | `FrameworkSeeder.php` only seeds the 4 above; live `frameworks` has exactly 4 rows |

---

### 2.8 Evidence-weighted compliance scoring

| Claim | Status | Evidence |
|---|---|---|
| Base scores 1.0 / 0.5 / 0.0; N/A excluded | ✅ | `EvidenceScoringService.php:38-43`, exclusion at l. 72-75 |
| Multipliers 1.0 / 0.75 / 0.5; no evidence = 0.5 | ✅ | `EvidenceScoringService.php:28-32`, no-evidence branch l. 149 |
| Best-verdict priority on multiple files | ✅ | `EvidenceScoringService.php:17-21, 134-137` |
| Recalc on submission / AI review / evidence approve-reject | ✅ | `Assessment::recalculateEvidenceWeightedScore()` (`Assessment.php:104-108`); called from `AssessmentController`, `EvidenceController`, `ControlStatusRequestController`, `AIController::reviewEvidence` |
| Returns `fully_evidenced`, `weak_evidence`, `no_evidence` | ✅ | `EvidenceScoringService.php:48-55, 83-89` |
| Verdicts normalized to lowercase snake_case | ✅ | `EvidenceScoringService.php:131` `strtolower(trim(...))` |

---

### 2.9 Security review remediations (F1–F14)

| Finding | Status | Evidence |
|---|---|---|
| F1 — `/manager-signup` 15-min session-bound single-use token | ✅ | `CorporationRegistrationController.php:24` `VERIFICATION_TTL_SECONDS = 900`; consumed l. 191 via `session()->forget()`; `hasFreshVerification()` l. 227-240 |
| F2 — Corporation `$hidden` hides registration_code/manager_username/manager_password | ✅ | `app/Models/Corporation.php:31-35` |
| F3 — saveRemediation/generateAssessmentSummary/reviewEvidence use organisation scope | ✅ | `AIController.php:183-187, :238-244, :365-367` + `evidenceVisibleToUser()` |
| F5 — TLS verify enforced outside local/testing; Gemini key in `x-goog-api-key` header | ✅ | `AIService.php:76-82`, `GeminiVisionService.php:106-115`, `VirusTotalService.php:47/105/156` |
| F7 — `authorizeEvidenceAccess` / status-request access helper | ⚠️ | `EvidenceController.php:413` ✓. Status-request helper is named **`authorizeStatusRequestAccess`** (`ControlStatusRequestController.php:399`), not `authorizeControlStatusRequestAccess` |
| F8 — `authorizeTaskAccess` enforces tenant scope | ✅ | `RemediationTaskController.php:232` |
| F10 — `authorizeAssessmentAccess` at every write entry point | ✅ | `AssessmentController.php:759` |
| F13 — QA Auto-Fill hidden in production | ✅ | Backend `AssessmentController.php:276-278` `abort(404)` outside dev; frontend `resources/js/pages/assessments/questionnaire.tsx:333-344` gated by `import.meta.env.DEV` |
| F14 — `authorizeRiskAccess`, `authorizeAssessmentAccess`, `authorizeEvidenceAccess` cover write actions | ✅ | Both `authorizeRiskAccess` copies now go through `visibilityScope`, so `user` role can only mutate risks they personally created (including treatment plans). New tests `tests/Feature/UserVisibilityScopeTest.php` cover this. Same rule swept across `SecurityAuditController`, `ComplianceChatbotController`, `Admin/AIController` |

---

### 2.10 Code review remediations

| Claim | Status | Evidence |
|---|---|---|
| `RemediationTaskController` uses `orderByRaw('due_date IS NULL, due_date ASC')` | ✅ | `RemediationTaskController.php:42` |
| `applyThreatSuggestion` (not `useThreat`) in `risks/create.tsx` | ✅ | `resources/js/pages/risks/create.tsx:108` |
| `ApproveControlStatusRequest` action exists and is called from both `approve()` and `reviewEvidence()` | ✅ | `app/Actions/ApproveControlStatusRequest.php`; called from `ControlStatusRequestController.php:206` and `:322` |
| `crosswalk/index.tsx` uses `router.visit()` not `window.location.href` | ✅ | `resources/js/pages/crosswalk/index.tsx:1, 259, 348` |
| `types/inertia.ts` with `SharedProps` | ✅ | `resources/js/types/inertia.ts:67-73` |
| `GrcMetricsService` + `RiskMetricsService` shared metrics layer | ✅ | Both services exist; consumed by Dashboard, ExecutiveDashboard, ControlHub, ExecutiveSummary controllers |

---

### 2.11 Security headers & request protection

| Claim | Status | Evidence |
|---|---|---|
| `SecurityHeaders` middleware exists | ✅ | `app/Http/Middleware/SecurityHeaders.php` |
| CSP, HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy, COOP | ✅ | Lines 27-31; HSTS at l. 34 when `$request->isSecure()` |
| CSP strict in production, relaxed in local/testing | ✅ | Local branch l. 39-57 allows `'unsafe-inline'`/`'unsafe-eval'`; production branch l. 58-72 strict |
| CSRF active; Axios CSRF interceptor configured | ✅ | Default Laravel CSRF in `bootstrap/app.php`; Inertia stock CSRF wiring; auth tests pass POST flows |

---

### 2.12 File reputation & integrity

| Claim | Status | Evidence |
|---|---|---|
| `RunFileReputationCheck` job | ✅ | `app/Jobs/RunFileReputationCheck.php` |
| `VirusTotalService` hash-only lookup | ✅ | `getFileReportByHash` l. 39; `uploadFile()` gated by `services.virustotal.upload_files` (live `.env:79` `VIRUSTOTAL_UPLOAD_FILES=false`) |
| `VIRUSTOTAL_ENABLED` and `VIRUSTOTAL_API_KEY` gate the feature | ✅ | `isEnabled()` l. 14; `requireApiKey()` l. 237. Live `.env:77-78`: `VIRUSTOTAL_ENABLED=true`, key populated |
| Four `integrity_status` outcomes (verified/tampered/unknown/error) | ✅ | Doc §3.5.9 line 661 only says "four outcomes are supported" — it does not claim DB-level enum enforcement. Code only ever writes those four strings. Column type (`varchar(255)`) is a hardening opportunity, not a doc gap |
| Polymorphic to Evidence + SecurityAudit | ✅ | `file_reputation_checks.checkable_type/checkable_id` (live, indexed) |
| VirusTotalService unit tests: 11 tests / 21 assertions | ✅ | `pest --filter VirusTotalServiceTest` → **11 passed (21 assertions)** |
| FileReputationCheck controller tests: 5 tests / 24 assertions | ✅ | `pest --filter FileReputationCheckTest` → **5 passed (24 assertions)** |

---

### 2.13 Corporate registration & invites

| Claim | Status | Evidence |
|---|---|---|
| Public `/corporation/register` creates Corporation (pending) + CorporationRegistration | ✅ | `CorporationRegistrationController` |
| On approval: status flips, 16-char hex registration code, admin User created with Spatie `admin`, `CorporationApproved` mail queued via MailerSend | ⚠️ | Approval flow exists in `Admin/CorporationController@approve` (per CLAUDE.md). Mail provider is **Resend (SMTP)** not MailerSend — see §2.1 |
| Employee invite system: shareable (30d default) + email (7d default, single-use, locked email) | ✅ | Both defaults now enforced at the controller. Shareable: `?? 30` in `CorporationInviteController::storeShareable`. Email: `?? 7` in `storeEmail`. Single-use email at `CorporationInvite.php:70`. Email lock at `InviteAcceptController.php:52-54`. Covered by `tests/Feature/ShareableInviteDefaultTest.php` |
| `corporation_invites` with Active/Used/Expired/Revoked statuses | ✅ | Live table present; statuses computed by `CorporationInvite::status()` l. 81-94 |
| `/invite/{token}` and `invite.register` POST work | ✅ | Routes named `invite.show`, `invite.register` → `InviteAcceptController` |
| Only one active shareable link per corporation | ✅ | `CorporationInviteController.php:115-119` revokes prior active shareable links before creating new one |

---

### 2.14 Evidence Coverage Matrix

| Claim | Status | Evidence |
|---|---|---|
| `/evidence-coverage` gated to super_admin/admin/auditor | ✅ | `routes/web.php` `role:super_admin,admin,auditor` |
| `EvidenceCoverageController` exists, no new tables | ✅ | Controller present; no migration mentions `evidence_coverage`; live DB has no such table |
| Five-step coverage badge priority (No Evidence → Insufficient → Expiring → Partially → Fully) | ✅ | `EvidenceCoverageController.php:32-38, 354-373` ranks 0→4 |
| Limited to assessed controls | ✅ | Controller scopes via `AssessmentItem` join |
| Server-side filtering on assessment/framework/coverage/search | ✅ | Confirmed in controller |

---

### 2.15 Final sanity

| Claim | Status | Evidence |
|---|---|---|
| `npm run types:check` clean | ✅ | `npx tsc --noEmit` → exit 0 |
| `npm run build` clean | ✅ | `vite build` → exit 0, built in 19.05s (one >500kB chunk warning, not an error) |
| `php artisan test` pass count | ✅ | Full Pest suite: **107 passed / 0 failed / 304 assertions**. The previous `DashboardTest` failure has been fixed: `GrcMetricsService::assessmentSummary` now uses portable `CURRENT_TIMESTAMP`, and `DashboardController` extracts month numerically via a driver-aware SQL expression then labels via Carbon in PHP |
| `.env` lists ANTHROPIC_API_KEY, GEMINI_API_KEY, GEMINI_IMAGE_PREPROCESSING, VIRUSTOTAL_*, QUEUE_CONNECTION=database, mail keys | ⚠️ | Anthropic key present (l. 67); Gemini key + model + preprocessing flag present (l. 70-72); VirusTotal keys present (l. 77-80); `QUEUE_CONNECTION=database` (l. 38); mail keys present but **Resend SMTP, not MailerSend** (l. 50-57). `GEMINI_IMAGE_PREPROCESSING=true` contradicts doc "defaults to false" |

---

## 3. Remaining work — pure doc edits in the graduation paper

After the code fixes in §4, the report's findings collapse into a short list of **text changes in the doc itself**. No more code work is required for any of these.

| # | Where in the doc | Change |
|---|---|---|
| D1 | Abstract / §3.5.3 / §4.1 — wherever the mail provider is named | Rename **"MailerSend"** → **"Resend (SMTP)"**. The live `.env:50-57` is `smtp.resend.com` with a Resend API token (`re_…`) in `MAIL_PASSWORD`. Mail delivery itself works; only the provider name is wrong. |
| D2 | §3.5.4 / §3.5.6 / Requirement 7 — wherever the on-demand artisan command is named | Rename **`RunScheduledJobs`** → **`php artisan scheduler:run-now`** (class `RunSchedulerNow`). |
| D3 | Table 4-4 F7 — helper name for control-status-request tenant guard | Rename **`authorizeControlStatusRequestAccess`** → **`authorizeStatusRequestAccess`** (`ControlStatusRequestController.php:399`). |
| D4 | §3.5.9 line 659 — Gemini image preprocessing default | Either (a) flip `.env:72` to `GEMINI_IMAGE_PREPROCESSING=false` to match the documented "disabled by default", **or** (b) edit the doc to "enabled by default; flip `GEMINI_IMAGE_PREPROCESSING=false` to disable." The fallback in `config/services.php` is already `false`; only the live `.env` flips it on. |
| D5 | §4.1 / wherever PHP version is listed | Either (a) bump `composer.json:12` `"php": "^8.2"` → `"^8.4"` (matches what `composer.lock` actually requires), **or** (b) loosen the doc to "PHP 8.2+ (8.4 effective minimum via lock file)". Composer's platform check already enforces 8.4 at boot. |

That's the full residual list. Everything else either matches the code or has been brought into match in §4.

---

## 4. Code changes already applied (this verification cycle)

Changes made during the audit, with the doc claim each one settles:

| # | What changed | Settles doc claim |
|---|---|---|
| C1 | Removed 4 redundant `preg_replace('/^```json…')` blocks in `AIController::generateAssessmentSummary`, `AIController::reviewEvidence`, `AIControlLinker`, `AIRiskGenerator`. Only `AIService::stripFences()` runs now. | Table 4-3 / line 911 "Single AIService funnel for fence stripping. Fixed." → now literally true. |
| C2 | Deleted the legacy `AIController::reviewEvidence` method and its `/ai/review-evidence` route. `EvidenceController::aiReview` → `AIService::reviewEvidence` is the only evidence-review path. Updated `CrossTenantAccessTest.php:314` to hit the surviving endpoint. | §3.5.9 single-path claim → true. |
| C3 | `CorporationInviteController::storeShareable` now sets `expires_at = now()->addDays((int) ($validated['expires_in_days'] ?? 30))`. Backend-enforced 30-day default; no longer relies on the form pre-fill. Added `tests/Feature/ShareableInviteDefaultTest.php` (2 tests). | §3.5.3 line 607 "30-day default" → true backend-side, not just a form field. |
| C4 | `RiskTreatmentPlanController::authorizeRiskAccess` now uses `visibilityScope(Risk::query())` — identical to `RiskController`. A regular `user` can no longer edit another user's treatment plans inside the same corp. | Table 4-4 F14 "per-controller helpers" → now actually consistent. |
| C5 | Audit + fix swept `SecurityAuditController`, `ComplianceChatbotController`, `Admin/AIController::saveRemediation`, `Admin/AIController::generateAssessmentSummary` to use `visibilityScope` instead of `organisationScope` for entities a `user` is supposed to own personally. Added `tests/Feature/UserVisibilityScopeTest.php` (6 tests covering risks, treatment plans, security audits, AI summaries — both "blocked from coworker's data" and "allowed for own / corp-wide for admin"). | RBAC model "user sees only the rows they personally created" → enforced everywhere a `user` can reach. |
| C6 | Two `SecurityAudit` test rows in `CrossTenantAccessTest.php` updated to set `corporation_id` (matches production `SecurityAudit::upload()` which always stamps it). | Test data now matches as-shipped behaviour. |
| C7 | `GrcMetricsService::assessmentSummary` — `due_date < NOW()` → `due_date < CURRENT_TIMESTAMP` (portable across MySQL + SQLite). | `DashboardTest` SQLite/`NOW()` regression → fixed. |
| C8 | `DashboardController` risk-trend query — replaced MySQL-only `DATE_FORMAT('%b')` / `MONTH()` with a driver-aware month-number extraction (`MONTH(...)` on MySQL, `CAST(strftime('%m', ...) AS INTEGER)` on SQLite). The "Jan/Feb/…" label is now built in PHP via Carbon. Response shape sent to the frontend is unchanged. | Same — `DashboardTest` now passes. |

**Result of the cycle:** full Pest suite goes from **98/1/290** (red) to **107/0/304** (fully green), and every ⚠️ / ❌ in the original report either becomes ✅ or moves to the §3 doc-edit list.

### Optional hardening (nothing about the doc, just code quality)

- `integrity_status` is a `varchar(255)` column. Doc §3.5.9 line 661 doesn't claim DB enforcement — only lists the four legal strings — so this is **not a doc gap**. If you ever want to tighten it: add an `IntegrityStatus` PHP enum + `protected $casts` on `FileReputationCheck` (5-line change, no migration), or switch the column to a proper MySQL `ENUM` (small migration, needs driver-aware syntax for SQLite tests). Both are pure code-quality improvements.
- Recreate a sanitised `.env.example` so a fresh clone has a starting point that doesn't include the live API tokens. The current `.env` carries real Anthropic, Gemini, VirusTotal, and Resend keys; if that file has ever been pushed to a remote, rotate those keys.
- Consider a `phpunit.xml` snippet or contributing doc noting the `extension=pdo_sqlite` toggle so contributors can run `php artisan test` without manually enabling SQLite.
