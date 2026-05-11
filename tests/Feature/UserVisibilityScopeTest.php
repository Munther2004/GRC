<?php

use App\Models\Assessment;
use App\Models\AssessmentItem;
use App\Models\Control;
use App\Models\Corporation;
use App\Models\Framework;
use App\Models\Risk;
use App\Models\RiskTreatmentPlan;
use App\Models\SecurityAudit;
use App\Models\User;

beforeEach(function () {
    $this->seed(\Database\Seeders\RolePermissionSeeder::class);
    $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
});

function v_corp(): Corporation
{
    return Corporation::create([
        'name' => 'V Corp '.uniqid(),
        'email' => 'v_'.uniqid().'@example.test',
        'industry' => 'technology',
        'registration_code' => strtoupper(bin2hex(random_bytes(8))),
        'last_code_generated_at' => now(),
        'status' => 'approved',
        'approved_at' => now(),
    ]);
}

function v_user(Corporation $corp, string $role = User::ROLE_USER): User
{
    $u = User::factory()->create([
        'corporation_id' => $corp->id,
        'role' => $role,
    ]);
    $u->syncRoles([$role]);

    return $u;
}

function v_framework(): Framework
{
    return Framework::create([
        'name' => 'V FW '.uniqid(),
        'short_name' => 'VFW'.substr(uniqid(), -4),
        'description' => 'fw',
        'is_active' => true,
    ]);
}

function v_assessment(Corporation $corp, User $owner): Assessment
{
    return Assessment::create([
        'user_id' => $owner->id,
        'corporation_id' => $corp->id,
        'framework_id' => v_framework()->id,
        'title' => 'A '.uniqid(),
        'scope' => 's',
        'period' => 'p',
        'status' => 'in_progress',
        'compliance_percentage' => 0,
    ]);
}

function v_risk(Corporation $corp, User $owner): Risk
{
    return Risk::create([
        'user_id' => $owner->id,
        'corporation_id' => $corp->id,
        'title' => 'R '.uniqid(),
        'description' => 'd',
        'category' => 'Technical',
        'owner' => $owner->name,
        'likelihood' => 3,
        'impact' => 3,
        'status' => 'open',
        'treatment' => 'mitigate',
    ]);
}

// ───── RiskTreatmentPlanController ───────────────────────────────────────────

test('user cannot store a treatment plan against another user-owned risk in the same corp', function () {
    $corp = v_corp();
    $alice = v_user($corp);
    $bob = v_user($corp);
    $bobsRisk = v_risk($corp, $bob);

    $this->actingAs($alice)
        ->post(route('risks.treatment-plans.store', $bobsRisk->id), [
            'strategy' => 'mitigate',
            'description' => 'tampering',
            'owner' => $alice->name,
            'progress' => 0,
            'status' => 'not_started',
        ])
        ->assertForbidden();
});

test('user can store a treatment plan against their own risk', function () {
    $corp = v_corp();
    $alice = v_user($corp);
    $herRisk = v_risk($corp, $alice);

    $this->actingAs($alice)
        ->post(route('risks.treatment-plans.store', $herRisk->id), [
            'strategy' => 'mitigate',
            'description' => 'mine',
            'owner' => $alice->name,
            'progress' => 0,
            'status' => 'not_started',
        ])
        ->assertRedirect();

    expect(RiskTreatmentPlan::where('risk_id', $herRisk->id)->count())->toBe(1);
});

test('admin in same corp can store a treatment plan against any user-owned risk', function () {
    $corp = v_corp();
    $admin = v_user($corp, User::ROLE_ADMIN);
    $bob = v_user($corp);
    $bobsRisk = v_risk($corp, $bob);

    $this->actingAs($admin)
        ->post(route('risks.treatment-plans.store', $bobsRisk->id), [
            'strategy' => 'mitigate',
            'description' => 'reviewing',
            'owner' => $admin->name,
            'progress' => 0,
            'status' => 'not_started',
        ])
        ->assertRedirect();
});

// ───── SecurityAuditController ───────────────────────────────────────────────

test('user cannot show another user-owned security audit in the same corp', function () {
    $corp = v_corp();
    $alice = v_user($corp);
    $bob = v_user($corp);
    $bobsAudit = SecurityAudit::create([
        'user_id' => $bob->id,
        'corporation_id' => $corp->id,
        'file_name' => 'b.yaml',
        'file_type' => 'text/yaml',
        'file_size' => 100,
        'file_path' => 'security-audits/b-'.uniqid().'.yaml',
        'status' => 'completed',
    ]);

    $this->actingAs($alice)
        ->get(route('security-audits.show', $bobsAudit->id))
        ->assertForbidden();
});

test('admin in same corp can show any user-owned security audit', function () {
    $corp = v_corp();
    $admin = v_user($corp, User::ROLE_ADMIN);
    $bob = v_user($corp);
    $bobsAudit = SecurityAudit::create([
        'user_id' => $bob->id,
        'corporation_id' => $corp->id,
        'file_name' => 'b.yaml',
        'file_type' => 'text/yaml',
        'file_size' => 100,
        'file_path' => 'security-audits/b-'.uniqid().'.yaml',
        'status' => 'completed',
    ]);

    $this->actingAs($admin)
        ->get(route('security-audits.show', $bobsAudit->id))
        ->assertOk();
});

// ───── Admin/AIController ────────────────────────────────────────────────────

test('user cannot summarize another user-owned assessment via AI in the same corp', function () {
    $corp = v_corp();
    $alice = v_user($corp);
    $bob = v_user($corp);
    $bobsAssessment = v_assessment($corp, $bob);

    $resp = $this->actingAs($alice)
        ->post(route('ai.assessment-summary', $bobsAssessment->id));

    expect(in_array($resp->status(), [403, 404]))->toBeTrue();
});
