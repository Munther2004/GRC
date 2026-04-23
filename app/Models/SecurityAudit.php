<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SecurityAudit extends Model
{
    protected $fillable = [
        'user_id',
        'file_name',
        'file_type',
        'file_size',
        'file_path',
        'status',
        'findings',
        'summary',
        'total_findings',
        'critical_count',
        'high_count',
        'medium_count',
        'low_count',
        'info_count',
        'compliance_score',
        'frameworks_checked',
        'controls_referenced',
        'evidence_id',
        'risks_generated',
        'error_message',
        'analyzed_at',
    ];

    protected $casts = [
        'findings' => 'array',
        'frameworks_checked' => 'array',
        'controls_referenced' => 'array',
        'compliance_score' => 'decimal:2',
        'analyzed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function evidence(): BelongsTo
    {
        return $this->belongsTo(Evidence::class);
    }

    public function findings(): HasMany
    {
        return $this->hasMany(SecurityAuditFinding::class);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isAnalyzing(): bool
    {
        return $this->status === 'analyzing';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }
}
