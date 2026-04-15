<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Framework extends Model
{
    protected $fillable = ['name', 'short_name', 'description', 'version', 'is_active'];

    public function controls()
    {
        return $this->hasMany(Control::class);
    }

    public function assessments()
    {
        return $this->hasMany(Assessment::class);
    }
}
