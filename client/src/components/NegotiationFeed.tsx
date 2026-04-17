import React from 'react';
import { useAppStore } from '../store';

export const NegotiationFeed = () => {
  const { negotiationFeed } = useAppStore();

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-slate-700 bg-slate-800/80">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Live Multi-Agent Negotiation
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#0a0f18] font-mono text-xs">
        {negotiationFeed.length === 0 && (
          <p className="text-slate-500 text-center mt-4">Waiting for agent activity...</p>
        )}
        {negotiationFeed.map((event, i) => (
          <div key={i} className="border-b border-slate-800/50 pb-2">
            <span className="text-slate-500">[{new Date().toLocaleTimeString()}] </span>
            {event.type === 'WANT_BID' && (
              <span className="text-blue-400">
                INFO: {event.storeId} broadcast WANT_BID for {event.unitsNeeded}x {event.product} (urgency: {event.urgency})
              </span>
            )}
            {event.type === 'OFFER_BID' && (
              <span className="text-green-400">
                BID: {event.storeId} offered {event.unitsAvailable}x {event.product}
              </span>
            )}
            {event.type === 'BID_RESULT' && (
              <span className="text-yellow-400">
                RESULT: {event.winner ? `${event.winner} won auction for ${event.units}x ${event.product}. ETA: ${event.eta}m` : `Auction failed: ${event.msg}`}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
