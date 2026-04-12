/**
 * Shared risk-scoring utilities used by risks/create.tsx, risks/edit.tsx,
 * and any other page that displays a live risk level from likelihood × impact.
 *
 * Thresholds mirror Risk::levelThresholds() on the PHP side.
 * If you change these, update Risk.php too.
 */

export interface ValidationResult {
    error?:                 boolean;
    valid:                  boolean;
    recommended_likelihood: number;
    recommended_impact:     number;
    reasoning:              string;
    confidence:             string;
}

/** Colour classes for each 1-5 slider value on the L/I badges. */
export const levelColors: Record<number, string> = {
    1: 'bg-green-100 text-green-700',
    2: 'bg-lime-100 text-lime-700',
    3: 'bg-yellow-100 text-yellow-700',
    4: 'bg-orange-100 text-orange-700',
    5: 'bg-red-100 text-red-700',
};

/** Risk-level label + colour for the score banner (threshold: ≥20 Critical, ≥13 High, ≥7 Medium). */
export function levelFromScore(score: number): { label: string; color: string } {
    if (score >= 20) return { label: 'Critical', color: 'text-red-500 bg-red-50 border-red-200' };
    if (score >= 13) return { label: 'High',     color: 'text-orange-500 bg-orange-50 border-orange-200' };
    if (score >= 7)  return { label: 'Medium',   color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    return                   { label: 'Low',     color: 'text-green-600 bg-green-50 border-green-200' };
}
