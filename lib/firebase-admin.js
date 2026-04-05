import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let _db = null;
let _auth = null;

function getServiceAccount() {
  // Option 1: Base64-encoded full service account JSON (most reliable for Vercel)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    return JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString()
    );
  }
  // Option 2: Individual env vars (for local dev)
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;
  return {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  };
}

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({ credential: cert(getServiceAccount()) });
}

export function getAdminDb() {
  if (!_db) _db = getFirestore(getAdminApp());
  return _db;
}

export function getAdminAuth() {
  if (!_auth) _auth = getAuth(getAdminApp());
  return _auth;
}

// Backwards-compatible lazy proxies (bind methods to preserve `this`)
export const adminDb = new Proxy({}, {
  get: (_, prop) => {
    const db = getAdminDb();
    const val = db[prop];
    return typeof val === 'function' ? val.bind(db) : val;
  },
});
export const adminAuth = new Proxy({}, {
  get: (_, prop) => {
    const auth = getAdminAuth();
    const val = auth[prop];
    return typeof val === 'function' ? val.bind(auth) : val;
  },
});
