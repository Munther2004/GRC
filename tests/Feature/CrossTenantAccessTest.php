<?php

use App\Models\Assessment;
use App\Models\AssessmentItem;
use App\Models\Control;
use App\Models\Corporation;
use App\Models\Evidence;
use App\Models\Framework;
use App\Models\Risk;
use App\Models\SecurityAudit;
use App\Models\User;

beforeEach(function () {
    $this->seed(\Database\Seeders\RolePermissionSeeder::class);
});

function makeCorp(string $tag): Corporation
{
    return Corporation::create([
        'name' => "Corp $tag ".uniqid(),
        'email' => strtolower($tag).'_'.uniqid().'@example.test',
        'industry' => 'technology',
        'registration_code' => strtoupper(bin2hex(random_bytes(8))).$tag,
        'last_code_generated_at' => now(),
        'status' => 'approved',
        'approved_at' => now(),
    ]);
}

function userIn(Corporation $corp, string $role = 'user'): User
{
    $u = User::factory()->create([
        'corporation_id' => $corp->id,
        'role' => $role,
    ]);
    $u->syncRoles([$role]);

    return $u;
}

function makeFramework(): Framework
{
    return Framework::create([
        'name' => 'Test FW '.uniqid(),
        'short_name' => 'TFW'.substr(uniqid(), -4),
        'description' => 't',
        'is_active' => true,
    ]);
}

function makeAssessmentInCorp(Corporation $corp, User $owner, ?Framework $fw = null): Assessment
{
    return Assessment::create([
        'user_id' => $owner->id,
        'corporation_id' => $corp->id,
        'framework_id' => ($fw ?? makeFramework())->id,
        'title' => 'Asmt '.uniqid(),
        'scope' => 's',
        'period' => 'p',
        'status' => 'completed',
        'compliance_percentage' => 50,
    ]);
}

function makeRiskInCorp(Corporation $corp, User $owner, array $overrides = []): Risk
{
    return Risk::create(array_merge([
        'user_id' => $owner->id,
        'corporation_id' => $corp->id,
        'title' => 'Risk '.uniqid(),
        'description' => 'd',
        'category' => 'Technical',
        'owner' => $owner->name,
        'likelihood' => 3,
        'impact' => 3,
        'status' => 'open',
        'treatment' => 'mitigate',
    ], $overrides));
}

// ───── Finding #14: object-level auth on Risks ─────────────────────────────

test('finding 14: cross-tenant risk show is forbidden', function () {
    $corpA = makeCorp('A');
    $corpB = makeCorp('B');
    $userA = userIn($corpA);
    $bAdmin = userIn($corpB, User::ROLE_ADMIN);

    $riskB = makeRiskInCorp($corpB, $bAdmin);

    $resp = $this->actingAs($userA)->get(route('risks.show', $riskB->id));
    $resp->assertForbidden();
});

test('finding 14: cross-tenant risk update is forbidden', function () {
    $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    $corpA = makeCorp('A');
    $corpB = makeCorp('B');
    $userA = userIn($corpA);
    $bAdmin = userIn($corpB, User::ROLE_ADMIN);

    $riskB = makeRiskInCorp($corpB, $bAdmin, ['title' => 'Original B title']);

    $resp = $this->actingAs($userA)->put(route('risks.update', $riskB->id), [
        'title' => 'PWNED',
        'description' => 'd',
        'category' => 'Technical',
        'owner' => 'x',
        'likelihood' => 5,
        'impact' => 5,
        'status' => 'open',
        'treatment' => 'mitigate',
    ]);
    $resp->assertForbidden();
    expect($riskB->fresh()->title)->toBe('Original B title');
});

test('finding 14: cross-tenant risk destroy is forbidden', function () {
    $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    $corpA = makeCorp('A');
    $corpB = makeCorp('B');
    $userA = userIn($corpA);
    $bAdmin = userIn($corpB, User::ROLE_ADMIN);

    $riskB = makeRiskInCorp($corpB, $bAdmin);

    $resp = $this->actingAs($userA)->delete(route('risks.destroy', $riskB->id));
    $resp->assertForbidden();
    expect(Risk::find($riskB->id))->not->toBeNull();
});

