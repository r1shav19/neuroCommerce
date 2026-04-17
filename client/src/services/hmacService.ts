export async function generateSignature(storeId: string, timestamp: number, payload: unknown, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const data = enc.encode(storeId + timestamp.toString() + payloadStr);
  const sig = await crypto.subtle.sign('HMAC', key, data);
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}
