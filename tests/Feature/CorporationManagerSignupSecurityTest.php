<?php

use App\Models\Corporation;
use App\Models\User;

beforeEach(function () {
    // Roles must exist so the manager-signup syncRoles call succeeds.
    $this->seed(\Database\Seeders\RolePermissionSeeder::class);
});

function makeApprovedCorporation(array $overrides = []): Corporation
{
    return Corporation::create(array_merge([
        'name' => 'Acme '.uniqid(),
        'email' => 'corp_'.uniqid().'@example.test',
        'industry' => 'technology',
        'registration_code' => 'TESTCODE'.strtoupper(substr(uniqid(), -4)),
        'last_code_generated_at' => now(),
        'status' => 'approved',
        'approved_at' => now(),
    ], $overrides));
}

test('finding 1: direct manager-signup POST without verification is refused', function () {
    $corp = makeApprovedCorporation();

    $response = $this->post(
        route('corporations.manager-register', $corp->id),
        [
            'name' => 'Attacker',
            'email' => 'attacker@example.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]
    );

    $response->assertRedirect(route('corporations.registration-pending', $corp->id));
    expect(User::where('email', 'attacker@example.test')->exists())->toBeFalse();
    expect($corp->fresh()->manager_user_id)->toBeNull();
});

test('finding 1: GET manager-signup page without verification redirects back to pending', function () {
    $corp = makeApprovedCorporation();

    $response = $this->get(route('corporations.manager-signup', $corp->id));

    $response->assertRedirect(route('corporations.registration-pending', $corp->id));
});

test('finding 1: legitimate verify-then-register flow still creates a manager', function () {
    $corp = makeApprovedCorporation(['registration_code' => 'GOODCODE1234']);

    // Step 1: verify code (binds verification proof to the session).
    $verify = $this->post(
        route('corporations.verify-code', $corp->id),
        ['code' => 'GOODCODE1234'],
    );
    $verify->assertRedirect(route('corporations.manager-signup', $corp->id));

    // Step 2: GET the signup page now succeeds.
    $page = $this->get(route('corporations.manager-signup', $corp->id));
    $page->assertOk();

    // Step 3: register manager.
    $register = $this->post(
        route('corporations.manager-register', $corp->id),
        [
            'name' => 'Legit Manager',
            'email' => 'manager@example.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]
    );
    $register->assertRedirect(route('corporate.dashboard'));

    $user = User::where('email', 'manager@example.test')->first();
    expect($user)->not->toBeNull();
    expect($user->corporation_id)->toBe($corp->id);
    expect($user->is_corporation_manager)->toBeTrue();
    expect($corp->fresh()->manager_user_id)->toBe($user->id);
});

test('finding 1: verification proof is consumed (single-use) — second register call refused', function () {
    $corp = makeApprovedCorporation(['registration_code' => 'ONCEONLY1234']);

    $this->post(route('corporations.verify-code', $corp->id), ['code' => 'ONCEONLY1234']);

    // First register — succeeds.
    $this->post(
        route('corporations.manager-register', $corp->id),
        [
            'name' => 'First',
            'email' => 'first@example.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]
    );

    expect($corp->fresh()->manager_user_id)->not->toBeNull();

    // Second register attempt — corp now has a manager AND the proof was
    // consumed, so even a fresh attacker session is refused.
    $this->post('/logout');

    $second = $this->post(
        route('corporations.manager-register', $corp->id),
        [
            'name' => 'Attacker',
            'email' => 'attacker@example.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]
    );

    $second->assertRedirect();
    expect(User::where('email', 'attacker@example.test')->exists())->toBeFalse();
});

test('finding 1: corp with existing manager refuses verify-code', function () {
    $existingMgr = User::factory()->create();
    $corp = makeApprovedCorporation([
        'registration_code' => 'TAKENCODE123',
        'manager_user_id' => $existingMgr->id,
    ]);

    $resp = $this->post(
        route('corporations.verify-code', $corp->id),
        ['code' => 'TAKENCODE123'],
    );

    // Even with the correct code, verify-code refuses because the corp is
    // already managed.
    $resp->assertRedirect();
    expect($corp->fresh()->manager_user_id)->toBe($existingMgr->id);
});

test('finding 2: pending page does not leak registration_code or manager_password', function () {
    $corp = makeApprovedCorporation([
        'registration_code' => 'SECRETCODE99',
        'manager_username' => 'mgr_secret',
        'manager_password' => bcrypt('hunter2'),
    ]);

    $response = $this->get(route('corporations.registration-pending', $corp->id));
    $response->assertOk();

    $page = $response->viewData('page');
    $props = $page['props'];

    expect($props['corporation'])->toBeArray();
    expect($props['corporation'])->not->toHaveKey('registration_code');
    expect($props['corporation'])->not->toHaveKey('manager_password');
    expect($props['corporation'])->not->toHaveKey('manager_username');
    expect($props['corporation']['name'])->toBe($corp->name);
});

test('finding 2: corporation model serializes without sensitive attributes by default', function () {
    $corp = makeApprovedCorporation([
        'registration_code' => 'HIDEME12345',
        'manager_username' => 'mgr_hide',
        'manager_password' => bcrypt('secret'),
    ]);

    $array = $corp->toArray();

    expect($array)->not->toHaveKey('registration_code');
    expect($array)->not->toHaveKey('manager_username');
    expect($array)->not->toHaveKey('manager_password');
});
