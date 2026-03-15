<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class AssessmentItem extends Model
{
    protected $fillable = ['assessment_id', 'control_id', 'compliance_status', 'comments'];

    public function assessment() { return $this->belongsTo(Assessment::class); }
    public function control() { return $this->belongsTo(Control::class); }
    public function evidence() { return $this->hasMany(Evidence::class); }
}