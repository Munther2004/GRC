<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\AuditLog;
use App\Models\Evidence;
use App\Models\KriSnapshot;
use App\Models\Risk;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $risks = Risk::all();

        $stats = [
            'total_risks' => $risks->count(),
            'critical_risks' => $risks->filter(fn ($r) => $r->risk_level === 'critical')->count(),
            'high_risks' => $risks->filter(fn ($r) => $r->risk_level === 'high')->count(),
            'medium_risks' => $risks->filter(fn ($r) => $r->risk_level === 'medium')->count(),
            'low_risks' => $risks->filter(fn ($r) => $r->risk_level === 'low')->count(),
            'open_risks' => $risks->whereIn('status', ['open', 'in_progress'])->count(),
            'compliance_score' => Assessment::avg('compliance_percentage') ?? 0,
            'total_assessments' => Assessment::count(),
            'evidence_files' => Evidence::count(),
            'pending_evidence' => Evidence::where('status', 'pending')->count(),
        ];

        $recentRisks = Risk::latest()->limit(5)->get()->map(fn ($r) => [
            'id' => $r->id,
            'title' => $r->title,
            'category' => $r->category,
            'owner' => $r->owner,
            'impact' => $r->impact,
            'likelihood' => $r->likelihood,
            'risk_level' => $r->risk_level,
            'risk_score' => $r->risk_score,
            'status' => $r->status,
        ]);

        $recentActivity = AuditLog::latest()->limit(8)->get()->map(fn ($l) => [
            'id' => $l->id,
            'description' => $l->description,
            'user_name' => $l->user_name,
            'action' => $l->action,
            'created_at' => $l->created_at->diffForHumans(),
        ]);

        $recentAssessments = Assessment::with('framework')->latest()->limit(5)->get()->map(fn ($a) => [
            'id' => $a->id,
            'title' => $a->title,
            'status' => $a->status,
            'compliance_percentage' => $a->compliance_percentage,
            'created_at' => $a->created_at->diffForHumans(),
            'framework' => ['short_name' => $a->framework->short_name],
        ]);

        // Risk trend - group by month
        $trendData = Risk::selectRaw('DATE_FORMAT(created_at, "%b") as month, 
        SUM(CASE WHEN likelihood * impact >= 15 THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN likelihood * impact >= 10 AND likelihood * impact < 15 THEN 1 ELSE 0 END) as high,
        SUM(CASE WHEN likelihood * impact >= 5 AND likelihood * impact < 10 THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN likelihood * impact < 5 THEN 1 ELSE 0 END) as low')
            ->groupByRaw('DATE_FORMAT(created_at, "%b"), MONTH(created_at)')
            ->orderByRaw('MONTH(created_at)')
            ->get();

        $heatmap = $risks->map(fn ($r) => [
            'id' => $r->id,
            'title' => $r->title,
            'likelihood' => $r->likelihood,
            'impact' => $r->impact,
            'score' => $r->likelihood * $r->impact,
            'status' => $r->status,
        ])->toArray();

        $kpis = [
            'evidence_approval_rate' => Evidence::count() > 0
                ? round((Evidence::where('status', 'approved')->count() / Evidence::count()) * 100, 1)
                : 0,
            'open_risks_by_level' => [
                'critical' => Risk::where('status', 'open')->whereRaw('likelihood * impact >= 20')->count(),
                'high' => Risk::where('status', 'open')->whereRaw('likelihood * impact >= 13')->whereRaw('likelihood * impact < 20')->count(),
                'medium' => Risk::where('status', 'open')->whereRaw('likelihood * impact >= 7')->whereRaw('likelihood * impact < 13')->count(),
                'low' => Risk::where('status', 'open')->whereRaw('likelihood * impact < 7')->count(),
            ],
            'assessments_due_soon' => Assessment::where('status', '!=', 'completed')
                ->whereNotNull('due_date')
                ->where('due_date', '<=', now()->addDays(7))
                ->where('due_date', '>=', now())
                ->count(),
            'pending_evidence' => Evidence::where('status', 'pending')->count(),
            'compliance_this_week' => round(
                Assessment::where('status', 'completed')
                    ->where('updated_at', '>=', now()->subWeek())
                    ->avg('compliance_percentage') ?? 0, 1
            ),
            'compliance_last_week' => round(
                Assessment::where('status', 'completed')
                    ->whereBetween('updated_at', [now()->subWeeks(2), now()->subWeek()])
                    ->avg('compliance_percentage') ?? 0, 1
            ),
        ];

        $ruleAdjustments = AuditLog::where(function ($q) {
            $q->where('description', 'like', 'Rule 1:%')
                ->orWhere('description', 'like', 'Rule 2:%');
        })->where('created_at', '>=', now()->subDays(30))->count();

        $kriSnapshots = KriSnapshot::latest('snapshot_date')
            ->limit(12)
            ->get()
            ->sortBy('snapshot_date')
            ->values()
            ->map(fn ($s) => [
                'snapshot_date' => $s->snapshot_date->toDateString(),
                'compliance_percentage' => $s->compliance_percentage,
                'open_risks_critical' => $s->open_risks_critical,
                'open_risks_high' => $s->open_risks_high,
                'open_risks_medium' => $s->open_risks_medium,
                'open_risks_low' => $s->open_risks_low,
                'overdue_risks' => $s->overdue_risks,
                'overdue_assessments' => $s->overdue_assessments,
                'evidence_approval_rate' => $s->evidence_approval_rate,
                'ai_generated_risks' => $s->ai_generated_risks,
                'total_risks' => $s->total_risks,
                'total_controls' => $s->total_controls,
                'compliant_controls' => $s->compliant_controls,
            ]);

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentRisks' => $recentRisks,
            'recentActivity' => $recentActivity,
            'recentAssessments' => $recentAssessments,
            'trendData' => $trendData,
            'heatmap' => $heatmap,
            'kpis' => $kpis,
            'ruleAdjustments' => $ruleAdjustments,
            'lastSchedulerRun' => Cache::get('scheduler_last_run'),
            'kriSnapshots' => $kriSnapshots,
        ]);
    }
}
