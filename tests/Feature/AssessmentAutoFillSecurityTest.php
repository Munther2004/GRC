<?php

use App\Models\Assessment;
use App\Models\Corporation;
use App\Models\Framework;
use App\Models\User;

beforeEach(function () {
    $this->seed(\Database\Seeders\RolePermissionSeeder::class);
});

function makeAssessmentForCorp(int $corpId, int $userId): Assessment
{
    $framework = Framework::create([
        'name' => 'Test FW '.uniqid(),
        'short_name' => 'TFW'.substr(uniqid(), -4),
        'description' => 't',
        'is_active' => true,
    ]);

    return Assessment::create([
        'user_id' => $userId,
        'corporation_id' => $corpId,
        'framework_id' => $framework->id,
        'title' => 'Test '.uniqid(),
        'scope' => 's',
        'period' => 'p',
        'status' => 'draft',
        'compliance_percentage' => 0,
    ]);
}

test('finding 13: auto-fill returns 404 in production env', function () {
    // Force production env. Bypass CSRF middleware since we're not testing
    // CSRF here — we're verifying the controller's env gate fires before
    // any side effects.
    $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    config(['app.env' => 'production']);
    app()->detectEnvironment(fn () => 'production');

    $corp = Corporation::create([
        'name' => 'Acme '.uniqid(),
        'email' => 'acme_'.uniqid().'@example.test',
        'industry' => 'technology',
        'registration_code' => strtoupper(bin2hex(random_bytes(8))),
        'last_code_generated_at' => now(),
        'status' => 'approved',
        'approved_at' => now(),
    ]);

    $admin = User::factory()->create([
        'corporation_id' => $corp->id,
        'role' => User::ROLE_ADMIN,
    ]);
    $admin->syncRoles([User::ROLE_ADMIN]);

    $assessment = makeAssessmentForCorp($corp->id, $admin->id);

    $response = $this->actingAs($admin)
        ->post(route('assessments.auto-fill', $assessment->id));

    $response->assertNotFound();
    expect($assessment->fresh()->status)->toBe('draft');
});

test('finding 13: auto-fill refuses cross-tenant assessment even in local env', function () {
    expect(app()->environment('testing'))->toBeTrue();

    $corpA = Corporation::create([
        'name' => 'A '.uniqid(),
        'email' => 'a_'.uniqid().'@example.test',
        'industry' => 'technology',
        'registration_code' => strtoupper(bin2hex(random_bytes(8))).'A',
        'last_code_generated_at' => now(),
        'status' => 'approved',
        'approved_at' => now(),
    ]);
    $corpB = Corporation::create([
        'name' => 'B '.uniqid(),
        'email' => 'b_'.uniqid().'@example.test',
        'industry' => 'technology',
        'registration_code' => strtoupper(bin2hex(random_bytes(8))).'B',
        'last_code_generated_at' => now(),
        'status' => 'approved',
        'approved_at' => now(),
    ]);

    $userA = User::factory()->create([
        'corporation_id' => $corpA->id,
        'role' => User::ROLE_USER,
    ]);
    $userA->syncRoles([User::ROLE_USER]);

    $bAdmin = User::factory()->create([
        'corporation_id' => $corpB->id,
        'role' => User::ROLE_ADMIN,
    ]);

    // Assessment belongs to corp B.
    $assessmentB = makeAssessmentForCorp($corpB->id, $bAdmin->id);

    // Corp A user tries to auto-fill it.
    $response = $this->actingAs($userA)
        ->post(route('assessments.auto-fill', $assessmentB->id));

    $response->assertForbidden();
    expect($assessmentB->fresh()->status)->toBe('draft');
});
