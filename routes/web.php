<?php

use App\Http\Controllers\Admin\AIController as AdminAIController;
use App\Http\Controllers\Admin\ControlController as AdminControlController;
use App\Http\Controllers\Admin\CorporationController as AdminCorporationController;
use App\Http\Controllers\Admin\FileReputationCheckController as AdminFileReputationCheckController;
use App\Http\Controllers\Admin\FrameworkController as AdminFrameworkController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\AssessmentComparisonController;
use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\ComplianceChatbotController;
use App\Http\Controllers\ControlHubController;
use App\Http\Controllers\ControlStatusRequestController;
use App\Http\Controllers\CorporateDashboardController;
use App\Http\Controllers\CorporationInviteController;
use App\Http\Controllers\CorporationRegistrationController;
use App\Http\Controllers\CrosswalkController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EvidenceController;
use App\Http\Controllers\EvidenceCoverageController;
use App\Http\Controllers\ExecutiveDashboardController;
use App\Http\Controllers\ExecutiveSummaryController;
use App\Http\Controllers\GapAnalysisController;
use App\Http\Controllers\InviteAcceptController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RemediationTaskController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RiskAppetiteController;
use App\Http\Controllers\RiskController;
use App\Http\Controllers\RiskTreatmentPlanController;
use App\Http\Controllers\SecurityAuditController;
use App\Models\KriSnapshot;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::inertia('/about', 'about')->name('about');
Route::inertia('/team', 'team')->name('team');

// ── Corporation Registration — public routes ──────────────────────────────────
Route::get('/corporation/register', [CorporationRegistrationController::class, 'showRegistrationForm'])->name('corporations.register');
Route::post('/corporation/register', [CorporationRegistrationController::class, 'register'])->name('corporations.store');
Route::get('/corporation/{corporation}/pending', [CorporationRegistrationController::class, 'pending'])->name('corporations.registration-pending');
Route::post('/corporation/{corporation}/verify-code', [CorporationRegistrationController::class, 'verifyCode'])->name('corporations.verify-code');
Route::get('/corporation/{corporation}/manager-signup', [CorporationRegistrationController::class, 'showManagerSignup'])->name('corporations.manager-signup');
Route::post('/corporation/{corporation}/manager-signup', [CorporationRegistrationController::class, 'registerManager'])->name('corporations.manager-register');

// ── Public invite acceptance ─────────────────────────────────────────────────
Route::get('/invite/{token}', [InviteAcceptController::class, 'show'])->name('invite.show');
Route::post('/invite/{token}/register', [InviteAcceptController::class, 'register'])->name('invite.register');

