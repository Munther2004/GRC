<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Risk extends Model
{
    protected $fillable = ['user_id', 'title', 'description', 'category', 'owner', 'likelihood', 'impact', 'status', 'treatment', 'treatment_plan', 'due_date', 'auto_generated', 'source_control_id', 'assessment_id', 'mitigation_steps', 'ai_validated'];

    protected $casts = [
        'due_date' => 'date',
    ];

    public function user() { return $this->belongsTo(User::class); }

    public function controls()
    {
        return $this->belongsToMany(Control::class, 'control_risk')
                    ->withPivot('auto_linked', 'link_type', 'link_reason')
                    ->withTimestamps();
    }

    public function sourceControl()
    {
        return $this->belongsTo(Control::class, 'source_control_id');
    }

    public function assessment()
    {
        return $this->belongsTo(Assessment::class);
    }

    public function treatmentPlans()
    {
        return $this->hasMany(RiskTreatmentPlan::class);
    }

    public function getIsOverdueAttribute(): bool
    {
        return $this->due_date !== null
            && $this->due_date->isPast()
            && ! in_array($this->status, ['closed'], true);
    }

    /**
     * Canonical risk-level thresholds used by the model accessor and GrcMetricsService.
     * Centralised here so SQL aggregate queries and PHP code stay in sync.
     *
     * @return array{critical: int, high: int, medium: int}
     */
    public static function levelThresholds(): array
    {
        return ['critical' => 15, 'high' => 10, 'medium' => 5];
    }

    public function getRiskLevelAttribute(): string
    {
        $t     = self::levelThresholds();
        $score = $this->likelihood * $this->impact;
        if ($score >= $t['critical']) return 'critical';
        if ($score >= $t['high'])     return 'high';
        if ($score >= $t['medium'])   return 'medium';
        return 'low';
    }

    public function getRiskScoreAttribute(): int
    {
        return $this->likelihood * $this->impact;
    }

    public function getAppetiteBandAttribute(): ?array
    {
        $appetite = RiskAppetite::getActive();
        return $appetite?->classifyRisk($this);
    }
}