test('finding 14: same-tenant risk show still works', function () {
    $corpA = makeCorp('A');
    $userA = userIn($corpA);
    $riskA = makeRiskInCorp($corpA, $userA);

    $resp = $this->actingAs($userA)->get(route('risks.show', $riskA->id));
    $resp->assertOk();
});

// ───── Finding #14: object-level auth on Assessments ────────────────────────

test('finding 14: cross-tenant assessment show is forbidden', function () {
    $corpA = makeCorp('A');
    $corpB = makeCorp('B');
    $userA = userIn($corpA);
    $bAdmin = userIn($corpB, User::ROLE_ADMIN);

    $assessmentB = makeAssessmentInCorp($corpB, $bAdmin);

    $resp = $this->actingAs($userA)->get(route('assessments.show', $assessmentB->id));
    $resp->assertForbidden();
});

test('finding 14: cross-tenant assessment submit is forbidden', function () {
    $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    $corpA = makeCorp('A');
    $corpB = makeCorp('B');
    $userA = userIn($corpA);
    $bAdmin = userIn($corpB, User::ROLE_ADMIN);

    $assessmentB = Assessment::create([
        'user_id' => $bAdmin->id,
        'corporation_id' => $corpB->id,
        'framework_id' => makeFramework()->id,
        'title' => 'B',
        'scope' => 's',
        'period' => 'p',
        'status' => 'in_progress',
        'compliance_percentage' => 0,
    ]);

    $resp = $this->actingAs($userA)->post(route('assessments.submit', $assessmentB->id));
    $resp->assertForbidden();
    expect($assessmentB->fresh()->status)->toBe('in_progress');
});

test('finding 14: same-tenant assessment show still works', function () {
    $corpA = makeCorp('A');
    $userA = userIn($corpA);
    $assessmentA = makeAssessmentInCorp($corpA, $userA);

    $resp = $this->actingAs($userA)->get(route('assessments.show', $assessmentA->id));
    $resp->assertOk();
});

// ───── Finding #14: object-level auth on Evidence ───────────────────────────

test('finding 14: cross-tenant evidence download is forbidden', function () {
    $corpA = makeCorp('A');
    $corpB = makeCorp('B');
    $userA = userIn($corpA);
    $bAdmin = userIn($corpB, User::ROLE_ADMIN);

    $assessmentB = makeAssessmentInCorp($corpB, $bAdmin);
    $control = Control::create([
        'framework_id' => $assessmentB->framework_id,
        'control_id' => 'C-'.uniqid(),
        'title' => 'C',
        'description' => 'd',
    ]);
    $item = AssessmentItem::create([
        'assessment_id' => $assessmentB->id,
        'control_id' => $control->id,
        'compliance_status' => 'compliant',
    ]);
    $evidence = Evidence::create([
        'user_id' => $bAdmin->id,
        'assessment_item_id' => $item->id,
        'title' => 'E',
        'file_path' => 'evidence/fake-'.uniqid().'.pdf',
        'file_name' => 'e.pdf',
        'file_type' => 'application/pdf',
        'status' => 'pending',
    ]);

    $resp = $this->actingAs($userA)->get(route('evidence.download', $evidence->id));
    $resp->assertForbidden();
});

// ───── Finding #4: SecurityAudit file path / cross-tenant ──────────────────

test('finding 4: SecurityAudit show no longer leaks file_path', function () {
    $corpA = makeCorp('A');
    $userA = userIn($corpA, User::ROLE_ADMIN);

    $audit = SecurityAudit::create([
        'user_id' => $userA->id,
        'file_name' => 'config.yaml',
        'file_type' => 'text/yaml',
        'file_size' => 1024,
        'file_path' => 'security-audits/secret-path-12345.yaml',
        'status' => 'completed',
    ]);

    $resp = $this->actingAs($userA)->get(route('security-audits.show', $audit->id));
    $resp->assertOk();

    $props = $resp->viewData('page')['props'];
    expect($props['audit'])->not->toHaveKey('file_path');
    expect($props['audit'])->toHaveKey('has_file');
    expect($props['audit']['has_file'])->toBeTrue();
});

