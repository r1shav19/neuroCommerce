export type ProductId = 'shoes' | 'bags' | 'watches' | 'caps' | 'jackets';
export type SimMode = 'NORMAL' | 'VIRAL_SPIKE' | 'FAKE_DEMAND' | 'DEMO';

const PRODUCTS: ProductId[] = ['shoes', 'bags', 'watches', 'caps', 'jackets'];

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Build initial state without importing from index to avoid circular deps
const baseStores = [
  { id: 'Store_A', name: 'Express Avenue Mall', lat: 13.0604, lng: 80.2496 },
  { id: 'Store_B', name: 'Phoenix MarketCity',  lat: 12.9941, lng: 80.2183 },
  { id: 'Store_C', name: 'Ambattur Industrial',  lat: 13.1143, lng: 80.1548 },
  { id: 'Store_D', name: 'Anna Nagar',           lat: 13.0850, lng: 80.2101 },
  { id: 'Store_E', name: 'Velachery',            lat: 12.9756, lng: 80.2183 },
];

export const storeData = baseStores.map(s => {
  const inventory: Record<string, number> = {};
  const demandScore: Record<string, number> = {};
  PRODUCTS.forEach(p => {
    inventory[p]   = randInt(30, 180);
    demandScore[p] = randInt(30, 70);
  });
  return {
    ...s,
    inventory,
    demandScore,
    authenticityScore: 100,
    status: 'healthy' as const,
    agentKey: `key_${s.id}`,
  };
});

let tickCount = 0;
let currentMode: SimMode = 'NORMAL';

export function setSimulationMode(mode: SimMode) {
  currentMode = mode;
}

/** EMA helper */
function ema(raw: number, prev: number) {
  return 0.3 * raw + 0.7 * prev;
}

export function startSimulationLoop(broadcastFn: (msg: object) => void) {
  setInterval(() => {
    tickCount++;
    const isWeekend = tickCount % 6 === 0;

    storeData.forEach(store => {
      // Authenticity recovery
      if (store.authenticityScore < 100) {
        store.authenticityScore = Math.min(100, store.authenticityScore + 5);
      }
      if (store.authenticityScore >= 40 && store.status === 'suspicious') {
        (store as any).status = 'healthy';
      }

      PRODUCTS.forEach(p => {
        // --- demand fluctuation ---
        let rawSignal: number;

        if (currentMode === 'VIRAL_SPIKE' && store.id === 'Store_A' && p === 'watches') {
          rawSignal = Math.min(100, store.demandScore[p] * 5); // big spike
        } else if (currentMode === 'FAKE_DEMAND' && store.id === 'Store_D') {
          rawSignal = 100; // burst attack
          // lower authenticity score for fake demand store
          store.authenticityScore = Math.max(0, store.authenticityScore - 20);
          if (store.authenticityScore < 40) (store as any).status = 'suspicious';
        } else {
          rawSignal = store.demandScore[p] + randInt(-5, 5);
        }

        const weekend = isWeekend ? 10 : 0;
        store.demandScore[p] = Math.max(0, Math.min(100, ema(rawSignal, store.demandScore[p]) + weekend));

        // --- drain inventory proportional to demand ---
        const drain = Math.floor(store.demandScore[p] / 40); // 0-2 units per tick
        store.inventory[p] = Math.max(0, store.inventory[p] - drain);

        // --- restock if very low ---
        if (store.inventory[p] < 10) {
          store.inventory[p] += randInt(20, 60);
        }
      });
    });

    broadcastFn({
      type: 'SYNC_STATE',
      stores: storeData,
      tickCount,
      mode: currentMode,
    });
  }, 5000);
}

export function executeTransfer(fromStoreId: string, toStoreId: string, product: string, units: number): boolean {
  const from = storeData.find(s => s.id === fromStoreId);
  const to   = storeData.find(s => s.id === toStoreId);
  if (from && to && from.inventory[product] >= units) {
    from.inventory[product] -= units;
    to.inventory[product]   += units;
    return true;
  }
  return false;
}
