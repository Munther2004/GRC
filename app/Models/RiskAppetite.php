<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RiskAppetite extends Model
{
    protected $fillable = [
        'corporation_id',
        'name',
        'is_active',
        'acceptable_max_score',
        'review_max_score',
        'escalated_min_score',
        'acceptable_label',
        'review_label',
        'escalated_label',
        'acceptable_color',
        'review_color',
        'escalated_color',
        'notify_on_escalation',
        'escalation_notification_roles',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'notify_on_escalation' => 'boolean',
        'escalation_notification_roles' => 'array',
    ];

    public function corporation()
    {
        return $this->belongsTo(Corporation::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForCorporation($query, ?int $corporationId)
    {
        return $query->where('corporation_id', $corporationId);
    }

    /**
     * Resolve the active risk appetite for the given corporation.
     *
     * Pass NULL only for super_admin scenarios where you want the first
     * active row across the platform; in normal corp-scoped reads always
     * pass the user's corporation_id.
     */
    public static function getActiveForCorporation(?int $corporationId): ?self
    {
        if ($corporationId === null) {
            return null;
        }

        return static::where('corporation_id', $corporationId)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Resolve the active appetite from an authenticated user context.
     * Returns NULL if there is no usable corporation context.
     */
    public static function getActiveForUser(?User $user): ?self
    {
        if (! $user) {
            return null;
        }

        return static::getActiveForCorporation($user->corporation_id);
    }

    /**
     * Classify a risk against this appetite's thresholds.
     * Returns: { band: 'acceptable'|'review'|'escalated', label: string, color: string }
     */
    public function classifyRisk(Risk $risk): array
    {
        $score = $risk->risk_score;

        if ($score <= $this->acceptable_max_score) {
            return [
                'band' => 'acceptable',
                'label' => $this->acceptable_label,
                'color' => $this->acceptable_color,
            ];
        }

        if ($score <= $this->review_max_score) {
            return [
                'band' => 'review',
                'label' => $this->review_label,
                'color' => $this->review_color,
            ];
        }

        return [
            'band' => 'escalated',
            'label' => $this->escalated_label,
            'color' => $this->escalated_color,
        ];
    }
}
