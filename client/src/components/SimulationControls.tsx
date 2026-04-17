import { Activity, ShieldAlert, Target } from 'lucide-react';
import { useAppStore } from '../store';
import { useWebSocket } from '../hooks/useWebSocket';
import React from 'react';

function TrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
      <polyline points="16 7 22 7 22 13"/>
    </svg>
  );
}

type SimMode = 'NORMAL' | 'VIRAL_SPIKE' | 'FAKE_DEMAND' | 'DEMO';

const MODES: { id: SimMode; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>>; color: string }[] = [
  { id: 'NORMAL',      label: 'Normal Flow',        icon: Activity,         color: 'text-blue-400' },
  { id: 'VIRAL_SPIKE', label: 'Viral Spike',         icon: TrendingUpIcon,   color: 'text-orange-400' },
  { id: 'FAKE_DEMAND', label: 'Fake Demand Attack',  icon: ShieldAlert,      color: 'text-red-400' },
  { id: 'DEMO',        label: 'Demo Mode',           icon: Target,           color: 'text-purple-400' },
];

export const SimulationControls: React.FC = () => {
  const { simulationMode, setSimulationMode } = useAppStore();
  const { sendMessage } = useWebSocket();

  const handleModeChange = (mode: SimMode) => {
    setSimulationMode(mode);
    sendMessage('SIMULATION_COMMAND', { mode });
  };

  return (
    <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
      {MODES.map(mode => {
        const Icon = mode.icon;
        const active = simulationMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => handleModeChange(mode.id)}
            aria-pressed={active}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              active ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Icon className={`w-4 h-4 ${active ? mode.color : ''}`} />
            {mode.label}
          </button>
        );
      })}
    </div>
  );
};
