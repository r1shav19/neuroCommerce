export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export function calculateDemandScore(rawSignal: number, previousScore: number, isWeekend: boolean): number {
  const ema = 0.3 * rawSignal + 0.7 * previousScore;
  return Math.min(100, Math.max(0, ema + (isWeekend ? 10 : 0)));
}

export function determineTrend(current: number, previous: number): 'rising' | 'stable' | 'falling' {
  if (current - previous > 5) return 'rising';
  if (previous - current > 5) return 'falling';
  return 'stable';
}

export function evaluateStockoutRisk(inventory: number, demand: number): RiskLevel {
  if (inventory < 20 && demand > 70) return 'HIGH';
  if (inventory < 40 && demand > 55) return 'MEDIUM';
  return 'LOW';
}
