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

/** Heatmap palette colour classes for each 1-5 slider value on the L/I badges. */
export const levelColors: Record<number, string> = {
    1: 'bg-[rgba(70,189,95,0.15)] text-[#46bd5f]',
    2: 'bg-[rgba(163,217,119,0.15)] text-[#a3d977]',
    3: 'bg-[rgba(245,185,41,0.15)] text-[#f5b929]',
    4: 'bg-[rgba(247,107,21,0.15)] text-[#f76b15]',
    5: 'bg-[rgba(229,72,77,0.15)] text-[#e5484d]',
};

/** Risk-level label + inline style for the score banner. */
export function levelFromScore(score: number): {
    label: string;
    color: string;
    style: React.CSSProperties;
} {
    if (score >= 20) return { label: 'Critical', color: '', style: { color: '#e5484d', background: 'rgba(229,72,77,0.12)', borderColor: 'rgba(229,72,77,0.4)' } };
    if (score >= 13) return { label: 'High',     color: '', style: { color: '#f76b15', background: 'rgba(247,107,21,0.12)', borderColor: 'rgba(247,107,21,0.4)' } };
    if (score >= 7)  return { label: 'Medium',   color: '', style: { color: '#f5b929', background: 'rgba(245,185,41,0.12)', borderColor: 'rgba(245,185,41,0.4)' } };
    return                  { label: 'Low',      color: '', style: { color: '#46bd5f', background: 'rgba(70,189,95,0.12)', borderColor: 'rgba(70,189,95,0.4)' } };
}
