<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\AuditLog;
use App\Models\Control;
use App\Models\Evidence;
use App\Models\KriSnapshot;
use App\Models\Risk;
use App\Services\AIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ComplianceChatbotController extends Controller
{
    /**
     * Build a fresh context snapshot from live database data.
     * Sensitive fields (passwords, tokens, emails) are never included.
     */
    private function buildContext(): array
    {
        $topRisks = Risk::whereIn('status', ['open', 'in_progress'])
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

        $recentAuditLogs = AuditLog::latest()
            ->limit(10)
            ->get(['action', 'model_type', 'model_id', 'description', 'created_at'])
            ->map(fn ($l) => [
                'action' => $l->action,
                'type' => $l->model_type,
                'description' => $l->description,
                'at' => $l->created_at->toDateTimeString(),
            ]);

        $lastKri = KriSnapshot::latest('snapshot_date')->first();

        return [
            'snapshot_taken_at' => now()->toDateTimeString(),
            'controls' => [
                'total' => Control::where('is_active', true)->count(),
                'compliant' => Control::where('current_status', 'compliant')->where('is_active', true)->count(),
                'non_compliant' => Control::where('current_status', 'non_compliant')->where('is_active', true)->count(),
                'partially_compliant' => Control::where('current_status', 'partially_compliant')->where('is_active', true)->count(),
                'compliance_percentage' => round(Assessment::avg('compliance_percentage') ?? 0, 1),
            ],
            'risks' => [
                'total_open' => Risk::whereIn('status', ['open', 'in_progress'])->count(),
                'overdue' => Risk::where('due_date', '<', now())->whereNotIn('status', ['closed'])->count(),
                'top_5_highest_severity' => $topRisks,
            ],
            'controls_non_compliant_over_30_days' => $longNonCompliant,
            'assessments' => [
                'overdue' => Assessment::where('status', '!=', 'completed')
                    ->whereNotNull('due_date')
                    ->where('due_date', '<', now())
                    ->count(),
            ],
            'evidence' => [
                'expiring_in_14_days' => Evidence::whereNotNull('expiry_date')
                    ->whereBetween('expiry_date', [now()->toDateString(), now()->addDays(14)->toDateString()])
                    ->count(),
                'ai_verdict_summary' => [
                    'adequate' => Evidence::where('ai_verdict', 'Adequate')->count(),
                    'partially_adequate' => Evidence::where('ai_verdict', 'Partially Adequate')->count(),
                    'insufficient' => Evidence::where('ai_verdict', 'Insufficient')->count(),
                    'not_yet_reviewed' => Evidence::whereNull('ai_verdict')->count(),
                ],
            ],
            'recent_audit_logs' => $recentAuditLogs,
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
            'current_user_role' => Auth::user()->role,
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
