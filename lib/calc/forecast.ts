/**
 * Placeholder for pay-cycle / timeline forecasts.
 * Real implementation lands in Phase 3 (Safe-to-Spend v2).
 */

export type ForecastPoint = {
  date: string; // YYYY-MM-DD
  balance: number;
};

export type ForecastResult = {
  points: ForecastPoint[];
  lowestBalance: number;
  lowestDate: string | null;
};

export function calcForecast(): ForecastResult {
  return {
    points: [],
    lowestBalance: 0,
    lowestDate: null,
  };
}
