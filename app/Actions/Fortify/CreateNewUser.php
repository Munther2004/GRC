<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\Corporation;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Self-service registration.
     *
     * Creates a normal corporation user:
     *   - users.role = 'user'
     *   - Spatie role 'user'
     *   - corporation_id from the supplied registration_code (must be approved)
     *     or NULL when none is supplied
     *   - is_corporation_manager = false
     *
     * Self-registration cannot create admin / auditor / super_admin accounts.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'corporation_code' => 'nullable|string|exists:corporations,registration_code',
        ])->validate();

        $corporation = null;
        if (! empty($input['corporation_code'])) {
            $corporation = Corporation::where('registration_code', $input['corporation_code'])
                ->where('status', 'approved')
                ->firstOrFail();
        }

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
            'role' => User::ROLE_USER,
            'corporation_id' => $corporation?->id,
            'is_corporation_manager' => false,
        ]);

        $user->assignRole(User::ROLE_USER);

        return $user;
    }
}
