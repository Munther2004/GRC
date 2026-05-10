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
    use HasFactory, HasRoles, Notifiable, TwoFactorAuthenticatable;

    public const ROLE_SUPER_ADMIN = 'super_admin';

    public const ROLE_ADMIN = 'admin';

    public const ROLE_AUDITOR = 'auditor';

    public const ROLE_USER = 'user';

    public const VALID_ROLES = [
        self::ROLE_SUPER_ADMIN,
        self::ROLE_ADMIN,
        self::ROLE_AUDITOR,
        self::ROLE_USER,
    ];

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
            'is_corporation_manager' => 'boolean',
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

    // ── Role helpers ────────────────────────────────────────────────────────

    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN || $this->hasRole(self::ROLE_SUPER_ADMIN);
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN || $this->hasRole(self::ROLE_ADMIN);
    }

    public function isAuditor(): bool
    {
        return $this->role === self::ROLE_AUDITOR || $this->hasRole(self::ROLE_AUDITOR);
    }

    public function isUser(): bool
    {
        return $this->role === self::ROLE_USER || $this->hasRole(self::ROLE_USER);
    }

    /**
     * Whether $this is allowed to administer the given target user.
     *
     *  - super_admin can administer anyone (including themselves only when
     *    self-deletion is otherwise allowed; callers still block self-delete).
     *  - admin can administer users that share their corporation_id, but
     *    cannot touch super_admins or other admins (no self-elevation).
     *  - everyone else cannot administer anyone.
     */
    public function canAdminister(User $target): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        if (! $this->isAdmin()) {
            return false;
        }

        if (! $this->corporation_id || $target->corporation_id !== $this->corporation_id) {
            return false;
        }

        if ($target->isSuperAdmin() || $target->isAdmin()) {
            return $target->id === $this->id;
        }

        return true;
    }

    public function getRoleNameAttribute(): string
    {
        return match ($this->role) {
            self::ROLE_SUPER_ADMIN => 'Super Admin',
            self::ROLE_ADMIN => 'Admin',
            self::ROLE_AUDITOR => 'Auditor',
            self::ROLE_USER => 'User',
            default => 'User',
        };
    }

    /**
     * Scope a query to records visible to this user.
     *
     *   - super_admin → unscoped (sees all corporations).
     *   - admin/auditor/user with a corporation_id → only their corporation.
     *   - any non-super_admin without a corporation_id → no rows.
     *
     * The query must select from a table that has a `corporation_id` column.
     */
    public function organisationScope(Builder $query): Builder
    {
        if ($this->isSuperAdmin()) {
            return $query;
        }

        if ($this->corporation_id) {
            return $query->where('corporation_id', $this->corporation_id);
        }

        // Non-super_admin with no corporation: deny all rows.
        return $query->whereRaw('1 = 0');
    }

    /**
     * Scope a query to rows that this user is allowed to see in list views.
     *
     *   - super_admin → unscoped (sees all corporations). When the optional
     *     `$superAdminCorporationFilter` is supplied, restrict to that
     *     corporation so the platform owner can drill into one tenant.
     *   - admin / auditor → scoped to their corporation_id (sees data tied to
     *     every employee of their corporation).
     *   - user → scoped to their corporation_id AND $ownerColumn = $this->id
     *            (operational writers see only the rows they personally created).
     *   - non-super_admin without a corporation_id → no rows.
     *
     * The query must select from a table that has a `corporation_id` column
     * (the same constraint as `organisationScope`) plus, when the caller is a
     * `user`, a column named $ownerColumn (default `user_id`) that points at
     * the row's creator.
     */
    public function visibilityScope(Builder $query, string $ownerColumn = 'user_id', ?int $superAdminCorporationFilter = null): Builder
    {
        if ($this->isSuperAdmin()) {
            if ($superAdminCorporationFilter !== null) {
                $table = $query->getModel()->getTable();
                $query->where("{$table}.corporation_id", $superAdminCorporationFilter);
            }

            return $query;
        }

        if (! $this->corporation_id) {
            return $query->whereRaw('1 = 0');
        }

        $table = $query->getModel()->getTable();
        $query->where("{$table}.corporation_id", $this->corporation_id);

        if ($this->isUser()) {
            $query->where("{$table}.{$ownerColumn}", $this->id);
        }

        return $query;
    }

    /**
     * Resolve the corporation_id filter that should apply for this request.
     *
     * Returns the request's `corporation_id` query param when the caller is a
     * super_admin and a positive value was supplied. Returns `null` otherwise
     * (meaning: no extra filter; non-super_admins are scoped to their own
     * corporation by `visibilityScope` itself).
     */
    public function resolveCorporationFilter(?int $requested): ?int
    {
        if (! $this->isSuperAdmin()) {
            return null;
        }

        return $requested && $requested > 0 ? $requested : null;
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
