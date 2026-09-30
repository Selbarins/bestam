/**
 * Placeholder for runway (months you can last without income).
 * Real implementation lands in Phase 4.
 */

export type RunwayResult = {
  essentialsMonths: number;
  lifestyleMonths: number;
};

export function calcRunway(): RunwayResult {
  return {
    essentialsMonths: 0,
    lifestyleMonths: 0,
  };
}
