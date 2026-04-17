import random
import math

class AIEngine:
    def __init__(self, state):
        self.state = state

    def simulate_tick(self):
        # Update demand naturally
        for store_id, store in self.state.stores.items():
            if self.state.current_event == "NORMAL":
                store["current_demand"] = store["base_demand"] + random.randint(-2, 5)
            elif self.state.current_event == "VIRAL_SPIKE":
                if store_id == "ST-001": # Spike happens here
                    store["current_demand"] = store["base_demand"] * 8 + random.randint(10, 50)
                else:
                    store["current_demand"] = store["base_demand"] + random.randint(0, 5)
            elif self.state.current_event == "FAKE_DEMAND":
                if store_id == "ST-002":
                    store["current_demand"] = store["base_demand"] * 15 # unnatural spike
                else:
                    store["current_demand"] = store["base_demand"] + random.randint(-2, 3)
            
            # Decrease inventory
            if store["inventory"] >= store["current_demand"]:
                store["inventory"] -= store["current_demand"]
            else:
                store["inventory"] = 0
                
        # Run threat scoring
        self.run_threat_scoring()
        # Run agent negotiation
        self.run_agent_negotiation()

    def run_threat_scoring(self):
        for store_id, store in self.state.stores.items():
            demand = store.get("current_demand", 0)
            base = store.get("base_demand", 10)
            
            # Simple heuristic for bot vs real
            ratio = demand / base if base > 0 else 1
            
            if self.state.current_event == "FAKE_DEMAND" and store_id == "ST-002":
                store["threat_score"] = 98 # High confidence it's fake
                store["authenticity_score"] = 2
            else:
                if ratio > 5:
                    store["threat_score"] = min(100, ratio * 5)
                    store["authenticity_score"] = 100 - store["threat_score"]
                else:
                    store["threat_score"] = random.randint(1, 15)
                    store["authenticity_score"] = 100 - store["threat_score"]

    def run_agent_negotiation(self):
        # Detect stockout risks and initiate auction
        for store_id, store in self.state.stores.items():
            if store["inventory"] < 20 and store["threat_score"] < 50:
                # Need inventory!
                self.state.add_log("Agent Node", f"{store['name']} is requesting inventory. Risk of stockout: HIGH.", {"store": store_id, "confidence": 92})
                
                # Find best donor
                best_donor = None
                best_score = -1
                
                for d_id, donor in self.state.stores.items():
                    if d_id != store_id and donor["inventory"] > 100:
                        # Evaluate (Distance mock + excess inventory)
                        dist = self._mock_distance(store_id, d_id)
                        score = donor["inventory"] - dist
                        if score > best_score:
                            best_score = score
                            best_donor = d_id
                            
                if best_donor:
                    donor = self.state.stores[best_donor]
                    transfer_amt = 50
                    donor["inventory"] -= transfer_amt
                    store["inventory"] += transfer_amt
                    
                    self.state.transfers.append({
                        "from": best_donor,
                        "to": store_id,
                        "amount": transfer_amt,
                        "status": "APPROVED",
                        "eta": f"{random.randint(12, 25)} mins"
                    })
                    
                    self.state.add_log(
                        "AI Router",
                        f"Transferred {transfer_amt} units from {donor['name']} to {store['name']}.",
                        {"from": best_donor, "to": store_id, "amount": transfer_amt, "reason": f"Optimal route found. ETA {random.randint(12,25)} mins."}
                    )
                    
            elif store["inventory"] < 20 and store["threat_score"] >= 80:
                # Fake demand detected, freezing
                self.state.add_log(
                    "Security Engine",
                    f"Blocked transfer request from {store['name']}. High Threat Score: {store['threat_score']}. Fake demand likely.",
                    {"store": store_id, "threat_score": store["threat_score"]}
                )

    def _mock_distance(self, s1, s2):
        # Just a simple deterministic mock distance
        return len(s1) + len(s2) * 5
