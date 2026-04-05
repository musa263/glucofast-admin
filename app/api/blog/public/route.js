import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebase-admin';

export async function GET() {
  try {
    const snap = await adminDb
      .collection('blog_posts')
      .where('published', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(6)
      .get();
    const posts = snap.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title,
      content: doc.data().content,
      category: doc.data().category,
      createdAt: doc.data().createdAt,
    }));
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}
