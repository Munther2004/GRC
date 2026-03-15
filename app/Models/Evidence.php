<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Evidence extends Model
{
    protected $fillable = [
        'user_id', 'assessment_item_id', 'title',
        'description', 'file_path', 'file_name',
        'file_type', 'status', 'expiry_date',
    ];

    protected $casts = [
        'expiry_date' => 'date',
    ];

    public function user()           { return $this->belongsTo(User::class); }
    public function assessmentItem() { return $this->belongsTo(AssessmentItem::class); }

    public function getIsExpiredAttribute(): bool
    {
        return $this->expiry_date !== null && $this->expiry_date->isPast();
    }

    public function getExpiresSoonAttribute(): bool
    {
        if ($this->expiry_date === null || $this->is_expired) return false;
        return $this->expiry_date->lte(Carbon::now()->addDays(30));
    }
}
