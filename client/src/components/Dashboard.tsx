import React from 'react';
import { SimulationControls } from './SimulationControls';
import { MetricsPanel } from './MetricsPanel';
import { MapPanel } from './MapPanel';
import { InventoryTable } from './InventoryTable';
import { AIAssistantPanel } from './AIAssistantPanel';
import { NegotiationFeed } from './NegotiationFeed';
import { AuditTrail } from './AuditTrail';
import { useSimulation } from '../hooks/useSimulation';
import { Cpu } from 'lucide-react';

export const Dashboard = () => {
  const { isBullwhipDetected } = useSimulation(); // activate client simulation loop

  return (
    <div className="h-screen w-screen bg-slate-900 text-slate-50 flex flex-col overflow-hidden font-sans">
      {/* Top Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
             <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-slate-100">NeuroCommerce <span className="text-blue-500 font-light ml-1">AI</span></h1>
            <p className="text-xs text-slate-400">Multi-Agent Retail Intelligence Network</p>
          </div>
        </div>
        <SimulationControls />
        <div className="flex items-center gap-4">
           {isBullwhipDetected && (
             <span className="bg-red-500 animate-pulse text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-2">
               ⚠️ Bullwhip Alert
             </span>
           )}
           <div className="text-right">
             <p className="text-sm font-medium">Node Network: <span className="text-green-400">Online</span></p>
             <p className="text-xs text-slate-500">{new Date().toLocaleTimeString()}</p>
           </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 p-4 gap-4 flex flex-col min-h-0 overflow-auto">
        <MetricsPanel />
        
        <div className="flex-1 flex gap-4 min-h-0">
          <div className="w-[25%] flex flex-col min-w-[300px]">
            <AIAssistantPanel />
          </div>
          
          <div className="w-[45%] flex flex-col relative min-w-[400px]">
             <MapPanel />
             {isBullwhipDetected && (
               <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600/90 text-white px-6 py-3 rounded-lg shadow-2xl backdrop-blur-sm z-10 border border-red-500 flex items-center gap-3 animate-in slide-in-from-top fade-in">
                  <span className="text-xl">🚨</span>
                  <div>
                    <h4 className="font-bold">Demand amplification detected!</h4>
                    <p className="text-xs opacity-90">Auto-calibrating inventory to offset bullwhip cascade.</p>
                  </div>
               </div>
             )}
          </div>
          
          <div className="w-[30%] flex flex-col min-w-[400px]">
            <InventoryTable />
          </div>
        </div>
        
        {/* Bottom Panels */}
        <div className="h-48 flex gap-4 shrink-0">
          <div className="w-1/2">
            <NegotiationFeed />
          </div>
          <div className="w-1/2">
            <AuditTrail />
          </div>
        </div>
      </main>
    </div>
  );
};
