<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RiskTreatmentPlan extends Model
{
    protected $fillable = [
        'risk_id', 'strategy', 'description', 'owner',
        'due_date', 'progress', 'status',
        'residual_likelihood', 'residual_impact',
    ];

    protected $casts = [
        'due_date' => 'date',
        'progress' => 'integer',
        'residual_likelihood' => 'integer',
        'residual_impact' => 'integer',
    ];

    public function risk()
    {
        return $this->belongsTo(Risk::class);
    }

    public function getResidualScoreAttribute(): ?int
    {
        if ($this->residual_likelihood && $this->residual_impact) {
            return $this->residual_likelihood * $this->residual_impact;
        }

        return null;
    }

    public function getResidualLevelAttribute(): ?string
    {
        $score = $this->residual_score;
        if ($score === null) {
            return null;
        }
        if ($score >= 15) {
            return 'critical';
        }
        if ($score >= 10) {
            return 'high';
        }
        if ($score >= 5) {
            return 'medium';
        }

        return 'low';
    }
}
