<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\AuditLog;
use App\Models\Control;
use App\Models\Evidence;
use App\Models\KriSnapshot;
use App\Models\Risk;
use App\Models\SecurityAudit;
use App\Models\User;
use App\Services\AIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ComplianceChatbotController extends Controller
{
    /**
     * Roles allowed to see audit-log excerpts in chatbot context. Mirrors
     * the audit-log review surface (super_admin / admin / auditor).
     */
    private const AUDIT_LOG_ROLES = [
        User::ROLE_SUPER_ADMIN,
        User::ROLE_ADMIN,
        User::ROLE_AUDITOR,
    ];

    /**
     * Build a fresh context snapshot from live database data, scoped to
     * the current user's tenant. Pre-fix this method ran every count and
     * collection against the entire system, leaking other tenants' risk
     * titles, audit log lines, and compliance metrics into the page prop
     * and into the prompt sent to Anthropic.
     */
    private function buildContext(User $user): array
    {
        $isReviewer = in_array($user->role, self::AUDIT_LOG_ROLES, true)
            || $user->hasAnyRole(self::AUDIT_LOG_ROLES);

        // Tenant-scoped Risk query.
        $topRisks = $user->organisationScope(Risk::query())
            ->whereIn('status', ['open', 'in_progress'])
            ->orderByRaw('likelihood * impact DESC')
            ->limit(5)
            ->get()
            ->map(fn ($r) => [
                'title' => $r->title,
                'level' => $r->risk_level,
                'score' => $r->risk_score,
                'likelihood' => $r->likelihood,
                'impact' => $r->impact,
                'treatment' => $r->treatment,
                'status' => $r->status,
            ]);

        // Long-non-compliant controls. Controls are global reference data,
        // but a control's relevance to this tenant is decided by whether
        // the tenant's most recent assessment flagged it. Restrict to
        // controls that appear in this tenant's assessment_items.
        $longNonCompliantQ = Control::where('current_status', 'non_compliant')
            ->where('is_active', true)
            ->where('updated_at', '<', now()->subDays(30));

        if (! $user->isSuperAdmin()) {
            $corpId = $user->corporation_id;
            $longNonCompliantQ->whereExists(function ($q) use ($corpId) {
                $q->select(\Illuminate\Support\Facades\DB::raw(1))
                    ->from('assessment_items')
                    ->join('assessments', 'assessments.id', '=', 'assessment_items.assessment_id')
                    ->whereColumn('assessment_items.control_id', 'controls.id')
                    ->where('assessments.corporation_id', $corpId);
            });
        }

        $longNonCompliant = $longNonCompliantQ
            ->orderBy('updated_at')
            ->limit(20)
            ->get(['id', 'control_id', 'title', 'updated_at'])
            ->map(fn ($c) => [
                'name' => $c->control_id.': '.$c->title,
                'days_non_compliant' => (int) now()->diffInDays($c->updated_at),
            ]);

        // Audit logs are sensitive — only reviewers see them. Non-reviewers
        // get an empty list so the prompt never includes audit lines from
        // their own tenant either (the audit-log review boundary applies
        // to chatbot output as well).
        $recentAuditLogs = $isReviewer
            ? $this->scopedAuditLogs($user)
            : collect();

        // Risk count by tenant.
        $totalOpenRisks = $user->organisationScope(Risk::query())
            ->whereIn('status', ['open', 'in_progress'])
            ->count();

        $overdueRisks = $user->organisationScope(Risk::query())
            ->where('due_date', '<', now())
            ->whereNotIn('status', ['closed'])
            ->count();

        $compliancePercentage = round(
            $user->organisationScope(Assessment::query())->avg('compliance_percentage') ?? 0,
            1,
        );

        $overdueAssessments = $user->organisationScope(Assessment::query())
            ->where('status', '!=', 'completed')
            ->whereNotNull('due_date')
            ->where('due_date', '<', now())
            ->count();

        // Evidence: scope through parent assessment's tenant. Falls back
        // to uploader's corp for evidence with no assessment context.
        $applyEvidenceScope = function ($q) use ($user) {
            if ($user->isSuperAdmin()) {
                return $q;
            }
            $corpId = $user->corporation_id;

            return $q->where(function ($outer) use ($corpId) {
                $outer->whereHas('assessmentItem.assessment', fn ($a) => $a->where('corporation_id', $corpId))
                    ->orWhere(function ($alt) use ($corpId) {
                        $alt->whereDoesntHave('assessmentItem')
                            ->whereHas('user', fn ($u) => $u->where('corporation_id', $corpId));
                    });
            });
        };

        $expiringEvidence = $applyEvidenceScope(Evidence::query())
            ->whereNotNull('expiry_date')
            ->whereBetween('expiry_date', [now()->toDateString(), now()->addDays(14)->toDateString()])
            ->count();

        $verdictCount = fn (?string $verdict) => $applyEvidenceScope(Evidence::query())
            ->when($verdict !== null, fn ($q) => $q->where('ai_verdict', $verdict))
            ->when($verdict === null, fn ($q) => $q->whereNull('ai_verdict'))
            ->count();

        // Security audits: corporation_id added in Phase 3 migration.
        $auditScope = fn () => $user->organisationScope(SecurityAudit::query());

        $recentSecurityAudits = $auditScope()
            ->where('status', 'completed')
            ->latest('analyzed_at')
            ->limit(5)
            ->get(['id', 'file_name', 'compliance_score', 'critical_count', 'high_count', 'total_findings', 'analyzed_at'])
            ->map(fn ($a) => [
                'file_name' => $a->file_name,
                'compliance_score' => $a->compliance_score,
                'critical_findings' => $a->critical_count,
                'high_findings' => $a->high_count,
                'total_findings' => $a->total_findings,
                'analyzed_at' => $a->analyzed_at?->toDateTimeString(),
            ]);

        // KRI snapshots are now stored per-tenant. super_admin sees the
        // platform-wide latest row; tenant reviewers see their corporation's
        // snapshot; everyone else gets null.
        $lastKri = null;
        if ($isReviewer) {
            $kriQuery = KriSnapshot::latest('snapshot_date');
            if (! $user->isSuperAdmin()) {
                $kriQuery->where('corporation_id', $user->corporation_id);
            }
            $lastKri = $kriQuery->first();
        }

        return [
            'snapshot_taken_at' => now()->toDateTimeString(),
            'controls' => [
                // Counts of tenant-relevant controls (= controls assessed by
                // this tenant) — for super_admin we keep the global numbers.
                'total' => $this->scopedControlCount($user, fn ($q) => $q->where('controls.is_active', true)),
                'compliant' => $this->scopedControlCount($user, fn ($q) => $this->whereEffectiveStatus($q, $user, 'compliant')->where('controls.is_active', true)),
                'non_compliant' => $this->scopedControlCount($user, fn ($q) => $this->whereEffectiveStatus($q, $user, 'non_compliant')->where('controls.is_active', true)),
                'partially_compliant' => $this->scopedControlCount($user, fn ($q) => $this->whereEffectiveStatus($q, $user, 'partially_compliant')->where('controls.is_active', true)),
                'compliance_percentage' => $compliancePercentage,
            ],
            'risks' => [
                'total_open' => $totalOpenRisks,
                'overdue' => $overdueRisks,
                'top_5_highest_severity' => $topRisks,
            ],
            'controls_non_compliant_over_30_days' => $longNonCompliant,
            'assessments' => [
                'overdue' => $overdueAssessments,
            ],
            'evidence' => [
                'expiring_in_14_days' => $expiringEvidence,
                'ai_verdict_summary' => [
                    'adequate' => $verdictCount('Adequate'),
                    'partially_adequate' => $verdictCount('Partially Adequate'),
                    'insufficient' => $verdictCount('Insufficient'),
                    'not_yet_reviewed' => $verdictCount(null),
                ],
            ],
            'recent_audit_logs' => $recentAuditLogs,
            'security_audits' => [
                'total_completed' => $auditScope()->where('status', 'completed')->count(),
                'in_progress' => $auditScope()->whereIn('status', ['pending', 'analyzing'])->count(),
                'critical_findings_total' => (int) $auditScope()->sum('critical_count'),
                'high_findings_total' => (int) $auditScope()->sum('high_count'),
                'recent' => $recentSecurityAudits,
            ],
            'last_kri_snapshot' => $lastKri ? [
                'date' => $lastKri->snapshot_date->toDateString(),
                'compliance_percentage' => $lastKri->compliance_percentage,
                'open_risks_critical' => $lastKri->open_risks_critical,
                'open_risks_high' => $lastKri->open_risks_high,
                'open_risks_medium' => $lastKri->open_risks_medium,
                'open_risks_low' => $lastKri->open_risks_low,
                'overdue_risks' => $lastKri->overdue_risks,
                'overdue_assessments' => $lastKri->overdue_assessments,
                'evidence_approval_rate' => $lastKri->evidence_approval_rate,
                'total_risks' => $lastKri->total_risks,
                'total_controls' => $lastKri->total_controls,
                'compliant_controls' => $lastKri->compliant_controls,
            ] : null,
            'current_user_role' => $user->role,
        ];
    }

    /**
     * Audit-log selection scoped to the user's tenant. The audit_logs
     * table currently has no corporation_id column, so we filter by the
     * acting user's corporation when their user_id is recorded. super_admin
     * sees everything.
     */
    private function scopedAuditLogs(User $user)
    {
        $q = AuditLog::query()->latest()->limit(10);

        if (! $user->isSuperAdmin()) {
            $corpId = $user->corporation_id;
            // Only include audit log rows whose actor belongs to this
            // tenant. Anonymous / system rows (user_id null) are excluded
            // to avoid leaking platform-wide actions.
            $q->whereExists(function ($sq) use ($corpId) {
                $sq->select(\Illuminate\Support\Facades\DB::raw(1))
                    ->from('users')
                    ->whereColumn('users.id', 'audit_logs.user_id')
                    ->where('users.corporation_id', $corpId);
            });
        }

        return $q
            ->get(['action', 'model_type', 'model_id', 'description', 'created_at'])
            ->map(fn ($l) => [
                'action' => $l->action,
                'type' => $l->model_type,
                'description' => $l->description,
                'at' => $l->created_at->toDateTimeString(),
            ]);
    }

    /**
     * Tenant-scoped control count: counts controls referenced by the
     * caller's assessments. super_admin sees the full library counts.
     */
    private function scopedControlCount(User $user, callable $modifier): int
    {
        $q = Control::query();
        $modifier($q);

        if (! $user->isSuperAdmin()) {
            $corpId = $user->corporation_id;
            $q->whereExists(function ($sub) use ($corpId) {
                $sub->select(\Illuminate\Support\Facades\DB::raw(1))
                    ->from('assessment_items')
                    ->join('assessments', 'assessments.id', '=', 'assessment_items.assessment_id')
                    ->whereColumn('assessment_items.control_id', 'controls.id')
                    ->where('assessments.corporation_id', $corpId);
            });
        }

        return $q->count();
    }

    /**
     * Filter controls by effective status, using the per-tenant pivot for
     * tenant-scoped users and the legacy global field for super_admin.
     */
    private function whereEffectiveStatus($query, User $user, string $status)
    {
        if ($user->isSuperAdmin()) {
            return $query->where('controls.current_status', $status);
        }

        $corpId = $user->corporation_id;

        return $query->where(function ($q) use ($corpId, $status) {
            $q->whereExists(function ($sub) use ($corpId, $status) {
                $sub->select(\Illuminate\Support\Facades\DB::raw(1))
                    ->from('corporation_control_statuses as ccs')
                    ->whereColumn('ccs.control_id', 'controls.id')
                    ->where('ccs.corporation_id', $corpId)
                    ->where('ccs.current_status', $status);
            })->orWhere(function ($qq) use ($corpId, $status) {
                $qq->where('controls.current_status', $status)
                    ->whereNotExists(function ($sub) use ($corpId) {
                        $sub->select(\Illuminate\Support\Facades\DB::raw(1))
                            ->from('corporation_control_statuses as ccs2')
                            ->whereColumn('ccs2.control_id', 'controls.id')
                            ->where('ccs2.corporation_id', $corpId);
                    });
            });
        });
    }

    public function index(): Response
    {
        $user = Auth::user();
        // Even on the GET-render path the context must be tenant-scoped:
        // it ships in Inertia page props and would otherwise leak through
        // the page payload regardless of what the React component renders.
        $context = $this->buildContext($user);

        return Inertia::render('Chatbot/Index', [
            'context' => $context,
        ]);
    }

    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => 'required|string|max:2000',
            'history' => 'nullable|array|max:100',
            'history.*.role' => 'required|in:user,assistant',
            'history.*.content' => 'required|string|max:10000',
        ]);

        $user = Auth::user();
        $context = $this->buildContext($user);

        $ai = new AIService;
        $reply = $ai->complianceChatbot(
            $validated['message'],
            $context,
            $validated['history'] ?? []
        );

        if (empty($reply)) {
            return response()->json([
                'reply' => 'I encountered an error connecting to the AI service. Please try again in a moment.',
                'snapshot_taken_at' => $context['snapshot_taken_at'],
                'error' => true,
            ]);
        }

        return response()->json([
            'reply' => $reply,
            'snapshot_taken_at' => $context['snapshot_taken_at'],
        ]);
    }
}
