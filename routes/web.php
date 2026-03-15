<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RiskController;
use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\GapAnalysisController;
use App\Http\Controllers\EvidenceController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Admin\AIController as AdminAIController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\FrameworkController as AdminFrameworkController;
use App\Http\Controllers\Admin\ControlController as AdminControlController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::inertia('/about', 'about')->name('about');
Route::inertia('/team',  'team')->name('team');

Route::middleware(['auth', 'verified'])->group(function () {

    // ── Notifications ─────────────────────────────────────────────────────────
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

    // ── Everyone ──────────────────────────────────────────────────────────────
    Route::get('/dashboard',    [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/reports',      [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/export-pdf', [ReportController::class, 'exportPdf'])->name('reports.export-pdf');
    Route::get('/gap-analysis', [GapAnalysisController::class, 'index'])->name('gap-analysis.index');

    // ── Risks — read-only for all, write for admin & user ────────────────────
    Route::get('/risks', [RiskController::class, 'index'])->name('risks.index');

    Route::middleware('role:admin,user')->group(function () {
        Route::get('/risks/create',      [RiskController::class, 'create'])->name('risks.create');
        Route::post('/risks',            [RiskController::class, 'store'])->name('risks.store');
        Route::get('/risks/{risk}/edit', [RiskController::class, 'edit'])->name('risks.edit');
        Route::put('/risks/{risk}',      [RiskController::class, 'update'])->name('risks.update');
        Route::delete('/risks/{risk}',   [RiskController::class, 'destroy'])->name('risks.destroy');
    });

    Route::middleware('role:admin')->group(function () {
        Route::post('/risks/{risk}/link-control',   [RiskController::class, 'linkControl'])->name('risks.link-control');
        Route::post('/risks/{risk}/unlink-control', [RiskController::class, 'unlinkControl'])->name('risks.unlink-control');
    });

    // ── AI endpoints ─────────────────────────────────────────────────────────
    Route::middleware('role:admin,user')->group(function () {
        Route::post('/ai/suggest-threats', [AdminAIController::class, 'suggestThreats'])->name('ai.suggest-threats');
    });

    Route::get('/risks/{risk}', [RiskController::class, 'show'])->name('risks.show');

    // ── Assessments — read-only for all, write for admin & user ──────────────
    Route::get('/assessments', [AssessmentController::class, 'index'])->name('assessments.index');

    Route::middleware('role:admin,user')->group(function () {
        Route::get('/assessments/create',                         [AssessmentController::class, 'create'])->name('assessments.create');
        Route::get('/assessments/{assessment}/export-pdf',        [AssessmentController::class, 'exportPdf'])->name('assessments.export-pdf');
        Route::post('/assessments',         [AssessmentController::class, 'store'])->name('assessments.store');
        Route::delete('/assessments/{assessment}', [AssessmentController::class, 'destroy'])->name('assessments.destroy');
        Route::get('/assessments/{assessment}/questionnaire',         [AssessmentController::class, 'questionnaire'])->name('assessments.questionnaire');
        Route::post('/assessments/{assessment}/save-answers',         [AssessmentController::class, 'saveAnswers'])->name('assessments.save-answers');
        Route::post('/assessments/{assessment}/submit',               [AssessmentController::class, 'submit'])->name('assessments.submit');
        Route::post('/assessments/{assessment}/auto-fill',            [AssessmentController::class, 'autoFill'])->name('assessments.auto-fill');
        Route::post('/assessments/{assessment}/items/{item}/evidence',[AssessmentController::class, 'uploadEvidence'])->name('assessments.upload-evidence');
    });

    Route::get('/assessments/{assessment}', [AssessmentController::class, 'show'])->name('assessments.show');

    // ── Evidence ──────────────────────────────────────────────────────────────
    Route::get('/evidence',                     [EvidenceController::class, 'index'])->name('evidence.index');
    Route::get('/evidence/{evidence}/download', [EvidenceController::class, 'download'])->name('evidence.download');

    Route::middleware('role:admin,auditor')->group(function () {
        Route::post('/evidence/{evidence}/approve', [EvidenceController::class, 'approve'])->name('evidence.approve');
        Route::post('/evidence/{evidence}/reject',  [EvidenceController::class, 'reject'])->name('evidence.reject');
    });

    Route::middleware('role:admin')->group(function () {
        Route::delete('/evidence/{evidence}', [EvidenceController::class, 'destroy'])->name('evidence.destroy');
    });

    // ── Audit Logs — admin & auditor only ────────────────────────────────────
    Route::middleware('role:admin,auditor')->group(function () {
        Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    });

    // ── Admin Panel — admin only ──────────────────────────────────────────────
    Route::prefix('admin')->name('admin.')->middleware('role:admin')->group(function () {
        Route::resource('users', AdminUserController::class);
        Route::post('frameworks/{framework}/toggle', [AdminFrameworkController::class, 'toggle'])->name('frameworks.toggle');
        Route::resource('frameworks', AdminFrameworkController::class)->only(['index', 'edit', 'update']);
        Route::resource('controls',   AdminControlController::class)->only(['index', 'edit', 'update', 'destroy']);
    });
});

require __DIR__.'/settings.php';
