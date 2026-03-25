<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Risk extends Model
{
    protected $fillable = ['user_id', 'title', 'description', 'category', 'owner', 'likelihood', 'impact', 'status', 'treatment', 'treatment_plan', 'due_date', 'auto_generated', 'source_control_id', 'assessment_id', 'mitigation_steps', 'ai_validated'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

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

    public function getRiskLevelAttribute(): string
    {
        $score = $this->likelihood * $this->impact;
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

    public function getRiskScoreAttribute(): int
    {
        return $this->likelihood * $this->impact;
    }
}
