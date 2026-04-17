import { useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { generateSignature } from '../services/hmacService';

// In dev: connect to local Node server on port 3001
// In production (Cloud Run): WebSocket is on the same host as the page
const WS_URL = import.meta.env.DEV
  ? 'ws://127.0.0.1:3001'
  : `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const { setStores, addNegotiationEvent } = useAppStore();

  useEffect(() => {
    function connect() {
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => console.log('[WS] Connected');

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case 'SYNC_STATE':
              setStores(data.stores);
              break;
            case 'WANT_BID':
            case 'OFFER_BID':
            case 'BID_RESULT':
              addNegotiationEvent(data);
              break;
            case 'THREAT_ALERT':
              useAppStore.getState().updateMetrics({
                threatsBlocked: useAppStore.getState().metrics.threatsBlocked + 1
              });
              break;
          }
        } catch (err) {
          console.error('[WS] parse error', err);
        }
      };

      ws.current.onclose = () => {
        console.log('[WS] Disconnected — reconnecting in 3s...');
        setTimeout(connect, 3000);
      };

      ws.current.onerror = () => ws.current?.close();
    }

    connect();
    return () => { ws.current?.close(); };
  }, []);

  const sendMessage = async (type: string, payload: unknown, storeId: string = 'dashboard') => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    const timestamp = Date.now();
    const signature = await generateSignature(
      storeId, timestamp, payload,
      import.meta.env.VITE_HMAC_SECRET || 'fallback_secret'
    );
    ws.current.send(JSON.stringify({ type, storeId, timestamp, payload, signature }));
  };

  return { sendMessage };
}
