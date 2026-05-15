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
     * null means "all types" (super_admin and admin).
     *
     * Unknown / null roles are treated as 'user' so they never accidentally
     * receive privileged notifications meant for admins.
     */
    public static function typesForRole(?string $role): ?array
    {
        return match ($role) {
            User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN => null,
            User::ROLE_AUDITOR => ['pending_evidence', 'overdue_assessment', 'expiring_evidence', 'expired_evidence', 'status_request_pending'],
            // user (and any unknown/null role) — minimal operational set only
            default => ['overdue_assessment', 'critical_risk', 'overdue_risk', 'status_request_approved', 'status_request_rejected'],
        };
    }

    public function getForUser(User $user): Collection
    {
        $types = self::typesForRole($user->role);

        $query = Notification::forUser($user)->where('is_read', false);

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
            if ($assessment->corporation_id === null) {
                continue; // skip super_admin sandbox data
            }
            $url = "/assessments/{$assessment->id}";
            $this->createIfNotExists(
                'overdue_assessment',
                $url,
                'Overdue Assessment',
                "Assessment '{$assessment->title}' was due on {$assessment->due_date->format('Y-m-d')}",
                false,
                $assessment->corporation_id,
            );
        }
    }

    private function generatePendingEvidence(): void
    {
        // Roll up pending evidence count per tenant via the parent
        // assessment_item -> assessment.corporation_id chain. Evidence with no
        // assessment_item (direct-attached) falls back to the uploader's tenant.
        $rows = Evidence::where('evidence.status', 'pending')
            ->leftJoin('assessment_items as ai', 'ai.id', '=', 'evidence.assessment_item_id')
            ->leftJoin('assessments as a', 'a.id', '=', 'ai.assessment_id')
            ->leftJoin('users as u', 'u.id', '=', 'evidence.user_id')
            ->selectRaw('COALESCE(a.corporation_id, u.corporation_id) as corp_id, COUNT(*) as cnt')
            ->groupBy('corp_id')
            ->get();

        foreach ($rows as $row) {
            if ($row->corp_id === null) {
                continue;
            }
            $this->createIfNotExists(
                'pending_evidence',
                '/evidence',
                'Evidence Pending Review',
                "{$row->cnt} evidence file(s) are waiting for approval",
                true,
                (int) $row->corp_id,
            );
        }
    }

    private function generateCriticalRisks(): void
    {
        $criticalRisks = Risk::whereRaw('likelihood * impact >= 15')
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->get();

        foreach ($criticalRisks as $risk) {
            if ($risk->corporation_id === null) {
                continue;
            }
            $url = "/risks/{$risk->id}";
            $level = $risk->risk_level;
            $this->createIfNotExists(
                'critical_risk',
                $url,
                'Critical Risk Detected',
                "Risk '{$risk->title}' has been rated as {$level}",
                false,
                $risk->corporation_id,
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
            if ($risk->corporation_id === null) {
                continue;
            }
            $url = "/risks/{$risk->id}";
            $this->createIfNotExists(
                'overdue_risk',
                $url,
                'Risk Treatment Overdue',
                "Risk '{$risk->title}' has been open for over 30 days without treatment",
                false,
                $risk->corporation_id,
            );
        }
    }

    private function generateExpiringEvidence(): void
    {
        $expiring = Evidence::whereNotNull('expiry_date')
            ->where('expiry_date', '>=', Carbon::today())
            ->where('expiry_date', '<=', Carbon::today()->addDays(30))
            ->with(['assessmentItem.assessment', 'user'])
            ->get();

        foreach ($expiring as $evidence) {
            $corp = $this->evidenceTenant($evidence);
            if ($corp === null) {
                continue;
            }
            $this->createIfNotExists(
                'expiring_evidence',
                "/evidence-expiring-{$evidence->id}",
                'Evidence Expiring Soon',
                "Evidence '{$evidence->title}' expires on {$evidence->expiry_date->format('Y-m-d')}",
                false,
                $corp,
            );
        }
    }

    private function generateExpiredEvidence(): void
    {
        $expired = Evidence::whereNotNull('expiry_date')
            ->where('expiry_date', '<', Carbon::today())
            ->with(['assessmentItem.assessment', 'user'])
            ->get();

        foreach ($expired as $evidence) {
            $corp = $this->evidenceTenant($evidence);
            if ($corp === null) {
                continue;
            }
            $this->createIfNotExists(
                'expired_evidence',
                "/evidence-expired-{$evidence->id}",
                'Evidence Expired',
                "Evidence '{$evidence->title}' expired on {$evidence->expiry_date->format('Y-m-d')}",
                false,
                $corp,
            );
        }
    }

    private function evidenceTenant(Evidence $evidence): ?int
    {
        return $evidence->assessmentItem?->assessment?->corporation_id
            ?? $evidence->user?->corporation_id;
    }

    private function createIfNotExists(
        string $type,
        string $url,
        string $title,
        string $message,
        bool $updateExisting = false,
        ?int $corporationId = null,
    ): void {
        $existing = Notification::where('type', $type)
            ->where('url', $url)
            ->where('is_read', false)
            ->where('corporation_id', $corporationId)
            ->first();

        if ($existing && $updateExisting) {
            $existing->update(['message' => $message, 'is_read' => false]);

            return;
        }

        if (! $existing) {
            Notification::firstOrCreate(
                ['type' => $type, 'url' => $url, 'is_read' => false, 'corporation_id' => $corporationId],
                ['user_id' => null, 'title' => $title, 'message' => $message]
            );
        }
    }
}
