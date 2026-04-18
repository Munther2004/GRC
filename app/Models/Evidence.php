<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Evidence extends Model
{
    protected $fillable = [
        'user_id', 'assessment_item_id', 'control_id', 'control_status_request_id', 'title',
        'description', 'file_path', 'file_name',
        'file_type', 'status', 'expiry_date',
        'ai_review', 'ai_verdict', 'ai_confidence', 'ai_reviewed_at',
        'ai_strengths', 'ai_gaps', 'ai_recommendation', 'ai_is_relevant',
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'ai_review' => 'array',
        'ai_reviewed_at' => 'datetime',
        'ai_is_relevant' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assessmentItem()
    {
        return $this->belongsTo(AssessmentItem::class);
    }

    public function control()
    {
        return $this->belongsTo(Control::class);
    }

    public function statusRequest()
    {
        return $this->belongsTo(ControlStatusRequest::class, 'control_status_request_id');
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->expiry_date !== null && $this->expiry_date->isPast();
    }

    public function getExpiresSoonAttribute(): bool
    {
        if ($this->expiry_date === null || $this->is_expired) {
            return false;
        }

        return $this->expiry_date->lte(Carbon::now()->addDays(30));
    }
}
