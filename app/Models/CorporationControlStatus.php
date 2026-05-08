<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CorporationControlStatus extends Model
{
    protected $fillable = [
        'corporation_id',
        'control_id',
        'current_status',
        'last_remediated_at',
        'remediation_notes',
    ];

    protected $casts = [
        'last_remediated_at' => 'datetime',
    ];

    public function corporation()
    {
        return $this->belongsTo(Corporation::class);
    }

    public function control()
    {
        return $this->belongsTo(Control::class);
    }
}
