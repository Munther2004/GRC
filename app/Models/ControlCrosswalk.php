<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ControlCrosswalk extends Model
{
    protected $table = 'control_crosswalk';

    protected $fillable = [
        'primary_control_id', 'mapped_control_id', 'mapping_type', 'notes',
    ];

    public function primaryControl()
    {
        return $this->belongsTo(Control::class, 'primary_control_id');
    }

    public function mappedControl()
    {
        return $this->belongsTo(Control::class, 'mapped_control_id');
    }
}
