<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'user_id', 'type', 'title', 'message', 'url', 'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function notifyAdminCorporationSignup(Corporation $corporation): void
    {
        $adminUser = User::where('email', 'admin@grc.com')->first();
        
        if ($adminUser) {
            self::create([
                'user_id' => $adminUser->id,
                'type' => 'corporation_signup',
                'title' => 'New Corporation Registration',
                'message' => "{$corporation->name} has submitted a registration request for approval",
                'url' => "/admin/corporations/{$corporation->id}",
                'is_read' => false,
            ]);
        }
    }

    public static function notifyAdminCorporationApproved(Corporation $corporation): void
    {
        $adminUser = User::where('email', 'admin@grc.com')->first();
        
        if ($adminUser) {
            self::create([
                'user_id' => $adminUser->id,
                'type' => 'corporation_approved',
                'title' => 'Corporation Approved',
                'message' => "{$corporation->name} has been approved with registration code generated",
                'url' => "/admin/corporations/{$corporation->id}",
                'is_read' => false,
            ]);
        }
    }
}

