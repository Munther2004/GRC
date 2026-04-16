<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RemediationTask extends Model
{
    protected $fillable = [
        'control_id', 'assessment_id', 'corporation_id', 'title', 'description',
        'assigned_to', 'due_date', 'priority', 'status',
        'completion_notes', 'auto_closed', 'closed_at', 'created_by',
    ];

    protected $casts = [
        'due_date' => 'date',
        'closed_at' => 'datetime',
        'auto_closed' => 'boolean',
    ];

    // ── Relationships ────────────────────────────────────────────────────────

    public function control()
    {
        return $this->belongsTo(Control::class);
    }

    public function assessment()
    {
        return $this->belongsTo(Assessment::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    public function getIsOverdueAttribute(): bool
    {
        return $this->due_date !== null
            && $this->due_date->isPast()
            && ! in_array($this->status, ['completed', 'cancelled']);
    }

    public function getPriorityColorAttribute(): string
    {
        return match ($this->priority) {
            'critical' => 'red',
            'high' => 'orange',
            'medium' => 'amber',
            'low' => 'blue',
            default => 'gray',
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'open' => 'gray',
            'in_progress' => 'blue',
            'completed' => 'green',
            'cancelled' => 'red',
            default => 'gray',
        };
    }
}
