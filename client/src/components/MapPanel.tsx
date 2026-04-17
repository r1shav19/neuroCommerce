import React from 'react';
import { useAppStore } from '../store';

function getMarkerColor(store: { status: string; inventory: Record<string, number> }): string {
  if (store.status === 'suspicious') return '#ef4444';
  const total = Object.values(store.inventory).reduce((a, b) => a + b, 0);
  if (total < 100) return '#ef4444';
  if (total < 300) return '#eab308';
  return '#22c55e';
}

// Roughly map Chennai lat/lng to percentage positions in the panel
function geoToPercent(lat: number, lng: number) {
  // Bounds: lat 12.95–13.13, lng 80.14–80.27
  const left = ((lng - 80.14) / (80.27 - 80.14)) * 80 + 10; // 10–90%
  const top  = ((13.13 - lat) / (13.13 - 12.95)) * 70 + 10;  // 10–80%
  return { left: `${left.toFixed(1)}%`, top: `${top.toFixed(1)}%` };
}

export const MapPanel: React.FC = () => {
  const { stores } = useAppStore();

  return (
    <div className="relative w-full h-full bg-[#1a2035] rounded-xl overflow-hidden border border-slate-700">
      {/* Grid background */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3b82f6" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* City label */}
      <div className="absolute top-3 left-3 text-xs text-slate-500 font-semibold tracking-wide uppercase">Chennai, India</div>

      {/* Store nodes */}
      {stores.map(store => {
        const pos = geoToPercent(store.lat, store.lng);
        const color = getMarkerColor(store);
        const isSuspicious = store.status === 'suspicious';
        const label = store.id.replace('Store_', '');

        return (
          <div
            key={store.id}
            className="absolute flex flex-col items-center gap-1"
            style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, -50%)' }}
          >
            <div
              className={`rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white transition-all ${isSuspicious ? 'animate-pulse scale-125' : ''}`}
              style={{
                width: 36, height: 36,
                backgroundColor: color,
                boxShadow: `0 0 ${isSuspicious ? 20 : 10}px ${color}99`,
              }}
            >
              {label}
            </div>
            <span className="text-[10px] text-slate-300 bg-slate-900/80 px-1.5 py-0.5 rounded whitespace-nowrap max-w-[100px] text-center leading-tight">
              {store.name.split(' ').slice(0, 2).join(' ')}
            </span>
          </div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm rounded-lg p-2 text-xs space-y-1 border border-slate-700">
        {[['#22c55e', 'Healthy (>300 units)'], ['#eab308', 'Low (100–300)'], ['#ef4444', 'Critical / Threat']].map(([c, label]) => (
          <div key={label} className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c }}></span>
            {label}
          </div>
        ))}
      </div>

      {/* Connection lines between stores */}
      {stores.length > 0 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {stores.map((a, i) => stores.slice(i + 1).map(b => {
            const pa = geoToPercent(a.lat, a.lng);
            const pb = geoToPercent(b.lat, b.lng);
            return (
              <line
                key={`${a.id}-${b.id}`}
                x1={pa.left} y1={pa.top} x2={pb.left} y2={pb.top}
                stroke="#3b82f620" strokeWidth="1" strokeDasharray="4 4"
              />
            );
          }))}
        </svg>
      )}

      {stores.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
          Connecting to node network...
        </div>
      )}
    </div>
  );
};
