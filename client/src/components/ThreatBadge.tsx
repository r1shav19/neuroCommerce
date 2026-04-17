import React from 'react';

export const ThreatBadge: React.FC<{ status: 'healthy' | 'low' | 'critical' | 'suspicious' }> = ({ status }) => {
  if (status === 'healthy') {
    return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-500"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Secure</span>;
  }
  if (status === 'suspicious') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
        Compromised
      </span>
    );
  }
  return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-yellow-500/10 text-yellow-500"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>Warning</span>;
};
