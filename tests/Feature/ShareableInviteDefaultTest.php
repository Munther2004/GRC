<?php

use App\Models\Corporation;
use App\Models\CorporationInvite;
use App\Models\User;

beforeEach(function () {
    $this->seed(\Database\Seeders\RolePermissionSeeder::class);
    $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
});

function makeCorpForShareable(): Corporation
{
    return Corporation::create([
        'name' => 'Shareable Corp '.uniqid(),
        'email' => 'shr_'.uniqid().'@example.test',
        'industry' => 'technology',
        'registration_code' => strtoupper(bin2hex(random_bytes(8))),
        'last_code_generated_at' => now(),
        'status' => 'approved',
        'approved_at' => now(),
    ]);
}

function makeAdminFor(Corporation $corp): User
{
    $u = User::factory()->create([
        'corporation_id' => $corp->id,
        'role' => User::ROLE_ADMIN,
    ]);
    $u->syncRoles([User::ROLE_ADMIN]);

    return $u;
}

test('shareable invite gets a 30-day expiry when expires_in_days is omitted', function () {
    $corp = makeCorpForShareable();
    $admin = makeAdminFor($corp);

    $this->actingAs($admin)
        ->post(route('admin.invites.shareable'), [])
        ->assertRedirect();

    $invite = CorporationInvite::query()
        ->where('corporation_id', $corp->id)
        ->where('type', CorporationInvite::TYPE_SHAREABLE)
        ->latest('id')
        ->first();

    expect($invite)->not->toBeNull();
    expect($invite->expires_at)->not->toBeNull();

    // Should be ~30 days out; allow a 60-second slack window for clock drift.
    $delta = now()->addDays(30)->diffInSeconds($invite->expires_at, true);
    expect($delta)->toBeLessThan(60);
});

test('shareable invite respects an explicit expires_in_days value', function () {
    $corp = makeCorpForShareable();
    $admin = makeAdminFor($corp);

    $this->actingAs($admin)
        ->post(route('admin.invites.shareable'), ['expires_in_days' => 7])
        ->assertRedirect();

    $invite = CorporationInvite::query()
        ->where('corporation_id', $corp->id)
        ->where('type', CorporationInvite::TYPE_SHAREABLE)
        ->latest('id')
        ->first();

    expect($invite)->not->toBeNull();
    $delta = now()->addDays(7)->diffInSeconds($invite->expires_at, true);
    expect($delta)->toBeLessThan(60);
});
