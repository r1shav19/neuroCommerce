import json
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
from engine import AIEngine
import logging

app = FastAPI(title="NeuroCommerce AI Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

class SimState:
    def __init__(self):
        self.stores = {
            "ST-001": {"name": "Midtown Hub", "lat": 40.7580, "lng": -73.9855, "inventory": 120, "base_demand": 10, "current_demand": 10, "threat_score": 0, "authenticity_score": 100},
            "ST-002": {"name": "Brooklyn Edge", "lat": 40.6782, "lng": -73.9442, "inventory": 300, "base_demand": 5, "current_demand": 5, "threat_score": 0, "authenticity_score": 100},
            "ST-003": {"name": "Queens Center", "lat": 40.7282, "lng": -73.7949, "inventory": 200, "base_demand": 8, "current_demand": 8, "threat_score": 0, "authenticity_score": 100},
        }
        self.active_alerts = []
        self.transfers = []
        self.logs = []
        self.current_event = "NORMAL"
        
    def add_log(self, source: str, message: str, meta: dict = None):
        log_entry = {"source": source, "message": message, "meta": meta or {}}
        self.logs.append(log_entry)
        asyncio.create_task(manager.broadcast(json.dumps({"type": "NEW_LOG", "payload": log_entry})))
        
state = SimState()
engine = AIEngine(state)

async def simulation_loop():
    while True:
        await asyncio.sleep(5) # Tick every 5 seconds
        engine.simulate_tick()
        await manager.broadcast(json.dumps({
            "type": "SYNC_STATE",
            "payload": {
                "stores": state.stores,
                "transfers": state.transfers,
                "current_event": state.current_event
            }
        }))

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulation_loop())

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial state
        await websocket.send_json({"type": "SYNC_STATE", "payload": {
            "stores": state.stores,
            "logs": state.logs[-50:],
            "transfers": state.transfers,
            "current_event": state.current_event
        }})
        
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            await handle_client_message(msg)
            # Sync state after command
            await websocket.send_json({"type": "SYNC_STATE", "payload": {
                "stores": state.stores,
                "transfers": state.transfers,
                "current_event": state.current_event
            }})
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def handle_client_message(msg: dict):
    mtype = msg.get("type")
    payload = msg.get("payload", {})
    
    if mtype == "TRIGGER_VIRAL_SPIKE":
        state.current_event = "VIRAL_SPIKE"
        state.add_log("System", "Viral Spike triggered by user")
    elif mtype == "TRIGGER_FAKE_DEMAND":
        state.current_event = "FAKE_DEMAND"
        state.add_log("System", "Fake Demand Attack triggered by user")
    elif mtype == "TRIGGER_NORMAL":
        state.current_event = "NORMAL"
        state.add_log("System", "System normalized by user")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "NeuroCommerce AI Node Running"}
