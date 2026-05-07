<?php

use App\Models\Control;
use App\Models\ControlStatusRequest;
use App\Models\Corporation;
use App\Models\Evidence;
use App\Models\Framework;
use App\Models\RemediationTask;
use App\Models\SecurityAudit;
use App\Models\User;

beforeEach(function () {
    $this->seed(\Database\Seeders\RolePermissionSeeder::class);
});

function p3_corp(string $tag): Corporation
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

function p3_user(Corporation $corp, string $role = 'user'): User
{
    $u = User::factory()->create([
        'corporation_id' => $corp->id,
        'role' => $role,
    ]);
    $u->syncRoles([$role]);

    return $u;
}

function p3_framework(): Framework
{
    return Framework::create([
        'name' => 'P3 FW '.uniqid(),
        'short_name' => 'P3'.substr(uniqid(), -4),
        'description' => 't',
        'is_active' => true,
    ]);
}

function p3_control(Framework $fw): Control
{
    return Control::create([
        'framework_id' => $fw->id,
        'control_id' => 'CTL-'.uniqid(),
        'title' => 'C',
        'description' => 'd',
    ]);
}

// ────── Finding #6: SecurityAudit cross-tenant ──────────────────────────────

test('finding 6: SecurityAudit destroy cross-tenant is forbidden', function () {
    $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    $a = p3_corp('A');
    $b = p3_corp('B');
    $userA = p3_user($a, User::ROLE_ADMIN);
    $userB = p3_user($b, User::ROLE_ADMIN);

    $auditB = SecurityAudit::create([
        'user_id' => $userB->id,
        'corporation_id' => $b->id,
        'file_name' => 'b.yaml',
        'file_type' => 'text/yaml',
        'file_size' => 100,
        'file_path' => 'security-audits/b-'.uniqid().'.yaml',
        'status' => 'completed',
    ]);

    $resp = $this->actingAs($userA)->delete(route('security-audits.destroy', $auditB->id));
    $resp->assertForbidden();
    expect(SecurityAudit::find($auditB->id))->not->toBeNull();
});

test('finding 6: SecurityAudit index hides other tenant audits', function () {
    $a = p3_corp('A');
    $b = p3_corp('B');
    $userA = p3_user($a, User::ROLE_ADMIN);
    $userB = p3_user($b, User::ROLE_ADMIN);

    SecurityAudit::create([
        'user_id' => $userA->id,
        'corporation_id' => $a->id,
        'file_name' => 'a.yaml',
        'file_type' => 'text/yaml',
        'file_size' => 100,
        'file_path' => 'security-audits/a-'.uniqid().'.yaml',
        'status' => 'completed',
    ]);
    SecurityAudit::create([
        'user_id' => $userB->id,
        'corporation_id' => $b->id,
        'file_name' => 'b.yaml',
        'file_type' => 'text/yaml',
        'file_size' => 100,
        'file_path' => 'security-audits/b-'.uniqid().'.yaml',
        'status' => 'completed',
    ]);

    $resp = $this->actingAs($userA)->get(route('security-audits.index'));
    $resp->assertOk();
    $props = $resp->viewData('page')['props'];

    $names = collect($props['audits']['data'])->pluck('file_name')->all();
    expect($names)->toContain('a.yaml');
    expect($names)->not->toContain('b.yaml');
    expect($props['stats']['total'])->toBe(1);
});

// ────── Finding #8: RemediationTask cross-tenant ────────────────────────────

test('finding 8: RemediationTask update cross-tenant is forbidden', function () {
    $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    $a = p3_corp('A');
    $b = p3_corp('B');
    $userA = p3_user($a);
    $userB = p3_user($b);

    $fw = p3_framework();
    $ctrl = p3_control($fw);

    $taskB = RemediationTask::create([
        'control_id' => $ctrl->id,
        'created_by' => $userB->id,
        'corporation_id' => $b->id,
        'title' => 'B-task original',
        'priority' => 'high',
        'status' => 'open',
    ]);

    $resp = $this->actingAs($userA)->put(route('remediation-tasks.update', $taskB->id), [
        'title' => 'PWNED',
        'priority' => 'critical',
        'status' => 'cancelled',
    ]);
    $resp->assertForbidden();
    expect($taskB->fresh()->title)->toBe('B-task original');
    expect($taskB->fresh()->status)->toBe('open');
});

