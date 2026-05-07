<?php

use App\Models\Assessment;
use App\Models\AssessmentItem;
use App\Models\AuditLog;
use App\Models\Control;
use App\Models\Corporation;
use App\Models\Evidence;
use App\Models\Framework;
use App\Models\Risk;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed(\Database\Seeders\RolePermissionSeeder::class);
});

function p4_corp(string $tag): Corporation
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

function p4_user(Corporation $corp, string $role = 'user'): User
{
    $u = User::factory()->create([
        'corporation_id' => $corp->id,
        'role' => $role,
    ]);
    $u->syncRoles([$role]);

    return $u;
}

function p4_framework(): Framework
{
    return Framework::create([
        'name' => 'P4 FW '.uniqid(),
        'short_name' => 'P4'.substr(uniqid(), -4),
        'description' => 't',
        'is_active' => true,
    ]);
}

function p4_assessmentWithEvidence(Corporation $corp, User $owner): array
{
    $fw = p4_framework();
    $assessment = Assessment::create([
        'user_id' => $owner->id,
        'corporation_id' => $corp->id,
        'framework_id' => $fw->id,
        'title' => 'A '.uniqid(),
        'scope' => 's',
        'period' => 'p',
        'status' => 'completed',
        'compliance_percentage' => 50,
    ]);
    $control = Control::create([
        'framework_id' => $fw->id,
        'control_id' => 'CTL-'.uniqid(),
        'title' => 'C',
        'description' => 'd',
    ]);
    $item = AssessmentItem::create([
        'assessment_id' => $assessment->id,
        'control_id' => $control->id,
        'compliance_status' => 'compliant',
    ]);
    $evidence = Evidence::create([
        'user_id' => $owner->id,
        'assessment_item_id' => $item->id,
        'title' => 'E',
        'file_path' => 'evidence/p4-'.uniqid().'.pdf',
        'file_name' => 'e.pdf',
        'file_type' => 'application/pdf',
        'status' => 'pending',
    ]);

    return ['assessment' => $assessment, 'item' => $item, 'evidence' => $evidence, 'control' => $control];
}

// ──── Finding #7: cross-tenant evidence approve / reject / aiReview ─────────

test('finding 7: auditor cannot approve another tenant evidence', function () {
    $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    $a = p4_corp('A');
    $b = p4_corp('B');
    $auditorA = p4_user($a, User::ROLE_AUDITOR);
    $userB = p4_user($b);

    ['evidence' => $evidenceB] = p4_assessmentWithEvidence($b, $userB);

    $resp = $this->actingAs($auditorA)->post(route('evidence.approve', $evidenceB->id));
    $resp->assertForbidden();
    expect($evidenceB->fresh()->status)->toBe('pending');
});

test('finding 7: auditor cannot reject another tenant evidence', function () {
    $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    $a = p4_corp('A');
    $b = p4_corp('B');
    $auditorA = p4_user($a, User::ROLE_AUDITOR);
    $userB = p4_user($b);

    ['evidence' => $evidenceB] = p4_assessmentWithEvidence($b, $userB);

    $resp = $this->actingAs($auditorA)->post(route('evidence.reject', $evidenceB->id));
    $resp->assertForbidden();
    expect($evidenceB->fresh()->status)->toBe('pending');
});

test('finding 7: auditor cannot run AI review on another tenant evidence', function () {
    $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    $a = p4_corp('A');
    $b = p4_corp('B');
    $auditorA = p4_user($a, User::ROLE_AUDITOR);
    $userB = p4_user($b);

    ['evidence' => $evidenceB] = p4_assessmentWithEvidence($b, $userB);

    $resp = $this->actingAs($auditorA)->post(route('evidence.ai-review', $evidenceB->id));
    $resp->assertForbidden();
});

// ──── Finding #10: cross-tenant assessment delete cannot delete evidence ─

test('finding 10: cross-tenant assessment delete cannot delete foreign evidence', function () {
    $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    $a = p4_corp('A');
    $b = p4_corp('B');
    $userA = p4_user($a);
    $bAdmin = p4_user($b, User::ROLE_ADMIN);

    [
        'assessment' => $assessmentB,
        'evidence' => $evidenceB,
    ] = p4_assessmentWithEvidence($b, $bAdmin);

    Storage::fake('public');
    Storage::disk('public')->put($evidenceB->file_path, 'fake-pdf-bytes');

    $resp = $this->actingAs($userA)->delete(route('assessments.destroy', $assessmentB->id));

    $resp->assertForbidden();
    // Assessment + evidence + file all still present.
    expect(Assessment::find($assessmentB->id))->not->toBeNull();
    expect(Evidence::find($evidenceB->id))->not->toBeNull();
    Storage::disk('public')->assertExists($evidenceB->file_path);
});

