<?php

use App\Jobs\RunFileReputationCheck;
use App\Models\Evidence;
use App\Models\FileReputationCheck;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Config;

function makeSuperAdmin(): User
{
    return User::factory()->create([
        'role' => User::ROLE_SUPER_ADMIN,
    ]);
}

function makeUploader(): User
{
    return User::factory()->create([
        'role' => User::ROLE_USER,
    ]);
}

function makeEvidence(?User $uploader = null, array $overrides = []): Evidence
{
    $uploader ??= makeUploader();

    return Evidence::create(array_merge([
        'user_id' => $uploader->id,
        'title' => 'Sample Policy',
        'file_name' => 'policy.pdf',
        'file_path' => 'evidence/policy.pdf',
        'file_type' => 'application/pdf',
        'status' => 'pending',
    ], $overrides));
}

beforeEach(function () {
    Config::set('services.virustotal.enabled', true);
    Config::set('services.virustotal.key', 'test-api-key');
    $this->withoutMiddleware(ValidateCsrfToken::class);
});

it('queues a reputation check and creates a pending row', function () {
    Bus::fake();

    $admin = makeSuperAdmin();
    $evidence = makeEvidence();

    $response = $this->actingAs($admin)
        ->post(route('admin.evidence.reputation-check', $evidence));

    $response->assertRedirect();
    $response->assertSessionHas('success', 'Reputation check queued.');

    expect(FileReputationCheck::count())->toBe(1);

    $check = FileReputationCheck::first();
    expect($check->status)->toBe('pending');
    expect($check->checkable_type)->toBe(Evidence::class);
    expect($check->checkable_id)->toBe($evidence->id);
    expect($check->file_name)->toBe('policy.pdf');
    expect($check->file_path)->toBe('evidence/policy.pdf');
    expect($check->checked_by)->toBe($admin->id);

    Bus::assertDispatched(RunFileReputationCheck::class, function ($job) use ($check) {
        return $job->reputationCheck->id === $check->id;
    });
});

it('rejects unauthenticated requests', function () {
    $evidence = makeEvidence();

    $response = $this->post(route('admin.evidence.reputation-check', $evidence));

    $response->assertRedirect(route('login'));
    expect(FileReputationCheck::count())->toBe(0);
});

it('flashes an error when VirusTotal is disabled', function () {
    Bus::fake();
    Config::set('services.virustotal.enabled', false);

    $admin = makeSuperAdmin();
    $evidence = makeEvidence();

    $response = $this->actingAs($admin)
        ->post(route('admin.evidence.reputation-check', $evidence));

    $response->assertRedirect();
    $response->assertSessionHas('error', 'VirusTotal integration is disabled.');

    expect(FileReputationCheck::count())->toBe(0);
    Bus::assertNotDispatched(RunFileReputationCheck::class);
});

it('flashes an error when evidence has no file', function () {
    Bus::fake();

    $admin = makeSuperAdmin();
    $evidence = makeEvidence(overrides: ['file_path' => null]);

    $response = $this->actingAs($admin)
        ->post(route('admin.evidence.reputation-check', $evidence));

    $response->assertRedirect();
    $response->assertSessionHas('error', 'This evidence has no uploaded file to scan.');

    expect(FileReputationCheck::count())->toBe(0);
    Bus::assertNotDispatched(RunFileReputationCheck::class);
});

it('forbids users without an organisational role', function () {
    Bus::fake();

    $plainUser = User::factory()->create([
        'role' => User::ROLE_USER,
    ]);
    $evidence = makeEvidence();

    $response = $this->actingAs($plainUser)
        ->post(route('admin.evidence.reputation-check', $evidence));

    $response->assertForbidden();
    expect(FileReputationCheck::count())->toBe(0);
    Bus::assertNotDispatched(RunFileReputationCheck::class);
});