test('finding 8: RemediationTask complete cross-tenant is forbidden', function () {
    $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    $a = p3_corp('A');
    $b = p3_corp('B');
    $userA = p3_user($a);
    $userB = p3_user($b);

    $fw = p3_framework();
    $ctrl = p3_control($fw);

    $taskB = RemediationTask::create([
        'control_id' => $ctrl->id,
        'created_by' => $userB->id,
        'corporation_id' => $b->id,
        'title' => 'B',
        'priority' => 'high',
        'status' => 'open',
    ]);

    $resp = $this->actingAs($userA)->post(route('remediation-tasks.complete', $taskB->id));
    $resp->assertForbidden();
    expect($taskB->fresh()->status)->toBe('open');
});

test('finding 8: RemediationTask destroy cross-tenant is forbidden', function () {
    $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    $a = p3_corp('A');
    $b = p3_corp('B');
    $userA = p3_user($a);
    $userB = p3_user($b);

    $fw = p3_framework();
    $ctrl = p3_control($fw);

    $taskB = RemediationTask::create([
        'control_id' => $ctrl->id,
        'created_by' => $userB->id,
        'corporation_id' => $b->id,
        'title' => 'B',
        'priority' => 'high',
        'status' => 'open',
    ]);

    $resp = $this->actingAs($userA)->delete(route('remediation-tasks.destroy', $taskB->id));
    $resp->assertForbidden();
    expect(RemediationTask::find($taskB->id))->not->toBeNull();
});

// ────── Finding #9: ControlStatusRequest cross-tenant ───────────────────────

test('finding 9: ControlStatusRequest approve cross-tenant is forbidden', function () {
    $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    $a = p3_corp('A');
    $b = p3_corp('B');

    // userA (auditor of corp A) tries to approve a corp B status request.
    $userA = p3_user($a, User::ROLE_AUDITOR);
    $userB = p3_user($b);

    $fw = p3_framework();
    $ctrl = p3_control($fw);

    $reqB = ControlStatusRequest::create([
        'control_id' => $ctrl->id,
        'requested_by' => $userB->id,
        'corporation_id' => $b->id,
        'requested_status' => 'compliant',
        'current_status' => null,
        'status' => 'pending',
    ]);

    $resp = $this->actingAs($userA)->post(route('controls.status-requests.approve', $reqB->id));
    $resp->assertForbidden();
    expect($reqB->fresh()->status)->toBe('pending');
});

test('finding 9: ControlStatusRequest reject cross-tenant is forbidden', function () {
    $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    $a = p3_corp('A');
    $b = p3_corp('B');
    $userA = p3_user($a, User::ROLE_AUDITOR);
    $userB = p3_user($b);

    $fw = p3_framework();
    $ctrl = p3_control($fw);

    $reqB = ControlStatusRequest::create([
        'control_id' => $ctrl->id,
        'requested_by' => $userB->id,
        'corporation_id' => $b->id,
        'requested_status' => 'compliant',
        'current_status' => null,
        'status' => 'pending',
    ]);

    $resp = $this->actingAs($userA)->post(route('controls.status-requests.reject', $reqB->id));
    $resp->assertForbidden();
    expect($reqB->fresh()->status)->toBe('pending');
});

