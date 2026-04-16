/**
 * Shared risk-scoring utilities used by risks/create.tsx, risks/edit.tsx,
 * and any other page that displays a live risk level from likelihood × impact.
 *
 * Thresholds mirror Risk::levelThresholds() on the PHP side.
 * If you change these, update Risk.php too.
 */

export interface ValidationResult {
    error?: boolean;
    valid: boolean;
    recommended_likelihood: number;
    recommended_impact: number;
    reasoning: string;
    confidence: string;
}

/** Academia colour classes for each 1-5 slider value on the L/I badges. */
export const levelColors: Record<number, string> = {
    1: 'bg-[rgba(139,158,107,0.15)] text-[#8B9E6B]',
    2: 'bg-[rgba(139,158,107,0.1)] text-[#8B9E6B]',
    3: 'bg-[rgba(201,169,98,0.15)] text-[#C9A962]',
    4: 'bg-[rgba(176,120,64,0.15)] text-[#B07840]',
    5: 'bg-[rgba(139,38,53,0.15)] text-[#8B2635]',
};

/** Risk-level label + inline style for the score banner. */
export function levelFromScore(score: number): {
    label: string;
    color: string;
    style: React.CSSProperties;
} {
    if (score >= 20) return { label: 'Critical', color: '', style: { color: '#8B2635', background: 'rgba(139,38,53,0.15)', borderColor: 'rgba(139,38,53,0.4)' } };
    if (score >= 13) return { label: 'High',     color: '', style: { color: '#B07840', background: 'rgba(176,120,64,0.15)', borderColor: 'rgba(176,120,64,0.4)' } };
    if (score >= 7)  return { label: 'Medium',   color: '', style: { color: '#C9A962', background: 'rgba(201,169,98,0.15)', borderColor: 'rgba(201,169,98,0.4)' } };
    return                  { label: 'Low',      color: '', style: { color: '#8B9E6B', background: 'rgba(139,158,107,0.15)', borderColor: 'rgba(139,158,107,0.4)' } };
}
