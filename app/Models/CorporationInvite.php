<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CorporationInvite extends Model
{
    use HasFactory;

    public const TYPE_SHAREABLE = 'shareable';

    public const TYPE_EMAIL = 'email';

    protected $fillable = [
        'corporation_id',
        'token',
        'email',
        'type',
        'expires_at',
        'max_uses',
        'use_count',
        'revoked_at',
        'created_by_user_id',
        'last_used_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'revoked_at' => 'datetime',
            'last_used_at' => 'datetime',
            'max_uses' => 'integer',
            'use_count' => 'integer',
        ];
    }

    public function corporation()
    {
        return $this->belongsTo(Corporation::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public static function generateToken(): string
    {
        return Str::random(48);
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function isRevoked(): bool
    {
        return $this->revoked_at !== null;
    }

    public function isExhausted(): bool
    {
        if ($this->type === self::TYPE_EMAIL) {
            return $this->use_count >= 1;
        }

        return $this->max_uses !== null && $this->use_count >= $this->max_uses;
    }

    public function isValid(): bool
    {
        return ! $this->isRevoked() && ! $this->isExpired() && ! $this->isExhausted();
    }

    public function status(): string
    {
        if ($this->isRevoked()) {
            return 'revoked';
        }
        if ($this->isExpired()) {
            return 'expired';
        }
        if ($this->isExhausted()) {
            return 'used';
        }

        return 'active';
    }

    public function markUsed(?User $user = null): void
    {
        $this->increment('use_count');
        $this->forceFill(['last_used_at' => now()])->save();
    }

    public function scopeShareable(Builder $q): Builder
    {
        return $q->where('type', self::TYPE_SHAREABLE);
    }

    public function scopeEmail(Builder $q): Builder
    {
        return $q->where('type', self::TYPE_EMAIL);
    }

    public function scopeActive(Builder $q): Builder
    {
        return $q->whereNull('revoked_at')
            ->where(function ($qq) {
                $qq->whereNull('expires_at')->orWhere('expires_at', '>', now());
            });
    }
}
