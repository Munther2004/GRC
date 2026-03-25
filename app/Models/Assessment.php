<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Assessment extends Model
{
    protected $fillable = [
        'user_id', 'framework_id', 'title', 'scope', 'period',
        'due_date', 'status', 'compliance_percentage', 'description',
    ];

    protected $casts = [
        'due_date' => 'date',
        'compliance_percentage' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function framework()
    {
        return $this->belongsTo(Framework::class);
    }

    public function items()
    {
        return $this->hasMany(AssessmentItem::class);
    }

    public function risks()
    {
        return $this->hasMany(Risk::class);
    }

    public function recalculateCompliance(): void
    {
        $items = $this->items()->where('compliance_status', '!=', 'not_applicable')->get();

        if ($items->isEmpty()) {
            $this->update(['compliance_percentage' => 0]);

            return;
        }

        $compliant = $items->where('compliance_status', 'compliant')->count()
                   + ($items->where('compliance_status', 'partially_compliant')->count() * 0.5);

        $percentage = round(($compliant / $items->count()) * 100, 1);
        $this->update(['compliance_percentage' => $percentage]);
    }
}
