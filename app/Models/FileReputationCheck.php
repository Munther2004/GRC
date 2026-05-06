<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class FileReputationCheck extends Model
{
    protected $fillable = [
        'checkable_type',
        'checkable_id',
        'file_name',
        'file_path',
        'sha256',
        'upload_sha256',
        'provider',
        'status',
        'integrity_status',
        'malicious_count',
        'suspicious_count',
        'undetected_count',
        'harmless_count',
        'timeout_count',
        'last_analysis_date',
        'analysis_id',
        'raw_summary_json',
        'checked_by',
        'checked_at',
    ];

    protected $casts = [
        'status' => 'string',
        'raw_summary_json' => 'array',
        'last_analysis_date' => 'datetime',
        'checked_at' => 'datetime',
    ];

    public function checkable(): MorphTo
    {
        return $this->morphTo();
    }

    public function checkedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'checked_by');
    }

    public function scopeForCheckable(Builder $query, Model $model): Builder
    {
        return $query
            ->where('checkable_type', $model->getMorphClass())
            ->where('checkable_id', $model->getKey());
    }

    public function isSafe(): bool
    {
        return $this->status === 'clean';
    }

    public function isDangerous(): bool
    {
        return in_array($this->status, ['malicious', 'suspicious'], true);
    }

    public function badgeColor(): string
    {
        return match ($this->status) {
            'malicious' => 'red',
            'suspicious' => 'orange',
            'clean' => 'green',
            'not_found' => 'gray',
            default => 'gray',
        };
    }
}
