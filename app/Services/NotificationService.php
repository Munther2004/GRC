<?php

namespace App\Services;

use App\Models\Assessment;
use App\Models\Evidence;
use App\Models\Notification;
use App\Models\Risk;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class NotificationService
{
    public function generateNotifications(): void
    {
        $this->generateOverdueAssessments();
        $this->generatePendingEvidence();
        $this->generateCriticalRisks();
        $this->generateOverdueRiskTreatments();
        $this->generateExpiringEvidence();
        $this->generateExpiredEvidence();
    }

    /**
     * Returns the notification types visible to a given role.
     * null means "all types" (admin).
     */
    public static function typesForRole(string $role): ?array
    {
        return match ($role) {
            'auditor' => ['pending_evidence', 'overdue_assessment', 'expiring_evidence', 'expired_evidence', 'status_request_pending'],
            'user'    => ['overdue_assessment', 'critical_risk', 'overdue_risk', 'status_request_approved', 'status_request_rejected'],
            default   => null, // admin sees everything
        };
    }

    public function getForUser(User $user): Collection
    {
        $types = self::typesForRole($user->role);

        $query = Notification::where('is_read', false)
            ->where(function ($q) use ($user) {
                $q->whereNull('user_id')
                  ->orWhere('user_id', $user->id);
            });

        if ($types !== null) {
            $query->whereIn('type', $types);
        }

        return $query->orderBy('created_at', 'desc')->take(10)->get();
    }

    private function generateOverdueAssessments(): void
    {
        $overdueAssessments = Assessment::where('status', '!=', 'completed')
            ->whereNotNull('due_date')
            ->where('due_date', '<', Carbon::today())
            ->get();

        foreach ($overdueAssessments as $assessment) {
            $url = "/assessments/{$assessment->id}";
            $this->createIfNotExists(
                'overdue_assessment',
                $url,
                'Overdue Assessment',
                "Assessment '{$assessment->title}' was due on {$assessment->due_date->format('Y-m-d')}"
            );
        }
    }

    private function generatePendingEvidence(): void
    {
        $count = Evidence::where('status', 'pending')->count();

        if ($count > 0) {
            $url = '/evidence';
            $this->createIfNotExists(
                'pending_evidence',
                $url,
                'Evidence Pending Review',
                "{$count} evidence file(s) are waiting for approval",
                true
            );
        }
    }

    private function generateCriticalRisks(): void
    {
        $criticalRisks = Risk::whereRaw('likelihood * impact >= 15')
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->get();

        foreach ($criticalRisks as $risk) {
            $url = "/risks/{$risk->id}";
            $level = $risk->risk_level;
            $this->createIfNotExists(
                'critical_risk',
                $url,
                'Critical Risk Detected',
                "Risk '{$risk->title}' has been rated as {$level}"
            );
        }
    }

    private function generateOverdueRiskTreatments(): void
    {
        $overdueRisks = Risk::where('status', 'open')
            ->where('created_at', '<', Carbon::now()->subDays(30))
            ->whereRaw('likelihood * impact >= 10')
            ->get();

        foreach ($overdueRisks as $risk) {
            $url = "/risks/{$risk->id}";
            $this->createIfNotExists(
                'overdue_risk',
                $url,
                'Risk Treatment Overdue',
                "Risk '{$risk->title}' has been open for over 30 days without treatment"
            );
        }
    }

    private function generateExpiringEvidence(): void
    {
        $expiring = Evidence::whereNotNull('expiry_date')
            ->where('expiry_date', '>=', Carbon::today())
            ->where('expiry_date', '<=', Carbon::today()->addDays(30))
            ->get();

        foreach ($expiring as $evidence) {
            $url = '/evidence';
            $this->createIfNotExists(
                'expiring_evidence',
                "/evidence-expiring-{$evidence->id}",
                'Evidence Expiring Soon',
                "Evidence '{$evidence->title}' expires on {$evidence->expiry_date->format('Y-m-d')}"
            );
        }
    }

    private function generateExpiredEvidence(): void
    {
        $expired = Evidence::whereNotNull('expiry_date')
            ->where('expiry_date', '<', Carbon::today())
            ->get();

        foreach ($expired as $evidence) {
            $this->createIfNotExists(
                'expired_evidence',
                "/evidence-expired-{$evidence->id}",
                'Evidence Expired',
                "Evidence '{$evidence->title}' expired on {$evidence->expiry_date->format('Y-m-d')}"
            );
        }
    }

    private function createIfNotExists(
        string $type,
        string $url,
        string $title,
        string $message,
        bool $updateExisting = false
    ): void {
        $existing = Notification::where('type', $type)->where('url', $url)->where('is_read', false)->first();

        if ($existing && $updateExisting) {
            $existing->update(['message' => $message, 'is_read' => false]);
            return;
        }

        if (!$existing) {
            Notification::firstOrCreate(
                ['type' => $type, 'url' => $url, 'is_read' => false],
                ['user_id' => null, 'title' => $title, 'message' => $message]
            );
        }
    }
}
