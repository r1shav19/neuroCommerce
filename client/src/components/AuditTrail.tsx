import React, { useState } from 'react';
import { useAppStore } from '../store';
import { ShieldCheck, Download, Filter } from 'lucide-react';

export const AuditTrail = () => {
  const { auditLogs } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'decision' | 'threat' | 'transfer' | 'override' | 'bid'>('all');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredLogs = filter === 'all' ? auditLogs : auditLogs.filter(l => l.eventType === filter);

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "audit_logs.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className={`bg-slate-800 rounded-xl border border-slate-700 flex flex-col transition-all duration-300 ${isExpanded ? 'h-96' : 'h-14'}`}>
      <div 
        className="p-3 border-b border-slate-700 flex justify-between items-center cursor-pointer hover:bg-slate-700/30"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-sm font-semibold flex items-center gap-2">
           <ShieldCheck className="w-4 h-4 text-green-400" /> Tamper-Evident Audit Trail
           <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full text-xs">{auditLogs.length}</span>
        </h3>
        {isExpanded && (
          <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 text-sm">
              <Filter className="w-4 h-4 text-slate-400" />
              <select 
                className="bg-slate-900 border border-slate-700 rounded text-xs p-1 text-slate-300"
                value={filter}
                onChange={e => setFilter(e.target.value as any)}
              >
                <option value="all">All Events</option>
                <option value="transfer">Transfers</option>
                <option value="threat">Threats</option>
                <option value="override">Overrides</option>
              </select>
            </div>
            <button onClick={exportJSON} className="flex items-center gap-1 text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-slate-200">
               <Download className="w-3 h-3" /> Export
            </button>
          </div>
        )}
      </div>
      
      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs bg-[#0f172a]">
          {filteredLogs.length === 0 && <p className="text-slate-500 text-center">No logs generated yet.</p>}
          {filteredLogs.map(log => (
            <div key={log.id} className="bg-slate-800 p-3 rounded border border-slate-700/50">
               <div className="flex justify-between text-slate-400 mb-2">
                 <span>{new Date(log.timestamp).toISOString()}</span>
                 <span className="uppercase text-blue-400 font-bold">{log.eventType}</span>
               </div>
               <div className="text-slate-300 mb-2 whitespace-pre-wrap word-break">
                 {JSON.stringify(log.payload)}
               </div>
               <div className="text-[10px] text-slate-500 flex items-center gap-1">
                 <ShieldCheck className="w-3 h-3" />
                 HMAC: {log.hmacSignature.substring(0, 16)}...{log.hmacSignature.substring(log.hmacSignature.length - 8)}
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
