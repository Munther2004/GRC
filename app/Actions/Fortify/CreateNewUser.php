<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
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
        if (!empty($input['corporation_code'])) {
            $corporation = \App\Models\Corporation::where('registration_code', $input['corporation_code'])
                ->where('status', 'approved')
                ->firstOrFail();
        }

        return User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
            'corporation_id' => $corporation?->id,
        ]);
    }
}
