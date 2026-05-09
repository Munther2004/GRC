<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CorporationRegistration extends Model
{
    protected $fillable = [
        'corporation_id',
        'contact_name',
        'contact_email',
        'contact_phone',
        'message',
        'status',
        'admin_notes',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'processed_at' => 'datetime',
        ];
    }

    public function corporation()
    {
        return $this->belongsTo(Corporation::class);
    }

    public function approve(): bool
    {
        return $this->update([
            'status' => 'approved',
            'processed_at' => now(),
        ]);
    }

    public function reject(): bool
    {
        return $this->update([
            'status' => 'rejected',
            'processed_at' => now(),
        ]);
    }
}