test('finding 9: approval queue index hides other tenant requests', function () {
    $a = p3_corp('A');
    $b = p3_corp('B');
    $auditorA = p3_user($a, User::ROLE_AUDITOR);
    $userA = p3_user($a);
    $userB = p3_user($b);

    $fw = p3_framework();
    $ctrl1 = p3_control($fw);
    $ctrl2 = p3_control($fw);

    ControlStatusRequest::create([
        'control_id' => $ctrl1->id,
        'requested_by' => $userA->id,
        'corporation_id' => $a->id,
        'requested_status' => 'compliant',
        'status' => 'pending',
        'justification' => 'A-justification',
    ]);
    ControlStatusRequest::create([
        'control_id' => $ctrl2->id,
        'requested_by' => $userB->id,
        'corporation_id' => $b->id,
        'requested_status' => 'compliant',
        'status' => 'pending',
        'justification' => 'B-justification',
    ]);

    $resp = $this->actingAs($auditorA)->get(route('controls.approvals'));
    $resp->assertOk();
    $props = $resp->viewData('page')['props'];

    $justifications = collect($props['requests'])->pluck('justification')->all();
    expect($justifications)->toContain('A-justification');
    expect($justifications)->not->toContain('B-justification');
});

test('finding 9: approval queue does not leak evidence file_path', function () {
    $a = p3_corp('A');
    $auditorA = p3_user($a, User::ROLE_AUDITOR);
    $userA = p3_user($a);

    $fw = p3_framework();
    $ctrl = p3_control($fw);

    $reqA = ControlStatusRequest::create([
        'control_id' => $ctrl->id,
        'requested_by' => $userA->id,
        'corporation_id' => $a->id,
        'requested_status' => 'compliant',
        'status' => 'pending',
    ]);
    Evidence::create([
        'user_id' => $userA->id,
        'control_id' => $ctrl->id,
        'control_status_request_id' => $reqA->id,
        'title' => 'E',
        'file_path' => 'evidence/secret-storage-path-12345.pdf',
        'file_name' => 'e.pdf',
        'file_type' => 'application/pdf',
        'status' => 'pending',
    ]);

    $resp = $this->actingAs($auditorA)->get(route('controls.approvals'));
    $resp->assertOk();
    $props = $resp->viewData('page')['props'];

    expect($props['requests'])->toHaveCount(1);
    $evidenceProp = $props['requests'][0]['evidence'];
    expect($evidenceProp)->not->toHaveKey('file_path');
    expect($evidenceProp)->toHaveKey('has_file');
    expect($evidenceProp['has_file'])->toBeTrue();
});

// ────── Finding #8 side-effect: approval auto-close stays in tenant ─────────

test('finding 8: approving a status request only auto-closes same-tenant remediation tasks', function () {
    $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    $a = p3_corp('A');
    $b = p3_corp('B');
    $auditorA = p3_user($a, User::ROLE_AUDITOR);
    $userA = p3_user($a);
    $userB = p3_user($b);

    $fw = p3_framework();
    $ctrl = p3_control($fw);

    // Tenant A has an open remediation task on this control.
    $taskA = RemediationTask::create([
        'control_id' => $ctrl->id,
        'created_by' => $userA->id,
        'corporation_id' => $a->id,
        'title' => 'A task',
        'priority' => 'high',
        'status' => 'open',
    ]);

    // Tenant B has an open remediation task on the same global control.
    $taskB = RemediationTask::create([
        'control_id' => $ctrl->id,
        'created_by' => $userB->id,
        'corporation_id' => $b->id,
        'title' => 'B task',
        'priority' => 'high',
        'status' => 'open',
    ]);

    // Tenant A approves a "control became compliant" request.
    $reqA = ControlStatusRequest::create([
        'control_id' => $ctrl->id,
        'requested_by' => $userA->id,
        'corporation_id' => $a->id,
        'requested_status' => 'compliant',
        'current_status' => null,
        'status' => 'pending',
    ]);

    $resp = $this->actingAs($auditorA)->post(route('controls.status-requests.approve', $reqA->id));
    $resp->assertOk();

    // A's task is auto-closed.
    expect($taskA->fresh()->status)->toBe('completed');
    // B's task on the same global control is untouched.
    expect($taskB->fresh()->status)->toBe('open');
});
