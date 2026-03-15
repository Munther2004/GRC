<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Control extends Model
{
    protected $fillable = ['framework_id', 'control_id', 'title', 'description', 'category', 'implementation_guidance', 'is_active'];

    public function framework() { return $this->belongsTo(Framework::class); }
    public function assessmentItems() { return $this->hasMany(AssessmentItem::class); }

    public function risks()
    {
        return $this->belongsToMany(Risk::class, 'control_risk')
                    ->withPivot('auto_linked', 'link_type', 'link_reason')
                    ->withTimestamps();
    }
}