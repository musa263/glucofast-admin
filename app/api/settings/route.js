import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin';
import { verifyAdmin } from '../../../lib/auth';

const SETTINGS_DOC = 'app_config/settings';

const DEFAULT_SETTINGS = {
  pricing: {
    freeTier: {
      name: 'Free',
      price: 0,
      features: ['Glucose logging', 'GI food database (240+ foods)', 'Fasting timer', '7-day history', '3 reminders'],
    },
    premiumTier: {
      name: 'Premium',
      priceMonthly: 6.99,
      priceYearly: 49.99,
      currency: 'USD',
      features: ['Smart Insights & Alerts', 'Bedtime Protocol', 'Unlimited history', 'Unlimited reminders', 'PDF & CSV export', 'AI food scoring', 'Priority support'],
    },
  },
  ai: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    maxTokens: 1024,
    enabled: true,
  },
  app: {
    maintenanceMode: false,
    minAppVersion: '1.0.0',
    forceUpdate: false,
    supportEmail: 'support@glucofast.app',
  },
};

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const doc = await adminDb.doc(SETTINGS_DOC).get();
  const settings = doc.exists ? doc.data() : DEFAULT_SETTINGS;
  return NextResponse.json({ settings });
}

export async function PUT(req) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { settings } = await req.json();
  await adminDb.doc(SETTINGS_DOC).set(settings, { merge: true });
  return NextResponse.json({ success: true });
}
