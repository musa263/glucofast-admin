import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { verifyAdmin } from '../../../lib/auth';
import { adminDb } from '../../../lib/firebase-admin';

export async function POST(req) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { prompt, task } = await req.json();
  if (!prompt) return NextResponse.json({ error: 'prompt required' }, { status: 400 });

  // Load AI settings — Firestore API key takes priority over .env
  const settingsDoc = await adminDb.doc('app_config/settings').get();
  const aiSettings = settingsDoc.exists ? settingsDoc.data()?.ai : null;
  const apiKey = aiSettings?.apiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Anthropic API key not configured. Add it in Settings > AI Configuration.' }, { status: 500 });
  const model = aiSettings?.model || 'claude-sonnet-4-20250514';
  const maxTokens = aiSettings?.maxTokens || 1024;

  const systemPrompts = {
    blog: 'You are a health content writer for GlucoFast, a glucose tracking app. Write clear, accurate, non-medical-advice health articles about glucose management, fasting, glycemic index, and diabetes prevention. Target audience: health-conscious adults in the Middle East. Use simple language.',
    insight: 'You are a data analyst for GlucoFast. Analyze the glucose reading patterns provided and generate concise, actionable insights. Focus on trends, anomalies, and practical recommendations. Never provide medical diagnoses.',
    support: 'You are a customer support assistant for GlucoFast. Help answer user questions about the app features, glucose tracking, fasting protocols, and the GI food database. Be friendly and helpful.',
  };

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompts[task] || systemPrompts.support,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0]?.text || '';
  return NextResponse.json({ response: text, model, usage: message.usage });
}
