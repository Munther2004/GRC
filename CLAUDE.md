# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A GRC (Governance, Risk & Compliance) management application. Multi-tenant: every customer is is modeled as a `Corporation`, and an `super_admin` platform owner sits above all tenants. Most tenant-owned rows carry a `corporation_id`. Some legacy or specialized tables are scoped indirectly through related users or records; see Known follow-ups.

Stack:
- **Laravel 12** monolith.
- **Inertia.js v2** serving a **React 19 / TypeScript** SPA.
- **MySQL** in production / dev (Laragon). **SQLite in-memory** in the test suite (`phpunit.xml`).
- **Spatie Laravel Permission** for role/permission storage. Roles are paired with a legacy `users.role` string column — both are kept in sync (see RBAC section).
- **Anthropic Claude API** for AI features (evidence review, risk generation, gap analysis, security-config analysis, compliance chatbot).

## Common commands

- `composer dev` — start the full local stack: `php artisan serve` + queue worker + `pail` log tail + `vite` (concurrent, kill-others). Canonical "run the app" command.
- `composer dev:ssr` — same, but with Inertia SSR enabled.
- `composer test` — `config:clear` → `pint --test` → `pest`. Use this before pushing.
- `composer ci:check` — full pre-CI check: lint, format, types, tests.
- `vendor/bin/pest tests/Feature/DashboardTest.php` — single test file. `--filter='name'` for a single case.
- `php artisan migrate:fresh --seed` — wipe DB and reseed (RBAC + frameworks ISO27001/NIST 800-53/OWASP ASVS/CIS Benchmarks).
- `php artisan scheduler:run-now` — fire the nightly jobs immediately.
- `php artisan controls:sync-from-assessments` — backfill `controls.current_status` from the latest completed assessment per control (idempotent).
- `php artisan users:sync-roles` — heal `users.role` and Spatie role assignments to the canonical taxonomy. Idempotent. Runs the legacy → final remap in code (see RBAC section).
- `php artisan risks:backfill-ai`, `risks:link-controls`, `kri:snapshot`, `kri:clear`, `permission:cache-reset` — domain-specific maintenance.
- `npm run lint` / `npm run format` / `npm run types:check` — ESLint, Prettier, `tsc --noEmit`.
- `composer lint` (Pint with Laravel preset) / `composer lint:check`.

`DB::prohibitDestructiveCommands()` is on in production (`AppServiceProvider`), so `db:wipe`/`migrate:fresh` will throw outside local/testing.

## Architecture

### Inertia + React glue

