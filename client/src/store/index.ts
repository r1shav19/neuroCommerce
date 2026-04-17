import { create } from 'zustand';
import type { Store, Decision, AuditEntry } from '../types';

interface AppState {
  stores: Store[];
  decisions: Decision[];
  auditLogs: AuditEntry[];
  negotiationFeed: any[];
  metrics: {
    revenueSaved: number;
    stockoutsPrevented: number;
    avgFulfillmentETA: number;
    threatsBlocked: number;
  };
  simulationMode: 'NORMAL' | 'VIRAL_SPIKE' | 'FAKE_DEMAND' | 'DEMO';
  
  setStores: (stores: Store[]) => void;
  addDecision: (decision: Decision) => void;
  updateDecisionStatus: (id: string, status: Decision['status'], overrideReason?: string) => void;
  addAuditLog: (log: AuditEntry) => void;
  addNegotiationEvent: (event: any) => void;
  updateMetrics: (updates: Partial<AppState['metrics']>) => void;
  setSimulationMode: (mode: AppState['simulationMode']) => void;
}

export const useAppStore = create<AppState>((set) => ({
  stores: [],
  decisions: [],
  auditLogs: [],
  negotiationFeed: [],
  metrics: {
    revenueSaved: 0,
    stockoutsPrevented: 0,
    avgFulfillmentETA: 0,
    threatsBlocked: 0
  },
  simulationMode: 'NORMAL',

  setStores: (stores) => set({ stores }),
  
  addDecision: (decision) => set((state) => {
    if (state.decisions.find(d => d.id === decision.id)) return state;
    return { decisions: [decision, ...state.decisions].slice(0, 50) };
  }),

  updateDecisionStatus: (id, status, overrideReason) => set((state) => ({
    decisions: state.decisions.map(d => 
      d.id === id ? { ...d, status, overrideReason } : d
    )
  })),

  addAuditLog: (log) => set((state) => ({
    auditLogs: [log, ...state.auditLogs].slice(0, 100)
  })),

  addNegotiationEvent: (event) => set((state) => ({
    negotiationFeed: [event, ...state.negotiationFeed].slice(0, 20)
  })),

  updateMetrics: (updates) => set((state) => ({
    metrics: { ...state.metrics, ...updates }
  })),

  setSimulationMode: (simulationMode) => set({ simulationMode })
}));
