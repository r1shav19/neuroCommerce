import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { randomBytes, createHmac } from 'crypto';

dotenv.config({ path: '../.env' });

const PORT = process.env.SERVER_PORT || 3001;
const HMAC_SECRET = process.env.VITE_HMAC_SECRET || 'fallback_secret';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

import { handleSecurity } from './securityMiddleware';
import { logAuditEntry } from './firebaseLogger';
import { createAuction, handleBid } from './auctionEngine';
import { startSimulationLoop, executeTransfer, setSimulationMode } from './storeAgents';

interface ConnectedClient { ws: WebSocket; id: string; }
const clients = new Set<ConnectedClient>();

function broadcast(msgObj: object) {
  const msgStr = JSON.stringify(msgObj);
  clients.forEach(c => {
    if (c.ws.readyState === WebSocket.OPEN) c.ws.send(msgStr);
  });
}

// Start live simulation
startSimulationLoop(broadcast);

wss.on('connection', ws => {
  const client: ConnectedClient = { ws, id: randomBytes(4).toString('hex') };
  clients.add(client);
  console.log(`[WS] Client connected (${clients.size} total)`);

  ws.on('message', message => {
    try {
      const data = JSON.parse(message.toString());

      // Optional HMAC check for signed messages from store nodes
      if (data.signature && data.storeId && data.timestamp) {
        const result = handleSecurity(data.storeId, data.timestamp, data.payload, data.signature, HMAC_SECRET);
        if (result === 'compromised') {
          ws.send(JSON.stringify({ type: 'ERROR', code: 4003, msg: 'Node quarantined.' }));
          broadcast({ type: 'THREAT_ALERT', storeId: data.storeId, reason: 'Compromised HMAC' });
          logAuditEntry({ id: Date.now().toString(), timestamp: Date.now(), eventType: 'threat', payload: { storeId: data.storeId }, hmacSignature: data.signature });
          return;
        }
        if (result === 'invalid') {
          ws.send(JSON.stringify({ type: 'ERROR', code: 4001, msg: 'Invalid signature.' }));
          return;
        }
      }

      switch (data.type) {
        case 'WANT_BID': {
          const { storeId, product, unitsNeeded, urgency } = data.payload || data;
          createAuction(storeId, product, unitsNeeded, urgency, result => {
            broadcast(result);
            logAuditEntry({ id: Date.now().toString(), timestamp: Date.now(), eventType: 'bid', payload: result, hmacSignature: 'server' });
          });
          broadcast({ type: 'WANT_BID', ...data.payload });
          break;
        }
        case 'OFFER_BID': {
          const { auctionId, storeId, product, unitsAvailable, price, urgencyScore } = data.payload || data;
          handleBid(auctionId, storeId, product, unitsAvailable, price, urgencyScore);
          break;
        }
        case 'EXECUTE_TRANSFER': {
          const { fromStoreId, toStoreId, product, units } = data.payload;
          const ok = executeTransfer(fromStoreId, toStoreId, product, units);
          if (ok) {
            logAuditEntry({ id: Date.now().toString(), timestamp: Date.now(), eventType: 'transfer', payload: data.payload, hmacSignature: data.signature || 'manual' });
            broadcast({ type: 'TRANSFER_APPROVED', ...data.payload });
          }
          break;
        }
        case 'OVERRIDE_DECISION': {
          logAuditEntry({ id: Date.now().toString(), timestamp: Date.now(), eventType: 'override', payload: data.payload, hmacSignature: data.signature || 'manual' });
          broadcast({ type: 'DECISION_OVERRIDDEN', ...data.payload });
          break;
        }
        case 'SIMULATION_COMMAND': {
          const mode = data.payload?.mode || data.mode;
          if (mode) setSimulationMode(mode);
          broadcast(data);
          break;
        }
      }
    } catch (e) {
      console.error('[WS] Message error:', e);
    }
  });

  ws.on('close', () => {
    clients.delete(client);
    console.log(`[WS] Client disconnected (${clients.size} total)`);
  });
});

app.get('/health', (_req, res) => res.json({ status: 'ok', clients: clients.size }));

server.listen(PORT, () => console.log(`[Server] Running on port ${PORT}`));
