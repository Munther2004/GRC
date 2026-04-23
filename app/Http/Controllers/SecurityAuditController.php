<?php

namespace App\Http\Controllers;

use App\Jobs\AnalyzeSecurityConfigJob;
use App\Models\AuditLog;
use App\Models\Evidence;
use App\Models\Notification;
use App\Models\Risk;
use App\Models\SecurityAudit;
use App\Models\SecurityAuditFinding;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SecurityAuditController extends Controller
{
    private const SEVERITY_TO_LIKELIHOOD_IMPACT = [
        'critical' => ['likelihood' => 4, 'impact' => 5],
        'high' => ['likelihood' => 4, 'impact' => 4],
        'medium' => ['likelihood' => 3, 'impact' => 3],
        'low' => ['likelihood' => 2, 'impact' => 2],
        'info' => ['likelihood' => 1, 'impact' => 1],
    ];

    public function index(Request $request)
    {
        $audits = SecurityAudit::with('user:id,name')
            ->latest()
            ->paginate(20)
            ->through(fn ($a) => [
                'id' => $a->id,
                'file_name' => $a->file_name,
                'file_type' => $a->file_type,
                'file_size' => $a->file_size,
                'status' => $a->status,
                'total_findings' => $a->total_findings,
                'critical_count' => $a->critical_count,
                'high_count' => $a->high_count,
                'medium_count' => $a->medium_count,
                'low_count' => $a->low_count,
                'info_count' => $a->info_count,
                'compliance_score' => $a->compliance_score,
                'analyzed_at' => $a->analyzed_at?->toIso8601String(),
                'created_at' => $a->created_at?->toIso8601String(),
                'user' => $a->user ? ['id' => $a->user->id, 'name' => $a->user->name] : null,
            ]);

        $stats = [
            'total' => SecurityAudit::count(),
            'completed' => SecurityAudit::where('status', 'completed')->count(),
            'in_progress' => SecurityAudit::whereIn('status', ['pending', 'analyzing'])->count(),
            'failed' => SecurityAudit::where('status', 'failed')->count(),
            'critical_findings' => SecurityAudit::sum('critical_count'),
            'high_findings' => SecurityAudit::sum('high_count'),
        ];

        return Inertia::render('SecurityAudits/Index', [
            'audits' => $audits,
            'stats' => $stats,
        ]);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'max:10240',
                'mimes:csv,txt,json,yaml,yml,ini,conf,config,cfg,env,toml,xml,docx,xlsx',
            ],
        ]);

        $file = $request->file('file');
        $path = $file->store('security-audits', 'public');

        $audit = SecurityAudit::create([
            'user_id' => Auth::id(),
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
            'file_path' => $path,
            'status' => 'pending',
        ]);

        AnalyzeSecurityConfigJob::dispatch($audit->id);

        AuditLog::record(
            'security_audit_uploaded',
            SecurityAudit::class,
            $audit->id,
            "Uploaded {$audit->file_name} for security analysis",
        );

        return redirect()->route('security-audits.show', $audit->id)
            ->with('success', 'File uploaded — analysis in progress.');
    }

    public function show(SecurityAudit $securityAudit)
    {
        $securityAudit->load(['user:id,name']);

        $findings = $securityAudit->findings()
            ->with(['control:id,control_id,title', 'risk:id,title'])
            ->orderByRaw("FIELD(severity, 'critical','high','medium','low','info')")
            ->get();

        return Inertia::render('SecurityAudits/Show', [
            'audit' => [
                'id' => $securityAudit->id,
                'file_name' => $securityAudit->file_name,
                'file_type' => $securityAudit->file_type,
                'file_size' => $securityAudit->file_size,
                'status' => $securityAudit->status,
                'summary' => $securityAudit->summary,
                'total_findings' => $securityAudit->total_findings,
                'critical_count' => $securityAudit->critical_count,
                'high_count' => $securityAudit->high_count,
                'medium_count' => $securityAudit->medium_count,
                'low_count' => $securityAudit->low_count,
                'info_count' => $securityAudit->info_count,
                'compliance_score' => $securityAudit->compliance_score,
                'frameworks_checked' => $securityAudit->frameworks_checked ?? [],
                'controls_referenced' => $securityAudit->controls_referenced ?? [],
                'risks_generated' => $securityAudit->risks_generated,
                'evidence_id' => $securityAudit->evidence_id,
                'error_message' => $securityAudit->error_message,
                'analyzed_at' => $securityAudit->analyzed_at?->toIso8601String(),
                'created_at' => $securityAudit->created_at?->toIso8601String(),
                'user' => $securityAudit->user ? ['id' => $securityAudit->user->id, 'name' => $securityAudit->user->name] : null,
            ],
            'findings' => $findings->map(fn ($f) => [
                'id' => $f->id,
                'finding_number' => $f->finding_number,
                'severity' => $f->severity,
                'title' => $f->title,
                'description' => $f->description,
                'affected_item' => $f->affected_item,
                'recommendation' => $f->recommendation,
                'control_reference' => $f->control_reference,
                'compliance_impact' => $f->compliance_impact,
                'control' => $f->control ? [
                    'id' => $f->control->id,
                    'control_id' => $f->control->control_id,
                    'title' => $f->control->title,
                ] : null,
                'risk' => $f->risk ? ['id' => $f->risk->id, 'title' => $f->risk->title] : null,
            ])->values(),
        ]);
    }

    public function generateRisks(SecurityAudit $securityAudit)
    {
        if (! $securityAudit->isCompleted()) {
            return back()->with('error', 'Audit must be completed before generating risks.');
        }

        $generated = 0;
        $eligible = $securityAudit->findings()
            ->whereIn('severity', ['critical', 'high', 'medium'])
            ->whereNull('risk_id')
            ->get();

        foreach ($eligible as $finding) {
            $scores = self::SEVERITY_TO_LIKELIHOOD_IMPACT[$finding->severity];

            $description = $finding->description;
            if ($finding->affected_item) {
                $description .= "\n\nAffected: ".$finding->affected_item;
            }
            if ($finding->recommendation) {
                $description .= "\n\nRecommendation: ".$finding->recommendation;
            }
            $description .= "\n\nIdentified by automated security audit of {$securityAudit->file_name}.";

            $risk = Risk::create([
                'user_id' => Auth::id(),
                'title' => "[Security Audit] {$finding->title}",
                'description' => $description,
                'category' => 'Technical',
                'owner' => Auth::user()->name ?? 'Security Team',
                'likelihood' => $scores['likelihood'],
                'impact' => $scores['impact'],
                'status' => 'open',
                'treatment' => 'mitigate',
                'auto_generated' => true,
                'source_control_id' => $finding->control_id,
            ]);

            $finding->update(['risk_id' => $risk->id]);
            $generated++;
        }

        $securityAudit->increment('risks_generated', $generated);

        AuditLog::record(
            'security_audit_risks_generated',
            SecurityAudit::class,
            $securityAudit->id,
            "Generated {$generated} risks from security audit findings",
        );

        Notification::create([
            'user_id' => $securityAudit->user_id,
            'type' => 'security_audit_risks_generated',
            'title' => 'Risks Generated from Security Audit',
            'message' => "{$generated} risks created from {$securityAudit->file_name} findings",
            'url' => "/security-audits/{$securityAudit->id}",
            'is_read' => false,
        ]);

        return back()->with('success', "Generated {$generated} risk(s) from findings.");
    }

    public function saveAsEvidence(Request $request, SecurityAudit $securityAudit)
    {
        if (! $securityAudit->isCompleted()) {
            return back()->with('error', 'Audit must be completed before saving as evidence.');
        }

        $request->validate([
            'control_id' => ['nullable', 'integer', 'exists:controls,id'],
        ]);

        // Generate the PDF report and store it as the evidence file
        $pdf = $this->buildPdf($securityAudit);
        $fileName = 'security-audit-'.$securityAudit->id.'-'.now()->format('Ymd-His').'.pdf';
        $storagePath = "evidence/{$fileName}";
        Storage::disk('public')->put($storagePath, $pdf->output());

        $evidence = Evidence::create([
            'user_id' => Auth::id(),
            'control_id' => $request->input('control_id'),
            'title' => "Security Audit Report: {$securityAudit->file_name}",
            'description' => $securityAudit->summary,
            'file_path' => $storagePath,
            'file_name' => $fileName,
            'file_type' => 'application/pdf',
            'status' => 'pending',
        ]);

        $securityAudit->update(['evidence_id' => $evidence->id]);

        AuditLog::record(
            'security_audit_saved_as_evidence',
            SecurityAudit::class,
            $securityAudit->id,
            "Saved security audit report as evidence (Evidence #{$evidence->id})",
        );

        return back()->with('success', 'Audit report saved as evidence (pending review).');
    }

    public function exportPdf(SecurityAudit $securityAudit)
    {
        if (! $securityAudit->isCompleted()) {
            return back()->with('error', 'Audit must be completed before export.');
        }

        $pdf = $this->buildPdf($securityAudit);

        AuditLog::record(
            'security_audit_exported',
            SecurityAudit::class,
            $securityAudit->id,
            "Exported security audit report PDF for {$securityAudit->file_name}",
        );

        return $pdf->download("security-audit-{$securityAudit->id}.pdf");
    }

    public function destroy(SecurityAudit $securityAudit)
    {
        $name = $securityAudit->file_name;
        $id = $securityAudit->id;

        if ($securityAudit->file_path && Storage::disk('public')->exists($securityAudit->file_path)) {
            Storage::disk('public')->delete($securityAudit->file_path);
        }

        $securityAudit->delete();

        AuditLog::record(
            'security_audit_deleted',
            SecurityAudit::class,
            $id,
            "Deleted security audit for {$name}",
        );

        return redirect()->route('security-audits.index')
            ->with('success', 'Security audit deleted.');
    }

    private function buildPdf(SecurityAudit $securityAudit)
    {
        $securityAudit->load(['user:id,name', 'findings.control:id,control_id,title']);

        return Pdf::loadView('reports.security-audit-report', [
            'audit' => $securityAudit,
            'findings' => $securityAudit->findings()->orderByRaw("FIELD(severity, 'critical','high','medium','low','info')")->get(),
            'generatedAt' => now(),
        ])->setPaper('a4');
    }
}
