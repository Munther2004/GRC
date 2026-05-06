<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\AuditLog;
use App\Models\Control;
use App\Models\Evidence;
use App\Models\KriSnapshot;
use App\Models\Risk;
use App\Models\SecurityAudit;
use App\Services\AIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ComplianceChatbotController extends Controller
{
    /**
     * Build a fresh context snapshot from live database data, scoped to the
     * current user's tenant. Sensitive fields (passwords, tokens, emails) are
     * never included.
     *
     * Tenant boundaries:
     *   Risk / Assessment / SecurityAudit → corporation_id via organisationScope.
     *   Evidence / AuditLog               → uploader/actor's corporation_id
     *                                       (no corporation_id column today).
     *   Control / KriSnapshot             → kept global by design — controls
     *                                       are shared platform data and KRI
     *                                       snapshots are platform-wide trend
     *                                       points (single row per day).
     */
    private function buildContext(): array
    {
        $user = Auth::user();
        $corpId = $user->corporation_id;
        $isSuper = $user->isSuperAdmin();

        // Helper: apply uploader-corp filter to Evidence/AuditLog (tables that
        // have a user_id but no corporation_id).
        $applyActorScope = function ($query, string $userIdColumn = 'user_id') use ($isSuper, $corpId) {
            if ($isSuper) {
                return $query;
            }
            if (! $corpId) {
                return $query->whereRaw('1 = 0');
            }
            return $query->whereExists(function ($q) use ($userIdColumn, $corpId, $query) {
                $q->select(\Illuminate\Support\Facades\DB::raw(1))
                    ->from('users')
                    ->whereColumn('users.id', $query->getModel()->getTable().'.'.$userIdColumn)
                    ->where('users.corporation_id', $corpId);
            });
        };

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

        // Controls are shared platform data — these counts are intentionally global.
        $longNonCompliant = Control::where('current_status', 'non_compliant')
            ->where('is_active', true)
            ->where('updated_at', '<', now()->subDays(30))
            ->orderBy('updated_at')
            ->limit(20)
            ->get(['control_id', 'title', 'updated_at'])
            ->map(fn ($c) => [
                'name' => $c->control_id.': '.$c->title,
                'days_non_compliant' => (int) now()->diffInDays($c->updated_at),
            ]);

        $recentAuditLogs = $applyActorScope(AuditLog::query())
            ->latest()
            ->limit(10)
            ->get(['action', 'model_type', 'model_id', 'description', 'created_at'])
            ->map(fn ($l) => [
                'action' => $l->action,
                'type' => $l->model_type,
                'description' => $l->description,
                'at' => $l->created_at->toDateTimeString(),
            ]);

        $lastKri = KriSnapshot::latest('snapshot_date')->first();

        $recentSecurityAudits = $user->organisationScope(SecurityAudit::query())
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

        return [
            'snapshot_taken_at' => now()->toDateTimeString(),
            'controls' => [
                // Global by design (shared platform data).
                'total' => Control::where('is_active', true)->count(),
                'compliant' => Control::where('current_status', 'compliant')->where('is_active', true)->count(),
                'non_compliant' => Control::where('current_status', 'non_compliant')->where('is_active', true)->count(),
                'partially_compliant' => Control::where('current_status', 'partially_compliant')->where('is_active', true)->count(),
                // Tenant-scoped: only this corp's assessments contribute to the average.
                'compliance_percentage' => round((float) ($user->organisationScope(Assessment::query())->avg('compliance_percentage') ?? 0), 1),
            ],
            'risks' => [
                'total_open' => $user->organisationScope(Risk::query())->whereIn('status', ['open', 'in_progress'])->count(),
                'overdue' => $user->organisationScope(Risk::query())->where('due_date', '<', now())->whereNotIn('status', ['closed'])->count(),
                'top_5_highest_severity' => $topRisks,
            ],
            'controls_non_compliant_over_30_days' => $longNonCompliant,
            'assessments' => [
                'overdue' => $user->organisationScope(Assessment::query())
                    ->where('status', '!=', 'completed')
                    ->whereNotNull('due_date')
                    ->where('due_date', '<', now())
                    ->count(),
            ],
            'evidence' => [
                'expiring_in_14_days' => $applyActorScope(Evidence::query())
                    ->whereNotNull('expiry_date')
                    ->whereBetween('expiry_date', [now()->toDateString(), now()->addDays(14)->toDateString()])
                    ->count(),
                'ai_verdict_summary' => [
                    'adequate' => $applyActorScope(Evidence::query())->where('ai_verdict', 'Adequate')->count(),
                    'partially_adequate' => $applyActorScope(Evidence::query())->where('ai_verdict', 'Partially Adequate')->count(),
                    'insufficient' => $applyActorScope(Evidence::query())->where('ai_verdict', 'Insufficient')->count(),
                    'not_yet_reviewed' => $applyActorScope(Evidence::query())->whereNull('ai_verdict')->count(),
                ],
            ],
            'recent_audit_logs' => $recentAuditLogs,
            'security_audits' => [
                'total_completed' => $user->organisationScope(SecurityAudit::query())->where('status', 'completed')->count(),
                'in_progress' => $user->organisationScope(SecurityAudit::query())->whereIn('status', ['pending', 'analyzing'])->count(),
                'critical_findings_total' => (int) $user->organisationScope(SecurityAudit::query())->sum('critical_count'),
                'high_findings_total' => (int) $user->organisationScope(SecurityAudit::query())->sum('high_count'),
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

    public function index(): Response
    {
        $context = $this->buildContext();

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

        $context = $this->buildContext();

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
