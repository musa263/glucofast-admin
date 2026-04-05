import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin';

// Simple in-memory rate limiter for contact form
const contactAttempts = new Map();
const MAX_CONTACT_PER_HOUR = 5;
const CONTACT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkContactRate(ip) {
  const now = Date.now();
  const record = contactAttempts.get(ip);
  if (!record || now - record.firstAttempt > CONTACT_WINDOW_MS) {
    contactAttempts.set(ip, { count: 1, firstAttempt: now });
    return true;
  }
  if (record.count >= MAX_CONTACT_PER_HOUR) return false;
  record.count += 1;
  return true;
}

// Basic email validation
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

// Sanitize text input — strip control characters, limit length
function sanitize(str, maxLen = 1000) {
  if (typeof str !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').trim().slice(0, maxLen);
}

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown';

    if (!checkContactRate(ip)) {
      return NextResponse.json(
        { error: 'Too many messages. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const name = sanitize(body.name, 100);
    const email = sanitize(body.email, 254);
    const message = sanitize(body.message, 2000);

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    await adminDb.collection('contact_messages').add({
      name,
      email,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    // Don't leak internal error details to the client
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