// ──── Finding #11: chatbot scoping ──────────────────────────────────────────

test('finding 11: chatbot index does not leak other tenant risks', function () {
    $a = p4_corp('A');
    $b = p4_corp('B');
    $userA = p4_user($a);
    $bAdmin = p4_user($b, User::ROLE_ADMIN);

    Risk::create([
        'user_id' => $userA->id,
        'corporation_id' => $a->id,
        'title' => 'A-only-risk',
        'description' => 'd',
        'category' => 'Technical',
        'owner' => 'a',
        'likelihood' => 5,
        'impact' => 5,
        'status' => 'open',
        'treatment' => 'mitigate',
    ]);
    Risk::create([
        'user_id' => $bAdmin->id,
        'corporation_id' => $b->id,
        'title' => 'B-secret-risk',
        'description' => 'd',
        'category' => 'Technical',
        'owner' => 'b',
        'likelihood' => 5,
        'impact' => 5,
        'status' => 'open',
        'treatment' => 'mitigate',
    ]);

    $resp = $this->actingAs($userA)->get(route('chatbot.index'));
    $resp->assertOk();

    $page = $resp->viewData('page');
    $payload = json_encode($page['props']);

    expect($payload)->toContain('A-only-risk');
    expect($payload)->not->toContain('B-secret-risk');
});

test('finding 11: chatbot risk count is tenant-scoped', function () {
    $a = p4_corp('A');
    $b = p4_corp('B');
    $userA = p4_user($a);
    $bAdmin = p4_user($b, User::ROLE_ADMIN);

    // 2 open risks in A.
    foreach (range(1, 2) as $i) {
        Risk::create([
            'user_id' => $userA->id,
            'corporation_id' => $a->id,
            'title' => 'A-r'.$i,
            'description' => 'd',
            'category' => 'Technical',
            'owner' => 'a',
            'likelihood' => 3,
            'impact' => 3,
            'status' => 'open',
            'treatment' => 'mitigate',
        ]);
    }

    // 5 open risks in B.
    foreach (range(1, 5) as $i) {
        Risk::create([
            'user_id' => $bAdmin->id,
            'corporation_id' => $b->id,
            'title' => 'B-r'.$i,
            'description' => 'd',
            'category' => 'Technical',
            'owner' => 'b',
            'likelihood' => 3,
            'impact' => 3,
            'status' => 'open',
            'treatment' => 'mitigate',
        ]);
    }

    $resp = $this->actingAs($userA)->get(route('chatbot.index'));
    $resp->assertOk();
    $ctx = $resp->viewData('page')['props']['context'];

    expect($ctx['risks']['total_open'])->toBe(2);
});

test('finding 11: chatbot omits audit-log entries for non-reviewer users', function () {
    $a = p4_corp('A');
    $userA = p4_user($a, User::ROLE_USER);

    AuditLog::create([
        'user_id' => $userA->id,
        'user_name' => $userA->name,
        'action' => 'created',
        'model_type' => 'Risk',
        'model_id' => 1,
        'description' => 'AUDIT-LOG-LINE-VISIBLE-ONLY-TO-REVIEWERS',
    ]);

    $resp = $this->actingAs($userA)->get(route('chatbot.index'));
    $resp->assertOk();
    $ctx = $resp->viewData('page')['props']['context'];

    expect($ctx['recent_audit_logs'])->toBeEmpty();
    $payload = json_encode($ctx);
    expect($payload)->not->toContain('AUDIT-LOG-LINE-VISIBLE-ONLY-TO-REVIEWERS');
});

test('finding 11: chatbot includes audit-log entries for auditor', function () {
    $a = p4_corp('A');
    $auditorA = p4_user($a, User::ROLE_AUDITOR);

    AuditLog::create([
        'user_id' => $auditorA->id,
        'user_name' => $auditorA->name,
        'action' => 'created',
        'model_type' => 'Risk',
        'model_id' => 1,
        'description' => 'A-tenant-audit-line',
    ]);

    $resp = $this->actingAs($auditorA)->get(route('chatbot.index'));
    $resp->assertOk();
    $ctx = $resp->viewData('page')['props']['context'];

    $logs = $ctx['recent_audit_logs'];
    $logsArr = is_object($logs) && method_exists($logs, 'toArray') ? $logs->toArray() : (array) $logs;
    expect(count($logsArr))->toBeGreaterThan(0);
    expect(json_encode($logsArr))->toContain('A-tenant-audit-line');
});
