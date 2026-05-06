<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Assessment extends Model
{
    protected $fillable = [
        'user_id', 'corporation_id', 'framework_id', 'title', 'scope', 'period',
        'due_date', 'status', 'compliance_percentage', 'description',
        'evidence_weighted_score',
    ];

    protected $casts = [
        'due_date' => 'date',
        'compliance_percentage' => 'float',
        'evidence_weighted_score' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function framework()
    {
        return $this->belongsTo(Framework::class);
    }

    public function items()
    {
        return $this->hasMany(AssessmentItem::class);
    }

    public function risks()
    {
        return $this->hasMany(Risk::class);
    }

    public function getIsOverdueAttribute(): bool
    {
        return $this->due_date !== null
            && $this->due_date->isPast()
            && ! in_array($this->status, ['completed'], true);
    }

    /**
     * True while GenerateAIRisksJob is plausibly still creating risks for an
     * assessment in the user's tenant. Used by the Risk Register and the
     * assessment show page to drive an 8s polling reload — the page stops
     * polling the moment this returns false (every non-compliant item now
     * has its auto_generated risk, OR the staleness cap kicked in).
     *
     * Pass $assessmentId to scope to a single assessment (show page);
     * leave null to check across the whole tenant (Risk Register).
     *
     * Staleness cap: 10 minutes. Real runs take ~3m30s; cap protects against
     * jobs that hang or fail forever on a specific control's AI response.
     */
    public static function aiRiskGenerationInProgress(User $user, ?int $assessmentId = null): bool
    {
        $base = $user->organisationScope(self::query())
            ->where('status', 'completed')
            ->where('updated_at', '>=', now()->subMinutes(10));

        if ($assessmentId !== null) {
            $base->where('id', $assessmentId);
        }

        return $base->whereExists(function ($q) {
            $q->select(DB::raw(1))
                ->from('assessment_items')
                ->whereColumn('assessment_items.assessment_id', 'assessments.id')
                ->whereIn('assessment_items.compliance_status', ['non_compliant', 'partially_compliant'])
                ->whereNotExists(function ($r) {
                    $r->select(DB::raw(1))
                        ->from('risks')
                        ->whereColumn('risks.source_control_id', 'assessment_items.control_id')
                        ->whereColumn('risks.assessment_id', 'assessments.id')
                        ->where('risks.auto_generated', true);
                });
        })->exists();
    }

    public function recalculateCompliance(): void
    {
        $items = $this->items()->where('compliance_status', '!=', 'not_applicable')->get();

        if ($items->isEmpty()) {
            $this->update(['compliance_percentage' => 0]);

            return;
        }

        $compliant = $items->where('compliance_status', 'compliant')->count()
                   + ($items->where('compliance_status', 'partially_compliant')->count() * 0.5);

        $percentage = round(($compliant / $items->count()) * 100, 1);
        $this->update(['compliance_percentage' => $percentage]);
    }

    public function recalculateEvidenceWeightedScore(): void
    {
        $scoring = (new \App\Services\EvidenceScoringService)->calculateEvidenceWeightedScore($this);
        $this->update(['evidence_weighted_score' => $scoring['weighted_score']]);
    }
}
