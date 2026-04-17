import React from 'react';
import { useAppStore } from '../store';
import { ThreatBadge } from './ThreatBadge';

const getCellColor = (value: number) => {
  if (value < 20) return 'bg-red-500/20 text-red-500';
  if (value <= 80) return 'bg-yellow-500/20 text-yellow-500';
  return 'bg-green-500/20 text-green-500';
};

export const InventoryTable = () => {
  const { stores } = useAppStore();

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
         <h2 className="text-lg font-semibold flex items-center gap-2">📦 Live Inventory</h2>
      </div>
      <div className="overflow-x-auto p-4 flex-1">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
            <tr>
              <th className="px-4 py-3">Store</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Shoes</th>
              <th className="px-4 py-3 text-center">Bags</th>
              <th className="px-4 py-3 text-center">Watches</th>
              <th className="px-4 py-3 text-center">Caps</th>
              <th className="px-4 py-3 text-center">Jackets</th>
            </tr>
          </thead>
          <tbody>
            {stores.map(store => (
              <tr key={store.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-200">{store.name}</td>
                <td className="px-4 py-3"><ThreatBadge status={store.status} /></td>
                <td className={`px-4 py-3 text-center font-bold ${getCellColor(store.inventory.shoes)}`}>{store.inventory.shoes}</td>
                <td className={`px-4 py-3 text-center font-bold ${getCellColor(store.inventory.bags)}`}>{store.inventory.bags}</td>
                <td className={`px-4 py-3 text-center font-bold ${getCellColor(store.inventory.watches)}`}>{store.inventory.watches}</td>
                <td className={`px-4 py-3 text-center font-bold ${getCellColor(store.inventory.caps)}`}>{store.inventory.caps}</td>
                <td className={`px-4 py-3 text-center font-bold ${getCellColor(store.inventory.jackets)}`}>{store.inventory.jackets}</td>
              </tr>
            ))}
            {stores.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-500">Connecting to node network...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
