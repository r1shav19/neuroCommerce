import type { Store, ProductId, Decision } from '../types';
import { evaluateStockoutRisk } from './demandEngine';

export function runDecisionEngine(stores: Store[], getDistance: (_s1: string, _s2: string) => number): Decision[] {
  const decisions: Decision[] = [];

  stores.forEach(needyStore => {
    (Object.keys(needyStore.inventory) as ProductId[]).forEach(product => {
      const inv = needyStore.inventory[product];
      const dem = needyStore.demandScore[product];

      if (evaluateStockoutRisk(inv, dem) === 'HIGH') {
        let bestDonor: Store | null = null;
        let highestScore = -Infinity;
        let bestDistance = 10;

        stores.forEach(donor => {
          if (donor.id === needyStore.id) return;
          if (donor.authenticityScore <= 60) return;
          const surplus = donor.inventory[product] - 80;
          if (surplus > 0) {
            const dist = getDistance(donor.id, needyStore.id) || 10;
            const score = surplus - dist;
            if (score > highestScore) {
              highestScore = score;
              bestDonor = donor;
              bestDistance = dist;
            }
          }
        });

        if (bestDonor) {
          const donor = bestDonor as Store;
          const surplus = donor.inventory[product] - 80;
          const demandGap = 100 - inv;
          const units = Math.max(1, Math.floor(Math.min(surplus, demandGap)));
          const confidence = Math.round(
            (donor.authenticityScore / 100) * 0.4 * 100
            + Math.min(1, surplus / 100) * 0.4 * 100
            + (1 - Math.min(1, bestDistance / 50)) * 0.2 * 100
          );
          const eta = Math.round(bestDistance * 1.5);

          decisions.push({
            id: `${needyStore.id}-${product}-${Date.now()}`,
            timestamp: Date.now(),
            fromStore: donor.id,
            toStore: needyStore.id,
            product,
            units,
            reason: `${needyStore.name} has critically low ${product} stock (${inv} units, demand: ${Math.round(dem)}). ${donor.name} has surplus (${donor.inventory[product]} units). ETA ${eta} mins. Confidence: ${confidence}%. Threat clear (Score: ${donor.authenticityScore}).`,
            confidence,
            threatScore: donor.authenticityScore,
            eta,
            status: 'pending'
          });
        }
      }
    });
  });

  return decisions;
}
