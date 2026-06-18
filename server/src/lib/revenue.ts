/**
 * Drempel-win-kans waarboven een deal als "gekwalificeerd" telt en de
 * verwachte omzet berekend wordt. Komt overeen met de fase "Gekwalificeerd" (40%).
 */
export const QUALIFIED_THRESHOLD = 0.4;

/**
 * Verwachte omzet = dealwaarde x win-kans van de fase.
 * Alleen berekend vanaf de gekwalificeerde drempel; anders null.
 */
export function computeExpectedRevenue(
  dealValue: number | null | undefined,
  stageProbability: number,
): number | null {
  if (dealValue == null || Number.isNaN(dealValue)) return null;
  if (stageProbability < QUALIFIED_THRESHOLD) return null;
  return Math.round(dealValue * stageProbability * 100) / 100;
}
