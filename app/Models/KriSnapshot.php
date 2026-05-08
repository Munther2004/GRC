<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KriSnapshot extends Model
{
    protected $fillable = [
        'corporation_id',
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
        'snapshot_date' => 'date',
        'compliance_percentage' => 'float',
        'evidence_approval_rate' => 'float',
    ];

    public function corporation()
    {
        return $this->belongsTo(Corporation::class);
    }

    /**
     * Persist one snapshot per corporation per day. Iterates active
     * corporations and stores each tenant's KRIs scoped to that tenant.
     */
    public static function takeSnapshots(?string $date = null): int
    {
        $date = $date ?? now()->toDateString();

        $count = 0;
        Corporation::query()->each(function (Corporation $corp) use ($date, &$count) {
            static::takeSnapshotFor($corp->id, $date);
            $count++;
        });

        return $count;
    }

    public static function takeSnapshotFor(?int $corporationId, ?string $date = null): self
    {
        $date = $date ?? now()->toDateString();

        $scopedRisks = fn () => Risk::query()
            ->when($corporationId !== null, fn ($q) => $q->where('corporation_id', $corporationId));
        $scopedAssessments = fn () => Assessment::query()
            ->when($corporationId !== null, fn ($q) => $q->where('corporation_id', $corporationId));
        // Evidence has no corporation_id of its own; scope through the
        // uploading user's corporation.
        $scopedEvidence = fn () => Evidence::query()
            ->when($corporationId !== null, fn ($q) => $q->whereExists(function ($sub) use ($corporationId) {
                $sub->select(\DB::raw(1))
                    ->from('users')
                    ->whereColumn('users.id', 'evidence.user_id')
                    ->where('users.corporation_id', $corporationId);
            }));

        $totalEvidence = $scopedEvidence()->count();
        $approvedEvidence = $scopedEvidence()->where('status', 'approved')->count();

        return static::updateOrCreate(
            ['snapshot_date' => $date, 'corporation_id' => $corporationId],
            [
                'compliance_percentage' => round(
                    $scopedAssessments()->avg('compliance_percentage') ?? 0, 2
                ),
                // Thresholds match Risk::getRiskLevelAttribute(): critical>=15, high>=10, medium>=5, low<5
                'open_risks_critical' => $scopedRisks()->whereIn('status', ['open', 'in_progress'])
                    ->whereRaw('likelihood * impact >= 15')
                    ->count(),
                'open_risks_high' => $scopedRisks()->whereIn('status', ['open', 'in_progress'])
                    ->whereRaw('likelihood * impact BETWEEN 10 AND 14')
                    ->count(),
                'open_risks_medium' => $scopedRisks()->whereIn('status', ['open', 'in_progress'])
                    ->whereRaw('likelihood * impact BETWEEN 5 AND 9')
                    ->count(),
                'open_risks_low' => $scopedRisks()->whereIn('status', ['open', 'in_progress'])
                    ->whereRaw('likelihood * impact BETWEEN 1 AND 4')
                    ->count(),
                'overdue_risks' => $scopedRisks()->where('due_date', '<', now())
                    ->whereNotIn('status', ['closed'])
                    ->count(),
                'overdue_assessments' => $scopedAssessments()->where('status', '!=', 'completed')
                    ->whereNotNull('due_date')
                    ->where('due_date', '<', now())
                    ->count(),
                'evidence_approval_rate' => $totalEvidence > 0
                    ? round(($approvedEvidence / $totalEvidence) * 100, 2)
                    : 0,
                'ai_generated_risks' => $scopedRisks()->where('auto_generated', 1)->count(),
                'total_risks' => $scopedRisks()->count(),
                'total_controls' => Control::where('is_active', true)->count(),
                'compliant_controls' => static::countCompliantControls($corporationId),
            ]
        );
    }

    /**
     * Count "compliant" controls for a single tenant, resolving the effective
     * status from the per-tenant pivot first and falling back to the legacy
     * global controls.current_status when the tenant has no override.
     */
    private static function countCompliantControls(?int $corporationId): int
    {
        if ($corporationId === null) {
            return Control::where('current_status', 'compliant')
                ->where('is_active', true)
                ->count();
        }

        $row = \DB::table('controls')
            ->leftJoin('corporation_control_statuses as ccs', function ($join) use ($corporationId) {
                $join->on('ccs.control_id', '=', 'controls.id')
                    ->where('ccs.corporation_id', '=', $corporationId);
            })
            ->where('controls.is_active', true)
            ->selectRaw("COUNT(CASE WHEN COALESCE(ccs.current_status, controls.current_status) = 'compliant' THEN 1 END) AS c")
            ->first();

        return (int) ($row->c ?? 0);
    }

    /**
     * @deprecated use takeSnapshots() to fan out across all tenants, or
     * takeSnapshotFor($corpId) for a single corporation.
     */
    public static function takeSnapshot(?string $date = null): self
    {
        return static::takeSnapshotFor(null, $date);
    }
}
