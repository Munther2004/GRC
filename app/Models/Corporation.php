<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Corporation extends Model
{
    protected $fillable = [
        'name',
        'email',
        'industry',
        'description',
        'website',
        'registration_code',
        'last_code_generated_at',
        'status',
        'approved_at',
        'manager_user_id',
        'manager_username',
        'manager_password',
        'credentials_sent',
    ];

    /**
     * Sensitive attributes that must never be serialized into Inertia props
     * or API responses. The corp-manager dashboard explicitly opts these
     * back in via `makeVisible('registration_code')` after authorizing the
     * viewer is the corporation's manager.
     */
    protected $hidden = [
        'registration_code',
        'manager_username',
        'manager_password',
    ];

    protected function casts(): array
    {
        return [
            'last_code_generated_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    public function hasManager(): bool
    {
        return $this->manager_user_id !== null;
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_user_id');
    }

    public function registrations()
    {
        return $this->hasMany(CorporationRegistration::class);
    }

    public function generateNewCode(): string
    {
        $code = strtoupper(bin2hex(random_bytes(8)));
        $this->update([
            'registration_code' => $code,
            'last_code_generated_at' => now(),
        ]);

        return $code;
    }

    public function generateManagerCredentials(): array
    {
        $username = 'mgr_'.strtolower(str_replace(' ', '_', $this->name)).'_'.random_int(1000, 9999);
        $tempPassword = bin2hex(random_bytes(8));

        $this->update([
            'manager_username' => $username,
            'manager_password' => bcrypt($tempPassword),
            'credentials_sent' => false,
        ]);

        return [
            'username' => $username,
            'password' => $tempPassword,
        ];
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function approve(): bool
    {
        return $this->update([
            'status' => 'approved',
            'approved_at' => now(),
        ]);
    }

    public function reject(): bool
    {
        return $this->update([
            'status' => 'rejected',
        ]);
    }
}