- Pages: `resources/js/pages/{name}.tsx`. Controllers call `Inertia::render('pages/name', [...props])`.
- `HandleInertiaRequests::share()` injects `auth.user`, `flash.{success,error}`, and a `notifications` block (unread count, recent items, plus role-aware pending-approval / open-remediation / security-audit counts cached for 30–60s, with cache keys segmented by tenant). Read these via `usePage<SharedProps>().props` — `SharedProps` is in `resources/js/types/inertia.ts`.
- Errors render via Inertia: `bootstrap/app.php` intercepts 403/404/500 → `errors/403|404|500` pages. Don't write custom 403 responses in controllers; just `abort(403)`.
- Path alias `@/*` → `resources/js/*`. Vite + React Compiler (`babel-plugin-react-compiler`) is enabled — avoid hand-rolled `useMemo`/`useCallback`.
- shadcn/ui (`style: new-york`, `baseColor: neutral`) lives under `resources/js/components/ui/` and is **excluded from ESLint** (it's generated). Same for `resources/js/actions/**` and `resources/js/routes/**` (Wayfinder output).

### Routing — both sides

- Server: name-based routes in `routes/web.php` (settings split out to `routes/settings.php`), organised by feature with role middleware groups (see "Routes and middleware" below).
- Client: `resources/js/lib/routes.ts` exports `route(name, params)` and is **a hand-maintained mapping** of backend route names to URLs (also assigned to `window.route`). When you add or rename a server route used by the frontend, update this file too. Wayfinder is configured in vite.config.ts but the manual map is what `route()` actually uses.

## RBAC model

The system has three organizational roles — `admin`, `auditor`, and `user` — plus one platform-owner role, `super_admin`. The four code roles below are the actual values stored in both the Spatie `roles` table and the legacy `users.role` string column.

| Role | Tenant scope | Powers |
|---|---|---|
| `super_admin` | None — `corporation_id` is `NULL` | Platform owner. Sees every corporation. Approves/rejects corporation registrations. Manages global frameworks & controls library. Manages users across all corporations. |
| `admin` | Exactly one corporation | Corporation administrator. Manages users in their own corporation only (can grant `auditor` and `user`, **not** `admin` or `super_admin`). Has the corp-write surface plus reviews and risk-appetite. |
| `auditor` | Exactly one corporation | Reviewer. Approves/rejects evidence and control status requests, reads audit logs, all for their corporation only. |
| `user` | Exactly one corporation | Operational writer. Creates/edits risks, assessments, evidence uploads, remediation tasks, AI-assistance calls, control status change requests, in their corporation only. |

`User::ROLE_SUPER_ADMIN`, `ROLE_ADMIN`, `ROLE_AUDITOR`, `ROLE_USER`, and `User::VALID_ROLES` are constants on the model — prefer those over string literals in PHP.

### Legacy / code-drift values

`manager`, `employee`, and `corporate_manager` are **not** final roles. They are remapped automatically:

- Spatie `manager` → `admin`
- Spatie `employee` → `user`
- Legacy `users.role = 'manager'` → `admin`
- Legacy `users.role = 'employee'` → `user`
- Legacy `users.role = 'corporate_manager'` → `admin`
- `is_corporation_manager = true` (without super_admin) → `admin`

The legacy role strings `manager`, `employee`, and `corporate_manager` should appear only in legacy-remap logic, `SyncUserRoles` compatibility mapping, or comments explaining the migration. Other "manager" wording may still exist as corporation onboarding relation/column/route naming, such as `Corporation::manager()`, `manager_user_id`, `manager_username`, `manager_password`, and `manager-signup` routes; those are not RBAC roles.

### `users.role` ↔ Spatie sync

- A legacy `users.role` string column exists alongside Spatie role assignments. Both must point at the same role; helpers `User::isSuperAdmin()`, `isAdmin()`, `isAuditor()`, `isUser()` accept either source of truth (`role === ...` OR `hasRole(...)`).
- `App\Http\Middleware\CheckRole` (alias `role:`) authorises if **either** `$user->hasRole($role)` **or** `$user->role === $role` matches any of the listed roles.
- `php artisan users:sync-roles` reconciles the two columns to the canonical taxonomy. It is idempotent and reports converted users.
- `users.role` was an `ENUM` in the original migration; `database/migrations/2026_04_28_203218_widen_users_role_to_string.php` widens it to `VARCHAR(32) DEFAULT 'user'` so `super_admin` fits. The migration handles MySQL/MariaDB, Postgres, and SQLite branches.

### Tenant scoping

`User::organisationScope(Builder $q)` is the single tenant-scoping primitive. Every controller that loads tenant-owned data must call it instead of querying directly:

```php
$user = Auth::user();
$risks = $user->organisationScope(Risk::query())->latest()->get();
```

Behaviour:
- `super_admin` → returns the query unchanged (sees all corporations).
- Anyone else with a `corporation_id` → `where('corporation_id', $this->corporation_id)`.
- Anyone else with `corporation_id = NULL` → `whereRaw('1 = 0')` (zero rows).

For this to work, the model's table needs a `corporation_id` column. Existing tenant tables (`risks`, `assessments`, `remediation_tasks`, `risk_appetites`) already have it; copy the pattern in `database/migrations/2026_04_16_200000_add_corporation_id_to_tenant_tables.php` and `2026_04_28_203219_add_corporation_id_to_risk_appetites_table.php` for new ones.

### Auth helpers on `User`

- `isSuperAdmin()`, `isAdmin()`, `isAuditor()`, `isUser()` — both column- and Spatie-aware.
- `canAdminister(User $target): bool` — role + tenant guard used by `Admin/UserController`. super_admin can administer anyone. Corporation admin can administer same-corporation auditor/user accounts. Self-profile updates should be handled separately from privileged user-management actions.
- `getRoleNameAttribute()` returns display labels: Super Admin / Admin / Auditor / User.

## Corporation onboarding

Two paths produce a corporation `admin`:

1. **Super_admin approves a registration** in `Admin/CorporationController@approve`: creates the manager `User` with `role = 'admin'`, syncs Spatie role `admin`, sets `corporation_id`, sets `is_corporation_manager = true`, emails generated credentials.
2. **Self-serve manager signup** in `CorporationRegistrationController@registerManager`: same end state, used after the corporation enters its post-approval registration code.

`FortifyServiceProvider::configureAuthentication` accepts **either** an email **or** a corporation-manager username (looked up via `Corporation::manager_username`). Don't replace this with stock email-only auth.

`App\Actions\Fortify\CreateNewUser` (self-service registration via Fortify):
- `users.role = 'user'`, Spatie role `user`.
- `corporation_id` set only if a `corporation_code` is supplied **and** the corresponding corporation has `status = 'approved'`.
- `is_corporation_manager = false`.
- Self-registration cannot create `admin`, `auditor`, or `super_admin`.

The `super_admin` is seeded by `database/seeders/SuperAdminSeeder.php` — `admin@grc.com`, default password `Admin@12345`, `corporation_id = NULL`, `is_corporation_manager = false`, Spatie role `super_admin`.

`UserSeeder.php` seeds two demo accounts (`auditor@grc.com`, `user@grc.com`) with no corporation; attach them to a tenant after one exists.

## User management

`Admin/UserController` (resource routes `admin.users.*`):

- `index` lists users scoped to the actor's corporation (super_admin sees everyone). `stats` are scoped the same way.
- `create`/`edit` views receive a `permissions` block (`is_super_admin`, `grantable_roles`, `fixed_corporation_id`) and a roles list narrowed to what the actor may grant.
- `store` and `update` validate `role` with `Rule::in($grantable)`:
  - super_admin grantable set: `super_admin | admin | auditor | user`.
  - corporation admin grantable set: `auditor | user` only.
- Corporation admins always get their own `corporation_id` injected on store, ignoring any `corporation_id` in the payload.
- `update` runs through `User::canAdminister`, refuses to flip a target's `corporation_id` across tenants for corp admins, and refuses to grant a role outside the actor's allowlist. Both `users.role` and the Spatie role are written atomically via `syncRoles`.
- `destroy` blocks self-deletion, then runs through `canAdminister`. Corp admins cannot delete users outside their corporation, and cannot delete other admins or super_admins.

The corp-admin enforcement is on the **backend**. Do not rely on the frontend role select to keep admins out of admin/super_admin — backend validation is the gate.

## Routes and middleware

`routes/web.php` is grouped by role intent. No production middleware references `manager`, `employee`, or `corporate_manager`.

- **Platform-only** — `Route::prefix('admin')->middleware('role:super_admin')`:
  - corporation list/show/destroy, approve/reject/regenerate-code
  - global frameworks (`admin.frameworks.*` + toggle)
  - global controls library (`admin.controls.*`)

- **User management** — `Route::prefix('admin')->middleware('role:super_admin,admin')`:
  - `admin.users.*` (controller scopes by tenant; corp admin sees only their corporation's users).

- **Operational write** — `middleware('role:super_admin,admin,user')`:
  - risks (create/store/edit/update/destroy/validate-scores), treatment plans, remediation tasks, AI assistance (`/ai/suggest-threats`, `/ai/remediate-gap`, `/ai/save-remediation`, `/ai/assessment-summary/{assessment}`), assessment writes, evidence upload, control status request submission, security-audit upload/generate-risks/save-as-evidence.

- **Review** — `middleware('role:super_admin,admin,auditor')`:
  - `controls.approvals` queue, `controls.status-requests.{approve,reject,review-evidence}`
  - `evidence.{approve,reject,ai-review}`, `/ai/review-evidence`
  - `audit-logs.index`

- **Org-admin only** — `middleware('role:super_admin,admin')`:
  - `risks.{link-control,unlink-control}`
  - `evidence.destroy`
  - `security-audits.destroy`
  - all of risk-appetite (`risk-appetite.{index,store,update,destroy,activate}`).

- **Public** (no auth): home, about, team, and the corporation registration funnel (`corporations.register`, `corporations.store`, `corporations.registration-pending`, `corporations.verify-code`, `corporations.manager-signup`, `corporations.manager-register`).

The `controls.approvals` index is a single GET inside the review group, not at the top level. Corporate dashboard, notifications, dashboards, reports, chatbot, gap-analysis, crosswalk, controls hub, control history, kri-snapshots, security-audits read endpoints, and assessment list/show/compare are inside the auth/verified group but not gated by role.

## Risk Appetite

Risk Appetite is **per corporation**.

- Schema: `risk_appetites.corporation_id` (nullable FK, cascade on corp delete) plus index `(corporation_id, is_active)`. The legacy seeded global row was deactivated by the corporation-id migration so corp-scoped reads will not surface it.
- Model API:
  - `RiskAppetite::getActiveForCorporation(?int $corpId)` — returns the corp's active appetite or `null`.
  - `RiskAppetite::getActiveForUser(?User $user)` — convenience wrapper around `getActiveForCorporation($user->corporation_id)`.
  - The old `RiskAppetite::getActive()` (no args, returned the first active row globally) **has been removed**. Don't reintroduce it.
- `Risk::getAppetiteBandAttribute()` classifies each risk against its **own** corporation's appetite, so tenant A's bands cannot bleed into tenant B.
- Controller (`RiskAppetiteController`):
  - super_admin reads/writes scoped by `?corporation_id=` query param. With no selection, the page renders a "select a corporation" panel — there is no implicit global edit.
  - admin always operates against their own `corporation_id`; payload `corporation_id` is ignored.
  - `update`, `activate`, and `destroy` enforce `appetite->corporation_id === actor->corporation_id` for non-super_admin via `ensureCanManage`.
  - `activate` deactivates only same-corporation peers and re-classifies only that corporation's risks; escalation notifications fan out only to that corporation's notify-roles.
- Routes are gated by `role:super_admin,admin`. Auditor and user have no write access.

## Frameworks and controls

Global framework and control definitions are **shared platform data**. The current implementation does not yet support per-corporation framework/control customization.

- Only `super_admin` can edit global frameworks (`admin.frameworks.*`, including `frameworks.toggle`) or global controls (`admin.controls.*`). Corporation admins must not have these routes — the middleware (`role:super_admin`) blocks them at the route layer.
- All roles (super_admin, admin, auditor, user) **read/use** frameworks and controls through normal workflows: assessments, controls hub, gap analysis, crosswalk, reports, dashboards, chatbot.
- If per-corporation customization (e.g., a tenant's own subset of controls or tenant-overridden control text) becomes a requirement, that is a separate feature. It would need either a `corporation_id` column on `frameworks`/`controls` or a per-corporation cloned-control-set table, plus controller scoping. See "Known follow-ups".

## Notifications

`App\Models\Notification` static helpers (`notifyAdminCorporationSignup`, `notifyAdminCorporationApproved`) fan out to **every super_admin user**, queried via `User::role(User::ROLE_SUPER_ADMIN)`. Do not reintroduce the previous hardcoded `User::where('email', 'admin@grc.com')` lookup.

`App\Services\NotificationService::typesForRole(?string $role)`:
- `super_admin`, `admin` → `null` (sees all notification types).
- `auditor` → review-relevant types (`pending_evidence`, `overdue_assessment`, `expiring_evidence`, `expired_evidence`, `status_request_pending`).
- `user`, and any unknown / `null` role → minimal user-set (`overdue_assessment`, `critical_risk`, `overdue_risk`, `status_request_approved`, `status_request_rejected`).

`HandleInertiaRequests` badge counts:
- `pending_approvals` is shown to `super_admin | admin | auditor`. For non-super_admin it is scoped to control-status-requests whose requester is in the same corporation. Cache key includes a per-tenant suffix.
- `open_remediation_tasks` is shown to `super_admin | admin | user`. Non-super_admin is scoped via `RemediationTask.corporation_id`.
- `security_audits_in_progress` is per-user; non-super_admin is scoped through the uploading user's corporation (the table itself has no `corporation_id` column today).

`ControlStatusRequestController@index` lists pending requests: super_admin sees all, others see only requests whose requester is in their corporation. The same controller's notification fan-out covers super_admin + same-corp `admin`/`auditor`.

`AIRiskGenerator::resolveOwnerId()` picks the AI-generated risk's owner in this order: assessment owner → an `admin` in the same corporation → any `super_admin` → any user. It also writes `Risk.corporation_id` from the assessment so the new risk is born tenant-correct. Do not reintroduce the previous global `User::where('role','admin')->first()` pattern — that leaked across tenants.

## AI service

All Anthropic calls funnel through `AIService::callClaudeApi()`. Two model constants:

- `MODEL_DEFAULT = 'claude-opus-4-5'` — complex reasoning. Used by `complianceChatbot()`, `reviewEvidence()`, `validateRiskScores()`, and the generic `callClaude($prompt)` helper consumed by `AIRiskGenerator`.
- `MODEL_ANALYTICAL = 'claude-sonnet-4-20250514'` — long-form prose — exec summaries, gap analysis, control explanations, security config analysis. Used by `generateExecutiveSummary()`, `generateGapAnalysis()`, `explainControl()`, and `analyzeSecurityConfig()`.

Don't change these strings without checking the Anthropic model catalogue and updating both branches.

Other facts:
- `AIService::VERDICT_ADEQUATE` / `VERDICT_PARTIAL` / `VERDICT_INSUFFICIENT` are the canonical evidence verdict strings. Stored values must remain Title Case; `EvidenceScoringService` does its own `strtolower()` normalisation when reading. The frontend matches on the exact strings.
- `Http::withoutVerifying()` is intentional — Laragon's local CA bundle doesn't validate the Anthropic cert. Don't "fix" without testing on the local Windows/Laragon dev environment.
- API key: `config('services.anthropic.key')` ← `ANTHROPIC_API_KEY` env var.
- `analyzeSecurityConfig()` exists and is the AI half of the security-audit feature; the `AnalyzeSecurityConfigJob` is queued. Other long-running consumers (evidence review, gap analysis, exec summary) run **inline** in HTTP requests today; there's a `TODO(perf)` to queue them — `AnalyzeSecurityConfigJob` is the template if you want to move others.

## Domain model (read this before touching scoring/aggregation code)

- `Framework` 1—n `Control`. Frameworks seeded: ISO27001, NIST 800-53, OWASP ASVS, CIS Benchmarks (per-framework seeders 50–80KB each).
- `Assessment` 1—n `AssessmentItem` (one per `Control`). Statuses: `draft` / `in_progress` / `completed`. `compliance_percentage` and `evidence_weighted_score` are denormalised — recalc via `Assessment::recalculateCompliance()` and `recalculateEvidenceWeightedScore()`.
- `Evidence` belongs to `AssessmentItem` **or** a `Control` directly (`control_id`), and optionally a `ControlStatusRequest`. Carries AI review fields (`ai_verdict`, `ai_confidence`, `ai_strengths`, `ai_gaps`, `ai_recommendation`, `ai_is_relevant`).
- `Risk` ↔ `Control` many-to-many via `control_risk` pivot (`link_type`, `link_reason`, `auto_linked`). `Risk::source_control_id` points at the control that triggered an AI-generated risk. `Risk.corporation_id` carries tenant ownership.
- `ControlStatusRequest` is the human workflow: a user proposes a status change → a reviewer (super_admin/admin/auditor) approves/rejects. Approval auto-syncs `controls.current_status` and writes `ControlStatusHistory`.
- `RiskAppetite` is per-corporation (see "Risk Appetite"). `classifyRisk()` returns a band (`acceptable` / `review` / `escalated`).
- `RiskTreatmentPlan` and `RemediationTask` track mitigation work tied to risks. `RemediationTask.corporation_id` is on the table.
- `KriSnapshot` is a once-per-day frozen metrics row for trend charts; created by `TakeKriSnapshotJob` at 02:15.
- `SecurityAudit` + `SecurityAuditFinding`: file uploads (configs/PDFs/images) processed asynchronously by `AnalyzeSecurityConfigJob` → AI returns findings + severity counts + framework references.
- `Corporation` + `CorporationRegistration`: self-serve onboarding with super_admin approval, then auto-generated manager credentials.

## Cross-cutting invariants — DO NOT silently drift these

- **Risk levels** come from `Risk::levelThresholds()`: `critical ≥ 15`, `high ≥ 10`, `medium ≥ 5`, `low < 5` (score = `likelihood × impact`, both 1–5). The same thresholds are inlined into raw SQL `selectRaw` calls in `GrcMetricsService` and the dashboard. Change them everywhere if you change them.
- **Compliance percentage** formula: `(compliant + 0.5 × partial) / applicable × 100`. Lives in `Assessment::recalculateCompliance()`, `GrcMetricsService::complianceSummary()`, and `frameworkCompliance()`. Keep them identical.
- **AI evidence verdicts** are exact strings: `Adequate`, `Partially Adequate`, `Insufficient` (constants on `AIService`). Stored Title Case; the frontend matches on the exact string.
- **AI evidence multipliers** (in `EvidenceScoringService`): `adequate=1.0`, `partially adequate=0.75`, `insufficient=0.5`. No-evidence is also treated as 0.5.
- **Dates**: `AppServiceProvider::configureDefaults` does `Date::use(CarbonImmutable::class)`. All dates returned by Eloquent are immutable — mutate by reassignment (`$d = $d->addDay()`), not in place.
- **Production password rules** (`AppServiceProvider`): min 12, mixed case, letters, numbers, symbols, uncompromised. Local/dev gets no defaults.

## Background jobs & cache

- Default `QUEUE_CONNECTION=sync` in `.env.example` — jobs run inline locally. The composer `dev` script also starts `queue:listen` so anything that does dispatch to a real queue still gets picked up.
- Scheduled jobs are defined in `routes/console.php`, all daily at 02:00 (`CheckExpiredEvidenceJob`, `CheckExpiringEvidenceJob`, `CheckOverdueRisksJob`, `CheckOverdueAssessmentsJob`) plus `TakeKriSnapshotJob` at 02:15. The "Last scheduler run" timestamp shown on the dashboard is `Cache::get('scheduler_last_run')`, written by both the scheduler and `scheduler:run-now`.
- `HandleInertiaRequests` caches three notification badges (`badge:pending_approvals:{tenantTag}`, `badge:open_remediation_tasks:{tenantTag}`, `badge:security_audits_in_progress:{userId}`) for 30–60s. Bust manually via `Cache::forget()` when a UI needs an immediate refresh.

## Frontend role guidance

`resources/js/types/auth.ts` declares the canonical role union and labels:

```ts
export type Role = 'super_admin' | 'admin' | 'auditor' | 'user';
export const ROLE_LABELS: Record<Role, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    auditor: 'Auditor',
    user: 'User',
};
```

UI visibility rules:

- **Platform / global admin UI** — visible only to `super_admin`. The sidebar splits this into a separate "Platform" section (Corporations, Frameworks, Controls Library) below the per-corporation "Administration" section.
- **User management UI** — visible to `super_admin` and `admin`.
- **Operational create/edit UI** — visible to `super_admin`, `admin`, `user` (e.g. risk create/edit, assessment edit, evidence upload, remediation tasks, AI assistance).
- **Review UI** — visible to `super_admin`, `admin`, `auditor` (approval queue, evidence review, audit logs).
- **Risk Appetite write UI** — visible to `super_admin` and `admin`. `admin` automatically operates on their own corporation; `super_admin` gets a corporation picker.

No production frontend authorization check uses `manager`, `employee`, or `corporate_manager`. Every per-page `canEdit` / `canReview` / `isAdmin` check has been updated to recognise `super_admin` alongside the relevant org role. Files updated for this: `components/admin/sidebar.tsx`, `components/ui/command-palette.tsx`, `pages/admin/users/{index,create,edit}.tsx`, `pages/risk-appetite/index.tsx`, `pages/corporate/team-members.tsx`, `pages/{assessments,risks,evidence,remediation-tasks,controls/hub}.tsx`, `pages/risks/show.tsx`, `pages/assessments/show.tsx`.

Backend tenant scoping is the **source of truth**. Frontend role checks only hide UI; they do not authorise — controllers and route middleware do.

## Frontend styling

- Tailwind v4 via `@tailwindcss/vite`. Theme tokens are CSS custom properties consumed via Tailwind utility classes (`bg-card`, `text-foreground`, `border-border`, `bg-primary`, etc.).
- `enforce-vercel-style.cjs` is a one-shot codemod that rewrites raw `text-gray-*`/`bg-gray-*`/`bg-white`/`dark:*-gray-*` patterns to semantic tokens. Prefer semantic tokens directly when adding new components — don't introduce raw `gray-*` classes that the codemod would have to clean up later.
- ESLint enforces ordered imports (`import/order`, alphabetical within group) and `import type` for type-only imports (`consistent-type-imports`, top-level grouping). Prettier auto-orders Tailwind classes (`prettier-plugin-tailwindcss`); `clsx` / `cn` / `cva` calls are also reordered.

## Tests

- Pest 4 with `RefreshDatabase` (`tests/Pest.php`) bound to the Feature suite.
- Test DB is SQLite in-memory (`phpunit.xml`). Anything that depends on MySQL-only SQL (e.g. `DATE_FORMAT`, `LIKELIHOOD * IMPACT` raw expressions in selectRaw, `ALTER TABLE … MODIFY COLUMN`) will fail in tests — wrap with a driver check or skip when adding such queries to test paths.
- CI matrix: PHP 8.4 and 8.5 (composer.json declares `^8.2`).

## Do-not-regress notes

- Do **not** reintroduce `manager`, `employee`, or `corporate_manager` as final roles, route middleware, frontend role checks, or controller authorization. They survive only inside the legacy-remap migration and the `SyncUserRoles` mapping table.
- Do **not** make `admin` globally unscoped. `User::organisationScope` keeps `admin` confined to their corporation; only `super_admin` is unscoped.
- Do **not** let `admin` create `admin` or `super_admin` accounts. Backend-enforce via `Admin/UserController`'s `Rule::in($grantable)` validation; the corp-admin grantable set is `['auditor', 'user']`.
- Do **not** hardcode `admin@grc.com` as platform-owner logic. Look up super_admins via `User::role(User::ROLE_SUPER_ADMIN)`. The only intentional `admin@grc.com` reference is the seeder's identity match and the `SyncUserRoles` platform-owner heal.
- Do **not** make Risk Appetite global again. There is no `RiskAppetite::getActive()` (no-arg) anymore — use `getActiveForCorporation($id)` or `getActiveForUser($user)`.
- Do **not** let corporation admins edit global frameworks or controls. Those routes are inside `role:super_admin`.
- Do **not** rely only on frontend role filtering. Backend enforces tenant scoping (`organisationScope`, `canAdminister`, controller `ensureCanManage` patterns).
- Do **not** drop `is_corporation_manager`, `manager_username`, or `manager_password` in this RBAC pass. Removing them is a separate cleanup migration and must be planned with a code-wide audit (Fortify auth still uses `manager_username`).

## Verification checklist

When you change RBAC, tenant scoping, or risk-appetite code, run:

```bash
php artisan migrate
php artisan db:seed
php artisan permission:cache-reset
php artisan users:sync-roles
php artisan route:list --columns=method,uri,name,action,middleware
npm run types:check
npm run lint:check
vendor/bin/pest --stop-on-failure
```

Static checks (should produce no hits outside the legacy-remap migration and the `SyncUserRoles` mapping table):

```bash
rg -n "'manager'|'employee'|\"manager\"|\"employee\"|corporate_manager" app resources/js routes database
rg -n "role:.*manager|role:.*employee|role:.*corporate_manager" routes app
rg -n "assignRole\(['\"]manager['\"]|assignRole\(['\"]employee['\"]" app database
rg -n "role\s*===\s*['\"]employee['\"]|role\s*===\s*['\"]manager['\"]" resources/js
rg -n "admin@grc\.com" app database
```

## Known follow-ups

- **Per-corporation framework/control customization** is not implemented. Today, frameworks and controls are global and only super_admin can edit them. If a tenant needs to override a control's text, weight, or set, design either a `corporation_id` column on `frameworks`/`controls` or a per-corporation cloned-control-set table, then scope read paths.
- **Long-running AI consumers** (`reviewEvidence`, `generateGapAnalysis`, `generateExecutiveSummary`) still run inline in HTTP requests. `TODO(perf)` in `AIService::callClaudeApi`. `AnalyzeSecurityConfigJob` is the queued template.
- **`SecurityAudit` table has no `corporation_id` column.** Tenant scoping currently goes through the uploading user's `corporation_id` via the `user` relation (in `HandleInertiaRequests` and the relevant controllers). A future migration should add `corporation_id` directly so destructive operations can be scoped without the join.
- **`ALTER TABLE controls MODIFY COLUMN`** in `database/migrations/2026_03_23_000005_add_partially_compliant_to_controls_status.php` is MySQL-only and breaks `pest` because the test runner uses SQLite in-memory. Either rewrite that migration to be driver-aware (mirror the pattern in `2026_04_28_203218_widen_users_role_to_string.php`) or run the suite against MySQL.
- **Legacy column cleanup** (`is_corporation_manager`, `manager_username`, `manager_password`, the `users.role` legacy column itself, and the `SyncUserRoles` command) is intentionally deferred — Fortify auth still relies on `manager_username`. A later cleanup pass should drop these once `users.role` is removed in favour of Spatie-only role storage.
