<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\CorporationInvite;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class InviteAcceptController extends Controller
{
    public function show(string $token)
    {
        $invite = CorporationInvite::where('token', $token)->with('corporation')->first();

        if (! $invite || ! $invite->isValid() || ! $invite->corporation || ! $invite->corporation->isApproved()) {
            return Inertia::render('invite/invalid', [
                'reason' => $invite?->status() ?? 'not_found',
            ]);
        }

        return Inertia::render('invite/accept', [
            'token' => $invite->token,
            'corporation' => [
                'id' => $invite->corporation->id,
                'name' => $invite->corporation->name,
            ],
            'email' => $invite->email,
            'isEmailLocked' => $invite->type === CorporationInvite::TYPE_EMAIL,
            'expiresAt' => $invite->expires_at?->toIso8601String(),
        ]);
    }

    public function register(Request $request, string $token)
    {
        $invite = CorporationInvite::where('token', $token)->with('corporation')->first();

        if (! $invite || ! $invite->isValid() || ! $invite->corporation || ! $invite->corporation->isApproved()) {
            return redirect()->route('invite.show', $token)
                ->with('error', 'This invitation is no longer valid.');
        }

        $rules = [
            'name' => 'required|string|max:255',
            'password' => 'required|string|min:8|confirmed',
        ];

        if ($invite->type === CorporationInvite::TYPE_EMAIL) {
            // Email invite: lock email to the invited address.
            $rules['email'] = ['required', 'email', Rule::in([$invite->email]), 'unique:users,email'];
        } else {
            $rules['email'] = 'required|email|max:255|unique:users,email';
        }

        $validated = $request->validate($rules);

        $user = DB::transaction(function () use ($invite, $validated) {
            // Re-check inside the transaction to close the race.
            $fresh = CorporationInvite::where('id', $invite->id)->lockForUpdate()->first();
            if (! $fresh || ! $fresh->isValid()) {
                abort(409, 'Invitation is no longer valid.');
            }

            $u = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => User::ROLE_USER,
                'corporation_id' => $invite->corporation_id,
                'is_corporation_manager' => false,
            ]);

            $u->syncRoles([User::ROLE_USER]);

            $fresh->markUsed($u);

            return $u;
        });

        AuditLog::record('created', 'User', $user->id,
            "User '{$user->email}' joined corporation '{$invite->corporation->name}' via invite");

        auth()->login($user);
        $request->session()->regenerate();

        return redirect()->route('dashboard')
            ->with('success', "Welcome to {$invite->corporation->name}!");
    }
}
