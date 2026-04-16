<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasRoles;

    protected $fillable = ['name', 'email', 'password', 'role', 'corporation_id', 'is_corporation_manager'];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function corporation()
    {
        return $this->belongsTo(Corporation::class);
    }

    public function managedCorporations()
    {
        return $this->hasMany(Corporation::class, 'manager_user_id');
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isAuditor(): bool
    {
        return $this->role === 'auditor';
    }

    public function getRoleNameAttribute(): string
    {
        return match ($this->role) {
            'admin' => 'Administrator',
            'auditor' => 'Auditor',
            default => 'User',
        };
    }

    /**
     * Scope a query so it only returns records visible to this user:
     *   - admin          → everything
     *   - corp manager   → everything belonging to their corporation
     *   - regular user   → only their own rows (user_id = this->id)
     *
     * The query must have a `corporation_id` column (and optionally `user_id`).
     */
    public function organisationScope(Builder $query): Builder
    {
        if ($this->hasRole('admin')) {
            return $query;
        }

        if ($this->is_corporation_manager) {
            return $query->where('corporation_id', $this->corporation_id);
        }

        return $query->where('user_id', $this->id);
    }

    public function risks()
    {
        return $this->hasMany(Risk::class);
    }

    public function assessments()
    {
        return $this->hasMany(Assessment::class);
    }
}
