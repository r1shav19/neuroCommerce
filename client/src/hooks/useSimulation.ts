import { useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { evaluateThreats } from '../utils/threatEngine';
import type { ThreatHistory } from '../utils/threatEngine';
import { runDecisionEngine } from '../utils/decisionEngine';
import { BullwhipDetector } from '../utils/bullwhipDetector';
import { useWebSocket } from './useWebSocket';

export function useSimulation() {
  const { stores, addDecision, addAuditLog, simulationMode } = useAppStore();
  const { sendMessage } = useWebSocket();
  const bullwhipDetector = useRef(new BullwhipDetector(10));
  const threatHistoryMap = useRef<Record<string, ThreatHistory>>({});
  const isBullwhip = useRef(false);

  useEffect(() => {
    if (stores.length === 0) return;

    let totalDemand = 0;
    let totalInv = 0;
    const newStores = stores.map(s => ({ ...s }));

    newStores.forEach((store, index) => {
      if (!threatHistoryMap.current[store.id]) {
        threatHistoryMap.current[store.id] = { demandSignals: [], authScore: 100 };
      }

      const demandSum = Object.values(store.demandScore).reduce((a, b) => a + b, 0);
      const invSum = Object.values(store.inventory).reduce((a, b) => a + b, 0);
      totalDemand += demandSum;
      totalInv += invSum;

      let signalToEvaluate = store.demandScore['watches'] ?? 50;
      if (simulationMode === 'FAKE_DEMAND' && store.id === 'Store_D') {
        signalToEvaluate = 100;
      }

      const threatHistory = threatHistoryMap.current[store.id];
      const threatResult = evaluateThreats(threatHistory, signalToEvaluate, false);

      if (threatResult.reason) {
        addAuditLog({
          id: Date.now().toString() + Math.random(),
          timestamp: Date.now(),
          eventType: 'threat',
          payload: { storeId: store.id, reason: threatResult.reason },
          hmacSignature: 'N/A'
        });
      }

      threatHistory.demandSignals.push(signalToEvaluate);
      threatHistory.authScore = threatResult.newScore;
      newStores[index].authenticityScore = threatResult.newScore;
      if (threatResult.newScore < 40) newStores[index].status = 'suspicious';
    });

    bullwhipDetector.current.recordTick(totalDemand, totalInv);
    isBullwhip.current = bullwhipDetector.current.isBullwhipDetected();

    const timer = setTimeout(() => {
      const decisions = runDecisionEngine(newStores, () => 10);
      decisions.forEach(d => {
        addDecision(d);
        sendMessage('WANT_BID', { storeId: d.toStore, product: d.product, unitsNeeded: d.units, urgency: 80 }, d.toStore);
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [stores]);

  return { isBullwhipDetected: isBullwhip.current };
}
