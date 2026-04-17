import React from 'react';
import { useAppStore } from '../store';
import { TrendingUp, PackageX, Clock, ShieldCheck } from 'lucide-react';

export const MetricsPanel = () => {
  const { metrics } = useAppStore();

  const cards = [
    { title: 'Revenue Saved', value: `₹${metrics.stockoutsPrevented * 2000}`, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
    { title: 'Stockouts Prevented', value: metrics.stockoutsPrevented, icon: PackageX, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Avg Fulfillment', value: `${Math.round(metrics.avgFulfillmentETA)} min`, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { title: 'Threats Blocked', value: metrics.threatsBlocked, icon: ShieldCheck, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="flex gap-4">
      {cards.map((c, i) => (
        <div key={i} className="flex-1 bg-slate-800 rounded-xl border border-slate-700 p-4 flex items-center gap-4 shadow-sm hover:bg-slate-800/80 transition-colors">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${c.bg}`}>
             <c.icon className={`w-6 h-6 ${c.color}`} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">{c.title}</p>
            <p className="text-xl font-bold text-slate-100">{c.value}</p>
          </div>
        </div>
      ))}
      <div className="flex-1 bg-slate-800/50 rounded-xl border border-slate-700 p-4 border-dashed flex justify-center flex-col text-center">
        <p className="text-xs text-slate-400">Industry Benchmark</p>
        <p className="text-xs text-slate-300 font-semibold mt-1">AI reduces stockouts by 31%, warehousing costs by 5–10%</p>
      </div>
    </div>
  );
};
