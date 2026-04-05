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

// Allowed fields for blog post updates (prevent mass assignment)
const ALLOWED_UPDATE_FIELDS = ['title', 'content', 'category', 'published'];

export async function PUT(req) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  // Only allow whitelisted fields
  const updates = {};
  for (const key of ALLOWED_UPDATE_FIELDS) {
    if (key in body) updates[key] = body[key];
  }
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
