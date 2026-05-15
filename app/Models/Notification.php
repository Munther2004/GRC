<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'user_id', 'corporation_id', 'type', 'title', 'message', 'url', 'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function corporation()
    {
        return $this->belongsTo(Corporation::class);
    }

    /**
     * Centralized visibility scope. Personal notifications (user_id = $user->id)
     * are always shown. Broadcast notifications (user_id IS NULL) are shown
     * only when the recipient's tenant matches:
     *   - super_admin → all broadcasts
     *   - tenant user → broadcasts with corporation_id = own tenant
     *   - tenantless user (no corporation_id, not super_admin) → personal only
     *
     * Untagged historical broadcasts (corporation_id IS NULL, predating this
     * column) are intentionally invisible to tenant users — they were the
     * leaked notifications this scope exists to prevent.
     */
    public function scopeForUser(
        \Illuminate\Database\Eloquent\Builder $query,
        User $user,
        ?int $superAdminCorporationFilter = null,
    ): \Illuminate\Database\Eloquent\Builder {
        $isSuper = $user->isSuperAdmin();
        $userId = $user->id;
        $corpId = $user->corporation_id;

        return $query->where(function ($outer) use ($isSuper, $userId, $corpId, $superAdminCorporationFilter) {
            $outer->where('user_id', $userId);

            if ($isSuper) {
                if ($superAdminCorporationFilter !== null) {
                    // super_admin drilled into a specific tenant — only show
                    // broadcasts tagged for that tenant.
                    $outer->orWhere(function ($sub) use ($superAdminCorporationFilter) {
                        $sub->whereNull('user_id')
                            ->where('corporation_id', $superAdminCorporationFilter);
                    });
                } else {
                    $outer->orWhereNull('user_id');
                }
            } elseif ($corpId !== null) {
                $outer->orWhere(function ($sub) use ($corpId) {
                    $sub->whereNull('user_id')
                        ->where('corporation_id', $corpId);
                });
            }
        });
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
