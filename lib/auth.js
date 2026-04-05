import { cookies } from 'next/headers';

const SESSION_KEY = 'admin_session';

export async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_KEY);
  if (!session?.value) return null;
  try {
    const data = JSON.parse(Buffer.from(session.value, 'base64').toString());
    if (data.email !== process.env.ADMIN_EMAIL) return null;
    if (Date.now() - data.ts > 24 * 60 * 60 * 1000) return null; // 24h expiry
    return data;
  } catch {
    return null;
  }
}

export function createSession(email) {
  const payload = { email, ts: Date.now() };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}
