import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

// We'll mock Firebase Admin init if no service account is provided, 
// to prevent the server from crashing during local dev.
let db: admin.database.Database | null = null;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
    });
    db = admin.database();
    console.log('Firebase Admin initialized.');
  } else {
    console.warn('No FIREBASE_SERVICE_ACCOUNT_PATH provided. Audit logging to Firebase is disabled (mocked).');
  }
} catch (e) {
  console.error('Error initializing Firebase Admin:', e);
}

export function logAuditEntry(entry: any) {
  console.log('[AUDIT LOG]', entry);
  if (db) {
    db.ref('audit_logs').child(entry.id || Date.now().toString()).set(entry)
      .catch(err => console.error('Firebase DB Push error:', err));
  }
}
