<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SecurityAuditFinding extends Model
{
    protected $fillable = [
        'security_audit_id',
        'finding_number',
        'severity',
        'title',
        'description',
        'affected_item',
        'recommendation',
        'control_reference',
        'control_id',
        'compliance_impact',
        'risk_id',
    ];

    public function securityAudit(): BelongsTo
    {
        return $this->belongsTo(SecurityAudit::class);
    }

    public function control(): BelongsTo
    {
        return $this->belongsTo(Control::class);
    }

    public function risk(): BelongsTo
    {
        return $this->belongsTo(Risk::class);
    }

    public function severityColor(): string
    {
        return match ($this->severity) {
            'critical' => 'red',
            'high' => 'orange',
            'medium' => 'yellow',
            'low' => 'blue',
            'info' => 'gray',
            default => 'gray',
        };
    }
}
