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

    /**
     * Notify every super_admin about a new corporation registration request.
     */
    public static function notifyAdminCorporationSignup(Corporation $corporation): void
    {
        $superAdmins = User::role(User::ROLE_SUPER_ADMIN)->get();

        foreach ($superAdmins as $admin) {
            self::create([
                'user_id' => $admin->id,
                'type' => 'corporation_signup',
                'title' => 'New Corporation Registration',
                'message' => "{$corporation->name} has submitted a registration request for approval",
                'url' => "/admin/corporations/{$corporation->id}",
                'is_read' => false,
            ]);
        }
    }

    /**
     * Notify every super_admin that a corporation has been approved.
     */
    public static function notifyAdminCorporationApproved(Corporation $corporation): void
    {
        $superAdmins = User::role(User::ROLE_SUPER_ADMIN)->get();

        foreach ($superAdmins as $admin) {
            self::create([
                'user_id' => $admin->id,
                'type' => 'corporation_approved',
                'title' => 'Corporation Approved',
                'message' => "{$corporation->name} has been approved with registration code generated",
                'url' => "/admin/corporations/{$corporation->id}",
                'is_read' => false,
            ]);
        }
    }
}
