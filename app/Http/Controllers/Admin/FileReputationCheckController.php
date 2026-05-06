<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\RunFileReputationCheck;
use App\Models\Evidence;
use App\Models\FileReputationCheck;
use App\Models\SecurityAudit;
use App\Services\VirusTotalService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FileReputationCheckController extends Controller
{
    public function __construct(private readonly VirusTotalService $virusTotal) {}

    public function check(Request $request, Evidence $evidence)
    {
        $this->ensureCanAccessEvidence($evidence);

        if (empty($evidence->file_path)) {
            return back()->with('error', 'This evidence has no uploaded file to scan.');
        }

        if (! $this->virusTotal->isEnabled()) {
            return back()->with('error', 'VirusTotal integration is disabled.');
        }

        $check = $this->createPendingCheck(
            checkable: $evidence,
            fileName: $evidence->file_name,
            filePath: $evidence->file_path,
        );

        RunFileReputationCheck::dispatch($check);

        return back()->with('success', 'Reputation check queued.');
    }

    public function checkSecurityAudit(Request $request, SecurityAudit $securityAudit)
    {
        $this->ensureCanAccessSecurityAudit($securityAudit);

        if (empty($securityAudit->file_path)) {
            return back()->with('error', 'This security audit has no uploaded file to scan.');
        }

        if (! $this->virusTotal->isEnabled()) {
            return back()->with('error', 'VirusTotal integration is disabled.');
        }

        $check = $this->createPendingCheck(
            checkable: $securityAudit,
            fileName: $securityAudit->file_name,
            filePath: $securityAudit->file_path,
        );

        RunFileReputationCheck::dispatch($check);

        return back()->with('success', 'Reputation check queued.');
    }

    private function createPendingCheck(Model $checkable, string $fileName, string $filePath): FileReputationCheck
    {
        return FileReputationCheck::create([
            'checkable_type' => $checkable->getMorphClass(),
            'checkable_id' => $checkable->getKey(),
            'file_name' => $fileName,
            'file_path' => $filePath,
            'sha256' => '', // Filled in by RunFileReputationCheck once the file is hashed.
            'provider' => 'virustotal',
            'status' => 'pending',
            'checked_by' => Auth::id(),
        ]);
    }

    /**
     * Evidence has no direct corporation_id; tenant scope rides through the
     * uploader's corporation, mirroring the SecurityAudit pattern noted in
     * CLAUDE.md. super_admin sees all corporations.
     */
    private function ensureCanAccessEvidence(Evidence $evidence): void
    {
        $actor = Auth::user();

        if ($actor === null) {
            abort(403);
        }

        if ($actor->isSuperAdmin()) {
            return;
        }

        $evidence->loadMissing('user');
        $ownerCorporationId = $evidence->user?->corporation_id;

        if ($ownerCorporationId === null || $ownerCorporationId !== $actor->corporation_id) {
            abort(403);
        }
    }

    private function ensureCanAccessSecurityAudit(SecurityAudit $securityAudit): void
    {
        $actor = Auth::user();

        if ($actor === null) {
            abort(403);
        }

        if ($actor->isSuperAdmin()) {
            return;
        }

        $securityAudit->loadMissing('user');
        $ownerCorporationId = $securityAudit->user?->corporation_id;

        if ($ownerCorporationId === null || $ownerCorporationId !== $actor->corporation_id) {
            abort(403);
        }
    }
}
