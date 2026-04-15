<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ControlStatusHistory extends Model
{
    protected $table = 'control_status_history';

    protected $fillable = [
        'control_id',
        'user_id',
        'old_status',
        'new_status',
        'notes',
        'evidence_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function control()
    {
        return $this->belongsTo(Control::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function evidence()
    {
        return $this->belongsTo(Evidence::class);
    }
}