Route::middleware(['auth', 'verified'])->group(function () {

    // ── Corporate Dashboard — for corporation admins ────────────────────────────
    Route::get('/corporate/dashboard', [CorporateDashboardController::class, 'index'])->name('corporate.dashboard');
    Route::get('/corporate/{corporation}/dashboard', [CorporateDashboardController::class, 'show'])->name('corporate.show-dashboard');
    Route::get('/corporate/company-details', [CorporateDashboardController::class, 'companyDetails'])->name('corporate.company-details');
    Route::get('/corporate/team', [CorporateDashboardController::class, 'teamMembers'])->name('corporate.team');

    // ── Notifications ─────────────────────────────────────────────────────────
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::delete('/notifications', [NotificationController::class, 'destroyAll'])->name('notifications.destroy-all');

    // ── API Notifications ─────────────────────────────────────────────────────
    Route::get('/api/notifications', [NotificationController::class, 'getNotifications'])->name('api.notifications.index');
    Route::post('/api/notifications/{notification}/mark-as-read', [NotificationController::class, 'markAsRead'])->name('api.notifications.mark-as-read');

    // ── Everyone (read-only / shared) ─────────────────────────────────────────
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/executive-dashboard', [ExecutiveDashboardController::class, 'index'])->name('executive-dashboard');
    Route::get('/executive-dashboard/pdf', [ExecutiveDashboardController::class, 'export'])->name('executive-dashboard.pdf');
    Route::get('/chatbot', [ComplianceChatbotController::class, 'index'])->name('chatbot.index');
    Route::post('/chatbot/chat', [ComplianceChatbotController::class, 'chat'])->name('chatbot.chat');
    Route::get('/kri-snapshots', function () {
        $user = auth()->user();
        $query = KriSnapshot::query();
        if (! $user->isSuperAdmin()) {
            $query->where('corporation_id', $user->corporation_id);
        }

        return $query->latest('snapshot_date')->limit(12)->get()->sortBy('snapshot_date')->values();
    })->name('kri-snapshots.index');
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/export-pdf', [ReportController::class, 'exportPdf'])->name('reports.export-pdf');
    Route::get('/reports/executive-summary', [ExecutiveSummaryController::class, 'generate'])->name('reports.executive-summary');

    // ── Security Configuration Auditor ────────────────────────────────────────
    Route::get('/security-audits', [SecurityAuditController::class, 'index'])->name('security-audits.index');
    Route::get('/security-audits/{securityAudit}', [SecurityAuditController::class, 'show'])->name('security-audits.show');
    Route::get('/security-audits/{securityAudit}/export-pdf', [SecurityAuditController::class, 'exportPdf'])->name('security-audits.export-pdf');

    // Operational security-audit actions (write/run/delete) — write roles only.
    Route::middleware('role:super_admin,admin,user')->group(function () {
        Route::post('/security-audits', [SecurityAuditController::class, 'upload'])->name('security-audits.upload');
        Route::post('/security-audits/{securityAudit}/generate-risks', [SecurityAuditController::class, 'generateRisks'])->name('security-audits.generate-risks');
        Route::post('/security-audits/{securityAudit}/save-as-evidence', [SecurityAuditController::class, 'saveAsEvidence'])->name('security-audits.save-as-evidence');
    });
    Route::middleware('role:super_admin,admin')->group(function () {
        Route::delete('/security-audits/{securityAudit}', [SecurityAuditController::class, 'destroy'])->name('security-audits.destroy');
    });

    Route::get('/gap-analysis', [GapAnalysisController::class, 'index'])->name('gap-analysis.index');
    Route::get('/gap-analysis/report', [GapAnalysisController::class, 'generateReport'])->name('gap-analysis.report');
    Route::get('/crosswalk', [CrosswalkController::class, 'index'])->name('crosswalk.index');
    Route::get('/controls/hub', [ControlHubController::class, 'index'])->name('controls.hub');
    Route::get('/controls/{control}/history', [ControlHubController::class, 'history'])->name('controls.history');

    // ── Risks — read-only for all, write below ───────────────────────────────
    Route::get('/risks', [RiskController::class, 'index'])->name('risks.index');
    Route::get('/risks/heatmap', [RiskController::class, 'heatmap'])->name('risks.heatmap');

    // Operational write — super_admin / admin / user
    Route::middleware('role:super_admin,admin,user')->group(function () {
        Route::post('/controls/{control}/request-status', [ControlStatusRequestController::class, 'store'])->name('controls.request-status');

        Route::get('/risks/create', [RiskController::class, 'create'])->name('risks.create');
        Route::post('/risks/validate-scores', [RiskController::class, 'validateScores'])->name('risks.validate-scores');
        Route::post('/risks', [RiskController::class, 'store'])->name('risks.store');
        Route::get('/risks/{risk}/edit', [RiskController::class, 'edit'])->name('risks.edit');
        Route::put('/risks/{risk}', [RiskController::class, 'update'])->name('risks.update');
        Route::delete('/risks/{risk}', [RiskController::class, 'destroy'])->name('risks.destroy');

        // Treatment plans
        Route::post('/risks/{risk}/treatment-plans', [RiskTreatmentPlanController::class, 'store'])->name('risks.treatment-plans.store');
        Route::put('/risks/{risk}/treatment-plans/{plan}', [RiskTreatmentPlanController::class, 'update'])->name('risks.treatment-plans.update');
        Route::delete('/risks/{risk}/treatment-plans/{plan}', [RiskTreatmentPlanController::class, 'destroy'])->name('risks.treatment-plans.destroy');

        // Remediation tasks
        Route::get('/remediation-tasks', [RemediationTaskController::class, 'index'])->name('remediation-tasks.index');
        Route::post('/remediation-tasks', [RemediationTaskController::class, 'store'])->name('remediation-tasks.store');
        Route::put('/remediation-tasks/{task}', [RemediationTaskController::class, 'update'])->name('remediation-tasks.update');
        Route::delete('/remediation-tasks/{task}', [RemediationTaskController::class, 'destroy'])->name('remediation-tasks.destroy');
        Route::post('/remediation-tasks/{task}/complete', [RemediationTaskController::class, 'complete'])->name('remediation-tasks.complete');

        // AI assistance — write/operational endpoints
        Route::post('/ai/suggest-threats', [AdminAIController::class, 'suggestThreats'])->name('ai.suggest-threats');
        Route::post('/ai/remediate-gap', [AdminAIController::class, 'remediateGap'])->name('ai.remediate-gap');
        Route::post('/ai/save-remediation', [AdminAIController::class, 'saveRemediation'])->name('ai.save-remediation');
        Route::post('/ai/assessment-summary/{assessment}', [AdminAIController::class, 'generateAssessmentSummary'])->name('ai.assessment-summary');
    });

    // Org-admin only — link/unlink risk⇄control is a corp-admin power.
    Route::middleware('role:super_admin,admin')->group(function () {
        Route::post('/risks/{risk}/link-control', [RiskController::class, 'linkControl'])->name('risks.link-control');
        Route::post('/risks/{risk}/unlink-control', [RiskController::class, 'unlinkControl'])->name('risks.unlink-control');
    });

    Route::get('/risks/{risk}', [RiskController::class, 'show'])->name('risks.show');

    // ── Assessments — read-only for all, write for super_admin/admin/user ────
    Route::get('/assessments', [AssessmentController::class, 'index'])->name('assessments.index');

    Route::middleware('role:super_admin,admin,user')->group(function () {
        Route::get('/assessments/create', [AssessmentController::class, 'create'])->name('assessments.create');
        Route::get('/assessments/{assessment}/export-pdf', [AssessmentController::class, 'exportPdf'])->name('assessments.export-pdf');
        Route::post('/assessments', [AssessmentController::class, 'store'])->name('assessments.store');
        Route::delete('/assessments/{assessment}', [AssessmentController::class, 'destroy'])->name('assessments.destroy');
        Route::get('/assessments/{assessment}/questionnaire', [AssessmentController::class, 'questionnaire'])->name('assessments.questionnaire');
        Route::post('/assessments/{assessment}/save-answers', [AssessmentController::class, 'saveAnswers'])->name('assessments.save-answers');
        Route::post('/assessments/{assessment}/submit', [AssessmentController::class, 'submit'])->name('assessments.submit');
        Route::post('/assessments/{assessment}/auto-fill', [AssessmentController::class, 'autoFill'])->name('assessments.auto-fill');
        Route::post('/assessments/{assessment}/items/{item}/evidence', [AssessmentController::class, 'uploadEvidence'])->name('assessments.upload-evidence');
        Route::post('/assessments/explain-control', [AssessmentController::class, 'explainControl'])->name('assessments.explain-control')->middleware('throttle:30,1');
    });

    // ── Assessment Comparison ─────────────────────────────────────────────────
    Route::get('/assessments/compare', [AssessmentComparisonController::class, 'index'])->name('assessments.compare');
    Route::get('/assessments/compare/result', [AssessmentComparisonController::class, 'compare'])->name('assessments.compare.result');
    Route::get('/assessments/compare/export', [AssessmentComparisonController::class, 'exportPdf'])->name('assessments.compare.export');

    Route::get('/assessments/{assessment}', [AssessmentController::class, 'show'])->name('assessments.show');

    // ── Evidence ──────────────────────────────────────────────────────────────
    Route::get('/evidence', [EvidenceController::class, 'index'])->name('evidence.index');
    Route::get('/evidence/{evidence}/download', [EvidenceController::class, 'download'])->name('evidence.download');

    // Review/approval queue — super_admin / admin / auditor.
    Route::middleware('role:super_admin,admin,auditor')->group(function () {
        Route::get('/controls/approvals', [ControlStatusRequestController::class, 'index'])->name('controls.approvals');

        Route::post('/controls/status-requests/{statusRequest}/approve', [ControlStatusRequestController::class, 'approve'])->name('controls.status-requests.approve');
        Route::post('/controls/status-requests/{statusRequest}/reject', [ControlStatusRequestController::class, 'reject'])->name('controls.status-requests.reject');
        Route::post('/controls/status-requests/{statusRequest}/review-evidence', [ControlStatusRequestController::class, 'reviewEvidence'])->name('controls.status-requests.review-evidence');

        Route::post('/evidence/{evidence}/approve', [EvidenceController::class, 'approve'])->name('evidence.approve');
        Route::post('/evidence/{evidence}/reject', [EvidenceController::class, 'reject'])->name('evidence.reject');
        Route::post('/evidence/{evidence}/ai-review', [EvidenceController::class, 'aiReview'])->name('evidence.ai-review');
        Route::post('/ai/review-evidence', [AdminAIController::class, 'reviewEvidence'])->name('ai.review-evidence');

        Route::get('/evidence-coverage', [EvidenceCoverageController::class, 'index'])->name('evidence-coverage.index');

        // Audit logs are part of the review surface.
        Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    });

    // Org-admin only — destructive evidence ops.
    Route::middleware('role:super_admin,admin')->group(function () {
        Route::delete('/evidence/{evidence}', [EvidenceController::class, 'destroy'])->name('evidence.destroy');
    });

    // ── Platform-only admin routes ───────────────────────────────────────────
    // Approving corporations and managing global frameworks/controls is
    // strictly a super_admin power.
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::middleware('role:super_admin')->group(function () {
            Route::resource('corporations', AdminCorporationController::class)->only(['index', 'show', 'destroy']);
            Route::post('corporations/{corporation}/approve', [AdminCorporationController::class, 'approve'])->name('corporations.approve');
            Route::post('corporations/{corporation}/reject', [AdminCorporationController::class, 'reject'])->name('corporations.reject');
            Route::post('corporations/{corporation}/regenerate-code', [AdminCorporationController::class, 'regenerateCode'])->name('corporations.regenerate-code');

            Route::post('frameworks/{framework}/toggle', [AdminFrameworkController::class, 'toggle'])->name('frameworks.toggle');
            Route::resource('frameworks', AdminFrameworkController::class)->only(['index', 'edit', 'update']);
            Route::resource('controls', AdminControlController::class)->only(['index', 'edit', 'update', 'destroy']);
        });

        // User management — super_admin or corp admin (controller scopes by tenant).
        Route::middleware('role:super_admin,admin')->group(function () {
            Route::resource('users', AdminUserController::class);

            // Corporation invites — admins generate links / send email invites
            // to onboard employees into their own corporation. Super_admin can
            // act on any corporation via ?corporation_id=.
            Route::get('invites', [CorporationInviteController::class, 'index'])->name('invites.index');
            Route::post('invites/shareable', [CorporationInviteController::class, 'storeShareable'])->name('invites.shareable');
            Route::post('invites/email', [CorporationInviteController::class, 'storeEmail'])->name('invites.email');
            Route::delete('invites/{invite}', [CorporationInviteController::class, 'destroy'])->name('invites.destroy');
        });

        // File reputation checks — review surface (super_admin / admin / auditor).
        // Controller enforces per-record tenant scope on top of the role gate.
        Route::middleware('role:super_admin,admin,auditor')->group(function () {
            Route::post('evidence/{evidence}/reputation-check', [AdminFileReputationCheckController::class, 'check'])
                ->name('evidence.reputation-check');
            Route::post('security-audits/{securityAudit}/reputation-check', [AdminFileReputationCheckController::class, 'checkSecurityAudit'])
                ->name('security-audits.reputation-check');
        });
    });

    // ── Risk Appetite — super_admin / admin (controller scopes by corp) ──────
    Route::middleware('role:super_admin,admin')->group(function () {
        Route::get('/risk-appetite', [RiskAppetiteController::class, 'index'])->name('risk-appetite.index');
        Route::post('/risk-appetite', [RiskAppetiteController::class, 'store'])->name('risk-appetite.store');
        Route::put('/risk-appetite/{appetite}', [RiskAppetiteController::class, 'update'])->name('risk-appetite.update');
        Route::delete('/risk-appetite/{appetite}', [RiskAppetiteController::class, 'destroy'])->name('risk-appetite.destroy');
        Route::post('/risk-appetite/{appetite}/activate', [RiskAppetiteController::class, 'activate'])->name('risk-appetite.activate');
    });
});

require __DIR__.'/settings.php';
