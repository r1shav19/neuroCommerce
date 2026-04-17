// Firebase removed — all audit logging is handled locally in-memory
// Replace this file with real Firebase calls if you add keys later

export const loginWithGoogle = async () => {
  console.log('[Auth] Firebase not configured — running in offline mode');
  return null;
};

export const fetchAuditLogs = (_callback: (data: unknown[]) => void) => {
  // No-op in offline mode
};
