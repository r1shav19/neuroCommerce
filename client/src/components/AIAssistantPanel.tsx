import React, { useState } from 'react';
import { useAppStore } from '../store';
import { useWebSocket } from '../hooks/useWebSocket';
import { Check, X, ShieldAlert, Cpu } from 'lucide-react';

export const AIAssistantPanel = () => {
  const { decisions, updateDecisionStatus, updateMetrics, metrics } = useAppStore();
  const { sendMessage } = useWebSocket();
  const [overrideText, setOverrideText] = useState<Record<string, string>>({});

  const handleApprove = (id: string) => {
    const d = decisions.find(x => x.id === id);
    if (!d) return;
    updateDecisionStatus(id, 'approved');
    updateMetrics({ stockoutsPrevented: metrics.stockoutsPrevented + 1 });
    sendMessage('EXECUTE_TRANSFER', { fromStoreId: d.fromStore, toStoreId: d.toStore, product: d.product, units: d.units }, 'dashboard');
  };

  const handleOverride = (id: string) => {
    const reason = overrideText[id] || 'Manual override';
    updateDecisionStatus(id, 'overridden', reason);
    sendMessage('OVERRIDE_DECISION', { decisionId: id, reason }, 'dashboard');
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col h-full overflow-hidden shadow-xl">
      <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-800 flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-400">
           <Cpu className="w-5 h-5" /> AI Assistant
        </h2>
        <span className="text-xs font-medium bg-blue-500/10 text-blue-400 py-1 px-2 rounded border border-blue-500/20">Active</span>
      </div>

      <div className="p-4 overflow-y-auto flex-1 space-y-4">
        {decisions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
             <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center animate-pulse">
                <ShieldAlert className="w-6 h-6 text-slate-400" />
             </div>
             <p>Monitoring network health...</p>
          </div>
        )}

        {decisions.map(d => (
          <div key={d.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4 transition-all hover:border-slate-600 relative overflow-hidden group">
            {d.status === 'approved' && <div className="absolute inset-0 bg-green-500/5 z-10 pointer-events-none"></div>}
            {d.status === 'overridden' && <div className="absolute inset-0 bg-red-500/5 z-10 pointer-events-none"></div>}
            
            <div className="flex justify-between items-start mb-2">
               <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                 <span className="font-bold text-red-400 text-sm">HIGH RISK — {d.toStore.replace('Store_','')}, {d.product}</span>
               </div>
               <span className="text-xs text-slate-500">{new Date(d.timestamp).toLocaleTimeString()}</span>
            </div>

            <div className="text-sm text-slate-300 mb-4 whitespace-pre-wrap leading-relaxed border-l-2 border-slate-700 pl-3">
              {d.reason}
            </div>
            
            <div className="border-t border-slate-800 pt-3 mb-3">
               <p className="text-sm font-semibold text-blue-300 mb-1">RECOMMENDATION:</p>
               <p className="text-sm text-slate-300">Transfer {d.units} units from {d.fromStore.replace('Store_','')}</p>
            </div>

            {d.status === 'pending' && (
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
                <button 
                  onClick={() => handleApprove(d.id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded py-2 px-3 text-sm font-medium transition flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Approve
                </button>
                <div className="flex-1 flex gap-2 relative">
                  <select 
                    className="w-[100px] flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-2 text-sm text-slate-300 focus:outline-none focus:border-red-500"
                    onChange={(e) => setOverrideText(prev => ({ ...prev, [d.id]: e.target.value }))}
                    defaultValue=""
                  >
                    <option value="" disabled>Reason...</option>
                    <option value="Insufficient stock">Insufficient stock</option>
                    <option value="Road closed">Road closed</option>
                    <option value="Manual review needed">Manual review needed</option>
                  </select>
                  <button 
                    onClick={() => handleOverride(d.id)}
                    className="bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-300 rounded py-2 px-3 text-sm font-medium transition flex items-center justify-center gap-1 border border-slate-600 hover:border-red-500/50"
                  >
                    <X className="w-4 h-4" /> Override
                  </button>
                </div>
              </div>
            )}

            {d.status === 'approved' && (
              <div className="mt-2 text-green-500 text-sm font-medium flex items-center gap-2">
                <Check className="w-4 h-4" /> Transfer Approved
              </div>
            )}
            
            {d.status === 'overridden' && (
              <div className="mt-2 text-red-400 text-sm font-medium flex items-center gap-2">
                <X className="w-4 h-4" /> Overridden: {d.overrideReason}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
