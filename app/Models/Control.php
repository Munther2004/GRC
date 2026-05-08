<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Control extends Model
{
    protected $fillable = [
        'framework_id', 'control_id', 'title', 'description', 'category',
        'implementation_guidance', 'is_active',
        'current_status', 'last_remediated_at', 'remediation_notes',
    ];

    protected $casts = [
        'last_remediated_at' => 'datetime',
    ];

    public function framework()
    {
        return $this->belongsTo(Framework::class);
    }

    public function assessmentItems()
    {
        return $this->hasMany(AssessmentItem::class);
    }

    public function risks()
    {
        return $this->belongsToMany(Risk::class, 'control_risk')
            ->withPivot('auto_linked', 'link_type', 'link_reason')
            ->withTimestamps();
    }

    public function statusHistory()
    {
        return $this->hasMany(ControlStatusHistory::class)->latest();
    }

    public function latestEvidence()
    {
        return $this->hasManyThrough(Evidence::class, AssessmentItem::class)
            ->latest();
    }

    public function directEvidence()
    {
        return $this->hasMany(Evidence::class, 'control_id')->latest();
    }

    public function statusRequests()
    {
        return $this->hasMany(ControlStatusRequest::class)->latest();
    }

    public function remediationTasks()
    {
        return $this->hasMany(RemediationTask::class)->latest();
    }

    public function corporationStatuses()
    {
        return $this->hasMany(CorporationControlStatus::class);
    }

    /**
     * Resolve a control's status for a single corporation. Falls back to the
     * legacy global controls.current_status when the tenant has no override.
     * Returns null when neither is set.
     */
    public function statusForCorporation(?int $corporationId): ?string
    {
        if ($corporationId === null) {
            return $this->current_status;
        }
        $row = $this->corporationStatuses()
            ->where('corporation_id', $corporationId)
            ->first();

        return $row?->current_status ?? $this->current_status;
    }
}
