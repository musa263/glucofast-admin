import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin';
import { verifyAdmin } from '../../../lib/auth';

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const snap = await adminDb.collection('blog_posts').orderBy('createdAt', 'desc').limit(50).get();
  const posts = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json({ posts });
}

export async function POST(req) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, content, category, published } = await req.json();
  if (!title || !content) return NextResponse.json({ error: 'title and content required' }, { status: 400 });

  const post = {
    title,
    content,
    category: category || 'general',
    published: published ?? false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'admin',
  };

  const ref = await adminDb.collection('blog_posts').add(post);
  return NextResponse.json({ success: true, id: ref.id });
}

export async function PUT(req) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  updates.updatedAt = new Date().toISOString();
  await adminDb.collection('blog_posts').doc(id).update(updates);
  return NextResponse.json({ success: true });
}

export async function DELETE(req) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await adminDb.collection('blog_posts').doc(id).delete();
  return NextResponse.json({ success: true });
}
