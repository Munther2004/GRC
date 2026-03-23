<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class KriSnapshot extends Model
{
    protected $fillable = [
        'snapshot_date',
        'compliance_percentage',
        'open_risks_critical',
        'open_risks_high',
        'open_risks_medium',
        'open_risks_low',
        'overdue_risks',
        'overdue_assessments',
        'evidence_approval_rate',
        'ai_generated_risks',
        'total_risks',
        'total_controls',
        'compliant_controls',
    ];

    protected $casts = [
        'snapshot_date'          => 'date',
        'compliance_percentage'  => 'float',
        'evidence_approval_rate' => 'float',
    ];

    public static function takeSnapshot(): self
    {
        $totalEvidence = Evidence::count();
        $approvedEvidence = Evidence::where('status', 'approved')->count();

        return static::updateOrCreate(
            ['snapshot_date' => now()->toDateString()],
            [
                'compliance_percentage' => round(
                    Assessment::avg('compliance_percentage') ?? 0, 2
                ),
                'open_risks_critical' => Risk::whereIn('status', ['open', 'in_progress'])
                    ->whereRaw('likelihood * impact >= 20')
                    ->count(),
                'open_risks_high' => Risk::whereIn('status', ['open', 'in_progress'])
                    ->whereRaw('likelihood * impact BETWEEN 13 AND 19')
                    ->count(),
                'open_risks_medium' => Risk::whereIn('status', ['open', 'in_progress'])
                    ->whereRaw('likelihood * impact BETWEEN 7 AND 12')
                    ->count(),
                'open_risks_low' => Risk::whereIn('status', ['open', 'in_progress'])
                    ->whereRaw('likelihood * impact BETWEEN 1 AND 6')
                    ->count(),
                'overdue_risks' => Risk::where('due_date', '<', now())
                    ->whereNotIn('status', ['closed'])
                    ->count(),
                'overdue_assessments' => Assessment::where('status', '!=', 'completed')
                    ->whereNotNull('due_date')
                    ->where('due_date', '<', now())
                    ->count(),
                'evidence_approval_rate' => $totalEvidence > 0
                    ? round(($approvedEvidence / $totalEvidence) * 100, 2)
                    : 0,
                'ai_generated_risks' => Risk::where('auto_generated', 1)->count(),
                'total_risks'        => Risk::count(),
                'total_controls'     => Control::where('is_active', true)->count(),
                'compliant_controls' => DB::table('assessment_items')
                    ->where('compliance_status', 'compliant')
                    ->distinct('control_id')
                    ->count('control_id'),
            ]
        );
    }
}
