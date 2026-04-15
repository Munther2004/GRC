<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ControlStatusRequest extends Model
{
    protected $fillable = [
        'control_id', 'requested_by', 'requested_status', 'current_status',
        'justification', 'status', 'reviewed_by', 'reviewed_at', 'notes',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function control()
    {
        return $this->belongsTo(Control::class);
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function evidence()
    {
        return $this->hasOne(Evidence::class, 'control_status_request_id');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
