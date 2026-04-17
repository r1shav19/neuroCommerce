import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Play, ChevronRight } from 'lucide-react';

const steps = [
  "Initialize NeuroCommerce Network",
  "Normal Demand Fluctuations",
  "Viral Spike Detected at Store C",
  "High Risk Alert Generated",
  "AI Transfer Optimization",
  "Multi-Agent Negotiation Started",
  "Store B Wins Transfer Bid",
  "Transfer Executed, Threat Cleared"
];

export const DemoMode = () => {
  const [step, setStep] = useState(0);
  const { simulationMode } = useAppStore();

  if (simulationMode !== 'DEMO') return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 border border-purple-500/50 backdrop-blur-md rounded-xl p-4 shadow-2xl z-20 flex justify-between items-center animate-in slide-in-from-bottom">
       <div>
         <p className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
            <Play className="w-3 h-3" /> Guided Demo Mode
         </p>
         <h4 className="text-lg font-bold text-slate-100">Step {step + 1}: {steps[step]}</h4>
       </div>
       <button 
         onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
         disabled={step === steps.length - 1}
         className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 px-4 py-2 rounded-lg font-medium shadow-lg transition flex items-center gap-2"
       >
         Next Step <ChevronRight className="w-4 h-4" />
       </button>
    </div>
  );
};
