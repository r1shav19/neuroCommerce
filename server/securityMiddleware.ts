import { createHmac } from 'crypto';
import { WebSocket } from 'ws';

const COMPROMISED_THRESHOLD = 3;
const compromises = new Map<string, number>();

export function verifySignature(storeId: string, timestamp: number, payload: any, signature: string, secret: string): boolean {
  const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const expectedSig = createHmac('sha256', secret)
    .update(storeId + timestamp.toString() + payloadStr)
    .digest('hex');
  return expectedSig === signature;
}

export function generateSignature(storeId: string, timestamp: number, payload: any, secret: string) {
  const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return createHmac('sha256', secret)
    .update(storeId + timestamp.toString() + payloadStr)
    .digest('hex');
}

export function handleSecurity(storeId: string, timestamp: number, payload: any, signature: string, secret: string): 'valid' | 'invalid' | 'compromised' {
  if (isCompromised(storeId)) return 'compromised';

  const isValid = verifySignature(storeId, timestamp, payload, signature, secret);
  if (!isValid) {
    const fails = (compromises.get(storeId) || 0) + 1;
    compromises.set(storeId, fails);
    if (fails >= COMPROMISED_THRESHOLD) {
      return 'compromised';
    }
    return 'invalid';
  }
  return 'valid';
}

export function isCompromised(storeId: string) {
  return (compromises.get(storeId) || 0) >= COMPROMISED_THRESHOLD;
}

export function resetCompromisedStatus(storeId: string) {
  compromises.delete(storeId);
}
