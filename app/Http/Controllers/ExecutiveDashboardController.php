<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\AuditLog;
use App\Models\Control;
use App\Models\Evidence;
use App\Models\Framework;
use App\Models\KriSnapshot;
use App\Models\Risk;
use App\Services\RiskMetricsService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExecutiveDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('executive-dashboard', $this->buildData());
    }

    public function export()
    {
        $data = $this->buildData();

        AuditLog::record('exported', 'Report', 0, 'Executive Dashboard PDF exported');

        $pdf = Pdf::loadView('reports.executive-dashboard', array_merge($data, [
            'generatedAt' => now()->format('Y-m-d H:i'),
        ]));

        $pdf->setPaper('A4', 'portrait');
        return $pdf->download('executive-dashboard-' . now()->format('Y-m-d') . '.pdf');
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private function buildData(): array
    {
        $metrics = new RiskMetricsService();

        // 1. Health Score
        $healthScore = $metrics->calculateHealthScore();

        // 2. Compliance Summary (live from controls table)
        $applicable   = Control::where('is_active', true)->where('current_status', '!=', 'not_applicable');
        $total        = (clone $applicable)->count();
        $compliant    = (clone $applicable)->where('current_status', 'compliant')->count();
        $partial      = (clone $applicable)->where('current_status', 'partially_compliant')->count();
        $nonCompliant = (clone $applicable)->where('current_status', 'non_compliant')->count();
        $compliancePct = $total > 0
            ? round((($compliant + ($partial * 0.5)) / $total) * 100, 1)
            : 0;

        $complianceSummary = [
            'overall_pct'    => $compliancePct,
            'compliant'      => $compliant,
            'partial'        => $partial,
            'non_compliant'  => $nonCompliant,
            'not_applicable' => Control::where('is_active', true)
                ->where('current_status', 'not_applicable')->count(),
            'total_controls' => $total,
        ];

        // 3. Risk Summary
        $allRisks = Risk::all();
        $topRisks = Risk::with('treatmentPlans')
            ->orderByRaw('likelihood * impact DESC')
            ->limit(5)
            ->get()
            ->map(fn ($r) => [
                'title'         => $r->title,
                'likelihood'    => $r->likelihood,
                'impact'        => $r->impact,
                'score'         => $r->risk_score,
                'level'         => $r->risk_level,
                'status'        => $r->status,
                'has_treatment' => $r->treatmentPlans->isNotEmpty(),
            ]);

        $riskSummary = [
            'total_open' => $allRisks->whereIn('status', ['open', 'in_progress'])->count(),
            'critical'   => $allRisks->filter(fn ($r) => $r->risk_level === 'critical')->count(),
            'high'       => $allRisks->filter(fn ($r) => $r->risk_level === 'high')->count(),
            'medium'     => $allRisks->filter(fn ($r) => $r->risk_level === 'medium')->count(),
            'low'        => $allRisks->filter(fn ($r) => $r->risk_level === 'low')->count(),
            'avg_score'  => round($allRisks->avg(fn ($r) => $r->risk_score) ?? 0, 1),
            'top_risks'  => $topRisks,
        ];

        // 4. Evidence Summary
        $now = now();
        $evidenceSummary = [
            'total'         => Evidence::count(),
            'approved'      => Evidence::where('status', 'approved')->count(),
            'pending'       => Evidence::where('status', 'pending')->count(),
            'rejected'      => Evidence::where('status', 'rejected')->count(),
            'expiring_soon' => Evidence::whereNotNull('expiry_date')
                ->where('expiry_date', '>=', $now)
                ->where('expiry_date', '<=', $now->copy()->addDays(14))
                ->count(),
            'expired' => Evidence::whereNotNull('expiry_date')
                ->where('expiry_date', '<', $now)
                ->count(),
        ];

        // 5. Assessment Summary
        $latestAssessment = Assessment::with('framework')->latest()->first();
        $assessmentSummary = [
            'total'            => Assessment::count(),
            'completed'        => Assessment::where('status', 'completed')->count(),
            'in_progress'      => Assessment::where('status', 'in_progress')->count(),
            'overdue'          => Assessment::where('status', '!=', 'completed')
                ->whereNotNull('due_date')
                ->where('due_date', '<', $now)
                ->count(),
            'latest_title'     => $latestAssessment?->title,
            'latest_date'      => $latestAssessment?->created_at?->format('Y-m-d'),
            'latest_score'     => $latestAssessment?->compliance_percentage,
            'latest_framework' => $latestAssessment?->framework?->short_name,
        ];

        // 6. Compliance Trend (last 6 KRI snapshots)
        $trend = KriSnapshot::latest('snapshot_date')
            ->limit(6)
            ->get()
            ->sortBy('snapshot_date')
            ->values()
            ->map(fn ($s) => [
                'date'             => $s->snapshot_date->format('M d'),
                'compliance_score' => round((float) $s->compliance_percentage, 1),
                'critical_risks'   => $s->open_risks_critical,
            ]);

        // 7. Framework Breakdown (compliance per framework via controls table)
        $frameworkBreakdown = Framework::where('is_active', true)
            ->with(['controls' => fn ($q) => $q->where('is_active', true)])
            ->get()
            ->map(function ($fw) {
                $controls   = $fw->controls;
                $applicable = $controls->filter(
                    fn ($c) => !in_array($c->current_status, [null, 'not_applicable'])
                );
                $compliantC    = $applicable->where('current_status', 'compliant')->count();
                $partialC      = $applicable->where('current_status', 'partially_compliant')->count();
                $nonCompliantC = $applicable->where('current_status', 'non_compliant')->count();
                $totalAppl     = $applicable->count();
                $pct           = $totalAppl > 0
                    ? round((($compliantC + ($partialC * 0.5)) / $totalAppl) * 100, 1)
                    : 0;

                return [
                    'name'           => $fw->short_name,
                    'full_name'      => $fw->name,
                    'total_controls' => $controls->count(),
                    'compliant'      => $compliantC,
                    'partial'        => $partialC,
                    'non_compliant'  => $nonCompliantC,
                    'compliance_pct' => $pct,
                ];
            })
            ->filter(fn ($fw) => $fw['total_controls'] > 0)
            ->values();

        return [
            'healthScore'        => $healthScore,
            'complianceSummary'  => $complianceSummary,
            'riskSummary'        => $riskSummary,
            'evidenceSummary'    => $evidenceSummary,
            'assessmentSummary'  => $assessmentSummary,
            'trend'              => $trend,
            'frameworkBreakdown' => $frameworkBreakdown,
            'generatedAt'        => now()->format('Y-m-d H:i'),
        ];
    }
}
