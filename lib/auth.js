import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_KEY = 'admin_session';

// Use SESSION_SECRET from env, or fall back to a derived key from ADMIN_PASSWORD
function getSecret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || 'glucofast-fallback-secret-change-me';
}

/** Create HMAC signature for session data integrity */
function sign(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64');
  const hmac = crypto.createHmac('sha256', getSecret()).update(data).digest('hex');
  return `${data}.${hmac}`;
}

/** Verify HMAC signature and return payload if valid */
function verify(token) {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, providedHmac] = parts;
  const expectedHmac = crypto.createHmac('sha256', getSecret()).update(data).digest('hex');
  // Timing-safe comparison to prevent timing attacks
  if (!crypto.timingSafeEqual(Buffer.from(providedHmac, 'hex'), Buffer.from(expectedHmac, 'hex'))) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(data, 'base64').toString());
  } catch {
    return null;
  }
}

export async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_KEY);
  if (!session?.value) return null;
  try {
    const data = verify(session.value);
    if (!data) return null;
    if (data.email !== process.env.ADMIN_EMAIL) return null;
    if (Date.now() - data.ts > 24 * 60 * 60 * 1000) return null; // 24h expiry
    return data;
  } catch {
    return null;
  }
}

export function createSession(email) {
  const payload = { email, ts: Date.now() };
  return sign(payload);
}
