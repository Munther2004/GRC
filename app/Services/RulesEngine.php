<?php

namespace App\Services;

use App\Models\Assessment;
use App\Models\AssessmentItem;
use App\Models\AuditLog;
use App\Models\Notification;

class RulesEngine
{
    public function applyRule1(Assessment $assessment): void
    {
        // Get non-compliant items from this assessment
        $nonCompliantItems = AssessmentItem::where('assessment_id', $assessment->id)
            ->whereIn('compliance_status', ['non_compliant', 'partially_compliant'])
            ->with(['control.risks'])
            ->get();

        foreach ($nonCompliantItems as $item) {
            if (!$item->control) continue;

            foreach ($item->control->risks as $risk) {
                if ($item->compliance_status === 'non_compliant') {
                    $oldLikelihood = $risk->likelihood;
                    $risk->likelihood = min(5, $risk->likelihood + 1);

                    if ($risk->likelihood !== $oldLikelihood) {
                        $risk->save();

                        $riskUrl = "/risks/{$risk->id}";
                        Notification::firstOrCreate(
                            ['type' => 'critical_risk', 'url' => $riskUrl, 'is_read' => false],
                            ['title' => 'Risk Score Auto-Adjusted', 'message' => "Risk '{$risk->title}' likelihood raised due to non-compliant control {$item->control->control_id}"]
                        );

                        AuditLog::record(
                            'updated',
                            'Risk',
                            $risk->id,
                            "Rule 1: Risk '{$risk->title}' likelihood increased from {$oldLikelihood} to {$risk->likelihood} due to non-compliant control {$item->control->control_id} in assessment '{$assessment->title}'"
                        );
                    }
                }
                // partially_compliant: flag only, no score change
            }
        }
    }

    public function applyRule2(Assessment $assessment): void
    {
        // Get compliant items from this assessment
        $compliantItems = AssessmentItem::where('assessment_id', $assessment->id)
            ->where('compliance_status', 'compliant')
            ->with(['control.risks'])
            ->get();

        foreach ($compliantItems as $item) {
            if (!$item->control) continue;

            // Was this control previously non-compliant in any other completed assessment?
            $wasPreviouslyNonCompliant = AssessmentItem::where('control_id', $item->control_id)
                ->whereNot('assessment_id', $assessment->id)
                ->whereIn('compliance_status', ['non_compliant', 'partially_compliant'])
                ->whereHas('assessment', fn($q) => $q->where('status', 'completed'))
                ->exists();

            if (!$wasPreviouslyNonCompliant) continue;

            foreach ($item->control->risks as $risk) {
                $oldLikelihood = $risk->likelihood;
                $risk->likelihood = max(1, $risk->likelihood - 1);

                if ($risk->likelihood !== $oldLikelihood) {
                    $risk->save();

                    $riskUrl = "/risks/{$risk->id}";
                    Notification::firstOrCreate(
                        ['type' => 'critical_risk', 'url' => $riskUrl, 'is_read' => false],
                        ['title' => 'Risk Score Improved', 'message' => "Risk '{$risk->title}' likelihood reduced — control {$item->control->control_id} is now compliant"]
                    );

                    AuditLog::record(
                        'updated',
                        'Risk',
                        $risk->id,
                        "Rule 2: Risk '{$risk->title}' likelihood decreased from {$oldLikelihood} to {$risk->likelihood} — control {$item->control->control_id} now compliant in assessment '{$assessment->title}'"
                    );
                }
            }
        }
    }
}
