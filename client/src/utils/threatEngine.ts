export interface ThreatHistory {
  demandSignals: number[];
  authScore: number;
}

export interface ThreatResult {
  newScore: number;
  reason?: string;
}

export function evaluateThreats(history: ThreatHistory, currentSignal: number, isSpoofed: boolean): ThreatResult {
  let penalty = 0;
  let reason = '';
  
  const recent = [...history.demandSignals, currentSignal].slice(-5);
  
  // a) VELOCITY ANOMALY
  if (history.demandSignals.length > 0) {
    const prev = history.demandSignals[history.demandSignals.length - 1];
    if (Math.abs(currentSignal - prev) > 40) {
      penalty += 20;
      reason = 'Velocity Anomaly Detected';
    }
  }

  // b) PATTERN IRREGULARITY (Perfect round numbers: multiple of 10)
  if (recent.length >= 3) {
    const last3 = recent.slice(-3);
    if (last3.every(s => s % 10 === 0)) {
      penalty += 20;
      reason = reason ? `${reason}, Pattern Irregularity` : 'Pattern Irregularity';
    }
  }

  // c) BURST PATTERN
  if (recent.length >= 5) {
    if (recent.every(s => s >= 95)) { // considering >95 as max demand burst
      penalty += 20;
      reason = reason ? `${reason}, Burst Pattern` : 'Burst Pattern';
    }
  }

  // d) REQUEST SPOOFING
  if (isSpoofed) {
    penalty += 20;
    reason = reason ? `${reason}, Signature Mismatch` : 'Signature Mismatch';
  }

  let newScore = history.authScore;

  if (penalty > 0) {
    newScore = Math.max(0, newScore - penalty);
  } else {
    // Recover +5 per clean tick
    newScore = Math.min(100, newScore + 5);
  }

  return { newScore, reason };
}
