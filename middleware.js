import { NextResponse } from 'next/server';

// Protected routes that require admin authentication
const PROTECTED_PATHS = ['/dashboard', '/settings', '/users', '/blog'];
const PROTECTED_API_PATHS = ['/api/blog', '/api/settings', '/api/users', '/api/ai'];

function getSecret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || 'glucofast-fallback-secret-change-me';
}

/** Convert hex string to Uint8Array */
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/** Convert ArrayBuffer to hex string */
function bufToHex(buf) {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Timing-safe comparison of two hex strings */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function verifySession(token) {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [data, providedHmac] = parts;
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(getSecret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const expectedHmac = bufToHex(sig);
    if (!timingSafeEqual(providedHmac, expectedHmac)) return false;

    const payload = JSON.parse(atob(data));
    if (payload.email !== process.env.ADMIN_EMAIL) return false;
    if (Date.now() - payload.ts > 24 * 60 * 60 * 1000) return false;
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if this is a protected page or API route
  const isProtectedPage = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isProtectedApi = PROTECTED_API_PATHS.some((p) => pathname.startsWith(p));

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get('admin_session')?.value;
  const isValid = await verifySession(sessionToken);

  if (!isValid) {
    if (isProtectedApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Redirect to login for protected pages
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/users/:path*',
    '/blog/:path*',
    '/api/blog/:path*',
    '/api/settings/:path*',
    '/api/users/:path*',
    '/api/ai/:path*',
  ],
};
