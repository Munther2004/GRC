<?php

namespace App\Services;

use App\Models\Assessment;
use App\Models\AssessmentItem;

class EvidenceScoringService
{
    /**
     * Verdict priority for "best verdict" selection.
     * Higher number = better quality.
     *
     * Keys are strtolower(AIService::VERDICT_*) — this service normalises raw DB
     * values via strtolower() before lookup so Title-Case DB values match here.
     */
    private const VERDICT_PRIORITY = [
        'insufficient'       => 1,
        'partially adequate' => 2,
        'adequate'           => 3,
    ];

    /**
     * Evidence quality multipliers (keyed on normalised verdict).
     *
     * Same normalisation convention as VERDICT_PRIORITY above.
     */
    private const EVIDENCE_MULTIPLIERS = [
        'adequate'           => 1.0,
        'partially adequate' => 0.75,
        'insufficient'       => 0.5,
    ];

    /**
     * Base compliance scores per self-assessment status.
     * null means the control is excluded from calculation.
     */
    private const BASE_SCORES = [
        'compliant'           => 1.0,
        'partially_compliant' => 0.5,
        'non_compliant'       => 0.0,
        'not_applicable'      => null,
    ];

    /**
     * Calculate the evidence-weighted compliance score for an assessment.
     *
     * @return array{
     *   weighted_score: float,
     *   raw_score: float,
     *   fully_evidenced: int,
     *   weak_evidence: int,
     *   no_evidence: int,
     *   total_applicable: int,
     * }
     */
    public function calculateEvidenceWeightedScore(Assessment $assessment): array
    {
        $items = AssessmentItem::with('evidence')
            ->where('assessment_id', $assessment->id)
            ->get();

        $totalApplicable = 0;
        $weightedTotal   = 0.0;
        $fullyEvidenced  = 0;
        $weakEvidence    = 0;
        $noEvidence      = 0;

        foreach ($items as $item) {
            $baseScore = self::BASE_SCORES[$item->compliance_status] ?? null;

            // Skip not_applicable controls — they don't factor into the score
            if ($baseScore === null) {
                continue;
            }

            $totalApplicable++;

            $bestVerdict = $this->getBestVerdict($item->evidence);
            $multiplier  = $this->getMultiplier($bestVerdict);

            // Bucket tracking
            if ($bestVerdict === null) {
                $noEvidence++;
            } elseif ($multiplier >= 1.0) {
                $fullyEvidenced++;
            } else {
                $weakEvidence++;
            }

            $weightedTotal += $baseScore * $multiplier;
        }

        if ($totalApplicable === 0) {
            return [
                'weighted_score'   => 0.0,
                'raw_score'        => (float) $assessment->compliance_percentage,
                'fully_evidenced'  => 0,
                'weak_evidence'    => 0,
                'no_evidence'      => 0,
                'total_applicable' => 0,
            ];
        }

        $weightedScore = round(($weightedTotal / $totalApplicable) * 100, 1);

        return [
            'weighted_score'   => $weightedScore,
            'raw_score'        => (float) $assessment->compliance_percentage,
            'fully_evidenced'  => $fullyEvidenced,
            'weak_evidence'    => $weakEvidence,
            'no_evidence'      => $noEvidence,
            'total_applicable' => $totalApplicable,
        ];
    }

    /**
     * Return the best (highest quality) normalised ai_verdict from a collection of evidence.
     * Returns null when there is no evidence or none has been AI-reviewed.
     */
    private function getBestVerdict($evidenceCollection): ?string
    {
        $best     = null;
        $bestPrio = 0;

        foreach ($evidenceCollection as $evidence) {
            if ($evidence->ai_verdict === null) {
                continue;
            }

            $normalised = strtolower(trim($evidence->ai_verdict));
            $priority   = self::VERDICT_PRIORITY[$normalised] ?? 0;

            if ($priority > $bestPrio) {
                $bestPrio = $priority;
                $best     = $normalised;
            }
        }

        return $best;
    }

    /**
     * Return the multiplier for a normalised verdict string (or null when no evidence).
     */
    private function getMultiplier(?string $normalised): float
    {
        if ($normalised === null) {
            return 0.5; // no evidence treated same as insufficient
        }

        return self::EVIDENCE_MULTIPLIERS[$normalised] ?? 0.5;
    }
}
