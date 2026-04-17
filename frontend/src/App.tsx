import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { AlertCircle, Target, ShieldAlert, Cpu, Activity, Store } from "lucide-react";
import { motion } from "framer-motion";

// Note: Websocket backend running on 8000
const wsUrl = "ws://localhost:8000/ws";

export default function App() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [stores, setStores] = useState<any>({});
  const [logs, setLogs] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [currentEvent, setCurrentEvent] = useState("NORMAL");

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => console.log("Connected to AI Backend");
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "SYNC_STATE") {
        setStores(data.payload.stores || {});
        if (data.payload.logs) setLogs(data.payload.logs);
        setTransfers(data.payload.transfers || []);
        setCurrentEvent(data.payload.current_event || "NORMAL");
      } else if (data.type === "NEW_LOG") {
        setLogs(prev => [...prev, data.payload].slice(-50));
      }
    };

    setSocket(ws);
    return () => ws.close();
  }, []);

  const triggerEvent = (eventName: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: eventName }));
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 gap-4 bg-background overflow-hidden relative">
      <header className="flex justify-between items-center bg-surface p-4 rounded-xl border border-gray-700 shadow-lg">
        <div className="flex items-center gap-3">
          <Activity className="text-primary w-8 h-8"/>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">NeuroCommerce</h1>
            <p className="text-sm text-gray-400">AI-Powered Self-Healing Retail Assistant</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm font-semibold text-gray-300 mr-2 flex items-center gap-2">
            Status: <span className="text-accent flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div> Online</span>
          </div>
          <button onClick={() => triggerEvent("TRIGGER_NORMAL")} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-semibold transition">Normal Op</button>
          <button onClick={() => triggerEvent("TRIGGER_VIRAL_SPIKE")} className="px-4 py-2 bg-primary hover:bg-blue-500 rounded text-sm font-semibold transition shadow-[0_0_15px_rgba(59,130,246,0.5)]">Viral Spike</button>
          <button onClick={() => triggerEvent("TRIGGER_FAKE_DEMAND")} className="px-4 py-2 bg-alert hover:bg-red-500 rounded text-sm font-semibold transition shadow-[0_0_15px_rgba(239,68,68,0.5)]">Fake Demand Attack</button>
        </div>
      </header>
      
      <main className="flex gap-4 flex-1 overflow-hidden">
        {/* Left Col - Agent Network / Map Placeholder */}
        <section className="flex-[2] flex flex-col gap-4">
          <div className="bg-surface rounded-xl border border-gray-700 p-4 shadow-lg flex-1 flex flex-col relative overflow-hidden">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Store className="text-primary"/> Store Nodes
            </h2>
            <div className="grid grid-cols-3 gap-4 h-full">
              {Object.entries(stores).map(([id, store]: [string, any]) => (
                <div key={id} className={`p-4 rounded-lg border \${store.threat_score > 80 ? 'border-alert bg-alert/10' : store.inventory < 20 ? 'border-warning bg-warning/10' : 'border-gray-700 bg-gray-800'}`}>
                  <h3 className="text-lg font-bold mb-2">{store.name}</h3>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>Demand: <span className="text-white font-bold">{store.current_demand}</span></p>
                    <p>Inventory: <span className={`font-bold \${store.inventory < 20 ? 'text-alert' : 'text-accent'}`}>{store.inventory}</span></p>
                    <p>Threat Score: <span className={`font-bold \${store.threat_score > 60 ? 'text-alert' : 'text-accent'}`}>{store.threat_score}%</span></p>
                  </div>
                  {store.threat_score > 80 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-2 bg-alert/20 text-alert text-xs rounded border border-alert/50 flex items-center gap-1">
                      <ShieldAlert size={14}/> Bot Traffic Detected
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-surface rounded-xl border border-gray-700 p-4 shadow-lg h-1/3">
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Target className="text-primary"/> Active Transfers
            </h2>
            <div className="overflow-y-auto h-[120px] space-y-2 pr-2">
              {transfers.length === 0 ? <p className="text-sm text-gray-400 italic">No active transfers...</p> : 
                transfers.slice(-10).reverse().map((t, idx) => (
                  <div key={idx} className="bg-gray-800 p-2 rounded border border-gray-700 text-sm flex justify-between items-center">
                    <div><span className="font-semibold text-primary">{stores[t.from]?.name}</span> ➔ <span className="font-semibold text-accent">{stores[t.to]?.name}</span></div>
                    <div className="flex gap-4">
                      <span className="text-gray-400">Qty: {t.amount}</span>
                      <span className="text-yellow-400">ETA: {t.eta}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </section>

        {/* Right Col - AI Reasoning Panel */}
        <section className="flex-1 bg-surface rounded-xl border border-gray-700 p-4 shadow-lg flex flex-col">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-gray-700 pb-2">
            <Cpu className="text-primary"/> AI Assistant Logs
          </h2>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {logs.slice().reverse().map((log, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                key={idx} 
                className={`p-3 rounded-lg border \${log.source === 'Security Engine' ? 'border-alert/50 bg-alert/10' : log.source === 'AI Router' ? 'border-accent/50 bg-accent/10' : 'border-gray-700 bg-gray-800'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded \${log.source === 'Security Engine' ? 'bg-alert text-white' : log.source === 'AI Router' ? 'bg-accent text-white' : 'bg-gray-600 text-white'}`}>
                    {log.source}
                  </span>
                </div>
                <p className="text-sm mt-2 text-gray-200">{log.message}</p>
                {log.meta && Object.keys(log.meta).length > 0 && (
                  <div className="mt-2 text-xs text-gray-400 bg-black/20 p-2 rounded font-mono">
                    {JSON.stringify(log.meta)}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
