import { NextResponse } from 'next/server';
import { createSession } from '../../../lib/auth';

// Simple in-memory rate limiter (resets on server restart)
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) return { allowed: true };
  // Clean up expired entries
  if (now - record.firstAttempt > LOCKOUT_MS) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }
  if (record.count >= MAX_ATTEMPTS) {
    const remaining = Math.ceil((LOCKOUT_MS - (now - record.firstAttempt)) / 60000);
    return { allowed: false, remaining };
  }
  return { allowed: true };
}

function recordAttempt(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now - record.firstAttempt > LOCKOUT_MS) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
  } else {
    record.count += 1;
  }
}

function clearAttempts(ip) {
  loginAttempts.delete(ip);
}

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';

  // Rate limit check
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Too many login attempts. Try again in ${rateCheck.remaining} minutes.` },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    recordAttempt(ip);
    // Constant-time response to prevent user enumeration
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Successful login — clear rate limit
  clearAttempts(ip);

  const session = createSession(email);
  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400,
    path: '/',
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_session');
  return response;
}