test('finding 4: cross-tenant SecurityAudit show is forbidden', function () {
    $corpA = makeCorp('A');
    $corpB = makeCorp('B');
    $userA = userIn($corpA);
    $bAdmin = userIn($corpB, User::ROLE_ADMIN);

    $auditB = SecurityAudit::create([
        'user_id' => $bAdmin->id,
        'file_name' => 'b.yaml',
        'file_type' => 'text/yaml',
        'file_size' => 100,
        'file_path' => 'security-audits/b-'.uniqid().'.yaml',
        'status' => 'completed',
    ]);

    $resp = $this->actingAs($userA)->get(route('security-audits.show', $auditB->id));
    $resp->assertForbidden();
});

// ───── Finding #3: AI controller cross-tenant ──────────────────────────────

test('finding 3: AI assessment-summary refuses cross-tenant', function () {
    $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    $corpA = makeCorp('A');
    $corpB = makeCorp('B');
    $userA = userIn($corpA);
    $bAdmin = userIn($corpB, User::ROLE_ADMIN);

    $assessmentB = makeAssessmentInCorp($corpB, $bAdmin);

    $resp = $this->actingAs($userA)
        ->post(route('ai.assessment-summary', $assessmentB->id));

    // 404 (scoped findOrFail-style) is acceptable; 403 is also fine.
    expect(in_array($resp->status(), [403, 404]))->toBeTrue();
});

test('finding 3: AI review-evidence refuses cross-tenant', function () {
    $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    $corpA = makeCorp('A');
    $corpB = makeCorp('B');
    // userA must be auditor/admin to even reach the route — finding scope is
    // "auditors/admins of one tenant submitting another tenant's evidence".
    $userA = userIn($corpA, User::ROLE_AUDITOR);
    $bAdmin = userIn($corpB, User::ROLE_ADMIN);

    $assessmentB = makeAssessmentInCorp($corpB, $bAdmin);
    $control = Control::create([
        'framework_id' => $assessmentB->framework_id,
        'control_id' => 'C-'.uniqid(),
        'title' => 'C',
        'description' => 'd',
    ]);
    $item = AssessmentItem::create([
        'assessment_id' => $assessmentB->id,
        'control_id' => $control->id,
        'compliance_status' => 'compliant',
    ]);
    $evidenceB = Evidence::create([
        'user_id' => $bAdmin->id,
        'assessment_item_id' => $item->id,
        'title' => 'B-evidence',
        'file_path' => 'evidence/b-'.uniqid().'.pdf',
        'file_name' => 'b.pdf',
        'file_type' => 'application/pdf',
        'status' => 'pending',
    ]);

    $resp = $this->actingAs($userA)
        ->post(route('ai.review-evidence'), ['evidence_id' => $evidenceB->id]);

    $resp->assertForbidden();
});

test('finding 3: AI save-remediation does not append to other tenant risks', function () {
    $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    $corpA = makeCorp('A');
    $corpB = makeCorp('B');
    $userA = userIn($corpA);
    $bAdmin = userIn($corpB, User::ROLE_ADMIN);

    $framework = makeFramework();
    $control = Control::create([
        'framework_id' => $framework->id,
        'control_id' => 'C-'.uniqid(),
        'title' => 'C',
        'description' => 'd',
    ]);

    // Pre-existing AI-generated risk in corp B for this control.
    $riskB = makeRiskInCorp($corpB, $bAdmin, [
        'auto_generated' => true,
        'source_control_id' => $control->id,
        'treatment_plan' => 'B-original-plan',
    ]);

    // userA (corp A) tries to append plan text to riskB by way of control_id.
    $resp = $this->actingAs($userA)
        ->postJson(route('ai.save-remediation'), [
            'control_id' => $control->id,
            'plan_text' => 'ATTACKER-INJECTED',
        ]);

    // riskB must not have been touched.
    expect($riskB->fresh()->treatment_plan)->toBe('B-original-plan');
    // Response should be a 4xx/5xx — userA has no assessment context for this
    // control in their tenant, so the 422 / 403 / 404 path is acceptable.
    expect($resp->status())->toBeGreaterThanOrEqual(400);
});
